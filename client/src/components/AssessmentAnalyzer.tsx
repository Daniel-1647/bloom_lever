import React, { useState } from "react";
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  FileText,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { API_BASE_URL } from "../config";

interface AssessmentAnalyzerProps {
  theme: "light" | "dark";
}

interface AssessmentResult {
  totalQuestions: number;
  lotsPercentage: number;
  motsPercentage: number;
  hotsPercentage: number;
  distribution: Array<{ level: string; count: number; percentage: number }>;
  compliance: {
    meetsStandards: boolean;
    feedback: string[];
  };
  recommendations: string[];
}

const bloomLevels = [
  { name: "Remembering", color: "#EF4444", category: "LOTS" },
  { name: "Understanding", color: "#F97316", category: "LOTS" },
  { name: "Applying", color: "#EAB308", category: "MOTS" },
  { name: "Analyzing", color: "#22C55E", category: "MOTS" },
  { name: "Evaluating", color: "#3B82F6", category: "HOTS" },
  { name: "Creating", color: "#A855F7", category: "HOTS" },
];

const AssessmentAnalyzer: React.FC<AssessmentAnalyzerProps> = ({ theme }) => {
  const [assessmentText, setAssessmentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string>("");

  const analyzeAssessment = async () => {
    const questions = assessmentText.split("\n").filter((q) => q.trim());

    if (questions.length === 0) {
      setError("Please paste at least one question (one per line)");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze assessment");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const questionCount = assessmentText
    .split("\n")
    .filter((q) => q.trim()).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Textarea */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label
            className={`block text-sm font-semibold ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Paste Assessment Questions (One per line)
          </label>
          <div className="flex items-center space-x-3">
            <span
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {questionCount} question{questionCount !== 1 ? "s" : ""}
            </span>
            {assessmentText && (
              <button
                onClick={() => setAssessmentText("")}
                className={`text-sm font-medium transition-colors ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <textarea
          value={assessmentText}
          onChange={(e) => setAssessmentText(e.target.value)}
          placeholder="Example:&#10;Define machine learning and its applications.&#10;Compare supervised and unsupervised learning algorithms.&#10;Design a neural network architecture for image classification."
          rows={12}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 font-mono text-sm ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/30"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/30"
          }`}
        />
      </div>

      {/* Analyze Button */}
      <button
        onClick={analyzeAssessment}
        disabled={loading || questionCount === 0}
        className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
          loading || questionCount === 0
            ? theme === "dark"
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing Assessment...</span>
          </>
        ) : (
          <span>Analyze Assessment Paper</span>
        )}
      </button>

      {/* Error */}
      {error && (
        <div
          className={`p-4 rounded-lg flex items-start space-x-3 ${
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

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Total Questions",
                value: result?.totalQuestions ?? 0,
                color: "text-purple-500",
              },
              {
                title: "LOTS",
                value: result?.lotsPercentage?.toFixed(1) ?? "0.0",
                color: "text-orange-500",
                recommended: "20-30%",
              },
              {
                title: "MOTS",
                value: result?.motsPercentage?.toFixed(1) ?? "0.0",
                color: "text-yellow-500",
                recommended: "20-30%",
              },
              {
                title: "HOTS",
                value: result?.hotsPercentage?.toFixed(1) ?? "0.0",
                color: "text-blue-500",
                recommended: "40-50%",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-6 rounded-xl shadow-lg ${
                  theme === "dark"
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${item.color}`}>
                      {item.value}%
                    </p>
                    {item.recommended && (
                      <p className="text-xs mt-1 text-gray-500">
                        Recommended: {item.recommended}
                      </p>
                    )}
                  </div>
                  <TrendingUp
                    className={`w-10 h-10 ${item.color} opacity-50`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div
              className={`p-6 rounded-xl shadow-lg ${
                theme === "dark"
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Distribution by Bloom's Level
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={result?.distribution ?? []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme === "dark" ? "#374151" : "#E5E7EB"}
                  />
                  <XAxis
                    dataKey="level"
                    tick={{
                      fill: theme === "dark" ? "#9CA3AF" : "#6B7280",
                      fontSize: 12,
                    }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fill: theme === "dark" ? "#9CA3AF" : "#6B7280" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
                      border: `1px solid ${
                        theme === "dark" ? "#374151" : "#E5E7EB"
                      }`,
                      borderRadius: "8px",
                      color: theme === "dark" ? "#F3F4F6" : "#1F2937",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {result?.distribution?.map((entry, index) => {
                      const color =
                        bloomLevels.find((b) => b.name === entry.level)
                          ?.color ?? "#8884d8";
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div
              className={`p-6 rounded-xl shadow-lg ${
                theme === "dark"
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Percentage Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={result?.distribution ?? []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => {
                      const data = props.payload as {
                        level?: string;
                        percentage?: number;
                      };
                      return `${data.level?.slice(0, 3) ?? ""}: ${
                        data.percentage ?? 0
                      }%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {result?.distribution?.map((entry, index) => {
                      const color =
                        bloomLevels.find((b) => b.name === entry.level)
                          ?.color ?? "#8884d8";
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
                      border: `1px solid ${
                        theme === "dark" ? "#374151" : "#E5E7EB"
                      }`,
                      borderRadius: "8px",
                      color: theme === "dark" ? "#F3F4F6" : "#1F2937",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Compliance */}
          <div
            className={`p-6 rounded-xl shadow-lg ${
              result?.compliance?.meetsStandards
                ? theme === "dark"
                  ? "bg-green-900/30 border border-green-700"
                  : "bg-green-50 border border-green-200"
                : theme === "dark"
                ? "bg-yellow-900/30 border border-yellow-700"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            <div className="flex items-start space-x-3">
              <CheckCircle
                className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                  result?.compliance?.meetsStandards
                    ? "text-green-500"
                    : "text-yellow-500"
                }`}
              />
              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold mb-3 ${
                    result?.compliance?.meetsStandards
                      ? theme === "dark"
                        ? "text-green-300"
                        : "text-green-800"
                      : theme === "dark"
                      ? "text-yellow-300"
                      : "text-yellow-800"
                  }`}
                >
                  NAAC Compliance Assessment
                </h3>
                <ul className="space-y-2">
                  {result?.compliance?.feedback?.map((item, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start space-x-2 ${
                        result?.compliance?.meetsStandards
                          ? theme === "dark"
                            ? "text-green-200"
                            : "text-green-700"
                          : theme === "dark"
                          ? "text-yellow-200"
                          : "text-yellow-700"
                      }`}
                    >
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div
            className={`p-6 rounded-xl shadow-lg ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Recommendations for Improvement
            </h3>
            <ul className="space-y-3">
              {result?.recommendations?.map((item, idx) => (
                <li
                  key={idx}
                  className={`flex items-start space-x-3 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <span className="text-purple-500 font-bold">{idx + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentAnalyzer;
