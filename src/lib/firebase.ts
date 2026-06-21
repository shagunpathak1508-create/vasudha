// ─── Firebase Service ─────────────────────────────────────────────────────────
// All Firestore interactions go through this module.
// Keys are read from VITE_* environment variables — never hardcoded.
//
// Production safety: every exported async function is wrapped so that
// if Firebase is misconfigured (missing env vars, network error, etc.)
// the app degrades gracefully instead of crashing.

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

import type { OnboardingAnswers, EarthProfile } from "./carbon";

// ─── Config ──────────────────────────────────────────────────────────────────

/** Environment variable keys required for Firebase to initialise. */
const REQUIRED_KEYS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

function checkFirebaseConfig(): boolean {
  const missing = REQUIRED_KEYS.filter(
    (key) => !import.meta.env[key],
  );
  if (missing.length > 0) {
    const ctx = import.meta.env.DEV ? "DEV" : "PROD";
    console.error(
      `[Vasudha/${ctx}] Firebase is misconfigured — missing env vars:\n` +
        missing.map((k) => `  • ${k}`).join("\n") +
        "\n\n" +
        (import.meta.env.DEV
          ? "  ➜ Copy .env.example to .env and fill in your Firebase credentials."
          : "  ➜ Set these as environment variables in your CI/hosting environment."),
    );
    return false;
  }
  return true;
}

/** True when all required env vars are present. Checked lazily once. */
let _configValid: boolean | null = null;
function isConfigValid(): boolean {
  if (_configValid === null) _configValid = checkFirebaseConfig();
  return _configValid;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ─── Singleton — safe for HMR ─────────────────────────────────────────────────

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (!isConfigValid()) return null;
  try {
    if (!app) {
      app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    }
    return app;
  } catch (err) {
    console.error("[Vasudha] Firebase initializeApp failed:", err);
    return null;
  }
}

/**
 * Returns the Firestore database instance, or `null` if Firebase is unavailable.
 * Safe to call repeatedly — uses a singleton pattern compatible with Vite HMR.
 */
export function getDB(): Firestore | null {
  if (!isConfigValid()) return null;
  try {
    if (!db) {
      const firebaseApp = getFirebaseApp();
      if (!firebaseApp) return null;
      db = getFirestore(firebaseApp);
    }
    return db;
  } catch (err) {
    console.error("[Vasudha] getFirestore failed:", err);
    return null;
  }
}

/**
 * Returns `true` when Firebase is fully configured and Firestore is reachable.
 * Use this to guard Firestore calls in UI components before attempting reads/writes.
 */
export function isFirebaseReady(): boolean {
  return isConfigValid() && getDB() !== null;
}

// ─── Firestore document shapes ────────────────────────────────────────────────

/** Firestore shape for a user's profile document stored at `users/{userId}`. */
export interface UserProfile {
  userId: string;
  /** Firestore server timestamp set at document creation. */
  createdAt: unknown;
  answers: OnboardingAnswers;
  profile: EarthProfile;
}

/** Firestore shape for a single challenge progress record at `users/{userId}/challenges/{challengeId}`. */
export interface ChallengeProgress {
  challengeId: string;
  /** Firestore server timestamp set when the user joined. */
  joinedAt: unknown;
  /** Number of days completed (0–7). */
  daysCompleted: number;
  /** Whether the challenge has been fully completed (daysCompleted >= 7). */
  completed: boolean;
  /** Firestore server timestamp set when the challenge was completed. Optional. */
  completedAt?: unknown;
}

/** Firestore shape for a single impact history entry at `users/{userId}/history/{docId}`. */
export interface ImpactHistoryEntry {
  /** Firestore server timestamp set when the snapshot was recorded. */
  recordedAt: unknown;
  /** Vasudha Health Index score at the time of this snapshot. */
  score: number;
  /** Earth state label at the time of this snapshot. */
  state: string;
  /** The onboarding answers that produced this snapshot. */
  answers: OnboardingAnswers;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

/**
 * Save (or overwrite) a user's profile in Firestore and append an impact history entry.
 * Silently no-ops if Firestore is unavailable — the app must continue working offline.
 *
 * @param userId - Unique guest or auth user ID
 * @param answers - The user's onboarding answers
 * @param profile - The computed Earth profile for this user
 */
export async function saveUserProfile(
  userId: string,
  answers: OnboardingAnswers,
  profile: EarthProfile,
): Promise<void> {
  // Input validation
  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    console.warn("[Vasudha] saveUserProfile: invalid userId, skipping Firestore write.");
    return;
  }
  if (!answers || !profile) {
    console.warn("[Vasudha] saveUserProfile: missing answers or profile, skipping write.");
    return;
  }

  const database = getDB();
  if (!database) {
    console.warn("[Vasudha] saveUserProfile: Firestore unavailable, skipping write.");
    return;
  }

