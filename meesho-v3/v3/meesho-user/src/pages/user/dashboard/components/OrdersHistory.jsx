import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { firstOrPlaceholder, PLACEHOLDER_IMAGE, getFirstProductImage } from '../../../../utils/imageUrl';
import { cancelUserOrder, returnUserOrder, fetchMyOrders } from "../../../../redux/slices/userSlice";

const statusConfig = {
  pending:   { label: "Pending",   color: "amber",   icon: "⏳", step: 1 },
  confirmed: { label: "Confirmed", color: "blue",    icon: "✅", step: 2 },
  shipped:   { label: "Shipped",   color: "indigo",  icon: "🚚", step: 3 },
  delivered: { label: "Delivered", color: "emerald", icon: "🎉", step: 4 },
  cancelled: { label: "Cancelled", color: "rose",    icon: "❌", step: 0 },
  returned:  { label: "Returned",  color: "orange",  icon: "↩️", step: 0 },
  return_requested: { label: "Return Pending", color: "orange", icon: "🔄", step: 0 },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  const colorMap = {
    amber:   "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/10",
    blue:    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/10",
    indigo:  "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/10",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border-emerald-500/10",
    rose:    "bg-rose-500/10 text-rose-750 dark:text-rose-400 border-rose-500/10",
    orange:  "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/10",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${colorMap[cfg.color]}`}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
};

export default function OrdersHistory() {
  const dispatch = useAppDispatch();
  const { orders, isLoading: userLoading } = useAppSelector((s) => s.user);
  
  const [syncDb, setSyncDb] = useState({ balances: { user: 5000 }, orders: {} });

  const fetchSyncDb = async () => {
    try {
      const res = await fetch('/api/sync-returns');
      if (res.ok) {
        const data = await res.json();
        setSyncDb(data);
      }
    } catch (e) {
      console.error("Failed to fetch return status overlays", e);
    }
  };

  useEffect(() => {
    fetchSyncDb();
  }, []);

  const handleCancelOrder = async (orderId) => {
    await dispatch(cancelUserOrder(orderId));
    dispatch(fetchMyOrders());
  };

  const handleReturnOrder = async (orderId, totalPrice) => {
    try {
      const orderOverlay = {
        status: "return_requested",
        refundMethod: "Bank Transfer",
        refundAmount: totalPrice,
        updatedAt: new Date().toISOString()
      };
      
      await fetch('/api/sync-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orders: {
            [orderId]: orderOverlay
          }
        })
      });
      
      fetchSyncDb();
      dispatch(fetchMyOrders());
    } catch (e) {
      console.error("Failed to request return", e);
    }
  };

  const mergedOrders = (orders || []).map(ord => {
    const overlay = syncDb.orders?.[ord._id];
    const finalStatus = overlay?.status || ord.orderStatus || ord.status || "pending";
    return {
      ...ord,
      orderStatus: finalStatus
    };
  });

  const totalSpent = mergedOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  const activeOrders = mergedOrders.filter(o => !["cancelled","returned","delivered","return_requested"].includes(o.orderStatus)).length;

  return (
    <div className="animate-fade-in text-slate-805 dark:text-slate-200 max-w-6xl mx-auto px-1 pb-12">
      {/* Header + Stats */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 p-6 lg:p-8 mb-8 shadow-xs">
        <div className="flex items-center gap-4.5 mb-8 pb-6 border-b border-slate-100 dark:border-slate-850">
          <div className="w-12 h-12 bg-gradient-to-br from-[#9F2089] to-[#c0399f] rounded-2xl flex items-center justify-center text-white text-xl shadow-md shadow-pink-500/10 shrink-0">
            📦
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-850 dark:text-white tracking-tight">My Orders</h3>
            <p className="text-xs text-slate-450 dark:text-slate-500 font-bold mt-0.5">Track and manage your order history</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4.5">
          {[
            { label: "Total Orders", value: mergedOrders.length, icon: "🛍️", color: "indigo" },
            { label: "Active Orders", value: activeOrders, icon: "🚚", color: "amber" },
            { label: "Total Spent", value: `₹${totalSpent}`, icon: "💰", color: "emerald" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-4.5 text-center border border-slate-100 dark:border-slate-850 hover:shadow-2xs transition-shadow duration-200">
              <div className="text-2xl mb-1.5">{s.icon}</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">{s.value}</div>
              <div className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 p-6 lg:p-8 shadow-xs">
        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 pb-4 border-b border-slate-100 dark:border-slate-850">
          Purchase History
        </h4>

        {userLoading && mergedOrders.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-2 border-[#9F2089]/25 border-t-[#9F2089] rounded-full animate-spin mx-auto mb-4" />
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold">Loading your orders...</span>
          </div>
        ) : mergedOrders.length === 0 ? (
          <div className="py-24 text-center max-w-sm mx-auto flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-4xl shadow-2xs">
              📋
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-extrabold text-base text-slate-805 dark:text-slate-200">No orders yet!</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">Your purchase history and deliveries will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {mergedOrders.map((ord) => (
              <div
                key={ord._id}
                className="border border-slate-150 dark:border-slate-850 rounded-3xl p-5 hover:border-[#9F2089]/20 hover:shadow-xs transition-all duration-300 bg-white dark:bg-slate-900"
              >
                {/* Top Row */}
                <div className="flex items-start gap-5">
                  {getFirstProductImage(ord.product?.images) ? (
                    <img
                      src={firstOrPlaceholder(ord.product?.images)}
                      alt=""
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-950 text-3xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-850">
                      🛍️
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white line-clamp-1 leading-snug">
                          {ord.product?.title || "E-Commerce Product"}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wider uppercase mt-1">
                          Order #{ord._id?.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <StatusBadge status={ord.orderStatus} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3.5 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        Qty: <strong className="text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px] font-bold">{ord.quantity}</strong>
                      </span>
                      <span>
                        Total: <strong className="text-[#9F2089] dark:text-pink-400 font-black">₹{ord.totalPrice}</strong>
                      </span>
                      {ord.createdAt && (
                        <span className="text-[10px] text-slate-405 dark:text-slate-550 font-bold">
                          Ordered on: {new Date(ord.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress + Cancel Actions */}
                <div className="mt-5 pt-4.5 border-t border-slate-100 dark:border-slate-850/80 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-xs">
                    {ord.orderStatus !== "cancelled" && ord.orderStatus !== "returned" && ord.orderStatus !== "return_requested" && (
                      <div className="flex items-center gap-2.5 flex-wrap py-1">
                        {["Confirmed","Shipped","Delivered"].map((s, i) => {
                          const stepNum = i + 2;
                          const cfg = statusConfig[ord.orderStatus] || statusConfig.pending;
                          const done = cfg.step >= stepNum;
                          return (
                            <div key={s} className="flex items-center gap-1.5">
                              <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[9px] font-black transition-colors ${
                                done ? "bg-[#9F2589] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-650"
                              }`}>
                                {done ? "✓" : i + 1}
                              </div>
                              <span className={`text-[10px] font-extrabold ${done ? "text-[#9F2089] dark:text-pink-400" : "text-slate-400 dark:text-slate-600"}`}>{s}</span>
                              {i < 2 && <div className={`w-6 sm:w-10 h-0.5 rounded-full ${done && cfg.step > stepNum ? "bg-[#9F2089]" : "bg-slate-100 dark:bg-slate-800"}`} />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {ord.orderStatus !== "cancelled" && ord.orderStatus !== "delivered" && ord.orderStatus !== "returned" && ord.orderStatus !== "return_requested" && (
                    <button
                      onClick={() => handleCancelOrder(ord._id)}
                      className="shrink-0 px-4.5 py-2.5 border border-rose-200 dark:border-rose-900 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-455 text-[10px] font-black rounded-2xl transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                    >
                      Cancel Order
                    </button>
                  )}

                  {ord.orderStatus === "delivered" && (
                    <button
                      onClick={() => handleReturnOrder(ord._id, ord.totalPrice)}
                      className="shrink-0 px-4.5 py-2.5 border border-orange-200 dark:border-orange-900 bg-orange-500/5 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black rounded-2xl transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                    >
                      Return Order
                    </button>
                  )}

                  {ord.orderStatus === "return_requested" && (
                    <span className="shrink-0 px-4 py-2 border border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-[10px] font-black rounded-2xl uppercase tracking-wider animate-pulse">
                      Waiting for Admin Approval (Refund via Bank Transfer)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
