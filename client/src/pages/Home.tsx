import React, { useState } from "react";
import { FileText, Upload, X, CheckCircle } from "lucide-react";
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
    <div className="space-y-8">
      <div className="text-center space-y-5 animate-fadeIn">
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}
        >
          AI-Powered Bloom's Taxonomy Analysis
        </h2>
        <p
          className={`text-base sm:text-lg max-w-3xl mx-auto leading-relaxed ${
            theme === "dark" ? "text-slate-300" : "text-slate-600"
          }`}
        >
          Ensure NAAC compliance and educational excellence with instant,
          accurate classification of learning objectives using our AI
        </p>
      </div>

      <div
        className={`flex flex-col sm:flex-row gap-3 p-2 rounded-2xl shadow-lg ${
          theme === "dark"
            ? "bg-[#0f1f28]/70 border border-slate-700"
            : "bg-white/80 border border-slate-200"
        }`}
      >
        <button
          onClick={() => setActiveTab("single")}
          className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeTab === "single"
              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-[#061219] shadow-lg"
              : theme === "dark"
                ? "text-slate-300 hover:text-white hover:bg-slate-800"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Single Question Analyzer</span>
        </button>
        <button
          onClick={() => setActiveTab("assessment")}
          className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeTab === "assessment"
              ? "bg-gradient-to-r from-amber-400 to-orange-500 text-[#221106] shadow-lg"
              : theme === "dark"
                ? "text-slate-300 hover:text-white hover:bg-slate-800"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Upload className="w-5 h-5" />
          <span>Topic Question Generator</span>
        </button>
      </div>

      <div className="animate-fadeIn">
        {activeTab === "single" ? (
          <div className="space-y-6">
            <div
              className={`flex gap-3 p-2 rounded-2xl w-fit ${
                theme === "dark"
                  ? "bg-[#0f1f28]/70 border border-slate-700"
                  : "bg-white border border-slate-200"
              }`}
            >
              <button
                onClick={() => {
                  setInputMode("paste");
                  clearQuestion();
                }}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  inputMode === "paste"
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-[#081118] shadow"
                    : theme === "dark"
                      ? "text-slate-300 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Paste Question(s)
              </button>
              <button
                onClick={() => {
                  setInputMode("upload");
                  clearQuestion();
                }}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  inputMode === "upload"
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-[#261306] shadow"
                    : theme === "dark"
                      ? "text-slate-300 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Upload TXT/PDF
              </button>
            </div>

            {inputMode === "paste" ? (
              <div
                className={`p-6 rounded-2xl shadow-xl ${
                  theme === "dark"
                    ? "bg-[#0f1f28]/80 border border-slate-700"
                    : "bg-white border border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <label
                    className={`block text-sm font-semibold ${
                      theme === "dark" ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    Enter Your Question(s)
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
                    {questionText && (
                      <button
                        onClick={clearQuestion}
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
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter one question per line. Example:\n1. Define photosynthesis.\n2. Compare mitosis and meiosis.\n3. Design an experiment to test soil pH impact on plant growth."
                  rows={6}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-slate-900/70 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-cyan-500/25"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/25"
                  }`}
                />
              </div>
            ) : (
              <div
                className={`p-6 rounded-2xl shadow-xl ${
                  theme === "dark"
                    ? "bg-[#0f1f28]/80 border border-slate-700"
                    : "bg-white border border-slate-200"
                }`}
              >
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    theme === "dark" ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  Upload Question File
                </label>

                {/* Drag and Drop Area */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                    isDragging
                      ? "border-cyan-400 bg-cyan-500/10"
                      : uploadedFile
                        ? theme === "dark"
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-emerald-500 bg-emerald-50"
                        : theme === "dark"
                          ? "border-slate-600 hover:border-cyan-500"
                          : "border-slate-300 hover:border-cyan-500"
                  }`}
                >
                  {uploadedFile ? (
                    <div className="flex flex-col items-center space-y-4">
                      <CheckCircle className="w-16 h-16 text-green-500" />
                      <div>
                        <p
                          className={`text-lg font-semibold ${
                            theme === "dark"
                              ? "text-slate-100"
                              : "text-slate-800"
                          }`}
                        >
                          File Uploaded Successfully
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-slate-600"
                          }`}
                        >
                          {uploadedFile.name} (
                          {(uploadedFile.size / 1024).toFixed(2)} KB)
                        </p>
                      </div>
                      <button
                        onClick={clearQuestion}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          theme === "dark"
                            ? "bg-slate-800 hover:bg-slate-700 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                        }`}
                      >
                        <X className="w-4 h-4" />
                        <span>Remove File</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      <Upload
                        className={`w-16 h-16 ${
                          theme === "dark" ? "text-slate-500" : "text-slate-400"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-lg font-semibold ${
                            theme === "dark"
                              ? "text-slate-200"
                              : "text-slate-700"
                          }`}
                        >
                          Drag and drop your file here
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            theme === "dark"
                              ? "text-slate-500"
                              : "text-slate-500"
                          }`}
                        >
                          or click to browse (TXT or PDF)
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
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-[#041217] rounded-lg font-semibold cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Browse Files
                      </label>
                    </div>
                  )}
                </div>

                {/* Display file content preview if uploaded */}
                {uploadedFile && questionText && (
                  <div className="mt-4">
                    <p
                      className={`text-sm font-semibold mb-2 ${
                        theme === "dark" ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      File Content Preview:
                    </p>
                    <div
                      className={`p-4 rounded-lg max-h-32 overflow-y-auto ${
                        theme === "dark"
                          ? "bg-slate-900/60 text-slate-300"
                          : "bg-slate-50 text-slate-700"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {questionText}
                      </p>
                    </div>
                  </div>
                )}

                {uploadedFile &&
                  (uploadedFile.type === "application/pdf" ||
                    uploadedFile.name.toLowerCase().endsWith(".pdf")) && (
                    <div className="mt-4">
                      <p
                        className={`text-sm font-semibold mb-2 ${
                          theme === "dark" ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        PDF Ready:
                      </p>
                      <div
                        className={`p-4 rounded-lg ${
                          theme === "dark"
                            ? "bg-slate-900/60 text-slate-300"
                            : "bg-slate-50 text-slate-700"
                        }`}
                      >
                        <p className="text-sm">
                          The uploaded PDF will be parsed on the server to
                          extract questions/topics for analysis.
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Question Analyzer Component */}
            <QuestionAnalyzer
              questionText={questionText}
              uploadedFile={uploadedFile}
              theme={theme}
            />
          </div>
        ) : (
          <div
            className={`p-6 rounded-2xl shadow-xl ${
              theme === "dark"
                ? "bg-[#0f1f28]/80 border border-slate-700"
                : "bg-white border border-slate-200"
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
