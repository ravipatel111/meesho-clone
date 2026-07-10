import { firstOrPlaceholder, getFirstProductImage, PLACEHOLDER_IMAGE } from '../../../../utils/imageUrl';
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import {
  updateCartItem,
  removeFromCart,
  fetchCart,
  clearUserCart,
} from "../../../../redux/slices/cartSlice";
import {
  fetchAddresses,
  placeOrder,
  fetchMyOrders,
} from "../../../../redux/slices/userSlice";

const Icons = {
  Close: () => (
    <svg
      className="w-4.5 h-4.5 transition-transform duration-300 hover:rotate-90"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  Check: () => (
    <svg
      className="w-3.5 h-3.5 text-white animate-scale-up"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="3.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Plus: () => (
    <svg
      className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Edit: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  ),
  Trash: () => (
    <svg
      className="w-4 h-4"
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
};

const getAvailableSizes = (prod) => {
  if (!prod) return [];

  if (Array.isArray(prod.sizes) && prod.sizes.length > 0) {
    return prod.sizes;
  }
  if (Array.isArray(prod.size) && prod.size.length > 0) {
    return prod.size;
  }

  if (typeof prod.sizes === "string" && prod.sizes.trim()) {
    return prod.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof prod.size === "string" && prod.size.trim()) {
    return prod.size
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const title = (prod.title || "").toLowerCase();
  const catName = (prod.category?.name || "").toLowerCase();

  // Footwear / Shoes Category fallback
  if (
    catName.includes("footwear") ||
    catName.includes("shoe") ||
    title.includes("shoe") ||
    title.includes("sandal") ||
    title.includes("slipper") ||
    title.includes("boot") ||
    title.includes("sneaker")
  ) {
    return ["6", "7", "8", "9", "10"];
  }

  // Clothing / Fashion Category fallback
  if (
    catName.includes("wear") ||
    catName.includes("dress") ||
    catName.includes("saree") ||
    catName.includes("kurti") ||
    catName.includes("lehenga") ||
    catName.includes("clothing") ||
    catName.includes("shirt") ||
    catName.includes("menswear") ||
    catName.includes("ethnic") ||
    title.includes("saree") ||
    title.includes("kurti") ||
    title.includes("lehenga") ||
    title.includes("shirt") ||
    title.includes("pant") ||
    title.includes("t-shirt") ||
    title.includes("suit")
  ) {
    return ["S", "M", "L", "XL", "XXL"];
  }

  // Accessories / General items fallback
  if (
    catName.includes("accessories") ||
    title.includes("watch") ||
    title.includes("bag") ||
    title.includes("belt")
  ) {
    return ["Free Size"];
  }

  return [];
};

export default function CheckoutFlow({
  onClose,
  onNewAddressClick,
  onOrderPlaced,
  showToastMsg,
}) {
  const dispatch = useAppDispatch();
  const { items: cartItems, totalAmount: cartTotal } = useAppSelector(
    (s) => s.cart,
  );
  const { addresses } = useAppSelector((s) => s.user);

  const [activeStep, setActiveStep] = useState(1); // Steps: 1: Cart, 2: Address, 3: Payment, 4: Summary
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Local state to manage size selections since DB cart schema doesn't persist size
  const [localSizes, setLocalSizes] = useState(() => {
    try {
      const saved = localStorage.getItem("cart-sizes");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Edit Size/Qty modal state
  const [editingItem, setEditingItem] = useState(null);
  const [tempSize, setTempSize] = useState("M");
  const [tempQty, setTempQty] = useState(1);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchAddresses());
  }, [dispatch]);

  // Sync default address choice
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault);
      setSelectedAddressId(def ? def._id : addresses[0]._id);
    }
  }, [addresses, selectedAddressId]);

  const saveLocalSizes = (updated) => {
    setLocalSizes(updated);
    localStorage.setItem("cart-sizes", JSON.stringify(updated));
  };

  const handleRemove = async (productId) => {
    await dispatch(removeFromCart(productId));
    dispatch(fetchCart());
    showToastMsg("Item removed from cart.", "success");
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setTempSize(
      localSizes[item.product._id] || getAvailableSizes(item.product)[0] || "M",
    );
    setTempQty(item.quantity);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const productId = editingItem.product._id;
    // Update local sizes
    saveLocalSizes({ ...localSizes, [productId]: tempSize });
    // Update quantity in Redux
    await dispatch(updateCartItem({ productId, quantity: tempQty }));
    dispatch(fetchCart());
    setEditingItem(null);
    showToastMsg("Cart updated successfully!", "success");
  };

  const handleContinue = () => {
    if (activeStep === 1) {
      if (cartItems.length === 0) {
        showToastMsg("Your cart is empty.", "error");
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (!selectedAddressId) {
        showToastMsg("Please select a shipping address.", "error");
        return;
      }
      setActiveStep(3);
    } else if (activeStep === 3) {
      setActiveStep(4);
    }
  };

  const handlePlaceOrders = async () => {
    if (!selectedAddressId) {
      showToastMsg("Please select a delivery address", "error");
      return;
    }
    setIsPlacingOrder(true);
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
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Stepper UI data
  const steps = [
    { num: 1, label: "Cart" },
    { num: 2, label: "Address" },
    { num: 3, label: "Payment" },
    { num: 4, label: "Summary" },
  ];

  const getBackLabel = () => {
    if (activeStep === 2) return "Back to Cart";
    if (activeStep === 3) return "Back to Address";
    if (activeStep === 4) return "Back to Payment";
    return "Back to Shopping";
  };

  // Price Calculations
  let totalProductOriginalPrice = 0;
  let totalProductDiscount = 0;
  const deliveryFee = cartItems.length > 0 ? 80 : 0;

  cartItems.forEach((item) => {
    if (!item.product) return;
    const originalUnitPrice = item.product.discountPrice || item.product.price;
    totalProductOriginalPrice += originalUnitPrice * item.quantity;
    totalProductDiscount +=
      item.product.discountPrice
        ? (item.product.discountPrice - item.product.price) * item.quantity
        : 0;
  });

  const orderTotal =
    totalProductOriginalPrice - totalProductDiscount + deliveryFee;

  return (
    <div className="w-full flex-1 flex flex-col items-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-16">
      {/* Checkout Stepper Header */}
      <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/85 py-4 px-6 sticky top-0 z-30 transition-all shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={onClose}
            className="flex items-center cursor-pointer select-none group"
          >
            <span className="text-3xl font-black tracking-tighter text-[#9F2089] dark:text-pink-500 font-sans transition-transform duration-300 group-hover:scale-105">
              meesho
            </span>
          </div>

          {/* Stepper progress */}
          <div className="flex items-center gap-2 sm:gap-5 font-bold text-xs">
            {steps.map((step, idx) => {
              const isActive = activeStep === step.num;
              const isCompleted = activeStep > step.num;

              return (
                <div key={step.num} className="flex items-center">
                  <div className="flex items-center gap-2 select-none">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 font-black transition-all duration-300 ${
                        isActive
                          ? "bg-[#9F2089] text-white border-[#9F2089] dark:bg-pink-500 dark:border-pink-500 scale-110 shadow-md shadow-pink-500/20"
                          : isCompleted
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-transparent text-slate-400 border-slate-300 dark:border-slate-800"
                      }`}
                    >
                      {isCompleted ? <Icons.Check /> : step.num}
                    </span>
                    <span
                      className={`hidden sm:inline-block font-extrabold tracking-wide ${
                        isActive
                          ? "text-[#9F2089] dark:text-pink-400"
                          : isCompleted
                            ? "text-emerald-500"
                            : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-6 sm:w-16 h-1 ml-2 sm:ml-4 rounded-full transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-500"
                          : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl w-full px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
        {/* Left Column: Forms and Item list (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Step Back Action Button */}
          <button
            onClick={() => {
              if (activeStep === 1) {
                onClose();
              } else {
                setActiveStep(activeStep - 1);
              }
            }}
            className="flex items-center gap-2 text-[#9F2089] dark:text-pink-400 hover:text-[#851b72] dark:hover:text-pink-300 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 py-2.5 px-4 rounded-2xl self-start hover:shadow-xs"
          >
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>{getBackLabel()}</span>
          </button>

          {/* STEP 1: Cart Items */}
          {activeStep === 1 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <h2 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider pl-1">
                Product Details
              </h2>

              {cartItems.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-16 text-center shadow-xs flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-pink-50/50 dark:bg-slate-800/50 flex items-center justify-center text-4xl shadow-xs">
                    🛒
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-extrabold text-base text-slate-800 dark:text-slate-200">
                      Your Shopping Cart is Empty
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                      Add high-quality fashion, home decor, and daily essentials to get started.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 px-6 py-3 bg-[#9F2089] hover:bg-[#851b72] text-white font-bold text-xs rounded-2xl cursor-pointer transition-colors shadow-lg shadow-pink-500/20 active:scale-97"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4.5">
                  {cartItems.map((item) => {
                    if (!item.product) return null;
                    const prodId = item.product._id;
                    const size =
                      localSizes[prodId] ||
                      getAvailableSizes(item.product)[0] ||
                      "M";

                    return (
                      <div
                        key={prodId}
                        className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850/80 rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 relative group"
                      >
                        {/* Upper Section */}
                        <div className="flex gap-5">
                          {/* Image Box */}
                          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center relative">
                            {getFirstProductImage(item.product.images) ? (
                              <img
                                src={firstOrPlaceholder(item.product.images)}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                              />
                            ) : (
                              <span className="text-slate-350 text-2xl">🛍️</span>
                            )}
                          </div>

                          {/* Info panel */}
                          <div className="flex-1 flex flex-col gap-1 text-xs">
                            <div className="flex justify-between items-start pr-16">
                              <h4 className="font-extrabold text-sm text-slate-850 dark:text-white leading-snug line-clamp-2">
                                {item.product.title}
                              </h4>
                            </div>

                            {/* Price details */}
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="font-black text-slate-900 dark:text-white text-base">
                                ₹{item.product.price}
                              </span>
                              {item.product.discountPrice &&
                                item.product.discountPrice >
                                  item.product.price && (
                                  <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                                    ₹{item.product.discountPrice}
                                  </span>
                                )}
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-extrabold tracking-wide uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                Best Deal
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-2 font-bold text-slate-500 dark:text-slate-450">
                              {getAvailableSizes(item.product).length > 0 && (
                                <>
                                  <span>
                                    Size:{" "}
                                    <span className="text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md text-[11px]">
                                      {size}
                                    </span>
                                  </span>
                                  <span className="text-slate-300 dark:text-slate-700">•</span>
                                </>
                              )}
                              <span>
                                Qty:{" "}
                                <span className="text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md text-[11px]">
                                  {item.quantity}
                                </span>
                              </span>
                            </div>

                            {/* Actions line */}
                            <div className="flex items-center gap-4 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/70">
                              <button
                                onClick={() => handleRemove(prodId)}
                                className="flex items-center gap-1.5 text-slate-400 hover:text-rose-600 font-extrabold text-[10px] uppercase transition-colors cursor-pointer bg-transparent border-0"
                              >
                                <Icons.Trash />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Top-Right Absolute Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="absolute top-5 right-5 flex items-center gap-1 text-[#9F2089] dark:text-pink-400 hover:text-pink-600 font-extrabold text-xs tracking-wider cursor-pointer uppercase bg-pink-50/30 dark:bg-pink-950/10 hover:bg-pink-100/40 py-1.5 px-3.5 rounded-full border border-pink-100/20 transition-all"
                        >
                          <Icons.Edit />
                          <span>EDIT</span>
                        </button>

                        {/* Card Footer: Sold by & Delivery Fee */}
                        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/70 flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-550">
                          <span>
                            Sold by:{" "}
                            <span className="text-slate-600 dark:text-slate-350">
                              {item.product.category?.name || "Meesho Supplier"}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            ✅ Easy returns within 7 days
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Address Select */}
          {activeStep === 2 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex justify-between items-center pl-1">
                <h2 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider">
                  Select Delivery Address
                </h2>
                <button
                  onClick={onNewAddressClick}
                  className="text-xs font-black text-[#9F2089] dark:text-pink-400 hover:text-pink-650 flex items-center gap-1.5 cursor-pointer bg-transparent border-0 group"
                >
                  <Icons.Plus />
                  <span>ADD NEW ADDRESS</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-3xl p-16 text-center shadow-xs flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl shadow-xs">
                    📍
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                      No delivery address saved yet
                    </p>
                    <p className="text-xs text-slate-450 dark:text-slate-500 max-w-xs leading-relaxed">
                      Add a shipping address to select delivery destinations and checkout.
                    </p>
                  </div>
                  <button
                    onClick={onNewAddressClick}
                    className="px-6 py-3 bg-[#9F2089] hover:bg-[#851b72] text-white font-bold rounded-2xl transition-all cursor-pointer shadow-lg shadow-pink-500/20 active:scale-97"
                  >
                    Add Shipping Address
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;

                    return (
                      <label
                        key={addr._id}
                        className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 flex items-start gap-4.5 cursor-pointer transition-all shadow-xs relative overflow-hidden group ${
                          isSelected
                            ? "border-[#9F2089] dark:border-pink-500 ring-2 ring-[#9F2089]/20 dark:ring-pink-500/20 bg-pink-50/5"
                            : "border-slate-150 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-750 hover:shadow-md"
                        }`}
                      >
                        <input
                          type="radio"
                          name="checkout-address"
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr._id)}
                          className="mt-1.5 w-4.5 h-4.5 text-[#9F2089] dark:text-pink-500 focus:ring-[#9F2089]"
                        />
                        <div className="text-xs flex-1">
                          <div className="flex items-center gap-2.5">
                            <span className="font-black text-slate-800 dark:text-white text-sm">
                              {addr.fullName}
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              {addr.addressType}
                            </span>
                            {addr.isDefault && (
                              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2.5 leading-relaxed font-semibold">
                            {addr.addressLine}, {addr.city}, {addr.state} -{" "}
                            <span className="font-bold text-slate-700 dark:text-slate-300">{addr.pincode}</span>
                          </p>
                          <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-3 font-black uppercase tracking-wider flex items-center gap-1">
                            <span>📞</span> Phone: {addr.mobile}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="absolute right-5 bottom-5 flex items-center gap-1.5 bg-[#9F2089]/10 dark:bg-pink-500/10 text-[#9F2089] dark:text-pink-400 px-3.5 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[#9F2089]/20">
                            <span>✓</span> Selected
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Payment select */}
          {activeStep === 3 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <h2 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider pl-1">
                Select Payment Method
              </h2>
              <div className="flex flex-col gap-4">
                {[
                  {
                    id: "upi",
                    title: "UPI Pay",
                    icon: "📱",
                    desc: "Pay instantly via Google Pay, PhonePe, Paytm, or BHIM",
                    tags: ["Instant", "Recommended"],
                    extra: "⚡ Save additional ₹15 with UPI verification",
                  },
                  {
                    id: "card",
                    title: "Credit / Debit Card",
                    icon: "💳",
                    desc: "Pay securely with Visa, Mastercard, RuPay, or Maestro",
                    tags: ["Secure"],
                  },
                  {
                    id: "COD",
                    title: "Cash on Delivery",
                    icon: "💵",
                    desc: "Pay in cash when your order arrives at your doorstep",
                    tags: ["Cash"],
                    extra: "Free delivery on all COD orders",
                  },
                ].map((method) => {
                  const isSelected = paymentMethod === method.id;

                  return (
                    <label
                      key={method.id}
                      className={`bg-white dark:bg-slate-900 border rounded-3xl p-5.5 flex items-start gap-4.5 cursor-pointer transition-all shadow-xs ${
                        isSelected
                          ? "border-[#9F2089] dark:border-pink-500 ring-2 ring-[#9F2089]/20 dark:ring-pink-500/20 bg-pink-50/5 shadow-md"
                          : "border-slate-150 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-750 hover:shadow-md"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        checked={isSelected}
                        onChange={() => setPaymentMethod(method.id)}
                        className="mt-2 w-4.5 h-4.5 text-[#9F2089] dark:text-pink-500 focus:ring-[#9F2089]"
                      />
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-colors duration-300 ${
                            isSelected
                              ? "bg-[#9F2089]/10 text-white"
                              : "bg-slate-100 dark:bg-slate-800"
                          }`}
                        >
                          {method.icon}
                        </div>
                        <div className="text-xs flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-black text-slate-800 dark:text-white text-sm">
                              {method.title}
                            </span>
                            {method.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-[#9F2089]/10 text-[#9F2089] dark:text-pink-400 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-slate-450 dark:text-slate-500 text-xs mt-1.5 font-medium leading-relaxed">
                            {method.desc}
                          </p>
                          {method.extra && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-450 font-black mt-2 bg-emerald-500/10 px-2.5 py-1 rounded-lg inline-block">
                              {method.extra}
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Security note */}
              <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 dark:border-emerald-500/20 rounded-3xl p-5 flex items-center gap-4.5 shadow-2xs">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                  🔒
                </div>
                <div className="text-xs">
                  <p className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                    100% Safe and Encrypted Payments
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                    All payment processing is executed over secure, military-grade SSL encryption algorithms.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review Summary */}
          {activeStep === 4 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h2 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider pl-1">
                Review Your Order
              </h2>

              {/* Shipping address info */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-3xl p-6 shadow-xs flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                    Shipping Destination
                  </span>
                  <button
                    onClick={() => setActiveStep(2)}
                    className="text-xs font-black text-[#9F2089] dark:text-pink-400 hover:text-pink-650 bg-transparent border-0 cursor-pointer"
                  >
                    Edit Address
                  </button>
                </div>
                {addresses.find((a) => a._id === selectedAddressId) ? (
                  <div className="text-xs">
                    <p className="font-black text-slate-800 dark:text-white text-sm">
                      {
                        addresses.find((a) => a._id === selectedAddressId)
                          ?.fullName
                      }
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed font-semibold">
                      {
                        addresses.find((a) => a._id === selectedAddressId)
                          ?.addressLine
                      }
                      , {addresses.find((a) => a._id === selectedAddressId)?.city}
                      ,{" "}
                      {
                        addresses.find((a) => a._id === selectedAddressId)
                          ?.state
                      }{" "}
                      -{" "}
                      <span className="font-bold text-slate-700 dark:text-slate-350">
                        {
                          addresses.find((a) => a._id === selectedAddressId)
                            ?.pincode
                        }
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-rose-500 font-bold">No address selected.</p>
                )}
              </div>

              {/* Payment info */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-3xl p-6 shadow-xs flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                    Payment Mode
                  </span>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="text-xs font-black text-[#9F2089] dark:text-pink-400 hover:text-pink-650 bg-transparent border-0 cursor-pointer"
                  >
                    Change Method
                  </button>
                </div>
                <div className="text-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                    {paymentMethod === "upi" ? "📱" : paymentMethod === "COD" ? "💵" : "💳"}
                  </div>
                  <div>
                    <p className="font-black text-slate-850 dark:text-white text-sm capitalize">
                      {paymentMethod === "upi"
                        ? "UPI Instant Payment"
                        : paymentMethod === "COD"
                          ? "Cash on Delivery"
                          : "Credit / Debit Card"}
                    </p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-0.5">
                      {paymentMethod === "COD" ? "Pay on arrival" : "Prepaid transaction"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Price summary card & Place Order (col-span-4) */}
        {cartItems.length > 0 && (
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            {/* Price Details Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-[#9F2089]/5 to-pink-500/5 dark:from-[#9F2089]/10 dark:to-pink-950/10 border-b border-slate-100 dark:border-slate-800/80 px-6 py-4.5">
                <h3 className="font-black text-slate-700 dark:text-slate-350 uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <span>🧾</span> Price Details ({cartItems.reduce((acc, c) => acc + c.quantity, 0)} Items)
                </h3>
              </div>

              <div className="p-6 flex flex-col gap-4 text-xs font-semibold">
                <div className="flex flex-col gap-3 text-slate-550 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Product Price</span>
                    <span className="text-slate-850 dark:text-white font-bold">₹{totalProductOriginalPrice}</span>
                  </div>
                  {totalProductDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-450 font-black">
                      <span>Discount</span>
                      <span>- ₹{totalProductDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-slate-850 dark:text-white font-bold">₹{deliveryFee}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-4 flex justify-between items-center">
                  <span className="font-black text-slate-800 dark:text-white text-sm">Order Total</span>
                  <span className="font-black text-[#9F2089] dark:text-pink-400 text-2xl">₹{orderTotal}</span>
                </div>

                {totalProductDiscount > 0 && (
                  <div className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-450 px-4 py-3 rounded-2xl border border-emerald-500/10 font-bold text-center text-[11px] flex items-center justify-center gap-1.5 shadow-2xs">
                    🎉 You're saving ₹{totalProductDiscount} on this order!
                  </div>
                )}

                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold text-center">
                  {activeStep < 4
                    ? "Clicking 'Continue' won't deduct any money"
                    : "Verify your details before placing the order"}
                </p>

                {/* Action Button */}
                {activeStep < 4 ? (
                  <button
                    onClick={handleContinue}
                    className="w-full py-4 bg-gradient-to-r from-[#9F2089] to-[#c0399f] hover:from-[#851b72] hover:to-[#9F2089] text-white rounded-2xl font-black text-sm transition-all shadow-md shadow-pink-500/20 active:scale-[0.98] cursor-pointer hover:shadow-lg"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrders}
                    disabled={cartItems.length === 0 || !selectedAddressId || isPlacingOrder}
                    className="w-full py-4 bg-gradient-to-r from-[#9F2089] to-[#c0399f] hover:from-[#851b72] hover:to-[#9F2089] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm transition-all shadow-md shadow-pink-500/20 active:scale-[0.98] cursor-pointer hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {isPlacingOrder ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <span>Place Order · ₹{orderTotal}</span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Meesho Safe Shield Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-3xl p-5 flex gap-4 items-center shadow-xs">
              <div className="w-12 h-12 bg-pink-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                🛡️
              </div>
              <div className="text-[10px] leading-relaxed">
                <span className="font-black text-[#9F2089] dark:text-pink-400 block mb-0.5 uppercase tracking-widest text-[11px]">
                  Meesho Safe
                </span>
                <span className="font-semibold text-slate-500 dark:text-slate-450">
                  Your safety is our priority. Secure packaging and encrypted payments on every order.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT SIZE & QUANTITY DIALOG MODAL (Step 1 Cart item configuration) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in text-xs font-bold text-slate-805 dark:text-slate-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full shadow-2xl border border-slate-150 dark:border-slate-800/80 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5.5 py-4.5 border-b border-slate-100 dark:border-slate-850 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                Select Size & Qty
              </span>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 rounded-xl transition-all cursor-pointer bg-transparent border-0"
              >
                <Icons.Close />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5.5 flex flex-col gap-5.5">
              {/* Product Brief */}
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl bg-slate-55 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {getFirstProductImage(editingItem.product.images) ? (
                    <img
                      src={firstOrPlaceholder(editingItem.product.images)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>🛍️</span>
                  )}
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-slate-850 dark:text-white line-clamp-1 leading-snug">
                    {editingItem.product.title}
                  </h5>
                  <p className="text-xs text-[#9F2089] dark:text-pink-400 font-black mt-1">
                    ₹{editingItem.product.price}
                  </p>
                </div>
              </div>

              {getAvailableSizes(editingItem.product).length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-slate-550 dark:text-slate-400 uppercase text-[9px] tracking-widest font-black">
                    Select Size
                  </span>
                  <div className="flex gap-2.5 flex-wrap">
                    {getAvailableSizes(editingItem.product).map((size) => (
                      <button
                        key={size}
                        onClick={() => setTempSize(size)}
                        className={`px-4.5 py-2 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                          tempSize === size
                            ? "border-[#9F2089] text-[#9F2089] bg-pink-500/10 dark:border-pink-500 dark:text-pink-400"
                            : "border-slate-200 dark:border-slate-800 text-slate-550 bg-transparent hover:border-slate-350 hover:bg-slate-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex flex-col gap-2.5">
                <span className="text-slate-550 dark:text-slate-400 uppercase text-[9px] tracking-widest font-black">
                  Select Quantity
                </span>
                <select
                  value={tempQty}
                  onChange={(e) => setTempQty(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:border-[#9F2089] text-xs font-black"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5.5 py-4.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 flex gap-3.5">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 rounded-2xl font-black hover:bg-slate-50 transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-3 bg-[#9F2089] hover:bg-[#851b72] text-white rounded-2xl font-black transition-all cursor-pointer text-center text-xs uppercase tracking-wider shadow-md shadow-pink-500/15"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
