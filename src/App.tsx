import React, { useState, useEffect } from "react";
import { LogEntry, Challenge, Badge, UserStats, SocialPost } from "./types";
import { 
  INITIAL_LOG_ENTRIES, 
  INITIAL_CHALLENGES, 
  ALL_BADGES, 
  INITIAL_SOCIAL_FEED 
} from "./utils";
import DashboardSection from "./components/DashboardSection";
import TrackerSection from "./components/TrackerSection";
import ChallengeSection from "./components/ChallengeSection";
import InsightsSection from "./components/InsightsSection";
import SocialSection from "./components/SocialSection";
import { 
  LayoutDashboard, 
  Compass, 
  Trophy, 
  Sparkles, 
  Users, 
  Leaf, 
  ChevronRight,
  HelpCircle,
  Clock,
  Sparkle
} from "lucide-react";

export default function App() {
  const userEmail = "ameeshakg@gmail.com"; // Provided user email

  // 1. Core Unified States
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [completedChallengeIds, setCompletedChallengeIds] = useState<string[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    xpToNextLevel: 200,
    totalSavingsKg: 0,
    completedChallengesCount: 0,
    unlockedBadgeIds: []
  });
  const [posts, setPosts] = useState<SocialPost[]>([]);
  
  // Badge unlock notification popover state
  const [newBadgeUnlocked, setNewBadgeUnlocked] = useState<Badge | null>(null);

  // 2. Load initially from LocalStorage or pre-compile
  useEffect(() => {
    // Logging Initializer
    const cachedLogs = localStorage.getItem("eco_pulses_logs");
    if (cachedLogs) {
      setLogs(JSON.parse(cachedLogs));
    } else {
      const initialLogsList = INITIAL_LOG_ENTRIES();
      setLogs(initialLogsList);
      localStorage.setItem("eco_pulses_logs", JSON.stringify(initialLogsList));
    }

    // Challenges Initializer
    const cachedChallenges = localStorage.getItem("eco_pulses_completed_challenges");
    if (cachedChallenges) {
      setCompletedChallengeIds(JSON.parse(cachedChallenges));
    }

    // Stats / Gamification Initializer
    const cachedStats = localStorage.getItem("eco_pulses_stats");
    if (cachedStats) {
      setUserStats(JSON.parse(cachedStats));
    } else {
      const initialStats: UserStats = {
        xp: 150, // Starts off with some base XP to feel active
        level: 1,
        xpToNextLevel: 200,
        totalSavingsKg: 12.4, // Initial starting savings
        completedChallengesCount: 0,
        unlockedBadgeIds: []
      };
      setUserStats(initialStats);
      localStorage.setItem("eco_pulses_stats", JSON.stringify(initialStats));
    }

    // Social Feed Initializer
    const cachedPosts = localStorage.getItem("eco_pulses_posts");
    if (cachedPosts) {
      setPosts(JSON.parse(cachedPosts));
    } else {
      setPosts(INITIAL_SOCIAL_FEED);
      localStorage.setItem("eco_pulses_posts", JSON.stringify(INITIAL_SOCIAL_FEED));
    }
  }, []);

  // Sync state functions with local persistence
  const saveLogs = (updatedLogs: LogEntry[]) => {
    setLogs(updatedLogs);
    localStorage.setItem("eco_pulses_logs", JSON.stringify(updatedLogs));
  };

  const saveStats = (updatedStats: UserStats) => {
    setUserStats(updatedStats);
    localStorage.setItem("eco_pulses_stats", JSON.stringify(updatedStats));
  };

  const savePosts = (updatedPosts: SocialPost[]) => {
    setPosts(updatedPosts);
    localStorage.setItem("eco_pulses_posts", JSON.stringify(updatedPosts));
  };

  // Badge unlock processor
  const checkAndUnlockBadges = (currentLogs: LogEntry[], currentStats: UserStats) => {
    const transitLogsCount = currentLogs.filter(log => log.category === "transportation").length;
    const dietMealCount = currentLogs.filter(log => log.category === "diet" && (log.activityName.includes("Vegetarian") || log.activityName.includes("Vegan"))).length;
    const energySavingsCount = currentLogs.filter(log => log.category === "energy").length;
    
    // Calculate total savings from offsets
    const recyclingC02Saved = currentLogs
      .filter(log => log.isOffset)
      .reduce((acc, curr) => acc + curr.emission, 0);

    const activeUnlockedList = [...currentStats.unlockedBadgeIds];
    let showNotification: Badge | null = null;

    // Badge 1: Transit Champ
    if (transitLogsCount >= 3 && !activeUnlockedList.includes("badge_commute")) {
      activeUnlockedList.push("badge_commute");
      showNotification = ALL_BADGES.find(b => b.id === "badge_commute") || null;
    }
    // Badge 2: Eco Chef
    if (dietMealCount >= 5 && !activeUnlockedList.includes("badge_diet")) {
      activeUnlockedList.push("badge_diet");
      showNotification = ALL_BADGES.find(b => b.id === "badge_diet") || null;
    }
    // Badge 3: Kilowatt Keeper
    if (energySavingsCount >= 3 && !activeUnlockedList.includes("badge_energy")) {
      activeUnlockedList.push("badge_energy");
      showNotification = ALL_BADGES.find(b => b.id === "badge_energy") || null;
    }
    // Badge 4: Waste Wizard
    if (recyclingC02Saved >= 10 && !activeUnlockedList.includes("badge_waste")) {
      activeUnlockedList.push("badge_waste");
      showNotification = ALL_BADGES.find(b => b.id === "badge_waste") || null;
    }
    // Badge 5: Conscious Citizen
    if (currentStats.level >= 3 && !activeUnlockedList.includes("badge_level_3")) {
      activeUnlockedList.push("badge_level_3");
      showNotification = ALL_BADGES.find(b => b.id === "badge_level_3") || null;
    }
    // Badge 6: Carbon Crusader
    if (currentStats.totalSavingsKg >= 100 && !activeUnlockedList.includes("badge_savings_100")) {
      activeUnlockedList.push("badge_savings_100");
      showNotification = ALL_BADGES.find(b => b.id === "badge_savings_100") || null;
    }

    if (showNotification) {
      setNewBadgeUnlocked(showNotification);
      
      // Auto-post the badge achievement to the community social feed!
      const badgeSocialPost: SocialPost = {
        id: `post_badge_${Date.now()}`,
        authorName: "Ameesha K.",
        authorEmail: userEmail,
        avatarSeed: userEmail,
        content: `🎉 I have unlocked the '${showNotification.title}' carbon badge by achieving eco-milestones! Checkout my impact footprint dashboard to see collective audits. 💚🌍`,
        timestamp: Date.now(),
        likes: 0,
        likedByUser: false,
        comments: [],
        sharedPayload: {
          type: "badge",
          title: showNotification.title
        }
      };
      
      savePosts([badgeSocialPost, ...posts]);
    }

    return activeUnlockedList;
  };

  // 3. User Actions handlers
  const handleAddLog = (newLog: Omit<LogEntry, "id" | "timestamp">) => {
    const fullLog: LogEntry = {
      ...newLog,
      id: `log_${Date.now()}`,
      timestamp: Date.now()
    };

    const updatedLogs = [fullLog, ...logs];
    saveLogs(updatedLogs);

    // Calculate updated carbon stats
    let savingsEarned = 0;
    if (newLog.isOffset) {
      savingsEarned = newLog.emission;
    }

    // Award XP for logging action (e.g. 15 XP per log)
    const earnedXp = 15;
    const newXp = userStats.xp + earnedXp;
    const newLevel = Math.floor(newXp / 200) + 1; // 200 XP per level

    const updatedStats: UserStats = {
      ...userStats,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: newLevel * 200,
      totalSavingsKg: userStats.totalSavingsKg + savingsEarned,
      unlockedBadgeIds: userStats.unlockedBadgeIds
    };

    // Recalculate badge approvals
    const updatedBadges = checkAndUnlockBadges(updatedLogs, updatedStats);
    updatedStats.unlockedBadgeIds = updatedBadges;

    saveStats(updatedStats);
  };

  const handleDeleteLog = (id: string) => {
    const targetLog = logs.find(l => l.id === id);
    if (!targetLog) return;

    const updatedLogs = logs.filter(l => l.id !== id);
    saveLogs(updatedLogs);

    // Recompute total savings minus deleted items
    let savingsRemoved = 0;
    if (targetLog.isOffset) {
      savingsRemoved = targetLog.emission;
    }

    const updatedStats = {
      ...userStats,
      totalSavingsKg: Math.max(0, userStats.totalSavingsKg - savingsRemoved)
    };
    saveStats(updatedStats);
  };

  const handleCompleteChallenge = (challenge: Challenge) => {
    if (completedChallengeIds.includes(challenge.id)) return;

    const updatedChallengeIds = [...completedChallengeIds, challenge.id];
    setCompletedChallengeIds(updatedChallengeIds);
    localStorage.setItem("eco_pulses_completed_challenges", JSON.stringify(updatedChallengeIds));

    // Award XP and offset benefits from completed challenge
    const newXp = userStats.xp + challenge.xpAward;
    const newLevel = Math.floor(newXp / 200) + 1;

    const updatedStats: UserStats = {
      ...userStats,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: newLevel * 200,
      totalSavingsKg: userStats.totalSavingsKg + challenge.co2SavingsKg,
      completedChallengesCount: userStats.completedChallengesCount + 1,
      unlockedBadgeIds: userStats.unlockedBadgeIds
    };

    // Calculate badges
    const updatedBadges = checkAndUnlockBadges(logs, updatedStats);
    updatedStats.unlockedBadgeIds = updatedBadges;

    saveStats(updatedStats);

    // Auto-post challenge completion to social feed!
    const challengeSocialPost: SocialPost = {
      id: `post_challenge_${Date.now()}`,
      authorName: "Ameesha K.",
      authorEmail: userEmail,
      avatarSeed: userEmail,
      content: `🎯 Just completed the '${challenge.title}' green challenge! saved ${challenge.co2SavingsKg} kg CO₂e from our environment and earned +${challenge.xpAward} XP! Let's build a sustainability habit! 🍃🚴`,
      timestamp: Date.now(),
      likes: 0,
      likedByUser: false,
      comments: [],
      sharedPayload: {
        type: "challenge",
        title: challenge.title
      }
    };
    savePosts([challengeSocialPost, ...posts]);
  };

  // Social updates
  const handleAddPost = (content: string) => {
    const newPost: SocialPost = {
      id: `post_${Date.now()}`,
      authorName: "Ameesha K.",
      authorEmail: userEmail,
      avatarSeed: userEmail,
      content,
      timestamp: Date.now(),
      likes: 0,
      likedByUser: false,
      comments: []
    };

    const updatedPosts = [newPost, ...posts];
    savePosts(updatedPosts);
  };

  const handleLikePost = (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likedByUser;
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1,
          likedByUser: !isLiked
        };
      }
      return post;
    });
    savePosts(updatedPosts);
  };

  const handleCommentPost = (postId: string, commentText: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, commentText]
        };
      }
      return post;
    });
    savePosts(updatedPosts);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans" id="app-root-frame">
      {/* Top Navigation Panel Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand Title */}
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Leaf className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="font-sans font-bold text-base text-slate-850 tracking-tight leading-tight flex items-center gap-1">
                  <span>CarbonPulse</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-mono border border-emerald-100 rounded-full px-1.5 py-0.5 leading-none font-bold uppercase tracking-widest">LIVE</span>
                </h1>
                <p className="text-[10px] text-slate-400 leading-tight">Everyday Carbon Auditing & Smart Play</p>
              </div>
            </div>

            {/* Profile Pill */}
            <div className="flex items-center space-x-3 text-xs">
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-bold text-slate-700">Ameesha K.</span>
                <span className="text-[9px] font-mono text-slate-400">Level {userStats.level} Eco Hero</span>
              </div>
              <div className="h-9 w-9 bg-slate-900 text-white font-mono font-black border border-slate-800 rounded-full flex items-center justify-center text-[11px] shadow-sm">
                AK
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Tab Selector Nav bar */}
        <div className="bg-white border border-slate-100 rounded-xl p-1.5 flex flex-wrap gap-1 shadow-xs" id="app-nav-tabs">
          {[
            { id: "dashboard", label: "Overview Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
            { id: "tracker", label: " setiap Carbon Logger", icon: <Compass className="h-4 w-4" /> },
            { id: "challenges", label: "Active Challenges", icon: <Trophy className="h-4 w-4" /> },
            { id: "insights", label: "Tailored AI Coach", icon: <Sparkles className="h-4 w-4 animate-bounce" /> },
            { id: "social", label: "Community Feed", icon: <Users className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition duration-150 shrink-0 select-none ${
                activeTab === tab.id
                  ? "bg-slate-900 border border-slate-800 text-white shadow-xs"
                  : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              {tab.id === "tracker" ? <span>Everyday Carbon Logger</span> : <span>{tab.label}</span>}
            </button>
          ))}
        </div>

        {/* Dynamic Section Rendering */}
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === "dashboard" && (
            <DashboardSection logs={logs} totalSavingsKg={userStats.totalSavingsKg} />
          )}
          {activeTab === "tracker" && (
            <TrackerSection logs={logs} onAddLog={handleAddLog} onDeleteLog={handleDeleteLog} />
          )}
          {activeTab === "challenges" && (
            <ChallengeSection 
              challenges={INITIAL_CHALLENGES} 
              userStats={userStats} 
              onCompleteChallenge={handleCompleteChallenge}
              completedIds={completedChallengeIds}
            />
          )}
          {activeTab === "insights" && (
            <InsightsSection logs={logs} xpLevel={userStats.level} />
          )}
          {activeTab === "social" && (
            <SocialSection 
              posts={posts} 
              onAddPost={handleAddPost} 
              onLikePost={handleLikePost} 
              onCommentPost={handleCommentPost}
              userStats={userStats}
              userEmail={userEmail}
            />
          )}
        </div>
      </main>

      {/* Badge Unlocked Modal notification popover */}
      {newBadgeUnlocked && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" id="badge-notification-popover">
          <div className="bg-white border rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border-slate-100 relative overflow-hidden">
            
            {/* Ambient matrix burst background decoration */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/20 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="inline-flex p-4 rounded-full bg-slate-900 border-4 border-slate-800 text-white shadow-md animate-bounce">
                <Sparkle className="h-8 w-8 text-emerald-400 fill-current animate-pulse" />
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-600 font-bold tracking-widest uppercase block animate-pulse">Eco stamp unlocked!</span>
                <h3 className="font-sans font-black text-xl text-slate-850">Earned &apos;{newBadgeUnlocked.title}&apos;!</h3>
              </div>

              <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-sans mt-1">
                {newBadgeUnlocked.description}
              </p>

              <div className="border-t border-slate-100 pt-4 w-full grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-2 border border-slate-100 rounded-lg">
                  <span className="block text-[9px] font-mono text-slate-400 uppercase">XP Award</span>
                  <strong className="block text-slate-850 font-bold">+100 XP</strong>
                </div>
                <div className="bg-slate-50 p-2 border border-slate-100 rounded-lg">
                  <span className="block text-[9px] font-mono text-slate-400 uppercase">Post Broadcast</span>
                  <strong className="block text-slate-850 font-bold">Auto-Shared</strong>
                </div>
              </div>

              <button
                onClick={() => setNewBadgeUnlocked(null)}
                className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-xs font-bold transition duration-150 shadow-sm"
              >
                Close Reward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Humble Footer */}
      <footer className="border-t border-slate-150/50 mt-12 py-6 text-center text-[11px] text-slate-400 bg-white" id="app-credits">
        <p>&copy; {new Date().getFullYear()} CarbonPulse Applet. Powered by serverless Gemini 3.5 Models for tailwind-coached climate action.</p>
        <p className="mt-0.5 font-mono">Build with zero-emission local cache persistence &bull; ameeshakg@gmail.com</p>
      </footer>
    </div>
  );
}
