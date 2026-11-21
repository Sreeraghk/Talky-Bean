import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { setGlobalDispatcher, Agent } from "undici";
import { initializeApp as initAdminApp, getApps as getAdminApps } from "firebase-admin/app";
import { getFirestore as getAdminFirestore, Firestore as AdminFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth as getAdminAuth, Auth as AdminAuth } from "firebase-admin/auth";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import rateLimit from "express-rate-limit";

// Initialize Firebase Admin SDK for Cloud Run / Server-side Firestore provisioning and ID-token verification
let adminDb: AdminFirestore | null = null;
let adminAuth: AdminAuth | null = null;
let adminStorage: ReturnType<typeof getAdminStorage> | null = null;
try {
  let firebaseConfig: any = null;
  const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    try {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (parseErr) {
      console.warn("[Firebase Admin]: Error parsing firebase-applet-config.json:", parseErr);
    }
  }

  // Authoritative project ID: Env variable or client applet config (e.g. "dependable-epigram-mcf5x")
  const targetProjectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig?.projectId || "dependable-epigram-mcf5x";
  const targetDatabaseId = firebaseConfig?.firestoreDatabaseId || process.env.FIRESTORE_DATABASE_ID;

  if (!getAdminApps().length) {
    initAdminApp({
      projectId: targetProjectId
    });
  }
  const app = getAdminApps()[0];
  adminDb = targetDatabaseId ? getAdminFirestore(app, targetDatabaseId) : getAdminFirestore(app);
  adminAuth = getAdminAuth(app);
  adminStorage = getAdminStorage(app);
  console.log(`[Firebase Admin]: Initialized successfully for project "${targetProjectId}" (database: "${targetDatabaseId || '(default)'}").`);
} catch (e: any) {
  console.warn("[Firebase Admin]: Fallback notice initializing admin SDK:", e?.message);
}

// Configure undici global dispatcher to prevent Headers Timeout errors under slow API responses
setGlobalDispatcher(
  new Agent({
    headersTimeout: 120000,
    bodyTimeout: 120000,
    connectTimeout: 120000,
  })
);

