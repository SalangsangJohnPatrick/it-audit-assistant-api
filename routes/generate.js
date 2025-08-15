import { Router } from "express";
import { z } from "zod";
import { callDeepSeek } from "../services/deepseek.js";

const router = Router();

const RequestSchema = z.object({
  bulletPoints: z
    .string()
    .min(5, "Please provide bullet points (min 5 chars)."),
});

const ResponseSchema = z.object({
  issue: z.string(),
  risk: z.string(),
  recommendation: z.string(),
  root_cause: z.string(),
  management_response: z.string(),
});

router.post("/generate-report", async (req, res) => {
  try {
    const { bulletPoints } = RequestSchema.parse(req.body);

    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseUrl = process.env.DEEPSEEK_BASE_URL;
    const model = process.env.DEEPSEEK_MODEL;

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Missing DEEPSEEK_API_KEY on server." });
    }

    const result = await callDeepSeek({
      baseUrl,
      apiKey,
      model,
      bulletPoints,
    });

    if (result.json) {
      // Validate shape
      const validated = ResponseSchema.parse(result.json);
      return res.json({
        ok: true,
        report: validated,
        raw: result.raw,
      });
    } else {
      // Return raw to be transparent
      return res.json({
        ok: true,
        report: null,
        raw: result.raw,
      });
    }
  } catch (err) {
    const message = err?.message;
    res.status(400).json({
      ok: false,
      error: message,
    });
  }
});

export default router;
