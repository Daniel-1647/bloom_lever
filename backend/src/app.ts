import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import analysisRoutes from "./routes/analysisRoutes";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/analyze", analysisRoutes);

// Root test route
app.get("/", (_, res) => {
  res.send("🌸 Bloom Lever API is running!");
});

export default app;
