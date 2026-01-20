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
    if (file && (file.type === "text/plain" || file.name.endsWith(".txt"))) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setQuestionText(text);
      };
      reader.readAsText(file);
    }
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
      {/* Welcome Section */}
      <div className="text-center space-y-4 animate-fadeIn">
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          AI-Powered Bloom's Taxonomy Analysis
        </h2>
        <p
          className={`text-lg sm:text-xl max-w-3xl mx-auto ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Ensure NAAC compliance and educational excellence with instant,
          accurate classification of learning objectives using our AI
        </p>
      </div>

      {/* Tab Navigation */}
      <div
        className={`flex flex-col sm:flex-row gap-3 p-2 rounded-xl ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        <button
          onClick={() => setActiveTab("single")}
          className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeTab === "single"
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
              : theme === "dark"
              ? "text-gray-400 hover:text-white hover:bg-gray-700"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Single Question Analyzer</span>
        </button>
        <button
          onClick={() => setActiveTab("assessment")}
          className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeTab === "assessment"
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
              : theme === "dark"
              ? "text-gray-400 hover:text-white hover:bg-gray-700"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
          }`}
        >
          <Upload className="w-5 h-5" />
          <span>Assessment Paper Analyzer</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {activeTab === "single" ? (
          <div className="space-y-6">
            {/* Input Mode Toggle */}
            <div
              className={`flex gap-3 p-2 rounded-xl w-fit ${
                theme === "dark" ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <button
                onClick={() => {
                  setInputMode("paste");
                  clearQuestion();
                }}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  inputMode === "paste"
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                    : theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Paste Question
              </button>
              {/* <button
                onClick={() => {
                  setInputMode("upload");
                  clearQuestion();
                }}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  inputMode === "upload"
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                    : theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Upload File
              </button> */}
            </div>

            {/* Input Section */}
            {inputMode === "paste" ? (
              <div
                className={`p-6 rounded-xl shadow-lg ${
                  theme === "dark"
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <label
                    className={`block text-sm font-semibold ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Enter Your Question
                  </label>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-sm ${
                        characterCount > 500
                          ? "text-orange-500"
                          : theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {characterCount} characters
                    </span>
                    {questionText && (
                      <button
                        onClick={clearQuestion}
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
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Example: Analyze the impact of machine learning algorithms on modern healthcare systems and propose improvements."
                  rows={6}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/30"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/30"
                  }`}
                />
              </div>
            ) : (
              <div
                className={`p-6 rounded-xl shadow-lg ${
                  theme === "dark"
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Upload Question File
                </label>

                {/* Drag and Drop Area */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                    isDragging
                      ? "border-purple-500 bg-purple-500/10"
                      : uploadedFile
                      ? theme === "dark"
                        ? "border-green-500 bg-green-500/10"
                        : "border-green-500 bg-green-50"
                      : theme === "dark"
                      ? "border-gray-600 hover:border-purple-500"
                      : "border-gray-300 hover:border-purple-500"
                  }`}
                >
                  {uploadedFile ? (
                    <div className="flex flex-col items-center space-y-4">
                      <CheckCircle className="w-16 h-16 text-green-500" />
                      <div>
                        <p
                          className={`text-lg font-semibold ${
                            theme === "dark" ? "text-gray-200" : "text-gray-800"
                          }`}
                        >
                          File Uploaded Successfully
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
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
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
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
                          theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-lg font-semibold ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Drag and drop your file here
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            theme === "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          or click to browse (TXT files only)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      File Content Preview:
                    </p>
                    <div
                      className={`p-4 rounded-lg max-h-32 overflow-y-auto ${
                        theme === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {questionText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Question Analyzer Component */}
            <QuestionAnalyzer questionText={questionText} theme={theme} />
          </div>
        ) : (
          <div
            className={`p-6 rounded-xl shadow-lg ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
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