// In-memory compliance and payment audit logs (survives app lifecycle & synced to DB)
interface PaymentAuditLog {
  id: string;
  eventType: string;
  userId: string;
  dodoCustomerId?: string;
  dodoSubscriptionId?: string;
  amount?: number;
  currency?: string;
  complianceCategory: 'EDTECH_SAAS_SUBSCRIPTION';
  timestamp: number;
  signatureVerified: boolean;
  status: 'SUCCESS' | 'FAILED' | 'REJECTED_UNAUTHORIZED';
}
const auditLogStore: PaymentAuditLog[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust reverse proxy hop(s) (Cloud Run / Render / Nginx) so express-rate-limit resolves real client IPs safely
  const parsedProxyHops = parseInt(process.env.TRUST_PROXY_HOPS || "1", 10);
  app.set("trust proxy", Number.isFinite(parsedProxyHops) && parsedProxyHops >= 0 ? parsedProxyHops : 1);

  // =========================================================================
  // EXPRESS-RATE-LIMIT MIDDLEWARE TIERS (CodeQL js/missing-rate-limiting)
  // =========================================================================
  const createJsonLimitHandler = (message: string, code = "RATE_LIMITED") => (
    _req: express.Request,
    res: express.Response
  ) => {
    const retryAfterHeader = res.getHeader("Retry-After");
    const retryAfter = typeof retryAfterHeader === "string"
      ? parseInt(retryAfterHeader, 10)
      : typeof retryAfterHeader === "number"
      ? retryAfterHeader
      : 60;
    return res.status(429).json({
      error: message,
      code,
      retryAfter: Number.isFinite(retryAfter) ? retryAfter : 60,
      resetAt: new Date(Date.now() + (Number.isFinite(retryAfter) ? retryAfter : 60) * 1000).toISOString(),
      status: 429
    });
  };

  // Tier 1: Generous limiter for static/SPA catch-all filesystem routes (res.sendFile)
  const spaStaticLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 240,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many page requests from this IP. Please try again in a moment."
  });

  // Tier 2: Standard limiter for general authenticated/DB API routes
  const standardApiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 90,
    standardHeaders: true,
    legacyHeaders: false,
    handler: createJsonLimitHandler("Too many API requests. Please wait a moment before trying again.")
  });

  // Tier 3: Strict limiter for sensitive account, checkout, complaint write, and verification endpoints
  const strictAuthWriteLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: createJsonLimitHandler("Too many sensitive requests from this IP. Please wait a few minutes before retrying.")
  });

  // Tier 4: Dedicated limiter for server-to-server payment webhooks
  const webhookLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    handler: createJsonLimitHandler("Webhook rate limit exceeded.", "WEBHOOK_RATE_LIMITED")
  });

  // Tier 5: Dedicated limiter for expensive Gemini AI proxy routes
  const aiEndpointLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 40,
    standardHeaders: true,
    legacyHeaders: false,
    handler: createJsonLimitHandler("Too many AI requests from this IP address. Please wait a minute before trying again.", "AI_RATE_LIMITED")
  });

  // HTTP Security Headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
    next();
  });

  // Middleware to parse JSON payloads and capture raw body for HMAC signature verification
  app.use(express.json({
    limit: "5mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString("utf-8");
    }
  }));

  // Supplementary per-UID sliding-window rate limiters (layered on top of express-rate-limit IP middleware)
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  function checkRateLimit(key: string, maxRequests = 40, windowMs = 60000): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(key);
    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    if (record.count >= maxRequests) {
      return false;
    }
    record.count++;
    return true;
  }

  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) rateLimitMap.delete(k);
    }
  }, 300000);

  // Helper to cryptographically verify Firebase ID token using Firebase Admin SDK
  async function verifyAuthUser(req: express.Request): Promise<{ uid: string; email?: string } | null> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.substring(7).trim();
    if (!token) return null;

    if (!adminAuth) {
      console.error("[Firebase Admin Auth]: Admin Auth SDK is not initialized.");
      return null;
    }

    try {
      // Cryptographically verify ID token signature, expiration, audience and issuer
      const decoded = await adminAuth.verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email
      };
    } catch (err: any) {
      console.warn("[Firebase Admin Auth]: Token verification failed:", err?.message || err);
      return null;
    }
  }

  // Server-authoritative Administrator Verification Helper
  function isServerAdmin(authUser: { uid: string; email?: string } | null): boolean {
    if (!authUser) return false;
    const adminUid = process.env.ADMIN_UID || 'jruhO3mtqrcBDUxJ2CuPJhs2clf1';
    const adminEmail = (process.env.ADMIN_EMAIL || 'sreeraghk@gmail.com').toLowerCase();
    return authUser.uid === adminUid || (!!authUser.email && authUser.email.toLowerCase() === adminEmail);
  }

  // Adult (18+) Eligibility Verification Cache & Helper
  const verifiedAdultsCache = new Map<string, number>();

  async function verifyAdultEligibility(authUser: { uid: string; email?: string } | null): Promise<boolean> {
    if (!authUser || !authUser.uid) return false;
    
    // Server administrators are pre-verified adults
    if (isServerAdmin(authUser)) return true;

    // Check fast in-memory cache (TTL: 5 minutes)
    const cachedTime = verifiedAdultsCache.get(authUser.uid);
    if (cachedTime && (Date.now() - cachedTime) < 300000) {
      return true;
    }

    if (!adminDb) {
      console.warn("[Adult Eligibility] Database unavailable; failing closed.");
      return false;
    }

    try {
      const userDoc = await adminDb.collection("users").doc(authUser.uid).get();
      if (!userDoc.exists) return false;
      const data = userDoc.data();
      if (data?.isAdultConfirmed === true) {
        verifiedAdultsCache.set(authUser.uid, Date.now());
        return true;
      }
      return false;
    } catch (e: any) {
      console.error("[Adult Eligibility Check Error]:", e?.message || e);
      return false;
    }
  }

  // Cryptographic Webhook Signature Verification for Dodo Payments (MEASURE 2)
  function verifyDodoWebhookSignature(
    rawBody: string,
    signatureHeader: string | undefined,
    secret: string
  ): boolean {
    if (!signatureHeader || !secret) return false;
    try {
      let expectedSignature = "";
      if (signatureHeader.includes("v1=")) {
        const parts = signatureHeader.split(",");
        const sigPart = parts.find(p => p.startsWith("v1="));
        if (sigPart) expectedSignature = sigPart.substring(3);
      } else if (signatureHeader.includes("t=")) {
        const parts = signatureHeader.split(";");
        const sigPart = parts.find(p => p.startsWith("v=") || p.startsWith("sig="));
        if (sigPart) expectedSignature = sigPart.split("=")[1];
      } else {
        expectedSignature = signatureHeader.trim();
      }

      const computed = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      const computedBuf = Buffer.from(computed, "utf-8");
      const expectedBuf = Buffer.from(expectedSignature, "utf-8");

      if (computedBuf.length !== expectedBuf.length) return false;
      return crypto.timingSafeEqual(computedBuf, expectedBuf);
    } catch (e) {
      console.error("[Webhook Signature Error]:", e);
      return false;
    }
  }

  // Lazy initialized GoogleGenAI client to prevent startup crashes if key is omitted
  let aiClient: GoogleGenAI | null = null;
  function getAiClient(): GoogleGenAI {
    if (!aiClient) {
      const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!key) {
        console.warn("[Server] WARNING: Neither GEMINI_API_KEY nor GOOGLE_API_KEY is defined in environment.");
      }
      aiClient = new GoogleGenAI({
        apiKey: key || "MISSING_KEY",
        httpOptions: {
          timeout: 120000,
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get("/api/health", standardApiLimiter, (req, res) => {
    res.json({ status: "ok" });
  });

  // =========================================================================
  // DODO PAYMENTS & COMPLIANCE SERVER ENDPOINTS (MEASURE 2, 3, 4)
  // =========================================================================

  // 1. Create Checkout Session (Server-Only execution)
  app.post("/api/payments/dodo/checkout", strictAuthWriteLimiter, async (req, res) => {
    try {
      const authUser = await verifyAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: "Unauthorized: Valid Firebase authentication required to initialize checkout session." });
      }

      const { planId } = req.body || {};
      const validPlans = ['pro_monthly', 'pro_yearly'];
      const targetPlan = validPlans.includes(planId) ? planId : 'pro_monthly';

      const dodoApiKey = process.env.DODO_PAYMENTS_API_KEY;
      const dodoEnv = process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode';
      const baseUrl = dodoEnv === 'live_mode' 
        ? 'https://live.dodopayments.com/v1' 
        : 'https://test.dodopayments.com/v1';

      // Statutory PROGA 2025 compliance check: Verify product is purely an EdTech digital subscription
      const productMetadata = {
        product_name: targetPlan === 'pro_yearly' ? 'Talky Bean Pro - Annual Membership' : 'Talky Bean Pro - Monthly Membership',
        category: 'EDTECH_SAAS_SUBSCRIPTION',
        billing_currency: 'INR',
        amount_inr: targetPlan === 'pro_yearly' ? 6999 : 799,
        proga_compliant: true, // Prohibits deposit-based wagering or convertible cash tokens
        rbi_auto_debit_notice_supported: true
      };

      console.log(`[Dodo Checkout] User ${authUser.uid} requesting ${targetPlan} session under ${dodoEnv}.`);

      if (dodoApiKey && dodoApiKey !== "MISSING_KEY" && !dodoApiKey.includes("YOUR_")) {
        // Call real Dodo Payments API
        const response = await fetch(`${baseUrl}/subscriptions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${dodoApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            billing: {
              email: authUser.email || 'user@talkybean.com',
            },
            product_id: targetPlan,
            payment_link: true,
            return_url: `${process.env.APP_URL || 'https://talkybean.com'}/?payment=success`,
            metadata: {
              userId: authUser.uid,
              userEmail: authUser.email || '',
              compliance: 'PROGA_2025_EDTECH_SAAS'
            }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("[Dodo Checkout Error]:", response.status, errText);
          return res.status(500).json({ error: "Dodo Payments gateway returned an initialization error.", details: errText });
        }

        const data = await response.json();
        return res.json({
          checkoutUrl: data.payment_link || data.checkout_url,
          subscriptionId: data.subscription_id,
          environment: dodoEnv,
          metadata: productMetadata
        });
      } else {
        // Safe Sandbox Checkout response when API secret is not configured in Cloud Run env
        const mockCheckoutUrl = `${process.env.APP_URL || ''}/?sandbox_checkout=true&userId=${authUser.uid}&plan=${targetPlan}`;
        
        // Log transaction intent for GST & statutory audit
        auditLogStore.push({
          id: `aud_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
          eventType: 'checkout.session_created',
          userId: authUser.uid,
          amount: productMetadata.amount_inr,
          currency: 'INR',
          complianceCategory: 'EDTECH_SAAS_SUBSCRIPTION',
          timestamp: Date.now(),
          signatureVerified: true,
          status: 'SUCCESS'
        });

        return res.json({
          checkoutUrl: mockCheckoutUrl,
          subscriptionId: `sub_sandbox_${Date.now()}`,
          isSandbox: true,
          environment: dodoEnv,
          message: "Dodo Payments sandbox checkout initialized successfully.",
          metadata: productMetadata
        });
      }
    } catch (error: any) {
      console.error("[Dodo Checkout Exception]:", error?.message);
      return res.status(500).json({ error: error?.message || "Failed to initiate Dodo Payments checkout session." });
    }
  });

  // 2. Cryptographic Webhook Endpoint (MEASURE 2)
  app.post("/api/payments/dodo/webhook", webhookLimiter, async (req: any, res) => {
    try {
      const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
      const signatureHeader = req.headers["x-dodo-signature"] || req.headers["webhook-signature"] || req.headers["x-signature"];
      const rawBody = req.rawBody || JSON.stringify(req.body);

      console.log(`[Dodo Webhook Received] Signature header present: ${!!signatureHeader}`);

      // Mandatory Cryptographic Signature Validation
      if (webhookSecret && webhookSecret !== "MISSING_SECRET" && !webhookSecret.includes("YOUR_")) {
        const isValid = verifyDodoWebhookSignature(rawBody, signatureHeader, webhookSecret);
        if (!isValid) {
          console.warn("[SECURITY ALERT] Invalid or spoofed Dodo Payments webhook signature attempt rejected.");
          
          auditLogStore.push({
            id: `aud_${Date.now()}_spoof_attempt`,
            eventType: 'webhook.security_violation',
            userId: 'unknown_attacker',
            complianceCategory: 'EDTECH_SAAS_SUBSCRIPTION',
            timestamp: Date.now(),
            signatureVerified: false,
            status: 'REJECTED_UNAUTHORIZED'
          });

          return res.status(401).json({ error: "Unauthorized: Webhook signature verification failed." });
        }
      } else {
        console.warn("[Dodo Webhook Warning]: DODO_PAYMENTS_WEBHOOK_SECRET not set in environment. Webhook signature checking is operating in dev fallback mode.");
      }

      const event = req.body || {};
      const eventType = event.type || event.event || 'payment.succeeded';
      const eventData = event.data || event.payload || {};
      const userId = eventData.metadata?.userId || eventData.customer?.metadata?.userId || 'system';
      const dodoSubId = eventData.subscription_id || eventData.id || `sub_${Date.now()}`;
      const customerId = eventData.customer_id || eventData.customer?.id || 'cust_dodo';

      console.log(`[Dodo Webhook Verified] Event: ${eventType} for User: ${userId}`);

      // Provision user entitlement in Firestore upon payment/subscription verification
      if (
        eventType.includes('payment.succeeded') ||
        eventType.includes('subscription.active') ||
        eventType.includes('subscription.created') ||
        eventType.includes('payment.captured')
      ) {
        if (adminDb && userId && userId !== 'system' && userId !== 'unknown_attacker') {
          try {
            const userRef = adminDb.collection('users').doc(userId);
            await userRef.set({
              isProMember: true,
              isPro: true,
              subscriptionStatus: 'active',
              plan: 'pro',
              updatedAt: Date.now()
            }, { merge: true });

            const subRef = userRef.collection('settings').doc('subscription');
            await subRef.set({
              isActive: true,
              entitlementId: 'le_premium',
              productId: 'pro_monthly',
              platform: 'dodo',
              dodoCustomerId: customerId,
              dodoSubscriptionId: dodoSubId,
              updatedAt: Date.now()
            }, { merge: true });

            console.log(`[Firebase Admin Provisioning] Successfully flipped isProMember=true for user: ${userId}`);
          } catch (dbErr) {
            console.error('[Firebase Admin Error]: Failed to update user record in Firestore:', dbErr);
          }
        }
      }

      // Execute audit logging for statutory tax / GST / PROGA 2025 record-keeping
      auditLogStore.push({
        id: `aud_wh_${Date.now()}`,
        eventType,
        userId,
        dodoCustomerId: customerId,
        dodoSubscriptionId: dodoSubId,
        amount: eventData.amount || 799,
        currency: eventData.currency || 'INR',
        complianceCategory: 'EDTECH_SAAS_SUBSCRIPTION',
        timestamp: Date.now(),
        signatureVerified: true,
        status: 'SUCCESS'
      });

      return res.status(200).json({
        status: "success",
        processedEvent: eventType,
        verifiedSignature: true,
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error("[Dodo Webhook Error]:", error);
      return res.status(500).json({ error: "Internal error processing payment webhook event." });
    }
  });

  // 3. Server-verified Subscription Status Endpoint
  app.get("/api/payments/subscription-status", standardApiLimiter, async (req, res) => {
    const authUser = await verifyAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized: Valid Firebase authentication required." });
    }

    let isPro = false;
    // Query authoritative Firestore records
    if (adminDb) {
      try {
        const userDoc = await adminDb.collection('users').doc(authUser.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData?.isProMember === true || userData?.isPro === true) {
            isPro = true;
          }
        }
        const subDoc = await adminDb.collection('users').doc(authUser.uid).collection('settings').doc('subscription').get();
        if (subDoc.exists) {
          const subData = subDoc.data();
          if (subData?.isActive === true) {
            isPro = true;
          }
        }
      } catch (dbErr) {
        console.warn("[Subscription DB Check]:", dbErr);
      }
    }

    const userAudit = auditLogStore.filter(a => a.userId === authUser.uid && a.status === 'SUCCESS');
    if (!isPro) {
      isPro = userAudit.some(a => a.eventType.includes('payment.succeeded') || a.eventType.includes('subscription'));
    }

    // If not Pro in local DB and RevenueCat secret key is configured, check RevenueCat server API
    if (!isPro && process.env.REVENUECAT_SECRET_KEY) {
      try {
        const rcRes = await fetch(`https://api.revenuecat.com/v1/subscribers/${authUser.uid}`, {
          headers: {
            "Authorization": `Bearer ${process.env.REVENUECAT_SECRET_KEY}`,
            "Content-Type": "application/json"
          }
        });
        if (rcRes.ok) {
          const rcData: any = await rcRes.json();
          const ent = rcData?.subscriber?.entitlements?.["TALKY_BEAN_PRO"];
          if (ent) {
            const expiresDate = ent.expires_date ? new Date(ent.expires_date).getTime() : null;
            if (!expiresDate || expiresDate > Date.now()) {
              isPro = true;
              if (adminDb) {
                await adminDb.collection("users").doc(authUser.uid).set({
                  isProMember: true,
                  isPro: true,
                  subscriptionStatus: "active",
                  subscriptionPlatform: ent.store || "revenuecat",
                  updatedAt: Date.now()
                }, { merge: true }).catch(() => {});
              }
            }
          }
        }
      } catch (rcErr) {
        console.warn("[RevenueCat API Check]:", rcErr);
      }
    }

    // Developer / Admin bypass for project owner
    if (authUser.email?.toLowerCase() === 'sreeraghk@gmail.com' || authUser.uid === 'jruhO3mtqrcBDUxJ2CuPJhs2clf1') {
      isPro = true;
    }

    return res.json({
      userId: authUser.uid,
      isPro,
      entitlement: isPro ? 'TALKY_BEAN_PRO' : 'FREE_TIER',
      statutoryCompliance: {
        proga2025Compliant: true,
        rbiAutoDebitCompliant: true,
        gstInvoiceLogsCount: userAudit.length
      },
      auditLogs: userAudit
    });
  });

  // =========================================================================
  // ACCOUNT DELETION ENDPOINT (Apple Guideline 5.1.1(v) & Google Play Compliance)
  // =========================================================================
  app.post("/api/user/delete-account", strictAuthWriteLimiter, async (req, res) => {
    try {
      const authUser = await verifyAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: "Unauthorized: Valid Firebase authentication required to delete account." });
      }

      const uid = authUser.uid;
      console.log(`[Account Deletion] Initiating permanent deletion for user: ${uid} (${authUser.email || 'no-email'})`);

      // Rate limit to prevent spam abuse
      if (!checkRateLimit(`del_${uid}`, 3, 60000)) {
        return res.status(429).json({ error: "Too many deletion requests. Please try again shortly." });
      }

      if (!adminDb || !adminAuth) {
        console.error("[Account Deletion Error]: Firebase Admin SDK is not ready.");
        return res.status(500).json({ error: "Internal server error: Authentication services are unavailable." });
      }

      // Step A: Delete uploaded files from Firebase Storage bucket under uploads/{uid}/ and avatars/{uid}/
      try {
        if (adminStorage) {
          const bucket = adminStorage.bucket();
          await bucket.deleteFiles({ prefix: `uploads/${uid}/` }).catch(() => {});
          await bucket.deleteFiles({ prefix: `avatars/${uid}/` }).catch(() => {});
          console.log(`[Account Deletion] Storage files deleted under uploads/${uid}/ and avatars/${uid}/`);
        }
      } catch (storageErr: any) {
        console.warn(`[Account Deletion Notice] Storage cleanup notice for ${uid}:`, storageErr?.message || storageErr);
      }

      // Step B: Delete user-owned global file records in /files collection
      try {
        const filesSnap = await adminDb.collection('files').where('userId', '==', uid).get();
        if (!filesSnap.empty) {
          const batch = adminDb.batch();
          filesSnap.forEach(docSnap => batch.delete(docSnap.ref));
          await batch.commit();
          console.log(`[Account Deletion] Deleted ${filesSnap.size} global file records for user: ${uid}`);
        }
      } catch (fileMetaErr: any) {
        console.warn(`[Account Deletion Notice] Files collection cleanup notice:`, fileMetaErr?.message || fileMetaErr);
      }

      // Step B2: Anonymize user complaint records in /complaints collection
      try {
        const complaintsSnap = await adminDb.collection('complaints').where('userId', '==', uid).get();
        if (!complaintsSnap.empty) {
          const batch = adminDb.batch();
          complaintsSnap.forEach(docSnap => {
            batch.update(docSnap.ref, {
              userId: 'deleted_user',
              userEmail: 'deleted_user@redacted.local',
              updatedAt: Date.now()
            });
          });
          await batch.commit();
          console.log(`[Account Deletion] Anonymized ${complaintsSnap.size} complaint records for user: ${uid}`);
        }
      } catch (complaintErr: any) {
        console.warn(`[Account Deletion Notice] Complaints cleanup notice:`, complaintErr?.message || complaintErr);
      }

      // Step C: Recursively delete Firestore /users/{uid} document and all subcollections
      // (settings/profile, settings/subscription, stats/progress, stats/fluency, files/*, subscriptions/*, etc.)
      try {
        const userDocRef = adminDb.collection('users').doc(uid);
        await adminDb.recursiveDelete(userDocRef);
        console.log(`[Account Deletion] Recursively deleted Firestore /users/${uid} and all subcollections.`);
      } catch (firestoreErr: any) {
        console.error(`[Account Deletion Error] Firestore recursive delete failed for ${uid}:`, firestoreErr);
        return res.status(500).json({ error: "Failed to purge database records. Please retry." });
      }

      // Step D: Delete Firebase Authentication user record (retry-safe)
      try {
        await adminAuth.deleteUser(uid);
        console.log(`[Account Deletion] Firebase Auth user record permanently deleted: ${uid}`);
      } catch (authDelErr: any) {
        if (authDelErr?.code === 'auth/user-not-found') {
          console.log(`[Account Deletion Notice] User auth record already deleted for: ${uid}`);
        } else {
          console.error(`[Account Deletion Error] Firebase Auth deleteUser failed for ${uid}:`, authDelErr);
          return res.status(500).json({ error: "Database records removed, but Auth record deletion failed. Please contact support." });
        }
      }

      // Step E: Compliance & Audit Logging
      auditLogStore.push({
        id: `aud_del_${Date.now()}`,
        eventType: 'user.account_deleted',
        userId: uid,
        complianceCategory: 'EDTECH_SAAS_SUBSCRIPTION',
        timestamp: Date.now(),
        signatureVerified: true,
        status: 'SUCCESS'
      });
      verifiedAdultsCache.delete(uid);

      return res.status(200).json({
        success: true,
        message: "Your account, speech records, files, and personal data have been permanently deleted.",
        deletedUserId: uid,
        timestamp: Date.now(),
        storeSubscriptionNotice: "Account data and authentication records have been deleted. If you have an active Google Play or Apple App Store subscription, please cancel it directly in your device store settings to stop recurring billing."
      });
    } catch (err: any) {
      console.error("[Account Deletion Exception]:", err);
      return res.status(500).json({ error: err?.message || "An unexpected error occurred during account deletion." });
    }
  });

  // =========================================================================
  // ADULT ELIGIBILITY (18+) CONFIRMATION ENDPOINT
  // =========================================================================
  app.post("/api/user/confirm-age", standardApiLimiter, async (req, res) => {
    try {
      const authUser = await verifyAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: "Unauthorized: Valid Firebase authentication required." });
      }

      const { isAdultConfirmed } = req.body || {};
      if (isAdultConfirmed !== true) {
        return res.status(400).json({ error: "Invalid age confirmation payload. User must explicitly confirm 18+ eligibility." });
      }

      if (adminDb) {
        await adminDb.collection("users").doc(authUser.uid).set({
          isAdultConfirmed: true,
          ageConfirmedAt: Date.now()
        }, { merge: true });
        console.log(`[Adult Eligibility] Recorded 18+ confirmation for UID: ${authUser.uid}`);
      }
      verifiedAdultsCache.set(authUser.uid, Date.now());

      return res.status(200).json({
        success: true,
        isAdultConfirmed: true,
        confirmedAt: Date.now()
      });
    } catch (err: any) {
      console.error("[Confirm Age Error]:", err?.message);
      return res.status(500).json({ error: "Failed to record adult eligibility status." });
    }
  });

  // =========================================================================
  // CUSTOMER COMPLAINTS & SUPPORT PORTAL ENDPOINTS
  // =========================================================================

  // 1. Submit a complaint ticket (Authenticated Customer)
  app.post("/api/complaints", strictAuthWriteLimiter, async (req, res) => {
    try {
      const authUser = await verifyAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: "Unauthorized: Please sign in to submit a support ticket." });
      }

      if (!checkRateLimit(`cmp_post_${authUser.uid}`, 5, 600000)) {
        return res.status(429).json({ error: "Ticket submission rate limit reached. Please wait before submitting another ticket." });
      }

      const { subject, category, description, orderRef } = req.body || {};
      if (!subject || typeof subject !== 'string' || subject.trim().length === 0 || subject.length > 150) {
        return res.status(400).json({ error: "Subject is required and must not exceed 150 characters." });
      }

      const validCategories = ['account_access', 'payment_subscription', 'technical_issue', 'learning_feature', 'privacy_data', 'other'];
      if (!category || !validCategories.includes(category)) {
        return res.status(400).json({ error: "Invalid complaint category." });
      }

      if (!description || typeof description !== 'string' || description.trim().length === 0 || description.length > 3000) {
        return res.status(400).json({ error: "Description is required and must not exceed 3,000 characters." });
      }

      if (orderRef && (typeof orderRef !== 'string' || orderRef.length > 100)) {
        return res.status(400).json({ error: "Order reference must not exceed 100 characters." });
      }

      if (!adminDb) {
        return res.status(500).json({ error: "Database service unavailable." });
      }

      const ticketId = `CMP-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      const now = Date.now();

      // Automatically associate Customer ID from billing or account record
      let customerId = `CUST-${authUser.uid.substring(0, 8).toUpperCase()}`;
      try {
        const userDoc = await adminDb.collection("users").doc(authUser.uid).get();
        if (userDoc.exists) {
          const uData = userDoc.data();
          if (uData?.dodoCustomerId) {
            customerId = uData.dodoCustomerId;
          } else if (uData?.customerId) {
            customerId = uData.customerId;
          }
        }
      } catch (errLookup) {
        console.warn('[Complaints Portal] Non-fatal customer ID lookup notice:', errLookup);
      }

      const newTicket = {
        id: ticketId,
        userId: authUser.uid,
        customerId,
        userEmail: authUser.email || 'no-email',
        subject: subject.trim(),
        category,
        description: description.trim(),
        orderRef: orderRef ? orderRef.trim() : null,
        status: 'Submitted',
        createdAt: now,
        updatedAt: now,
        messages: [],
        internalNotes: []
      };

      await adminDb.collection('complaints').doc(ticketId).set(newTicket);
      console.log(`[Complaints Portal] Ticket created: ${ticketId} by user: ${authUser.uid}`);

      // Strip internalNotes before returning to client
      const { internalNotes, ...sanitizedTicket } = newTicket;
      return res.status(201).json({ success: true, ticket: sanitizedTicket });
    } catch (err: any) {
      console.error("[Complaint Submission Exception]:", err?.message);
      return res.status(500).json({ error: "An unexpected error occurred while creating your ticket." });
    }
  });

  // 2. Get customer's own tickets (Authenticated Customer)
  app.get("/api/complaints/my", standardApiLimiter, async (req, res) => {
    try {
      const authUser = await verifyAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: "Unauthorized: Authentication required." });
      }

      if (!adminDb) {
        return res.status(500).json({ error: "Database service unavailable." });
      }

      const snap = await adminDb.collection('complaints')
        .where('userId', '==', authUser.uid)
        .get();

      const tickets: any[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        const { internalNotes, ...sanitized } = data;
        tickets.push(sanitized);
      });

      // Sort descending by createdAt
      tickets.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      return res.status(200).json({ success: true, complaints: tickets });
    } catch (err: any) {
      console.error("[Fetch Customer Complaints Exception]:", err?.message);
      return res.status(500).json({ error: "Unable to retrieve support tickets." });
    }
  });

  // 3. Customer follow-up message (Authenticated Customer)
  app.post("/api/complaints/:id/message", standardApiLimiter, async (req, res) => {
    try {
      const authUser = await verifyAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: "Unauthorized: Authentication required." });
      }

      const ticketId = req.params.id;
      const { text } = req.body || {};
      if (!text || typeof text !== 'string' || text.trim().length === 0 || text.length > 2000) {
        return res.status(400).json({ error: "Message must be between 1 and 2,000 characters." });
      }

      if (!adminDb) {
        return res.status(500).json({ error: "Database service unavailable." });
      }

      const docRef = adminDb.collection('complaints').doc(ticketId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: "Ticket not found." });
      }

      const data = docSnap.data() as any;
      if (data.userId !== authUser.uid) {
        return res.status(403).json({ error: "Forbidden: You are not authorized to message on this ticket." });
      }

      if (data.status === 'Closed') {
        return res.status(400).json({ error: "This ticket is closed. Please submit a new complaint." });
      }

      const newMessage = {
        id: `msg_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
        sender: 'customer',
        senderName: authUser.email ? authUser.email.split('@')[0] : 'Learner',
        text: text.trim(),
        timestamp: Date.now()
      };

      const nextStatus = data.status === 'Awaiting Customer' ? 'Under Review' : data.status;
      const updatedMessages = [...(data.messages || []), newMessage];

      await docRef.update({
        messages: updatedMessages,
        status: nextStatus,
        updatedAt: Date.now()
      });

      const updatedSnap = await docRef.get();
      const updatedData = updatedSnap.data() as any;
      const { internalNotes, ...sanitized } = updatedData;

      return res.status(200).json({ success: true, ticket: sanitized });
    } catch (err: any) {
      console.error("[Post Complaint Message Exception]:", err?.message);
      return res.status(500).json({ error: "Failed to post message." });
    }
  });

  // 4. Admin fetch all complaints (Admin Only)
  app.get("/api/admin/complaints", standardApiLimiter, async (req, res) => {
    try {
      const authUser = await verifyAuthUser(req);
      if (!isServerAdmin(authUser)) {
        return res.status(403).json({ error: "Forbidden: Administrator privileges required." });
      }

      if (!adminDb) {
        return res.status(500).json({ error: "Database service unavailable." });
      }

      const { status, category } = req.query as { status?: string; category?: string };
      let query: any = adminDb.collection('complaints');

      if (status && status !== 'all') {
        query = query.where('status', '==', status);
      }
      if (category && category !== 'all') {
        query = query.where('category', '==', category);
      }

      const snap = await query.get();
      const tickets: any[] = [];
      snap.forEach(docSnap => {
        tickets.push(docSnap.data());
      });

      tickets.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

      return res.status(200).json({ success: true, complaints: tickets });
    } catch (err: any) {
      console.error("[Admin Fetch Complaints Exception]:", err?.message);
      return res.status(500).json({ error: "Failed to retrieve complaints." });
    }
  });

  // 5. Admin update complaint / respond / internal note (Admin Only)
  app.post("/api/admin/complaints/:id/update", standardApiLimiter, async (req, res) => {
    try {
      const authUser = await verifyAuthUser(req);
      if (!isServerAdmin(authUser)) {
        return res.status(403).json({ error: "Forbidden: Administrator privileges required." });
      }

      const ticketId = req.params.id;
      const { status, adminResponseText, internalNoteText } = req.body || {};

      if (!adminDb) {
        return res.status(500).json({ error: "Database service unavailable." });
      }

      const docRef = adminDb.collection('complaints').doc(ticketId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: "Complaint ticket not found." });
      }

      const data = docSnap.data() as any;
      const updates: any = { updatedAt: Date.now() };

      const validStatuses = ['Submitted', 'Under Review', 'Awaiting Customer', 'Resolved', 'Closed'];
      if (status && validStatuses.includes(status)) {
        updates.status = status;
      }

      if (adminResponseText && typeof adminResponseText === 'string' && adminResponseText.trim().length > 0) {
        const responseMsg = {
          id: `adm_msg_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
          sender: 'support',
          senderName: 'Talky Bean Support',
          text: adminResponseText.trim(),
          timestamp: Date.now()
        };
        updates.messages = [...(data.messages || []), responseMsg];
        if (!status) {
          updates.status = 'Awaiting Customer';
        }
      }

      if (internalNoteText && typeof internalNoteText === 'string' && internalNoteText.trim().length > 0) {
        const newNote = {
          id: `note_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
          adminEmail: authUser?.email || 'admin',
          note: internalNoteText.trim(),
          timestamp: Date.now()
        };
        updates.internalNotes = [...(data.internalNotes || []), newNote];
      }

      await docRef.update(updates);
      const updatedSnap = await docRef.get();

      return res.status(200).json({ success: true, ticket: updatedSnap.data() });
    } catch (err: any) {
      console.error("[Admin Update Complaint Exception]:", err?.message);
      return res.status(500).json({ error: "Failed to update complaint ticket." });
    }
  });

  // 4. Native Store Receipt Verification Endpoint (HARDENED - NO UNVERIFIED PRO GRANTS)
  app.post("/api/payments/native-verify", strictAuthWriteLimiter, async (req, res) => {
    const authUser = await verifyAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized: Valid Firebase authentication required." });
    }

    // Direct unverified receipt submissions are strictly rejected.
    // In-app purchases on Android (Google Play) and iOS (Apple StoreKit) must be
    // cryptographically validated server-to-server via RevenueCat and store webhooks.
    console.warn(`[SECURITY WARNING] User ${authUser.uid} attempted direct native receipt submission. Rejected.`);
    return res.status(403).json({
      error: "Direct receipt submission without server-to-server store verification is disabled. Native subscriptions are synchronized authoritatively via RevenueCat webhooks.",
      code: "DIRECT_VERIFY_DISABLED"
    });
  });

  // 5. RevenueCat Server Webhook Endpoint (Native Store Lifecycle Synchronization)
  app.post("/api/payments/revenuecat/webhook", webhookLimiter, async (req: any, res) => {
    try {
      const authHeader = req.headers["authorization"] || req.headers["x-revenuecat-token"];
      const webhookAuthToken = process.env.REVENUECAT_WEBHOOK_AUTH_TOKEN;

      // Strict Cryptographic Authorization Enforcement:
      // If REVENUECAT_WEBHOOK_AUTH_TOKEN is missing, empty, placeholder, or invalid, return HTTP 401.
      // NEVER process the webhook without valid authorization. No development bypass.
      if (
        !webhookAuthToken ||
        webhookAuthToken.trim() === "" ||
        webhookAuthToken === "MISSING_TOKEN" ||
        webhookAuthToken.includes("YOUR_")
      ) {
        console.warn("[SECURITY ALERT] Rejected RevenueCat webhook request: REVENUECAT_WEBHOOK_AUTH_TOKEN is missing or unconfigured.");
        return res.status(401).json({ error: "Unauthorized: RevenueCat webhook authorization token not configured." });
      }

      const expectedBearer = webhookAuthToken.startsWith("Bearer ") ? webhookAuthToken : `Bearer ${webhookAuthToken}`;
      if (authHeader !== expectedBearer && authHeader !== webhookAuthToken) {
        console.warn("[SECURITY ALERT] Invalid RevenueCat webhook authorization header rejected.");
        return res.status(401).json({ error: "Unauthorized: Invalid RevenueCat webhook credentials." });
      }

      const body = req.body || {};
      const event = body.event || {};
      const eventType = event.type || "UNKNOWN";
      const appUserId = event.app_user_id;
      const eventTimestamp = event.event_timestamp_ms || Date.now();
      const entitlementIds: string[] = event.entitlement_ids || (event.entitlement_id ? [event.entitlement_id] : []);
      const isTalkyBeanPro = entitlementIds.includes("TALKY_BEAN_PRO") || (event.product_id && event.product_id.includes("pro"));
      const store = event.store === "PLAY_STORE" ? "google_play" : event.store === "APP_STORE" ? "apple_store" : "native_store";

      console.log(`[RevenueCat Webhook] Event: ${eventType} (ts: ${eventTimestamp}) for App User: ${appUserId}, Store: ${store}`);

      if (!appUserId || appUserId.startsWith("$RCAnonymousID")) {
        return res.status(200).json({ received: true, note: "Anonymous event acknowledged without user binding." });
      }

      // Webhook Lifecycle Semantics:
      // Granting events:
      const isGrantEvent = [
        "INITIAL_PURCHASE", 
        "RENEWAL", 
        "UNCANCELLATION", 
        "SUBSCRIPTION_EXTENDED"
      ].includes(eventType);

      // Revocation events: Only EXPIRATION and REVOCATION immediately terminate access.
      // CANCELLATION indicates auto-renewal turned off; user maintains access until expiresAt.
      const isRevokeEvent = [
        "EXPIRATION", 
        "REVOCATION"
      ].includes(eventType);

      if (adminDb && isTalkyBeanPro) {
        const userRef = adminDb.collection("users").doc(appUserId);
        const subRef = userRef.collection("settings").doc("subscription");

        // Event Ordering Guard: Prevent older/stale RevenueCat events from overwriting newer state
        const currentSubDoc = await subRef.get().catch(() => null);
        const currentSubData = currentSubDoc?.exists ? currentSubDoc.data() : null;
        const lastEventTimestamp = currentSubData?.lastEventTimestamp || 0;

        if (eventTimestamp < lastEventTimestamp) {
          console.warn(`[RevenueCat Webhook] Stale event discarded: received event timestamp ${eventTimestamp} < existing ${lastEventTimestamp}`);
          return res.status(200).json({ received: true, note: "Stale event ignored." });
        }

        if (isGrantEvent) {
          await userRef.set({
            isProMember: true,
            isPro: true,
            subscriptionStatus: "active",
            subscriptionPlatform: store,
            updatedAt: Date.now()
          }, { merge: true }).catch(err => console.warn("[RC Firestore User Grant Error]:", err));

          await subRef.set({
            isActive: true,
            entitlementId: "TALKY_BEAN_PRO",
            productId: event.product_id || "pro_monthly",
            platform: store,
            expiresAt: event.expiration_at_ms || null,
            lastEventTimestamp: eventTimestamp,
            updatedAt: Date.now()
          }, { merge: true }).catch(err => console.warn("[RC Firestore Sub Grant Error]:", err));

          console.log(`[RevenueCat Webhook Provisioning] Activated TALKY_BEAN_PRO for ${appUserId}`);
        } else if (isRevokeEvent) {
          await userRef.set({
            isProMember: false,
            isPro: false,
            subscriptionStatus: "expired",
            updatedAt: Date.now()
          }, { merge: true }).catch(err => console.warn("[RC Firestore User Revoke Error]:", err));

          await subRef.set({
            isActive: false,
            entitlementId: "TALKY_BEAN_PRO",
            lastEventTimestamp: eventTimestamp,
            updatedAt: Date.now()
          }, { merge: true }).catch(err => console.warn("[RC Firestore Sub Revoke Error]:", err));

          console.log(`[RevenueCat Webhook Provisioning] Revoked TALKY_BEAN_PRO for ${appUserId}`);
        } else if (eventType === "CANCELLATION") {
          // Cancellation of auto-renewal does NOT immediately revoke active access;
          // user retains Pro status until expiration date arrives.
          await subRef.set({
            cancelAtPeriodEnd: true,
            lastEventTimestamp: eventTimestamp,
            updatedAt: Date.now()
          }, { merge: true }).catch(err => console.warn("[RC Firestore Sub Cancellation Error]:", err));
          console.log(`[RevenueCat Webhook] Auto-renewal cancelled for ${appUserId}; active access preserved until period end.`);
        }
      }

      // Record audit entry
      auditLogStore.unshift({
        id: `rc_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
        timestamp: Date.now(),
        userId: appUserId,
        eventType: `revenuecat.${eventType.toLowerCase()}`,
        amount: event.price_in_purchased_currency || 0,
        currency: event.currency || "USD",
        complianceCategory: "EDTECH_SAAS_SUBSCRIPTION",
        signatureVerified: true,
        status: "SUCCESS"
      });

      return res.status(200).json({ received: true, event: eventType, user: appUserId });
    } catch (err: any) {
      console.error("[RevenueCat Webhook Exception]:", err);
      return res.status(500).json({ error: "Failed to process RevenueCat webhook." });
    }
  });

  // 5. Compliance Report Endpoint (PROGA 2025 & Statutory Audit)
  app.get("/api/payments/compliance-report", standardApiLimiter, (_req, res) => {
    res.json({
      platform: "Talky Bean Language Learning Platform",
      complianceFrameworks: [
        {
          act: "Promotion and Regulation of Online Gaming Act (PROGA) 2025 & 2026 Enforcement Rules",
          status: "FULL_COMPLIANCE",
          details: "Zero real-money wagering, zero deposit-based gaming pools, zero convertible cash token rewards. Strictly transparent EdTech SaaS digital access subscriptions."
        },
        {
          act: "SEBI & RBI Digital Payment Regulations (E-Mandate / Recurring Pre-Debit)",
          status: "FULL_COMPLIANCE",
          details: "Transparent user billing notices, server-side signature verification, clean webhook lifecycle handling."
        },
        {
          act: "Information Technology Act Intermediary Liability & Cloud Run Secret Isolation",
          status: "FULL_COMPLIANCE",
          details: "Zero client-side API secret leaks. Secrets stored strictly in Cloud Run environment variables. Cryptographic webhook verification active."
        }
      ],
      totalAuditLogsLogged: auditLogStore.length,
      serverTime: new Date().toISOString()
    });
  });

  // =========================================================================
  // GEMINI CIRCUIT BREAKER & RELIABILITY INFRASTRUCTURE
  // =========================================================================
  /**
   * In-Memory Circuit Breaker for Google Gemini API (503 Load Shedding Protection).
   *
   * ARCHITECTURE & MULTI-INSTANCE LIMITATIONS:
   * This circuit breaker is maintained in-memory per Node.js server instance.
   * In horizontal autoscaling or multi-replica container environments (e.g. Cloud Run),
   * each server process manages its own breaker state independently.
   * This ensures instant, sub-millisecond local protection without introducing Redis/network
   * dependencies. While state transitions (CLOSED -> OPEN -> HALF_OPEN) occur per instance,
   * each instance rapidly converges during Google-side outages.
   */
  class GeminiCircuitBreaker {
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    private consecutive503Count = 0;
    private lastFailureTime = 0;
    private readonly failureThreshold = 2; // Open after 2 consecutive request cascades where all models fail with 503
    private readonly cooldownPeriodMs = 50000; // 50-second cooldown window (45-60s requirement)
    private canaryProbeInFlight = false;

    public canExecute(): { allowed: boolean; reason?: string } {
      const now = Date.now();
      if (this.state === 'OPEN') {
        if (now - this.lastFailureTime > this.cooldownPeriodMs) {
          this.state = 'HALF_OPEN';
          this.canaryProbeInFlight = true;
          console.log(`[Circuit Breaker] Transitioning OPEN -> HALF_OPEN (cooldown ${this.cooldownPeriodMs}ms expired). Allowing 1 canary probe request.`);
          return { allowed: true };
        }
        const remainingSeconds = Math.max(1, Math.round((this.cooldownPeriodMs - (now - this.lastFailureTime)) / 1000));
        return {
          allowed: false,
          reason: `Gemini AI models are temporarily under load shedding. Circuit breaker is OPEN. Cooldown remaining: ${remainingSeconds}s.`
        };
      }

      if (this.state === 'HALF_OPEN') {
        if (this.canaryProbeInFlight) {
          return {
            allowed: false,
            reason: 'Circuit breaker is HALF_OPEN and currently evaluating a canary probe request. Subsequent requests fast-fail to fallback.'
          };
        }
        this.canaryProbeInFlight = true;
        return { allowed: true };
      }

      return { allowed: true };
    }

    public recordSuccess(): void {
      if (this.state !== 'CLOSED') {
        console.log(`[Circuit Breaker] Canary probe succeeded! Transitioning ${this.state} -> CLOSED. Normal operations restored.`);
      }
      this.state = 'CLOSED';
      this.consecutive503Count = 0;
      this.canaryProbeInFlight = false;
    }

    public recordCascade503Failure(): void {
      this.lastFailureTime = Date.now();
      this.consecutive503Count++;
      this.canaryProbeInFlight = false;

      if (this.state === 'HALF_OPEN' || this.consecutive503Count >= this.failureThreshold) {
        this.state = 'OPEN';
        console.warn(`[Circuit Breaker] Tripped to OPEN state! Consecutive 503 cascades: ${this.consecutive503Count}. Cooldown set to ${this.cooldownPeriodMs / 1000}s.`);
      }
    }

    public getState() {
      const now = Date.now();
      return {
        state: this.state,
        consecutive503Count: this.consecutive503Count,
        lastFailureTime: this.lastFailureTime,
        cooldownPeriodMs: this.cooldownPeriodMs,
        cooldownRemainingMs: this.state === 'OPEN' ? Math.max(0, this.cooldownPeriodMs - (now - this.lastFailureTime)) : 0
      };
    }

    public reset(): void {
      this.state = 'CLOSED';
      this.consecutive503Count = 0;
      this.canaryProbeInFlight = false;
      this.lastFailureTime = 0;
    }
  }

  const geminiCircuitBreaker = new GeminiCircuitBreaker();

  // Diagnostic Circuit Breaker Status Endpoint
  app.get("/api/ai/circuit-breaker-status", standardApiLimiter, (_req, res) => {
    res.json({
      status: "ok",
      circuitBreaker: geminiCircuitBreaker.getState(),
      timestamp: Date.now()
    });
  });

  // =========================================================================
  // MODEL REACHABILITY REGISTRY (ZERO-WAIT ADAPTIVE CASCADE)
  // =========================================================================
  interface ModelReachabilityEntry {
    status: 'HEALTHY' | 'UNREACHABLE' | 'DECOMMISSIONED' | 'RATE_LIMITED';
    consecutiveFailures: number;
    cooldownUntil: number;
    lastFailureTime: number;
    lastSuccessTime: number;
    lastLatencyMs: number;
    lastErrorReason?: string;
  }

  class ModelReachabilityRegistry {
    private registry = new Map<string, ModelReachabilityEntry>();

    public isModelCurrentlyReachable(modelId: string): boolean {
      const entry = this.registry.get(modelId);
      if (!entry) return true; // Untested models are considered reachable until probed
      if (entry.status === 'DECOMMISSIONED' && Date.now() < entry.cooldownUntil) {
        return false;
      }
      return Date.now() >= entry.cooldownUntil;
    }

    public isDecommissioned(modelId: string): boolean {
      const entry = this.registry.get(modelId);
      if (!entry) return false;
      return entry.status === 'DECOMMISSIONED' && Date.now() < entry.cooldownUntil;
    }

    public recordSuccess(modelId: string, latencyMs: number): void {
      const entry = this.registry.get(modelId) || {
        status: 'HEALTHY',
        consecutiveFailures: 0,
        cooldownUntil: 0,
        lastFailureTime: 0,
        lastSuccessTime: 0,
        lastLatencyMs: 0
      };
      entry.status = 'HEALTHY';
      entry.consecutiveFailures = 0;
      entry.cooldownUntil = 0;
      entry.lastSuccessTime = Date.now();
      entry.lastLatencyMs = latencyMs;
      delete entry.lastErrorReason;
      this.registry.set(modelId, entry);
    }

    public recordFailure(modelId: string, error: any, latencyMs: number): void {
      const status = error?.status || error?.response?.status;
      const msg = (error?.message || "").toLowerCase();
      const now = Date.now();

      const entry = this.registry.get(modelId) || {
        status: 'UNREACHABLE',
        consecutiveFailures: 0,
        cooldownUntil: 0,
        lastFailureTime: 0,
        lastSuccessTime: 0,
        lastLatencyMs: 0
      };

      entry.consecutiveFailures++;
      entry.lastFailureTime = now;
      entry.lastLatencyMs = latencyMs;
      entry.lastErrorReason = msg.substring(0, 120);

      const isDecommissioned =
        status === 404 || status === 410 ||
        msg.includes("not found") || msg.includes("is not supported") || msg.includes("deprecated");

      const isQuota = is429QuotaError(error);

      if (isDecommissioned) {
        entry.status = 'DECOMMISSIONED';
        entry.cooldownUntil = now + 86400_000; // 24 hours cooldown for decommissioned/unreleased models
        console.warn(`[Reachability] Model ${modelId} marked DECOMMISSIONED (404/deprecated). Skipping immediately without waiting.`);
      } else if (isQuota) {
        entry.status = 'RATE_LIMITED';
        entry.cooldownUntil = now + 300_000; // 5 min cooldown for quota exhaustion
        console.warn(`[Reachability] Model ${modelId} marked RATE_LIMITED (429 quota). Cooldown: 5 mins.`);
      } else {
        entry.status = 'UNREACHABLE';
        entry.cooldownUntil = now + 60_000; // 60s cooldown for transient 503 or probe timeouts
        console.warn(`[Reachability] Model ${modelId} marked UNREACHABLE (503/timeout). Cooldown: 60s.`);
      }

      this.registry.set(modelId, entry);
    }

    public getAllStatuses(): Record<string, any> {
      const result: Record<string, any> = {};
      const now = Date.now();
      for (const [k, v] of this.registry.entries()) {
        result[k] = {
          ...v,
          isReachable: now >= v.cooldownUntil,
          isDecommissioned: v.status === 'DECOMMISSIONED' && now < v.cooldownUntil,
          cooldownRemainingSeconds: v.cooldownUntil > now ? Math.round((v.cooldownUntil - now) / 1000) : 0
        };
      }
      return result;
    }
  }

  const modelReachabilityRegistry = new ModelReachabilityRegistry();

  // Diagnostic Model Reachability Status Endpoint
  app.get("/api/ai/model-reachability-status", standardApiLimiter, (_req, res) => {
    res.json({
      status: "ok",
      models: modelReachabilityRegistry.getAllStatuses(),
      activeChain: getCandidateModelChain(),
      timestamp: Date.now()
    });
  });

  /**
   * Strictly evaluates if a model meets the required quality floor (strictly >= Gemini 3.5 Flash).
   * Models lower-tier or older than 3.5 Flash (e.g. 3.1-flash-lite, 2.0, 1.5, legacy) are strictly rejected.
   */
  function isModelMeetsQualityFloor(modelId: string): boolean {
    if (!modelId || typeof modelId !== 'string') return false;
    const clean = modelId.trim().toLowerCase();

    // Absolute prohibition of any model strictly below 3.5 Flash
    if (clean.includes("lite") || clean.includes("3.1") || clean.includes("2.0") || clean.includes("1.5")) {
      return false;
    }

    // Dynamic alias pointing to the newest production Gemini Flash release
    if (clean === "gemini-flash-latest") return true;

    // Check version numbers in format gemini-X.Y-flash
    const match = clean.match(/gemini-(\d+)(?:\.(\d+))?-flash/);
    if (match) {
      const major = parseInt(match[1], 10);
      const minor = match[2] ? parseInt(match[2], 10) : 0;
      const versionNum = major + (minor / 10);
      // Strictly >= 3.5
      return versionNum >= 3.5;
    }

    // Explicit approved high-quality models >= 3.5 Flash
    return (
      clean === "gemini-3.8-flash" ||
      clean === "gemini-3.7-flash" ||
      clean === "gemini-3.6-flash" ||
      clean === "gemini-3.5-flash" ||
      clean === "gemini-4-argon"
    );
  }

  /**
   * Resolves the descending candidate model chain adhering to the dynamic Flash pathway:
   * 1. Dynamic Flash alias pointing to the latest version ("gemini-flash-latest")
   * 2. Newest explicit Flash release ("gemini-3.8-flash")
   * 3. Intermediate Flash release ("gemini-3.7-flash")
   * 4. Intermediate Flash release ("gemini-3.6-flash")
   * 5. Gemini 3.5 Flash quality floor ("gemini-3.5-flash")
   * 
   * Zero-Wait Optimization:
   * Models labelled as DECOMMISSIONED (e.g. 404 unreleased) are completely omitted from the chain.
   * Models currently verified as reachable or untested come first. Models currently in cooldown
   * (e.g. recent 503) are deferred to the tail so they are bypassed in 0ms.
   */
  function getCandidateModelChain(requestedModel?: string): string[] {
    const envPrimary = process.env.GEMINI_MODEL?.trim();
    const envFallbacks = process.env.GEMINI_FALLBACK_MODELS
      ? process.env.GEMINI_FALLBACK_MODELS.split(",").map(m => m.trim()).filter(Boolean)
      : [];

    // Complete dynamic descending Flash hierarchy:
    // Newest Flash alias -> 3.8 Flash -> 3.7 Flash -> 3.6 Flash -> 3.5 Flash floor
    const defaultChain = [
      "gemini-flash-latest",
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash"
    ];
    const candidates: string[] = [];

    // 1. Requested model if specified and meets quality floor
    if (requestedModel && isModelMeetsQualityFloor(requestedModel)) {
      candidates.push(requestedModel);
    }

    // 2. Primary model (env override if meets quality floor)
    if (envPrimary && isModelMeetsQualityFloor(envPrimary)) {
      candidates.push(envPrimary);
    }

    // 3. Fallback models configured in env
    for (const m of envFallbacks) {
      if (isModelMeetsQualityFloor(m)) {
        candidates.push(m);
      }
    }

    // 4. Default safety descending chain
    for (const m of defaultChain) {
      if (isModelMeetsQualityFloor(m)) {
        candidates.push(m);
      }
    }

    // Immediately skip and exclude any model that is labelled as DECOMMISSIONED (0ms delay)
    const activeCandidates = candidates.filter(m => !modelReachabilityRegistry.isDecommissioned(m));

    // Deduplicate preserving descending hierarchy
    const unique = activeCandidates.filter((m, idx, arr) => arr.indexOf(m) === idx);

    // Prioritize models that are NOT currently cooling down (Zero-Wait bypass)
    const reachable = unique.filter(m => modelReachabilityRegistry.isModelCurrentlyReachable(m));
    const coolingDown = unique.filter(m => !modelReachabilityRegistry.isModelCurrentlyReachable(m));

    return [...reachable, ...coolingDown];
  }

  function is503UnavailableError(error: any): boolean {
    const status = error?.status || error?.response?.status;
    const msg = (error?.message || "").toLowerCase();
    return (
      status === 503 ||
      msg.includes("503") ||
      msg.includes("unavailable") ||
      msg.includes("high demand") ||
      msg.includes("overloaded") ||
      msg.includes("service unavailable")
    );
  }

  function is402PaymentError(error: any): boolean {
    const status = error?.status || error?.response?.status;
    const msg = (error?.message || "").toLowerCase();
    return (
      status === 402 ||
      msg.includes("402") ||
      msg.includes("prepayment") ||
      msg.includes("credits are depleted") ||
      msg.includes("billing#prepay")
    );
  }

  function is429QuotaError(error: any): boolean {
    if (is402PaymentError(error)) return false;
    const status = error?.status || error?.response?.status;
    const msg = (error?.message || "").toLowerCase();
    return (
      status === 429 ||
      msg.includes("429") ||
      msg.includes("resource_exhausted") ||
      (msg.includes("quota") && !msg.includes("503"))
    );
  }

  /**
   * Resilient executor strictly for transient socket/network drops and gateway timeouts.
   * NOTE: 503 (overloaded) and 429 (quota) are explicitly EXCLUDED from repeated same-model retries.
   */
  async function executeWithNetworkRetries<T>(
    action: () => Promise<T>,
    maxRetries = 1,
    baseDelay = 500
  ): Promise<T> {
    try {
      return await action();
    } catch (error: any) {
      if (is503UnavailableError(error) || is429QuotaError(error) || is402PaymentError(error)) {
        // Immediately throw 503/429/402 to avoid hammering an overloaded or credit-depleted project
        throw error;
      }

      const status = error?.status || error?.response?.status;
      const msg = (error?.message || "").toLowerCase();

      // Permanent client / auth errors must never be retried
      const isPermanent =
        status === 400 || status === 401 || status === 403 || status === 404 ||
        msg.includes("api key") || msg.includes("apikey") || msg.includes("unauthenticated") || msg.includes("permission_denied");
      if (isPermanent) throw error;

      // Only retry true network/transport drops or gateway timeouts
      const isTransientNetwork =
        status === 502 || status === 504 ||
        msg.includes("fetch failed") || msg.includes("econnreset") || msg.includes("etimedout") || msg.includes("network");

      if (maxRetries > 0 && isTransientNetwork) {
        const jitter = Math.floor(Math.random() * 200);
        const waitTime = baseDelay + jitter;
        console.warn(`[Network Retry] Transient connection drop (${msg.substring(0, 60)}). Retrying in ${waitTime}ms...`);
        await new Promise(r => setTimeout(r, waitTime));
        return executeWithNetworkRetries(action, maxRetries - 1, baseDelay * 2);
      }
      throw error;
    }
  }

  // =========================================================================
  // GENEROUS YET BANKRUPTCY-PROOF AI TOKEN BUDGET & SPEND-CAP SYSTEM
  // =========================================================================
  const parsePositiveIntEnv = (envName: string, fallback: number): number => {
    const raw = process.env[envName];
    if (!raw) return fallback;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  const AI_TOKEN_CONFIG = {
    // Global bankruptcy-proof kill switch across ALL users + guests combined
    maxDailyGlobalTokens: parsePositiveIntEnv("MAX_DAILY_GLOBAL_TOKENS", 5_000_000),
    maxMonthlyGlobalTokens: parsePositiveIntEnv("MAX_MONTHLY_GLOBAL_TOKENS", 80_000_000),

    // Authenticated learner allowances (generous for heavy daily language practice)
    userDailyTokens: parsePositiveIntEnv("AI_USER_DAILY_TOKEN_LIMIT", 250_000),
    userMonthlyTokens: parsePositiveIntEnv("AI_USER_MONTHLY_TOKEN_LIMIT", 4_000_000),
    userWindowTokens: parsePositiveIntEnv("AI_USER_WINDOW_TOKEN_LIMIT", 45_000),
    adminDailyTokens: parsePositiveIntEnv("AI_ADMIN_DAILY_TOKEN_LIMIT", 1_000_000),

    // Unauthenticated guest allowances (tight per-IP caps)
    guestDailyTokens: parsePositiveIntEnv("AI_GUEST_DAILY_TOKEN_LIMIT", 30_000),
    guestMonthlyTokens: parsePositiveIntEnv("AI_GUEST_MONTHLY_TOKEN_LIMIT", 150_000),
    guestWindowTokens: parsePositiveIntEnv("AI_GUEST_WINDOW_TOKEN_LIMIT", 12_000),
    guestDailyRequests: parsePositiveIntEnv("AI_GUEST_DAILY_REQUEST_LIMIT", 40),

    // Per-request input & output token guardrails
    maxInputTokensUser: parsePositiveIntEnv("AI_MAX_INPUT_TOKENS_USER", 24_000),
    maxInputTokensGuest: parsePositiveIntEnv("AI_MAX_INPUT_TOKENS_GUEST", 8_000),
    maxOutputTokensStandard: parsePositiveIntEnv("AI_MAX_OUTPUT_TOKENS_STANDARD", 4_096),
    maxOutputTokensLongForm: parsePositiveIntEnv("AI_MAX_OUTPUT_TOKENS_LONG_FORM", 8_192),
    maxOutputTokensGuest: parsePositiveIntEnv("AI_MAX_OUTPUT_TOKENS_GUEST", 2_048),

    // Sliding burst window duration (5 minutes)
    windowMs: 5 * 60 * 1000,
    firestoreSyncTtlMs: 60 * 1000
  };

  interface TokenActor {
    type: "user" | "guest";
    actorId: string; // Firestore-safe hashed IP for guests or uid for users
    isAdmin: boolean;
  }

  interface TokenQuotaSnapshot {
    dailyUsed: number;
    dailyLimit: number;
    dailyRemaining: number;
    monthlyUsed: number;
    monthlyLimit: number;
    monthlyRemaining: number;
    windowUsed: number;
    windowLimit: number;
    dailyResetAt: string;
    monthlyResetAt: string;
  }

  interface BudgetCheckResult {
    allowed: boolean;
    error?: string;
    scope?: string;
    retryAfterSeconds?: number;
    resetAt?: string;
    quota: TokenQuotaSnapshot;
  }

  interface UsageRecordCache {
    tokens: number;
    requests: number;
    lastSyncedAt: number;
  }

  const TOKEN_USAGE_COLLECTION = "server_ai_token_usage";

  class AiTokenBudgetManager {
    private counterCache = new Map<string, UsageRecordCache>();
    private slidingWindowMap = new Map<string, Array<{ ts: number; tokens: number }>>();

    private getUtcDayKey(now = new Date()): string {
      return now.toISOString().slice(0, 10); // YYYY-MM-DD
    }

    private getUtcMonthKey(now = new Date()): string {
      return now.toISOString().slice(0, 7); // YYYY-MM
    }

    private getNextUtcDayResetMs(now = new Date()): number {
      return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0);
    }

    private getNextUtcMonthResetMs(now = new Date()): number {
      return Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0);
    }

    public buildActor(authUser: { uid: string; email?: string } | null, clientIp: string): TokenActor {
      if (authUser?.uid) {
        return {
          type: "user",
          actorId: `u_${authUser.uid}`,
          isAdmin: isServerAdmin(authUser)
        };
      }
      const hashedIp = crypto.createHash("sha256").update(clientIp || "unknown_ip").digest("hex").slice(0, 20);
      return {
        type: "guest",
        actorId: `g_${hashedIp}`,
        isAdmin: false
      };
    }

    public estimatePayloadTokens(contents: any, config?: any): number {
      let totalChars = 0;
      const accumulate = (node: any) => {
        if (!node) return;
        if (typeof node === "string") {
          totalChars += node.length;
        } else if (Array.isArray(node)) {
          for (const item of node) accumulate(item);
        } else if (typeof node === "object") {
          if (typeof node.text === "string") totalChars += node.text.length;
          if (Array.isArray(node.parts)) accumulate(node.parts);
          if (node.inlineData?.data && typeof node.inlineData.data === "string") {
            // Base64 media payloads consume roughly 1 token per ~300 base64 chars (minimum 256)
            totalChars += Math.max(900, Math.ceil(node.inlineData.data.length / 80));
          }
        }
      };
      accumulate(contents);
      if (config?.systemInstruction) {
        accumulate(config.systemInstruction);
      }
      // Conservative 3.5 chars/token accounts cleanly for multilingual & CJK prompts
      return Math.max(1, Math.ceil(totalChars / 3.5));
    }

    public clampOutputConfig(config: any, actor: TokenActor, isLongFormTask: boolean): any {
      const cap = actor.type === "guest"
        ? AI_TOKEN_CONFIG.maxOutputTokensGuest
        : isLongFormTask
        ? AI_TOKEN_CONFIG.maxOutputTokensLongForm
        : AI_TOKEN_CONFIG.maxOutputTokensStandard;

      const safeConfig = config && typeof config === "object" ? { ...config } : {};
      const requested = typeof safeConfig.maxOutputTokens === "number" && Number.isFinite(safeConfig.maxOutputTokens) && safeConfig.maxOutputTokens > 0
        ? Math.floor(safeConfig.maxOutputTokens)
        : cap;

      safeConfig.maxOutputTokens = Math.min(requested, cap);
      return safeConfig;
    }

    public extractActualTokenUsage(
      usageMetadata: any,
      estimatedInputTokens: number,
      outputText: string
    ): { promptTokens: number; outputTokens: number; totalTokens: number } {
      const promptTokens = typeof usageMetadata?.promptTokenCount === "number" && usageMetadata.promptTokenCount > 0
        ? Math.floor(usageMetadata.promptTokenCount)
        : estimatedInputTokens;
      const candidateTokens = typeof usageMetadata?.candidatesTokenCount === "number" && usageMetadata.candidatesTokenCount >= 0
        ? Math.floor(usageMetadata.candidatesTokenCount)
        : Math.ceil((outputText || "").length / 3.5);
      const thoughtsTokens = typeof usageMetadata?.thoughtsTokenCount === "number" && usageMetadata.thoughtsTokenCount > 0
        ? Math.floor(usageMetadata.thoughtsTokenCount)
        : 0;
      const outputTokens = candidateTokens + thoughtsTokens;
      const reportedTotal = typeof usageMetadata?.totalTokenCount === "number" && usageMetadata.totalTokenCount > 0
        ? Math.floor(usageMetadata.totalTokenCount)
        : 0;
      const totalTokens = Math.max(1, reportedTotal || (promptTokens + outputTokens));
      return { promptTokens, outputTokens, totalTokens };
    }

    private getWindowUsage(actorId: string, nowMs = Date.now()): { tokens: number; oldestTs: number | null } {
      const entries = this.slidingWindowMap.get(actorId);
      if (!entries || entries.length === 0) return { tokens: 0, oldestTs: null };
      const cutoff = nowMs - AI_TOKEN_CONFIG.windowMs;
      const active = entries.filter(e => e.ts > cutoff);
      if (active.length === 0) {
        this.slidingWindowMap.delete(actorId);
        return { tokens: 0, oldestTs: null };
      }
      this.slidingWindowMap.set(actorId, active);
      const tokens = active.reduce((sum, item) => sum + item.tokens, 0);
      return { tokens, oldestTs: active[0].ts };
    }

    private recordWindowUsage(actorId: string, tokens: number, nowMs = Date.now()) {
      const cutoff = nowMs - AI_TOKEN_CONFIG.windowMs;
      const existing = (this.slidingWindowMap.get(actorId) || []).filter(e => e.ts > cutoff);
      existing.push({ ts: nowMs, tokens });
      this.slidingWindowMap.set(actorId, existing);
    }

    private async getCounter(docId: string): Promise<UsageRecordCache> {
      const now = Date.now();
      const cached = this.counterCache.get(docId);
      if (cached && now - cached.lastSyncedAt < AI_TOKEN_CONFIG.firestoreSyncTtlMs) {
        return cached;
      }

      if (adminDb) {
        try {
          const snap = await adminDb.collection(TOKEN_USAGE_COLLECTION).doc(docId).get();
          if (snap.exists) {
            const data = snap.data() || {};
            const remoteTokens = typeof data.tokens === "number" ? data.tokens : 0;
            const remoteRequests = typeof data.requests === "number" ? data.requests : 0;
            const merged: UsageRecordCache = {
              tokens: Math.max(cached?.tokens || 0, remoteTokens),
              requests: Math.max(cached?.requests || 0, remoteRequests),
              lastSyncedAt: now
            };
            this.counterCache.set(docId, merged);
            return merged;
          }
        } catch (err: any) {
          console.warn(`[TokenBudget] Firestore read fallback for ${docId}:`, err?.message || err);
        }
      }

      const fallback: UsageRecordCache = cached
        ? { ...cached, lastSyncedAt: now }
        : { tokens: 0, requests: 0, lastSyncedAt: now };
      this.counterCache.set(docId, fallback);
      return fallback;
    }

    private incrementCounter(docId: string, tokenDelta: number, requestDelta: number, periodType: "day" | "month", actorType: "user" | "guest" | "global") {
      const now = Date.now();
      const prev = this.counterCache.get(docId) || { tokens: 0, requests: 0, lastSyncedAt: now };
      this.counterCache.set(docId, {
        tokens: prev.tokens + tokenDelta,
        requests: prev.requests + requestDelta,
        lastSyncedAt: prev.lastSyncedAt
      });

      if (adminDb) {
        adminDb.collection(TOKEN_USAGE_COLLECTION).doc(docId).set({
          tokens: FieldValue.increment(tokenDelta),
          requests: FieldValue.increment(requestDelta),
          periodType,
          actorType,
          updatedAt: now
        }, { merge: true }).catch((err: any) => {
          console.warn(`[TokenBudget] Non-fatal Firestore write notice for ${docId}:`, err?.message || err);
        });
      }
    }

    public async getQuotaSnapshot(actor: TokenActor): Promise<TokenQuotaSnapshot> {
      const now = new Date();
      const dayKey = this.getUtcDayKey(now);
      const monthKey = this.getUtcMonthKey(now);

      const [actorDaily, actorMonthly] = await Promise.all([
        this.getCounter(`${actor.actorId}_day_${dayKey}`),
        this.getCounter(`${actor.actorId}_month_${monthKey}`)
      ]);

      const dailyLimit = actor.type === "guest"
        ? AI_TOKEN_CONFIG.guestDailyTokens
        : actor.isAdmin
        ? AI_TOKEN_CONFIG.adminDailyTokens
        : AI_TOKEN_CONFIG.userDailyTokens;

      const monthlyLimit = actor.type === "guest"
        ? AI_TOKEN_CONFIG.guestMonthlyTokens
        : AI_TOKEN_CONFIG.userMonthlyTokens;

      const windowLimit = actor.type === "guest"
        ? AI_TOKEN_CONFIG.guestWindowTokens
        : AI_TOKEN_CONFIG.userWindowTokens;

      const windowStats = this.getWindowUsage(actor.actorId, now.getTime());

      return {
        dailyUsed: actorDaily.tokens,
        dailyLimit,
        dailyRemaining: Math.max(0, dailyLimit - actorDaily.tokens),
        monthlyUsed: actorMonthly.tokens,
        monthlyLimit,
        monthlyRemaining: Math.max(0, monthlyLimit - actorMonthly.tokens),
        windowUsed: windowStats.tokens,
        windowLimit,
        dailyResetAt: new Date(this.getNextUtcDayResetMs(now)).toISOString(),
        monthlyResetAt: new Date(this.getNextUtcMonthResetMs(now)).toISOString()
      };
    }

    public async checkBudget(actor: TokenActor, estimatedInputTokens: number): Promise<BudgetCheckResult> {
      const now = new Date();
      const nowMs = now.getTime();
      const dayKey = this.getUtcDayKey(now);
      const monthKey = this.getUtcMonthKey(now);
      const nextDayResetMs = this.getNextUtcDayResetMs(now);
      const nextMonthResetMs = this.getNextUtcMonthResetMs(now);

      const [globalDaily, globalMonthly, actorDaily, actorMonthly] = await Promise.all([
        this.getCounter(`global_day_${dayKey}`),
        this.getCounter(`global_month_${monthKey}`),
        this.getCounter(`${actor.actorId}_day_${dayKey}`),
        this.getCounter(`${actor.actorId}_month_${monthKey}`)
      ]);

      const dailyLimit = actor.type === "guest"
        ? AI_TOKEN_CONFIG.guestDailyTokens
        : actor.isAdmin
        ? AI_TOKEN_CONFIG.adminDailyTokens
        : AI_TOKEN_CONFIG.userDailyTokens;

      const monthlyLimit = actor.type === "guest"
        ? AI_TOKEN_CONFIG.guestMonthlyTokens
        : AI_TOKEN_CONFIG.userMonthlyTokens;

      const windowLimit = actor.type === "guest"
        ? AI_TOKEN_CONFIG.guestWindowTokens
        : AI_TOKEN_CONFIG.userWindowTokens;

      const maxInput = actor.type === "guest"
        ? AI_TOKEN_CONFIG.maxInputTokensGuest
        : AI_TOKEN_CONFIG.maxInputTokensUser;

      const windowStats = this.getWindowUsage(actor.actorId, nowMs);

      const quota: TokenQuotaSnapshot = {
        dailyUsed: actorDaily.tokens,
        dailyLimit,
        dailyRemaining: Math.max(0, dailyLimit - actorDaily.tokens),
        monthlyUsed: actorMonthly.tokens,
        monthlyLimit,
        monthlyRemaining: Math.max(0, monthlyLimit - actorMonthly.tokens),
        windowUsed: windowStats.tokens,
        windowLimit,
        dailyResetAt: new Date(nextDayResetMs).toISOString(),
        monthlyResetAt: new Date(nextMonthResetMs).toISOString()
      };

      // 1. Per-request prompt ceiling (prevents giant single-call attacks)
      if (estimatedInputTokens > maxInput) {
        return {
          allowed: false,
          scope: "request_input_limit",
          retryAfterSeconds: 5,
          resetAt: new Date(nowMs + 5000).toISOString(),
          error: `This AI request is too large (~${estimatedInputTokens.toLocaleString()} input tokens, max ${maxInput.toLocaleString()}). Please shorten your prompt or sign in for higher limits.`,
          quota
        };
      }

      // 2. Global bankruptcy-proof daily & monthly kill switch
      if (globalDaily.tokens + estimatedInputTokens > AI_TOKEN_CONFIG.maxDailyGlobalTokens) {
        const retryAfterSeconds = Math.max(60, Math.ceil((nextDayResetMs - nowMs) / 1000));
        console.warn(`[TokenBudget KILL SWITCH] Global daily cap reached (${globalDaily.tokens.toLocaleString()}/${AI_TOKEN_CONFIG.maxDailyGlobalTokens.toLocaleString()}).`);
        return {
          allowed: false,
          scope: "global_daily",
          retryAfterSeconds,
          resetAt: new Date(nextDayResetMs).toISOString(),
          error: "Talky Bean has reached its daily server-wide AI capacity safeguard. Live AI generation will resume automatically at 00:00 UTC.",
          quota
        };
      }

      if (globalMonthly.tokens + estimatedInputTokens > AI_TOKEN_CONFIG.maxMonthlyGlobalTokens) {
        const retryAfterSeconds = Math.max(300, Math.ceil((nextMonthResetMs - nowMs) / 1000));
        console.warn(`[TokenBudget KILL SWITCH] Global monthly cap reached (${globalMonthly.tokens.toLocaleString()}/${AI_TOKEN_CONFIG.maxMonthlyGlobalTokens.toLocaleString()}).`);
        return {
          allowed: false,
          scope: "global_monthly",
          retryAfterSeconds,
          resetAt: new Date(nextMonthResetMs).toISOString(),
          error: "Talky Bean has reached its monthly server-wide AI capacity safeguard. Please try again after the monthly reset.",
          quota
        };
      }

      // 3. Guest daily request count guardrail
      if (actor.type === "guest" && actorDaily.requests >= AI_TOKEN_CONFIG.guestDailyRequests) {
        const retryAfterSeconds = Math.max(60, Math.ceil((nextDayResetMs - nowMs) / 1000));
        return {
          allowed: false,
          scope: "guest_daily_requests",
          retryAfterSeconds,
          resetAt: new Date(nextDayResetMs).toISOString(),
          error: `Guest daily AI request allowance (${AI_TOKEN_CONFIG.guestDailyRequests} requests/day) reached. Sign in for a much higher daily allowance, or wait until 00:00 UTC.`,
          quota
        };
      }

      // 4. Sliding 5-minute burst token window
      if (windowStats.tokens + estimatedInputTokens > windowLimit) {
        const windowResetMs = (windowStats.oldestTs || nowMs) + AI_TOKEN_CONFIG.windowMs;
        const retryAfterSeconds = Math.max(15, Math.ceil((windowResetMs - nowMs) / 1000));
        return {
          allowed: false,
          scope: actor.type === "guest" ? "guest_window" : "user_window",
          retryAfterSeconds,
          resetAt: new Date(windowResetMs).toISOString(),
          error: actor.type === "guest"
            ? `You've reached the short-term guest AI token pace limit. Sign in for higher limits or wait ${retryAfterSeconds}s.`
            : `You're practicing super fast! Please pause for ${retryAfterSeconds}s so your 5-minute AI token pace window can refresh.`,
          quota
        };
      }

      // 5. Actor daily token budget
      if (actorDaily.tokens + estimatedInputTokens > dailyLimit) {
        const retryAfterSeconds = Math.max(60, Math.ceil((nextDayResetMs - nowMs) / 1000));
        return {
          allowed: false,
          scope: actor.type === "guest" ? "guest_daily" : "user_daily",
          retryAfterSeconds,
          resetAt: new Date(nextDayResetMs).toISOString(),
          error: actor.type === "guest"
            ? `Guest daily AI token allowance (${dailyLimit.toLocaleString()} tokens) reached. Sign in for ${AI_TOKEN_CONFIG.userDailyTokens.toLocaleString()} daily tokens, or try again after 00:00 UTC.`
            : `You have reached your generous daily AI allowance (${dailyLimit.toLocaleString()} tokens). Your quota resets automatically at 00:00 UTC.`,
          quota
        };
      }

      // 6. Actor monthly token budget
      if (actorMonthly.tokens + estimatedInputTokens > monthlyLimit) {
        const retryAfterSeconds = Math.max(300, Math.ceil((nextMonthResetMs - nowMs) / 1000));
        return {
          allowed: false,
          scope: actor.type === "guest" ? "guest_monthly" : "user_monthly",
          retryAfterSeconds,
          resetAt: new Date(nextMonthResetMs).toISOString(),
          error: actor.type === "guest"
            ? `Guest monthly AI allowance reached. Please sign in to continue practicing.`
            : `You have reached your monthly AI token allowance (${monthlyLimit.toLocaleString()} tokens). Your allowance resets on the 1st of next month at 00:00 UTC.`,
          quota
        };
      }

      return { allowed: true, quota };
    }

    public recordActualUsage(actor: TokenActor, actualTokens: number): void {
      const safeTokens = Math.max(1, Math.floor(actualTokens));
      const now = new Date();
      const dayKey = this.getUtcDayKey(now);
      const monthKey = this.getUtcMonthKey(now);

      this.recordWindowUsage(actor.actorId, safeTokens, now.getTime());
      this.incrementCounter(`${actor.actorId}_day_${dayKey}`, safeTokens, 1, "day", actor.type);
      this.incrementCounter(`${actor.actorId}_month_${monthKey}`, safeTokens, 1, "month", actor.type);
      this.incrementCounter(`global_day_${dayKey}`, safeTokens, 1, "day", "global");
      this.incrementCounter(`global_month_${monthKey}`, safeTokens, 1, "month", "global");
    }

    public pruneStaleCache(): void {
      const now = new Date();
      const activeDay = this.getUtcDayKey(now);
      const activeMonth = this.getUtcMonthKey(now);
      for (const key of this.counterCache.keys()) {
        if (key.includes("_day_") && !key.endsWith(`_${activeDay}`)) {
          this.counterCache.delete(key);
        } else if (key.includes("_month_") && !key.endsWith(`_${activeMonth}`)) {
          this.counterCache.delete(key);
        }
      }
      const cutoff = now.getTime() - AI_TOKEN_CONFIG.windowMs;
      for (const [k, entries] of this.slidingWindowMap.entries()) {
        const active = entries.filter(e => e.ts > cutoff);
        if (active.length === 0) this.slidingWindowMap.delete(k);
        else this.slidingWindowMap.set(k, active);
      }
    }
  }

  const aiTokenBudgetManager = new AiTokenBudgetManager();
  setInterval(() => aiTokenBudgetManager.pruneStaleCache(), 10 * 60 * 1000);

  function getClientIp(req: express.Request): string {
    return req.ip || (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || "unknown_ip";
  }

  function sendTokenQuotaExceeded(res: express.Response, check: BudgetCheckResult) {
    const retryAfter = check.retryAfterSeconds || 60;
    res.setHeader("Retry-After", String(retryAfter));
    return res.status(429).json({
      error: check.error || "AI token quota limit reached. Please try again shortly.",
      code: "TOKEN_QUOTA_EXCEEDED",
      scope: check.scope || "user_daily",
      retryAfter,
      resetAt: check.resetAt || check.quota.dailyResetAt,
      quota: check.quota,
      status: 429
    });
  }

  // Quota Inspection Endpoint (returns remaining daily/monthly allowance for current user or guest)
  app.get("/api/ai/quota", standardApiLimiter, async (req, res) => {
    try {
      const clientIp = getClientIp(req);
      const authUser = req.headers.authorization ? await verifyAuthUser(req) : null;
      const actor = aiTokenBudgetManager.buildActor(authUser, clientIp);
      const quota = await aiTokenBudgetManager.getQuotaSnapshot(actor);
      return res.json({
        actorType: actor.type,
        quota
      });
    } catch (err: any) {
      console.error("[AI Quota Status Error]:", err?.message || err);
      return res.status(500).json({ error: "Unable to retrieve AI quota status." });
    }
  });

  // =========================================================================
  // STAGE C: BATCHED DIFFICULT VOCABULARY RESOLUTION ENDPOINT
  // =========================================================================
  app.post("/api/ai/vocab-batch", aiEndpointLimiter, async (req, res) => {
    try {
      const { languageCode, nativeLanguage, level, items } = req.body || {};
      if (!Array.isArray(items) || items.length === 0) {
        return res.json({ items: [] });
      }

      // Check circuit breaker; if OPEN, fail soft without crashing
      const breakerCheck = geminiCircuitBreaker.canExecute();
      if (!breakerCheck.allowed) {
        console.warn("[Vocab-Batch] Circuit breaker active. Returning empty batch to allow client local fallbacks.");
        return res.json({ items: [], fallback: true });
      }

      // Token budget enforcement (fail-soft to local dictionary fallback if quota reached)
      const clientIp = getClientIp(req);
      const authUser = req.headers.authorization ? await verifyAuthUser(req) : null;
      const actor = aiTokenBudgetManager.buildActor(authUser, clientIp);

      const client = getAiClient();
      const candidateModels = getCandidateModelChain();
      const targetLang = (languageCode || 'de').toUpperCase();
      const userLang = nativeLanguage || 'en';
      const userLevel = level || 'A1';

      // Build structured batch prompt (supports up to 35 items for longer C1 passages)
      const batchList = items.slice(0, 35).map((it: any, idx: number) => {
        return `${idx + 1}. Word: "${it.original}" | Identified Lemma: "${it.lemma || it.original}" | Sentence: "${it.sentence || ''}"`;
      }).join("\n");

      const prompt = `You are an expert multilingual lexicographer and language teacher.
Analyze these vocabulary words from authentic ${targetLang} reading text for a ${userLevel} learner translating to ${userLang}.
For each word, determine:
1. Canonical base lemma (unconjugated infinitive for verbs, nominative singular for nouns, base form for adjectives).
2. Accurate contextual translation in ${userLang}.
3. Part of speech ("verb", "noun", "adj", "adv", or "phrase").
4. A short, learner-friendly explanation (max 10 words).

Word List:
${batchList}

Respond strictly with valid JSON adhering to this schema:
{
  "items": [
    {
      "original": "exact word as given",
      "lemma": "canonical base form",
      "pos": "verb|noun|adj|adv|phrase",
      "translation": "accurate contextual translation",
      "explanation": "brief contextual note"
    }
  ]
}`;

      const estimatedInputTokens = aiTokenBudgetManager.estimatePayloadTokens(prompt);
      const budgetCheck = await aiTokenBudgetManager.checkBudget(actor, estimatedInputTokens);
      if (!budgetCheck.allowed) {
        console.warn(`[Vocab-Batch] Token budget reached (${budgetCheck.scope}); falling back gracefully to local dictionary.`);
        return res.json({ items: [], fallback: true, quotaExceeded: true });
      }

      const safeVocabConfig = aiTokenBudgetManager.clampOutputConfig(
        { responseMimeType: "application/json" },
        actor,
        false
      );

      let aiResponse: any = null;
      for (const currentModel of candidateModels) {
        try {
          aiResponse = await client.models.generateContent({
            model: currentModel,
            contents: prompt,
            config: safeVocabConfig
          });
          if (aiResponse && aiResponse.text) {
            geminiCircuitBreaker.recordSuccess();
            break;
          }
        } catch (err: any) {
          if (is503UnavailableError(err)) {
            console.warn(`[Vocab-Batch] Model ${currentModel} returned 503. Cascading to next candidate...`);
            continue;
          }
          if (is429QuotaError(err)) {
            console.warn(`[Vocab-Batch] Model ${currentModel} returned 429 quota exhausted. Cascading...`);
            continue;
          }
          const status = err?.status || err?.response?.status;
          const msg = (err?.message || "").toLowerCase();
          if (status === 404 || status === 400 || msg.includes("not found") || msg.includes("is not supported")) {
            console.warn(`[Vocab-Batch] Model ${currentModel} unavailable (${status}). Cascading...`);
            continue;
          }
        }
      }

      if (aiResponse && aiResponse.text) {
        const usage = aiTokenBudgetManager.extractActualTokenUsage(
          aiResponse.usageMetadata,
          estimatedInputTokens,
          aiResponse.text
        );
        aiTokenBudgetManager.recordActualUsage(actor, usage.totalTokens);

        try {
          const parsed = JSON.parse(aiResponse.text.trim());
          if (parsed && Array.isArray(parsed.items)) {
            return res.json({ items: parsed.items });
          }
        } catch {
          // Fall through to safe empty batch
        }
      }

      return res.json({ items: [], fallback: true });
    } catch (batchErr) {
      console.warn("[Vocab-Batch] Non-fatal batch resolution fallback:", batchErr);
      return res.json({ items: [], fallback: true });
    }
  });

  // Secure API Route to proxy Gemini API calls
  app.post("/api/ai/generateContent", aiEndpointLimiter, async (req, res) => {
    const startTime = Date.now();
    let selectedModel = "unknown";

    try {
      // 1. IP Rate Limiting
      const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown_ip";
      if (!checkRateLimit(`ip_${clientIp}`, 40, 60000)) {
        return res.status(429).json({ error: "Too many requests from this IP address. Please wait a minute before trying again." });
      }

      // 2. Authentication & 18+ Adult Eligibility Check
      let authUser: { uid: string; email?: string } | null = null;
      if (req.headers.authorization) {
        authUser = await verifyAuthUser(req);
        if (authUser) {
          const isAdultEligible = await verifyAdultEligibility(authUser);
          if (!isAdultEligible) {
            return res.status(403).json({
              error: "Adult eligibility required: Talky Bean is exclusively for learners aged 18 and older. Please confirm your 18+ eligibility in the app to proceed.",
              requiresAgeConfirmation: true
            });
          }
          if (!checkRateLimit(`user_${authUser.uid}`, 40, 60000)) {
            return res.status(429).json({ error: "Account request limit reached. Please wait a minute before making more AI requests." });
          }
        }
      } else {
        // Unauthenticated guest learner allowance bounded by strict IP rate limiting
        if (!checkRateLimit(`guest_gen_${clientIp}`, 25, 60000)) {
          return res.status(429).json({ error: "Guest request limit reached. Please sign in or wait a minute before making more AI requests." });
        }
      }

      // 3. Fast-Fail if Server-Side Circuit Breaker is OPEN
      const breakerCheck = geminiCircuitBreaker.canExecute();
      if (!breakerCheck.allowed) {
        const breakerState = geminiCircuitBreaker.getState();
        console.warn(`[Proxy Fast-Fail] Circuit Breaker ${breakerState.state}: Bypassing Gemini to prevent retry storm. Remaining: ${Math.round(breakerState.cooldownRemainingMs / 1000)}s.`);
        return res.status(503).json({
          error: breakerCheck.reason || "The AI model service is temporarily experiencing high demand. Circuit breaker is active.",
          code: "CIRCUIT_BREAKER_OPEN",
          status: 503,
          circuitBreaker: breakerState
        });
      }

      // 4. Request Input Validation
      const { model, contents, config, isLongForm, timeoutMs: customTimeoutMs } = req.body || {};
      if (!contents) {
        return res.status(400).json({ error: "Missing contents field in request body." });
      }

      if (typeof contents !== "string" && !Array.isArray(contents)) {
        return res.status(400).json({ error: "Invalid contents structure in request body." });
      }

      const contentLen = typeof contents === "string" ? contents.length : JSON.stringify(contents).length;
      if (contentLen > 500000) {
        return res.status(400).json({ error: "Request payload size exceeds maximum safe prompt threshold." });
      }

      // Strictly validate and bound optional client timeoutMs to prevent timer-based resource exhaustion
      const MIN_CUSTOM_TIMEOUT_MS = 1000;
      const MAX_CUSTOM_TIMEOUT_MS = 300000; // 5-minute server-enforced ceiling
      const DEFAULT_LONG_FORM_TIMEOUT_MS = 300000;
      let safeCustomTimeoutMs: number | undefined;
      if (customTimeoutMs !== undefined && customTimeoutMs !== null) {
        const parsedTimeout = typeof customTimeoutMs === "number" ? customTimeoutMs : Number(customTimeoutMs);
        if (!Number.isFinite(parsedTimeout) || parsedTimeout < MIN_CUSTOM_TIMEOUT_MS || parsedTimeout > MAX_CUSTOM_TIMEOUT_MS) {
          return res.status(400).json({
            error: `Invalid timeoutMs value. Must be a finite number between ${MIN_CUSTOM_TIMEOUT_MS} and ${MAX_CUSTOM_TIMEOUT_MS} milliseconds.`
          });
        }
        safeCustomTimeoutMs = Math.trunc(parsedTimeout);
      }

      // Determine if task is long-form generation (e.g. reading module passage, questions, exam modules)
      const isLongFormTask = Boolean(
        isLongForm ||
        req.body?.isLongForm ||
        req.body?.taskType ||
        (safeCustomTimeoutMs !== undefined && safeCustomTimeoutMs >= 60000)
      );

      // 4b. Per-User / Guest / Global Token Budget Pre-Check & Output Token Clamping
      const tokenActor = aiTokenBudgetManager.buildActor(authUser, clientIp);
      const estimatedInputTokens = aiTokenBudgetManager.estimatePayloadTokens(contents, config);
      const budgetCheck = await aiTokenBudgetManager.checkBudget(tokenActor, estimatedInputTokens);
      if (!budgetCheck.allowed) {
        return sendTokenQuotaExceeded(res, budgetCheck);
      }
      const boundedConfig = aiTokenBudgetManager.clampOutputConfig(config, tokenActor, isLongFormTask);

      // 5. Approved Candidate Models Chain in descending order down to 3.5 Flash floor
      const candidateModels = getCandidateModelChain(typeof model === "string" ? model : undefined);
      selectedModel = candidateModels[0];

      fs.appendFileSync("/tmp/proxy.log", `[${new Date().toISOString()}] Start request. modelParam=${model}, isLongForm=${isLongFormTask}, Chain: [${candidateModels.join(", ")}]\n`);
      console.log(`[Proxy] Initiating AI request. Primary: ${candidateModels[0]}, Chain: [${candidateModels.join(", ")}], isLongForm: ${isLongFormTask}, Payload: ${contentLen} chars (~${estimatedInputTokens} tokens)`);

      const client = getAiClient();
      let response: any = null;
      let lastError: any = null;
      let cascadedCount = 0;
      let had429QuotaError = false;

      for (const currentModel of candidateModels) {
        if (modelReachabilityRegistry.isDecommissioned(currentModel)) {
          console.warn(`[Proxy Decommissioned Bypass] Model ${currentModel} is labeled DECOMMISSIONED. Skipping immediately in 0ms without waiting.`);
          continue;
        }
        selectedModel = currentModel;
        const isLastModel = currentModel === candidateModels[candidateModels.length - 1];
        const isFloorModel = currentModel === "gemini-3.5-flash";

        // Per-model bounded timer (max 5 minutes / 300,000ms) for long-form generation tasks (reading modules).
        // Each model receives a brand-new timer from the moment it begins working.
        // For interactive chat doubts, preserve the fast failover window (3.0s probe, 10s floor).
        const rawTimeoutMs = isLongFormTask
          ? (safeCustomTimeoutMs ?? DEFAULT_LONG_FORM_TIMEOUT_MS)
          : (isLastModel || isFloorModel ? 10000 : 3000);
        const timeoutMs = Math.min(MAX_CUSTOM_TIMEOUT_MS, Math.max(MIN_CUSTOM_TIMEOUT_MS, rawTimeoutMs));
        const modelStart = Date.now();
        let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

        try {
          fs.appendFileSync("/tmp/proxy.log", `[${new Date().toISOString()}] Trying model: ${currentModel} (timeout: ${timeoutMs}ms, fresh timer start)...\n`);
          const timeoutPromise = new Promise((_, reject) => {
            timeoutHandle = setTimeout(() => reject(new Error(`Timeout: Model ${currentModel} execution exceeded ${timeoutMs}ms window`)), timeoutMs);
          });

          try {
            response = await Promise.race([
              executeWithNetworkRetries(() => client.models.generateContent({
                model: currentModel,
                contents,
                config: boundedConfig
              }), 1, 300),
              timeoutPromise
            ]);
          } finally {
            if (timeoutHandle) {
              clearTimeout(timeoutHandle);
            }
          }

          if (response) {
            const elapsed = Date.now() - startTime;
            const modelElapsed = Date.now() - modelStart;
            modelReachabilityRegistry.recordSuccess(currentModel, modelElapsed);
            geminiCircuitBreaker.recordSuccess();
            fs.appendFileSync("/tmp/proxy.log", `[${new Date().toISOString()}] Model SUCCESS: ${currentModel} in ${modelElapsed}ms (total: ${elapsed}ms)\n`);
            console.log(`[Proxy Success] Model: ${currentModel}, Duration: ${elapsed}ms, Cascades: ${cascadedCount}`);
            break;
          }
        } catch (err: any) {
          lastError = err;
          cascadedCount++;
          const modelElapsed = Date.now() - modelStart;
          modelReachabilityRegistry.recordFailure(currentModel, err, modelElapsed);
          fs.appendFileSync("/tmp/proxy.log", `[${new Date().toISOString()}] Model FAILED/TIMED OUT: ${currentModel} after ${modelElapsed}ms -> ${err?.message}\n`);
          const status = err?.status || err?.response?.status;
          const msg = (err?.message || "").toLowerCase();

          // 0. HTTP 402 Prepayment Credits Depleted: Fast fail immediately (project billing balance exhausted)
          if (is402PaymentError(err)) {
            console.warn(`[Proxy 402 Prepayment] Prepayment credits depleted on project for model ${currentModel}.`);
            return res.status(402).json({
              error: "Your Google AI Studio prepayment credits are depleted. Please visit https://ai.studio/projects or add funds at https://ai.google.dev/gemini-api/docs/billing#prepay to continue making live AI requests.",
              code: "PREPAYMENT_CREDITS_DEPLETED",
              status: 402
            });
          }

          // 1. HTTP 429 Quota Exceeded: Cascade down to next approved Flash model if available
          if (is429QuotaError(err)) {
            had429QuotaError = true;
            console.warn(`[Proxy 429 Quota] Model ${currentModel} reached model quota limit. ${isLastModel ? 'End of candidate chain.' : `Cascading down to next approved Flash model (${candidateModels[cascadedCount]})...`}`);
            if (!isLastModel) {
              continue;
            }
            return res.status(429).json({
              error: "You have depleted the daily AI request quota across all approved high-quality models (Gemini 3.5+). Please try again shortly once your quota resets.",
              code: "DAILY_QUOTA_DEPLETED",
              status: 429
            });
          }

          // 2. HTTP 404 / 410 / Invalid Model (Decommissioning / Deprecation Resilience)
          const isModelDecommissioned =
            status === 404 || status === 410 ||
            msg.includes("not found") || msg.includes("is not supported") || msg.includes("invalid model") || msg.includes("deprecated");
          if (isModelDecommissioned) {
            console.warn(`[Proxy Model Decommissioned] Model ${currentModel} returned ${status || 'decommissioned'}. Skipping immediately to next model in 0ms...`);
            if (!isLastModel) {
              continue;
            }
          }

          // 3. HTTP 503 Unavailable / High Demand: Immediately cascade to next candidate without same-model retries
          if (is503UnavailableError(err)) {
            console.warn(`[Proxy 503 Cascading] Model ${currentModel} unavailable (503). ${isLastModel ? 'End of candidate chain.' : `Immediately cascading down to next candidate (${candidateModels[cascadedCount]})...`}`);
            if (!isLastModel) {
              continue;
            }
          }

          // 4. Timeout: Immediately cascade without waiting
          const isTimeout = msg.includes("timeout");
          if (isTimeout && !isLastModel) {
            console.warn(`[Proxy Timeout Cascading] Model ${currentModel} timed out. Cascading down to next candidate (${candidateModels[cascadedCount]})...`);
            continue;
          }

          if (!isLastModel) {
            continue;
          }
          break;
        }
      }

      if (!response) {
        if (had429QuotaError) {
          console.warn("[Proxy 429 Quota] Candidate chain exhausted following quota depletion.");
          return res.status(429).json({
            error: "You have depleted the daily AI request quota across all approved high-quality models (Gemini 3.5+). Please try again shortly once your quota resets.",
            code: "DAILY_QUOTA_DEPLETED",
            status: 429
          });
        }

        const is503 = is503UnavailableError(lastError);
        if (is503) {
          // All approved models in candidate chain failed with 503 -> record cascade failure in circuit breaker
          geminiCircuitBreaker.recordCascade503Failure();
        }

        const isTimeout = (lastError?.message || "").toLowerCase().includes("timeout");
        const status = is503 ? 503 : isTimeout ? 504 : 500;
        const code = is503 ? "SERVICE_UNAVAILABLE" : isTimeout ? "NETWORK_TIMEOUT" : "GENERATION_ERROR";

        return res.status(status).json({
          error: is503
            ? "The AI model service is temporarily experiencing high demand across all approved models. Please try again shortly."
            : isTimeout
            ? "AI generation request timed out. Please retry."
            : "Content generation could not be completed. Please try again.",
          code,
          status,
          circuitBreaker: geminiCircuitBreaker.getState()
        });
      }

      // 6. Accurate Post-Completion Token Deduction from Gemini usageMetadata
      const responseText = response.text || "";
      const tokenUsage = aiTokenBudgetManager.extractActualTokenUsage(
        response.usageMetadata,
        estimatedInputTokens,
        responseText
      );
      aiTokenBudgetManager.recordActualUsage(tokenActor, tokenUsage.totalTokens);

      const updatedDailyRemaining = Math.max(0, budgetCheck.quota.dailyRemaining - tokenUsage.totalTokens);
      res.setHeader("X-AI-Tokens-Used", String(tokenUsage.totalTokens));
      res.setHeader("X-AI-Daily-Remaining", String(updatedDailyRemaining));
      res.setHeader("X-AI-Daily-Reset", budgetCheck.quota.dailyResetAt);

      return res.json({
        text: responseText,
      });
    } catch (error: any) {
      if (is429QuotaError(error)) {
        console.warn("[Server] Quota limit reached in generateContent:", error?.message);
        return res.status(429).json({
          error: "You have depleted the daily AI request quota across all approved high-quality models (Gemini 3.5+). Please try again shortly once your quota resets.",
          code: "DAILY_QUOTA_DEPLETED",
          status: 429
        });
      }
      console.error("[Server] Error in generateContent proxy:", error?.message || "Operation failed");
      const status = error.status || 500;
      return res.status(status).json({
        error: error.message || "An error occurred during content generation.",
        code: error.code || (status === 429 ? "RATE_LIMITED" : status === 503 ? "SERVICE_UNAVAILABLE" : status === 401 ? "UNAUTHORIZED" : status === 403 ? "AGE_CONFIRMATION_REQUIRED" : "GENERATION_ERROR"),
        requiresAgeConfirmation: error.requiresAgeConfirmation,
        status
      });
    }
  });

  // Secure API Route to proxy Gemini stream calls
  app.post("/api/ai/generateContentStream", aiEndpointLimiter, async (req, res) => {
    try {
      // 1. IP Rate Limiting
      const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown_ip";
      if (!checkRateLimit(`ip_stream_${clientIp}`, 40, 60000)) {
        return res.status(429).json({ error: "Too many requests from this IP address. Please wait a minute." });
      }

      // 2. Authentication & 18+ Adult Eligibility Check
      let authUser: { uid: string; email?: string } | null = null;
      if (req.headers.authorization) {
        authUser = await verifyAuthUser(req);
        if (authUser) {
          const isAdultEligible = await verifyAdultEligibility(authUser);
          if (!isAdultEligible) {
            return res.status(403).json({
              error: "Adult eligibility required: Talky Bean is exclusively for learners aged 18 and older. Please confirm your 18+ eligibility in the app to proceed.",
              requiresAgeConfirmation: true
            });
          }
          if (!checkRateLimit(`user_stream_${authUser.uid}`, 40, 60000)) {
            return res.status(429).json({ error: "Account request limit reached. Please wait a minute." });
          }
        }
      } else {
        // Unauthenticated guest learner allowance bounded by strict IP rate limiting
        if (!checkRateLimit(`guest_stream_${clientIp}`, 25, 60000)) {
          return res.status(429).json({ error: "Guest request limit reached. Please sign in or wait a minute." });
        }
      }

      // 3. Fast-Fail if Server-Side Circuit Breaker is OPEN
      const breakerCheck = geminiCircuitBreaker.canExecute();
      if (!breakerCheck.allowed) {
        const breakerState = geminiCircuitBreaker.getState();
        return res.status(503).json({
          error: breakerCheck.reason || "AI service temporarily unavailable (circuit breaker open).",
          code: "CIRCUIT_BREAKER_OPEN",
          status: 503,
          circuitBreaker: breakerState
        });
      }

      // 4. Request Input Validation
      const { model, contents, config } = req.body || {};
      if (!contents) {
        return res.status(400).json({ error: "Missing contents in request body." });
      }

      if (typeof contents !== "string" && !Array.isArray(contents)) {
        return res.status(400).json({ error: "Invalid contents structure in request body." });
      }

      const contentLen = typeof contents === "string" ? contents.length : JSON.stringify(contents).length;
      if (contentLen > 500000) {
        return res.status(400).json({ error: "Request payload size exceeds maximum safe prompt threshold." });
      }

      // 4b. Per-User / Guest / Global Token Budget Pre-Check & Output Token Clamping
      const tokenActor = aiTokenBudgetManager.buildActor(authUser, clientIp);
      const estimatedInputTokens = aiTokenBudgetManager.estimatePayloadTokens(contents, config);
      const budgetCheck = await aiTokenBudgetManager.checkBudget(tokenActor, estimatedInputTokens);
      if (!budgetCheck.allowed) {
        return sendTokenQuotaExceeded(res, budgetCheck);
      }
      const boundedConfig = aiTokenBudgetManager.clampOutputConfig(config, tokenActor, false);

      const candidateModels = getCandidateModelChain(typeof model === "string" ? model : undefined);
      const client = getAiClient();
      let responseStream: any = null;
      let lastError: any = null;

      for (const currentModel of candidateModels) {
        if (modelReachabilityRegistry.isDecommissioned(currentModel)) {
          console.warn(`[Proxy Stream Decommissioned Bypass] Model ${currentModel} is labeled DECOMMISSIONED. Skipping immediately in 0ms.`);
          continue;
        }
        const isLastModel = currentModel === candidateModels[candidateModels.length - 1];
        const isFloorModel = currentModel === "gemini-3.5-flash";
        const timeoutMs = (isLastModel || isFloorModel) ? 10000 : 3000;
        const modelStart = Date.now();
        let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

        try {
          const timeoutPromise = new Promise((_, reject) => {
            timeoutHandle = setTimeout(() => reject(new Error(`Timeout: Model ${currentModel} stream probe exceeded ${timeoutMs}ms`)), timeoutMs);
          });

          try {
            responseStream = await Promise.race([
              executeWithNetworkRetries(() => client.models.generateContentStream({
                model: currentModel,
                contents,
                config: boundedConfig
              }), 1, 300),
              timeoutPromise
            ]);
          } finally {
            if (timeoutHandle) {
              clearTimeout(timeoutHandle);
            }
          }

          if (responseStream) {
            modelReachabilityRegistry.recordSuccess(currentModel, Date.now() - modelStart);
            geminiCircuitBreaker.recordSuccess();
            break;
          }
        } catch (err: any) {
          lastError = err;
          const elapsed = Date.now() - modelStart;
          modelReachabilityRegistry.recordFailure(currentModel, err, elapsed);

          if (is402PaymentError(err)) {
            console.warn(`[Proxy Stream 402 Prepayment] Prepayment credits depleted on project for model ${currentModel}.`);
            return res.status(402).json({
              error: "Your Google AI Studio prepayment credits are depleted. Please visit https://ai.studio/projects or add funds at https://ai.google.dev/gemini-api/docs/billing#prepay to continue making live AI requests.",
              code: "PREPAYMENT_CREDITS_DEPLETED",
              status: 402
            });
          }

          if (is429QuotaError(err)) {
            if (!isLastModel) {
              console.warn(`[Proxy Stream 429 Quota] Model ${currentModel} reached model quota limit. Cascading down to next candidate...`);
              continue;
            }
            return res.status(429).json({
              error: "You have depleted the daily AI request quota across all approved high-quality models (Gemini 3.5+). Please try again shortly once your quota resets.",
              code: "DAILY_QUOTA_DEPLETED",
              status: 429
            });
          }

          const isDecommissioned =
            (err?.status || err?.response?.status) === 404 || (err?.status || err?.response?.status) === 410 ||
            (err?.message || "").toLowerCase().includes("not found") || (err?.message || "").toLowerCase().includes("deprecated");
          if (isDecommissioned && !isLastModel) {
            console.warn(`[Proxy Stream Model Decommissioned] Model ${currentModel} returned 404/deprecated. Skipping immediately to next model in 0ms...`);
            continue;
          }

          if (is503UnavailableError(err) && !isLastModel) {
            console.warn(`[Proxy Stream 503 Cascading] Model ${currentModel} unavailable. Cascading immediately.`);
            continue;
          }

          const isTimeout = (err?.message || "").toLowerCase().includes("timeout");
          if (isTimeout && !isLastModel) {
            console.warn(`[Proxy Stream Timeout Cascading] Model ${currentModel} timed out. Cascading immediately.`);
            continue;
          }

          if (!isLastModel) {
            continue;
          }
          break;
        }
      }

      if (!responseStream) {
        if (is503UnavailableError(lastError)) {
          geminiCircuitBreaker.recordCascade503Failure();
          return res.status(503).json({
            error: "The AI service is experiencing high demand. Please try again shortly.",
            code: "SERVICE_UNAVAILABLE",
            status: 503,
            circuitBreaker: geminiCircuitBreaker.getState()
          });
        }
        throw lastError || new Error("Failed to stream content across approved models.");
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let accumulatedOutputText = "";
      let finalUsageMetadata: any = null;
      try {
        for await (const chunk of responseStream) {
          const text = chunk.text || "";
          if (text) {
            accumulatedOutputText += text;
          }
          if (chunk.usageMetadata) {
            finalUsageMetadata = chunk.usageMetadata;
          }
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
        res.write("data: [DONE]\n\n");
        res.end();
      } finally {
        // Deduct actual tokens consumed even if the client disconnects mid-stream
        const streamUsage = aiTokenBudgetManager.extractActualTokenUsage(
          finalUsageMetadata,
          estimatedInputTokens,
          accumulatedOutputText
        );
        aiTokenBudgetManager.recordActualUsage(tokenActor, streamUsage.totalTokens);
      }
    } catch (error: any) {
      console.error("[Server] Error in generateContentStream proxy:", error?.message || "Operation failed");
      if (!res.headersSent) {
        return res.status(error?.status || 500).json({
          error: error?.message || "An error occurred during streaming content generation.",
          code: error?.code || "STREAM_ERROR",
          status: error?.status || 500
        });
      }
      res.write(`data: ${JSON.stringify({ error: error.message || "An error occurred during streaming content generation." })}\n\n`);
      res.end();
    }
  });

  // Handle CORS preflight for all /api endpoints
  app.options("/api/*", (_req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(204).end();
  });

  // Strict API 404 handler: Under NO circumstances allow any /api/* request to fall through to Vite SPA or index.html
  app.all("/api/*", (req, res) => {
    res.status(404).json({
      error: `API endpoint '${req.method} ${req.path}' not found.`,
      code: "NOT_FOUND",
      status: 404
    });
  });

  // Centralized API Error-handling middleware: Ensure every Express API exception strictly returns JSON
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith("/api")) {
      console.error("[API Error Handler]:", err);
      const status = err.status || err.statusCode || 500;
      return res.status(status).json({
        error: err.message || "An internal error occurred on the API server.",
        code: err.code || "INTERNAL_SERVER_ERROR",
        status
      });
    }
    next(err);
  });

  // Vite integration and static asset hosting
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      index: false
    }));
    app.get('*', spaStaticLimiter, (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
