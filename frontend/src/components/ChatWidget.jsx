import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import {
  MessageCircle,
  X,
  Send,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Bot,
  User,
  AlertCircle,
  FileText,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import "./ChatWidget.css";

/* ── tiny helper: unique id ─────────────────────────────── */
const uid = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/* ── session id (persisted for the browser tab) ──────────── */
const getSessionId = () => {
  let sid = sessionStorage.getItem("cp_chat_session");
  if (!sid) {
    sid = `session-${uid()}`;
    sessionStorage.setItem("cp_chat_session", sid);
  }
  return sid;
};

/* ── suggested prompts ──────────────────────────────────── */
const SUGGESTIONS = [
  "How do I report a pothole?",
  "What is PM Awas Yojana?",
  "Show pending report statistics",
  "What are my citizen rights?",
];

const ChatWidget = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [_error, setError] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useRef(getSessionId());

  /* ── Auto-scroll to bottom ───────────────────────────── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  /* ── Focus input when chat opens ─────────────────────── */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  /* ── Scroll detection for "jump to bottom" button ────── */
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBtn(distanceFromBottom > 100);
  }, []);

  /* ── Active request abort controller ──────────────── */
  const abortRef = useRef(null);

  /* ── Cleanup on unmount ─────────────────────────────── */
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  /* ── Core fetch + stream logic (extracted for retry) ── */
  const _doStream = async (messageText, botMsgId, signal) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        message: messageText,
        session_id: sessionId.current,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error("Chat service unavailable");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;
    let buffer = "";

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();

        for (const part of parts) {
          // Skip SSE comments (keepalive pings from the proxy)
          if (part.startsWith(":")) continue;

          if (part.startsWith("data: ")) {
            try {
              const data = JSON.parse(part.substring(6));

              // Handle server-side error events
              if (data.type === "error") {
                throw new Error(data.message || "Server returned an error");
              }

              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id === botMsgId) {
                    if (data.type === "meta") {
                      return { ...m, sources: data.sources };
                    } else if (data.type === "chunk") {
                      return { ...m, content: m.content + data.content };
                    }
                  }
                  return m;
                })
              );
            } catch (e) {
              // If it's the error we just threw, rethrow it so it breaks the stream loop
              if (e.message !== "Unexpected end of JSON input" && !e.message.startsWith("Unexpected token")) {
                throw e;
              }
              console.error("Stream parse error:", e);
            }
          }
        }
      }
    }
  };

  /* ── Send message (with auto-retry) ─────────────── */
  const sendMessage = async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg = {
      id: uid(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    const botMsgId = Date.now() + 1;

    // Add empty bot message immediately
    setMessages((prev) => [
      ...prev,
      { id: botMsgId, role: "assistant", content: "", sources: [] },
    ]);

    let lastErr = null;
    const MAX_RETRIES = 1;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (controller.signal.aborted) break;

        // On retry, wait 2 seconds and reset the bot message
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 2000));
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, content: "", sources: [] } : m
            )
          );
        }

        await _doStream(messageText, botMsgId, controller.signal);
        lastErr = null;
        break; // Success — exit retry loop
      } catch (err) {
        if (err.name === "AbortError") return; // User cancelled — silent exit
        lastErr = err;
      }
    }

    if (lastErr) {
      const errMsg = "Failed to get a response. Please try again.";
      setError(errMsg);

      // Remove the empty bot message and add an error one
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== botMsgId),
        {
          id: uid(),
          role: "assistant",
          content: errMsg,
          isError: true,
          timestamp: new Date(),
        },
      ]);
    }

    setIsLoading(false);
  };


  /* ── Reset conversation ──────────────────────────────── */
  const resetConversation = async () => {
    try {
      await api.post("/api/chat/reset", {
        session_id: sessionId.current,
      });
    } catch {
      // Silently fail — still clear local state
    }

    sessionId.current = `session-${uid()}`;
    sessionStorage.setItem("cp_chat_session", sessionId.current);
    setMessages([]);
    setError(null);
  };

  /* ── Key handler ─────────────────────────────────────── */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── Don't render if not logged in ───────────────────── */
  if (!user) return null;

  return (
    <>
      {/* ── Floating Action Button ─────────────────────── */}
      <button
        id="chat-widget-trigger"
        className={`chat-fab ${isOpen ? "chat-fab--hidden" : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open CivicPulse Assistant"
      >
        <Sparkles className="chat-fab__sparkle" size={14} />
        <MessageCircle size={24} />
        <span className="chat-fab__pulse" />
      </button>

      {/* ── Chat Panel ─────────────────────────────────── */}
      <div className={`chat-panel ${isOpen ? "chat-panel--open" : ""}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header__info">
            <div className="chat-header__avatar">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="chat-header__title">CivicPulse Assistant</h3>
              <span className="chat-header__status">
                <span className="chat-header__dot" />
                AI-Powered Helpdesk
              </span>
            </div>
          </div>
          <div className="chat-header__actions">
            <button
              className="chat-header__btn"
              onClick={resetConversation}
              title="New Conversation"
            >
              <RotateCcw size={16} />
            </button>
            <button
              className="chat-header__btn"
              onClick={() => setIsOpen(false)}
              title="Minimize"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div
          className="chat-messages"
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <div className="chat-welcome__icon">
                <Sparkles size={32} />
              </div>
              <h4 className="chat-welcome__title">
                Hi{user?.username ? `, ${user.username}` : ""}! 👋
              </h4>
              <p className="chat-welcome__text">
                I'm your civic helpdesk assistant. Ask me about CivicPulse
                features, government schemes, or report statistics.
              </p>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className="chat-suggestion"
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message chat-message--${msg.role} ${
                  msg.isError ? "chat-message--error" : ""
                }`}
              >
                <div className="chat-message__avatar">
                  {msg.role === "user" ? (
                    <User size={14} />
                  ) : msg.isError ? (
                    <AlertCircle size={14} />
                  ) : (
                    <Bot size={14} />
                  )}
                </div>
                <div className="chat-message__bubble">
                  <div className="chat-message__content">
                    {msg.role === "assistant" && !msg.isError ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {/* Sources accordion */}
                  {msg.sources && msg.sources.length > 0 && (
                    <details className="chat-sources">
                      <summary className="chat-sources__toggle">
                        <FileText size={12} />
                        {msg.sources.length} source
                        {msg.sources.length > 1 ? "s" : ""} used
                      </summary>
                      <ul className="chat-sources__list">
                        {msg.sources.map((src, i) => (
                          <li key={i} className="chat-sources__item">
                            <span className="chat-sources__badge">
                              {src.category}
                            </span>
                            {src.name}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {isLoading && (
            <div className="chat-message chat-message--assistant">
              <div className="chat-message__avatar">
                <Bot size={14} />
              </div>
              <div className="chat-message__bubble">
                <div className="chat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            className="chat-scroll-btn"
            onClick={scrollToBottom}
          >
            <ChevronDown size={16} />
          </button>
        )}

        {/* Input Area */}
        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            disabled={isLoading}
          />
          <button
            className="chat-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;
