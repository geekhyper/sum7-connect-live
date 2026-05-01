import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Settings, Grid, Play, UserPlus, MapPin, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "tagged">("posts");
  const { data: posts } = trpc.post.list.useQuery({ page: 1, limit: 50, userId: user?.id });
  const { data: profileUser } = trpc.user.getById.useQuery(
    { id: user?.id || 0 },
    { enabled: !!user }
  );

  if (!user) return null;

  const displayUser = profileUser || user;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5] px-4 py-2 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#333333]">{displayUser.username}</h1>
        <button className="text-[#333333]">
          <Settings className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </header>

      {/* Profile Info */}
      <div className="bg-white px-4 py-5">
        {/* Avatar + Stats */}
        <div className="flex items-center gap-6 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF9A8B] to-[#4D8B87] p-[2px]">
            <div className="w-full h-full rounded-full bg-[#F1F1F1] overflow-hidden">
              <img
                src={displayUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUser.username}`}
                alt={displayUser.username}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 flex justify-around">
            <div className="text-center">
              <p className="text-lg font-bold text-[#333333]">{displayUser.postsCount}</p>
              <p className="text-xs text-[#888888]">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[#333333]">{displayUser.followersCount}</p>
              <p className="text-xs text-[#888888]">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[#333333]">{displayUser.followingCount}</p>
              <p className="text-xs text-[#888888]">Following</p>
            </div>
          </div>
        </div>

        {/* Name + Bio */}
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[#333333]">{displayUser.fullName}</h2>
          {displayUser.bio && <p className="text-sm text-[#333333] mt-1">{displayUser.bio}</p>}
          <div className="flex items-center gap-4 mt-2">
            {displayUser.country && (
              <span className="flex items-center gap-1 text-xs text-[#888888]">
                <MapPin className="w-3 h-3" /> {displayUser.country}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-[#888888]">
              <Calendar className="w-3 h-3" />
              Joined {new Date(displayUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 h-9 bg-white border border-[#E5E5E5] rounded-lg text-sm font-semibold text-[#333333] hover:bg-[#F1F1F1] transition-colors">
            Edit Profile
          </button>
          <button className="flex-1 h-9 bg-white border border-[#E5E5E5] rounded-lg text-sm font-semibold text-[#333333] hover:bg-[#F1F1F1] transition-colors">
            Share Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E5E5] bg-white">
        {[
          { key: "posts" as const, icon: Grid },
          { key: "reels" as const, icon: Play },
          { key: "tagged" as const, icon: UserPlus },
        ].map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-3 flex justify-center items-center transition-colors ${
              activeTab === key ? "border-b-2 border-[#4D8B87]" : ""
            }`}
          >
            <Icon
              className={`w-5 h-5 ${activeTab === key ? "text-[#4D8B87]" : "text-[#888888]"}`}
              strokeWidth={activeTab === key ? 2.5 : 1.5}
            />
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-0.5">
        {activeTab === "posts" && (
          <div className="grid grid-cols-3 gap-0.5">
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="aspect-square bg-[#F1F1F1] overflow-hidden">
                  <img
                    src={post.mediaUrl}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-[#F1F1F1] rounded-full flex items-center justify-center mb-3">
                  <Grid className="w-8 h-8 text-[#888888]" />
                </div>
                <p className="text-base font-semibold text-[#333333]">No posts yet</p>
                <p className="text-sm text-[#888888]">Share your first moment</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reels" && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-[#F1F1F1] rounded-full flex items-center justify-center mb-3">
              <Play className="w-8 h-8 text-[#888888]" />
            </div>
            <p className="text-base font-semibold text-[#333333]">No reels yet</p>
            <p className="text-sm text-[#888888]">Create your first video</p>
          </div>
        )}

        {activeTab === "tagged" && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-[#F1F1F1] rounded-full flex items-center justify-center mb-3">
              <UserPlus className="w-8 h-8 text-[#888888]" />
            </div>
            <p className="text-base font-semibold text-[#333333]">No tags yet</p>
            <p className="text-sm text-[#888888]">Photos you are tagged in</p>
          </div>
        )}
      </div>
    </div>
  );
}
