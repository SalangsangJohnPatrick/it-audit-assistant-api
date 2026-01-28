import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { apiLimiter } from "./middleware/rate-limit.js";
import generateRoute from "./routes/generate.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: true, credentials: true }));
app.use("/api", apiLimiter, generateRoute);

// Test root route
app.get("/", (req, res) => {
  res.send("IT Audit Assistant is running.");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
