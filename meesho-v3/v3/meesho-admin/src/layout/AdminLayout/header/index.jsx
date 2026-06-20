import { useState, useRef, useEffect } from "react";
import { resolveOrPlaceholder } from "../../../utils/imageUrl";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, logout } from "../../../redux/slices/authSlice";

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

function Dropdown({ trigger, children, width = "w-72" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((p) => !p)}>{trigger}</div>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className={`absolute top-full mt-2 ${width} right-0 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-lg z-50`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function NavBtn({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}

// TODO: Replace with a real API call, e.g.:
// const notifications = useSelector((s) => s.admin.notifications) || [];
// and dispatch(fetchNotifications()) in a useEffect.
const notifications = [];

const SunIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// Profile image resolution is handled by resolveOrPlaceholder from imageUrl utils
const getProfileImageUrl = (img) => resolveOrPlaceholder(img);

const Header = ({ onToggleSidebar, isDarkMode, onToggleDarkMode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth?.user);
  const wishlistProducts = useSelector((s) => s.wishlist?.products) || [];
  const wishlistCount = wishlistProducts.length;

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      dispatch(logout());
    }
    navigate("/login");
  };

  const dashboardPath = user?.role === "admin" ? "/dashboard" : "/home";

  const cartItems = useSelector((s) => s.cart?.items) || [];
  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <header className="fixed top-0 left-0 right-0 h-[70px] px-6 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between gap-4 z-[11] shadow-sm transition-colors duration-300">
      {/* Left — toggle + logo */}
      <div className="flex items-center gap-3 shrink-0">
        <NavBtn onClick={onToggleSidebar}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
          </svg>
        </NavBtn>
        <button
          onClick={() => navigate(dashboardPath)}
          className="flex items-center gap-2 cursor-pointer animate-fade-in"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm select-none">
            M
          </div>
          <span className="text-[20px] font-bold text-gray-900 dark:text-slate-100 hidden sm:block tracking-tight">
            Meesho
          </span>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-0.5 shrink-0">
        {/* Dark Mode Switcher (Visible to All Users) */}
        <NavBtn
          onClick={onToggleDarkMode}
          className="mr-1.5"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </NavBtn>

        {/* Wishlist */}
        {user?.role !== "admin" && (
          <NavBtn
            onClick={() => navigate("/wishlist")}
            className="relative mr-1.5"
            title="My Wishlist"
          >
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none z-10">
                {wishlistCount}
              </span>
            )}
            <svg
              width={22}
              height={22}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500 hover:text-rose-500 transition-colors"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </NavBtn>
        )}

        {/* Cart */}
        {user?.role !== "admin" && (
          <NavBtn
            onClick={() => navigate("/home")}
            className="relative mr-1.5"
          >
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#0466c8] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none z-10">
                {cartCount}
              </span>
            )}
            <svg
              width={22}
              height={22}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500 hover:text-gray-800"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </NavBtn>
        )}

        {/* Notifications */}
        <Dropdown
          width="w-80"
          trigger={
            <NavBtn className="relative">
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {notifications.length}
                </span>
              )}
              <svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </NavBtn>
          }
        >
          <div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
              <span className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                Notifications
              </span>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 px-2 py-0.5 rounded-full">
                {notifications.length} New
              </span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 && (
                <div className="py-10 text-center text-sm text-gray-400 dark:text-slate-500">
                  No new notifications
                </div>
              )}
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${n.color}`}
                  >
                    {n.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                      {n.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                      {n.msg}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                      {n.time}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 dark:border-slate-800">
              <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
                View All Notifications
              </button>
            </div>
          </div>
        </Dropdown>

        {/* User */}
        <Dropdown
          width="w-52"
          trigger={
            <button className="flex items-center gap-2 ml-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-slate-700 transition-all font-bold text-xs cursor-pointer select-none">
              <span>Admin Panel</span>
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-indigo-650 dark:text-indigo-400"
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>
          }
        >
          <div>
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
                Admin Panel
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Administrator
              </p>
            </div>

            {/* Menu */}
            <div className="py-1.5">
              {user?.role === "admin" ? (
                <>
                  <button
                    onClick={() => navigate("/admin")}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-gray-400 dark:text-slate-500"
                    >
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                    </svg>
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate("/payments")}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-gray-400 dark:text-slate-500"
                    >
                      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                    </svg>
                    Payments
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/home")}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-gray-400"
                    >
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                    Shop Catalog
                  </button>
                  <button
                    onClick={() => navigate("/order-history")}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-gray-400"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
                    </svg>
                    My Orders
                  </button>
                  <button
                    onClick={() => navigate("/wishlist")}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-gray-400"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    My Wishlist
                  </button>
                  <button
                    onClick={() => navigate("/settings")}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-gray-400"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    Profile Settings
                  </button>
                  <button
                    onClick={() => navigate("/user-payments")}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-gray-400"
                    >
                      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                    </svg>
                    My Payments
                  </button>
                </>
              )}
              <button
                onClick={() => navigate("/change-password")}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-gray-400 dark:text-slate-500"
                >
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
                Change Password
              </button>
            </div>

            <div className="border-t border-gray-100 dark:border-slate-800 p-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
