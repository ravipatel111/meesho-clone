import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { verifyOtp, resendOtp, clearMessages } from "../../../redux/slices/authSlice";

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const KeyIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

export default function VerifyOtp() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, successMessage, pendingEmail, pendingOtp } =
    useAppSelector((s) => s.auth);

  const [form, setForm] = useState({
    email: pendingEmail || "",
    otp: pendingOtp || "",
  });
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = "";
    if (name === "email") {
      if (!value.trim()) error = "Email Address is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) error = "Enter a valid email address.";
    } else if (name === "otp") {
      if (!value.trim()) error = "Verification Code is required.";
      else if (!/^\d{6}$/.test(value.trim())) error = "OTP must be exactly 6 digits.";
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

  // Auto-fill when pendingEmail or pendingOtp arrive in state
  useEffect(() => {
    setForm((prev) => ({
      email: pendingEmail || prev.email,
      otp: pendingOtp || prev.otp,
    }));
  }, [pendingEmail, pendingOtp]);

  // Navigate to login after successful verification
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => navigate("/login"), 1500);
      return () => clearTimeout(t);
    }
  }, [successMessage, navigate]);

  useEffect(() => { return () => dispatch(clearMessages()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    dispatch(verifyOtp({ email: form.email, otp: form.otp }));
  };

  const handleResendOtp = () => {
    if (!form.email) {
      setErrors({ email: "Please enter your email to resend OTP" });
      return;
    }
    dispatch(resendOtp({ email: form.email, type: "register" }));
  };

  return (
    <div className="w-full max-w-[420px] bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100/80 text-slate-800 text-xs">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg mb-3 shadow-md bg-gradient-to-tr from-[#0466c8] to-[#0353a4]">
          M
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Verify Account</h1>
        <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed max-w-[280px]">
          Enter the 6-digit OTP sent to your email address.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-4 mb-4 text-xs font-semibold">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl p-4 mb-4 text-xs font-semibold">
          ✓ {successMessage} — Redirecting to login...
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:border-[#0466c8] focus:ring-[#0466c8]/10 bg-slate-50/50 transition-all"
              placeholder="you@example.com"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><MailIcon /></div>
          </div>
          {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Verification Code (OTP)</label>
          <div className="relative">
            <input
              type="text"
              name="otp"
              value={form.otp}
              onChange={handleChange}
              required
              maxLength={6}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-base font-extrabold tracking-[0.3em] text-center focus:outline-none focus:ring-4 focus:border-[#0466c8] focus:ring-[#0466c8]/10 bg-slate-50/50 transition-all placeholder:tracking-normal placeholder:font-medium placeholder:text-xs"
              placeholder="••••••"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><KeyIcon /></div>
          </div>
          {errors.otp && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.otp}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-[#0466c8] hover:bg-[#0353a4] text-white rounded-2xl font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Verifying...</span></>
          ) : "Verify OTP"}
        </button>
      </form>

      <div className="text-center mt-6 pt-6 border-t border-slate-50 font-semibold text-slate-400 flex flex-col gap-2">
        <div>
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
        <div>
          <button onClick={() => navigate("/register")} className="text-slate-500 hover:underline text-[10px]">
            Back to Register
          </button>
        </div>
      </div>
    </div>
  );
}
