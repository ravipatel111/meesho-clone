import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { fetchAdminOrders } from "../../../redux/slices/adminSlice";
import { useOutletContext } from "react-router-dom";

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const Icons = {
  Eye: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Close: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 dark:border-slate-800 my-8 text-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 rounded-t-2xl z-10">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer">
            <Icons.Close />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[75vh]">{children}</div>
      </div>
    </div>
  );
}

const MOCK_ORDERS = [
  { _id: "mock-1", createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), user: { email: "rahul.sharma@gmail.com", name: "Rahul Sharma" }, product: { name: "Designer Silk Saree", category: { name: "Ethnic Wear" } }, totalPrice: 1850, orderStatus: "delivered" },
  { _id: "mock-5", createdAt: new Date(Date.now() - 3600000 * 30).toISOString(), user: { email: "vicky.singh@gmail.com", name: "Vicky Singh" }, product: { name: "Wireless Earbuds", category: { name: "Electronics" } }, totalPrice: 2100, orderStatus: "cancelled" },
];

export default function AdminPayments() {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useOutletContext();

  const { orders, isLoading } = useAppSelector((s) => s.admin);
  const { user } = useAppSelector((s) => s.auth);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const localOrders = (orders && orders.length > 0) ? orders : MOCK_ORDERS;

  const refundedOrders = localOrders.filter(
    (o) => o.orderStatus === "cancelled" || o.orderStatus === "returned"
  );
  const refundedMoney = refundedOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  const returnedCount = refundedOrders.reduce((acc, o) => acc + (o.quantity || 1), 0);
  const totalSales = localOrders.filter((o) => o.orderStatus !== "cancelled").reduce((acc, o) => acc + (o.totalPrice || 0), 0);

  return (
    <div className={`flex flex-col gap-6 flex-1 min-h-0 overflow-hidden text-slate-800 dark:text-slate-200 ${isDarkMode ? "dark" : ""}`}>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 lg:p-8 shadow-xs flex-shrink-0">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
          Payment &amp; Refund Ledger
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-3">
          Monitor sales revenue flow, cancellations, and processed customer refunds across the application.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-shrink-0">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg shrink-0">₹</div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Total Sales Volume</span>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">₹{totalSales.toLocaleString("en-IN")}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center font-black text-lg shrink-0">₹</div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Refunds Processed</span>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">₹{refundedMoney.toLocaleString("en-IN")}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Returned Items</span>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{returnedCount} Items</h3>
          </div>
        </div>
      </div>

      {/* Refund Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 lg:p-8 shadow-xs flex-1 min-h-[320px] flex flex-col gap-4">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-2 pb-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          Customer Refund Ledger
        </h4>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600/20 border-t-indigo-600 animate-spin" />
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Loading payment data...</p>
          </div>
        ) : refundedOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center gap-3">
            <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-300">No cancellation/refund transactions found</p>
            <p className="text-xs">No orders have been cancelled or returned yet.</p>
          </div>
        ) : (
          <div className="overflow-auto flex-1 min-h-0 border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs relative">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10">
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:border-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order Reference</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Refund Amount</th>
                  {user?.adminRole === "superadmin" && <th className="py-3 px-4">Admin</th>}
                  <th className="py-3 px-4 text-center">Refund Status</th>
                  <th className="py-3 px-4 text-center">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {refundedOrders.map((ord) => {
                  const prodTitle = ord.product?.name || ord.product?.title || "System Product";
                  const customerEmail = ord.user?.email || "customer@gmail.com";
                  const customerName = ord.user?.name || customerEmail.split("@")[0];
                  const dateStr = ord.createdAt
                    ? new Date(ord.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                    : "—";

                  return (
                    <tr key={ord._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="py-4 px-4 font-semibold text-indigo-600 dark:text-indigo-400">#{ord._id}</td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{customerName}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{customerEmail}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={prodTitle}>{prodTitle}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Qty: {ord.quantity || 1}</p>
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{dateStr}</td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-450 font-bold uppercase">{ord.paymentMethod || "UPI"}</td>
                      <td className="py-4 px-4 font-black text-slate-900 dark:text-slate-100">₹{(ord.totalPrice || 0).toLocaleString("en-IN")}</td>
                      {user?.adminRole === "superadmin" && (
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-semibold">{ord.seller?.name || "SuperAdmin"}</td>
                      )}
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal title="Detailed Order Information" onClose={() => setSelectedOrder(null)}>
          <div className="flex flex-col gap-5 text-xs text-slate-800 dark:text-slate-200">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">Order Reference ID</span>
                <p className="font-bold text-slate-700 dark:text-slate-200 break-all">{selectedOrder._id || selectedOrder.id}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">Purchase Date</span>
                <p className="font-bold text-slate-700 dark:text-slate-200">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </p>
              </div>
            </div>

            <div>
              <span className="block font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[9px] mb-2.5">Purchased Item</span>
              <div className="flex gap-3 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-300 flex items-center justify-center font-bold shrink-0 text-xl">🛍️</div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{selectedOrder.product?.name || selectedOrder.product?.title || "Meesho Item"}</h4>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">{selectedOrder.product?.category?.name || "General Category"}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">₹{selectedOrder.product?.price || selectedOrder.totalPrice}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Payment Gateway</span>
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm mt-0.5">{selectedOrder.paymentMethod || "UPI"}</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Total Invoice Paid</span>
                <p className="font-black text-slate-800 dark:text-slate-100 text-sm mt-0.5">₹{(selectedOrder.totalPrice || 0).toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
