import React from "react";
import { Challenge, Badge, UserStats, CarbonCategory } from "../types";
import { ALL_BADGES } from "../utils";
import { Trophy, Star, Shield, Medal, Apple, Compass, Zap, Trash2, CheckCircle2, Award, Sparkles } from "lucide-react";

interface ChallengeSectionProps {
  challenges: Challenge[];
  userStats: UserStats;
  onCompleteChallenge: (challenge: Challenge) => void;
  completedIds: string[];
}

const CATEGORY_COLORS: Record<CarbonCategory | "general", string> = {
  transportation: "from-blue-500 to-indigo-600 bg-blue-500",
  energy: "from-amber-400 to-orange-500 bg-amber-500",
  diet: "from-emerald-400 to-green-600 bg-emerald-500",
  waste: "from-pink-400 to-rose-500 bg-pink-500",
  general: "from-violet-400 to-indigo-600 bg-indigo-500"
};

const CATEGORY_CHIPS: Record<CarbonCategory, string> = {
  transportation: "bg-blue-50 text-blue-600 border-blue-100",
  energy: "bg-amber-50 text-amber-600 border-amber-100",
  diet: "bg-emerald-50 text-emerald-600 border-emerald-100",
  waste: "bg-pink-50 text-pink-600 border-pink-100"
};

const BADGE_ICONS: Record<string, React.ReactNode> = {
  Compass: <Compass className="h-5 w-5" />,
  Apple: <Apple className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  Trash2: <Trash2 className="h-5 w-5" />,
  CheckCircle: <CheckCircle2 className="h-5 w-5" />,
  Globe2: <Award className="h-5 w-5" />
};

export default function ChallengeSection({ 
  challenges, 
  userStats, 
  onCompleteChallenge, 
  completedIds 
}: ChallengeSectionProps) {
  // Level progression calculations
  const xp = userStats.xp;
  const currentLevel = userStats.level;
  const xpBasis = (currentLevel - 1) * 200; // Say each level requires 200 XP
  const xpInCurrentLevel = xp - xpBasis;
  const xpNeededForNext = currentLevel * 200 - xpBasis;
  const levelProgressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / 200) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="challenges-section-container">
      
      {/* Gamification Profile Card */}
      <div className="space-y-6 lg:col-span-1">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4" id="gamification-profile">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-mono font-bold text-xl relative">
              {currentLevel}
              <div className="absolute -bottom-1.5 -right-1 p-0.5 bg-emerald-500 text-white rounded-full">
                <Star className="h-3 w-3 fill-current" />
              </div>
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-800 flex items-center space-x-1.5">
                <span>Green Champion</span>
                <span className="text-[10px] bg-slate-150 border px-1.5 py-0.5 rounded-full font-mono text-slate-500 uppercase tracking-widest">ECO LVL</span>
              </h3>
              <p className="text-xs text-slate-400">Reduce emissions through collective play</p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500">XP PROGRESS</span>
              <span className="text-slate-700 font-bold">{xpInCurrentLevel} / 200 XP</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-900 transition-all duration-500 ease-out" 
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-right">
              Earn {200 - xpInCurrentLevel} more XP to reach Level {currentLevel + 1}!
            </p>
          </div>

          <div className="border-t border-slate-50 pt-4 grid grid-cols-2 gap-4 text-center">
            <div className="space-y-0.5">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">CO₂ Saved</span>
              <span className="block text-xl font-sans font-bold text-slate-800">{userStats.totalSavingsKg.toFixed(1)} kg</span>
            </div>
            <div className="space-y-0.5">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Challenges Done</span>
              <span className="block text-xl font-sans font-bold text-slate-800">{userStats.completedChallengesCount}</span>
            </div>
          </div>
        </div>

        {/* Badges Achievements */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4" id="badges-achievements">
          <div>
            <h4 className="font-sans font-semibold text-slate-800 flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Earned Green Badges</span>
            </h4>
            <p className="text-xs text-slate-400">Unlock stamps for hitting specific lifestyle milestones</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ALL_BADGES.map((badge) => {
              const isUnlocked = userStats.unlockedBadgeIds.includes(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`p-3 rounded-lg border flex flex-col items-center text-center space-y-2 transition duration-200 relative overflow-hidden ${
                    isUnlocked 
                      ? "bg-slate-50 border-slate-200 text-slate-800 shadow-xs" 
                      : "bg-white border-slate-100 text-slate-300 opacity-60"
                  }`}
                  title={badge.description}
                >
                  {isUnlocked && (
                    <div className="absolute top-0 right-0 p-1 bg-emerald-500 text-white rounded-bl-lg">
                      <Sparkles className="h-2.5 w-2.5" />
                    </div>
                  )}

                  <div className={`p-2.5 rounded-full ${
                    isUnlocked 
                      ? "bg-slate-900 border border-slate-800 text-white shadow-sm" 
                      : "bg-slate-50 border text-slate-300"
                  }`}>
                    {BADGE_ICONS[badge.iconName] || <Medal className="h-5 w-5" />}
                  </div>

                  <div>
                    <span className={`block font-medium text-xs truncate max-w-full ${isUnlocked ? "text-slate-800 font-semibold" : "text-slate-400"}`}>
                      {badge.title}
                    </span>
                    <span className="block text-[9px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                      {badge.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gamified Challenge Deck */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm lg:col-span-2 space-y-4">
        <div>
          <h3 className="font-sans font-semibold text-slate-800">Active Gamified Challenges</h3>
          <p className="text-xs text-slate-400">Complete challenges to rack up green XP, unlock master carbon badges, and reduce emissions!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => {
            const isCompleted = completedIds.includes(challenge.id);
            return (
              <div 
                key={challenge.id}
                className={`border rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all duration-200 ${
                  isCompleted 
                    ? "bg-emerald-50/20 border-emerald-200/50 opacity-90" 
                    : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-xs"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${CATEGORY_CHIPS[challenge.category]}`}>
                      {challenge.category}
                    </span>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
                      <span>Diff:</span>
                      <span className={`font-semibold ${
                        challenge.difficulty === "Easy" ? "text-emerald-500" :
                        challenge.difficulty === "Medium" ? "text-amber-500" : "text-red-500"
                      }`}>{challenge.difficulty}</span>
                    </div>
                  </div>

                  <h4 className={`font-sans font-bold text-sm ${isCompleted ? "text-slate-750 line-through" : "text-slate-800"}`}>
                    {challenge.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                <div className="border-t border-slate-50 pt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 text-xs font-mono">
                    <div className="flex items-center text-emerald-600 font-bold">
                      <Star className="h-3.5 w-3.5 fill-current mr-0.5" />
                      <span>+{challenge.xpAward} XP</span>
                    </div>
                    <div className="text-slate-400">|</div>
                    <div className="text-teal-600 font-bold">
                      <span>-{challenge.co2SavingsKg} kg CO₂</span>
                    </div>
                  </div>

                  {isCompleted ? (
                    <span className="flex items-center space-x-1 px-3 py-1 bg-emerald-100/60 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg">
                      <CheckCircle2 className="h-3 w-3 fill-current" />
                      <span>Done</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onCompleteChallenge(challenge)}
                      className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg transition duration-150"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
