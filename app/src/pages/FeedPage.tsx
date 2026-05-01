import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send } from "lucide-react";

function StoryRing({ children, seen }: { children: React.ReactNode; seen?: boolean }) {
  return (
    <div className={`p-[2px] rounded-full ${seen ? "bg-[#E5E5E5]" : "bg-gradient-to-tr from-[#FF9A8B] to-[#4D8B87]"}`}>
      {children}
    </div>
  );
}

function PostCard({ post }: { post: any }) {
  const { user: currentUser } = useAuthStore();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showHeart, setShowHeart] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const likeMutation = trpc.like.toggle.useMutation();
  const commentMutation = trpc.comment.create.useMutation();
  const utils = trpc.useUtils();

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      const result = await likeMutation.mutateAsync({ userId: currentUser.id, postId: post.id });
      setLiked(result.liked);
      setLikesCount((prev: number) => result.liked ? prev + 1 : prev - 1);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDoubleTap = () => {
    setShowHeart(true);
    if (!liked) {
      handleLike();
    }
    setTimeout(() => setShowHeart(false), 800);
  };

  const handleComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    try {
      await commentMutation.mutateAsync({
        userId: currentUser.id,
        postId: post.id,
        text: commentText,
      });
      setCommentText("");
      utils.post.getById.invalidate({ id: post.id });
    } catch (e) {
      console.error(e);
    }
  };

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white border-b border-[#E5E5E5]">
      {/* Post Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <StoryRing seen={false}>
            <div className="w-9 h-9 rounded-full bg-[#F1F1F1] overflow-hidden">
              <img
                src={post.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.username}`}
                alt={post.user?.username}
                className="w-full h-full object-cover"
              />
            </div>
          </StoryRing>
          <div>
            <span className="text-sm font-semibold text-[#333333]">{post.user?.username}</span>
            <p className="text-xs text-[#888888]">{post.user?.fullName}</p>
          </div>
        </div>
        <button className="text-[#888888] hover:text-[#333333]">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Media */}
      <div className="relative" onDoubleClick={handleDoubleTap}>
        <img
          src={post.mediaUrl}
          alt="Post"
          className="w-full aspect-square object-cover"
        />
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-300">
            <Heart className="w-24 h-24 text-[#FF9A8B] fill-[#FF9A8B] drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="transition-transform active:scale-125"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  liked ? "text-[#FF9A8B] fill-[#FF9A8B]" : "text-[#333333]"
                }`}
                strokeWidth={liked ? 0 : 1.5}
              />
            </button>
            <button onClick={() => setShowComments(!showComments)}>
              <MessageCircle className="w-6 h-6 text-[#333333]" strokeWidth={1.5} />
            </button>
            <button>
              <Share2 className="w-6 h-6 text-[#333333]" strokeWidth={1.5} />
            </button>
          </div>
          <button>
            <Bookmark className="w-6 h-6 text-[#333333]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Likes */}
        <p className="text-sm font-semibold text-[#333333] mb-1">
          {likesCount.toLocaleString()} likes
        </p>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-[#333333] mb-1">
            <span className="font-semibold">{post.user?.username}</span>{" "}
            {post.caption}
          </p>
        )}

        {/* Comments link */}
        {post.commentsCount > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-[#888888] mb-1"
          >
            View all {post.commentsCount} comments
          </button>
        )}

        {/* Timestamp */}
        <p className="text-xs text-[#888888] mb-3">{timeAgo(post.createdAt)}</p>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-[#E5E5E5] px-4 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 h-10 px-4 bg-[#F1F1F1] rounded-full text-sm text-[#333333] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4D8B87]/30"
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim()}
              className="text-[#4D8B87] disabled:text-[#888888]"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const { user } = useAuthStore();
  const { data: posts, isLoading } = trpc.post.list.useQuery({ page: 1, limit: 20 });
  const { data: allUsers } = trpc.user.list.useQuery();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5] px-4 py-2 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-[#333333]">
          Sum<span className="text-[#4D8B87]">7</span>
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/chats")}
            className="relative text-[#333333]"
          >
            <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Stories Row */}
      <div className="bg-white border-b border-[#E5E5E5] px-4 py-3">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
          {/* My Story */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#F1F1F1] border-2 border-[#E5E5E5] overflow-hidden">
                <img
                  src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                  alt="My story"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#4D8B87] rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-white text-xs font-bold">+</span>
              </div>
            </div>
            <span className="text-[10px] text-[#333333] font-medium truncate w-16 text-center">Your Story</span>
          </div>

          {/* Other Users Stories */}
          {allUsers?.filter(u => u.id !== user?.id).slice(0, 10).map((storyUser) => (
            <div key={storyUser.id} className="flex flex-col items-center gap-1 flex-shrink-0">
              <StoryRing seen={false}>
                <div className="w-16 h-16 rounded-full bg-[#F1F1F1] overflow-hidden">
                  <img
                    src={storyUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${storyUser.username}`}
                    alt={storyUser.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              </StoryRing>
              <span className="text-[10px] text-[#333333] font-medium truncate w-16 text-center">
                {storyUser.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="pb-4">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg animate-pulse">
                <div className="h-12 bg-[#F1F1F1] rounded-t-lg" />
                <div className="aspect-square bg-[#F1F1F1]" />
                <div className="h-20 bg-[#F1F1F1] rounded-b-lg" />
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-[#F1F1F1] rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-[#888888]" />
            </div>
            <p className="text-lg font-semibold text-[#333333]">No posts yet</p>
            <p className="text-sm text-[#888888]">Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
}
