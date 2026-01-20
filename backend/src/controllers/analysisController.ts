import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";
import Analysis from "../models/analysis";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const groqModel = "openai/gpt-oss-20b";

// --- Helper for categorizing levels
const getCategory = (bloomLevel: string): "LOTS" | "MOTS" | "HOTS" => {
  switch (bloomLevel.toLowerCase()) {
    case "remembering":
    case "understanding":
      return "LOTS";
    case "applying":
    case "analyzing":
      return "MOTS";
    case "evaluating":
    case "creating":
      return "HOTS";
    default:
      return "LOTS";
  }
};

// --- 1️⃣ Single Question Analyzer
export const analyzeQuestion = async (req: Request, res: Response) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Question text is required" });
  }

  try {
    const prompt = `
You are an education expert in Bloom's Taxonomy.
Analyze the following question and classify it into one of the six Bloom's levels:
(Remembering, Understanding, Applying, Analyzing, Evaluating, Creating).

Provide a JSON response in this exact format:
{
  "bloomLevel": "string",
  "confidence": number,
  "explanation": "string"
}

Question: "${question}"
`;

    const completion = await groq.chat.completions.create({
      model: groqModel,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());

    const category = getCategory(parsed.bloomLevel);

    // Save result to MongoDB
    const saved = await Analysis.create({
      question,
      bloomLevel: parsed.bloomLevel,
      confidence: parsed.confidence,
      explanation: parsed.explanation,
      category,
    });

    res.json({
      ...saved.toObject(),
      message: "Analysis completed successfully",
    });
  } catch (error: any) {
    console.error("Groq analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze question",
      details: error.message,
    });
  }
};

// --- 2️⃣ Assessment Paper Analyzer
export const analyzeAssessment = async (req: Request, res: Response) => {
  const { questions } = req.body;
  console.log("🧠 Received questions:", questions);

  if (!Array.isArray(questions) || questions.length === 0) {
    return res
      .status(400)
      .json({ error: "Questions must be a non-empty array" });
  }

  try {
    const results: any[] = [];

    // Helper to categorize Bloom levels
    const getCategory = (bloomLevel: string = "Unknown"): string => {
      const level = bloomLevel.toLowerCase();
      if (["remembering", "understanding"].includes(level)) return "LOTS";
      if (["applying", "analyzing"].includes(level)) return "MOTS";
      if (["evaluating", "creating"].includes(level)) return "HOTS";
      return "LOTS";
    };

    for (const q of questions) {
      console.log("🧠 Sending to Groq:", q);

      const prompt = `
You are an educational expert specializing in Bloom's Taxonomy.
Classify the following question into one of the six Bloom levels:
(Remembering, Understanding, Applying, Analyzing, Evaluating, Creating).

Respond ONLY with a valid JSON object in this exact format:
{
  "bloomLevel": "string",
  "confidence": number,
  "explanation": "string"
}

Question: "${q}"
`;

      let parsed: any = {};
      let content = "";

      try {
        const completion = await groq.chat.completions.create({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: "You are a Bloom's Taxonomy expert." },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 300,
        });

        content = (completion.choices[0]?.message?.content || "").trim();

        console.log("🧩 Raw Groq response for question:", q);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(content || "[empty response]");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        if (!content) {
          throw new Error("Empty response from Groq");
        }

        try {
          parsed = JSON.parse(content.replace(/```json|```/g, "").trim());
        } catch {
          console.warn("⚠️ JSON parse failed for:", q);
          parsed = {
            bloomLevel: "Unknown",
            confidence: 0.0,
            explanation:
              "Groq returned an unexpected response format or empty output.",
          };
        }
      } catch (err: any) {
        console.error("⚠️ Groq call failed for:", q, err.message);
        parsed = {
          bloomLevel: "Unknown",
          confidence: 0.0,
          explanation: "Groq API failed to analyze this question.",
        };
      }

      const bloomLevel = parsed.bloomLevel || "Unknown";
      const category = getCategory(bloomLevel);

      results.push({
        question: q,
        bloomLevel,
        confidence: parsed.confidence ?? 0,
        explanation: parsed.explanation ?? "",
        category,
      });

      await Analysis.create({
        question: q,
        bloomLevel,
        confidence: parsed.confidence ?? 0,
        category,
      });

      await new Promise((r) => setTimeout(r, 300)); // avoid rate limiting
    }

    // --- Compute Percentages ---
    const total = results.length;
    const counts = { LOTS: 0, MOTS: 0, HOTS: 0 };
    results.forEach((r) => counts[r.category as "LOTS" | "MOTS" | "HOTS"]++);

    const lotsPercentage = Number(((counts.LOTS / total) * 100).toFixed(1));
    const motsPercentage = Number(((counts.MOTS / total) * 100).toFixed(1));
    const hotsPercentage = Number(((counts.HOTS / total) * 100).toFixed(1));

    // --- Bloom Level Distribution for Charts ---
    const levelCounts: Record<string, number> = {};
    results.forEach((r) => {
      const level = r.bloomLevel || "Unknown";
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });

    const levelDistribution = Object.entries(levelCounts).map(
      ([level, count]) => ({
        level,
        count,
        percentage: Number(((count / total) * 100).toFixed(1)),
      })
    );

    // --- NAAC Compliance ---
    const meetsStandards = lotsPercentage <= 30 && hotsPercentage >= 40;

    const compliance = {
      meetsStandards,
      feedback: meetsStandards
        ? [
            "Assessment meets NAAC compliance standards.",
            "Balanced LOTS/MOTS/HOTS distribution achieved.",
          ]
        : [
            "Assessment needs rebalancing to meet NAAC standards.",
            `LOTS currently at ${lotsPercentage.toFixed(
              1
            )}%. Reduce to 20–30%.`,
            `HOTS currently at ${hotsPercentage.toFixed(
              1
            )}%. Increase to 40–50%.`,
          ],
    };

    const recommendations = [
      "Add more higher-order thinking (evaluation and creation) questions.",
      "Balance factual recall with conceptual understanding.",
      "Ensure questions align with course outcomes (CLOs).",
    ];

    res.json({
      totalQuestions: total,
      lotsPercentage,
      motsPercentage,
      hotsPercentage,
      distribution: levelDistribution,
      compliance,
      recommendations,
    });
  } catch (error: any) {
    console.error("Groq assessment error:", error);
    res.status(500).json({
      error: "Failed to analyze assessment paper",
      details: error.message,
    });
  }
};
