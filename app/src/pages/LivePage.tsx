import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Video, Mic, Camera, PhoneOff, MessageCircle, Sparkles, User } from "lucide-react";

const INTERESTS = ["Music", "Gaming", "Talk", "Study", "Travel", "Food", "Sports", "Movies", "Tech", "Art"];

export default function LivePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "searching" | "matched" | "ended">("idle");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const getOrCreateRoom = trpc.chat.getOrCreateRoom.useMutation();
  const endRoom = trpc.chat.endRoom.useMutation();

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const startMatching = async () => {
    if (!user) return;
    setStatus("searching");
    
    setTimeout(async () => {
      try {
        const result = await getOrCreateRoom.mutateAsync({
          user1Id: user.id,
          user2Id: user.id + 1,
        });
        setActiveRoomId(result.roomId);
        setStatus("matched");
      } catch {
        setStatus("matched");
      }
    }, 2000);
  };

  const handleEndChat = async () => {
    setStatus("ended");
    if (activeRoomId) {
      try {
        await endRoom.mutateAsync({ roomId: activeRoomId });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const findNewMatch = () => {
    setStatus("idle");
    setActiveRoomId(null);
  };

  const goToChat = () => {
    if (activeRoomId) {
      navigate(`/chat/${activeRoomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5] px-4 py-3">
        <h1 className="text-xl font-bold text-[#333333]">Go Live</h1>
      </header>

      {/* Idle State */}
      {status === "idle" && (
        <div className="flex flex-col items-center px-6 py-10">
          {/* Pulsing Circle */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#4D8B87]/20 rounded-full animate-ping" style={{ animationDuration: "2s" }} />
            <div className="relative w-28 h-28 bg-gradient-to-br from-[#4D8B87] to-[#3A6B68] rounded-full flex items-center justify-center shadow-lg">
              <Video className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#333333] mb-2">Meet Someone New</h2>
          <p className="text-sm text-[#888888] text-center mb-8 max-w-xs">
            Connect randomly with people around the world who share your interests
          </p>

          {/* Interest Tags */}
          <div className="w-full max-w-sm mb-8">
            <p className="text-sm font-semibold text-[#333333] mb-3">Select your interests</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedInterests.includes(interest)
                      ? "bg-[#4D8B87] text-white shadow-md"
                      : "bg-white border border-[#E5E5E5] text-[#333333] hover:bg-[#F1F1F1]"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startMatching}
            className="w-full max-w-sm h-14 bg-[#4D8B87] text-white font-semibold text-lg rounded-xl hover:bg-[#3A6B68] active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(77,139,135,0.3)] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" /> Start Matching
          </button>
        </div>
      )}

      {/* Searching State */}
      {status === "searching" && (
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-[#4D8B87]/20 border-t-[#4D8B87] rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-[#333333] mb-2">Finding someone...</h2>
          <p className="text-sm text-[#888888]">Looking for a match based on your interests</p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-8 px-6 h-10 bg-white border border-[#E5E5E5] rounded-lg text-sm font-medium text-[#333333] hover:bg-[#F1F1F1] transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Matched State */}
      {status === "matched" && (
        <div className="flex flex-col items-center px-6 py-8">
          <div className="w-full max-w-sm mb-6">
            <div className="aspect-[3/4] bg-[#333333] rounded-2xl overflow-hidden relative shadow-xl">
              {/* Placeholder for remote video */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#4D8B87]/30 flex items-center justify-center mb-4">
                  <Video className="w-10 h-10 text-white" />
                </div>
                <p className="text-white font-semibold">Connected!</p>
                <p className="text-white/60 text-sm">Video chat starting...</p>
              </div>
              
              {/* Local video preview */}
              <div className="absolute bottom-3 right-3 w-24 h-32 bg-[#222] rounded-xl overflow-hidden border-2 border-white/20">
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white/40" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#F1F1F1] transition-colors">
              <Mic className="w-5 h-5 text-[#333333]" />
            </button>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#F1F1F1] transition-colors">
              <Camera className="w-5 h-5 text-[#333333]" />
            </button>
            <button 
              onClick={goToChat}
              className="w-12 h-12 bg-[#4D8B87] rounded-full flex items-center justify-center shadow-md hover:bg-[#3A6B68] transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={handleEndChat}
              className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>

          <p className="text-sm text-[#888888]">Tap message icon to text chat</p>
        </div>
      )}

      {/* Ended State */}
      {status === "ended" && (
        <div className="flex flex-col items-center px-6 py-16">
          <div className="w-20 h-20 bg-[#F1F1F1] rounded-full flex items-center justify-center mb-6">
            <PhoneOff className="w-10 h-10 text-[#888888]" />
          </div>
          <h2 className="text-xl font-bold text-[#333333] mb-2">Call Ended</h2>
          <p className="text-sm text-[#888888] mb-8">Thanks for connecting!</p>
          
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={findNewMatch}
              className="w-full h-12 bg-[#4D8B87] text-white font-semibold rounded-xl hover:bg-[#3A6B68] active:scale-[0.98] transition-all shadow-[0_2px_8px_rgba(77,139,135,0.3)] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Find New Match
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full h-12 bg-white border border-[#E5E5E5] text-[#333333] font-medium rounded-xl hover:bg-[#F1F1F1] transition-colors"
            >
              Back to Feed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
