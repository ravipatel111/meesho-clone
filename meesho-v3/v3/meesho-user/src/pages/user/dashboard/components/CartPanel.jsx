import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { firstOrPlaceholder, resolveOrPlaceholder, PLACEHOLDER_IMAGE } from '../../../../utils/imageUrl';
import { updateCartItem, removeFromCart, fetchCart, clearUserCart } from "../../../../redux/slices/cartSlice";

const Icons = {
  Bag: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Minus: () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

export default function CartPanel({ onClose, onCheckoutClick }) {
  const dispatch = useAppDispatch();
  const { items: cartItems, totalAmount: cartTotal } = useAppSelector((s) => s.cart);

  const handleClearCart = async () => {
    const confirmed = window.confirm("Are you sure you want to clear all items from your cart?");
    if (confirmed) {
      await dispatch(clearUserCart());
      dispatch(fetchCart());
    }
  };

  const handleUpdateQty = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      await dispatch(removeFromCart(productId));
    } else {
      await dispatch(updateCartItem({ productId, quantity: newQty }));
    }
    dispatch(fetchCart());
  };

  const handleRemoveFromCart = async (productId) => {
    await dispatch(removeFromCart(productId));
    dispatch(fetchCart());
  };

  const savings = cartItems.reduce((acc, item) => {
    if (item.product?.originalPrice && item.product?.price) {
      return acc + (item.product.originalPrice - item.product.price) * item.quantity;
    }
    return acc;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-slate-800 dark:text-slate-100">
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 flex flex-col shadow-2xl animate-slide-left">
          {/* Header - Meesho Pink Gradient */}
          <div className="bg-gradient-to-r from-[#9F2089] to-[#c0399f] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Icons.Bag />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">My Cart</h3>
                <p className="text-[10px] text-pink-200 font-medium">
                  {cartItems.reduce((a, c) => a + c.quantity, 0)} items
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-[10px] font-bold text-white/80 hover:text-white border border-white/30 px-3 py-1.5 rounded-lg transition-all hover:bg-white/10 cursor-pointer"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer"
              >
                <Icons.Close />
              </button>
            </div>
          </div>

          {/* Free Delivery Banner */}
          {cartItems.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/30 px-5 py-2.5 flex items-center gap-2">
              <Icons.Shield />
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                🎉 FREE delivery on all orders!
              </span>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-full flex items-center justify-center mb-5 text-4xl">
                  🛍️
                </div>
                <p className="font-black text-base mb-2 text-slate-800 dark:text-slate-200">Your cart is empty!</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed">
                  Add items from the catalog to get started shopping
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {cartItems.map((item) => {
                  if (!item.product) return null;
                  const discountPct = item.product.originalPrice
                    ? Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100)
                    : 0;
                  return (
                    <div
                      key={item.product._id}
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 hover:border-[#9F2089]/20 transition-all"
                    >
                      <div className="flex gap-3.5">
                        {/* Product Image */}
                        <div className="relative shrink-0">
                          <img
                            src={firstOrPlaceholder(item.product.images)}
                            alt=""
                            className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                          />
                          {discountPct > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg">
                              -{discountPct}%
                            </span>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
                              {item.product.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-sm font-black text-slate-900 dark:text-white">
                                ₹{item.product.price}
                              </span>
                              {item.product.originalPrice && (
                                <span className="text-[10px] text-slate-400 line-through font-medium">
                                  ₹{item.product.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Qty + Remove */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                              <button
                                onClick={() => handleUpdateQty(item.product._id, item.quantity, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-[#9F2089]/10 text-[#9F2089] dark:text-pink-400 transition-colors cursor-pointer"
                              >
                                <Icons.Minus />
                              </button>
                              <span className="w-8 text-center text-xs font-black text-slate-800 dark:text-slate-200">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQty(item.product._id, item.quantity, 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-[#9F2089]/10 text-[#9F2089] dark:text-pink-400 transition-colors cursor-pointer"
                              >
                                <Icons.Plus />
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemoveFromCart(item.product._id)}
                              className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              <Icons.Trash />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Checkout Block */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              {/* Price Breakdown */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <span>Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)} items)</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <span>Delivery</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Your Savings</span>
                    <span>-₹{savings}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2 flex justify-between">
                  <span className="text-sm font-black text-slate-900 dark:text-white">Total</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">₹{cartTotal}</span>
                </div>
              </div>

              <button
                onClick={onCheckoutClick}
                className="w-full py-3.5 bg-gradient-to-r from-[#9F2089] to-[#c0399f] hover:from-[#821a70] hover:to-[#9F2089] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/25 active:scale-[0.98] cursor-pointer"
              >
                Proceed to Checkout
                <Icons.ArrowRight />
              </button>

              <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-3 font-medium flex items-center justify-center gap-1">
                <Icons.Shield />
                Secure checkout · Free returns
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
