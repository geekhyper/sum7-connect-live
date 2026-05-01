import { trpc } from "@/providers/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Heart, MessageCircle, UserPlus, AtSign, Check } from "lucide-react";

function getNotificationIcon(type: string) {
  switch (type) {
    case "like": return <Heart className="w-4 h-4 text-[#FF9A8B]" />;
    case "comment": return <MessageCircle className="w-4 h-4 text-[#4D8B87]" />;
    case "follow": return <UserPlus className="w-4 h-4 text-[#4D8B87]" />;
    case "mention": return <AtSign className="w-4 h-4 text-[#FF9A8B]" />;
    default: return <Heart className="w-4 h-4 text-[#FF9A8B]" />;
  }
}

function getNotificationText(type: string) {
  switch (type) {
    case "like": return "liked your photo";
    case "comment": return "commented on your post";
    case "follow": return "started following you";
    case "mention": return "mentioned you";
    default: return "interacted with you";
  }
}

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { data: notifications, isLoading } = trpc.notification.list.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user, refetchInterval: 30000 }
  );
  const markAsReadMutation = trpc.notification.markAsRead.useMutation();
  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation();
  const utils = trpc.useUtils();

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsReadMutation.mutateAsync({ id });
      utils.notification.list.invalidate({ userId: user?.id || 0 });
      utils.notification.unreadCount.invalidate({ userId: user?.id || 0 });
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync({ userId: user?.id || 0 });
      utils.notification.list.invalidate({ userId: user?.id || 0 });
      utils.notification.unreadCount.invalidate({ userId: user?.id || 0 });
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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5] px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#333333]">Notifications</h1>
        {notifications && notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-[#4D8B87] font-semibold flex items-center gap-1"
          >
            <Check className="w-4 h-4" /> Mark all read
          </button>
        )}
      </header>

      {/* Notifications List */}
      <div>
        {isLoading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-[#F1F1F1]" />
                <div className="flex-1">
                  <div className="h-4 bg-[#F1F1F1] rounded w-48 mb-1" />
                  <div className="h-3 bg-[#F1F1F1] rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                !notification.isRead ? "bg-[#4D8B87]/5" : "hover:bg-white"
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-[#F1F1F1] overflow-hidden">
                  <img
                    src={notification.actor?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.actor?.username}`}
                    alt={notification.actor?.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#333333]">
                  <span className="font-semibold">{notification.actor?.username}</span>{" "}
                  {getNotificationText(notification.type)}
                </p>
                <p className="text-xs text-[#888888] mt-0.5">{timeAgo(notification.createdAt)}</p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-[#4D8B87] rounded-full flex-shrink-0 mt-2" />
              )}
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-[#F1F1F1] rounded-full flex items-center justify-center mb-3">
              <Heart className="w-8 h-8 text-[#888888]" />
            </div>
            <p className="text-base font-semibold text-[#333333]">No notifications yet</p>
            <p className="text-sm text-[#888888]">Activity will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
