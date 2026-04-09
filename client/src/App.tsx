import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import Home from "./pages/Home";
import "./index.css";

const App: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Update document class and save preference
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div
      className={`min-h-screen relative overflow-x-hidden transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#071218] text-slate-100"
          : "bg-[#f7f8f6] text-slate-900"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_15%_10%,rgba(16,185,129,0.2),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(14,165,233,0.18),transparent_35%)]"
            : "bg-[radial-gradient(circle_at_12%_10%,rgba(16,185,129,0.14),transparent_40%),radial-gradient(circle_at_92%_2%,rgba(245,158,11,0.12),transparent_35%)]"
        }`}
      />

      <header
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
          theme === "dark"
            ? "bg-[#071218]/80 border-emerald-900/50"
            : "bg-[#f7f8f6]/80 border-emerald-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm tracking-wider transition-colors shadow-lg ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-emerald-500 to-cyan-500 text-[#041015]"
                    : "bg-gradient-to-br from-emerald-600 to-cyan-500 text-white"
                }`}
              >
                QR
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Question Repository
                </h1>
                <p
                  className={`text-xs tracking-wide uppercase ${
                    theme === "dark"
                      ? "text-emerald-300/90"
                      : "text-emerald-700"
                  }`}
                >
                  AI-Powered Taxonomy Analysis
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className={`px-3 py-2.5 rounded-xl transition-all duration-300 border flex items-center gap-2 font-semibold ${
                theme === "dark"
                  ? "bg-slate-900/80 border-slate-700 hover:border-emerald-500/60 hover:text-emerald-300 text-slate-200"
                  : "bg-white border-slate-300 hover:border-cyan-500/60 hover:text-cyan-700 text-slate-700"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              <span className="hidden sm:inline text-sm">
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Home theme={theme} />
      </main>

      <footer
        className={`mt-12 border-t transition-colors duration-300 ${
          theme === "dark" ? "border-emerald-900/50" : "border-emerald-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p
            className={`text-center text-sm tracking-wide ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            © 2026 Question Repository • Built by Divyanshu Upadhyaya, Himansh
            Sharma, Suhani Patidar and Ayush Kumar.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
