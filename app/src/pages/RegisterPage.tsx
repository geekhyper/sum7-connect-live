import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuthStore } from "@/stores/authStore";
import { Mail, Lock, User, Phone, ChevronLeft, ChevronRight, Camera } from "lucide-react";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Spain", "Italy", "Netherlands", "Brazil", "Mexico", "India",
  "Japan", "South Korea", "China", "Nigeria", "South Africa", "Egypt",
  "Turkey", "Saudi Arabia", "UAE", "Pakistan", "Indonesia", "Thailand",
  "Vietnam", "Philippines", "Malaysia", "Singapore", "Argentina", "Chile",
  "Colombia", "Kenya", "Ghana", "Morocco", "Israel", "Russia", "Ukraine",
  "Poland", "Sweden", "Norway", "Denmark", "Finland", "Portugal", "Greece",
  "New Zealand", "Ireland", "Belgium", "Switzerland", "Austria",
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const registerMutation = trpc.auth.register.useMutation();
  const meQuery = trpc.auth.me.useQuery(undefined, { enabled: false });

  const validateStep1 = () => {
    if (!fullName.trim()) return "Full name is required";
    if (!username.trim() || username.length < 3) return "Username must be at least 3 characters";
    if (!email.trim() || !email.includes("@")) return "Valid email is required";
    if (!phone.trim()) return "Phone number is required";
    return "";
  };

  const validateStep2 = () => {
    if (!gender) return "Please select a gender";
    if (!country) return "Please select a country";
    if (!password || password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleNext = () => {
    const err = step === 1 ? validateStep1() : validateStep2();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError("");
    try {
      const result = await registerMutation.mutateAsync({
        email,
        password,
        fullName,
        username,
        phone,
        gender: gender as any,
        country,
        bio: bio || undefined,
      });
      if (result.token) {
        localStorage.setItem("token", result.token);
        const userData = await meQuery.refetch();
        if (userData.data) {
          useAuthStore.getState().login(result.token, userData.data);
          navigate("/");
        }
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col px-6 py-8 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-[#4D8B87]/20 to-[#FF9A8B]/20 rounded-full blur-3xl" />

      <div className="w-full max-w-sm mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center mb-6">
          {step > 1 && (
            <button onClick={handleBack} className="mr-3 text-[#333333] hover:text-[#4D8B87]">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-[#333333] tracking-tight">
              Sum<span className="text-[#4D8B87]">7</span>
            </h1>
            <p className="text-sm text-[#888888] font-medium">Connect Live</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  s === step ? "bg-[#4D8B87] text-white scale-110" :
                  s < step ? "bg-[#4D8B87]/20 text-[#4D8B87]" : "bg-[#E5E5E5] text-[#888888]"
                }`}
              >
                {s < step ? "✓" : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? "bg-[#4D8B87]" : "bg-[#E5E5E5]"}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Step 1 - Personal */}
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div>
              <h2 className="text-2xl font-bold text-[#333333]">Personal Info</h2>
              <p className="text-sm text-[#888888]">Tell us about yourself</p>
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-white border border-[#E5E5E5] rounded-lg text-[#333333] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4D8B87]/30 focus:border-[#4D8B87] transition-all text-sm"
              />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-white border border-[#E5E5E5] rounded-lg text-[#333333] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4D8B87]/30 focus:border-[#4D8B87] transition-all text-sm"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-white border border-[#E5E5E5] rounded-lg text-[#333333] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4D8B87]/30 focus:border-[#4D8B87] transition-all text-sm"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-white border border-[#E5E5E5] rounded-lg text-[#333333] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4D8B87]/30 focus:border-[#4D8B87] transition-all text-sm"
              />
            </div>

            <button
              onClick={handleNext}
              className="w-full h-12 bg-[#4D8B87] text-white font-semibold rounded-lg hover:bg-[#3A6B68] active:scale-[0.98] transition-all shadow-[0_2px_4px_rgba(77,139,135,0.25)] flex items-center justify-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2 - Details */}
        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div>
              <h2 className="text-2xl font-bold text-[#333333]">More Details</h2>
              <p className="text-sm text-[#888888]">Complete your profile</p>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="text-sm font-medium text-[#333333] mb-2 block">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {["male", "female", "other", "prefer_not_to_say"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`h-10 rounded-lg text-sm font-medium transition-all ${
                      gender === g
                        ? "bg-[#4D8B87] text-white"
                        : "bg-white border border-[#E5E5E5] text-[#333333] hover:bg-[#F1F1F1]"
                    }`}
                  >
                    {g === "prefer_not_to_say" ? "Prefer not to say" : g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="text-sm font-medium text-[#333333] mb-2 block">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-12 px-4 bg-white border border-[#E5E5E5] rounded-lg text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#4D8B87]/30 focus:border-[#4D8B87] transition-all text-sm appearance-none"
              >
                <option value="">Select your country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-[#333333] mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-11 bg-white border border-[#E5E5E5] rounded-lg text-[#333333] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4D8B87]/30 focus:border-[#4D8B87] transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888]"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm font-medium text-[#333333] mb-2 block">Bio (optional)</label>
              <textarea
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-20 px-4 py-3 bg-white border border-[#E5E5E5] rounded-lg text-[#333333] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4D8B87]/30 focus:border-[#4D8B87] transition-all text-sm resize-none"
              />
            </div>

            <button
              onClick={handleNext}
              className="w-full h-12 bg-[#4D8B87] text-white font-semibold rounded-lg hover:bg-[#3A6B68] active:scale-[0.98] transition-all shadow-[0_2px_4px_rgba(77,139,135,0.25)] flex items-center justify-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3 - Photo & Submit */}
        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div>
              <h2 className="text-2xl font-bold text-[#333333]">Almost Done!</h2>
              <p className="text-sm text-[#888888]">Create your account</p>
            </div>

            <div className="flex flex-col items-center py-6">
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-[#4D8B87] flex items-center justify-center bg-[#F1F1F1] mb-4">
                <Camera className="w-10 h-10 text-[#4D8B87]" />
              </div>
              <p className="text-sm text-[#888888]">Profile photo (optional)</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={registerMutation.isPending}
              className="w-full h-12 bg-[#4D8B87] text-white font-semibold rounded-lg hover:bg-[#3A6B68] active:scale-[0.98] transition-all shadow-[0_2px_4px_rgba(77,139,135,0.25)] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {registerMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>

            <button
              onClick={handleSubmit}
              className="w-full h-12 bg-transparent text-[#888888] font-medium rounded-lg hover:bg-[#F1F1F1] transition-all text-sm"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-[#888888] mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-[#4D8B87] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
