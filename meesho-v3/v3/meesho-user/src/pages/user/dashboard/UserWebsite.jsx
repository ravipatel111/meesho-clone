import { resolveOrPlaceholder, firstOrPlaceholder } from '../../../utils/imageUrl';
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  useSearchParams,
  useNavigate,
  useOutletContext,
  useParams,
  useLocation,
} from "react-router-dom";
import { logoutUser, logout } from "../../../redux/slices/authSlice";

// Slice Actions
import {
  fetchProfile,
  fetchMyOrders,
  fetchAddresses,
  clearUserMessages,
  deleteProfile,
} from "../../../redux/slices/userSlice";
import {
  fetchUserProducts,
  fetchUserProductsByCategory,
  fetchUserProductById,
} from "../../../redux/slices/productSlice";
import {
  fetchCategories,
  fetchSubCategories,
} from "../../../redux/slices/categorySlice";
import { fetchCart, clearCartMessages } from "../../../redux/slices/cartSlice";
import {
  fetchWishlist,
  clearWishlistMessages,
} from "../../../redux/slices/wishlistSlice";

// Component Chunks
import ShopCatalog from "./components/ShopCatalog";
import OrdersHistory from "./components/OrdersHistory";
import Wishlist from "./components/Wishlist";
import ProfileSettings from "./components/ProfileSettings";
import UserPayments from "./components/UserPayments";
import CartPanel from "./components/CartPanel";
import CheckoutFlow from "./components/CheckoutFlow";
import AddressModal from "./components/AddressModal";
import ProductDetail from "./components/ProductDetail";
import Footer from "./components/Footer";

