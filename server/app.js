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

mongoose.connect(ENV.MONGODB_URL, { dbName: ENV.DB_NAME }).then(() => {
    console.log("Connected to MongoDb");
    app.listen(ENV.PORT, () => console.log(`Server is up at ${ENV.PORT}`));

    // FIRST TIME IMPORTING CARS
    firstTimeSetup();
});

const firstTimeSetup = () => {
    const data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));
    CarModel.insertMany(data);
    CarModel.createIndexes({ name: "text" });
};
