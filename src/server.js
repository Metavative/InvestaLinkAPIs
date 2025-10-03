// src/server.js
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// --- serve /uploads BEFORE 404 handler ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsDir));
// console.log("Serving uploads from:", uploadsDir); // optional sanity log

// Mount your API (if you intended /api, use '/api' here)
app.use("/", routes);

// 404 + error handlers last
app.use(notFound);
app.use(errorHandler);

// Start
await connectDB();
app.listen(env.PORT, () =>
  console.log(`Server running on http://localhost:${env.PORT}`)
);
