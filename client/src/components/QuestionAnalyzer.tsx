import React, { useState } from "react";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../config";

interface QuestionAnalyzerProps {
  questionText: string;
  theme: "light" | "dark";
}

interface AnalysisResult {
  bloomLevel: string;
  levelIndex: number;
  explanation: string;
  confidence: number;
  description: string;
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
  theme,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>("");

  const analyzeQuestion = async () => {
    if (!questionText.trim()) {
      setError("Please provide a question to analyze");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze question");
      }

      setResult({
        bloomLevel: data.bloomLevel,
        levelIndex: bloomLevels.findIndex((b) => b.name === data.bloomLevel),
        explanation: data.explanation,
        confidence: Math.round(data.confidence * 100),
        description:
          bloomLevels.find((b) => b.name === data.bloomLevel)?.description ||
          "",
      });
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Analyze Button */}
      <button
        onClick={analyzeQuestion}
        disabled={loading || !questionText.trim()}
        className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
          loading || !questionText.trim()
            ? theme === "dark"
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <span>Analyze Question</span>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div
          className={`mt-6 p-4 rounded-lg flex items-start space-x-3 animate-fadeIn ${
            theme === "dark"
              ? "bg-red-900/30 border border-red-700"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className={theme === "dark" ? "text-red-300" : "text-red-700"}>
            {error}
          </p>
        </div>
      )}

      {/* Results Card */}
      {result && (
        <div
          className={`mt-8 rounded-xl shadow-2xl overflow-hidden animate-fadeIn ${
            theme === "dark"
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          {/* Header with Bloom Level */}
          <div
            className="p-6 border-b"
            style={{
              borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
              background:
                theme === "dark"
                  ? `linear-gradient(135deg, ${
                      bloomLevels[result.levelIndex].color
                    }15, transparent)`
                  : `linear-gradient(135deg, ${
                      bloomLevels[result.levelIndex].color
                    }10, transparent)`,
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: bloomLevels[result.levelIndex].color }}
                  >
                    {result.bloomLevel}
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Bloom's Taxonomy Level {result.levelIndex + 1}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Color Indicator Bar */}
          <div className="flex h-3">
            {bloomLevels.map((level, idx) => (
              <div
                key={level.name}
                className={`flex-1 transition-all duration-500 ${
                  idx === result.levelIndex ? "h-3" : "h-2 opacity-40"
                }`}
                style={{ backgroundColor: level.color }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Explanation */}
            <div>
              <h4
                className={`text-lg font-semibold mb-2 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Analysis Explanation
              </h4>
              <p
                className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
              >
                {result.explanation}
              </p>
            </div>

            {/* Confidence Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Confidence Score
                </h4>
                <span
                  className="text-2xl font-bold"
                  style={{ color: bloomLevels[result.levelIndex].color }}
                >
                  {result.confidence}%
                </span>
              </div>
              <div
                className={`h-3 rounded-full overflow-hidden ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${result.confidence}%`,
                    backgroundColor: bloomLevels[result.levelIndex].color,
                  }}
                />
              </div>
            </div>

            {/* Level Description */}
            <div
              className={`p-4 rounded-lg ${
                theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <h4
                className={`text-sm font-semibold mb-2 uppercase tracking-wide ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Level Description
              </h4>
              <p
                className={`text-base ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {result.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionAnalyzer;
