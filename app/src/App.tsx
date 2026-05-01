import { Routes, Route, Navigate, useLocation } from "react-router";
import { useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { useAuthStore } from "@/stores/authStore";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import FeedPage from "@/pages/FeedPage";
import LivePage from "@/pages/LivePage";
import NotificationsPage from "@/pages/NotificationsPage";
import ProfilePage from "@/pages/ProfilePage";
import ChatListPage from "@/pages/ChatListPage";
import ChatRoomPage from "@/pages/ChatRoomPage";
import UserProfilePage from "@/pages/UserProfilePage";
import BottomNav from "@/components/BottomNav";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      {children}
      <BottomNav />
    </div>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    enabled: !!localStorage.getItem("token"),
  });

  useEffect(() => {
    if (meQuery.isSuccess) {
      setLoading(false);
      if (meQuery.data) {
        setUser(meQuery.data);
      } else {
        useAuthStore.getState().logout();
      }
    } else if (meQuery.isError) {
      setLoading(false);
      useAuthStore.getState().logout();
    }
  }, [meQuery.isSuccess, meQuery.isError, meQuery.data, setUser, setLoading]);

  if (isLoading && meQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-8 h-8 border-3 border-[#4D8B87] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const location = useLocation();
  const hideNavPaths = ["/login", "/register", "/chat/"];
  const shouldShowNav = !hideNavPaths.some(path => location.pathname.startsWith(path));

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/chat/:roomId" element={<AuthGuard><ChatRoomPage /></AuthGuard>} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<FeedPage />} />
                  <Route path="/live" element={<LivePage />} />
                  <Route path="/chats" element={<ChatListPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/:userId" element={<UserProfilePage />} />
                </Routes>
              </AppLayout>
            </AuthGuard>
          }
        />
      </Routes>
      {shouldShowNav && <BottomNav />}
    </>
  );
}
