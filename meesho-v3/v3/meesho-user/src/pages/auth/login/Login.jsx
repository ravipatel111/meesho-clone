import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { loginUser, clearMessages } from "../../../redux/slices/authSlice";

// Custom inline SVG icons for the login form
const Icons = {
  Mail: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Lock: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Eye: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.878 10.414a3.5 3.5 0 00-4.875 4.875m3.536-3.536L15 12M3 3l18 18M9.88 9.88a9 9 0 00-5.12 2.12c1.274 4.057 5.064 7 9.542 7 1.455 0 2.825-.315 4.05-.88m-1.39-1.39a3 3 0 11-3.77-3.77m-1.39-1.39A9 9 0 0012 5c4.478 0 8.268 2.943 9.542 7a9 9 0 00-3.3 3.3" />
    </svg>
  ),
  ShieldAlert: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
};

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token, user } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [uiError, setUiError] = useState("");

  useEffect(() => {
    if (token && user) {
      navigate(user.role === "admin" ? "/dashboard" : "/home", {
        replace: true,
      });
    }
  }, [token, user, navigate]);

  useEffect(() => {
    return () => dispatch(clearMessages());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setUiError("");

    // Custom UI Validation matching typical OpenAPI backend validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
      setUiError("Please provide a valid email address (e.g., user@example.com).");
      return;
    }
    if (!form.password) {
      setUiError("Password cannot be empty.");
      return;
    }
    if (form.password.length < 6) {
      setUiError("Password must be at least 6 characters long.");
      return;
    }

    dispatch(loginUser({ email: form.email, password: form.password }));
  };

  const brandAccent = "bg-[#0466c8] hover:bg-[#0353a4] text-white";
  const textAccent = "text-[#0466c8]";
  const borderFocus = "focus:border-[#0466c8] focus:ring-[#0466c8]/10";

  return (
    <div className="w-full max-w-[440px] bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100/80 animate-fade-in">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg select-none mb-3 shadow-md bg-gradient-to-tr from-[#0466c8] to-[#0353a4] shadow-[#0466c8]/20`}>
          M
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-1.5">
          <span>Meesho</span>
          <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">Portal</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Shop, track orders, and discover resellers
        </p>
      </div>



      {/* Error Message Box */}
      {(uiError || error) && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-4 mb-6 flex items-start gap-3 text-xs animate-shake animate-pulse">
          <Icons.ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="font-semibold leading-relaxed">{uiError || error}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
          <div className="relative">
            <input
              type="email"
              value={form.email}
              required
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 bg-slate-50/50 transition-all ${borderFocus}`}
              placeholder="you@example.com"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.Mail />
            </div>
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className={`text-[11px] font-bold hover:underline transition-colors ${textAccent}`}
              >
                Forgot Password?
              </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              required
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full pl-10 pr-11 py-3 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 bg-slate-50/50 transition-all ${borderFocus}`}
              placeholder="••••••••"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.Lock />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3.5 rounded-2xl font-bold text-xs shadow-md transition-all active:scale-[0.98] select-none shrink-0 flex items-center justify-center gap-2 mt-2 ${brandAccent}`}
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <span>Log In to Account</span>
          )}
        </button>
      </form>

      {/* Footer Registration Link */}
      <div className="text-center mt-6 pt-6 border-t border-slate-50 text-xs text-slate-400 font-medium">
        Don't have an account?{" "}
        <Link to="/register" className={`font-bold hover:underline ${textAccent}`}>
          Register Now
        </Link>
      </div>
    </div>
  );
}