  try {
    await setDoc(doc(database, "users", userId), {
      userId,
      createdAt: serverTimestamp(),
      answers,
      profile,
    } satisfies UserProfile);

    // Also push to history
    await addDoc(collection(database, "users", userId, "history"), {
      recordedAt: serverTimestamp(),
      score: profile.score,
      state: profile.state,
      answers,
    } satisfies ImpactHistoryEntry);
  } catch (err) {
    console.error("[Vasudha] saveUserProfile: Firestore write failed:", err);
    // Don't re-throw — app must continue working even if Firestore is down
  }
}

/**
 * Fetch a user's profile from Firestore.
 *
 * @param userId - Unique guest or auth user ID
 * @returns The {@link UserProfile} document, or `null` if not found or Firestore unavailable
 */
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const database = getDB();
  if (!database) {
    console.warn("[Vasudha] getUserProfile: Firestore unavailable.");
    return null;
  }
  try {
    const snap = await getDoc(doc(database, "users", userId));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (err) {
    console.error("[Vasudha] getUserProfile: Firestore read failed:", err);
    return null;
  }
}

// ─── Impact History ───────────────────────────────────────────────────────────

/**
 * Fetch the user's impact history from Firestore, ordered newest first.
 *
 * @param userId - Unique guest or auth user ID
 * @param maxEntries - Maximum number of history entries to return (default: 30)
 * @returns Array of {@link ImpactHistoryEntry} records, or empty array on error
 */
export async function getImpactHistory(
  userId: string,
  maxEntries = 30,
): Promise<ImpactHistoryEntry[]> {
  const database = getDB();
  if (!database) {
    console.warn("[Vasudha] getImpactHistory: Firestore unavailable.");
    return [];
  }
  try {
    const q = query(
      collection(database, "users", userId, "history"),
      orderBy("recordedAt", "desc"),
      limit(maxEntries),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ImpactHistoryEntry);
  } catch (err) {
    console.error("[Vasudha] getImpactHistory: Firestore read failed:", err);
    return [];
  }
}

// ─── Challenges ───────────────────────────────────────────────────────────────

/**
 * Record that a user has joined a challenge in Firestore.
 * Sets daysCompleted to 0 and completed to false.
 *
 * @param userId - Unique guest or auth user ID
 * @param challengeId - The challenge identifier (e.g. "plant_based_week")
 */
export async function joinChallenge(
  userId: string,
  challengeId: string,
): Promise<void> {
  const database = getDB();
  if (!database) {
    console.warn("[Vasudha] joinChallenge: Firestore unavailable.");
    return;
  }
  try {
    await setDoc(doc(database, "users", userId, "challenges", challengeId), {
      challengeId,
      joinedAt: serverTimestamp(),
      daysCompleted: 0,
      completed: false,
    } satisfies ChallengeProgress);
  } catch (err) {
    console.error("[Vasudha] joinChallenge: Firestore write failed:", err);
  }
}

/**
 * Update the number of days completed for a challenge.
 * Automatically marks the challenge as completed when daysCompleted reaches 7.
 *
 * @param userId - Unique guest or auth user ID
 * @param challengeId - The challenge identifier
 * @param daysCompleted - New completed day count (0–7)
 */
export async function updateChallengeProgress(
  userId: string,
  challengeId: string,
  daysCompleted: number,
): Promise<void> {
  const database = getDB();
  if (!database) {
    console.warn("[Vasudha] updateChallengeProgress: Firestore unavailable.");
    return;
  }
  try {
    const completed = daysCompleted >= 7;
    await updateDoc(doc(database, "users", userId, "challenges", challengeId), {
      daysCompleted,
      completed,
      ...(completed ? { completedAt: serverTimestamp() } : {}),
    });
  } catch (err) {
    console.error("[Vasudha] updateChallengeProgress: Firestore write failed:", err);
  }
}

/**
 * Fetch all challenge progress records for a user.
 *
 * @param userId - Unique guest or auth user ID
 * @returns Record mapping challengeId → {@link ChallengeProgress}, or empty object on error
 */
export async function getChallengeProgress(
  userId: string,
): Promise<Record<string, ChallengeProgress>> {
  const database = getDB();
  if (!database) {
    console.warn("[Vasudha] getChallengeProgress: Firestore unavailable.");
    return {};
  }
  try {
    const snap = await getDocs(
      collection(database, "users", userId, "challenges"),
    );
    const result: Record<string, ChallengeProgress> = {};
    snap.docs.forEach((d) => {
      result[d.id] = d.data() as ChallengeProgress;
    });
    return result;
  } catch (err) {
    console.error("[Vasudha] getChallengeProgress: Firestore read failed:", err);
    return {};
  }
}
