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
          ? "bg-[#050b10] text-slate-100"
          : "bg-[#f4f7f8] text-slate-900"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_12%_8%,rgba(34,197,94,0.18),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(56,189,248,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]"
            : "bg-[radial-gradient(circle_at_12%_8%,rgba(34,197,94,0.12),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(14,165,233,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.55),transparent)]"
        }`}
      />

      <header
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
          theme === "dark"
            ? "bg-[#050b10]/80 border-white/10"
            : "bg-[#f4f7f8]/80 border-slate-200/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-cyan-500/15 ${
                  theme === "dark"
                    ? "bg-white/5 border border-white/10"
                    : "bg-white border border-slate-200"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full border-2 ${
                    theme === "dark" ? "border-cyan-300" : "border-cyan-600"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-black tracking-tight">
                    Bloom Lever
                  </h1>
                </div>
                <p
                  className={`text-xs sm:text-sm mt-1 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Assessment intelligence for teams that need fast, reliable
                  content triage.
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className={`px-3 py-2.5 rounded-xl transition-all duration-300 border flex items-center gap-2 font-semibold ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 hover:border-cyan-400/50 hover:text-cyan-200 text-slate-200"
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
          theme === "dark" ? "border-white/10" : "border-slate-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p
            className={`text-center text-sm tracking-wide ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Created by Zephyrus Technologies 2026 • Contact
            divyanshu@zephyrus.in
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
