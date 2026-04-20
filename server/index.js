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
      signal: AbortSignal.timeout(5000),
    });
    const data = await r.json();
    res.json(data);
  } catch {
    res.json({
      response: "I'm here to help. Please call 988 (Suicide Prevention) or text HOME to 741741 (Crisis Text Line) if you need immediate support.",
      resources: [{ name: "Crisis Text Line", contact: "Text HOME to 741741", type: "crisis" }],
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
