import { create } from "zustand";

interface User {
  id: number;
  email: string;
  fullName: string;
  username: string;
  phone: string | null;
  gender: string | null;
  country: string | null;
  avatarUrl: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isOnline: boolean;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    set({ token, isAuthenticated: !!token });
  },
  login: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },
  setLoading: (loading) => set({ isLoading: loading }),
}));
