require("dotenv").config();
const express   = require("express");
const mongoose  = require("mongoose");
const cors      = require("cors");

const authRoutes        = require("./routes/auth");
const caseRoutes        = require("./routes/cases");
const appointmentRoutes = require("./routes/appointments");

const app = express();

const ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://192.168.197.165:5173",
  "http://192.168.197.165:8081",
  "http://192.168.218.165:5173",
  "http://192.168.218.165:8081",
];

// Attach a dummy io so routes don't break
app.use((req, _, next) => { req.io = { emit: () => {} }; next(); });

app.use(cors({ origin: ORIGINS, credentials: true }));
app.use(express.json());

app.use("/api/auth",         authRoutes);
app.use("/api/cases",        caseRoutes);
app.use("/api/appointments", appointmentRoutes);
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// ── AI chat proxy — forwards to ai-service ───────────────────────────────────
const AI_SERVICE = process.env.AI_SERVICE_URL || "http://localhost:5001";

app.post("/api/ai/chat", async (req, res) => {
  try {
    const r = await fetch(`${AI_SERVICE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(30000),
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error("AI proxy error:", e.message);
    res.json({
      response: "I'm having trouble connecting right now. Please call +251965485715 if you need immediate help.",
      resources: [{ name: "SafeSpeak Emergency Line", contact: "+251965485715", type: "emergency" }],
      isEmergency: false,
    });
  }
});

app.get("/api/ai/resources", async (req, res) => {
  try {
    const r = await fetch(`${AI_SERVICE}/resources`, { signal: AbortSignal.timeout(3000) });
    res.json(await r.json());
  } catch {
    res.json([]);
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const server = app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
    );
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${process.env.PORT} is already in use. Close the other process and restart.`);
        process.exit(1);
      }
    });
    // Graceful shutdown — release port before nodemon restarts
    process.on("SIGTERM", () => server.close());
    process.on("SIGINT",  () => server.close());
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
