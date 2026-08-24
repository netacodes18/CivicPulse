/**
 * Chat proxy route.
 * Forwards chat requests from the Express backend to the FastAPI RAG service.
 * Attaches user context from the JWT token for personalized responses.
 *
 * Uses SSE (Server-Sent Events) streaming with keepalive pings to prevent
 * browser connection resets on long-running AI responses.
 */

const express = require("express");
const { Readable } = require("stream");
const router = express.Router();

// RAG service URL (default: internal Render service URL in production, or localhost in development)
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || (process.env.NODE_ENV === "production" ? "http://civicpulse-rag:10000" : "http://localhost:8000");

// Keepalive interval (ms) — send SSE comment every 15s to prevent browser timeout
const KEEPALIVE_INTERVAL_MS = 15_000;

// Upstream fetch timeout (ms) — RAG pipeline can take 30-60s for embedding + LLM
const UPSTREAM_TIMEOUT_MS = 120_000;

/**
 * POST /api/chat
 * Proxy chat messages to the RAG service with SSE streaming.
 * Requires authentication (authMiddleware applied in server.js).
 */
router.post("/", async (req, res) => {
  const abortController = new AbortController();
  let keepaliveTimer = null;

  // Clean up on client disconnect
  req.on("close", () => {
    abortController.abort();
    if (keepaliveTimer) clearInterval(keepaliveTimer);
  });

  try {
    const { message, session_id } = req.body;

    if (!message || !session_id) {
      return res.status(400).json({
        message: "Both 'message' and 'session_id' are required.",
      });
    }

    // Build user context from the authenticated JWT payload
    const userContext = {
      state: req.user?.state || null,
      area: req.user?.area || null,
      role: req.user?.role || null,
      username: req.user?.username || null,
    };

    // Set SSE headers immediately so the browser knows it's a stream and Render load balancer doesn't timeout
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering if behind proxy
    res.flushHeaders();

    // Start keepalive pings immediately — SSE comments (lines starting with ':') are ignored by clients
    keepaliveTimer = setInterval(() => {
      if (!res.writableEnded) {
        res.write(":keepalive\\n\\n");
      }
    }, KEEPALIVE_INTERVAL_MS);

    // Forward to the RAG service
    const response = await fetch(`${RAG_SERVICE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        session_id,
        user_context: userContext,
      }),
      signal: abortController.signal,
    });

    // Set a manual timeout that aborts the controller
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, UPSTREAM_TIMEOUT_MS);

    if (!response.ok) {
      clearTimeout(timeoutId);
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ RAG Service Error:", response.status, errorData);
      
      const errorMessage = errorData.detail?.message || "Chat service temporarily unavailable.";
      if (!res.writableEnded) {
        res.write(`data: {"type":"error","message":${JSON.stringify(errorMessage)}}\\n\\n`);
        res.end();
      }
      return;
    }

    // Pipe the upstream SSE stream to the client with proper error handling

    if (response.body) {
      const readable = Readable.fromWeb(response.body);

      readable.on("error", (err) => {
        console.error("❌ Upstream stream error:", err.message);
        clearTimeout(timeoutId);
        clearInterval(keepaliveTimer);
        if (!res.writableEnded) {
          res.write(`data: {"type":"error","message":"Stream interrupted. Please try again."}\n\n`);
          res.end();
        }
      });

      readable.on("end", () => {
        clearTimeout(timeoutId);
        clearInterval(keepaliveTimer);
        if (!res.writableEnded) {
          res.end();
        }
      });

      readable.pipe(res, { end: false });
    } else {
      clearTimeout(timeoutId);
      clearInterval(keepaliveTimer);
      res.end();
    }
  } catch (error) {
    if (keepaliveTimer) clearInterval(keepaliveTimer);

    // Don't log or respond if client already disconnected
    if (error.name === "AbortError") {
      if (!res.writableEnded) res.end();
      return;
    }

    console.error("❌ Chat Proxy Error:", error.message);

    if (!res.headersSent) {
      if (error.name === "TimeoutError") {
        return res.status(504).json({
          message: "The AI assistant is taking too long to respond. Please try again.",
        });
      }

      return res.status(503).json({
        message: "Chat service is currently unavailable. Please try again later.",
      });
    }

    // Headers already sent (mid-stream failure) — send error event and close
    if (!res.writableEnded) {
      res.write(`data: {"type":"error","message":"Connection lost. Please try again."}\n\n`);
      res.end();
    }
  }
});

/**
 * POST /api/chat/reset
 * Reset the conversation history for a session.
 */
router.post("/reset", async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ message: "'session_id' is required." });
    }

    const response = await fetch(
      `${RAG_SERVICE_URL}/chat/reset?session_id=${encodeURIComponent(session_id)}`,
      { method: "POST", signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) }
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("❌ Chat Reset Error:", error.message);
    return res.status(503).json({ message: "Chat service unavailable." });
  }
});

module.exports = router;
