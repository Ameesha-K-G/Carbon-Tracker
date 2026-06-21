import React from "react";
import { LogEntry, CarbonCategory } from "../types";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  PieChart, Pie, Cell 
} from "recharts";
import { Leaf, Eye, TrendingDown, ArrowUpRight, Scale, Activity } from "lucide-react";

interface DashboardSectionProps {
  logs: LogEntry[];
  totalSavingsKg: number;
}

const CATEGORY_COLORS: Record<CarbonCategory, string> = {
  transportation: "#3b82f6", // blue
  energy: "#eab308",         // yellow/amber
  diet: "#10b981",           // emerald
  waste: "#ec4899"           // pink
};

const CATEGORY_LABELS: Record<CarbonCategory, string> = {
  transportation: "Transportation",
  energy: "Household Energy",
  diet: "Diet Choice",
  waste: "Waste & Recycling"
};

export default function DashboardSection({ logs, totalSavingsKg }: DashboardSectionProps) {
  // 1. Calculate stats
  const totalEmissions = logs
    .filter(log => !log.isOffset)
    .reduce((acc, curr) => acc + curr.emission, 0);

  const totalOffsets = logs
    .filter(log => log.isOffset)
    .reduce((acc, curr) => acc + curr.emission, 0);

  const netFootprint = Math.max(0, totalEmissions - totalOffsets);

  // 2. Prepare Category Breakdown for Pie Chart
  const categoryEmissions: Record<CarbonCategory, number> = {
    transportation: 0,
    energy: 0,
    diet: 0,
    waste: 0
  };

  logs.forEach(log => {
    if (!log.isOffset) {
      categoryEmissions[log.category] += log.emission;
    }
  });

  const pieData = Object.entries(categoryEmissions).map(([key, val]) => ({
    name: CATEGORY_LABELS[key as CarbonCategory],
    value: parseFloat(val.toFixed(1)),
    color: CATEGORY_COLORS[key as CarbonCategory]
  })).filter(item => item.value > 0);

  // 3. Prepare Last 7 Days Timeline for Bar Chart
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return {
      dateStr: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      timestampStart: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
      timestampEnd: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).getTime(),
      emissions: 0,
      offsets: 0
    };
  }).reverse();

  logs.forEach(log => {
    const logTime = log.timestamp;
    const dayBucket = last7DaysData.find(
      day => logTime >= day.timestampStart && logTime <= day.timestampEnd
    );
    if (dayBucket) {
      if (log.isOffset) {
        dayBucket.offsets += log.emission;
      } else {
        dayBucket.emissions += log.emission;
      }
    }
  });

  const barData = last7DaysData.map(day => ({
    date: day.dateStr,
    Emissions: parseFloat(day.emissions.toFixed(1)),
    Offsets: parseFloat(day.offsets.toFixed(1)),
    "Net Impact": parseFloat(Math.max(0, day.emissions - day.offsets).toFixed(1))
  }));

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Overview Stat Cards and Bento Grid Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" id="card-net-footprint">
          <div className="absolute top-0 right-0 p-3 bg-stone-100 text-stone-600 rounded-bl-3xl">
            <TrendingDown className="h-5 w-5 text-stone-600" />
          </div>
          <p className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest">Net Footprint</p>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-sans font-black tracking-tight text-stone-900">{netFootprint.toFixed(1)}</span>
            <span className="ml-1.5 text-xs font-mono font-bold text-stone-500">kg CO₂e</span>
          </div>
          <p className="mt-2 text-xs text-stone-500 leading-relaxed font-sans">Calculated from logged activities.</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" id="card-total-emissions">
          <div className="absolute top-0 right-0 p-3 bg-stone-100 text-stone-600 rounded-bl-3xl">
            <Scale className="h-5 w-5 text-stone-500" />
          </div>
          <p className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest">Gross Emissions</p>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-sans font-black tracking-tight text-stone-900">{totalEmissions.toFixed(1)}</span>
            <span className="ml-1.5 text-xs font-mono font-bold text-stone-500">kg CO₂e</span>
          </div>
          <p className="mt-2 text-xs text-stone-500 leading-relaxed font-sans">Total everyday emissions generated.</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" id="card-logged-actions">
          <div className="absolute top-0 right-0 p-3 bg-stone-100 text-stone-600 rounded-bl-3xl">
            <Activity className="h-5 w-5 text-stone-600" />
          </div>
          <p className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest">Logged Activities</p>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-sans font-black tracking-tight text-stone-900">{logs.length}</span>
            <span className="ml-1.5 text-xs font-mono font-bold text-stone-500">entries</span>
          </div>
          <p className="mt-2 text-xs text-stone-500 leading-relaxed font-sans">Everyday green audits checked.</p>
        </div>

        <div className="bg-emerald-950 text-white rounded-3xl border border-stone-200 p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" id="card-total-offsets" style={{ backgroundColor: "#022c22" }}>
          <div className="absolute top-0 right-0 p-3 bg-emerald-900/60 text-emerald-400 rounded-bl-3xl">
            <Leaf className="h-5 w-5 text-emerald-300 animate-pulse" />
          </div>
          <p className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">Savings & Offsets</p>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-sans font-black tracking-tight text-white">{(totalOffsets + totalSavingsKg).toFixed(1)}</span>
            <span className="ml-1.5 text-xs font-mono font-bold text-emerald-300">kg saved</span>
          </div>
          <p className="mt-2 text-xs text-emerald-200/80 leading-relaxed font-sans">From recycling, offsets & green play.</p>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4" id="chart-timeline-container">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans font-bold text-lg text-stone-900">Weekly Emission Trends</h3>
              <p className="text-xs text-stone-500">Comparison of everyday emissions, offsets, and net footprint</p>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-mono font-bold bg-stone-100 text-stone-600 border border-stone-200 rounded-full">
              7 Days Active
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="date" tick={{ fill: '#78716c', fontSize: 11, fontWeight: 'medium' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#78716c', fontSize: 11, fontWeight: 'medium' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1c1917", borderRadius: "12px", border: "none", color: "#f5f5f4" }} 
                  labelStyle={{ fontWeight: "bold", fontSize: "12px" }} 
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="Emissions" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Offsets" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Net Impact" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4" id="chart-pie-container">
          <div>
            <h3 className="font-sans font-bold text-lg text-stone-900">Category Distribution</h3>
            <p className="text-xs text-stone-500">Gross emissions grouped by major categories</p>
          </div>

          {pieData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="h-12 w-12 rounded-full bg-stone-50 border border-stone-250 flex items-center justify-center text-stone-300">
                <Leaf className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-stone-700">No emissions logged yet</p>
              <p className="text-xs text-stone-500">Add carbon logs or diet/commute entries to generate a customized chart breakdown.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-2">
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1c1917", borderRadius: "12px", border: "none", color: "#f5f5f4" }} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ left: "0%" }}>
                  <span className="text-2xl font-black text-stone-900">{totalEmissions.toFixed(0)}</span>
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest font-bold">Gross Kg</span>
                </div>
              </div>

              {/* Legends list */}
              <div className="w-full grid grid-cols-2 gap-2 text-xs pt-4 border-t border-stone-200">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-stone-600 truncate" title={item.name}>{item.name}:</span>
                    <strong className="text-stone-800 ml-auto font-bold">{item.value} kg</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
