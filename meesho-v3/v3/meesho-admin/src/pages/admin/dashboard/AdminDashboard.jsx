import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import {
  firstOrPlaceholder,
  resolveOrPlaceholder,
  PLACEHOLDER_IMAGE,
  getFirstProductImage,
  resolveImageUrl,
} from "../../../utils/imageUrl";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  fetchAllUsers,
  updateUserRole,
  deleteUser,
  fetchAdminOrders,
  updateAdminOrderStatus,
} from "../../../redux/slices/adminSlice";
import {
  logout,
  changePassword,
  clearMessages,
} from "../../../redux/slices/authSlice";
import { fetchCategories } from "../../../redux/slices/categorySlice";
import { adminFetchProducts } from "../../../redux/slices/productSlice";
import { useNavigate, useOutletContext, Navigate } from "react-router-dom";

// Instantly redirect to a dedicated route when a legacy tab is matched.
const RedirectTab = ({ to }) => <Navigate to={to} replace />;
// AdminCategories, AdminProducts, and AdminOrders are now rendered on
// their own dedicated routes (/admin/dashboard/categories, /products, /orders).
// We import useNavigate to redirect when those tabs are clicked.

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const Icons = {
  Home: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  Users: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  Settings: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Profile: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  Shield: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  Lock: ({ className = "w-4 h-4" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  ),
  Logout: ({ className = "w-4 h-4" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
  ChevronRight: ({ className = "w-4 h-4" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
  ChevronDown: ({ className = "w-4 h-4" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Info: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Trash: ({ className = "w-4 h-4" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  Search: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  Check: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Menu: ({ className = "w-6 h-6" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  ),
  Close: ({ className = "w-6 h-6" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  Eye: ({ className = "w-4 h-4" }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
};

const getProfileImageUrl = (img) => resolveImageUrl(img);

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 dark:border-slate-800 my-8 text-xs">
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 rounded-t-2xl z-10">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
          >
            <Icons.Close />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[75vh]">{children}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const _dashContext = useOutletContext() || {};
  const isDarkMode = _dashContext.isDarkMode ?? false;
  const onToggleDarkMode =
    typeof _dashContext.onToggleDarkMode === "function"
      ? _dashContext.onToggleDarkMode
      : () => {};
  const showToast =
    typeof _dashContext.showToast === "function"
      ? _dashContext.showToast
      : () => {};

  // ─── Selectors ─────────────────────────────────────────────────────────────
  const {
    users,
    orders,
    isLoading: adminLoading,
    error: adminError,
  } = useAppSelector((s) => s.admin);
  const {
    user,
    isLoading: authLoading,
    error: authError,
    successMessage: authSuccess,
  } = useAppSelector((s) => s.auth);
  const { categories } = useAppSelector((s) => s.category);
  const { adminProducts } = useAppSelector((s) => s.product);

  // View State — no more tab routing; each section is its own route.
  // Keeping a local state only for settings/profile sub-sections within this page.
  const [activeSubView, setActiveSubView] = useState("home");

  // Chart Tooltips states
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [hoveredSliceIndex, setHoveredSliceIndex] = useState(null);

  // User Management filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [userToDelete, setUserToDelete] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Settings
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    requireEmailVerification: true,
    compactLayout: false,
    systemAlerts: true,
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const validatePasswordForm = (name, value, currentForm = passwordForm) => {
    let error = "";
    if (name === "oldPassword") {
      if (!value) error = "Current Password is required.";
    } else if (name === "newPassword") {
      if (!value) error = "New Password is required.";
      else if (value.length < 6)
        error = "Password must be at least 6 characters.";
    } else if (name === "confirmPassword") {
      if (!value) error = "Confirm Password is required.";
      else if (value !== currentForm.newPassword)
        error = "Passwords do not match.";
    }
    return error;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => {
      const newForm = { ...prev, [name]: value };
      const fieldError = validatePasswordForm(name, value, newForm);
      setPasswordErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (fieldError) newErrors[name] = fieldError;
        else delete newErrors[name];

        if (name === "newPassword" && newForm.confirmPassword) {
          const confirmError = validatePasswordForm(
            "confirmPassword",
            newForm.confirmPassword,
            newForm,
          );
          if (confirmError) newErrors.confirmPassword = confirmError;
          else delete newErrors.confirmPassword;
        }
        return newErrors;
      });
      return newForm;
    });
  };

  // Local synchronized orders for AeroPanel
  const [localOrders, setLocalOrders] = useState([]);

  useEffect(() => {
    if (orders && orders.length > 0) {
      const normalized = orders.map(o => ({
        ...o,
        orderStatus: o.orderStatus || o.status || "pending"
      }));
      setLocalOrders(normalized);
    } else {
      setLocalOrders([
        {
          _id: "mock-1",
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          user: { email: "rahul.sharma@gmail.com", name: "Rahul Sharma" },
          product: {
            name: "Designer Silk Saree",
            category: { name: "Ethnic Wear" },
          },
          totalPrice: 1850,
          orderStatus: "delivered",
        },
        {
          _id: "mock-2",
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          user: { email: "priya.patel@yahoo.com", name: "Priya Patel" },
          product: {
            name: "Cotton Kurti Set",
            category: { name: "Ethnic Wear" },
          },
          totalPrice: 950,
          orderStatus: "shipped",
        },
        {
          _id: "mock-3",
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          user: { email: "amit.kumar@outlook.com", name: "Amit Kumar" },
          product: {
            name: "Men's Slim Fit Shirt",
            category: { name: "Men's Fashion" },
          },
          totalPrice: 1200,
          orderStatus: "pending",
        },
        {
          _id: "mock-4",
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          user: { email: "sneha.reddy@gmail.com", name: "Sneha Reddy" },
          product: {
            name: "Silver Jhumka Earrings",
            category: { name: "Accessories" },
          },
          totalPrice: 450,
          orderStatus: "delivered",
        },
        {
          _id: "mock-5",
          createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
          user: { email: "vicky.singh@gmail.com", name: "Vicky Singh" },
          product: {
            name: "Wireless Earbuds",
            category: { name: "Electronics" },
          },
          totalPrice: 2100,
          orderStatus: "cancelled",
        },
      ]);
    }
  }, [orders]);

  // ─── Lifecycle & Toast Wiring ─────────────────────────────────────────────
  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchAllUsers());
    }
    if (orders.length === 0) {
      dispatch(fetchAdminOrders());
    }
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
    if (adminProducts.length === 0) {
      dispatch(adminFetchProducts());
    }
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch, users.length, orders.length, categories.length, adminProducts.length]);

  useEffect(() => {
    if (adminError) {
      showToast(adminError, "error");
    }
  }, [adminError]);

  useEffect(() => {
    if (authSuccess) {
      showToast(authSuccess, "success");
      dispatch(clearMessages());
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    if (authError) {
      showToast(authError, "error");
      dispatch(clearMessages());
    }
  }, [authSuccess, authError, dispatch]);

  // ─── Admin Actions ─────────────────────────────────────────────────────────
  const handleRoleChange = async (userId, role) => {
    try {
      await dispatch(updateUserRole({ userId, role })).unwrap();
      showToast("User role updated successfully!", "success");
    } catch (err) {
      showToast(err || "Failed to update user role", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await dispatch(deleteUser(userToDelete._id || userToDelete.id)).unwrap();
      showToast("User account deleted successfully!", "success");
      setUserToDelete(null);
    } catch (err) {
      showToast(err || "Failed to delete user account", "error");
      setUserToDelete(null);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(passwordForm).forEach((key) => {
      const error = validatePasswordForm(key, passwordForm[key], passwordForm);
      if (error) newErrors[key] = error;
    });
    setPasswordErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    dispatch(
      changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      }),
    );
  };

  const confirmLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    if (orderId.toString().startsWith("mock-")) {
      setLocalOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o,
        ),
      );
      showToast(
        "Mock order status updated successfully (Local Only)!",
        "success",
      );
      return;
    }
    try {
      await dispatch(
        updateAdminOrderStatus({ orderId, status: newStatus }),
      ).unwrap();
      showToast("Order status updated successfully!", "success");
    } catch (err) {
      showToast(err || "Failed to update order status", "error");
    }
  };

  // ─── Calculations ──────────────────────────────────────────────────────────
  const adminEmail = user?.email || "admin@meesho.com";
  const adminName = user?.name || adminEmail.split("@")[0];

  const totalUsers = users ? users.length : 0;
  const adminCount = users
    ? users.filter((u) => (u.role || "user") === "admin").length
    : 0;
  const customerCount = users
    ? users.filter((u) => (u.role || "user") === "user").length
    : 0;

  // ─── Calculations for Sales Dashboard (AeroPanel) ───────────────────────────
  const getSalesMetrics = () => {
    const activeOrders = (localOrders || []).filter(
      (o) => o.orderStatus !== "cancelled",
    );
    const revenue = activeOrders.reduce(
      (acc, curr) => acc + (curr.totalPrice || 0),
      0,
    );
    const count = localOrders ? localOrders.length : 0;
    const aov = count > 0 ? Math.round(revenue / count) : 0;
    return { revenue, count, aov };
  };

  const {
    revenue: totalRevenue,
    count: totalOrdersCount,
    aov: averageOrderValue,
  } = getSalesMetrics();

  const isDemo = !orders || orders.length === 0;
  const displayRevenue = isDemo ? 142500 : totalRevenue;
  const displayOrders = isDemo ? 1250 : totalOrdersCount;
  const displayAov = isDemo ? 114 : averageOrderValue;
  const displayCustomers = isDemo ? 842 : customerCount;

  // Monthly Sales Grouping
  const getMonthlySales = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        name: months[d.getMonth()],
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        sales: 0,
        count: 0,
      });
    }

    (localOrders || []).forEach((o) => {
      if (!o.createdAt || o.orderStatus === "cancelled") return;
      const oDate = new Date(o.createdAt);
      const monthIndex = last6Months.findIndex(
        (m) =>
          m.monthNum === oDate.getMonth() && m.year === oDate.getFullYear(),
      );
      if (monthIndex !== -1) {
        last6Months[monthIndex].sales += o.totalPrice || 0;
        last6Months[monthIndex].count += 1;
      }
    });

    const hasRealSales = last6Months.some((m) => m.sales > 0);
    return hasRealSales
      ? last6Months
      : [
          { name: "Jan", sales: 45000, count: 25 },
          { name: "Feb", sales: 52000, count: 28 },
          { name: "Mar", sales: 49000, count: 24 },
          { name: "Apr", sales: 63000, count: 35 },
          { name: "May", sales: 58000, count: 30 },
          { name: "Jun", sales: 75000, count: 42 },
        ];
  };

  const monthlySalesData = getMonthlySales();

  // Category Share Grouping
  const getCategoryDistribution = () => {
    const shareMap = {};
    (localOrders || []).forEach((o) => {
      if (!o.product || o.orderStatus === "cancelled") return;
      const catName = o.product.category?.name || "General";
      shareMap[catName] = (shareMap[catName] || 0) + (o.totalPrice || 0);
    });

    const entries = Object.entries(shareMap).map(([name, value]) => ({
      name,
      value,
    }));
    if (entries.length > 0) return entries;
    return [
      { name: "Ethnic Wear", value: 45 },
      { name: "Men's Fashion", value: 30 },
      { name: "Accessories", value: 15 },
      { name: "Electronics", value: 10 },
    ];
  };

  const categoryShareData = getCategoryDistribution();

  // Admin Payments / Refunds calculations
  const adminRefundedOrders = (localOrders || []).filter(
    (ord) => ord.orderStatus === "cancelled" || ord.orderStatus === "returned",
  );
  const adminRefundedMoney = adminRefundedOrders.reduce(
    (acc, curr) => acc + (curr.totalPrice || 0),
    0,
  );
  const adminReturnedProductsCount = adminRefundedOrders.reduce(
    (acc, curr) => acc + (curr.quantity || 1),
    0,
  );
  const adminTotalSales = (localOrders || [])
    .filter((o) => o.orderStatus !== "cancelled")
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  // ─── Styles ────────────────────────────────────────────────────────────────
  const activeClass =
    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all bg-indigo-50 text-indigo-600";
  const inactiveClass =
    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-slate-600 hover:bg-slate-50 hover:text-slate-900";
  const subActiveClass =
    "flex items-center gap-3 pl-8 pr-4 py-2 rounded-lg text-xs font-semibold transition-all bg-indigo-50 text-indigo-600";
  const subInactiveClass =
    "flex items-center gap-3 pl-8 pr-4 py-2 rounded-lg text-xs font-medium transition-all text-slate-500 hover:bg-slate-50 hover:text-slate-900";

  // charts data

  const commonOptions = {
    chart: {
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: true,
      },
      animations: {
        enabled: false,
      },
    },
    theme: {
      mode: isDarkMode ? "dark" : "light",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    tooltip: {
      enabled: true,
    },
    grid: {
      show: false,
    },
    xaxis: {
      labels: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
  };

  // ─── Dynamic Chart Trends calculation ──────────────────────────────────────
  const getRevenueTrend = () => {
    const nonCancelled = (localOrders || []).filter(
      (o) => o.orderStatus !== "cancelled",
    );
    const sorted = [...nonCancelled].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
    const data = sorted.map((o) => o.totalPrice || 0);
    if (data.length < 5) {
      return [25, 60, 40, 80, 15, 95, 55];
    }
    return data.slice(-7);
  };

  const getOrdersTrend = () => {
    const sorted = [...(localOrders || [])].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
    const data = sorted.map((o) => o.quantity || 1);
    if (data.length < 5) {
      return [180, 220, 260, 310, 340, 370];
    }
    return data.slice(-7);
  };

  const revenueOptions = {
    ...commonOptions,
    colors: ["#4f46e5"],
  };

  const revenueSeries = [
    {
      name: "Revenue",
      data: getRevenueTrend(),
    },
  ];

  const ordersOptions = {
    ...commonOptions,
    colors: ["#4f46e5"],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "45%",
      },
    },
  };

  const ordersSeries = [
    {
      name: "Orders",
      data: getOrdersTrend(),
    },
  ];

  const visitorOptions = {
    ...commonOptions,
    colors: ["#10b981"],
  };

  const visitorSeries = [
    {
      name: "Visitors",
      data: [
        Math.round(displayCustomers * 1.2),
        Math.round(displayCustomers * 1.5),
        Math.round(displayCustomers * 1.1),
        Math.round(displayCustomers * 1.8),
        Math.round(displayCustomers * 2.2),
        Math.round(displayCustomers * 1.9),
        Math.round(displayCustomers * 2.5),
      ],
    },
  ];

  const conversionOptions = {
    ...commonOptions,
    colors: ["#ec4899"],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "45%",
      },
    },
  };

  const conversionSeries = [
    {
      name: "Conversion",
      data: [2.1, 2.8, 3.2, 2.9, 3.5, 3.8, 4.1],
    },
  ];

  const salesAnalysisSeries = [
    {
      name: "Revenue",
      data: monthlySalesData.map((d) => d.sales),
    },
  ];

  const salesAnalysisOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: false },
    },
    theme: {
      mode: isDarkMode ? "dark" : "light",
    },
    colors: ["#4f46e5"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 },
    },
    grid: { borderColor: isDarkMode ? "#002855" : "#e5e7eb" },
    xaxis: { categories: monthlySalesData.map((d) => d.name) },
    yaxis: {
      labels: { style: { colors: isDarkMode ? "#7d8597" : "#64748b" } },
    },
    tooltip: { theme: isDarkMode ? "dark" : "light" },
    legend: { show: false },
  };

  const dynamicTotalVisitors = displayCustomers
    ? Math.round(displayCustomers * 3.5)
    : 2456;
  const fbPercent = 45.6;
  const instaPercent = 33.8;
  const otherPercent = 20.6;

  const fbVisitors = Math.round(dynamicTotalVisitors * (fbPercent / 100));
  const instaVisitors = Math.round(dynamicTotalVisitors * (instaPercent / 100));
  const otherVisitors = dynamicTotalVisitors - fbVisitors - instaVisitors;

  const trafficDonutSeries = [fbPercent, instaPercent, otherPercent];

  const trafficDonutOptions = {
    labels: ["Facebook", "Instagram", "Other"],
    colors: ["#4f46e5", "#818cf8", "#c7d2fe"],
    chart: {
      type: "donut",
      animations: { enabled: false },
    },
    theme: { mode: isDarkMode ? "dark" : "light" },
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    plotOptions: {
      pie: { donut: { size: "70%" } },
    },
  };
  return (
    <>
      {/* Toast Alert Banner */}
      {showToast.show && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl shadow-lg border animate-bounce ${
            showToast.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : "bg-rose-50 border-rose-100 text-rose-800"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              showToast.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-rose-500 text-white"
            }`}
          >
            {showToast.type === "success" ? "✓" : "!"}
          </div>
          <span className="text-sm font-medium">{showToast.message}</span>
        </div>
      )}

      {/* Delete User Account Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in text-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 flex items-center justify-center mb-4">
              <Icons.Trash className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Delete User Account
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 leading-relaxed">
              Are you absolutely sure you want to delete the account for:
            </p>
            <p className="text-slate-800 dark:text-slate-200 text-sm font-bold mb-4">
              {userToDelete.email} ({userToDelete.name || "No Name"})
            </p>
            <p className="text-rose-600 dark:text-rose-400 text-xs font-semibold mb-6 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-xl border border-rose-100/50 dark:border-rose-900/30">
              <Icons.Info className="w-4 h-4 shrink-0" />
              This action is permanent and cannot be undone. All user data,
              wishlists, and orders history will be purged.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all bg-white dark:bg-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 hover:shadow-md hover:shadow-rose-100 transition-all"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOME OVERVIEW — always shown since this IS the dashboard route */}
      {true &&
        (() => {
          // SVG Combo Chart setup
          const chartWidth = 500;
          const chartHeight = 220;
          const maxSales =
            Math.max(...monthlySalesData.map((d) => d.sales)) || 10000;
          const maxCount =
            Math.max(...monthlySalesData.map((d) => d.count)) || 10;

          const paddingSalesMax = maxSales * 1.15;
          const paddingCountMax = maxCount * 1.2;

          const colWidth = chartWidth / 6;

          const getYForSales = (val) => 220 - (val / paddingSalesMax) * 170;
          const getYForOrders = (val) => 220 - (val / paddingCountMax) * 170;

          const linePoints = monthlySalesData.map((d, i) => ({
            x: 50 + i * colWidth + colWidth / 2,
            y: getYForOrders(d.count),
          }));

          const pathD = linePoints
            .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
            .join(" ");

          // SVG Donut Chart setup
          const categoryTotal =
            categoryShareData.reduce((acc, c) => acc + c.value, 0) || 1;
          const COLORS = [
            "#6366f1",
            "#ec4899",
            "#14b8a6",
            "#f59e0b",
            "#3b82f6",
            "#8b5cf6",
            "#10b981",
          ];
          const C = 439.82; // Circumference for r=70

          let accumulatedPercent = 0;
          const segments = categoryShareData.map((d, i) => {
            const percent = d.value / categoryTotal;
            const dashLength = percent * C;
            const strokeOffset = C - accumulatedPercent * C;
            accumulatedPercent += percent;
            return {
              ...d,
              percent,
              dashLength,
              strokeOffset,
              color: COLORS[i % COLORS.length],
            };
          });

          return (
            <div className="flex flex-col gap-6 animate-fade-in text-slate-800 flex-1 min-h-0 overflow-y-auto pr-1">
              {/* SVG Definitions for Gradients */}
              <svg className="absolute w-0 h-0" width="0" height="0">
                <defs>
                  <linearGradient
                    id="sparkline-green"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient
                    id="sparkline-blue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient
                    id="sparkline-pink"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient
                    id="sparkline-purple"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient
                    id="bar-gradient-hover"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Welcome Banner Card */}
              {/* <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="absolute bottom-0 left-1/3 w-36 h-36 bg-pink-500/10 rounded-full -mb-8 blur-xl" />

                <div className="relative z-10">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500 text-white tracking-wider">
                    Super Administrator
                  </span>
                  <h3 className="text-xl lg:text-2xl font-bold mt-2.5 mb-2">
                    Welcome Back, {adminName}! ⚙️
                  </h3>
                  <p className="text-slate-300 text-xs lg:text-sm max-w-xl leading-relaxed">
                    You have total administration rights over user directory
                    permissions, membership assignments, security audits, and
                    global site configurations.
                  </p>

                  {/* Shortcut links */}
              {/* <div className="flex flex-wrap gap-2.5 mt-6">
                    <button
                      onClick={() => navigate("/users")}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 hover:shadow-md rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      Manage User Accounts
                    </button>
                    <button
                      onClick={() => navigate("/payments")}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      Configure Preferences
                    </button>
                  </div>
                </div>
              </div> */}

              {/* KPI Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Revenue */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h6 className="text-slate-500 dark:text-slate-400 text-sm mb-1">
                    Total Revenue
                  </h6>

                  <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    ₹{displayRevenue.toLocaleString("en-IN")}
                  </h3>

                  <p className="text-sm text-emerald-600 mt-1">
                    +12.4% from last month
                  </p>

                  <div className="mt-4 h-20">
                    {/* Revenue Chart */}
                    <Chart
                      options={revenueOptions}
                      series={revenueSeries}
                      type="line"
                      height={80}
                    />
                  </div>
                </div>

                {/* Orders */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h6 className="text-slate-500 dark:text-slate-400 text-sm mb-1">
                    Orders
                  </h6>

                  <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {displayOrders.toLocaleString("en-IN")}
                  </h3>

                  <p className="text-sm text-blue-600 mt-1">+8.1% growth</p>

                  <div className="mt-4 h-20">
                    <Chart
                      options={ordersOptions}
                      series={ordersSeries}
                      type="bar"
                      height={80}
                    />
                  </div>
                </div>

                {/* Visitors */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h6 className="text-slate-500 dark:text-slate-400 text-sm mb-1">
                    Website Visitors
                  </h6>

                  <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {displayCustomers.toLocaleString("en-IN")}
                  </h3>

                  <p className="text-sm text-emerald-600 mt-1">
                    +5.6% from last week
                  </p>

                  <div className="mt-4 h-20">
                    <Chart
                      options={visitorOptions}
                      series={visitorSeries}
                      type="area"
                      height={80}
                    />
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h6 className="text-slate-500 dark:text-slate-400 text-sm mb-1">
                    Conversion Rate
                  </h6>

                  <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    3.8%
                  </h3>

                  <p className="text-sm text-emerald-600 mt-1">
                    +0.4% from last month
                  </p>

                  <div className="mt-4 h-20">
                    <Chart
                      options={conversionOptions}
                      series={conversionSeries}
                      type="bar"
                      height={80}
                    />
                  </div>
                </div>
              </div>
              {/* Graphs Row */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Sales Analysis */}
                <div className="xl:col-span-8">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                          Sales Analysis
                        </h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                          Product performance over time
                        </p>
                      </div>

                      <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <svg
                          className="w-5 h-5 text-slate-500 dark:text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                    </div>

                    {/* Chart Area */}
                    <div className="h-[395px] w-full rounded-xl bg-gradient-to-b from-indigo-50/10 dark:from-slate-950/20 to-white dark:to-slate-900 border border-slate-100 dark:border-slate-800 p-2">
                      {salesAnalysisSeries[0]?.data?.length > 0 && (
                        <Chart
                          options={salesAnalysisOptions}
                          series={salesAnalysisSeries}
                          type="area"
                          width="100%"
                          height="100%"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Traffic Channels */}
                <div className="xl:col-span-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs h-full">
                    <div className="mb-6">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                        Top Traffic Channels
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                        Visitor acquisition sources
                      </p>
                    </div>

                    {/* Donut Chart */}
                    <div className="relative flex justify-center mb-8">
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">
                          {dynamicTotalVisitors.toLocaleString("en-IN")}
                        </h3>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          Total Visitors
                        </span>
                      </div>

                      {/* Replace with Apex Donut Chart */}
                      {trafficDonutSeries?.length > 0 && (
                        <Chart
                          options={trafficDonutOptions}
                          series={trafficDonutSeries}
                          type="donut"
                          width="100%"
                          height={250}
                        />
                      )}
                    </div>

                    {/* Channel Breakdown */}
                    <div className="space-y-5">
                      {[
                        {
                          name: "Facebook",
                          percent: fbPercent,
                          visitors: fbVisitors,
                          color: "bg-indigo-500",
                        },
                        {
                          name: "Instagram",
                          percent: instaPercent,
                          visitors: instaVisitors,
                          color: "bg-cyan-500",
                        },
                        {
                          name: "Other",
                          percent: otherPercent,
                          visitors: otherVisitors,
                          color: "bg-slate-400",
                        },
                      ].map((channel) => (
                        <div key={channel.name}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {channel.name}
                            </span>

                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {channel.percent}% (
                              {channel.visitors.toLocaleString("en-IN")})
                            </span>
                          </div>

                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${channel.color}`}
                              style={{ width: `${channel.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <button className="mt-8 cursor-pointer w-full border border-slate-200 dark:border-slate-800 rounded-full py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2">
                      See All Insights
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {/* Recent Transactions Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                      Recent Sales Transactions
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                      Real-time orders queue. Update statuses directly below.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      showToast(
                        "Exporting reports (Mock feature)...",
                        "success",
                      )
                    }
                    className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all rounded-xl px-4 py-2 w-max cursor-pointer"
                  >
                    Export Report
                  </button>
                </div>

                {adminLoading && localOrders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                    Loading sales records...
                  </div>
                ) : localOrders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                    No orders registered in the system.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Product Purchased</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-center">
                            Admin Actions
                          </th>
                          <th className="py-3 px-4 text-center">View</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {localOrders.slice(0, 8).map((o) => {
                          const oId = o._id || o.id;
                          const createdDate = o.createdAt
                            ? new Date(o.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "—";
                          const emailStr =
                            o.user?.email ||
                            o.shippingInfo?.email ||
                            "customer@gmail.com";
                          const nameStr =
                            o.user?.name ||
                            o.shippingInfo?.name ||
                            emailStr.split("@")[0];
                          const prodName =
                            o.product?.name ||
                            o.product?.title ||
                            "System Product";
                          const catStr = o.product?.category?.name || "General";

                          return (
                            <tr
                              key={oId}
                              className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors"
                            >
                              <td
                                className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[90px]"
                                title={oId}
                              >
                                #{oId.substring(0, 8)}...
                              </td>
                              <td className="py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400">
                                {createdDate}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center border border-slate-200 dark:border-slate-700 text-[10px] shrink-0 overflow-hidden">
                                    {getProfileImageUrl(
                                      o.user?.profileImage,
                                    ) ? (
                                      <img
                                        src={getProfileImageUrl(
                                          o.user?.profileImage,
                                        )}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      nameStr.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-700 dark:text-slate-300 truncate leading-snug">
                                      {nameStr}
                                    </p>
                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate leading-none mt-0.5">
                                      {emailStr}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                                    {prodName}
                                  </p>
                                  <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/50 px-1.5 py-0.2 rounded mt-0.5 inline-block capitalize">
                                    {catStr}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-slate-200">
                                ₹{(o.totalPrice || 0).toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex justify-center">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                                      o.orderStatus === "delivered"
                                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                        : o.orderStatus === "pending"
                                          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 animate-pulse"
                                          : o.orderStatus === "shipped"
                                            ? "bg-sky-50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/30 text-sky-700 dark:text-sky-400"
                                            : "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400"
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        o.orderStatus === "delivered"
                                          ? "bg-emerald-500"
                                          : o.orderStatus === "pending"
                                            ? "bg-amber-500"
                                            : o.orderStatus === "shipped"
                                              ? "bg-sky-500"
                                              : "bg-rose-500"
                                      }`}
                                    />
                                    {o.orderStatus}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex justify-center">
                                  <select
                                    value={o.orderStatus || "pending"}
                                    onChange={(e) =>
                                      handleOrderStatusUpdate(
                                        oId,
                                        e.target.value,
                                      )
                                    }
                                    className="px-2 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold focus:outline-hidden focus:border-indigo-600 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  onClick={() => setSelectedOrder(o)}
                                  className="p-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 rounded-xl transition-all cursor-pointer"
                                  title="View Order Details"
                                >
                                  <Icons.Eye className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      {/* USERS — now at /admin/users, not a tab */}
      {false && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 lg:p-8 animate-fade-in shadow-xs flex-1 min-h-0 flex flex-col gap-6">
          {/* Header search and filters */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name or Email..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-600/30 transition-all bg-slate-50/50 dark:bg-slate-950 dark:text-slate-100"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <Icons.Search className="w-4 h-4" />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-bold"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl w-max border border-slate-100 dark:border-slate-850">
              {["all", "admin", "user"].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    roleFilter === role
                      ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {role === "all" ? "All Roles" : `${role}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Users Directory Table */}
          {adminLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-600/20 border-t-indigo-600 animate-spin" />
              <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">
                Fetching directory...
              </p>
            </div>
          ) : (
            (() => {
              const filtered = (users || []).filter((u) => {
                const nameMatch = (u.username || u.name || "")
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase());
                const emailMatch = (u.email || "")
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase());
                const matchesSearch = nameMatch || emailMatch;

                const matchesRole =
                  roleFilter === "all" ||
                  (u.role || "user").toLowerCase() === roleFilter.toLowerCase();
                return matchesSearch && matchesRole;
              });

              if (filtered.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-850">
                      <Icons.Users className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                      No Accounts Found
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                      We couldn't find any user profiles matching your keywords
                      or filter choices.
                    </p>
                  </div>
                );
              }

              return (
                <div className="overflow-y-auto flex-1 min-h-0 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs relative">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                      <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-4 px-6">Avatar</th>
                        <th className="py-4 px-6">Account Name</th>
                        <th className="py-4 px-6">Email Address</th>
                        <th className="py-4 px-6 text-center">
                          Admin Controls
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filtered.map((u) => {
                        const uId = u._id || u.id;
                        const initial = (u.username || u.name || u.email || "U")
                          .charAt(0)
                          .toUpperCase();
                        return (
                          <tr
                            key={uId}
                            className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors"
                          >
                            <td className="py-4.5 px-6">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center border border-slate-200/50 dark:border-slate-700 overflow-hidden shrink-0">
                                {getProfileImageUrl(u.profileImage) ? (
                                  <img
                                    src={getProfileImageUrl(u.profileImage)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  initial
                                )}
                              </div>
                            </td>
                            <td className="py-4.5 px-6 font-bold text-slate-800 dark:text-slate-200">
                              {u.username || u.name || "—"}
                            </td>
                            <td className="py-4.5 px-6 font-semibold text-slate-500 dark:text-slate-400">
                              {u.email}
                            </td>
                            <td className="py-4.5 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setViewUser(u)}
                                  className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 rounded-xl border border-slate-100 dark:border-slate-800 transition-all cursor-pointer active:scale-95"
                                  title="View User Details"
                                >
                                  <Icons.Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setUserToDelete(u)}
                                  className="p-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl transition-all inline-flex items-center gap-1 border border-rose-100/50 dark:border-rose-900/30 active:scale-95"
                                  title="Delete User Account"
                                >
                                  <Icons.Trash className="w-3.5 h-3.5" />
                                  <span className="font-bold text-[10px]">
                                    Delete
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* SETTINGS — keeping as a local sub-view via activeSubView for future */}
      {activeSubView === "settings" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 lg:p-8 animate-fade-in shadow-xs max-w-3xl flex-1 min-h-0 overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            Configure Preferences
          </h3>

          <div className="flex flex-col gap-6">
            {/* Admin Dark Mode Theme */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1 pr-6">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Admin Dark Mode Theme
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  Toggle between the default light theme and premium
                  high-contrast dark theme for the administrator console.
                </span>
              </div>
              <button
                onClick={onToggleDarkMode}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-hidden ${
                  isDarkMode
                    ? "bg-indigo-600"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    isDarkMode ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Visual compact layout */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1 pr-6">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Compact Dashboard Layout
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  Reduces table padding and layout gutters to fit more
                  information inside lists.
                </span>
              </div>
              <button
                onClick={() => {
                  setSettings({
                    ...settings,
                    compactLayout: !settings.compactLayout,
                  });
                  showToast("Console layout preferences toggled!", "success");
                }}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-hidden ${
                  settings.compactLayout
                    ? "bg-indigo-600"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    settings.compactLayout ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Maintenance mode */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1 pr-6">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  System Maintenance Mode (Mock)
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  Locks standard customer dashboard writes. Restricts shopping,
                  order placement, and profile updates.
                </span>
              </div>
              <button
                onClick={() => {
                  setSettings({
                    ...settings,
                    maintenanceMode: !settings.maintenanceMode,
                  });
                  showToast("System maintenance status updated!", "success");
                }}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-hidden ${
                  settings.maintenanceMode
                    ? "bg-indigo-600"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    settings.maintenanceMode ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Require Email Validation */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1 pr-6">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Require Account Email Verification (Mock)
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  Forces newly registered customers to check and confirm their
                  email verification codes before login.
                </span>
              </div>
              <button
                onClick={() => {
                  setSettings({
                    ...settings,
                    requireEmailVerification:
                      !settings.requireEmailVerification,
                  });
                  showToast("Enforcement policy rules updated!", "success");
                }}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-hidden ${
                  settings.requireEmailVerification
                    ? "bg-indigo-600"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    settings.requireEmailVerification ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Security system alerts */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1 pr-6">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Critical Audit System Notifications (Mock)
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  Receive instant warnings for suspicious activities (multiple
                  login failures, brute forces, address edits).
                </span>
              </div>
              <button
                onClick={() => {
                  setSettings({
                    ...settings,
                    systemAlerts: !settings.systemAlerts,
                  });
                  showToast(
                    "Security notifications preferences updated!",
                    "success",
                  );
                }}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-hidden ${
                  settings.systemAlerts
                    ? "bg-indigo-600"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    settings.systemAlerts ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE INFO — keeping as local sub-view */}
      {activeSubView === "profile-info" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 lg:p-8 animate-fade-in shadow-xs max-w-3xl flex-1 min-h-0 overflow-y-auto">
          {/* Profile Card Info Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-3xl shadow-inner border border-indigo-200/50 dark:border-indigo-900/30 select-none overflow-hidden shrink-0">
              {getProfileImageUrl(user?.profileImage) ? (
                <img
                  src={getProfileImageUrl(user?.profileImage)}
                  alt="Admin Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                adminName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="text-center sm:text-left flex-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {adminName}
              </h3>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                {adminEmail}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200/30">
                  System Admin
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                  Console Verified
                </span>
              </div>
            </div>
          </div>

          {/* Profile Fields List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-8 text-xs">
            <div className="flex flex-col gap-1.5 pb-4 border-b border-slate-50 dark:border-slate-800">
              <span className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                Profile Username
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {adminName}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pb-4 border-b border-slate-50 dark:border-slate-800">
              <span className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                Email Address
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {adminEmail}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pb-4 border-b border-slate-50 dark:border-slate-800">
              <span className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                Account Scope
              </span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                Read / Write Database
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pb-4 border-b border-slate-50 dark:border-slate-800">
              <span className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                Security Role Group
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">
                Administrator
              </span>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE PASSWORD — keeping as local sub-view */}
      {activeSubView === "profile-password" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 lg:p-8 animate-fade-in shadow-xs max-w-md flex-1 min-h-0 overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            Change Admin Password
          </h3>

          <form
            onSubmit={handleChangePassword}
            noValidate
            className="flex flex-col gap-4.5 text-xs"
          >
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChange}
                required
                placeholder="••••••••"
                className="px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-indigo-600 dark:focus:border-indigo-550 text-slate-800 dark:text-slate-200 font-medium bg-slate-50/50 dark:bg-slate-950 focus:ring-1 focus:ring-indigo-600/20 transition-all text-xs"
              />
              {passwordErrors.oldPassword && (
                <p className="text-[10px] text-rose-500 font-bold ml-1">
                  {passwordErrors.oldPassword}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                placeholder="••••••••"
                className="px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-indigo-600 dark:focus:border-indigo-550 text-slate-800 dark:text-slate-200 font-medium bg-slate-50/50 dark:bg-slate-950 focus:ring-1 focus:ring-indigo-600/20 transition-all text-xs"
              />
              {passwordErrors.newPassword && (
                <p className="text-[10px] text-rose-500 font-bold ml-1">
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                placeholder="••••••••"
                className="px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-indigo-600 dark:focus:border-indigo-550 text-slate-800 dark:text-slate-200 font-medium bg-slate-50/50 dark:bg-slate-950 focus:ring-1 focus:ring-indigo-600/20 transition-all text-xs"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-[10px] text-rose-500 font-bold ml-1">
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setActiveSubView("profile-info")}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all bg-white dark:bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={authLoading}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 disabled:cursor-not-allowed hover:shadow-md hover:shadow-indigo-100 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                {authLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20 border-t-white animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CATEGORIES — now at /admin/categories */}
      {false && <Navigate to="/categories" replace />}

      {/* PRODUCTS — now at /admin/products */}
      {false && <Navigate to="/products" replace />}

      {/* ORDERS — now at /admin/orders */}
      {false && <Navigate to="/orders" replace />}

      {/* PAYMENTS — now at /admin/payments */}
      {false && (
        <div className="flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-slate-200 flex-1 min-h-0">
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 lg:p-8 shadow-xs flex-shrink-0">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
              Admin Payment & Refund Ledger
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-3">
              Monitor sales revenue flow, cancellations, and processed customer
              refunds across the application.
            </p>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-shrink-0">
            {/* Card 1: Total Sales Revenue */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg shrink-0">
                ₹
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  Total Sales Volume
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  ₹{adminTotalSales.toLocaleString("en-IN")}
                </h3>
              </div>
            </div>

            {/* Card 2: Refunded Money */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center font-black text-lg shrink-0">
                ₹
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  Refunds Processed
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  ₹{adminRefundedMoney.toLocaleString("en-IN")}
                </h3>
              </div>
            </div>

            {/* Card 3: Returned Products */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4.5">
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  Returned Items
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  {adminReturnedProductsCount} Items
                </h3>
              </div>
            </div>
          </div>

          {/* Refund ledger */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 lg:p-8 shadow-xs flex-1 min-h-0 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-6 pb-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              Customer Refund Ledger
            </h4>

            {adminRefundedOrders.length === 0 ? (
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center gap-3">
                <svg
                  className="w-10 h-10 text-slate-300 dark:text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-300">
                  No cancellation/refund transactions found
                </p>
                <p className="text-xs">
                  No orders have been cancelled or returned yet.
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 min-h-0 border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-xs relative">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10">
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Order Reference</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Item Details</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Refund Amount</th>
                      <th className="py-3 px-4 text-center">Refund Status</th>
                      <th className="py-3 px-4 text-center">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {adminRefundedOrders.map((ord) => {
                      const prodTitle =
                        ord.product?.name ||
                        ord.product?.title ||
                        "System Product";
                      const customerEmail =
                        ord.user?.email || "customer@gmail.com";
                      const customerName =
                        ord.user?.name || customerEmail.split("@")[0];
                      const dateStr = ord.createdAt
                        ? new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—";

                      return (
                        <tr
                          key={ord._id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors"
                        >
                          <td className="py-4 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                            #{ord._id}
                          </td>
                          <td className="py-4 px-4">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                                {customerName}
                              </p>
                              <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                {customerEmail}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="min-w-0">
                              <p
                                className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]"
                                title={prodTitle}
                              >
                                {prodTitle}
                              </p>
                              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                                Qty: {ord.quantity || 1}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                            {dateStr}
                          </td>
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-450 font-bold uppercase">
                            {ord.paymentMethod || "UPI"}
                          </td>
                          <td className="py-4 px-4 font-black text-slate-900 dark:text-slate-100">
                            ₹{(ord.totalPrice || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Refunded
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 rounded-xl transition-all cursor-pointer"
                              title="View Order Details"
                            >
                              <Icons.Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {viewUser && (
        <Modal title="User Account Dossier" onClose={() => setViewUser(null)}>
          <div className="flex flex-col items-center gap-4 text-xs text-slate-800 dark:text-slate-200">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-350 font-black flex items-center justify-center border border-slate-200 dark:border-slate-700 text-2xl shadow-xs overflow-hidden shrink-0">
              {getProfileImageUrl(viewUser.profileImage) ? (
                <img
                  src={getProfileImageUrl(viewUser.profileImage)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                (viewUser.username || viewUser.name || viewUser.email || "U")
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div className="w-full flex flex-col gap-4 mt-2">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-800/60 rounded-xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                  Account Name
                </span>
                <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mt-0.5">
                  {viewUser.username || viewUser.name || "—"}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-800/60 rounded-xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                  Email Address
                </span>
                <p className="font-extrabold text-slate-850 dark:text-slate-200 text-xs mt-0.5 select-all">
                  {viewUser.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                    Account Role
                  </span>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400 capitalize mt-0.5">
                    {viewUser.role || "user"}
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                    Account ID
                  </span>
                  <p
                    className="font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate select-all"
                    title={viewUser._id || viewUser.id}
                  >
                    {(viewUser._id || viewUser.id || "—").substring(0, 8)}...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Order Detail Modal popup */}
      {selectedOrder && (
        <Modal
          title="Detailed Order Information"
          onClose={() => setSelectedOrder(null)}
        >
          <div className="flex flex-col gap-5 text-xs text-slate-800 dark:text-slate-200">
            {/* ID & Date */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  Order Reference ID
                </span>
                <p className="font-bold text-slate-700 dark:text-slate-200 break-all">
                  {selectedOrder._id || selectedOrder.id}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  Purchase Date
                </span>
                <p className="font-bold text-slate-700 dark:text-slate-200">
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )
                    : "—"}
                </p>
              </div>
            </div>

            {/* Product purchased */}
            <div>
              <span className="block font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[9px] mb-2.5">
                Purchased Item
              </span>
              <div className="flex gap-3 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {getFirstProductImage(selectedOrder.product?.images) ||
                selectedOrder.product?.image ? (
                  <img
                    src={
                      getFirstProductImage(selectedOrder.product?.images) ||
                      resolveOrPlaceholder(selectedOrder.product?.image)
                    }
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-300 flex items-center justify-center font-bold shrink-0 text-xl">
                    🛍️
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                    {selectedOrder.product?.name ||
                      selectedOrder.product?.title ||
                      "Meesho Item"}
                  </h4>
                  <p className="text-[10px] text-[#0466c8] dark:text-indigo-400 font-bold mt-0.5">
                    {selectedOrder.product?.category?.name ||
                      "General Category"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    ₹{selectedOrder.product?.price || selectedOrder.totalPrice}
                  </p>
                </div>
              </div>
            </div>

            {/* Total invoice & payment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                  Payment Gateway
                </span>
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm mt-0.5">
                  {selectedOrder.paymentMethod || "UPI"}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                  Total Invoice Paid
                </span>
                <p className="font-black text-slate-800 dark:text-slate-100 text-sm mt-0.5">
                  ₹{(selectedOrder.totalPrice || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
