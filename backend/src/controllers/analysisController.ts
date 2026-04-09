import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";
import { PDFParse } from "pdf-parse";
import Analysis from "../models/analysis";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const groqModel = "openai/gpt-oss-20b";

type BloomCategory = "LOTS" | "MOTS" | "HOTS";

interface GroqQuestionAnalysis {
  bloomLevel: string;
  confidence: number;
  explanation: string;
}

interface AnalysisResult {
  item: string;
  bloomLevel: string;
  confidence: number;
  explanation: string;
  category: BloomCategory;
}

interface TopicQuestionGeneration {
  questions?: string[];
}

interface GeneratedQuestionWithTaxonomy {
  question: string;
  bloomLevel: string;
  category: BloomCategory;
}

const BLOOM_LEVELS = [
  "Remembering",
  "Understanding",
  "Applying",
  "Analyzing",
  "Evaluating",
  "Creating",
] as const;

// --- Helper for categorizing levels
const getCategory = (bloomLevel: string): BloomCategory => {
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

const analyzeOneQuestion = async (
  question: string,
): Promise<GroqQuestionAnalysis> => {
  const prompt = `
You are an education expert in Bloom's Taxonomy.
Analyze the following academic input (it may be a question, topic, or learning objective)
and classify it into one of the six Bloom's levels:
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

  const content = completion.choices[0]?.message?.content || "";
  return parseQuestionAnalysis(content);
};

const normalizePdfText = (text: string): string =>
  text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const extractAcademicItemsFromText = (text: string): string[] => {
  const cleaned = normalizePdfText(text);
  if (!cleaned) {
    return [];
  }

  const fromLines = cleaned
    .split(/\n+/)
    .map((line) =>
      line
        .replace(/^\s*(\d+|[a-zA-Z]|[ivxlcdmIVXLCDM]+)[.)-]\s+/, "")
        .replace(/^\s*[\u2022\-]\s+/, "")
        .trim(),
    )
    .filter((line) => line.length >= 12);

  const candidates =
    fromLines.length >= 3
      ? fromLines
      : cleaned
          .split(/(?<=[.?!;])\s+/)
          .map((sentence) => sentence.trim())
          .filter((sentence) => sentence.length >= 12);

  const unique = Array.from(new Set(candidates));

  return unique.slice(0, 40);
};

const saveAndFormatResult = async (item: string): Promise<AnalysisResult> => {
  const parsed = await analyzeOneQuestion(item);
  const category = getCategory(parsed.bloomLevel);

  await Analysis.create({
    question: item,
    bloomLevel: parsed.bloomLevel,
    confidence: parsed.confidence,
    explanation: parsed.explanation,
    category,
  });

  return {
    item,
    bloomLevel: parsed.bloomLevel,
    confidence: parsed.confidence,
    explanation: parsed.explanation,
    category,
  };
};

const extractJsonObject = (text: string): string => {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start >= 0 && end > start) {
    return cleaned.slice(start, end + 1);
  }

  return cleaned;
};

const normalizeBloomLevel = (value?: string): string => {
  if (!value) {
    return "Unknown";
  }

  const found = BLOOM_LEVELS.find(
    (level) => level.toLowerCase() === value.toLowerCase().trim(),
  );

  return found || "Unknown";
};

const parseQuestionAnalysis = (content: string): GroqQuestionAnalysis => {
  const cleaned = content.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(extractJsonObject(cleaned)) as {
      bloomLevel?: string;
      confidence?: number;
      explanation?: string;
    };

    return {
      bloomLevel: normalizeBloomLevel(parsed.bloomLevel),
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
      explanation: parsed.explanation || cleaned || "No explanation provided.",
    };
  } catch {
    const matchedLevel = BLOOM_LEVELS.find((level) =>
      new RegExp(`\\b${level}\\b`, "i").test(cleaned),
    );

    const confidenceMatch = cleaned.match(
      /"?confidence"?\s*[:=]\s*([0-9]*\.?[0-9]+)/i,
    );
    const confidence = confidenceMatch ? Number(confidenceMatch[1]) : 0;

    return {
      bloomLevel: matchedLevel || "Unknown",
      confidence: Number.isFinite(confidence) ? confidence : 0,
      explanation: cleaned || "No explanation provided.",
    };
  }
};

const parseGeneratedQuestions = (content: string, count: number): string[] => {
  const cleaned = content.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(
      extractJsonObject(cleaned),
    ) as TopicQuestionGeneration;
    const questions = Array.isArray(parsed.questions)
      ? parsed.questions
          .filter((q): q is string => typeof q === "string")
          .map((q) => q.trim())
          .filter((q) => q.length > 0)
      : [];

    if (questions.length > 0) {
      return questions.slice(0, count);
    }
  } catch {
    // Fall through to text-based extraction.
  }

  const lines = cleaned
    .split(/\n+/)
    .map((line) =>
      line
        .replace(/^\s*(\d+|[a-zA-Z])[.)-]\s+/, "")
        .replace(/^\s*[-*]\s+/, "")
        .replace(/^"|"$/g, "")
        .trim(),
    )
    .filter((line) => line.length > 6)
    .filter((line) => !line.startsWith("{") && !line.startsWith("}"))
    .filter((line) => !/^"?questions"?\s*:/i.test(line));

  const unique = Array.from(new Set(lines));
  return unique.slice(0, count);
};

// --- 0️⃣ Topic Question Generator
export const generateQuestionsFromTopic = async (
  req: Request,
  res: Response,
) => {
  const topic = typeof req.body.topic === "string" ? req.body.topic.trim() : "";
  const requestedCount = Number(req.body.count);
  const count = Number.isFinite(requestedCount)
    ? Math.min(Math.max(Math.floor(requestedCount), 1), 20)
    : 5;

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  try {
    const prompt = `
You are an expert educator.
Generate exactly ${count} high-quality academic questions for the topic below.

Topic: "${topic}"

Requirements:
  - Keep questions simple, clear, and direct.
  - Questions should be suitable for students and easy to understand.
  - Use a natural spread of Bloom's Taxonomy levels when possible.
- Do not include answers.

Return ONLY valid JSON in this exact format:
{
  "questions": ["Question 1", "Question 2"]
}
`;

    const completion = await groq.chat.completions.create({
      model: groqModel,
      messages: [
        {
          role: "system",
          content:
            "You generate educational questions and always return strict JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 900,
    });

    const content = completion.choices[0]?.message?.content || "";
    const questions = parseGeneratedQuestions(content, count);

    if (questions.length === 0) {
      return res.status(502).json({
        error: "Could not generate questions for this topic",
      });
    }

    const limitedQuestions = questions.slice(0, count);

    const questionDetails: GeneratedQuestionWithTaxonomy[] = [];
    for (const question of limitedQuestions) {
      const analyzed = await analyzeOneQuestion(question);
      questionDetails.push({
        question,
        bloomLevel: analyzed.bloomLevel,
        category: getCategory(analyzed.bloomLevel),
      });
    }

    return res.json({
      topic,
      requestedCount: count,
      generatedCount: limitedQuestions.length,
      questions: limitedQuestions,
      questionDetails,
      message: "Questions generated successfully",
    });
  } catch (error: any) {
    console.error("Topic generation error:", error);
    return res.status(500).json({
      error: "Failed to generate questions",
      details: error.message,
    });
  }
};

// --- 1️⃣ Single Question Analyzer
export const analyzeQuestion = async (req: Request, res: Response) => {
  const questionInput =
    typeof req.body.question === "string" ? req.body.question.trim() : "";
  const questionsInput = Array.isArray(req.body.questions)
    ? req.body.questions
        .filter((q: unknown): q is string => typeof q === "string")
        .map((q: string) => q.trim())
        .filter((q: string) => q.length > 0)
    : [];

  const questions =
    questionsInput.length > 0
      ? questionsInput
      : questionInput
        ? [questionInput]
        : [];

  if (questions.length === 0) {
    return res.status(400).json({ error: "Question text is required" });
  }

  try {
    const results: Array<{
      question: string;
      bloomLevel: string;
      confidence: number;
      explanation: string;
      category: BloomCategory;
    }> = [];

    for (const question of questions) {
      const analyzed = await saveAndFormatResult(question);

      results.push({
        question,
        bloomLevel: analyzed.bloomLevel,
        confidence: analyzed.confidence,
        explanation: analyzed.explanation,
        category: analyzed.category,
      });
    }

    if (results.length === 1) {
      return res.json({
        ...results[0],
        message: "Analysis completed successfully",
      });
    }

    const counts: Record<BloomCategory, number> = {
      LOTS: 0,
      MOTS: 0,
      HOTS: 0,
    };

    results.forEach((result) => {
      counts[result.category] += 1;
    });

    const totalQuestions = results.length;

    return res.json({
      totalQuestions,
      results,
      summary: {
        lotsPercentage: Number(
          ((counts.LOTS / totalQuestions) * 100).toFixed(1),
        ),
        motsPercentage: Number(
          ((counts.MOTS / totalQuestions) * 100).toFixed(1),
        ),
        hotsPercentage: Number(
          ((counts.HOTS / totalQuestions) * 100).toFixed(1),
        ),
      },
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

// --- 3️⃣ PDF Topic/Question Analyzer
export const analyzePdfContent = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    const isPdf =
      req.file.mimetype === "application/pdf" ||
      req.file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return res.status(400).json({ error: "Only PDF files are supported" });
    }

    const parser = new PDFParse({ data: req.file.buffer });
    const parsedPdf = await parser.getText();
    await parser.destroy();

    const extractedText = normalizePdfText(parsedPdf.text || "");

    if (!extractedText) {
      return res.status(400).json({
        error: "Unable to extract readable text from the uploaded PDF",
      });
    }

    const items = extractAcademicItemsFromText(extractedText);

    if (items.length === 0) {
      return res.status(400).json({
        error: "No analyzable questions/topics found in the uploaded PDF",
      });
    }

    const results: Array<{
      question: string;
      bloomLevel: string;
      confidence: number;
      explanation: string;
      category: BloomCategory;
    }> = [];

    const counts: Record<BloomCategory, number> = {
      LOTS: 0,
      MOTS: 0,
      HOTS: 0,
    };

    for (const item of items) {
      const analyzed = await saveAndFormatResult(item);
      counts[analyzed.category] += 1;

      results.push({
        question: analyzed.item,
        bloomLevel: analyzed.bloomLevel,
        confidence: analyzed.confidence,
        explanation: analyzed.explanation,
        category: analyzed.category,
      });
    }

    const totalQuestions = results.length;

    return res.json({
      source: "pdf",
      fileName: req.file.originalname,
      extractedTextLength: extractedText.length,
      extractedItems: items,
      totalQuestions,
      results,
      summary: {
        lotsPercentage: Number(
          ((counts.LOTS / totalQuestions) * 100).toFixed(1),
        ),
        motsPercentage: Number(
          ((counts.MOTS / totalQuestions) * 100).toFixed(1),
        ),
        hotsPercentage: Number(
          ((counts.HOTS / totalQuestions) * 100).toFixed(1),
        ),
      },
      message: "PDF analysis completed successfully",
    });
  } catch (error: any) {
    console.error("PDF analysis error:", error);
    return res.status(500).json({
      error: "Failed to analyze uploaded PDF",
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
      }),
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
              1,
            )}%. Reduce to 20–30%.`,
            `HOTS currently at ${hotsPercentage.toFixed(
              1,
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
