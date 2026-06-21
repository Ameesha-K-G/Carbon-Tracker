import React, { useState, useEffect } from "react";
import { SocialPost, UserStats } from "../types";
import { getAvatarColor } from "../utils";
import { Globe, Heart, MessageSquare, Send, Users, Sparkles, LayoutGrid, CheckCircle } from "lucide-react";

interface SocialSectionProps {
  posts: SocialPost[];
  onAddPost: (content: string) => void;
  onLikePost: (id: string) => void;
  onCommentPost: (id: string, comment: string) => void;
  userStats: UserStats;
  userEmail: string;
}

export default function SocialSection({
  posts,
  onAddPost,
  onLikePost,
  onCommentPost,
  userStats,
  userEmail
}: SocialSectionProps) {
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [tickerOffset, setTickerOffset] = useState<number>(1425.8); // Initial collective community CO2 saved value
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Simulate an active collective impact clock updating dynamically to show active carbon reductions worldwide!
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset((prev) => prev + 0.04); // Ticks up by 0.04 kg CO2 every 2.5 seconds
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic collective CO2 offset (User's savings + static community base + live ticking score)
  const collectiveSavingsKg = userStats.totalSavingsKg + tickerOffset;

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    onAddPost(newPostContent.trim());
    setNewPostContent("");
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const txt = commentInputs[postId];
    if (!txt || !txt.trim()) return;
    onCommentPost(postId, txt.trim());
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  const getUserInitials = (email: string) => {
    if (!email) return "ME";
    const parts = email.split("@")[0].split(/[._\-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="social-section-container">
      {/* Community Feed */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm lg:col-span-2 space-y-6">
        <div>
          <h3 className="font-sans font-semibold text-slate-800 flex items-center space-x-2">
            <Users className="h-5 w-5 text-emerald-600" />
            <span>Community Echo Hub</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Share carbon saving progress, cheer on neighbors, and coordinate green challenge achievements in real-time.</p>
        </div>

        {/* Share an update form */}
        <form onSubmit={handleCreatePost} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
          <div className="flex items-start space-x-3">
            <div className={`h-8 w-8 rounded-full bg-gradient-to-tr ${getAvatarColor(userEmail)} flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm`}>
              {getUserInitials(userEmail)}
            </div>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Broadcasting an offset victory? (e.g., just took a 5-minute cold shower to complete the Chill Cycle challenge!)"
              className="w-full bg-transparent border-0 text-xs text-slate-705 placeholder-slate-400 focus:outline-none resize-none pt-1"
              rows={2}
            />
          </div>
          <div className="flex justify-between items-center border-t border-slate-150/50 pt-2 text-xs">
            <span className="text-[10px] font-mono text-slate-400">Posting as: <strong className="text-slate-500">{userEmail.split("@")[0]}</strong></span>
            <button
              type="submit"
              disabled={!newPostContent.trim()}
              className="px-3.5 py-1.5 bg-slate-900 select-none text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition duration-150 flex items-center space-x-1 disabled:opacity-50"
            >
              <Send className="h-3 w-3" />
              <span>Share Activity</span>
            </button>
          </div>
        </form>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="border border-slate-100 rounded-xl p-4.5 space-y-3 shadow-xs">
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`h-8 w-8 rounded-full bg-gradient-to-tr ${getAvatarColor(post.avatarSeed)} flex items-center justify-center text-white text-[10px] font-bold shadow-xs shrink-0`}>
                    {getUserInitials(post.authorEmail)}
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-xs text-slate-800">{post.authorName}</h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &middot; {new Date(post.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Optional Shared Payload Badges */}
                {post.sharedPayload && (
                  <div className="px-2 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg flex items-center space-x-1 text-[10px] font-mono font-bold">
                    <Sparkles className="h-3 w-3 shrink-0" />
                    <span>{post.sharedPayload.title}</span>
                  </div>
                )}
              </div>

              {/* Content Body */}
              <p className="text-xs text-slate-600 leading-relaxed font-sans pr-1">
                {post.content}
              </p>

              {/* Likes & Comments Metadata Interactions */}
              <div className="flex items-center space-x-4 border-t border-b border-slate-50 py-2.5 text-xs">
                <button
                  onClick={() => onLikePost(post.id)}
                  className={`flex items-center space-x-1 ${post.likedByUser ? "text-red-500 font-bold" : "text-slate-400 hover:text-red-500"} transition`}
                >
                  <Heart className={`h-3.5 w-3.5 ${post.likedByUser ? "fill-current" : ""}`} />
                  <span>{post.likes}</span>
                </button>

                <div className="flex items-center space-x-1 text-slate-400">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{post.comments.length} comments</span>
                </div>
              </div>

              {/* Comments display */}
              {post.comments.length > 0 && (
                <div className="space-y-2 bg-slate-50/50 p-3 rounded-lg border border-slate-100 divide-y divide-slate-100">
                  {post.comments.map((comment, index) => (
                    <div key={index} className="text-[11px] text-slate-600 pt-1.5 first:pt-0">
                      <strong className="text-slate-800 mr-1.5 font-bold">Nature Buddy:</strong>
                      {comment}
                    </div>
                  ))}
                </div>
              )}

              {/* New Comment input */}
              <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  placeholder="Type an encouraging note..."
                  value={commentInputs[post.id] || ""}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 placeholder-slate-405 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!(commentInputs[post.id] || "").trim()}
                  className="px-2.5 py-1.5 bg-slate-900 border text-white rounded-lg hover:bg-slate-800 transition duration-150 disabled:opacity-50 shrink-0"
                >
                  <Send className="h-3 w-3" />
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>

      {/* Collective Impact Board & Stats */}
      <div className="space-y-6">
        {/* Collective Clock Cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white relative overflow-hidden shadow-md" id="collective-impact-board" style={{ backgroundColor: "#0f172a" }}>
          {/* Subtle design matrix background */}
          <div className="absolute top-0 right-0 p-4 bg-emerald-500/10 text-emerald-400 rounded-bl-xl animate-bounce">
            <Globe className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">ECO SYSTEM STATS</span>
            <h4 className="font-sans font-bold text-sm text-white">Collective Carbon Offset</h4>
            <p className="text-[11px] text-slate-450 leading-relaxed font-sans max-w-[85%]">
              Live offset metrics generated globally across all active users completing simple carbon saving milestones.
            </p>
          </div>

          <div className="my-8 text-center pb-2 border-b border-slate-800">
            <div className="text-4xl font-sans font-black tracking-tight text-white inline-block">
              {collectiveSavingsKg.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="ml-1 text-base text-emerald-400 font-mono font-semibold">kg</span>
            </div>
            <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1">TOTAL CO₂ SAVED MUTUALLY</span>
          </div>

          <div className="space-y-3 text-[11px] text-slate-400">
            <div className="flex justify-between items-center bg-slate-950/20 px-3 py-2 rounded-lg border border-slate-800">
              <span className="font-mono">User Contribution:</span>
              <span className="font-bold text-emerald-400">{(userStats.totalSavingsKg).toFixed(1)} kg ({((userStats.totalSavingsKg / (collectiveSavingsKg || 1)) * 100).toFixed(2)}%)</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/20 px-3 py-2 rounded-lg border border-slate-800">
              <span className="font-mono">Community Baseline:</span>
              <span className="font-bold text-teal-400">{tickerOffset.toFixed(1)} kg</span>
            </div>
          </div>
        </div>

        {/* Global Action Banner */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-3" id="collective-leaderboard">
          <h4 className="font-sans font-semibold text-slate-800 flex items-center space-x-2">
            <Globe className="h-4 w-4 text-emerald-600" />
            <span>Community Leaderboard</span>
          </h4>
          <p className="text-xs text-slate-400">High-five the top impact contributors to our green ecosystem of play.</p>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-slate-400 w-4">1.</span>
                <span className="font-semibold text-slate-800">Sarah Green</span>
              </div>
              <span className="font-mono text-slate-500">185.0 kg</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-slate-400 w-4">2.</span>
                <span className="font-semibold text-slate-800">Marcus Vance</span>
              </div>
              <span className="font-mono text-slate-500">124.2 kg</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-slate-400 w-4">3.</span>
                <span className="font-semibold text-slate-800">You</span>
                <span className="text-[9px] bg-slate-950 text-white rounded-full px-1.5 font-mono">active</span>
              </div>
              <span className="font-mono text-emerald-600 font-bold">{(userStats.totalSavingsKg).toFixed(1)} kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
