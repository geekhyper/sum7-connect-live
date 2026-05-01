import { useLocation, useNavigate } from "react-router";
import { Home, MessageCircle, Video, Bell, User, PlusCircle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { trpc } from "@/providers/trpc";

const navItems = [
  { path: "/", icon: Home, label: "Feed" },
  { path: "/live", icon: Video, label: "Live" },
  { path: "/create", icon: PlusCircle, label: "", isCenter: true },
  { path: "/chats", icon: MessageCircle, label: "Chats" },
  { path: "/notifications", icon: Bell, label: "Alerts" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: unreadCount } = trpc.notification.unreadCount.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user, refetchInterval: 30000 }
  );

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E5E5E5] z-50 flex items-center justify-around px-2 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      {navItems.map((item) => {
        if (item.isCenter) {
          return (
            <button
              key={item.path}
              onClick={() => navigate("/live")}
              className="relative -top-3 flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-[#4D8B87] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(77,139,135,0.4)] hover:bg-[#3A6B68] active:scale-95 transition-all">
                <PlusCircle className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
            </button>
          );
        }

        const active = isActive(item.path);
        const Icon = item.icon;

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-full relative"
          >
            <div className="relative">
              <Icon
                className={`w-6 h-6 transition-all ${
                  active ? "text-[#4D8B87]" : "text-[#888888]"
                }`}
                strokeWidth={active ? 2.5 : 1.5}
              />
              {item.path === "/notifications" && unreadCount && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#FF9A8B] rounded-full flex items-center justify-center">
                  <span className="text-[9px] text-white font-bold">{unreadCount > 9 ? "9+" : unreadCount}</span>
                </span>
              )}
            </div>
            <span
              className={`text-[10px] leading-tight transition-all ${
                active ? "text-[#4D8B87] font-semibold" : "text-[#888888] font-medium"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
