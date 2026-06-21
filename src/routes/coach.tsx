import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, Leaf } from "lucide-react";
import { AppShell } from "@/components/vasudha/AppShell";
import { I18nProvider, useTranslation } from "@/lib/i18n";
import {
  sendEcoCoachMessage,
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
  buildUserContext,
  type ChatMessage,
} from "@/lib/gemini";
import { getCachedProfile } from "@/lib/user";
import type { EarthProfile } from "@/lib/carbon";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Eco Coach — Vasudha" },
      { name: "description", content: "Chat with Vasudha's AI Eco Coach for personalised, positive sustainability guidance in English or Hindi." },
    ],
  }),
  component: () => (
    <I18nProvider>
      <AppShell>
        <CoachPage />
      </AppShell>
    </I18nProvider>
  ),
});

// ─── Chat Bubble ──────────────────────────────────────────────────────────────
function ChatBubble({ msg }: { msg: ChatMessage & { streaming?: boolean } }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
          isUser ? "bg-secondary" : "bg-primary/40"
        }`}
        aria-hidden="true"
      >
        {isUser ? "🌍" : <Leaf className="h-4 w-4 text-accent" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-secondary/40 text-foreground"
            : "glass-card text-foreground"
        }`}
        role="article"
        aria-label={isUser ? "Your message" : "Eco Coach response"}
      >
        {msg.text}
        {(msg as ChatMessage & { streaming?: boolean }).streaming && (
          <span className="ml-1 inline-block animate-pulse text-accent">▋</span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Prompt Chips ─────────────────────────────────────────────────────────────
function PromptChips({ onSelect }: { onSelect: (text: string) => void }) {
  const { t } = useTranslation();
  const chips = [
    t("coach_prompt_1"),
    t("coach_prompt_2"),
    t("coach_prompt_3"),
    t("coach_prompt_4"),
  ];
  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Suggested prompts">
      {chips.map((chip) => (
        <button
          key={chip}
          role="listitem"
          onClick={() => onSelect(chip)}
          className="glass-card rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground hover:bg-white/10"
          aria-label={`Ask: ${chip}`}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

// ─── Coach Page ───────────────────────────────────────────────────────────────
function CoachPage() {
  const { t, lang } = useTranslation();
  const [messages, setMessages] = useState<(ChatMessage & { streaming?: boolean })[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const profile = getCachedProfile<EarthProfile>();

  // Load history on mount
  useEffect(() => {
    setMessages(loadChatHistory());
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const userContext = profile
    ? buildUserContext(profile.score, profile.state, profile.topSourceLabel, lang)
    : undefined;

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || sending) return;
      const userMsg: ChatMessage = { role: "user", text: text.trim(), timestamp: Date.now() };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setInput("");
      setSending(true);

      // Placeholder streaming message
      const botPlaceholder: ChatMessage & { streaming: boolean } = {
        role: "model",
        text: "",
        timestamp: Date.now() + 1,
        streaming: true,
      };
      setMessages([...updated, botPlaceholder]);

      try {
        const result = await sendEcoCoachMessage(text.trim(), messages, userContext);
        let full = "";
        for await (const chunk of result.stream) {
          full += chunk.text();
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { ...botPlaceholder, text: full };
            return copy;
          });
        }
        // Finalise
        const final: ChatMessage = { role: "model", text: full, timestamp: Date.now() };
        const finalMessages = [...updated, final];
        setMessages(finalMessages);
        saveChatHistory(finalMessages);
      } catch (err) {
        const errMsg: ChatMessage = {
          role: "model",
          text: "I'm having trouble connecting right now. Please check your Gemini API key in .env and try again.",
          timestamp: Date.now(),
        };
        const withErr = [...updated, errMsg];
        setMessages(withErr);
        saveChatHistory(withErr);
        console.error("Gemini error:", err);
      } finally {
        setSending(false);
      }
    },
    [messages, sending, userContext],
  );

  function handleClear() {
    clearChatHistory();
    setMessages([]);
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between border-b border-border/30 px-6 py-4"
        style={{ backdropFilter: "blur(12px)" }}
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">{t("nav_coach")}</p>
          <h1 className="font-display text-xl font-bold">{t("coach_title")}</h1>
          {profile && (
            <p className="text-xs text-muted-foreground">
              Index: {profile.score}/100 · Top issue: {profile.topSourceLabel}
            </p>
          )}
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition hover:text-destructive glass-card"
          aria-label="Clear chat history"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t("coach_clear")}
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-5 py-6 space-y-5"
        role="log"
        aria-live="polite"
        aria-label="Chat conversation"
      >
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 pt-12 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/30">
              <Leaf className="h-8 w-8 text-accent" />
            </div>
            <h2 className="font-display text-2xl font-bold">Meet Your Eco Coach</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{t("coach_subtitle")}</p>
            <PromptChips onSelect={send} />
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <ChatBubble key={`${msg.timestamp}-${i}`} msg={msg} />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Prompt chips (after first message) */}
      {messages.length > 0 && (
        <div className="border-t border-border/20 px-5 py-3">
          <PromptChips onSelect={send} />
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/30 px-5 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-3"
          aria-label="Chat input form"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("coach_placeholder")}
            disabled={sending}
            aria-busy={sending}
            className="flex-1 rounded-full bg-white/8 px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            aria-label="Message input"
            id="coach-input"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="glow-primary flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition hover:bg-accent disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
