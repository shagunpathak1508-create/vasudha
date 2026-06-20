// ─── Firebase Service ─────────────────────────────────────────────────────────
// All Firestore interactions go through this module.
// Keys are read from VITE_* environment variables — never hardcoded.

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

// Guard: fail loudly in dev if env vars are missing rather than silently in prod
if (
  import.meta.env.DEV &&
  !import.meta.env.VITE_FIREBASE_API_KEY
) {
  console.error(
    "[Vasudha] VITE_FIREBASE_API_KEY is not set. " +
    "Copy .env.example to .env and fill in your Firebase credentials.",
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Singleton — safe for SSR / HMR
let app: FirebaseApp;
let db: Firestore;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export function getDB(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

// ─── Firestore document shapes ────────────────────────────────────────────────

export interface UserProfile {
  userId: string;
  createdAt: unknown; // serverTimestamp
  answers: OnboardingAnswers;
  profile: EarthProfile;
}

export interface ChallengeProgress {
  challengeId: string;
  joinedAt: unknown;
  daysCompleted: number;
  completed: boolean;
  completedAt?: unknown;
}

export interface ImpactHistoryEntry {
  recordedAt: unknown;
  score: number;
  state: string;
  answers: OnboardingAnswers;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

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

  const db = getDB();
  await setDoc(doc(db, "users", userId), {
    userId,
    createdAt: serverTimestamp(),
    answers,
    profile,
  } satisfies UserProfile);

  // Also push to history
  await addDoc(collection(db, "users", userId, "history"), {
    recordedAt: serverTimestamp(),
    score: profile.score,
    state: profile.state,
    answers,
  } satisfies ImpactHistoryEntry);
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const db = getDB();
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

// ─── Impact History ───────────────────────────────────────────────────────────

export async function getImpactHistory(
  userId: string,
  maxEntries = 30,
): Promise<ImpactHistoryEntry[]> {
  const db = getDB();
  const q = query(
    collection(db, "users", userId, "history"),
    orderBy("recordedAt", "desc"),
    limit(maxEntries),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ImpactHistoryEntry);
}

// ─── Challenges ───────────────────────────────────────────────────────────────

export async function joinChallenge(
  userId: string,
  challengeId: string,
): Promise<void> {
  const db = getDB();
  await setDoc(doc(db, "users", userId, "challenges", challengeId), {
    challengeId,
    joinedAt: serverTimestamp(),
    daysCompleted: 0,
    completed: false,
  } satisfies ChallengeProgress);
}

export async function updateChallengeProgress(
  userId: string,
  challengeId: string,
  daysCompleted: number,
): Promise<void> {
  const db = getDB();
  const completed = daysCompleted >= 7;
  await updateDoc(doc(db, "users", userId, "challenges", challengeId), {
    daysCompleted,
    completed,
    ...(completed ? { completedAt: serverTimestamp() } : {}),
  });
}

export async function getChallengeProgress(
  userId: string,
): Promise<Record<string, ChallengeProgress>> {
  const db = getDB();
  const snap = await getDocs(
    collection(db, "users", userId, "challenges"),
  );
  const result: Record<string, ChallengeProgress> = {};
  snap.docs.forEach((d) => {
    result[d.id] = d.data() as ChallengeProgress;
  });
  return result;
}
