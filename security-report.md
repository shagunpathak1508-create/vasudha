# Vasudha Security Audit Report

## 1. Environment Variable Management
- **Issue identified**: The `.env` file contained live, production API keys for Firebase and Google Gemini committed to the repository.
- **Action taken**: Verified that `.env`, `.env.local`, and `.env.production` are properly ignored in `.gitignore`.
- **Action taken**: Created a `.env.example` template with placeholder values to guide new developers safely without exposing keys.
- **Recommendation**: The current keys (Firebase API Key and Gemini API Key) must be rotated immediately via the Google Cloud / Firebase and Google AI Studio consoles.

## 2. API Key Guardrails
- **Issue identified**: Missing environment variables would cause silent failures or unhandled exceptions in production.
- **Action taken**: Implemented an explicit startup guard in `src/lib/firebase.ts` that fails loudly in development mode if `VITE_FIREBASE_API_KEY` is missing, providing clear developer guidance.

## 3. Firebase Database Security
- **Issue identified**: `saveUserProfile` lacked input validation, potentially allowing empty or malformed user IDs to corrupt the Firestore collection structure.
- **Action taken**: Implemented strict input validation on `userId`, `answers`, and `profile` objects before executing any `setDoc` or `addDoc` operations. The function now safely skips and warns on invalid inputs.

## 4. Gemini API Protection
- **Issue identified**: The `sendEcoCoachMessage` function was vulnerable to rapid, repeated calls (spamming), which could quickly exhaust Gemini API quotas and incur costs.
- **Action taken**: Implemented a client-side rate limiter (1.5-second debounce) to reject spam clicks and enforce a healthy chat cadence.

*Audit completed successfully.*
