// ─── Firebase Integration Tests ───────────────────────────────────────────────
// Uses vi.mock to isolate Firebase SDK calls.

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock Firebase modules ────────────────────────────────────────────────────

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({ name: "mock-app" })),
  getApps: vi.fn(() => []),
}));

const mocks = vi.hoisted(() => {
  const mockDoc = vi.fn((_db: unknown, ...path: string[]) => ({ path: path.join("/") }));
  const mockCollection = vi.fn((_db: unknown, ...path: string[]) => ({ path: path.join("/") }));
  return {
    mockSetDoc: vi.fn().mockResolvedValue(undefined),
    mockGetDoc: vi.fn(),
    mockAddDoc: vi.fn().mockResolvedValue({ id: "mock-history-id" }),
    mockUpdateDoc: vi.fn().mockResolvedValue(undefined),
    mockGetDocs: vi.fn(),
    mockDoc,
    mockCollection,
    mockQuery: vi.fn((ref: unknown) => ref),
    mockOrderBy: vi.fn(),
    mockLimit: vi.fn(),
    mockServerTimestamp: vi.fn(() => "__SERVER_TIMESTAMP__"),
  };
});

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({ type: "firestore" })),
  collection: mocks.mockCollection,
  doc: mocks.mockDoc,
  setDoc: mocks.mockSetDoc,
  getDoc: mocks.mockGetDoc,
  getDocs: mocks.mockGetDocs,
  addDoc: mocks.mockAddDoc,
  updateDoc: mocks.mockUpdateDoc,
  query: mocks.mockQuery,
  orderBy: mocks.mockOrderBy,
  limit: mocks.mockLimit,
  serverTimestamp: mocks.mockServerTimestamp,
}));

const {
  mockSetDoc,
  mockGetDoc,
  mockAddDoc,
  mockUpdateDoc,
  mockGetDocs,
  mockDoc,
  mockCollection,
  mockQuery,
  mockOrderBy,
  mockLimit,
  mockServerTimestamp
} = mocks;

// ─── Import after mock setup ──────────────────────────────────────────────────

import { saveUserProfile, getUserProfile, getImpactHistory, joinChallenge, updateChallengeProgress } from "../lib/firebase";
import type { OnboardingAnswers, EarthProfile } from "../lib/carbon";

const MOCK_ANSWERS: OnboardingAnswers = {
  transport: "public",
  food: "vegetarian",
  electricity: "average",
  shopping: "monthly",
  waste: "sometimes",
};

const MOCK_PROFILE: EarthProfile = {
  score: 68,
  state: "balanced",
  topSource: "transport",
  topSourceLabel: "Transportation",
  improvement: "Use public transport more often.",
  categoryScores: { transport: 85, food: 90, electricity: 65, shopping: 65, waste: 65 },
};

// ─── saveUserProfile ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockSetDoc.mockResolvedValue(undefined);
  mockAddDoc.mockResolvedValue({ id: "hist-1" });
  mockUpdateDoc.mockResolvedValue(undefined);
});

describe("saveUserProfile", () => {
  it("calls setDoc with user data", async () => {
    await saveUserProfile("user-123", MOCK_ANSWERS, MOCK_PROFILE);
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const [_docRef, data] = mockSetDoc.mock.calls[0];
    expect(data.userId).toBe("user-123");
    expect(data.answers).toEqual(MOCK_ANSWERS);
    expect(data.profile).toEqual(MOCK_PROFILE);
  });

  it("also writes to impact history via addDoc", async () => {
    await saveUserProfile("user-123", MOCK_ANSWERS, MOCK_PROFILE);
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const [_collRef, histData] = mockAddDoc.mock.calls[0];
    expect(histData.score).toBe(MOCK_PROFILE.score);
    expect(histData.state).toBe(MOCK_PROFILE.state);
  });

  it("includes serverTimestamp in user doc", async () => {
    await saveUserProfile("user-123", MOCK_ANSWERS, MOCK_PROFILE);
    const [_docRef, data] = mockSetDoc.mock.calls[0];
    expect(data.createdAt).toBe("__SERVER_TIMESTAMP__");
  });
});

// ─── getUserProfile ───────────────────────────────────────────────────────────

describe("getUserProfile", () => {
  it("returns null when document does not exist", async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => false });
    const result = await getUserProfile("nonexistent");
    expect(result).toBeNull();
  });

  it("returns profile data when document exists", async () => {
    const mockData = { userId: "user-abc", answers: MOCK_ANSWERS, profile: MOCK_PROFILE };
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => mockData,
    });
    const result = await getUserProfile("user-abc");
    expect(result).toEqual(mockData);
  });
});

// ─── getImpactHistory ─────────────────────────────────────────────────────────

describe("getImpactHistory", () => {
  it("returns empty array when no history", async () => {
    mockGetDocs.mockResolvedValueOnce({ docs: [] });
    const result = await getImpactHistory("user-123");
    expect(result).toHaveLength(0);
  });

  it("returns mapped history entries", async () => {
    const entry = { score: 65, state: "balanced", answers: MOCK_ANSWERS, recordedAt: "__TS__" };
    mockGetDocs.mockResolvedValueOnce({
      docs: [{ data: () => entry }],
    });
    const result = await getImpactHistory("user-123");
    expect(result).toHaveLength(1);
    expect(result[0].score).toBe(65);
  });
});

// ─── joinChallenge ────────────────────────────────────────────────────────────

describe("joinChallenge", () => {
  it("calls setDoc with correct challenge data", async () => {
    await joinChallenge("user-123", "challenge-veggie");
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const [_ref, data] = mockSetDoc.mock.calls[0];
    expect(data.challengeId).toBe("challenge-veggie");
    expect(data.daysCompleted).toBe(0);
    expect(data.completed).toBe(false);
  });
});

// ─── updateChallengeProgress ──────────────────────────────────────────────────

describe("updateChallengeProgress", () => {
  it("marks completed when daysCompleted >= 7", async () => {
    await updateChallengeProgress("user-123", "ch-1", 7);
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    const [_ref, data] = mockUpdateDoc.mock.calls[0];
    expect(data.completed).toBe(true);
    expect(data.completedAt).toBe("__SERVER_TIMESTAMP__");
  });

  it("does not mark completed when daysCompleted < 7", async () => {
    await updateChallengeProgress("user-123", "ch-1", 4);
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    const [_ref, data] = mockUpdateDoc.mock.calls[0];
    expect(data.completed).toBe(false);
    expect(data.completedAt).toBeUndefined();
  });
});
