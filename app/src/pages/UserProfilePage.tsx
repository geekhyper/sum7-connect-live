import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuthStore } from "@/stores/authStore";
import { ChevronLeft, Grid, Play, UserPlus, MapPin, MessageCircle } from "lucide-react";

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "tagged">("posts");
  
  const { data: profileUser } = trpc.user.getById.useQuery(
    { id: Number(userId) },
    { enabled: !!userId }
  );
  const { data: posts } = trpc.post.list.useQuery(
    { page: 1, limit: 50, userId: Number(userId) },
    { enabled: !!userId }
  );
  const { data: isFollowing } = trpc.follow.check.useQuery(
    { followerId: currentUser?.id || 0, followingId: Number(userId) },
    { enabled: !!currentUser && !!userId }
  );
  const followMutation = trpc.follow.toggle.useMutation();
  const getOrCreateRoom = trpc.chat.getOrCreateRoom.useMutation();
  const utils = trpc.useUtils();

  const handleFollow = async () => {
    if (!currentUser || !userId) return;
    try {
      await followMutation.mutateAsync({
        followerId: currentUser.id,
        followingId: Number(userId),
      });
      utils.follow.check.invalidate({ followerId: currentUser.id, followingId: Number(userId) });
      utils.user.getById.invalidate({ id: Number(userId) });
    } catch (e) {
      console.error(e);
    }
  };

  const startChat = async () => {
    if (!currentUser || !userId) return;
    try {
      const result = await getOrCreateRoom.mutateAsync({
        user1Id: currentUser.id,
        user2Id: Number(userId),
      });
      navigate(`/chat/${result.roomId}`);
    } catch (e) {
      console.error(e);
    }
  };

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#4D8B87] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5] px-4 py-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#333333]">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-[#333333]">{profileUser.username}</h1>
      </header>

      {/* Profile Info */}
      <div className="bg-white px-4 py-5">
        {/* Avatar + Stats */}
        <div className="flex items-center gap-6 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF9A8B] to-[#4D8B87] p-[2px]">
            <div className="w-full h-full rounded-full bg-[#F1F1F1] overflow-hidden">
              <img
                src={profileUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username}`}
                alt={profileUser.username}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 flex justify-around">
            <div className="text-center">
              <p className="text-lg font-bold text-[#333333]">{profileUser.postsCount}</p>
              <p className="text-xs text-[#888888]">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[#333333]">{profileUser.followersCount}</p>
              <p className="text-xs text-[#888888]">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[#333333]">{profileUser.followingCount}</p>
              <p className="text-xs text-[#888888]">Following</p>
            </div>
          </div>
        </div>

        {/* Name + Bio */}
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[#333333]">{profileUser.fullName}</h2>
          {profileUser.bio && <p className="text-sm text-[#333333] mt-1">{profileUser.bio}</p>}
          {profileUser.country && (
            <span className="flex items-center gap-1 text-xs text-[#888888] mt-2">
              <MapPin className="w-3 h-3" /> {profileUser.country}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="flex gap-2">
            <button
              onClick={handleFollow}
              className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-colors ${
                isFollowing?.following
                  ? "bg-white border border-[#E5E5E5] text-[#333333] hover:bg-[#F1F1F1]"
                  : "bg-[#4D8B87] text-white hover:bg-[#3A6B68]"
              }`}
            >
              {isFollowing?.following ? "Following" : "Follow"}
            </button>
            <button
              onClick={startChat}
              className="flex-1 h-9 bg-white border border-[#E5E5E5] rounded-lg text-sm font-semibold text-[#333333] hover:bg-[#F1F1F1] transition-colors flex items-center justify-center gap-1"
            >
              <MessageCircle className="w-4 h-4" /> Message
            </button>
          </div>
        )}
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
          </div>
        )}

        {activeTab === "tagged" && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-[#F1F1F1] rounded-full flex items-center justify-center mb-3">
              <UserPlus className="w-8 h-8 text-[#888888]" />
            </div>
            <p className="text-base font-semibold text-[#333333]">No tags yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
