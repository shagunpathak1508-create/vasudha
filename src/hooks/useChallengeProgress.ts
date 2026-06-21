/**
 * useChallengeProgress
 *
 * Reusable hook that manages challenge progress state and Firestore sync.
 * Encapsulates the pattern previously inlined in challenges.tsx, keeping the
 * UI component free from data-fetching concerns.
 *
 * Uses optimistic UI updates — state changes are applied immediately and then
 * persisted to Firestore asynchronously, so the UI never waits for the network.
 */

import { useState, useEffect, useRef } from "react";
import {
  joinChallenge,
  updateChallengeProgress,
  getChallengeProgress,
  type ChallengeProgress,
} from "@/lib/firebase";
import { getOrCreateUserId } from "@/lib/user";

/** Shape returned by the {@link useChallengeProgress} hook. */
export interface ChallengeProgressResult {
  /** Map of challengeId → {@link ChallengeProgress}. Empty until loaded. */
  progressMap: Record<string, ChallengeProgress>;
  /**
   * Optimistically join a challenge and persist to Firestore.
   * @param challengeId - The challenge identifier to join
   */
  handleJoin: (challengeId: string) => Promise<void>;
  /**
   * Optimistically update a challenge's day count and persist to Firestore.
   * @param challengeId - The challenge to update
   * @param days - New completed day count (0–7)
   */
  handleProgress: (challengeId: string, days: number) => Promise<void>;
  /** Number of challenges where `completed === true`. */
  completedCount: number;
  /** ID of the most recently completed challenge (cleared after 4 s). Used to trigger aria-live announcements. */
  recentlyCompletedId: string | null;
}

/**
 * Manages the full lifecycle of weekly eco challenge state:
 * loading from Firestore, optimistic UI updates, and persistence.
 *
 * @example
 * function ChallengesPage() {
 *   const { progressMap, handleJoin, handleProgress, completedCount } = useChallengeProgress();
 *   // ...
 * }
 */
export function useChallengeProgress(): ChallengeProgressResult {
  const [userId] = useState(() => getOrCreateUserId());
  const [progressMap, setProgressMap] = useState<Record<string, ChallengeProgress>>({});
  const [recentlyCompletedId, setRecentlyCompletedId] = useState<string | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load Firestore progress on mount
  useEffect(() => {
    getChallengeProgress(userId)
      .then(setProgressMap)
      .catch((err) => console.warn("[Vasudha] useChallengeProgress: Firestore read failed:", err));

    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [userId]);

  /**
   * Optimistically join a challenge. Creates a local progress entry immediately
   * and then fires the Firestore write in the background.
   */
  async function handleJoin(challengeId: string): Promise<void> {
    const entry: ChallengeProgress = {
      challengeId,
      joinedAt: new Date(),
      daysCompleted: 0,
      completed: false,
    };
    setProgressMap((prev) => ({ ...prev, [challengeId]: entry }));
    try {
      await joinChallenge(userId, challengeId);
    } catch (err) {
      console.warn("[Vasudha] useChallengeProgress: joinChallenge failed:", err);
    }
  }

  /**
   * Optimistically update the day count for a challenge. Marks as completed when
   * days >= 7 and briefly exposes `recentlyCompletedId` for aria-live announcements.
   */
  async function handleProgress(challengeId: string, days: number): Promise<void> {
    const prev = progressMap[challengeId];
    if (!prev) return;

    const completed = days >= 7;
    const updated: ChallengeProgress = { ...prev, daysCompleted: days, completed };
    setProgressMap((p) => ({ ...p, [challengeId]: updated }));

    // Signal badge earned for aria-live announcement
    if (completed && !prev.completed) {
      setRecentlyCompletedId(challengeId);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => setRecentlyCompletedId(null), 4000);
    }

    try {
      await updateChallengeProgress(userId, challengeId, days);
    } catch (err) {
      console.warn("[Vasudha] useChallengeProgress: updateChallengeProgress failed:", err);
    }
  }

  const completedCount = Object.values(progressMap).filter((p) => p.completed).length;

  return { progressMap, handleJoin, handleProgress, completedCount, recentlyCompletedId };
}
