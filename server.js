/**
 * server.js
 *
 * Realtime Telegram -> Web using socket.io and node-telegram-bot-api (polling).
 *
 * Requirements:
 * - Set env BOT_TOKEN (your bot token from @BotFather)
 * - Run: npm install, then npm start
 *
 * Note: This implementation uses long-polling from Telegram (node-telegram-bot-api).
 * For production and scale, consider webhook mode or use a managed realtime service.
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");
const helmet = require("helmet");

const BOT_TOKEN = process.env.BOT_TOKEN || ""; // set BOT_TOKEN env var
if (!BOT_TOKEN) {
  console.error("ERROR: please set BOT_TOKEN environment variable");
  process.exit(1);
}

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // adjust for production
    methods: ["GET", "POST"]
  }
});

// Initialize Telegram bot in polling mode
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.on("polling_error", (err) => {
  console.error("Telegram polling error:", err?.message || err);
});

// Helper: sanitize text for display (basic)
function sanitizeText(str = "") {
  // escape < and >
  return String(str).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// When a Telegram message arrives, emit to connected clients
bot.on("message", (msg) => {
  try {
    const payload = {
      chat_id: msg.chat?.id,
      chat_title: msg.chat?.title || `${msg.chat?.first_name || ""} ${msg.chat?.last_name || ""}`.trim(),
      from: (msg.from?.username) ? `@${msg.from.username}` : `${msg.from?.first_name || "Unknown"}`,
      text: msg.text || (msg.caption || ""), // handle caption for media posts
      date: msg.date || Math.floor(Date.now() / 1000),
      raw: msg
    };

    // Basic sanitization
    payload.text = sanitizeText(payload.text);

    // Emit to all connected socket clients
    io.emit("telegram_message", payload);
    console.log("Emitted message from", payload.from, "->", payload.text.slice(0, 80));
  } catch (err) {
    console.error("Error handling message:", err);
  }
});

// Basic socket.io handlers
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", socket.id, reason);
  });

  // optional: client can request recent messages - implement as needed
  socket.on("ping_server", (cb) => {
    if (cb) cb({ ok: true, ts: Date.now() });
  });
});

// Simple health route
app.get("/healthz", (req, res) => res.json({ ok: true, ts: Date.now() }));

// Serve client via / (static files in public/)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