// SVG Icons for Header & Navigation
const NavIcons = {
  Shop: () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ),
  Wishlist: () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  Orders: () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
    </svg>
  ),
  Payments: () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  ),
  Settings: () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  ),
  Sun: () => (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
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
  ),
  Moon: () => (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Cart: () => (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  ProfileIcon: () => (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Logout: () => (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
};

const getProfileImageUrl = (img) => resolveOrPlaceholder(img);

export default function UserWebsite() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Retrieve dark mode context from CommonLayout outlet context
  const { isDarkMode, onToggleDarkMode } = useOutletContext();

  // ─── Redux State Selectors ─────────────────────────────────────────────────
  const userError = useAppSelector((s) => s.user.error);
  const userSuccess = useAppSelector((s) => s.user.successMessage);
  const profile = useAppSelector((s) => s.user.profile);

  const cartError = useAppSelector((s) => s.cart.error);
  const cartSuccess = useAppSelector((s) => s.cart.successMessage);
  const cartItems = useAppSelector((s) => s.cart?.items) || [];

  const wishlistError = useAppSelector((s) => s.wishlist.error);
  const wishlistSuccess = useAppSelector((s) => s.wishlist.successMessage);
  const wishlistProducts = useAppSelector((s) => s.wishlist?.products) || [];
  const wishlistCount = wishlistProducts.length;
  const { categories, subCategories } = useAppSelector((s) => s.category);

  const user = useAppSelector((s) => s.auth.user);
  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // ─── Uplifted Filter & Search States ───────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");

  // ─── Component View States ──────────────────────────────────────────────────
  const [searchParams] = useSearchParams();
  // Open cart panel when navbar cart icon is clicked
  useEffect(() => {
    if (location.state?.openCart) {
      setShowCartPanel(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  const getActiveTab = () => {
    const p = location.pathname;
    if (p === "/order-history") return "orders";
    if (p === "/wishlist") return "wishlist";
    if (p === "/settings") return "settings";
    if (p === "/payments") return "payments";
    return "shop";
  };
  const activeTab = getActiveTab();
  const setActiveTab = (newTab) => {
    if (newTab === "orders") navigate("/order-history");
    else if (newTab === "wishlist") navigate("/wishlist");
    else if (newTab === "settings") navigate("/settings");
    else if (newTab === "payments") navigate("/payments");
    else navigate("/home");
  };

  // ─── Routing Details ────────────────────────────────────────────────────────
  const { productId } = useParams();
  const isCheckoutPage = location.pathname.endsWith("/checkout");

  const { products, currentProduct } = useAppSelector((s) => s.product);
  const selectedProduct =
    (products || []).find((p) => p._id === productId) || currentProduct;

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [showCartPanel, setShowCartPanel] = useState(false);

  // Toast System
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // ─── Lifecycle hooks ───────────────────────────────────────────────────────
  useEffect(() => {
    const isDataLoaded =
      profile &&
      (profile._id === user?._id || profile.email === user?.email) &&
      categories.length > 0 &&
      products.length > 0;

    if (!isDataLoaded) {
      dispatch(fetchProfile());
      dispatch(fetchMyOrders());
      dispatch(fetchUserProducts());
      dispatch(fetchCategories());
      dispatch(fetchSubCategories()); // Load subcategories dynamically
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      dispatch(fetchAddresses());
    }
  }, [dispatch, profile, user, categories.length, products.length]);

  // Fetch product detail on mount/route change
  useEffect(() => {
    if (productId) {
      dispatch(fetchUserProductById(productId));
    }
  }, [productId, dispatch]);

  // Scroll to top on route, tab, or product navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, activeTab, productId]);

  // Toast Alert Triggers
  const showToastMsg = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  useEffect(() => {
    if (userSuccess) {
      showToastMsg(userSuccess, "success");
      dispatch(clearUserMessages());
    }
    if (userError) {
      const errorMsg = typeof userError === 'object' && userError !== null
        ? (userError.errors && Array.isArray(userError.errors) ? userError.errors.join(', ') : (userError.message || 'Failed to perform action'))
        : userError;
      showToastMsg(errorMsg, "error");
      dispatch(clearUserMessages());
    }
    if (cartSuccess) {
      showToastMsg(cartSuccess, "success");
      dispatch(clearCartMessages());
      dispatch(fetchCart());
    }
    if (cartError) {
      showToastMsg(cartError, "error");
      dispatch(clearCartMessages());
    }
    if (wishlistSuccess) {
      showToastMsg(wishlistSuccess, "success");
      dispatch(clearWishlistMessages());
      dispatch(fetchWishlist());
    }
    if (wishlistError) {
      showToastMsg(wishlistError, "error");
      dispatch(clearWishlistMessages());
    }
  }, [
    userSuccess,
    userError,
    cartSuccess,
    cartError,
    wishlistSuccess,
    wishlistError,
    dispatch,
  ]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      dispatch(logout());
    }
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your Meesho account? This action is irreversible.",
    );
    if (confirmed) {
      try {
        await dispatch(deleteProfile()).unwrap();
        dispatch(logout());
        navigate("/login");
        alert("Your account has been deleted successfully.");
      } catch (err) {
        alert(err || "Failed to delete account. Please try again.");
      }
    }
  };

  const scrollToCatalog = () => {
    setTimeout(() => {
      const el = document.getElementById("products-for-you");
      if (el) {
        const headerOffset = 160; // Offset for the fixed header
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 150);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    setActiveTab("shop");
    if (productId || location.pathname !== "/home") {
      navigate("/home");
    }
    scrollToCatalog();
  };

  // Click actions for Category/Subcategory filters
  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubCategory("all");
    dispatch(fetchUserProductsByCategory(catId));
    setActiveTab("shop");
    if (productId || location.pathname !== "/home") {
      navigate("/home");
    }
    scrollToCatalog();
  };

  const handleSubCategoryClick = (catId, subCatId) => {
    setSelectedCategory(catId);
    setSelectedSubCategory(subCatId);
    dispatch(fetchUserProductsByCategory(catId));
    setActiveTab("shop");
    if (productId || location.pathname !== "/home") {
      navigate("/home");
    }
    scrollToCatalog();
  };

  const handleLogoClick = () => {
    setSelectedCategory("all");
    setSelectedSubCategory("all");
    setSearchQuery("");
    dispatch(fetchUserProducts());
    setActiveTab("shop");
    if (productId || location.pathname !== "/home") {
      navigate("/home");
    }
    window.scrollTo(0, 0);
  };

  const handleProductClick = (prod) => {
    const id = prod?._id || prod;
    navigate(`/product/${id}`);
  };

  // Fallback Mock Subcategories if database list is empty
  const getSubcategories = (cat) => {
    const fromState = subCategories.filter(
      (sub) => (sub.category?._id || sub.category) === cat._id,
    );
    if (fromState.length > 0) return fromState;

    const name = cat.name.toLowerCase();
    if (
      name.includes("ethnic") ||
      name.includes("saree") ||
      name.includes("kurti") ||
      name.includes("wear")
    ) {
      return [
        { _id: "mock-1", name: "Anarkali Suits", category: cat._id },
        { _id: "mock-2", name: "Georgette Sarees", category: cat._id },
        { _id: "mock-3", name: "Designer Kurtis", category: cat._id },
        { _id: "mock-4", name: "Lehengas", category: cat._id },
      ];
    } else if (name.includes("men")) {
      return [
        { _id: "mock-5", name: "T-Shirts", category: cat._id },
        { _id: "mock-6", name: "Jeans", category: cat._id },
        { _id: "mock-7", name: "Ethnic Wear", category: cat._id },
        { _id: "mock-8", name: "Shirts", category: cat._id },
      ];
    } else if (name.includes("electronics") || name.includes("appliances")) {
      return [
        { _id: "mock-9", name: "Smartphones", category: cat._id },
        { _id: "mock-10", name: "Earphones", category: cat._id },
        { _id: "mock-11", name: "Smartwatches", category: cat._id },
      ];
    } else if (name.includes("home") || name.includes("kitchen")) {
      return [
        { _id: "mock-12", name: "Bedsheets", category: cat._id },
        { _id: "mock-13", name: "Cookware", category: cat._id },
        { _id: "mock-14", name: "Decor Items", category: cat._id },
      ];
    } else {
      return [
        { _id: `mock-${cat._id}-1`, name: "New Arrivals", category: cat._id },
        { _id: `mock-${cat._id}-2`, name: "Best Sellers", category: cat._id },
        { _id: `mock-${cat._id}-3`, name: "Trending Now", category: cat._id },
      ];
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-55 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 md:pb-0 transition-colors duration-300 w-full max-w-full overflow-hidden">
      {/* Toast Banner */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-[60] flex items-center gap-2.5 px-4.5 py-3 rounded-xl shadow-lg border animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/90 border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/90 border-rose-100 dark:border-rose-800 text-rose-800 dark:text-rose-300"
          }`}
        >
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {!isCheckoutPage && (
        <>
          {/* ─── TWO-ROW MEESHO HEADER ─── */}
          <header className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex flex-col z-45 transition-colors duration-300 shadow-xs">
            {/* Row 1: Logo, Search, Supplier Links, Actions */}
            <div className="flex items-center justify-between px-3 sm:px-8 py-3.5 gap-2 sm:gap-4">
              {/* Logo */}
              <div
                onClick={handleLogoClick}
                className="flex items-center cursor-pointer select-none"
              >
                <span className="text-2xl font-black tracking-tighter text-[#9F2089] dark:text-pink-500 font-sans">
                  meesho
                </span>
              </div>

              {/* Long Search Bar */}
              <div className="flex-1 max-w-xl mx-4 hidden sm:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Try Saree, Kurti or Search by Product Code"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setActiveTab("shop");
                      handleSearchSubmit();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearchSubmit();
                    }}
                    className="w-full pl-11 pr-10 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#9F2089] dark:focus:border-pink-500 transition-all text-slate-805 dark:text-slate-100 shadow-2xs"
                  />
                  <button
                    onClick={handleSearchSubmit}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-[#9F2089] dark:hover:text-pink-400 transition-colors cursor-pointer"
                    aria-label="Search"
                  >
                    <svg
                      className="w-4.5 h-4.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Supplier Links & Actions */}
              <div className="flex items-center gap-1.5 sm:gap-4.5 shrink-0">
                {/* Links */}
                <div className="hidden lg:flex items-center gap-4 text-[13px] font-semibold text-slate-650 dark:text-slate-350">
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
                  <a
                    href="#"
                    className="hover:text-[#9F2089] dark:hover:text-pink-400 transition-colors"
                  >
                    Investor Relations
                  </a>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
                </div>

                {/* Dark Mode Switcher */}
                <button
                  onClick={onToggleDarkMode}
                  className="p-2.5 rounded-xl text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title={
                    isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  {isDarkMode ? <NavIcons.Sun /> : <NavIcons.Moon />}
                </button>

                {/* Hover Profile Menu */}
                <div className="group relative">
                  <button className="flex flex-col items-center gap-0.5 px-3 py-1 text-slate-600 dark:text-slate-400 hover:text-[#9F2089] dark:hover:text-pink-400 transition-colors cursor-pointer select-none">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                      {getProfileImageUrl(
                        profile?.profileImage || user?.profileImage,
                      ) ? (
                        <img
                          src={getProfileImageUrl(
                            profile?.profileImage || user?.profileImage,
                          )}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <NavIcons.ProfileIcon />
                      )}
                    </div>
                    <span className="text-[10px] font-bold">Profile</span>
                  </button>

                  {/* Profile Dropdown Panel */}
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-4.5 z-50 text-xs text-slate-750 dark:text-slate-350 transition-all opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 duration-200 flex flex-col gap-3 font-sans select-none">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-800">
                        {getProfileImageUrl(
                          profile?.profileImage || user?.profileImage,
                        ) ? (
                          <img
                            src={getProfileImageUrl(
                              profile?.profileImage || user?.profileImage,
                            )}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[#9F2089] dark:text-pink-400 font-bold text-sm">
                            {(profile?.username ||
                              profile?.name ||
                              user?.name ||
                              "U")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <h4 className="text-xs font-black text-slate-850 dark:text-white leading-tight truncate">
                          {profile?.username ||
                            profile?.name ||
                            user?.name ||
                            "Hello User"}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate">
                          {profile?.email ||
                            user?.email ||
                            "To access your Meesho account"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full bg-[#9F2089] hover:bg-[#851b72] text-white rounded-md py-2.5 font-bold text-xs transition-colors cursor-pointer text-center shadow-xs"
                    >
                      Sign Out
                    </button>

                    <hr className="border-slate-100 dark:border-slate-800 my-0.5" />

                    <button
                      onClick={() => {
                        setActiveTab("orders");
                      }}
                      className="w-full flex items-center gap-3 py-1 text-slate-800 dark:text-slate-200 hover:text-[#9F2089] dark:hover:text-pink-400 font-bold text-left transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4 text-slate-705 dark:text-slate-350 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <span>My Orders</span>
                    </button>

                    <hr className="border-slate-100 dark:border-slate-800 my-0.5" />

                    <button
                      onClick={() => {
                        setActiveTab("settings");
                      }}
                      className="w-full flex items-center gap-3 py-1 text-slate-800 dark:text-slate-200 hover:text-[#9F2089] dark:hover:text-pink-400 font-bold text-left transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4 text-slate-705 dark:text-slate-350 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>My Profile</span>
                    </button>

                    <hr className="border-slate-100 dark:border-slate-800 my-0.5" />

                    <button
                      onClick={() => {
                        navigate("/change-password");
                      }}
                      className="w-full flex items-center gap-3 py-1 text-slate-800 dark:text-slate-200 hover:text-[#9F2089] dark:hover:text-pink-400 font-bold text-left transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4 text-slate-705 dark:text-slate-350 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 7a2 2 0 012 2m-2 4a5 5 0 110-10 5 5 0 010 10zM19 9h3m-3 3h3m-7.3 1L11 17H9v2H7v2H4a2 2 0 01-2-2v-3a2 2 0 01.59-1.4l5.3-5.3"
                        />
                      </svg>
                      <span>Change Password</span>
                    </button>

                    <hr className="border-slate-100 dark:border-slate-800 my-0.5" />

                    <button
                      onClick={handleDeleteAccount}
                      className="w-full py-1 text-slate-800 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-455 font-bold text-left transition-colors cursor-pointer"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>

                {/* Wishlist Panel trigger */}
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-[#9F2089] dark:hover:text-pink-400 transition-colors cursor-pointer relative select-none"
                >
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-2.5 w-4.5 h-4.5 bg-[#9F2089] dark:bg-pink-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none border border-white dark:border-slate-900">
                      {wishlistCount}
                    </span>
                  )}
                  <NavIcons.Wishlist />
                  <span className="text-[10px] font-bold">Wishlist</span>
                </button>

                {/* Cart Panel trigger */}
                <button
                  onClick={() => navigate("/checkout")}
                  className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-[#9F2089] dark:hover:text-pink-400 transition-colors cursor-pointer relative select-none"
                >
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-2.5 w-4.5 h-4.5 bg-[#9F2089] dark:bg-pink-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none border border-white dark:border-slate-900">
                      {cartCount}
                    </span>
                  )}
                  <NavIcons.Cart />
                  <span className="text-[10px] font-bold">Cart</span>
                </button>
              </div>
            </div>

            {/* Row 2: Categories Lower Header with Subcategory Hover Panel */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-850 shadow-2xs relative hidden md:block">
              <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-350 overflow-visible scrollbar-none whitespace-nowrap gap-4">
                {categories.map((cat) => {
                  const subs = getSubcategories(cat);
                  const isSelected = selectedCategory === cat._id;

                  return (
                    <div
                      key={cat._id}
                      className={`group py-3 px-2.5 border-b-2 border-transparent hover:border-[#9F2089] dark:hover:border-pink-400 hover:text-[#9F2089] dark:hover:text-pink-400 cursor-pointer relative select-none ${
                        isSelected
                          ? "text-[#9F2089] dark:text-pink-400 border-b-2 border-current"
                          : ""
                      }`}
                    >
                      <span
                        onClick={() => handleCategoryClick(cat._id)}
                        className="transition-colors"
                      >
                        {cat.name}
                      </span>

                      {/* Subcategory Hover Dropdown Panel */}
                      {subs.length > 0 && (
                        <div className="absolute top-full left-0 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-b-2xl p-4.5 z-50 text-[11px] font-bold text-slate-650 dark:text-slate-300 transition-all opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 duration-200 flex flex-col gap-2">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-black mb-1.5">
                            Related Subcategories
                          </p>
                          {subs.map((sub) => {
                            const isSubSelected =
                              selectedSubCategory === sub._id;
                            return (
                              <div
                                key={sub._id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubCategoryClick(cat._id, sub._id);
                                }}
                                className={`hover:text-[#9F2089] dark:hover:text-pink-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 py-1.5 rounded-lg transition-colors leading-normal ${
                                  isSubSelected
                                    ? "text-[#9F2089] dark:text-pink-400 bg-slate-50 dark:bg-slate-800/20"
                                    : ""
                                }`}
                              >
                                {sub.name}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile search bar (shows on mobile only, inside header to be fixed together) */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 sm:hidden">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Try Saree, Kurti or Search by Product Code"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveTab("shop");
                    handleSearchSubmit();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit();
                  }}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#9F2089] dark:focus:border-pink-500 transition-all text-slate-805 dark:text-slate-100"
                />
                <button
                  onClick={handleSearchSubmit}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-[#9F2089] dark:hover:text-pink-400 transition-colors cursor-pointer"
                  aria-label="Search"
                >
                  <svg
                    className="w-4.5 h-4.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </header>
        </>
      )}

      {/* ─── MAIN WEB APP PAGE ROUTING CONTAINER ─── */}
      <main
        className={
          isCheckoutPage
            ? "w-full flex-1 flex flex-col"
            : !productId && activeTab === "shop"
              ? "w-full px-4 sm:px-8 md:px-12 py-6 flex-1 pt-[150px] sm:pt-[110px] md:pt-[150px]"
              : "max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8 flex-1 pt-[150px] sm:pt-[110px] md:pt-[150px]"
        }
      >
        {isCheckoutPage ? (
          <CheckoutFlow
            onClose={() => navigate("/home")}
            onNewAddressClick={() => setIsAddressModalOpen(true)}
            onOrderPlaced={() => {
              navigate("/order-history");
              dispatch(fetchMyOrders());
              showToastMsg("Order placed successfully!", "success");
            }}
            showToastMsg={showToastMsg}
          />
        ) : productId ? (
          selectedProduct && selectedProduct._id === productId ? (
            <ProductDetail
              product={selectedProduct}
              onBack={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/home");
                }
              }}
              onProductClick={handleProductClick}
              showToastMsg={showToastMsg}
              onBuyNow={() => navigate("/checkout")}
            />
          ) : (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-3 border-pink-600/25 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
              <span className="text-slate-400 dark:text-slate-500 text-sm font-semibold">
                Loading product details...
              </span>
            </div>
          )
        ) : (
          <>
            {activeTab === "shop" && (
              <ShopCatalog
                onProductClick={handleProductClick}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSubCategory={selectedSubCategory}
                setSelectedSubCategory={setSelectedSubCategory}
                onOpenCart={() => setShowCartPanel(true)}
              />
            )}

            {/* Cart panel slide-over */}
            {showCartPanel && (
              <CartPanel
                onClose={() => setShowCartPanel(false)}
                onCheckoutClick={() => {
                  setShowCartPanel(false);
                  navigate("/checkout");
                }}
              />
            )}

            {activeTab === "orders" && <OrdersHistory />}

            {activeTab === "wishlist" && (
              <Wishlist onProductClick={handleProductClick} />
            )}

            {activeTab === "payments" && <UserPayments />}

            {activeTab === "settings" && (
              <ProfileSettings
                onAddAddressClick={() => setIsAddressModalOpen(true)}
                showToastMsg={showToastMsg}
              />
            )}
          </>
        )}
      </main>

      {!isCheckoutPage && !productId && activeTab !== "wishlist" && activeTab !== "orders" && activeTab !== "settings" && <Footer />}

      {/* ─── MOBILE BOTTOM FLOATING NAVIGATION BAR ─── */}
      {!isCheckoutPage && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-150 dark:border-slate-800 flex justify-around py-3.5 z-40 shadow-xl text-[9px] font-black tracking-wider transition-colors duration-300">
          <button
            onClick={() => navigate("/home")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === "shop"
                ? "text-[#9F2089] dark:text-pink-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <NavIcons.Shop />
            <span>Shop</span>
          </button>
          <button
            onClick={() => navigate("/wishlist")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === "wishlist"
                ? "text-[#9F2089] dark:text-pink-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <NavIcons.Wishlist />
            <span>Wishlist</span>
          </button>
          <button
            onClick={() => navigate("/order-history")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === "orders"
                ? "text-[#9F2089] dark:text-pink-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <NavIcons.Orders />
            <span>Orders</span>
          </button>
          <button
            onClick={() => navigate("/payments")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === "payments"
                ? "text-[#9F2089] dark:text-pink-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <NavIcons.Payments />
            <span>Refunds</span>
          </button>
          <button
            onClick={() => navigate("/settings")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === "settings"
                ? "text-[#9F2089] dark:text-pink-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <NavIcons.Settings />
            <span>Profile</span>
          </button>
        </nav>
      )}

      {/* ─── MODALS & DRAWER PANELS ─── */}
      {isAddressModalOpen && (
        <AddressModal onClose={() => setIsAddressModalOpen(false)} />
      )}
    </div>
  );
}
