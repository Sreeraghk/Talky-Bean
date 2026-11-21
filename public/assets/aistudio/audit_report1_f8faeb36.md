# Security Audit — Talky Bean

**Scope:** 35 files reviewed across three passes. **Nothing modified.**

**Two caveats on precision.** First, "our audit instructions" has never been in my context — I've used a Critical/High/Medium/Low scheme with impact-based rationale. If your document defines severity criteria or a report format, add it and I'll re-grade. Second, line numbers are exact for short files (`firestore.rules`, `storage.rules`, `vite.config.ts`, `vite-env.d.ts`, `capacitor.config.ts`, `firebase-applet-config.json`) and for `server.ts` lines 1–270. Deeper `server.ts` handlers are cited by route path plus verbatim snippet — confirm with `grep -n`.

**Bottom line:** six Critical findings, of which four are exploitable without any credentials. The pattern is consistent: security decisions are made from client-supplied or client-writable data, and several server-side checks fail open when configuration is at its documented default.

---

# CRITICAL

### C1 — `firestore.rules:28` — OTP documents world-readable
