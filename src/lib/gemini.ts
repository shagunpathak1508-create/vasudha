// ─── Gemini Eco Coach ─────────────────────────────────────────────────────────
// Uses @google/generative-ai streaming API.
// Conversation history is persisted to localStorage (last 40 messages).

import {
  GoogleGenerativeAI,
  type GenerateContentStreamResult,
} from "@google/generative-ai";

/** localStorage key for persisting chat history. */
export const CHAT_HISTORY_KEY = "vasudha_coach_history";

/** Maximum number of messages retained in localStorage. */
export const MAX_STORED_MESSAGES = 40;

const SYSTEM_PROMPT = `You are Vasudha Eco Coach — a warm, knowledgeable sustainability companion built into the Vasudha app.

Your personality:
- Encouraging, never guilt-inducing
- Practical and realistic — you suggest achievable actions
- Educational without being preachy
- Culturally aware of Indian lifestyle contexts
- Positive and celebratory of small wins

Your capabilities:
- Personalized carbon footprint advice
- Sustainable lifestyle recommendations for Indian households
- Guidance on public transport, vegetarian cooking, energy saving, recycling
- Explaining climate concepts in simple, accessible language
- Responding fluently in both English and Hindi

Rules:
- Keep responses concise (2–4 paragraphs max)
- Always end with one specific, actionable next step
- Never use guilt or fear-based language
- If asked about politics, redirect to personal action
- If asked something outside sustainability, gently steer back`;

/** A single message in the Eco Coach conversation. */
export interface ChatMessage {
  /** Who sent this message — "user" or the AI "model". */
  role: "user" | "model";
  /** The message text content. */
  text: string;
  /** Unix timestamp (ms) when the message was created. */
  timestamp: number;
}

// ─── History persistence ──────────────────────────────────────────────────────

/**
 * Load the Eco Coach chat history from localStorage.
 * Returns an empty array if no history exists or if the stored data is malformed.
 *
 * @returns Array of {@link ChatMessage} records
 */
export function loadChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

/**
 * Persist the Eco Coach chat history to localStorage.
 * Trims to the most recent {@link MAX_STORED_MESSAGES} messages to control storage size.
 *
 * @param messages - The full conversation history to persist
 */
export function saveChatHistory(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  const trimmed = messages.slice(-MAX_STORED_MESSAGES);
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
}

/**
 * Delete the Eco Coach chat history from localStorage.
 * Exposed for the "Clear chat" button in the Coach UI.
 */
export function clearChatHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CHAT_HISTORY_KEY);
}

// ─── Gemini client ────────────────────────────────────────────────────────────

/**
 * Returns a configured Gemini client, or `null` if the API key is not set.
 * Logs a clear warning in both DEV and PROD environments when the key is missing.
 */
function getGeminiClient(): GoogleGenerativeAI | null {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    const ctx = import.meta.env.DEV ? "DEV" : "PROD";
    console.warn(
      `[Vasudha/${ctx}] VITE_GEMINI_API_KEY is not set — Eco Coach will be unavailable.`,
    );
    return null;
  }
  try {
    return new GoogleGenerativeAI(key);
  } catch (err) {
    console.error("[Vasudha] Failed to create Gemini client:", err);
    return null;
  }
}

/**
 * Returns `true` when the Gemini API key is configured and the client can be created.
 * Use this to conditionally render the Eco Coach UI.
 */
export function isGeminiAvailable(): boolean {
  return getGeminiClient() !== null;
}

let lastRequestTime = 0;
/** Minimum milliseconds between Eco Coach API calls (rate-limit debounce). */
const RATE_LIMIT_MS = 1500;

/**
 * Send a message to the Eco Coach and return a streaming result.
 * Injects the user's profile context into the system prompt when provided.
 * Enforces a {@link RATE_LIMIT_MS} debounce between requests.
 *
 * @param userMessage - The user's message text
 * @param history - Conversation history for multi-turn context
 * @param userContext - Optional context string containing score, Earth state, and top emission source
 * @returns A streaming {@link GenerateContentStreamResult} to iterate over
 * @throws When the Gemini key is missing, the rate limit is hit, or the API call fails
 */
export async function sendEcoCoachMessage(
  userMessage: string,
  history: ChatMessage[],
  userContext?: string,
): Promise<GenerateContentStreamResult> {
  const now = Date.now();
  if (now - lastRequestTime < RATE_LIMIT_MS) {
    throw new Error("Eco Coach is thinking... Please wait a moment before sending another message.");
  }
  lastRequestTime = now;

  const genAI = getGeminiClient();
  if (!genAI) {
    throw new Error(
      "Eco Coach is currently unavailable. The AI service is not configured. " +
        "Please contact the app administrator.",
    );
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: userContext
      ? `${SYSTEM_PROMPT}\n\nUser context: ${userContext}`
      : SYSTEM_PROMPT,
  });

  // Convert our history format to Gemini's format (last 16 messages for context window)
  const geminiHistory = history
    .slice(-16)
    .map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

  const chat = model.startChat({ history: geminiHistory });
  return chat.sendMessageStream(userMessage);
}

/**
 * Build a concise user context string for injection into the Gemini system prompt.
 *
 * @param score - The user's current Vasudha Health Index (0–100)
 * @param state - The user's current Earth state label
 * @param topSource - Human-readable label of the user's top emission source
 * @param language - User's preferred language ("en" or "hi")
 * @returns A formatted context string ready for Gemini system prompt injection
 */
export function buildUserContext(
  score: number,
  state: string,
  topSource: string,
  language: "en" | "hi",
): string {
  return `Vasudha Health Index: ${score}/100 | Earth State: ${state} | Top emission source: ${topSource} | Preferred language: ${language === "hi" ? "Hindi" : "English"}`;
}
