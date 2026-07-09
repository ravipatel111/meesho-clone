import { useState, useEffect } from "react";
import { firstOrPlaceholder, resolveOrPlaceholder, PLACEHOLDER_IMAGE } from '../../../utils/imageUrl';
import { useSearchParams, useOutletContext } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
} from "../../../redux/slices/adminSlice";

const Icons = {
  Search: ({ className = "w-4 h-4" }) => (
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
  Close: ({ className = "w-5 h-5" }) => (
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
  ShoppingBag: ({ className = "w-8 h-8" }) => (
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
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  ),
  Truck: ({ className = "w-5 h-5" }) => (
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
        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
      />
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
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
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  AlertCircle: ({ className = "w-5 h-5" }) => (
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
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 dark:border-slate-800 my-8">
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 rounded-t-2xl z-10">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
          >
            <Icons.Close />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[75vh]">{children}</div>
      </div>
    </div>
  );
}

function ImageModal({ images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") {
        if (images.length > 1) handleNext();
      } else if (e.key === "ArrowLeft") {
        if (images.length > 1) handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-zoom-out animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center group"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt="Product Preview"
          className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-slate-800 transition-all duration-300"
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-white transition-all cursor-pointer text-xs font-bold"
        >
          Close ×
        </button>
      </div>
    </div>
  );
}

const getProfileImageUrl = (img) => resolveOrPlaceholder(img);

export default function AdminOrders() {
  const _ordersContext = useOutletContext() || {};
  const showToast = typeof _ordersContext.showToast === "function" ? _ordersContext.showToast : () => {};
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const {
    orders: storeOrders,
    isLoading,
    error,
  } = useAppSelector((s) => s.admin);

  const [zoomedImage, setZoomedImage] = useState(null);

  // Search parameters for navigation tab & status filters
  const [searchParams] = useSearchParams();
  const initialStatusFilter = searchParams.get("status") || "all";

  const [localOrders, setLocalOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [syncDb, setSyncDb] = useState({ balances: { admin: 120000, user: 5000 }, orders: {} });

  const fetchSyncDb = async () => {
    try {
      const res = await fetch('/api/sync-returns');
      if (res.ok) {
        const data = await res.json();
        setSyncDb(data);
      }
    } catch (e) {
      console.error("Failed to fetch synced payments/refunds", e);
    }
  };

  useEffect(() => {
    fetchSyncDb();
  }, []);

  const handleApproveReturn = async (orderId, amount) => {
    try {
      const userBal = syncDb.balances?.user ?? 5000;
      const adminBal = syncDb.balances?.admin ?? 120000;

      const newUserBal = userBal + amount;
      const newAdminBal = adminBal - amount;

      if (!orderId.toString().startsWith("mock-")) {
        try {
          await dispatch(updateAdminOrderStatus({ orderId, status: "returned" })).unwrap();
        } catch (e) {
          console.warn("Backend order update failed, proceeding with local overlay sync", e);
        }
      }

      await fetch('/api/sync-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          balances: {
            user: newUserBal,
            admin: newAdminBal
          },
          orders: {
            [orderId]: {
              status: "returned",
              refundMethod: "Bank Transfer",
              refundAmount: amount,
              updatedAt: new Date().toISOString()
            }
          }
        })
      });

      showToast("Return request approved! Refund processed via Bank Transfer.", "success");
      fetchSyncDb();
    } catch (e) {
      console.error(e);
      showToast("Failed to approve return request", "error");
    }
  };

  const handleRejectReturn = async (orderId) => {
    try {
      if (!orderId.toString().startsWith("mock-")) {
        try {
          await dispatch(updateAdminOrderStatus({ orderId, status: "delivered" })).unwrap();
        } catch (e) {
          console.warn(e);
        }
      }

      await fetch('/api/sync-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orders: {
            [orderId]: {
              status: "delivered",
              updatedAt: new Date().toISOString()
            }
          }
        })
      });

      showToast("Return request rejected.", "success");
      fetchSyncDb();
    } catch (e) {
      console.error(e);
      showToast("Failed to reject return request", "error");
    }
  };

  // Keep internal filter in sync if URL parameter changes
  useEffect(() => {
    setStatusFilter(searchParams.get("status") || "all");
  }, [searchParams]);

  useEffect(() => {
    if (storeOrders.length === 0) {
      dispatch(fetchAdminOrders());
    }
  }, [dispatch, storeOrders.length]);

  // Synchronize orders with fallback mock orders if backend list is empty
  useEffect(() => {
    if (storeOrders && storeOrders.length > 0) {
      setLocalOrders(storeOrders);
    } else {
      setLocalOrders([
        {
          _id: "mock-1",
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          user: { email: "rahul.sharma@gmail.com", name: "Rahul Sharma" },
          product: {
            title: "Designer Silk Saree",
            price: 1850,
            images: [
              {
                url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200",
              },
            ],
            category: { name: "Ethnic Wear" },
          },
          quantity: 1,
          totalPrice: 1850,
          orderStatus: "delivered",
          paymentMethod: "UPI",
          shippingAddress: {
            fullName: "Rahul Sharma",
            mobile: "9876543210",
            addressLine: "Flat 402, Block B, Silver Heights",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
            addressType: "Home",
          },
        },
        {
          _id: "mock-2",
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          user: { email: "priya.patel@yahoo.com", name: "Priya Patel" },
          product: {
            title: "Cotton Kurti Set",
            price: 950,
            images: [
              {
                url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=200",
              },
            ],
            category: { name: "Ethnic Wear" },
          },
          quantity: 1,
          totalPrice: 950,
          orderStatus: "shipped",
          paymentMethod: "CARD",
          shippingAddress: {
            fullName: "Priya Patel",
            mobile: "9123456789",
            addressLine: "Sector 15, Vashi, House 23",
            city: "Navi Mumbai",
            state: "Maharashtra",
            pincode: "400703",
            addressType: "Work",
          },
        },
        {
          _id: "mock-3",
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          user: { email: "amit.kumar@outlook.com", name: "Amit Kumar" },
          product: {
            title: "Men's Slim Fit Shirt",
            price: 1200,
            images: [
              {
                url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200",
              },
            ],
            category: { name: "Men's Fashion" },
          },
          quantity: 2,
          totalPrice: 2400,
          orderStatus: "pending",
          paymentMethod: "UPI",
          shippingAddress: {
            fullName: "Amit Kumar",
            mobile: "7778889990",
            addressLine: "G-12, Green Park Extension",
            city: "New Delhi",
            state: "Delhi",
            pincode: "110016",
            addressType: "Home",
          },
        },
        {
          _id: "mock-4",
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          user: { email: "sneha.reddy@gmail.com", name: "Sneha Reddy" },
          product: {
            title: "Silver Jhumka Earrings",
            price: 450,
            images: [
              {
                url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=200",
              },
            ],
            category: { name: "Accessories" },
          },
          quantity: 1,
          totalPrice: 450,
          orderStatus: "delivered",
          paymentMethod: "UPI",
          shippingAddress: {
            fullName: "Sneha Reddy",
            mobile: "9988776655",
            addressLine: "Jubilee Hills, Road No 36, Appt 5A",
            city: "Hyderabad",
            state: "Telangana",
            pincode: "500033",
            addressType: "Home",
          },
        },
        {
          _id: "mock-5",
          createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
          user: { email: "vicky.singh@gmail.com", name: "Vicky Singh" },
          product: {
            title: "Wireless Earbuds",
            price: 2100,
            images: [
              {
                url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=200",
              },
            ],
            category: { name: "Electronics" },
          },
          quantity: 1,
          totalPrice: 2100,
          orderStatus: "cancelled",
          paymentMethod: "UPI",
          shippingAddress: {
            fullName: "Vicky Singh",
            mobile: "8887776665",
            addressLine: "22-A, Ring Road, Lajpat Nagar",
            city: "New Delhi",
            state: "Delhi",
            pincode: "110024",
            addressType: "Work",
          },
        },
      ]);
    }
  }, [storeOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (orderId.toString().startsWith("mock-")) {
      setLocalOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o,
        ),
      );
      showToast(
        "Order status updated successfully (Local Demo Mode)!",
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

  // Status badge style helper
  const statusColor = (s) =>
    ({
      delivered:
        "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30",
      pending:
        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30",
      shipped:
        "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30",
      cancelled:
        "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30",
      returned:
        "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30",
      return_requested:
        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 animate-pulse",
    })[s] ||
    "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800";

  const mergedOrders = localOrders.map(ord => {
    const overlay = syncDb.orders?.[ord._id];
    const finalStatus = overlay?.status || ord.orderStatus || ord.status || "pending";
    return {
      ...ord,
      orderStatus: finalStatus
    };
  });

  // Multi-parameter filtering (Search query + status tab filter)
  const filteredOrders = mergedOrders.filter((ord) => {
    const oId = ord._id || "";
    const email = ord.user?.email || ord.shippingAddress?.email || "";
    const name = ord.user?.name || ord.shippingAddress?.fullName || "";
    const title = ord.product?.title || ord.product?.name || "";
    const matchesSearch =
      oId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (ord.orderStatus || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate high-level order statistics
  const totalRevenue = mergedOrders
    .filter((o) => o.orderStatus !== "cancelled" && o.orderStatus !== "returned")
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  const pendingCount = mergedOrders.filter(
    (o) => o.orderStatus === "pending",
  ).length;
  const returnRequestCount = mergedOrders.filter(
    (o) => o.orderStatus === "return_requested",
  ).length;
  const shippedCount = mergedOrders.filter(
    (o) => o.orderStatus === "shipped",
  ).length;
  const deliveredCount = mergedOrders.filter(
    (o) => o.orderStatus === "delivered",
  ).length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-slate-200 flex-1 min-h-0">
      {/* Admin Company Bank Balance Widget */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-6 text-white border border-indigo-950 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 flex-shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-xl -translate-y-8 translate-x-8" />
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">Meesho Admin Merchant Account Balance</span>
          <h2 className="text-3xl font-black mt-1">₹{(syncDb.balances?.admin ?? 120000).toLocaleString('en-IN')}</h2>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Payouts and return refunds are debited directly from this **merchant bank account**</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-400/20 px-4 py-3 rounded-2xl flex items-center gap-3 shrink-0 self-start md:self-auto">
          <span className="text-xl">🏦</span>
          <div className="text-left font-sans">
            <p className="text-[9px] font-black uppercase text-indigo-300">ICICI Bank Ltd</p>
            <p className="text-xs font-bold font-mono">•••• •••• 9924</p>
          </div>
        </div>
      </div>

      {/* High-level Sales Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 flex-shrink-0">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            ₹
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Total Sales Volume
            </span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Icons.AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Pending Orders
            </span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {pendingCount} Queue
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Icons.Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              In-Transit Delivery
            </span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {shippedCount} Shipped
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 flex items-center justify-center">
            <Icons.CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Delivered Orders
            </span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {deliveredCount} Completed
            </h3>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Name, or Product..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-all shadow-xs"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <Icons.Search />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-max border border-slate-200/50 dark:border-slate-800 self-end sm:self-auto overflow-x-auto max-w-full">
          {["all", "pending", "shipped", "delivered", "cancelled", "return_requested", "returned"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                statusFilter === st
                  ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-455 hover:text-slate-850 dark:hover:text-slate-250"
              }`}
            >
              {st === "return_requested" ? "Return Requests" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Order List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-auto shadow-xs flex-1 min-h-[320px]">
        <table className="w-full text-left border-collapse text-xs relative">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
            <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-4 px-5">Order ID</th>
              <th className="py-4 px-5">Date</th>
              <th className="py-4 px-5">Customer</th>
              <th className="py-4 px-5">Product Purchase</th>
              <th className="py-4 px-5">Total Value</th>
              {user?.adminRole === "superadmin" && <th className="py-4 px-5">Admin</th>}
              <th className="py-4 px-5 text-center">Status</th>
              <th className="py-4 px-5 text-center">Manage Status</th>
              <th className="py-4 px-5 text-center">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {isLoading && filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={user?.adminRole === "superadmin" ? 9 : 8}
                  className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold"
                >
                  Loading sales database...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={user?.adminRole === "superadmin" ? 9 : 8}
                  className="py-16 text-center text-slate-400 dark:text-slate-500 font-bold"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Icons.ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-650" />
                    <span>No orders found matching your selection.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => {
                const ordId = ord._id || "";
                const displayId = ordId.startsWith("mock-")
                  ? ordId
                  : `#${ordId.substring(0, 8)}...`;
                const dateStr = ord.createdAt
                  ? new Date(ord.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—";

                const customerEmail =
                  ord.user?.email ||
                  ord.shippingAddress?.email ||
                  "customer@meesho.com";
                const customerName =
                  ord.user?.name ||
                  ord.shippingAddress?.fullName ||
                  "Customer Name";

                const prodTitle =
                  ord.product?.title || ord.product?.name || "Meesho Product";
                const prodImg = firstOrPlaceholder(ord.product?.images) || null;

                return (
                  <tr
                    key={ordId}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors"
                  >
                    <td
                      className="py-4.5 px-5 font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[100px]"
                      title={ordId}
                    >
                      {displayId}
                    </td>
                    <td className="py-4.5 px-5 text-slate-500 dark:text-slate-450 font-medium whitespace-nowrap">
                      {dateStr}
                    </td>
                    <td className="py-4.5 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold flex items-center justify-center text-[10px] overflow-hidden shrink-0">
                          {getProfileImageUrl(ord.user?.profileImage) ? (
                            <img
                              src={getProfileImageUrl(ord.user?.profileImage)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            customerName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-800 dark:text-slate-200 font-bold">
                            {customerName}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 text-[9px]">
                            {customerEmail}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5 px-5">
                      <div className="flex items-center gap-3">
                        {prodImg && (
                          <img
                            src={prodImg}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-slate-100 dark:border-slate-800"
                          />
                        )}
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                          {prodTitle}
                        </span>
                      </div>
                    </td>
                    <td className="py-4.5 px-5 font-black text-slate-800 dark:text-slate-100">
                      ₹{ord.totalPrice.toLocaleString("en-IN")}
                    </td>
                    {user?.adminRole === "superadmin" && (
                      <td className="py-4.5 px-5 text-slate-500 dark:text-slate-400 font-semibold">
                        {ord.seller?.name || "SuperAdmin"}
                      </td>
                    )}
                    <td className="py-4.5 px-5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${statusColor(ord.orderStatus)}`}
                      >
                        {ord.orderStatus ? ord.orderStatus.replace('_', ' ') : 'pending'}
                      </span>
                    </td>
                    <td className="py-4.5 px-5 text-center">
                      {ord.orderStatus === "return_requested" ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleApproveReturn(ordId, ord.totalPrice)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase px-2 py-1 rounded transition-colors shadow-xs hover:shadow-md cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectReturn(ordId)}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-black uppercase px-2 py-1 rounded transition-colors shadow-xs hover:shadow-md cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <select
                          value={ord.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(ordId, e.target.value)
                          }
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer hover:border-indigo-500 focus:border-indigo-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="returned">Returned</option>
                        </select>
                      )}
                    </td>
                    <td className="py-4.5 px-5 text-center">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-bold underline decoration-indigo-200 underline-offset-4"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <Modal
          title="Detailed Order Information"
          onClose={() => setSelectedOrder(null)}
        >
          <div className="flex flex-col gap-5 text-xs">
            {/* ID & Date */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  Order Reference ID
                </span>
                <p className="font-bold text-slate-700 dark:text-slate-200 break-all">
                  {selectedOrder._id}
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
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "—"}
                </p>
              </div>
            </div>

            {/* Product purchased */}
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-350 uppercase tracking-widest text-[9px] mb-2.5">
                Purchased Item
              </span>
              <div className="flex gap-3 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {firstOrPlaceholder(selectedOrder.product?.images) ? (
                  <img
                    src={firstOrPlaceholder(selectedOrder.product.images)}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover border border-slate-100 dark:border-slate-800 shrink-0 cursor-zoom-in hover:opacity-90 transition-all"
                    onClick={() =>
                      setZoomedImage({
                        images: selectedOrder.product.images?.length > 0 ? selectedOrder.product.images.map(resolveOrPlaceholder) : [firstOrPlaceholder(selectedOrder.product.images)],
                        initialIndex: 0
                      })
                    }
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-300 flex items-center justify-center font-bold shrink-0 text-xl">
                    🛍️
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                    {selectedOrder.product?.title ||
                      selectedOrder.product?.name ||
                      "Meesho Item"}
                  </h4>
                  <p className="text-[10px] text-[#0466c8] dark:text-indigo-400 font-bold mt-0.5">
                    {selectedOrder.product?.category?.name ||
                      "General Category"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    ₹
                    {selectedOrder.product?.price ||
                      selectedOrder.totalPrice / selectedOrder.quantity}{" "}
                    x {selectedOrder.quantity} Qty
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
                  ₹{selectedOrder.totalPrice.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-350 uppercase tracking-widest text-[9px] mb-2.5">
                Shipping Details
              </span>
              {selectedOrder.shippingAddress ? (
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-slate-850 dark:text-slate-200">
                      {selectedOrder.shippingAddress.fullName}
                    </span>
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold text-[8px] px-1.5 py-0.5 rounded capitalize">
                      {selectedOrder.shippingAddress.addressType || "Home"}
                    </span>
                  </div>
                  <p className="text-[11px]">
                    {selectedOrder.shippingAddress.addressLine}
                  </p>
                  <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.state} -{" "}
                    {selectedOrder.shippingAddress.pincode}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2">
                    Mobile Contact: {selectedOrder.shippingAddress.mobile}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 dark:text-slate-500">
                  No custom shipping address specified. Registered customer
                  checkout.
                </p>
              )}
            </div>

            {/* Status Visual Timeline */}
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-350 uppercase tracking-widest text-[9px] mb-3">
                Order Status Progression
              </span>
              <div className="flex justify-between items-center text-center relative px-2.5">
                {/* Connector line */}
                <div className="absolute top-3 left-6 right-6 h-0.5 bg-slate-100 dark:bg-slate-800 -z-10" />

                {[
                  { key: "pending", label: "Processing" },
                  { key: "shipped", label: "Shipped" },
                  { key: "delivered", label: "Delivered" },
                ].map((step, idx) => {
                  const states = ["pending", "shipped", "delivered"];
                  const currentIdx = states.indexOf(selectedOrder.orderStatus);
                  const isDone =
                    states.indexOf(step.key) <= currentIdx &&
                    selectedOrder.orderStatus !== "cancelled";
                  const isCurrent = step.key === selectedOrder.orderStatus;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className={`w-6.5 h-6.5 rounded-full flex items-center justify-center font-bold text-[10px] border-2 transition-all ${
                          isCurrent
                            ? "bg-indigo-600 border-indigo-600 text-white scale-110 shadow-md shadow-indigo-900/40"
                            : isDone
                              ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {isDone && !isCurrent ? "✓" : idx + 1}
                      </div>
                      <span
                        className={`text-[9px] font-bold mt-1.5 capitalize ${
                          isCurrent
                            ? "text-indigo-600 dark:text-indigo-400"
                            : isDone
                              ? "text-slate-700 dark:text-slate-300"
                              : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedOrder.orderStatus === "cancelled" && (
                <div className="mt-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100/30 dark:border-rose-900/30 text-rose-800 dark:text-rose-455 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                  <Icons.AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-semibold text-[10px]">
                    This order has been cancelled and deleted from the delivery
                    queue.
                  </span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <ImageModal 
          images={zoomedImage.images || [typeof zoomedImage === 'string' ? zoomedImage : zoomedImage.url]} 
          initialIndex={zoomedImage.initialIndex || 0} 
          onClose={() => setZoomedImage(null)} 
        />
      )}
    </div>
  );
}
