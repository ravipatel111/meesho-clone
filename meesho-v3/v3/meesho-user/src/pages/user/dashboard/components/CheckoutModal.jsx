import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { placeOrder } from "../../../../redux/slices/userSlice";
import { clearUserCart } from "../../../../redux/slices/cartSlice";

const Icons = {
  Close: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
};

export default function CheckoutModal({ onClose, onNewAddressClick, onOrderPlaced, showToastMsg }) {
  const dispatch = useAppDispatch();
  const { addresses } = useAppSelector((s) => s.user);
  const { items: cartItems, totalAmount: cartTotal } = useAppSelector((s) => s.cart);

  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  // Sync default address
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault);
      setSelectedAddressId(def ? def._id : addresses[0]._id);
    }
  }, [addresses]);

  const handlePlaceOrders = async () => {
    if (!selectedAddressId) {
      showToastMsg("Please select or add a delivery address", "error");
      return;
    }
    try {
      // Create orders for all cart items sequentially
      for (const item of cartItems) {
        if (item.product) {
          await dispatch(
            placeOrder({
              product: item.product._id,
              quantity: item.quantity,
              addressId: selectedAddressId,
              paymentMethod,
            }),
          ).unwrap();
        }
      }
      await dispatch(clearUserCart()).unwrap();
      onOrderPlaced();
    } catch (err) {
      showToastMsg(err || "Failed to place order", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in text-slate-800 dark:text-slate-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-850">
          <h3 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-widest">
            Complete Checkout
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 rounded-xl transition-all cursor-pointer"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto text-xs">
          {/* Address selector */}
          <div>
            <div className="flex justify-between items-center mb-3.5">
              <label className="text-xs font-bold text-slate-750 dark:text-slate-300">
                Select Delivery Address *
              </label>
              <button
                onClick={onNewAddressClick}
                className="text-[10px] font-black text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
              >
                <Icons.Plus /> New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-xs">
                <p className="text-slate-400 dark:text-slate-500 mb-4 font-semibold">
                  No delivery address saved yet.
                </p>
                <button
                  onClick={onNewAddressClick}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  Add Shipping Address
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`border rounded-2xl p-4 flex items-start gap-3.5 cursor-pointer transition-all ${
                      selectedAddressId === addr._id
                        ? "border-indigo-600 bg-indigo-50/5 dark:bg-indigo-950/10"
                        : "border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="checkout-address"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-white">
                          {addr.fullName}
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold text-[9px] px-2 py-0.5 rounded-sm capitalize">
                          {addr.addressType}
                        </span>
                        {addr.isDefault && (
                          <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border border-emerald-100/30 font-extrabold text-[9px] px-2 py-0.5 rounded-sm">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                        {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-1.5 font-semibold">
                        Ph: {addr.mobile}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
              Select Payment Method *
            </label>
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              {["upi", "card"].map((method) => (
                <label
                  key={method}
                  className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === method
                      ? "border-indigo-600 bg-indigo-50/5 dark:bg-indigo-950/10"
                      : "border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-750"
                  }`}
                >
                  <span className="font-bold text-slate-800 dark:text-white uppercase">
                    {method === "upi" ? "UPI Pay" : "Credit / Debit Card"}
                  </span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-4.5 text-xs flex flex-col gap-2.5 font-semibold text-slate-600 dark:text-slate-450">
            <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-widest text-[9px] mb-1">
              Pricing Detail
            </h4>
            <div className="flex justify-between">
              <span>Cart Items:</span>
              <span className="text-slate-800 dark:text-white font-bold">
                {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} Items
              </span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
            </div>
            <hr className="border-slate-200/50 dark:border-slate-800/60 my-1" />
            <div className="flex justify-between text-slate-800 dark:text-white font-bold">
              <span>Total Amount Payable:</span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                ₹{cartTotal}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 rounded-b-3xl flex gap-3 text-xs">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-97"
          >
            Cancel
          </button>
          <button
            onClick={handlePlaceOrders}
            disabled={cartItems.length === 0 || !selectedAddressId}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-97"
          >
            Place Order (₹{cartTotal})
          </button>
        </div>
      </div>
    </div>
  );
}
