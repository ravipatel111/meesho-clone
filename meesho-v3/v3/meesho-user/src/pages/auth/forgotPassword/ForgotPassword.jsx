import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  forgotPassword,
  clearMessages,
  setPendingEmail,
} from "../../../redux/slices/authSlice";

// Custom inline SVG icons for forgot password page
const Icons = {
  Mail: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  ShieldAlert: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  ArrowLeft: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
};

export default function ForgotPassword() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, successMessage } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({ email: "" });
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = "";
    if (name === "email") {
      if (!value.trim()) error = "Email Address is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) error = "Enter a valid email address.";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      const fieldError = validateField(name, value);
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (fieldError) newErrors[name] = fieldError;
        else delete newErrors[name];
        return newErrors;
      });
      return newForm;
    });
  };

  useEffect(() => {
    return () => dispatch(clearMessages());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const emailError = validateField("email", form.email);
    if (emailError) newErrors.email = emailError;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const result = await dispatch(forgotPassword(form.email));

    if (forgotPassword.fulfilled.match(result)) {
      dispatch(setPendingEmail(form.email));
      navigate("/reset-password");
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100/80 animate-fade-in text-slate-800 text-xs">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg select-none mb-3 shadow-md bg-gradient-to-tr from-[#0466c8] to-[#0353a4] shadow-[#0466c8]/20">
          M
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Forgot Password</h1>
        <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed max-w-[280px]">
          Enter your email and we'll send you an OTP code to verify and reset your password.
        </p>
      </div>

      {/* Error Message Box */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-4 mb-5 flex items-start gap-3 text-xs animate-shake animate-pulse">
          <Icons.ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="font-semibold leading-relaxed">{error}</div>
        </div>
      )}

      {/* Success Message Box */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl p-4 mb-5 flex items-start gap-3 text-xs">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
          <div className="font-semibold leading-relaxed">{successMessage} Redirecting...</div>
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
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:border-[#0466c8] focus:ring-[#0466c8]/10 bg-slate-50/50 transition-all text-slate-800"
              placeholder="you@example.com"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.Mail />
            </div>
          </div>
          {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.email}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-[#0466c8] hover:bg-[#0353a4] text-white rounded-2xl font-bold text-xs shadow-md transition-all active:scale-[0.98] select-none flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Requesting verification OTP...</span>
            </>
          ) : (
            <span>Send OTP Verification Code</span>
          )}
        </button>
      </form>

      {/* Redirect Footer */}
      <div className="text-center mt-6 pt-6 border-t border-slate-50 font-semibold text-slate-400">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-[#0466c8] hover:underline">
          <Icons.ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
        </Link>
      </div>
    </div>
  );
}
