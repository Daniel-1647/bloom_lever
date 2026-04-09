import React, { useState } from "react";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../config";

interface QuestionAnalyzerProps {
  questionText: string;
  uploadedFile: File | null;
  theme: "light" | "dark";
}

interface AnalysisResult {
  question: string;
  bloomLevel: string;
  levelIndex: number;
  explanation: string;
  confidence: number;
  description: string;
  category: "LOTS" | "MOTS" | "HOTS";
}

interface ApiQuestionResult {
  question?: string;
  bloomLevel?: string;
  confidence?: number;
  explanation?: string;
  category?: "LOTS" | "MOTS" | "HOTS";
}

interface ApiResponse {
  results?: ApiQuestionResult[];
  extractedItems?: string[];
  fileName?: string;
  source?: string;
  summary?: {
    lotsPercentage: number;
    motsPercentage: number;
    hotsPercentage: number;
  };
  bloomLevel?: string;
  confidence?: number;
  explanation?: string;
  category?: "LOTS" | "MOTS" | "HOTS";
  question?: string;
  error?: string;
}

const bloomLevels = [
  {
    name: "Remembering",
    color: "#EF4444",
    description: "Recall facts and basic concepts",
  },
  {
    name: "Understanding",
    color: "#F97316",
    description: "Explain ideas or concepts",
  },
  {
    name: "Applying",
    color: "#EAB308",
    description: "Use information in new situations",
  },
  {
    name: "Analyzing",
    color: "#22C55E",
    description: "Draw connections among ideas",
  },
  {
    name: "Evaluating",
    color: "#3B82F6",
    description: "Justify a stand or decision",
  },
  {
    name: "Creating",
    color: "#A855F7",
    description: "Produce new or original work",
  },
];

