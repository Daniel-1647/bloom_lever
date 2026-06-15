import React, { useState } from "react";
import { Loader2, AlertCircle, Sparkles, ListChecks } from "lucide-react";
import { API_BASE_URL } from "../config";

interface AssessmentAnalyzerProps {
  theme: "light" | "dark";
}

interface GenerationResult {
  topic: string;
  requestedCount: number;
  generatedCount: number;
  questions: string[];
  questionDetails?: Array<{
    question: string;
    bloomLevel: string;
    category: "LOTS" | "MOTS" | "HOTS";
  }>;
}

const AssessmentAnalyzer: React.FC<AssessmentAnalyzerProps> = ({ theme }) => {
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string>("");

  const generateQuestions = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic to generate questions");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/topic/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          count: questionCount,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const rawBody = await response.text();

      if (!contentType.includes("application/json")) {
        throw new Error(
          `Topic generator API returned non-JSON response. Check backend URL/server: ${API_BASE_URL}`,
        );
      }

      let data: any;
      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        throw new Error(
          `Topic generator API returned invalid JSON. Check backend URL/server: ${API_BASE_URL}`,
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  const characterCount = topic.length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <div className="flex items-center justify-between mb-3">
          <label
            className={`block text-sm font-semibold ${
              theme === "dark" ? "text-slate-200" : "text-slate-700"
            }`}
          >
            Enter Topic
          </label>
          <div className="flex items-center space-x-3">
            <span
              className={`text-sm ${
                characterCount > 500
                  ? "text-amber-500"
                  : theme === "dark"
                    ? "text-slate-400"
                    : "text-slate-600"
              }`}
            >
              {characterCount} characters
            </span>
            {topic && (
              <button
                onClick={() => setTopic("")}
                className={`text-sm font-medium transition-colors ${
                  theme === "dark"
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Example: Renewable energy systems for smart cities"
          rows={5}
          className={`w-full px-5 py-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${
            theme === "dark"
              ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20"
              : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
          }`}
        />
      </div>

      <div>
        <label
          htmlFor="question-count"
          className={`block text-sm font-semibold mb-2 ${
            theme === "dark" ? "text-slate-200" : "text-slate-700"
          }`}
        >
          Number of Questions
        </label>
        <select
          id="question-count"
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
          className={`w-full sm:w-56 px-3 py-2.5 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
            theme === "dark"
              ? "bg-white/5 border-white/10 text-white focus:border-cyan-400 focus:ring-cyan-400/20"
              : "bg-white border-slate-200 text-slate-900 focus:border-cyan-500 focus:ring-cyan-500/20"
          }`}
        >
          {[3, 5, 8, 10, 15, 20].map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={generateQuestions}
        disabled={loading || !topic.trim()}
        className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
          loading || !topic.trim()
            ? theme === "dark"
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 hover:shadow-xl transform hover:-translate-y-0.5"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating Questions...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Create question set</span>
          </>
        )}
      </button>

      {error && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 ${
            theme === "dark"
              ? "bg-red-950/40 border border-red-700/70"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className={theme === "dark" ? "text-red-300" : "text-red-700"}>
            {error}
          </p>
        </div>
      )}

      {result && (
        <div
          className={`p-6 rounded-[1.75rem] shadow-xl border ${
            theme === "dark"
              ? "bg-slate-950/70 border-white/10"
              : "bg-white border border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <h3
                className={`text-xl font-semibold ${
                  theme === "dark" ? "text-slate-200" : "text-slate-800"
                }`}
              >
                Generated set
              </h3>
              <p
                className={`text-sm mt-1 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Topic: {result.topic}
              </p>
            </div>
            <div
              className={`px-3 py-2 rounded-2xl text-sm font-medium ${
                theme === "dark"
                  ? "bg-white/5 text-slate-200 border border-white/10"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {result.generatedCount} generated
            </div>
          </div>

          <div className="space-y-3">
            {(result.questionDetails && result.questionDetails.length > 0
              ? result.questionDetails
              : result.questions.map((question) => ({
                  question,
                  bloomLevel: "Unknown",
                  category: "LOTS" as const,
                }))
            ).map((item, index) => (
              <div
                key={`${index}-${item.question.slice(0, 20)}`}
                className={`p-4 rounded-2xl border ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <p
                  className={`text-sm font-semibold mb-1 uppercase tracking-[0.18em] ${
                    theme === "dark" ? "text-cyan-300" : "text-cyan-700"
                  }`}
                >
                  <ListChecks className="inline w-4 h-4 mr-1" />
                  Prompt {index + 1}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      theme === "dark"
                        ? "bg-cyan-400/10 text-cyan-300"
                        : "bg-cyan-100 text-cyan-700"
                    }`}
                  >
                    Bloom: {item.bloomLevel}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      theme === "dark"
                        ? "bg-slate-700 text-slate-300"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
                <p
                  className={`leading-7 ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}
                >
                  {item.question}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentAnalyzer;
