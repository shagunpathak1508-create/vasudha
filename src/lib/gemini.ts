// ─── Gemini Eco Coach ─────────────────────────────────────────────────────────
// Uses @google/generative-ai streaming API.
// Conversation history is persisted to localStorage (last 40 messages).

import {
  GoogleGenerativeAI,
  type GenerateContentStreamResult,
} from "@google/generative-ai";

const CHAT_HISTORY_KEY = "vasudha_coach_history";
const MAX_STORED_MESSAGES = 40;

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

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: number;
}

// ─── History persistence ──────────────────────────────────────────────────────

export function loadChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  const trimmed = messages.slice(-MAX_STORED_MESSAGES);
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
}

export function clearChatHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CHAT_HISTORY_KEY);
}

// ─── Gemini client ────────────────────────────────────────────────────────────

function getGeminiClient(): GoogleGenerativeAI {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "VITE_GEMINI_API_KEY is not set. Add it to your .env file.",
    );
  }
  return new GoogleGenerativeAI(key);
}

/**
 * Send a message to the Eco Coach and return a streaming result.
 * @param userMessage - The user's message text
 * @param history - Conversation history (for context)
 * @param userContext - Optional context string (score, top emission source)
 */
export async function sendEcoCoachMessage(
  userMessage: string,
  history: ChatMessage[],
  userContext?: string,
): Promise<GenerateContentStreamResult> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: userContext
      ? `${SYSTEM_PROMPT}\n\nUser context: ${userContext}`
      : SYSTEM_PROMPT,
  });

  // Convert our history format to Gemini's format
  const geminiHistory = history
    .slice(-16) // last 16 messages for context window
    .map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

  const chat = model.startChat({ history: geminiHistory });
  return chat.sendMessageStream(userMessage);
}

/**
 * Build a user context string from their profile for Gemini system prompt injection.
 */
export function buildUserContext(
  score: number,
  state: string,
  topSource: string,
  language: "en" | "hi",
): string {
  return `Vasudha Health Index: ${score}/100 | Earth State: ${state} | Top emission source: ${topSource} | Preferred language: ${language === "hi" ? "Hindi" : "English"}`;
}
