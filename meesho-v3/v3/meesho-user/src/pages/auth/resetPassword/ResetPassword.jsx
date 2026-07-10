import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { resetPassword, resendOtp, clearMessages } from "../../../redux/slices/authSlice";

// Custom inline SVG icons
const Icons = {
  Key: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ),
  ShieldAlert: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

export default function ResetPassword() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const pendingEmail = useAppSelector((s) => s.auth.pendingEmail);
  const { isLoading, error, successMessage } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // If no email in state, they shouldn't be here
  useEffect(() => {
    if (!pendingEmail) {
      navigate("/forgot-password");
    }
  }, [pendingEmail, navigate]);

  const validateField = (name, value, currentForm = form) => {
    let errorMsg = "";
    if (name === "otp") {
      if (!value.trim()) errorMsg = "Verification Code (OTP) is required.";
      else if (!/^\d{6}$/.test(value.trim())) errorMsg = "OTP must be exactly 6 digits.";
    } else if (name === "password") {
      if (!value) errorMsg = "New Password is required.";
      else if (value.length < 6) errorMsg = "Password must be at least 6 characters.";
    } else if (name === "confirmPassword") {
      if (!value) errorMsg = "Confirm Password is required.";
      else if (value !== currentForm.password) errorMsg = "Passwords do not match.";
    }
    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      const fieldError = validateField(name, value, newForm);
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (fieldError) newErrors[name] = fieldError;
        else delete newErrors[name];
        
        // Re-validate confirmPassword if password changes
        if (name === "password" && newForm.confirmPassword) {
            const confirmError = validateField("confirmPassword", newForm.confirmPassword, newForm);
            if (confirmError) newErrors.confirmPassword = confirmError;
            else delete newErrors.confirmPassword;
        }
        
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
    Object.keys(form).forEach((key) => {
      const errorMsg = validateField(key, form[key], form);
      if (errorMsg) newErrors[key] = errorMsg;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const result = await dispatch(
      resetPassword({
        email: pendingEmail,
        otp: form.otp,
        password: form.password,
      }),
    );

    if (resetPassword.fulfilled.match(result)) {
      setTimeout(() => navigate("/login"), 1500);
    }
  };

  const handleResendOtp = () => {
    if (!pendingEmail) return;
    dispatch(resendOtp({ email: pendingEmail, type: "forgot" }));
  };

  if (!pendingEmail) return null;

  return (
    <div className="w-full max-w-[420px] bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100/80 animate-fade-in text-slate-800 text-xs">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg select-none mb-3 shadow-md bg-gradient-to-tr from-[#0466c8] to-[#0353a4] shadow-[#0466c8]/20">
          M
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Reset Password</h1>
        <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed max-w-[280px]">
          Enter the 6-digit verification code sent to <span className="font-bold text-slate-700">{pendingEmail}</span> and create a new password.
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
          <div className="font-semibold leading-relaxed">{successMessage}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* OTP Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Verification Code (OTP)</label>
          <div className="relative">
            <input
              type="text"
              name="otp"
              value={form.otp}
              onChange={handleChange}
              maxLength="6"
              required
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:border-[#0466c8] focus:ring-[#0466c8]/10 bg-slate-50/50 transition-all text-slate-800 tracking-widest font-mono"
              placeholder="123456"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.Key />
            </div>
          </div>
          {errors.otp && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.otp}</p>}
        </div>

        {/* New Password Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:border-[#0466c8] focus:ring-[#0466c8]/10 bg-slate-50/50 transition-all text-slate-800"
              placeholder="••••••••"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.Lock />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
            </button>
          </div>
          {errors.password && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.password}</p>}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:border-[#0466c8] focus:ring-[#0466c8]/10 bg-slate-50/50 transition-all text-slate-800"
              placeholder="••••••••"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.Lock />
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? <Icons.EyeOff /> : <Icons.Eye />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.confirmPassword}</p>}
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
              <span>Resetting Password...</span>
            </>
          ) : (
            <span>Reset Password</span>
          )}
        </button>
      </form>

      {/* Resend Link */}
      <div className="text-center mt-6 pt-6 border-t border-slate-50 font-semibold text-slate-400">
        Didn't receive the code?{" "}
        <button 
          type="button"
          onClick={handleResendOtp}
          disabled={isLoading} 
          className="text-[#0466c8] hover:underline disabled:opacity-50"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
}