const QuestionAnalyzer: React.FC<QuestionAnalyzerProps> = ({
  questionText,
  uploadedFile,
  theme,
}) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [summary, setSummary] = useState<{
    lotsPercentage: number;
    motsPercentage: number;
    hotsPercentage: number;
  } | null>(null);
  const [extractedItems, setExtractedItems] = useState<string[]>([]);
  const [sourceLabel, setSourceLabel] = useState<string>("");
  const [error, setError] = useState<string>("");

  const parsedQuestions = questionText
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const isPdfUpload =
    !!uploadedFile &&
    (uploadedFile.type === "application/pdf" ||
      uploadedFile.name.toLowerCase().endsWith(".pdf"));

  const getLevelIndex = (bloomLevel: string) =>
    bloomLevels.findIndex(
      (level) => level.name.toLowerCase() === bloomLevel.toLowerCase(),
    );

  const toPercent = (confidence?: number) => {
    if (typeof confidence !== "number") {
      return 0;
    }

    if (confidence > 1) {
      return Math.round(confidence);
    }

    return Math.round(confidence * 100);
  };

  const mapApiResult = (
    item: ApiQuestionResult,
    fallbackQuestion: string,
  ): AnalysisResult => {
    const bloomLevel = item.bloomLevel || "Unknown";
    const levelIndex = getLevelIndex(bloomLevel);

    return {
      question: item.question || fallbackQuestion,
      bloomLevel,
      levelIndex,
      explanation: item.explanation || "No explanation provided.",
      confidence: toPercent(item.confidence),
      description:
        bloomLevels.find((level) => level.name === bloomLevel)?.description ||
        "Classification unavailable.",
      category: item.category || "LOTS",
    };
  };

  const getLevelMeta = (levelIndex: number) => {
    if (levelIndex >= 0) {
      return bloomLevels[levelIndex];
    }

    return {
      name: "Unknown",
      color: "#9CA3AF",
      description: "Classification unavailable.",
    };
  };

  const analyzeQuestion = async () => {
    if (!isPdfUpload && parsedQuestions.length === 0) {
      setError("Please provide at least one question to analyze");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setSummary(null);
    setExtractedItems([]);
    setSourceLabel("");

    try {
      const response = isPdfUpload
        ? await (async () => {
            const formData = new FormData();
            formData.append("file", uploadedFile);

            return fetch(`${API_BASE_URL}/question/pdf`, {
              method: "POST",
              body: formData,
            });
          })()
        : await (async () => {
            const payload =
              parsedQuestions.length === 1
                ? { question: parsedQuestions[0] }
                : { questions: parsedQuestions };

            return fetch(`${API_BASE_URL}/question`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          })();

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze question");
      }

      const mappedResults = Array.isArray(data.results)
        ? data.results.map((item, index) =>
            mapApiResult(
              item,
              parsedQuestions[index] || data.extractedItems?.[index] || "Item",
            ),
          )
        : [
            mapApiResult(
              {
                question: data.question,
                bloomLevel: data.bloomLevel,
                confidence: data.confidence,
                explanation: data.explanation,
                category: data.category,
              },
              parsedQuestions[0] || "Item",
            ),
          ];

      setResults(mappedResults);
      setSummary(data.summary || null);
      setExtractedItems(data.extractedItems || []);
      if (data.source === "pdf") {
        setSourceLabel(data.fileName || "Uploaded PDF");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <button
        onClick={analyzeQuestion}
        disabled={loading || (!isPdfUpload && parsedQuestions.length === 0)}
        className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg ${
          loading || (!isPdfUpload && parsedQuestions.length === 0)
            ? theme === "dark"
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-[#06151a] hover:shadow-xl transform hover:scale-105"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <span>
            {isPdfUpload
              ? "Extract Topics & Analyze PDF"
              : parsedQuestions.length > 1
                ? `Analyze ${parsedQuestions.length} Questions`
                : "Analyze Question"}
          </span>
        )}
      </button>

      {isPdfUpload && uploadedFile && (
        <p
          className={`mt-2 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}
        >
          Source: {uploadedFile.name}
        </p>
      )}

      {error && (
        <div
          className={`mt-6 p-4 rounded-xl flex items-start space-x-3 animate-fadeIn ${
            theme === "dark"
              ? "bg-red-950/40 border border-red-700"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className={theme === "dark" ? "text-red-300" : "text-red-700"}>
            {error}
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3
              className={`text-xl font-black tracking-tight ${
                theme === "dark" ? "text-slate-100" : "text-slate-900"
              }`}
            >
              Analysis Results ({results.length})
            </h3>
            {summary && (
              <div
                className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                  theme === "dark"
                    ? "bg-[#0e1e28] border border-slate-700 text-slate-300"
                    : "bg-slate-50 border border-slate-200 text-slate-700"
                }`}
              >
                LOTS {summary.lotsPercentage}% | MOTS {summary.motsPercentage}%
                | HOTS {summary.hotsPercentage}%
              </div>
            )}
          </div>

          {sourceLabel && (
            <div
              className={`px-4 py-3 rounded-xl text-sm ${
                theme === "dark"
                  ? "bg-[#0e1e28] border border-slate-700 text-slate-300"
                  : "bg-slate-50 border border-slate-200 text-slate-700"
              }`}
            >
              Analyzed from PDF: {sourceLabel}
            </div>
          )}

          {extractedItems.length > 0 && (
            <div
              className={`p-4 rounded-xl ${
                theme === "dark"
                  ? "bg-[#0e1e28] border border-slate-700"
                  : "bg-slate-50 border border-slate-200"
              }`}
            >
              <p
                className={`text-sm font-semibold mb-2 ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Extracted Topics/Questions ({extractedItems.length})
              </p>
              <p
                className={`text-sm whitespace-pre-wrap ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {extractedItems.join("\n")}
              </p>
            </div>
          )}

          {results.map((result, idx) => {
            const levelMeta = getLevelMeta(result.levelIndex);

            return (
              <div
                key={`${result.question}-${idx}`}
                className={`rounded-2xl shadow-xl overflow-hidden ${
                  theme === "dark"
                    ? "bg-[#0f1f28]/80 border border-slate-700"
                    : "bg-white border border-slate-200"
                }`}
              >
                <div
                  className="p-6 border-b"
                  style={{
                    borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
                    background:
                      theme === "dark"
                        ? `linear-gradient(135deg, ${levelMeta.color}15, transparent)`
                        : `linear-gradient(135deg, ${levelMeta.color}10, transparent)`,
                  }}
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="space-y-2">
                      <p
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Question {idx + 1}
                      </p>
                      <p
                        className={`text-base ${
                          theme === "dark" ? "text-slate-200" : "text-slate-800"
                        }`}
                      >
                        {result.question}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-7 h-7 text-green-500" />
                      <div>
                        <h4
                          className="text-xl font-bold"
                          style={{ color: levelMeta.color }}
                        >
                          {result.bloomLevel}
                        </h4>
                        <p
                          className={`text-sm ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-600"
                          }`}
                        >
                          {result.levelIndex >= 0
                            ? `Bloom's Taxonomy Level ${result.levelIndex + 1}`
                            : "Bloom's Taxonomy Level unavailable"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex h-2">
                  {bloomLevels.map((level, levelIdx) => (
                    <div
                      key={level.name}
                      className={`flex-1 transition-all duration-500 ${
                        levelIdx === result.levelIndex
                          ? "h-2"
                          : "h-2 opacity-30"
                      }`}
                      style={{ backgroundColor: level.color }}
                    />
                  ))}
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h5
                      className={`text-lg font-semibold mb-2 ${
                        theme === "dark" ? "text-slate-200" : "text-slate-800"
                      }`}
                    >
                      Analysis Explanation
                    </h5>
                    <p
                      className={
                        theme === "dark" ? "text-slate-300" : "text-slate-700"
                      }
                    >
                      {result.explanation}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5
                        className={`text-lg font-semibold ${
                          theme === "dark" ? "text-slate-200" : "text-slate-800"
                        }`}
                      >
                        Confidence Score
                      </h5>
                      <span
                        className="text-2xl font-bold"
                        style={{ color: levelMeta.color }}
                      >
                        {result.confidence}%
                      </span>
                    </div>
                    <div
                      className={`h-3 rounded-full overflow-hidden ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(result.confidence, 100)}%`,
                          backgroundColor: levelMeta.color,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-xl ${
                      theme === "dark" ? "bg-slate-800/70" : "bg-slate-50"
                    }`}
                  >
                    <h5
                      className={`text-sm font-semibold mb-2 uppercase tracking-wide ${
                        theme === "dark" ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      Level Description
                    </h5>
                    <p
                      className={`text-base ${
                        theme === "dark" ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {result.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuestionAnalyzer;
