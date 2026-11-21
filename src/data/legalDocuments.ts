export interface LegalDocument {
  title: string;
  lastUpdated: string;
  effectiveDate: string;
  sections: {
    id: string;
    heading: string;
    content: string;
  }[];
}

/**
 * Centralized Legal & Identity Configuration
 * All operator and contact details are defined here.
 * Note: Formal company incorporation is pending founder registration.
 */
export const LEGAL_CONFIG = {
  APP_NAME: "Talky Bean",
  OPERATOR_LABEL: "The Operator of Talky Bean (independent software venture; corporate entity registration pending)",
  IS_REGISTERED_COMPANY: false,
  CONTACT_PORTAL_NOTE: "Users may submit inquiries, support tickets, and legal/data requests directly through the authenticated in-app Help & Support Portal (Settings > Help & Support). Direct public email support will be announced upon official domain mailbox activation.",
  EFFECTIVE_DATE: "October 10, 2026",
  LAST_UPDATED: "October 10, 2026"
};

export const TERMS_AND_CONDITIONS: LegalDocument = {
  title: "Terms and Conditions of Service",
  lastUpdated: LEGAL_CONFIG.LAST_UPDATED,
  effectiveDate: LEGAL_CONFIG.EFFECTIVE_DATE,
  sections: [
    {
      id: "intro",
      heading: "1. Acceptance of Terms & Adult-Only Eligibility (18+)",
      content: `Welcome to Talky Bean ("Talky Bean", "the Service", "the App", "we", "us", or "our"), an independent educational technology application operated by its founder ("the Operator"). Formal private limited company incorporation is currently pending.

By creating an account, accessing, downloading, or using the Talky Bean web application, native mobile applications (iOS and Android), or any associated services, you ("User", "you") confirm that you have read, understood, and agreed to be bound by these Terms and Conditions ("Terms") and our Privacy Policy. If you do not agree to these Terms, you must not access or use Talky Bean.

STRICT ADULT-ONLY ELIGIBILITY (18+):
Talky Bean utilizes advanced generative artificial intelligence models to deliver interactive language learning. Due to the generative nature of AI dialogue, Talky Bean is exclusively intended for adult learners. You must be at least 18 years of age to register an account or use Talky Bean. Access by individuals under the age of 18 is strictly prohibited. By registering or confirming your age, you represent and warrant that you are at least 18 years old.`
    },
    {
      id: "service-description",
      heading: "2. Description of the Service & Educational Scope",
      content: `Talky Bean is an interactive, artificial intelligence-assisted language learning and fluency companion. The Service provides adult language learners with interactive speaking exercises, simulated conversational roleplays, listening comprehension modules, vocabulary library tracking, grammatical analysis, and pronunciation practice across supported languages.

IMPORTANT DISCLAIMER:
Talky Bean is strictly an educational self-study and fluency practice tool. Talky Bean DOES NOT provide medical, legal, psychological, accredited academic, certified professional, or emergency advice. While Talky Bean incorporates structured exam-preparation reference levels (such as Goethe-Institut, DELE, DELF, IELTS, or JLPT level approximations), Talky Bean is NOT affiliated with, endorsed by, or accredited by any official examination board, government body, or testing authority.`
    },
    {
      id: "user-accounts",
      heading: "3. User Accounts, Authentication & Security",
      content: `To access cloud synchronization, premium learning features, and personalized learning histories, you may create an account using email/password authentication or supported third-party identity providers (such as Google Sign-In or Sign in with Apple where configured).

You agree to:
a. Provide accurate, current, and complete registration information.
b. Confirm that you meet the minimum age requirement of 18 years.
c. Maintain the confidentiality and security of your account credentials.
d. Promptly report any unauthorized access or security breach involving your account via our in-app Help & Support Portal.
e. Accept responsibility for all activities occurring under your account credentials.

We reserve the right to suspend or terminate accounts that violate these Terms or are accessed by users under 18 years of age.`
    },
    {
      id: "ai-disclaimer",
      heading: "4. Generative AI Processing & Google Gemini Transparency",
      content: `Talky Bean incorporates generative artificial intelligence models (powered by Google Gemini via secure server-side API integration) and automated speech recognition engines to deliver real-time interactive dialogues, grammatical corrections, and conversation feedback.

By using Talky Bean, you acknowledge and agree that:
a. Third-Party AI Processing: To generate spoken replies, grammar tips, and fluency evaluations, conversation transcripts, learning level, and lesson prompts are transmitted to Google Gemini via our secure backend. Google processes this information under its applicable API terms of service.
b. Inherent AI Limitations: Artificial intelligence models may occasionally generate inaccurate, incomplete, colloquial, or unintended outputs (commonly referred to as "hallucinations" or errors).
c. Not Professional Translation or Accreditation: The responses, corrections, and fluency ratings provided by the AI companion are automated assessments designed for informal practice and should not be relied upon as certified human translations or academic grading.
d. Responsible Conduct: You must not deliberately prompt, manipulate, or attempt to 'jailbreak' the AI companion into generating unlawful, defamatory, sexually explicit, abusive, or harmful material.`
    },
    {
      id: "voice-microphone",
      heading: "5. Voice Conversations, Speech Recognition & Microphone Permissions",
      content: `To enable voice conversations and pronunciation scoring, Talky Bean requests access to your device's microphone:
a. On-Device Speech Recognition: On native mobile devices and modern web browsers, speech recognition is conducted using on-device operating system APIs (such as iOS Speech Framework, Android SpeechRecognizer, or browser Web Speech API) to convert spoken words into text transcripts.
b. Text Processing: Spoken voice inputs are converted to text and transmitted as conversational prompts to our secure backend and AI processors. Talky Bean DOES NOT retain permanent raw audio recordings of your speech on its servers.
c. Revoking Permissions: You may disable microphone access at any time through your device or browser operating system settings; however, disabling microphone access will prevent voice-based speaking and fluency features from functioning.`
    },
    {
      id: "acceptable-use",
      heading: "6. Acceptable Use Policy & User Conduct",
      content: `You agree not to use Talky Bean for any unlawful, abusive, or disruptive purpose. Specifically, you agree that you will NOT:
a. Access or attempt to access the Service if you are under 18 years of age.
b. Reverse-engineer, decompile, disassemble, or extract source code, algorithms, or prompts from Talky Bean.
c. Use automated scrapers, bots, crawlers, or unauthorized scripts to extract data, vocabulary, audio assets, or system content.
d. Bypass, circumvent, or tamper with any rate limits, developer token limits, security rules, subscription verification logic, or digital rights management mechanisms.
e. Transmit any viruses, malicious code, malware, or Trojan horses.
f. Impersonate any person or entity, or falsely claim affiliation with Talky Bean or any third party.
g. Use the Service to generate hate speech, harassment, sexually explicit content, violent threats, or illegal solicitation.
h. Share, resell, or distribute paid subscription passes or developer whitelist privileges to third parties without authorization.`
    },
    {
      id: "subscriptions-billing",
      heading: "7. Subscriptions, Free Trials, Billing & Payment Providers",
      content: `Talky Bean offers free features, promotional trial access, and auto-renewing paid subscription tiers ("Pro Membership"):

a. 14-Day Free Trial:
New users may activate a 14-day risk-free promotional Pro trial without credit card requirement on supported platforms. One free trial is permitted per individual and hardware device. Upon conclusion of the 14-day trial period, access to Pro features will discontinue unless you activate a paid subscription.

b. Payment Gateways & Store Platforms:
Payments are processed securely through authoritative third-party payment gateways depending on the platform through which you subscribe:
- Web: Processed securely via Dodo Payments (complying with applicable payment regulations and e-mandate guidelines).
- Android: Processed securely via Google Play In-App Billing (managed via RevenueCat).
- iOS: Processed securely via Apple App Store In-App Purchases / StoreKit (managed via RevenueCat).
Talky Bean never collects or stores your complete debit card, credit card, or bank account numbers directly on its servers.

c. In-App Pricing & Automatic Renewal:
Applicable subscription prices and billing intervals (monthly or annual) are displayed clearly in the in-app subscription paywall prior to purchase, with regional currency options where supported. Subscriptions automatically renew at the end of each billing cycle unless canceled at least 24 hours before the end of the current billing period.

d. Cancellation & Refund Policy:
- Web Subscriptions (Dodo Payments): You may cancel auto-renewal at any time from your Talky Bean Settings or via the payment receipt customer portal. Specific refund policies for web purchases are subject to statutory consumer protection laws and operator review upon ticket submission.
- Apple App Store Subscriptions: Apple manages all billing, renewals, and refunds for subscriptions purchased through iOS. You must manage or cancel your subscription directly in your Apple ID Settings. Refund requests must be submitted directly to Apple at reportaproblem.apple.com.
- Google Play Subscriptions: Google manages all billing and renewals for Android subscriptions. You must manage or cancel your subscription in the Google Play Store. Refund requests must comply with Google Play refund guidelines.

e. Purchase Restoration:
If you replace your device or reinstall the App, you may restore existing valid purchases using the "Restore Purchases" button in the Paywall or Settings modal.`
    },
    {
      id: "intellectual-property",
      heading: "8. Intellectual Property & User Content",
      content: `a. Talky Bean Ownership: All software, trademarks, logos, interface designs, graphic elements, curricula, audio exercises, algorithms, and documentation are the intellectual property of the Operator of Talky Bean and its licensors, protected by applicable copyright, trademark, and trade secret laws.
b. Limited License: We grant you a personal, non-exclusive, non-transferable, revocable license to access and use Talky Bean strictly for your personal, non-commercial educational purposes in accordance with these Terms.
c. User-Submitted Content: You retain ownership of any text notes, customized vocabulary lists, or profile avatar images you submit to the App ("User Content"). By submitting User Content, you grant Talky Bean a worldwide, royalty-free license to store, process, and display that content solely for the purpose of delivering the Service to you.`
    },
    {
      id: "account-deletion",
      heading: "9. Account Deletion & Termination",
      content: `a. Self-Service In-App Deletion: In compliance with Apple App Store Guideline 5.1.1(v) and Google Play policy, you may permanently delete your account and associated cloud data at any time directly inside the App by navigating to Settings > Data & Privacy Management > Delete Account.
b. External Web Deletion: If you have uninstalled the app or cannot access your device, you may delete your account directly at the web route /delete-account by verifying your account credentials.
c. Effects of Deletion: Upon confirmation, your Firebase Authentication identity, Firestore user profile, learning history, vocabulary records, and stored files in Firebase Storage are permanently deleted from our primary production databases.
d. App Store / Google Play Subscription Notice: Deleting your Talky Bean account DOES NOT automatically cancel an active auto-renewing subscription managed by Apple App Store or Google Play. You MUST cancel your subscription in your Apple or Google account settings to prevent future recurring charges from the store.
e. Termination by Us: We reserve the right to suspend or terminate your access to Talky Bean immediately and without prior notice if you breach these Terms or engage in fraudulent or abusive conduct.`
    },
    {
      id: "support-complaints",
      heading: "10. Customer Support & Complaints Portal",
      content: `Talky Bean maintains an integrated, authenticated customer support and complaint ticketing portal inside the application (accessible via Settings > Help & Support / Register a Complaint).

When you register a complaint or inquiry:
a. A unique ticket tracking ID is generated on the server.
b. You can monitor the progress, review support responses, and submit follow-up messages within the portal.
c. Customer support tickets are managed directly by the operator. Please do not submit passwords, complete credit card numbers, or unnecessary personal documentation within complaint descriptions.`
    },
    {
      id: "disclaimers-liability",
      heading: "11. Disclaimers of Warranties & Limitation of Liability",
      content: `a. "As-Is" Warranty: Talky Bean is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express, statutory, or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, or accuracy of AI outputs.
b. Limitation of Liability: To the maximum extent permitted by applicable law, in no event shall the Operator of Talky Bean, affiliates, or licensors be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or examination failure, arising out of or related to your use of or inability to use Talky Bean.
c. Aggregate Cap: To the extent permitted by law, our total aggregate liability for any and all claims arising from these Terms or the Service shall not exceed the amount actually paid by you to Talky Bean during the twelve (12) months preceding the event giving rise to liability.`
    },
    {
      id: "modifications",
      heading: "12. Modifications to Terms & Contact",
      content: `We reserve the right to modify these Terms at any time. When we make material changes, we will update the "Last Updated" date at the top of this document and notify users through an in-app notice or website banner. Continued use of Talky Bean following notice of modifications constitutes your binding acceptance of the updated Terms.

Contact & Support:
Users can submit support inquiries, data requests, or complaints directly through the in-app Help & Support Portal (Settings > Help & Support).`
    }
  ]
};

