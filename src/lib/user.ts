// ─── User Identity ────────────────────────────────────────────────────────────
// Guest-based device ID (no auth required). Stored in localStorage.
// Swappable with Firebase Auth UID later without changing callers.

/** localStorage key for the persistent guest user ID. */
export const USER_ID_KEY = "vasudha_user_id";

/** localStorage key for the cached Earth profile object. */
export const PROFILE_CACHE_KEY = "vasudha_profile";

/** localStorage key for the cached onboarding answers object. */
export const ANSWERS_CACHE_KEY = "vasudha_answers";

function generateId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Return the current guest user ID from localStorage, creating and persisting
 * a new one if none exists. Safe to call on every render.
 *
 * @returns A stable string ID in the format `guest_<timestamp>_<random>`
 */
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

/**
 * Persist an Earth profile to localStorage for fast, offline-first reads.
 * Called after onboarding completes and after each profile update.
 *
 * @param profile - Any serialisable profile object (typically {@link EarthProfile})
 */
export function cacheProfile(profile: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
}

/**
 * Read the cached Earth profile from localStorage.
 * Returns `null` if no profile is stored or if the stored value is malformed.
 *
 * @template T - Expected profile shape (e.g. `EarthProfile`)
 * @returns The parsed profile object or `null`
 */
export function getCachedProfile<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Persist the user's onboarding answers to localStorage.
 * Called alongside {@link cacheProfile} after onboarding completes.
 *
 * @param answers - Any serialisable answers object (typically {@link OnboardingAnswers})
 */
export function cacheAnswers(answers: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ANSWERS_CACHE_KEY, JSON.stringify(answers));
}

/**
 * Read the cached onboarding answers from localStorage.
 * Returns `null` if no answers are stored or if the stored value is malformed.
 *
 * @template T - Expected answers shape (e.g. `OnboardingAnswers`)
 * @returns The parsed answers object or `null`
 */
export function getCachedAnswers<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ANSWERS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Remove the cached profile and answers from localStorage.
 * Useful for "reset" flows or testing. Does NOT remove the user ID.
 */
export function clearUserData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_CACHE_KEY);
  localStorage.removeItem(ANSWERS_CACHE_KEY);
}
