import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuthStore } from "@/stores/authStore";
import { ChevronLeft, Send, Phone, Video, MoreVertical } from "lucide-react";

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = trpc.chat.getMessages.useQuery(
    { roomId: Number(roomId), page: 1, limit: 100 },
    { enabled: !!roomId, refetchInterval: 3000 }
  );

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const utils = trpc.useUtils();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !user || !roomId) return;
    try {
      await sendMessageMutation.mutateAsync({
        roomId: Number(roomId),
        senderId: user.id,
        content: messageText.trim(),
      });
      setMessageText("");
      utils.chat.getMessages.invalidate({ roomId: Number(roomId) });
    } catch (e) {
      console.error(e);
    }
  };

  const otherParticipant = messages?.find(m => m.senderId !== user?.id)?.sender;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] px-4 py-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#333333]">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#F1F1F1] overflow-hidden">
              {otherParticipant ? (
                <img
                  src={otherParticipant.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant.username}`}
                  alt={otherParticipant.username || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#4D8B87]/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#4D8B87]">?</span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#333333]">
              {otherParticipant?.fullName || otherParticipant?.username || "Chat"}
            </p>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[#4D8B87]">
            <Phone className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="text-[#4D8B87]">
            <Video className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="text-[#888888]">
            <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <div className={`h-10 w-48 bg-[#F1F1F1] rounded-2xl animate-pulse ${i % 2 === 0 ? "rounded-tr-md" : "rounded-tl-md"}`} />
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  isMine
                    ? "bg-[#4D8B87] text-white rounded-tr-md"
                    : "bg-white text-[#333333] rounded-tl-md shadow-sm border border-[#E5E5E5]"
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? "text-white/70" : "text-[#888888]"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <div className="w-16 h-16 bg-[#F1F1F1] rounded-full flex items-center justify-center mb-3">
              <Send className="w-8 h-8 text-[#888888]" />
            </div>
            <p className="text-base font-semibold text-[#333333]">Start chatting</p>
            <p className="text-sm text-[#888888]">Send a message to begin</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#E5E5E5] px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-11 px-4 bg-[#F1F1F1] rounded-full text-sm text-[#333333] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4D8B87]/30"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            className="w-11 h-11 bg-[#4D8B87] rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:bg-[#888888] hover:bg-[#3A6B68] transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
