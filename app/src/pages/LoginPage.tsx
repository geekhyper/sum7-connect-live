import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const loginMutation = trpc.auth.login.useMutation();
  const meQuery = trpc.auth.me.useQuery(undefined, { enabled: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.token) {
        localStorage.setItem("token", result.token);
        const userData = await meQuery.refetch();
        if (userData.data) {
          useAuthStore.getState().login(result.token, userData.data);
          navigate("/");
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-[#4D8B87]/20 to-[#FF9A8B]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-[#4D8B87]/15 to-[#FF9A8B]/15 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#333333] tracking-tight">
            Sum<span className="text-[#4D8B87]">7</span>
          </h1>
          <p className="text-sm text-[#888888] mt-1 font-medium">Connect Live</p>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#333333]">Welcome Back</h2>
          <p className="text-sm text-[#888888] mt-1">Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-white border border-[#E5E5E5] rounded-lg text-[#333333] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4D8B87]/30 focus:border-[#4D8B87] transition-all text-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-11 pr-11 bg-white border border-[#E5E5E5] rounded-lg text-[#333333] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4D8B87]/30 focus:border-[#4D8B87] transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#333333]"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-12 bg-[#4D8B87] text-white font-semibold rounded-lg hover:bg-[#3A6B68] active:scale-[0.98] transition-all shadow-[0_2px_4px_rgba(77,139,135,0.25)] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loginMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#E5E5E5]" />
          <span className="text-xs text-[#888888]">or continue with</span>
          <div className="flex-1 h-px bg-[#E5E5E5]" />
        </div>

        {/* Social Login */}
        <div className="flex gap-3">
          <button className="flex-1 h-12 bg-white border border-[#E5E5E5] rounded-lg flex items-center justify-center gap-2 hover:bg-[#F1F1F1] transition-colors text-sm text-[#333333] font-medium">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button className="flex-1 h-12 bg-white border border-[#E5E5E5] rounded-lg flex items-center justify-center gap-2 hover:bg-[#F1F1F1] transition-colors text-sm text-[#333333] font-medium">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="black">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Apple
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#888888] mt-8">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#4D8B87] font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
