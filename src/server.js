import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import winston from "winston";

// Middleware and current routes
import { authenticate } from "./middleware/auth.js";
import phrasesRoutes from "./routes/phrases.js";
import reviewRoutes from "./routes/review.js";
import seedRoutes from "./routes/seed.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 1337;
const HOST = process.env.HOST || "0.0.0.0";

// 🛡️ Helmet: Security headers
app.use(helmet());
app.disable("x-powered-by");

// 🚦 Express-rate-limit: Limit by IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 request by window by IP
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// 🧾 Winston: Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

logger.add(
  new winston.transports.Console({
    format: winston.format.simple(),
  })
);

// 📊 Morgan: Logging of HTTP requests
const accessLogStream = fs.createWriteStream(path.join("logs", "access.log"), {
  flags: "a",
});
app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("dev"));

// 📦 Middlewares and routes
app.use(express.json());
app.use(authenticate);
app.use("/api/phrase", phrasesRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/seed", seedRoutes);

// 🚀 Start server
app.listen(PORT, HOST, () => {
  logger.info(`Server listening on port ${PORT}`);
  console.log(`✅ Server listening on port ${PORT}`);
});
