export type CarbonCategory = "transportation" | "energy" | "diet" | "waste";

export interface LogEntry {
  id: string;
  timestamp: number; // millisecond timestamp
  category: CarbonCategory;
  activityName: string; // e.g., "Car Commute (Gasoline)", "Unplugged Idle Devices"
  unitValue: number; // raw value (e.g., miles, kWh, meals, kg)
  unitLabel: string; // e.g., "miles", "kWh", "meals", "kg"
  emission: number; // kg CO2e
  isOffset: boolean; // whether this represents an offset action (saving) or an emission
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: CarbonCategory;
  difficulty: "Easy" | "Medium" | "Hard";
  xpAward: number;
  co2SavingsKg: number; // Potential daily savings
  actionType: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: CarbonCategory | "general";
  iconName: string; // lucide icon identifier
  requiredXp?: number;
  requiredLogsCount?: number;
  requiredSavingsKg?: number;
}

export interface UserStats {
  xp: number;
  level: number;
  xpToNextLevel: number;
  totalSavingsKg: number;
  completedChallengesCount: number;
  unlockedBadgeIds: string[];
}

export interface GemInsights {
  summary: string;
  recommendations: {
    action: string;
    impact: string;
    category: CarbonCategory;
  }[];
  projectedSavingsKg: number;
  encouragement: string;
}

export interface SocialPost {
  id: string;
  authorName: string;
  authorEmail: string;
  avatarSeed: string; // For generating a nice color or initials avatar
  content: string;
  timestamp: number;
  likes: number;
  likedByUser: boolean;
  comments: string[];
  sharedPayload?: {
    type: "challenge" | "badge" | "stats";
    title: string;
    valueLabel?: string;
  };
}
