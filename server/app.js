import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express, { json, raw, urlencoded } from "express";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { ENV, checkEnv } from "./config/index.js";
import CarModel from "./models/CarModel.js";
import { AuthRouter, CarRouter, UserRouter } from "./routers/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();
checkEnv();
const app = express();

app.use(json({ limit: "1mb" }));
app.use(urlencoded({ limit: "10kb", extended: true }));
app.use(raw());
app.use(cors({ origin: [ENV.CLIENT_URL], credentials: true }));
app.use(cookieParser());

// API Routes
app.get("/api", (_, res) => res.send(`Server is up`));
app.use("/api/auth", AuthRouter);
app.use("/api/cars", CarRouter);
app.use("/api/user", UserRouter);

// 404 handler — unknown API routes
app.use("/api/*", (req, res) => {
    res.status(404).json({ message: "API route not found" });
});

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
    // Set static folder
    const clientBuildPath = path.resolve(__dirname, "../client/build");

    // Check if client build folder exists
    if (fs.existsSync(clientBuildPath)) {
        app.use(express.static(clientBuildPath));

        app.get("*", (req, res) => {
            if (!req.path.startsWith("/api")) {
                res.sendFile(path.resolve(clientBuildPath, "index.html"));
            }
        });
    }
}

// Global error handler — catches any unhandled errors thrown in route handlers
// Must be defined AFTER all routes and with 4 parameters so Express recognises it
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error("[Global Error Handler]", err);
    const status = err.status || err.statusCode || 500;
    const message =
        process.env.NODE_ENV === "production"
            ? status === 500
                ? "Internal server error"
                : err.message || "An error occurred"
            : err.message || "Internal server error";
    res.status(status).json({ message });
});

// On Vercel, app.listen() is not needed — Vercel handles the port.
// For local development, we start the server normally.
if (process.env.NODE_ENV !== "production") {
    mongoose
        .connect(ENV.MONGODB_URL, { dbName: ENV.DB_NAME })
        .then(async () => {
            console.log("Connected to MongoDb");
            app.listen(ENV.PORT, () => console.log(`Server is up at ${ENV.PORT}`));
            await firstTimeSetup();
        })
        .catch((err) => {
            console.error("Failed to connect to MongoDB", err);
            process.exit(1);
        });
} else {
    // Production (Vercel) — connect to DB once and export the app
    mongoose
        .connect(ENV.MONGODB_URL, { dbName: ENV.DB_NAME })
        .then(async () => {
            console.log("Connected to MongoDb");
            await firstTimeSetup();
        })
        .catch((err) => {
            console.error("Failed to connect to MongoDB", err);
        });
}

// Only seeds cars if the collection is empty — safe to run on every restart
const firstTimeSetup = async () => {
    try {
        const count = await CarModel.countDocuments();
        if (count === 0) {
            const data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));
            await CarModel.insertMany(data);
            console.log("Cars seeded successfully");
        }
        await CarModel.createIndexes({ name: "text" });
    } catch (err) {
        console.error("firstTimeSetup error:", err);
    }
};

export default app;
