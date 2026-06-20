import { useState, useEffect } from "react";
import { useAppSelector } from "../../../../redux/hooks";
import { getFirstProductImage, firstOrPlaceholder } from '../../../../utils/imageUrl';

export default function UserPayments() {
  const { orders } = useAppSelector((s) => s.user);
  
  const [syncDb, setSyncDb] = useState({ balances: { user: 5000 }, orders: {}, transactions: [] });

  useEffect(() => {
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
    fetchSyncDb();
  }, []);

  const mergedOrders = (orders || []).map(ord => {
    const overlay = syncDb.orders?.[ord._id];
    const finalStatus = overlay?.status || ord.orderStatus || ord.status || "pending";
    return {
      ...ord,
      orderStatus: finalStatus
    };
  });

  const refundedOrders = mergedOrders.filter(
    (ord) => ord.orderStatus === "cancelled" || ord.orderStatus === "returned" || ord.orderStatus === "return_requested"
  );
  
  const refundedMoney = mergedOrders
    .filter(ord => ord.orderStatus === "returned")
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
    
  const returnedProductsCount = mergedOrders
    .filter(ord => ord.orderStatus === "returned")
    .reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    
  const totalSpent = (orders || []).reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const walletBalance = syncDb.balances?.user ?? 5000;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 lg:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#9F2089] to-[#c0399f] rounded-2xl flex items-center justify-center text-white text-lg">
            💳
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Payment & Refunds</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Track your transactions and refunds</p>
          </div>
        </div>
      </div>

      {/* Simulated Bank Balance Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white border border-indigo-800/40 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl -translate-y-8 translate-x-8" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">Linked Bank Account Balance</span>
            <h2 className="text-3xl font-black mt-1">₹{walletBalance.toLocaleString('en-IN')}</h2>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Automatic refunds route directly via **Bank Transfer** (Local Demo)</p>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-400/20 px-4 py-3 rounded-2xl flex items-center gap-3 shrink-0">
            <span className="text-xl">🏦</span>
            <div className="text-left font-sans">
              <p className="text-[9px] font-black uppercase text-indigo-300">State Bank of India</p>
              <p className="text-xs font-bold font-mono">•••• •••• 4821</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Spent",
            value: `₹${totalSpent}`,
            icon: "💸",
            desc: "Lifetime purchases",
            gradient: "from-violet-500 to-purple-600",
          },
          {
            label: "Refunded",
            value: `₹${refundedMoney}`,
            icon: "🔄",
            desc: "Money returned",
            gradient: "from-emerald-500 to-teal-600",
          },
          {
            label: "Returns",
            value: `${returnedProductsCount}`,
            icon: "📦",
            desc: "Products returned",
            gradient: "from-rose-500 to-pink-600",
          },
          {
            label: "Claims",
            value: refundedOrders.length,
            icon: "📋",
            desc: "Total claims filed",
            gradient: "from-amber-500 to-orange-600",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative group hover:shadow-md transition-all"
          >
            <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${card.gradient} opacity-5 rounded-full group-hover:opacity-10 transition-opacity`} />
            <div className="text-3xl mb-3">{card.icon}</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mb-0.5">{card.value}</div>
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">{card.label}</div>
            <div className="text-[9px] text-slate-300 dark:text-slate-650 mt-0.5 font-medium">{card.desc}</div>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 lg:p-8 shadow-sm">
        <h4 className="text-xs font-black text-slate-805 dark:text-white uppercase tracking-widest mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          Refund & Cancellation History
        </h4>

        {refundedOrders.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-full flex items-center justify-center text-4xl">
              ✅
            </div>
            <p className="font-black text-base text-slate-800 dark:text-slate-200">No refunds or cancellations</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">All your orders are in good standing!</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-left border-collapse text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider text-[9px]">
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {refundedOrders.map((ord) => {
                  const prodTitle = ord.product?.title || "Product";
                  const prodImg = getFirstProductImage(ord.product?.images) || firstOrPlaceholder(ord.product?.images);
                  const dateStr = ord.createdAt
                    ? new Date(ord.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                    : "—";
                  
                  const isReturn = ord.orderStatus === "returned" || ord.orderStatus === "return_requested";

                  return (
                    <tr key={ord._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {prodImg ? (
                            <img src={prodImg} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0" />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">🛍️</div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">{prodTitle}</p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Qty: {ord.quantity}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-[#9F2089] dark:text-pink-400 font-mono text-[10px] bg-[#9F2089]/5 px-2 py-1 rounded-lg">
                          #{ord._id?.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{dateStr}</td>
                      <td className="py-4 px-4">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black uppercase text-[9px] px-2.5 py-1 rounded-lg">
                          {isReturn ? "Bank Transfer" : (ord.paymentMethod || "UPI")}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm">₹{ord.totalPrice}</td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          {ord.orderStatus === "return_requested" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/40 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Pending Approval
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Refunded
                            </span>
                          )}
                        </div>
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
}
