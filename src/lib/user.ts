// ─── User Identity ────────────────────────────────────────────────────────────
// Guest-based device ID (no auth required). Stored in localStorage.
// Swappable with Firebase Auth UID later without changing callers.

const USER_ID_KEY = "vasudha_user_id";

function generateId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "ssr_placeholder";
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

// ─── Local profile cache (for SSR-safe reads without Firestore round-trip) ────

const PROFILE_CACHE_KEY = "vasudha_profile";
const ANSWERS_CACHE_KEY = "vasudha_answers";

export function cacheProfile(profile: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
}

export function getCachedProfile<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function cacheAnswers(answers: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ANSWERS_CACHE_KEY, JSON.stringify(answers));
}

export function getCachedAnswers<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ANSWERS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearUserData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_CACHE_KEY);
  localStorage.removeItem(ANSWERS_CACHE_KEY);
}
