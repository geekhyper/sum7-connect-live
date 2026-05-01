import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Search, MessageSquare } from "lucide-react";

export default function ChatListPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: conversations, isLoading } = trpc.chat.getConversations.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user, refetchInterval: 10000 }
  );
  const { data: allUsers } = trpc.user.list.useQuery();
  const getOrCreateRoom = trpc.chat.getOrCreateRoom.useMutation();

  const startChat = async (otherUserId: number) => {
    if (!user) return;
    try {
      const result = await getOrCreateRoom.mutateAsync({
        user1Id: user.id,
        user2Id: otherUserId,
      });
      navigate(`/chat/${result.roomId}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5] px-4 py-3">
        <h1 className="text-xl font-bold text-[#333333]">Messages</h1>
      </header>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full h-10 pl-10 pr-4 bg-[#F1F1F1] rounded-full text-sm text-[#333333] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4D8B87]/30"
          />
        </div>
      </div>

      {/* Online Users */}
      <div className="px-4 pb-3">
        <h2 className="text-sm font-semibold text-[#333333] mb-3">Start a chat</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {allUsers?.filter(u => u.id !== user?.id).slice(0, 8).map((chatUser) => (
            <button
              key={chatUser.id}
              onClick={() => startChat(chatUser.id)}
              className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-[#F1F1F1] overflow-hidden">
                  <img
                    src={chatUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatUser.username}`}
                    alt={chatUser.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                {chatUser.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <span className="text-[10px] text-[#333333] font-medium truncate w-14 text-center">
                {chatUser.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversations */}
      <div className="border-t border-[#E5E5E5]">
        <h2 className="text-sm font-semibold text-[#333333] px-4 py-3">Recent</h2>
        {isLoading ? (
          <div className="space-y-2 px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-[#F1F1F1]" />
                <div className="flex-1">
                  <div className="h-4 bg-[#F1F1F1] rounded w-24 mb-1" />
                  <div className="h-3 bg-[#F1F1F1] rounded w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => navigate(`/chat/${conv.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-left"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#F1F1F1] overflow-hidden">
                  <img
                    src={conv.otherUser?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.otherUser?.username}`}
                    alt={conv.otherUser?.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                {conv.otherUser?.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#333333] truncate">{conv.otherUser?.fullName || conv.otherUser?.username}</p>
                  {conv.lastMessageAt && (
                    <span className="text-xs text-[#888888] flex-shrink-0 ml-2">
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#888888] truncate">{conv.lastMessage || "No messages yet"}</p>
                  {(conv.unreadCount ?? 0) > 0 && (
                    <span className="ml-2 min-w-[18px] h-[18px] bg-[#FF9A8B] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-white font-bold">{conv.unreadCount}</span>
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-[#F1F1F1] rounded-full flex items-center justify-center mb-3">
              <MessageSquare className="w-8 h-8 text-[#888888]" />
            </div>
            <p className="text-base font-semibold text-[#333333]">No messages yet</p>
            <p className="text-sm text-[#888888]">Start a conversation above</p>
          </div>
        )}
      </div>
    </div>
  );
}
