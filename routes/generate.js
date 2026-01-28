import { Router } from "express";
import { z } from "zod";
import { runModel } from "../services/api-service.js";

const router = Router();

const RequestSchema = z.object({
  finding: z.string().min(5, "Please provide an audit finding (min 5 chars)."),
});

const ResponseSchema = z.object({
  title: z.string(),
  issues: z.string(),
  risks: z.string(),
  recommendations: z.string(),
  root_causes: z.string(),
});

router.post("/generate-report", async (req, res) => {
  try {
    const { finding } = RequestSchema.parse(req.body);

    const apiKey = process.env.API_KEY;
    const baseUrl = process.env.BASE_URL;
    const model = process.env.MODEL;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing API_KEY on server." });
    }

    const result = await runModel({
      baseUrl,
      apiKey,
      model,
      finding,
    });

    if (result.json) {
      const validated = ResponseSchema.parse(result.json);
      return res.json({
        ok: true,
        report: validated,
        raw: result.raw,
      });
    } else {
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
