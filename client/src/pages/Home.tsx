import React, { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  FileText,
  Layers3,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import QuestionAnalyzer from "../components/QuestionAnalyzer";
import AssessmentAnalyzer from "../components/AssessmentAnalyzer";

interface HomeProps {
  theme: "light" | "dark";
}

type Tab = "single" | "assessment";
type InputMode = "paste" | "upload";

const Home: React.FC<HomeProps> = ({ theme }) => {
  const [activeTab, setActiveTab] = useState<Tab>("single");
  const [inputMode, setInputMode] = useState<InputMode>("paste");
  const [questionText, setQuestionText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    if (!file) return;

    const isTxt = file.type === "text/plain" || file.name.endsWith(".txt");
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isTxt && !isPdf) return;

    setUploadedFile(file);

    if (isTxt) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setQuestionText(text);
      };
      reader.readAsText(file);
      return;
    }

    // PDF content is extracted on backend.
    setQuestionText("");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearQuestion = () => {
    setQuestionText("");
    setUploadedFile(null);
  };

  const characterCount = questionText.length;

  return (
    <div className="space-y-10 animate-fadeIn">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] items-stretch">
        <div
          className={`relative overflow-hidden rounded-[2rem] border p-8 sm:p-10 shadow-[0_24px_80px_rgba(15,23,42,0.16)] ${
            theme === "dark"
              ? "bg-[linear-gradient(180deg,rgba(8,14,20,0.95),rgba(6,10,16,0.92))] border-white/10"
              : "bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(247,250,252,0.92))] border-slate-200"
          }`}
        >
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_18%,rgba(34,197,94,0.16),transparent_28%),radial-gradient(circle_at_78%_16%,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(15,118,110,0.12),transparent_34%)]" />
          <div className="relative max-w-2xl space-y-6">
            <div className="space-y-4">
              <h2
                className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[0.96] ${
                  theme === "dark" ? "text-white" : "text-slate-950"
                }`}
              >
                Production-grade intelligence for modern curricula.
              </h2>
              <p
                className={`text-base sm:text-lg leading-8 max-w-xl ${
                  theme === "dark" ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Classify content, generate aligned assessments, and validate
                learning objectives with a professional workflow designed for
                educational excellence at scale.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                "Bulk document intake",
                "Instant question triage",
                "Topic-to-question generation",
              ].map((item) => (
                <span
                  key={item}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border ${
                    theme === "dark"
                      ? "bg-white/5 text-slate-200 border-white/10"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setActiveTab("single")}
                className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold transition-all ${
                  theme === "dark"
                    ? "bg-white text-slate-950 hover:bg-slate-100"
                    : "bg-slate-950 text-white hover:bg-slate-800"
                }`}
              >
                Open analyzer
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab("assessment")}
                className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold border transition-all ${
                  theme === "dark"
                    ? "bg-white/5 text-slate-100 border-white/10 hover:border-cyan-400/40"
                    : "bg-white text-slate-800 border-slate-200 hover:border-cyan-400/40"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Generate question sets
              </button>
            </div>
          </div>
        </div>

        <div
          className={`rounded-[2rem] border p-6 sm:p-8 shadow-[0_24px_80px_rgba(15,23,42,0.16)] ${
            theme === "dark"
              ? "bg-slate-950/80 border-white/10"
              : "bg-white/90 border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-[0.24em] ${
                  theme === "dark" ? "text-cyan-300" : "text-cyan-700"
                }`}
              >
                Workflow
              </p>
              <h3
                className={`mt-2 text-2xl font-black tracking-tight ${
                  theme === "dark" ? "text-white" : "text-slate-950"
                }`}
              >
                Immediate analysis
              </h3>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: FileText,
                label: "Content Ingestion",
                value: "Direct text input or document upload",
                tone: "emerald",
              },
              {
                icon: BarChart3,
                label: "Classification",
                value: "Taxonomy mapping with confidence scores",
                tone: "cyan",
              },
              {
                icon: Layers3,
                label: "Content Generation",
                value: "Automated set generation from topics",
                tone: "slate",
              },
            ].map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.label}
                  className={`flex items-center gap-4 rounded-2xl border px-4 py-4 ${
                    theme === "dark"
                      ? "bg-white/5 border-white/10"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      step.tone === "emerald"
                        ? theme === "dark"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-emerald-50 text-emerald-700"
                        : step.tone === "cyan"
                          ? theme === "dark"
                            ? "bg-cyan-400/10 text-cyan-300"
                            : "bg-cyan-50 text-cyan-700"
                          : theme === "dark"
                            ? "bg-white/10 text-slate-200"
                            : "bg-white text-slate-700"
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                        theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`mt-1 text-sm sm:text-base font-medium ${
                        theme === "dark" ? "text-slate-100" : "text-slate-800"
                      }`}
                    >
                      {step.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div
        className={`flex flex-col sm:flex-row gap-3 p-2 rounded-[1.75rem] border shadow-lg ${
          theme === "dark"
            ? "bg-white/5 border-white/10"
            : "bg-white/90 border-slate-200"
        }`}
      >
        <button
          onClick={() => setActiveTab("single")}
          className={`flex-1 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "single"
              ? "bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950"
              : theme === "dark"
                ? "text-slate-300 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Classify content</span>
        </button>
        <button
          onClick={() => setActiveTab("assessment")}
          className={`flex-1 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "assessment"
              ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-lg"
              : theme === "dark"
                ? "text-slate-300 hover:text-white hover:bg-white/5"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Upload className="w-5 h-5" />
          <span>Generate from topic</span>
        </button>
      </div>

      <div className="animate-fadeIn">
        {activeTab === "single" ? (
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-center">
              <div
                className={`inline-flex w-fit items-center gap-2 rounded-2xl border p-2 ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10"
                    : "bg-white border-slate-200"
                }`}
              >
                <button
                  onClick={() => {
                    setInputMode("paste");
                    clearQuestion();
                  }}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    inputMode === "paste"
                      ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                      : theme === "dark"
                        ? "text-slate-300 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Paste text
                </button>
                <button
                  onClick={() => {
                    setInputMode("upload");
                    clearQuestion();
                  }}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    inputMode === "upload"
                      ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-sm"
                      : theme === "dark"
                        ? "text-slate-300 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Upload file
                </button>
              </div>

              <p
                className={`text-sm sm:text-base leading-7 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Use the same analyzer flow, but presented as a clean product
                workflow for stakeholders and demos.
              </p>
            </div>

            {inputMode === "paste" ? (
              <div
                className={`relative overflow-hidden rounded-[1.75rem] border p-6 sm:p-8 ${
                  theme === "dark"
                    ? "bg-slate-950/70 border-white/10"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.08),transparent_35%)]" />
                <div className="relative flex items-center justify-between gap-3 mb-3">
                  <label
                    className={`block text-sm font-semibold tracking-wide uppercase ${
                      theme === "dark" ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    Content input
                  </label>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm ${
                        characterCount > 500
                          ? "text-amber-500"
                          : theme === "dark"
                            ? "text-slate-400"
                            : "text-slate-500"
                      }`}
                    >
                      {characterCount} characters
                    </span>
                    {questionText && (
                      <button
                        onClick={clearQuestion}
                        className={`text-sm font-medium transition-colors ${
                          theme === "dark"
                            ? "text-slate-400 hover:text-white"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Paste a question set, one item per line. Example:\n1. Define photosynthesis.\n2. Compare mitosis and meiosis.\n3. Design an experiment to test soil pH impact on plant growth."
                  rows={6}
                  className={`relative w-full px-5 py-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${
                    theme === "dark"
                      ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                  }`}
                />
              </div>
            ) : (
              <div
                className={`relative overflow-hidden rounded-[1.75rem] border p-6 sm:p-8 ${
                  theme === "dark"
                    ? "bg-slate-950/70 border-white/10"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.08),transparent_35%)]" />
                <label
                  className={`relative block text-sm font-semibold tracking-wide uppercase mb-3 ${
                    theme === "dark" ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  Upload document
                </label>

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative border-2 border-dashed rounded-[1.5rem] p-10 sm:p-12 text-center transition-all duration-300 ${
                    isDragging
                      ? "border-cyan-400 bg-cyan-500/10"
                      : uploadedFile
                        ? theme === "dark"
                          ? "border-emerald-400 bg-emerald-500/10"
                          : "border-emerald-400 bg-emerald-50"
                        : theme === "dark"
                          ? "border-white/15 hover:border-cyan-400/50 bg-white/[0.03]"
                          : "border-slate-300 hover:border-cyan-400/60 bg-slate-50/70"
                  }`}
                >
                  {uploadedFile ? (
                    <div className="flex flex-col items-center gap-4">
                      <CheckCircle className="w-14 h-14 text-emerald-500" />
                      <div>
                        <p
                          className={`text-lg font-semibold ${
                            theme === "dark"
                              ? "text-slate-100"
                              : "text-slate-900"
                          }`}
                        >
                          File ready for analysis
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          {uploadedFile.name} •{" "}
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={clearQuestion}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                          theme === "dark"
                            ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                            : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-200"
                        }`}
                      >
                        <X className="w-4 h-4" />
                        <span>Remove file</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <Upload
                        className={`w-14 h-14 ${
                          theme === "dark" ? "text-slate-400" : "text-slate-500"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-lg font-semibold ${
                            theme === "dark"
                              ? "text-slate-100"
                              : "text-slate-900"
                          }`}
                        >
                          Drag and drop a TXT or PDF here
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            theme === "dark"
                              ? "text-slate-500"
                              : "text-slate-500"
                          }`}
                        >
                          or browse files from your device
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".txt,.pdf,application/pdf,text/plain"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold cursor-pointer transition-all duration-300 shadow-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:shadow-xl hover:translate-y-[-1px]"
                      >
                        Browse files
                        <ArrowRight className="w-4 h-4" />
                      </label>
                    </div>
                  )}
                </div>

                {uploadedFile && questionText && (
                  <div className="relative mt-4">
                    <p
                      className={`text-sm font-semibold mb-2 ${
                        theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Parsed preview
                    </p>
                    <div
                      className={`p-4 rounded-2xl max-h-32 overflow-y-auto ${
                        theme === "dark"
                          ? "bg-white/5 text-slate-300"
                          : "bg-slate-50 text-slate-700"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-6">
                        {questionText}
                      </p>
                    </div>
                  </div>
                )}

                {uploadedFile &&
                  (uploadedFile.type === "application/pdf" ||
                    uploadedFile.name.toLowerCase().endsWith(".pdf")) && (
                    <div className="relative mt-4">
                      <p
                        className={`text-sm font-semibold mb-2 ${
                          theme === "dark" ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Processing note
                      </p>
                      <div
                        className={`p-4 rounded-2xl ${
                          theme === "dark"
                            ? "bg-white/5 text-slate-300"
                            : "bg-slate-50 text-slate-700"
                        }`}
                      >
                        <p className="text-sm leading-6">
                          PDF content is extracted on the backend, so the UI
                          stays fast and the workflow feels production-ready.
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            )}

            <div
              className={`rounded-[1.75rem] border p-4 sm:p-6 ${
                theme === "dark"
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-slate-200"
              }`}
            >
              <QuestionAnalyzer
                questionText={questionText}
                uploadedFile={uploadedFile}
                theme={theme}
              />
            </div>
          </div>
        ) : (
          <div
            className={`rounded-[1.75rem] border p-4 sm:p-6 ${
              theme === "dark"
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200"
            }`}
          >
            <AssessmentAnalyzer theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