export const PRIVACY_POLICY: LegalDocument = {
  title: "Privacy Policy",
  lastUpdated: LEGAL_CONFIG.LAST_UPDATED,
  effectiveDate: LEGAL_CONFIG.EFFECTIVE_DATE,
  sections: [
    {
      id: "privacy-intro",
      heading: "1. Overview & Data Controller",
      content: `Talky Bean ("we", "us", "our") is dedicated to safeguarding your personal privacy and protecting the information you share while practicing language skills. This Privacy Policy explains how personal data is collected, processed, stored, and deleted when you interact with the Talky Bean web and mobile applications.

Data Controller / Operator:
Talky Bean is operated by an independent founder ("the Operator"). Corporate registration is currently pending.
Contact & Inquiries: Users may submit privacy inquiries and data requests through the authenticated in-app Help & Support Portal (Settings > Help & Support).`
    },
    {
      id: "adult-eligibility",
      heading: "2. Adult-Only Platform (18+) & Children's Privacy",
      content: `Talky Bean is exclusively designed and operated for adult users aged 18 and older. We do not provide services to, or knowingly collect personal information from, children or minors under 18 years of age.

Age Confirmation:
Before registering an account or accessing generative AI learning modules, users must confirm they are at least 18 years old. If a user indicates they are under 18, registration and AI access are blocked, and no unnecessary information is collected from them. If we learn that personal data from an individual under 18 has been submitted, we will promptly delete that data.`
    },
    {
      id: "data-collection",
      heading: "3. Information We Collect",
      content: `We collect only the minimum personal information necessary to deliver language training and manage your account:

a. Account & Authentication Data:
- Registration: Email address, chosen display name, user avatar picture URL, unique Firebase Authentication identifier (UID), and account creation timestamp.
- 18+ Confirmation: Status and timestamp confirming adult eligibility.
- Third-Party Sign-In: Email address, display name, and public profile identifier authorized by you via Google or Apple sign-in where supported.

b. Learning Activity & Educational Progress:
- Selected target language (e.g., German, Spanish, English, French, etc.) and proficiency level (A1–C1).
- Custom vocabulary flashcards, saved word lists, example sentences, and mastery scores.
- Daily practice streaks, completed grammar modules, comprehension quiz results, and roleplay scenario history.

c. Audio, Microphone & Spoken Inputs:
- Microphone Permission: Used solely during active speaking sessions to capture speech audio.
- Speech-to-Text Transcripts: Spoken voice inputs are processed through device-native or browser speech recognition APIs into text transcripts. Talky Bean DOES NOT retain permanent raw audio recordings of your speech on its servers. Only text transcripts and calculated fluency scores are saved to your study records.

d. Technical & Device Diagnostics:
- Device type, operating system version (iOS, Android, macOS, Windows, Linux), browser user-agent, and hardware trial validation identifiers (used solely to prevent multi-account free trial fraud).

e. Payment & Subscription Records:
- Active subscription status, billing interval, renewal dates, and payment processor transaction IDs (e.g., RevenueCat entitlement IDs, Dodo Payments customer references). Full payment card numbers are never received or stored on Talky Bean servers.

f. Customer Support & Complaints Data:
- When you submit a complaint or ticket through our Help & Support Portal: Subject, category, description, optional order reference, timestamp, and message history.`
    },
    {
      id: "processing-purposes",
      heading: "4. Legal Bases & Purposes for Processing",
      content: `We process personal data under the following legal bases:
a. Performance of a Contract: To provide language learning features, manage your account, authenticate sessions, track your educational progress, and deliver Pro subscription entitlements.
b. Legitimate Interests: To improve AI conversational responses, monitor app stability, resolve customer complaints, prevent trial fraud, and ensure infrastructure security.
c. Consent: For microphone audio access during voice interactions (which you may grant or revoke at any time in device settings) and age confirmation.
d. Legal Compliance: To comply with statutory tax, financial auditing, and consumer protection requirements (such as GST invoice records and payment audit trails).`
    },
    {
      id: "third-party-subprocessors",
      heading: "5. Third-Party Service Providers & Subprocessors",
      content: `We partner with trusted third-party cloud and technology providers to deliver Talky Bean. Each provider is bound by strict confidentiality and data protection standards:

1. Google Cloud Platform & Firebase (Google LLC):
- Services: Firebase Authentication, Cloud Firestore (database), Cloud Storage (user uploads), and Cloud Run (server hosting).
- Location: Global / Cloud infrastructure with enterprise-grade encryption at rest and in transit.

2. Google Gemini Generative AI (Google LLC):
- Purpose: Generates conversational responses, grammar tips, and fluency evaluations.
- Data Transmitted: User prompt text, speech-to-text transcripts, target language, and level context.
- Service Terms: Google processes this information under applicable Google Gemini API terms. Talky Bean does not control Google's independent processing outside its own systems. We do not intentionally send passwords, authentication tokens, or credit card numbers to Gemini.

3. RevenueCat (RevenueCat, Inc.):
- Purpose: Native in-app purchase validation, store receipt verification, and entitlement synchronization across iOS and Android.

4. Dodo Payments:
- Purpose: Web subscription checkout, recurring billing, and invoicing.

5. Apple (Apple Inc.) & Google (Google LLC):
- Purpose: In-app billing processing on iOS (StoreKit) and Android (Google Play Billing), as well as optional single sign-on.

6. On-Device / Browser Speech Engines:
- Web Speech API and Apple/Android Native Speech Recognizers for converting spoken voice to text.`
    },
    {
      id: "data-retention-deletion",
      heading: "6. Data Retention, Account Deletion & Retained Records",
      content: `a. General Retention: We retain your account data and learning progress for as long as your account remains active.

b. Self-Service Account & Data Deletion:
You have the right to permanently delete your account and personal data at any time:
- In-App: Settings > Data & Privacy Management > Delete Account.
- Web: Accessible at /delete-account by authenticating your account credentials.
- Result: Our server immediately purges your Firebase Authentication credentials, deletes your root Firestore user profile, subcollections (settings, progress, vocabulary, fluency stats), user-owned file metadata records, and deletes files stored in Firebase Storage (under uploads/{uid}/ and avatars/{uid}/).

c. Disclosed Retained Records (Lawful Exceptions):
Upon account deletion, the following minimal records are retained under legitimate anti-fraud and statutory legal exceptions:
1. Anti-Trial-Fraud Hardware Records: Hardware trial identifiers in /used_device_trials/{deviceId} are retained to prevent multi-account free trial cycling abuse.
2. Financial & Tax Records: Completed transaction logs in payment_audit_logs are retained solely for statutory tax (GST/VAT) compliance and auditing obligations.
3. Customer Complaints: Closed complaint tickets may be retained with personal identifiers removed or minimized for dispute defense and audit purposes.

d. Your Legal Rights:
Subject to applicable law, you have the right to access, rectify, or request erasure of your personal data. You can exercise these rights directly through the in-app deletion tools or by submitting a ticket via our Help & Support Portal.`
    },
    {
      id: "security-measures",
      heading: "7. Data Security & International Transfers",
      content: `We implement robust technical and organizational security measures to protect your information:
- All data in transit is encrypted using modern TLS (HTTPS) cryptographic protocols.
- Cloud database and storage systems enforce strict, role-based security rules (user-isolated read/write rules).
- Sensitive server operations (such as token validation, subscription updates, and administrative reviews) are handled exclusively via verified server-side Admin SDKs.
- Where personal data is transferred across international borders, standard contractual clauses and cloud security safeguards apply.`
    },
    {
      id: "policy-updates",
      heading: "8. Changes to This Privacy Policy & Contact",
      content: `We may update this Privacy Policy from time to time to reflect operational, legal, or regulatory changes. When updates occur, we will revise the "Last Updated" date at the top of this document.

For privacy-related inquiries, data requests, or concerns:
Submit a ticket directly through the in-app Help & Support Portal (Settings > Help & Support).`
    }
  ]
};
