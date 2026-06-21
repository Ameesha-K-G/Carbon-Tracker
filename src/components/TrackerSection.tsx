import React, { useState } from "react";
import { LogEntry, CarbonCategory } from "../types";
import { EMISSION_FACTORS } from "../utils";
import { Plus, Trash2, ShieldAlert, Carrot, Compass, Zap, Trash } from "lucide-react";

interface TrackerSectionProps {
  onAddLog: (log: Omit<LogEntry, "id" | "timestamp">) => void;
  onDeleteLog: (id: string) => void;
  logs: LogEntry[];
}

const CATEGORY_ICONS: Record<CarbonCategory, React.ReactNode> = {
  transportation: <Compass className="h-4 w-4" />,
  energy: <Zap className="h-4 w-4" />,
  diet: <Carrot className="h-4 w-4" />,
  waste: <Trash className="h-4 w-4" />
};

const CATEGORY_COLORS: Record<CarbonCategory, string> = {
  transportation: "bg-blue-50 text-blue-600 border-blue-100",
  energy: "bg-amber-50 text-amber-600 border-amber-100",
  diet: "bg-emerald-50 text-emerald-600 border-emerald-100",
  waste: "bg-pink-50 text-pink-600 border-pink-100"
};

export default function TrackerSection({ onAddLog, onDeleteLog, logs }: TrackerSectionProps) {
  const [category, setCategory] = useState<CarbonCategory>("transportation");
  const [activityKey, setActivityKey] = useState<string>("gas_car");
  const [unitCount, setUnitCount] = useState<number>(10);

  // Sync default activity key when category changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value as CarbonCategory;
    setCategory(selectedCategory);
    
    // Choose first standard key of that category
    const defaultKeys: Record<CarbonCategory, string> = {
      transportation: "gas_car",
      energy: "electricity",
      diet: "meat_beef_lamb",
      waste: "general_trash"
    };
    setActivityKey(defaultKeys[selectedCategory]);
  };

  // Get current formula/factor characteristics
  const currentFactorsList = EMISSION_FACTORS[category] as Record<string, { label: string; factor: number; unit: string }>;
  const currentActivitySpec = currentFactorsList[activityKey] || Object.values(currentFactorsList)[0];

  const handleLoggedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unitCount <= 0 || isNaN(unitCount)) return;

    // Waste compost & recycled represent savings/offsets (negative footprint inside list but handled beautifully)
    const factor = currentActivitySpec.factor;
    const isOffset = factor < 0; 
    const emissionValue = Math.abs(unitCount * factor);

    onAddLog({
      category,
      activityName: currentActivitySpec.label.split(" (")[0], // Trim subtext labels for cleaner listing
      unitValue: unitCount,
      unitLabel: currentActivitySpec.unit,
      emission: parseFloat(emissionValue.toFixed(2)),
      isOffset
    });

    // Reset simple input defaults
    setUnitCount(10);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="tracker-section-container">
      {/* Logger Form */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4 h-fit">
        <h3 className="font-sans font-semibold text-slate-800 flex items-center space-x-2">
          <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
            <Plus className="h-4 w-4" />
          </span>
          <span>Log Everyday Carbon Activity</span>
        </h3>
        <p className="text-xs text-slate-400">
          State your daily activities. System translates metrics into Carbon dioxide equivalent (CO₂e) emissions based on greenhouse validation factors.
        </p>

        <form onSubmit={handleLoggedSubmit} className="space-y-4 pt-2">
          {/* Category selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest">Select Category</label>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="transportation">✈️ Transportation & Travel</option>
              <option value="energy">💡 Household Energy</option>
              <option value="diet">🥗 Diet & Meal Choices</option>
              <option value="waste">🗑️ Waste & Smart Recycling</option>
            </select>
          </div>

          {/* Activity choice */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest">Specific Action Type</label>
            <select
              value={activityKey}
              onChange={(e) => setActivityKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {Object.entries(currentFactorsList).map(([key, spec]) => (
                <option key={key} value={key}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>

          {/* Numeric Quantity */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest">Quantity / Volume</label>
              <span className="text-xs font-mono text-slate-400">Measured in {currentActivitySpec?.unit}</span>
            </div>
            <input
              type="number"
              min="0.1"
              step="any"
              value={unitCount}
              onChange={(e) => setUnitCount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          {/* live footprint preview calculator inside form */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">Live Impact Estimate:</span>
            <div className="text-right">
              <span className={`text-base font-bold ${currentActivitySpec?.factor < 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                {currentActivitySpec?.factor < 0 ? "-" : ""}
                {Math.abs(unitCount * (currentActivitySpec?.factor || 0)).toFixed(2)}
              </span>
              <span className="text-[10px] font-mono text-slate-400 ml-1">kg CO₂e</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-slate-800 transition duration-150 shadow-sm"
          >
            Add Everyday Audit Entry
          </button>
        </form>
      </div>

      {/* History Log Display List */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-sans font-semibold text-slate-800">Carbon Activity Logs</h3>
            <p className="text-xs text-slate-400">Historical trace of your daily carbon footprints and offsets</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Total: {logs.length} entries</span>
        </div>

        {logs.length === 0 ? (
          <div className="h-64 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="bg-slate-50 p-3 rounded-full text-slate-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No activities recorded yet</p>
            <p className="text-xs text-slate-400 max-w-sm">
              Use the logger panel on the left to record daily drives, grocery selection, heating use, and recycling!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-slate-100 rounded-xl max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left">
                  <thead className="bg-slate-50 text-xs font-mono uppercase text-slate-450 tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Activity</th>
                      <th className="px-4 py-3">Volume</th>
                      <th className="px-4 py-3 text-right">Net Impact</th>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-650">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition duration-150">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className={`px-2 py-1 border rounded-lg flex items-center space-x-1.5 w-fit ${CATEGORY_COLORS[log.category]}`}>
                            {CATEGORY_ICONS[log.category]}
                            <span className="capitalize font-medium text-[11px]">{log.category}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-800">
                          {log.activityName}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-505 font-mono">
                          {log.unitValue} {log.unitLabel}
                        </td>
                        <td className={`px-4 py-3.5 text-right whitespace-nowrap font-bold ${log.isOffset ? "text-emerald-600" : "text-orange-600"}`}>
                          {log.isOffset ? "-" : "+"}
                          {log.emission.toFixed(2)} kg
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit" })}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <button
                            onClick={() => onDeleteLog(log.id)}
                            className="p-1 px-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 transition duration-150"
                            title="Delete Entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
