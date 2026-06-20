import { resolveOrPlaceholder } from '../../../../utils/imageUrl';
import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { changePassword } from "../../../../redux/slices/authSlice";
import { updateProfile, deleteUserAddress } from "../../../../redux/slices/userSlice";

const Icons = {
  Plus: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  User: () => (
    <svg className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Camera: () => (
    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-4.5 h-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Key: () => (
    <svg className="w-4.5 h-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-2 4a5 5 0 110-10 5 5 0 010 10zM19 9h3m-3 3h3m-7.3 1L11 17H9v2H7v2H4a2 2 0 01-2-2v-3a2 2 0 01.59-1.4l5.3-5.3" />
    </svg>
  )
};

const getProfileImageUrl = (img) => resolveOrPlaceholder(img);

export default function ProfileSettings({ onAddAddressClick, showToastMsg }) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef(null);
  
  const { profile, addresses, isLoading } = useAppSelector((s) => s.user);
  const { user, isLoading: authLoading } = useAppSelector((s) => s.auth);

  const [profileForm, setProfileForm] = useState({ name: "", mobile: "" });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const validateProfileField = (name, value) => {
    let error = "";
    if (name === "name" && !value.trim()) error = "Display Name is required.";
    else if (name === "mobile" && value.trim() && !/^\d{10}$/.test(value.trim())) error = "Mobile must be 10 digits.";
    return error;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => {
      const newForm = { ...prev, [name]: value };
      const fieldError = validateProfileField(name, value);
      setProfileErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (fieldError) newErrors[name] = fieldError;
        else delete newErrors[name];
        return newErrors;
      });
      return newForm;
    });
  };

  const validatePasswordField = (name, value, currentForm = passwordForm) => {
    let error = "";
    if (name === "oldPassword" && !value) error = "Current Password is required.";
    else if (name === "newPassword") {
      if (!value) error = "New Password is required.";
      else if (value.length < 6) error = "Password must be at least 6 characters.";
    } else if (name === "confirmPassword") {
      if (!value) error = "Confirm Password is required.";
      else if (value !== currentForm.newPassword) error = "Passwords do not match.";
    }
    return error;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => {
      const newForm = { ...prev, [name]: value };
      const fieldError = validatePasswordField(name, value, newForm);
      setPasswordErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (fieldError) newErrors[name] = fieldError;
        else delete newErrors[name];

        if (name === "newPassword" && newForm.confirmPassword) {
          const confirmError = validatePasswordField("confirmPassword", newForm.confirmPassword, newForm);
          if (confirmError) newErrors.confirmPassword = confirmError;
          else delete newErrors.confirmPassword;
        }
        return newErrors;
      });
      return newForm;
    });
  };

  // Sync profile details into state
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.username || profile.name || user?.name || "",
        mobile: profile.mobile || profile.phone || "",
      });
      // Clear local preview if synced with new profile
      setImagePreview(null);
      setProfileImageFile(null);
    }
  }, [profile, user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    const isNameChanged = profileForm.name !== (profile?.username || profile?.name || user?.name || "");
    const isMobileChanged = profileForm.mobile !== (profile?.mobile || profile?.phone || "");
    const isImageChanged = profileImageFile !== null;

    const newErrors = {};
    Object.keys(profileForm).forEach((key) => {
      const error = validateProfileField(key, profileForm[key]);
      if (error) newErrors[key] = error;
    });
    setProfileErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!isNameChanged && !isMobileChanged && !isImageChanged) {
      showToastMsg("No changes detected.", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", profileForm.name);
      formData.append("name", profileForm.name);
      formData.append("mobile", profileForm.mobile);
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }
      
      await dispatch(updateProfile(formData)).unwrap();
      showToastMsg("Profile updated successfully!", "success");
      setProfileImageFile(null);
    } catch (err) {
      showToastMsg(err || "Failed to update profile", "error");
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(passwordForm).forEach((key) => {
      const error = validatePasswordField(key, passwordForm[key], passwordForm);
      if (error) newErrors[key] = error;
    });
    setPasswordErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await dispatch(
        changePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      ).unwrap();
      showToastMsg("Password updated successfully!", "success");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      showToastMsg(err || "Failed to update password", "error");
    }
  };

  const userDisplayName = profile?.username || profile?.name || user?.name || "User";
  const userEmail = profile?.email || user?.email || "";
  const userRole = profile?.role || user?.role || "user";
  const userInitial = userDisplayName.charAt(0).toUpperCase();
  const apiAvatar = getProfileImageUrl(profile?.profileImage || user?.profileImage);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-slate-200">
      
      {/* ─── Hero Profile Card Banner ─── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#9F2089] via-[#b02a98] to-purple-700 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl shadow-pink-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Avatar Upload Container */}
        <div className="relative group shrink-0 select-none">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/50 shadow-xl flex items-center justify-center bg-gradient-to-tr from-pink-200 to-purple-200 transition-all group-hover:border-white">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview Avatar" className="w-full h-full object-cover" />
            ) : apiAvatar ? (
              <img src={apiAvatar} alt="Profile Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-500 dark:text-slate-400 font-black text-3xl">
                {userInitial}
              </span>
            )}
          </div>
          <button 
            type="button"
            onClick={triggerFileInput}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200 rounded-full"
            title="Upload profile photo"
          >
            <Icons.Camera />
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*" 
            onChange={handleImageChange} 
            className="hidden" 
          />
        </div>

        {/* User Badges & Details */}
        <div className="flex-1 text-center sm:text-left z-10">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
            {userDisplayName}
            {userRole === "admin" && (
              <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-sm bg-white/20 text-white border border-white/30">
                Staff
              </span>
            )}
          </h2>
          <p className="text-xs text-pink-200 font-bold mb-3 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
            <span className="opacity-70"><Icons.Mail /></span> {userEmail}
          </p>
          
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-white/20 text-white border border-white/30">
              {userRole === "admin" ? "Administrator" : "Store Reseller"}
            </span>
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
              ✓ Verified Account
            </span>
            {profile?.createdAt && (
              <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-white/10 text-pink-100 border border-white/20">
                Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Personal Information Form ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 lg:p-8 shadow-xs">
        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 pb-4 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
          <Icons.User /> Personal Information
        </h3>
        <form
          onSubmit={handleUpdateProfile}
          noValidate
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs"
        >
          {/* Display Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-600 dark:text-slate-400">Display Name</label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                required
                className="w-full pl-9.5 pr-3.5 py-2.5 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-[#9F2089] dark:focus:border-pink-500 focus:ring-4 focus:ring-[#9F2089]/10 dark:focus:ring-pink-500/10 bg-slate-50 dark:bg-slate-950 transition-all font-semibold text-slate-800 dark:text-slate-200"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icons.User />
              </div>
            </div>
            {profileErrors.name && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1">{profileErrors.name}</p>}
          </div>

          {/* Mobile Number */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-600 dark:text-slate-400">Mobile Number</label>
            <div className="relative">
              <input
                type="tel"
                name="mobile"
                value={profileForm.mobile}
                onChange={handleProfileChange}
                className="w-full pl-9.5 pr-3.5 py-2.5 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-[#9F2089] dark:focus:border-pink-500 focus:ring-4 focus:ring-[#9F2089]/10 dark:focus:ring-pink-500/10 bg-slate-50 dark:bg-slate-950 transition-all font-semibold text-slate-800 dark:text-slate-200"
                placeholder="Enter 10-digit number"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icons.Phone />
              </div>
            </div>
            {profileErrors.mobile && <p className="text-rose-500 text-[10px] font-bold mt-0.5 ml-1">{profileErrors.mobile}</p>}
          </div>

          {/* Email Address (Read-only) */}
          <div className="flex flex-col gap-1.5 opacity-80">
            <label className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              Email Address <span className="text-[10px] font-normal text-slate-400">(Immutable)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={userEmail}
                readOnly
                disabled
                className="w-full pl-9.5 pr-10 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-100 dark:bg-slate-950/60 text-slate-450 dark:text-slate-500 cursor-not-allowed font-semibold transition-all"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icons.Mail />
              </div>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600">
                <Icons.Lock />
              </div>
            </div>
          </div>

          {/* Role (Read-only) */}
          <div className="flex flex-col gap-1.5 opacity-80">
            <label className="font-bold text-slate-500 dark:text-slate-400">Account Classification</label>
            <div className="relative">
              <input
                type="text"
                value={userRole === "admin" ? "Administrator Staff" : "Standard Reseller / customer"}
                readOnly
                disabled
                className="w-full pl-9.5 pr-10 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl bg-slate-100 dark:bg-slate-950/60 text-slate-450 dark:text-slate-500 cursor-not-allowed font-semibold transition-all capitalize"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icons.Shield />
              </div>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600">
                <Icons.Lock />
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 flex justify-end mt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#9F2089] hover:bg-[#821a70] text-white rounded-xl font-bold transition-all active:scale-97 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Details...</span>
                </>
              ) : (
                <span>Save Details</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ─── Address Management Section ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 lg:p-8 shadow-xs">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-850">
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <Icons.MapPin /> Saved Addresses
          </h3>
          <button
            onClick={onAddAddressClick}
            className="px-4 py-1.5 bg-[#9F2089]/5 hover:bg-[#9F2089]/10 dark:bg-pink-950/20 dark:hover:bg-pink-950/40 text-[#9F2089] dark:text-pink-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Icons.Plus /> Add Address
          </button>
        </div>

        {(!addresses || addresses.length === 0) ? (
          <p className="text-slate-400 dark:text-slate-500 text-xs text-center py-8">
            No saved addresses. Add a new address to enable checkout shipping.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="border border-slate-100 dark:border-slate-850 rounded-2xl p-4.5 flex flex-col justify-between gap-4 bg-white dark:bg-slate-900 relative hover:border-slate-250 dark:hover:border-slate-750 transition-all shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-800 dark:text-white text-xs">
                      {addr.fullName}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold text-[9px] px-2 py-0.5 rounded-sm capitalize">
                      {addr.addressType}
                    </span>
                    {addr.isDefault && (
                      <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/30 font-extrabold text-[9px] px-2 py-0.5 rounded-sm">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-550 dark:text-slate-450 leading-relaxed font-semibold">
                    {addr.addressLine}
                  </p>
                  {addr.landmark && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-550">
                      Landmark: {addr.landmark}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-550 dark:text-slate-450 font-semibold mt-0.5">
                    {addr.city}, {addr.state} -{" "}
                    <strong className="text-slate-705 dark:text-white">
                      {addr.pincode}
                    </strong>
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold mt-2.5">
                    Ph: {addr.mobile}
                  </p>
                </div>

                <div className="flex justify-end gap-3.5 border-t border-slate-50 dark:border-slate-850 pt-3 mt-1 text-[11px]">
                  <button
                    onClick={() => dispatch(deleteUserAddress(addr._id))}
                    className="text-rose-600 dark:text-rose-450 hover:underline font-bold cursor-pointer"
                  >
                    Remove Address
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
