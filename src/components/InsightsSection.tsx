import React, { useState, useEffect } from "react";
import { GemInsights, LogEntry, CarbonCategory } from "../types";
import { Sparkles, RefreshCw, AlertTriangle, Lightbulb, TrendingDown, HelpCircle, Star, ArrowRight } from "lucide-react";

interface InsightsSectionProps {
  logs: LogEntry[];
  xpLevel: number;
}

const CATEGORY_COLORS: Record<CarbonCategory, string> = {
  transportation: "bg-blue-50 text-blue-600 border-blue-100",
  energy: "bg-amber-50 text-amber-600 border-amber-100",
  diet: "bg-emerald-50 text-emerald-600 border-emerald-110",
  waste: "bg-pink-50 text-pink-600 border-pink-100"
};

export default function InsightsSection({ logs, xpLevel }: InsightsSectionProps) {
  const [insights, setInsights] = useState<GemInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Read current sums/categories to send to Gemini
  const activeCategoryValues: Record<CarbonCategory, number> = {
    transportation: 0,
    energy: 0,
    diet: 0,
    waste: 0
  };

  logs.forEach(log => {
    if (!log.isOffset) {
      activeCategoryValues[log.category] += log.emission;
    }
  });

  // Load cached insights on mount
  useEffect(() => {
    const cached = localStorage.getItem("eco_pulses_cached_insights");
    if (cached) {
      try {
        setInsights(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached insights", e);
      }
    }
  }, []);

  const handleFetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          logs,
          activeCategoryValues,
          xpLevel
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to generate guidelines from the server.");
      }

      const data: GemInsights = await response.json();
      setInsights(data);
      localStorage.setItem("eco_pulses_cached_insights", JSON.stringify(data));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while communicating with Gemini AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-6" id="insights-section-container">
      {/* AI Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-5 gap-4">
        <div>
          <h3 className="font-sans font-bold text-slate-800 flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600 animate-pulse">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>Tailored AI Eco Insights</span>
          </h3>
          <p className="text-xs text-slate-400">Gemini model compiles your daily drive, food, waste, and energy audits into green guidelines.</p>
        </div>

        <button
          onClick={handleFetchInsights}
          disabled={loading}
          className={`px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-1.5 transition duration-150 shrink-0 ${
            loading ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{insights ? "Regenerate Guidelines" : "Analyze My Footprint"}</span>
        </button>
      </div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-10 w-10 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Gemini AI is analyzing your carbon footprint logs...</p>
          <p className="text-xs text-slate-400 max-w-sm">Generating actionable advice, calculating yearly savings projections, and crafting custom recommendations.</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start space-x-3 text-red-700">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">API Integration Check Required</h4>
            <p className="text-xs text-red-600 leading-relaxed">{error}</p>
            <p className="text-[11px] text-red-500 mt-1">
              Ensure you have a valid <code className="font-mono bg-white px-1 py-0.5 rounded border border-red-100">GEMINI_API_KEY</code> setup inside your secret vault. You can configure this dynamically inside the <strong>Settings &gt; Secrets</strong> tab of the AI Studio workspace.
            </p>
          </div>
        </div>
      )}

      {!insights && !loading && !error && (
        <div className="h-72 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="bg-indigo-50 p-3 rounded-full text-indigo-500">
            <Lightbulb className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Audit your Footprint with AI</p>
          <p className="text-xs text-slate-400 max-w-sm">
            Click &quot;Analyze My Footprint&quot; above. Gemini will scan all your logged transportation, diet, waste, and utilities entries to outline potential high-impact reductions!
          </p>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
            <span className="text-[10px] bg-slate-900 text-white rounded-full px-2 py-0.5 font-mono uppercase tracking-wider">AI Executive Assessment</span>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &ldquo;{insights.summary}&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recommendations Panels */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                <span>Personalized Eco Directives</span>
              </h4>

              <div className="space-y-3">
                {insights.recommendations.map((rec, index) => (
                  <div key={index} className="border border-slate-100 bg-white rounded-xl p-4 flex items-start space-x-3 shadow-xs">
                    <span className="text-xs bg-slate-100 rounded-full h-5 w-5 font-mono font-bold flex items-center justify-center text-slate-400 shrink-0">
                      {index + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="text-xs font-semibold text-slate-800">{rec.action}</h5>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border capitalize ${CATEGORY_COLORS[rec.category] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
                          {rec.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-tight">
                        <strong className="text-slate-700 font-mono text-[10px] mr-1.5 uppercase font-medium">Impact:</strong>
                        {rec.impact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projected savings statistics bar */}
            <div className="bg-slate-850 text-slate-50 rounded-xl p-5 border border-slate-800 flex flex-col justify-between" style={{ backgroundColor: "#0f172a" }}>
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">ANNUAL PROJECTIONS</span>
                <h4 className="font-sans font-bold text-sm text-white">Your Future Offset Score</h4>
                <p className="text-[11px] text-slate-450 leading-relaxed">
                  Adopting these three AI directives for an entire year can lead to incredible collective differences.
                </p>
              </div>

              <div className="my-6 border-y border-slate-800 py-4 text-center">
                <span className="text-4xl font-sans font-bold text-white block">
                  -{insights.projectedSavingsKg.toFixed(0)} <span className="text-base text-emerald-400 font-mono font-medium">kg</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1 block">Expected Annual CO₂ Impact</span>
              </div>

              <div className="flex items-center text-[10px] text-emerald-400 font-mono">
                <TrendingDown className="h-3.5 w-3.5 mr-1 shrink-0" />
                <span>Equals ~{Math.round(insights.projectedSavingsKg / 22)} seedlings grown for 10 years!</span>
              </div>
            </div>
          </div>

          {/* Prompt Encouragement */}
          <div className="border-t border-slate-50 pt-5 flex items-center space-x-3 text-xs text-slate-500">
            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 font-mono text-[10px] font-bold tracking-wider shrink-0 uppercase">Eco Tip</span>
            <p className="leading-relaxed font-sans">{insights.encouragement}</p>
          </div>
        </div>
      )}
    </div>
  );
}
