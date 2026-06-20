import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { loginUser, clearMessages } from "../../../redux/slices/authSlice";

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.878 10.414a3.5 3.5 0 00-4.875 4.875M3 3l18 18M9.88 9.88a9 9 0 00-5.12 2.12c1.274 4.057 5.064 7 9.542 7 1.455 0 2.825-.315 4.05-.88m-1.39-1.39a3 3 0 11-3.77-3.77m-1.39-1.39A9 9 0 0112 5c4.478 0 8.268 2.943 9.542 7a9 9 0 01-3.3 3.3" />
  </svg>
);

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token, user } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    if (name === "email") {
      if (!value.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Enter a valid email address.";
    }
    if (name === "password") {
      if (!value) return "Password is required.";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    const fieldError = validateField(name, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (fieldError) next[name] = fieldError;
      else delete next[name];
      return next;
    });
  };

  useEffect(() => {
    if (token && user?.role === "admin") navigate("/dashboard", { replace: true });
  }, [token, user, navigate]);

  useEffect(() => { return () => dispatch(clearMessages()); }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    dispatch(loginUser({ email: form.email, password: form.password }));
  };

  return (
    <div className="w-full max-w-[420px] bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100/80">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg bg-slate-900 shadow-md mb-3">
          M
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Meesho <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full align-middle">Admin</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Admin Console — Management Access</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-4 mb-5 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:border-slate-800 focus:ring-slate-800/10 bg-slate-50/50 transition-all"
            placeholder="admin@example.com"
          />
          {errors.email && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-4 pr-11 py-3 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:border-slate-800 focus:ring-slate-800/10 bg-slate-50/50 transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.password && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying...</span>
            </>
          ) : "Log In to Admin Panel"}
        </button>
      </form>
    </div>
  );
}
