import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  registerUser,
  clearMessages,
  setPendingEmail,
} from "../../../redux/slices/authSlice";

// Custom inline SVG icons for registration page
const Icons = {
  User: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Mail: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Phone: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
  ),
  Camera: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
};

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, successMessage } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
    confirmpassword: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (successMessage) {
      dispatch(setPendingEmail(form.email));
      setTimeout(() => navigate("/verify-otp"), 1200);
    }
  }, [successMessage, navigate, dispatch, form.email]);

  useEffect(() => {
    return () => dispatch(clearMessages());
  }, [dispatch]);

  const validateField = (name, value, currentForm) => {
    let error = "";
    if (name === "username") {
      if (!value.trim()) error = "Full Name is required.";
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) error = "Email Address is required.";
      else if (!emailRegex.test(value)) error = "Please enter a valid email address.";
    } else if (name === "mobile") {
      if (!value.trim()) error = "Mobile Number is required.";
      else if (!/^\d{10}$/.test(value.trim())) error = "Please enter a valid 10-digit mobile number.";
    } else if (name === "password") {
      if (!value) error = "Password is required.";
      else if (value.length < 6) error = "Password must be at least 6 characters long.";
    } else if (name === "confirmpassword") {
      if (!value) error = "Confirm Password is required.";
      else if (value !== currentForm.password) error = "Passwords do not match.";
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
        if (fieldError) {
          newErrors[name] = fieldError;
        } else {
          delete newErrors[name];
        }

        if (name === "password" && newForm.confirmpassword) {
          if (value !== newForm.confirmpassword) {
            newErrors.confirmpassword = "Passwords do not match.";
          } else {
            delete newErrors.confirmpassword;
          }
        }
        return newErrors;
      });

      return newForm;
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Field-level validation for all fields on submit
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key], form);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    
    // If there are errors, stop submission
    if (Object.keys(newErrors).length > 0) return;

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      formData.append(k, v);
    });
    if (profileImage) formData.append("profileImage", profileImage);
    
    dispatch(registerUser(formData)).then((result) => {
      if (registerUser.fulfilled.match(result)) {
      } else {
        console.error("Registration API Error Response:", result.payload);
      }
    });
  };

  return (
    <div className="w-full max-w-[450px] bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100/80 animate-fade-in my-8 text-slate-800">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg select-none mb-3 shadow-md bg-gradient-to-tr from-[#0466c8] to-[#0353a4] shadow-[#0466c8]/20">
          M
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Create Account</h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Join the reseller community and start shopping at wholesale prices
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
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl p-4 mb-5 flex items-start gap-3 text-xs animate-fade-in">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
          <div className="font-semibold leading-relaxed">{successMessage} redirecting to code verification...</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Profile Image Uploader */}
        <div className="flex flex-col items-center mb-2">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center text-3xl shadow-inner select-none transition-all group-hover:border-[#0466c8]">
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-300">👤</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-[#0466c8] hover:bg-[#0353a4] text-white rounded-full cursor-pointer shadow-md transition-all active:scale-90 flex items-center justify-center">
              <Icons.Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-2">Upload Profile Photo (Optional)</span>
        </div>

        {/* Name Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
          <div className="relative">
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:border-[#0466c8] focus:ring-[#0466c8]/10 bg-slate-50/50 transition-all text-slate-800"
              placeholder="e.g. Rahul Sharma"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.User />
            </div>
          </div>
          {errors.username && <p className="text-rose-500 text-[10px] font-bold mt-1.5 ml-1 animate-fade-in">{errors.username}</p>}
        </div>

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
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:border-[#0466c8] focus:ring-[#0466c8]/10 bg-slate-50/50 transition-all text-slate-800"
              placeholder="you@example.com"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.Mail />
            </div>
          </div>
          {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-1.5 ml-1 animate-fade-in">{errors.email}</p>}
        </div>

        {/* Mobile Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number</label>
          <div className="relative">
            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:border-[#0466c8] focus:ring-[#0466c8]/10 bg-slate-50/50 transition-all text-slate-800"
              placeholder="10-digit number"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.Phone />
            </div>
          </div>
          {errors.mobile && <p className="text-rose-500 text-[10px] font-bold mt-1.5 ml-1 animate-fade-in">{errors.mobile}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
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
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
            </button>
          </div>
          {errors.password && <p className="text-rose-500 text-[10px] font-bold mt-1.5 ml-1 animate-fade-in">{errors.password}</p>}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmpassword"
              value={form.confirmpassword}
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? <Icons.EyeOff /> : <Icons.Eye />}
            </button>
          </div>
          {errors.confirmpassword && <p className="text-rose-500 text-[10px] font-bold mt-1.5 ml-1 animate-fade-in">{errors.confirmpassword}</p>}
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
              <span>Registering account...</span>
            </>
          ) : (
            <span>Create Free Account</span>
          )}
        </button>
      </form>

      {/* Redirect Footer */}
      <div className="text-center mt-6 pt-6 border-t border-slate-50 text-xs text-slate-400 font-medium">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-[#0466c8] hover:underline">
          Log In
        </Link>
      </div>
    </div>
  );
}
