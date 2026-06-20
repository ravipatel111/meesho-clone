import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { changePassword, clearMessages } from '../../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

// Custom inline SVG icons for change password page
const Icons = {
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

export default function ChangePassword() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, successMessage } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const validateField = (name, value, currentForm = form) => {
    let error = "";
    if (name === "oldPassword") {
      if (!value) error = "Current Password is required.";
    } else if (name === "newPassword") {
      if (!value) error = "New Password is required.";
      else if (value.length < 6) error = "Password must be at least 6 characters.";
    } else if (name === "confirmPassword") {
      if (!value) error = "Confirm Password is required.";
      else if (value !== currentForm.newPassword) error = "Passwords do not match.";
    }
    return error;
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

        // Re-validate confirmPassword if newPassword changes
        if (name === "newPassword" && newForm.confirmPassword) {
          const confirmError = validateField("confirmPassword", newForm.confirmPassword, newForm);
          if (confirmError) newErrors.confirmPassword = confirmError;
          else delete newErrors.confirmPassword;
        }

        return newErrors;
      });
      return newForm;
    });
  };

  useEffect(() => { return () => dispatch(clearMessages()); }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key], form);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    dispatch(changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-800 text-xs">
      <div className="w-full max-w-[420px] bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100/80 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg select-none mb-3 shadow-md bg-gradient-to-tr from-[#0466c8] to-[#0353a4] shadow-[#0466c8]/20">
            M
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Change Password</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Choose a strong password to protect your reseller portal access
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

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Current Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:border-[#0466c8] focus:ring-[#0466c8]/10 bg-slate-50/50 transition-all text-slate-800"
                placeholder="••••••••"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Icons.Lock />
              </div>
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showOld ? <Icons.EyeOff /> : <Icons.Eye />}
              </button>
            </div>
            {errors.oldPassword && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.oldPassword}</p>}
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:border-[#0466c8] focus:ring-[#0466c8]/10 bg-slate-50/50 transition-all text-slate-800"
                placeholder="••••••••"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Icons.Lock />
              </div>
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNew ? <Icons.EyeOff /> : <Icons.Eye />}
              </button>
            </div>
            {errors.newPassword && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.newPassword}</p>}
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:border-[#0466c8] focus:ring-[#0466c8]/10 bg-slate-50/50 transition-all text-slate-800"
                placeholder="••••••••"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Icons.Lock />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirm ? <Icons.EyeOff /> : <Icons.Eye />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1 animate-fade-in">{errors.confirmPassword}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-xs transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-[#0466c8] hover:bg-[#0353a4] text-white rounded-2xl font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}