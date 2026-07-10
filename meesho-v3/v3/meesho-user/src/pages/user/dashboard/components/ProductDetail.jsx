import { useState, useEffect } from "react";
import { firstOrPlaceholder, resolveOrPlaceholder, PLACEHOLDER_IMAGE } from '../../../../utils/imageUrl';
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { addToCart } from "../../../../redux/slices/cartSlice";
import { addWishlistProduct, removeWishlistProduct } from "../../../../redux/slices/wishlistSlice";
import axios from "axios";

const Icons = {
  Star: () => (
    <svg
      className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0"
      viewBox="0 0 24 24"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
  Cart: () => (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  Flash: () => (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z"
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

const getVideoUrl = (prod) => {
  if (!prod) return null;
  if (typeof prod.video === "string" && prod.video.trim()) {
    return prod.video;
  }
  if (prod.video?.url) {
    return prod.video.url;
  }
  if (Array.isArray(prod.videos) && prod.videos[0]) {
    return typeof prod.videos[0] === "string"
      ? prod.videos[0]
      : prod.videos[0].url;
  }
  if (Array.isArray(prod.video) && prod.video[0]) {
    return typeof prod.video[0] === "string"
      ? prod.video[0]
      : prod.video[0].url;
  }
  return null;
};

export default function ProductDetail({
  product,
  onBack,
  onProductClick,
  showToastMsg,
  onBuyNow,
}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products } = useAppSelector((s) => s.product);
  const wishlist = useAppSelector((s) => s.wishlist);
  const wishlistProducts = wishlist?.products || [];

  const [activeMedia, setActiveMedia] = useState({ type: "image", url: "" });
  const [selectedSize, setSelectedSize] = useState(() => {
    const sizes = getAvailableSizes(product);
    return sizes[0] || "Free Size";
  });
  const [pincode, setPincode] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState(null);

  // Zoom feature state
  const [showZoom, setShowZoom] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ bgX: 0, bgY: 0, lensX: 0, lensY: 0, lensWidth: 0, lensHeight: 0 });

  const handleMouseMove = (e) => {
    if (activeMedia.type !== "image") return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    
    let mouseX = e.clientX - left;
    let mouseY = e.clientY - top;

    mouseX = Math.max(0, Math.min(mouseX, width));
    mouseY = Math.max(0, Math.min(mouseY, height));

    // Lens dimensions proportional to the zoom level (e.g., 250% zoom = lens is 40% of image size)
    const lensWidth = width * 0.4;
    const lensHeight = height * 0.4;

    let lensX = mouseX - lensWidth / 2;
    let lensY = mouseY - lensHeight / 2;

    lensX = Math.max(0, Math.min(lensX, width - lensWidth));
    lensY = Math.max(0, Math.min(lensY, height - lensHeight));

    const bgX = (lensX / (width - lensWidth)) * 100 || 0;
    const bgY = (lensY / (height - lensHeight)) * 100 || 0;

    setZoomStyle({ bgX, bgY, lensX, lensY, lensWidth, lensHeight });
  };

  const validatePincode = (val) => {
    if (!val.trim()) return "Pincode is required.";
    if (!/^\d{6}$/.test(val.trim())) return "Enter a valid 6-digit pincode.";
    return "";
  };

  const handlePincodeChange = (e) => {
    const val = e.target.value;
    setPincode(val);
    const error = validatePincode(val);
    if (error) setPincodeError(error);
    else setPincodeError("");
    setPincodeMessage("");
    setShippingInfo(null);
  };

  // Sync active preview media and selected size when product changes
  useEffect(() => {
    if (product.images?.[0]) {
      setActiveMedia({ type: "image", url: resolveOrPlaceholder(product.images[0]) });
    } else {
      const videoUrl = getVideoUrl(product);
      if (videoUrl) {
        setActiveMedia({ type: "video", url: videoUrl });
      } else {
        setActiveMedia({ type: "image", url: "" });
      }
    }
    const sizes = getAvailableSizes(product);
    if (sizes && sizes.length > 0) {
      setSelectedSize(sizes[0]);
    } else {
      setSelectedSize("Free Size");
    }
  }, [product]);

  const handleAddToCart = async () => {
    try {
      const saved = localStorage.getItem("cart-sizes");
      const sizesObj = saved ? JSON.parse(saved) : {};
      sizesObj[product._id] = selectedSize;
      localStorage.setItem("cart-sizes", JSON.stringify(sizesObj));
    } catch (e) {
      console.error("Failed to save size to local", e);
    }
    await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
  };

  const handleBuyNowClick = async () => {
    try {
      const saved = localStorage.getItem("cart-sizes");
      const sizesObj = saved ? JSON.parse(saved) : {};
      sizesObj[product._id] = selectedSize;
      localStorage.setItem("cart-sizes", JSON.stringify(sizesObj));
    } catch (e) {
      console.error("Failed to save size to local", e);
    }
    await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    onBuyNow();
  };

  const handleCheckPincode = async (e) => {
    e.preventDefault();
    const error = validatePincode(pincode);
    if (error) {
      setPincodeError(error);
      setPincodeMessage("");
      setShippingInfo(null);
      return;
    }
    
    setShippingLoading(true);
    setPincodeError("");
    setPincodeMessage("");
    setShippingInfo(null);
    
    try {
      const response = await axios.post("/api/shipping/check", {
        productId: product._id,
        pincode: pincode
      });
      
      const { success, data, message } = response.data;
      
      if (success && data.available) {
        setShippingInfo({
          deliveryDate: data.deliveryDate,
          shippingCharge: data.shippingCharge,
          distance: data.distance
        });
      } else {
        setPincodeError(data?.message || message || "Delivery not available to this pincode.");
      }
    } catch (err) {
      console.error("Shipping check error:", err);
      setPincodeError(err.response?.data?.message || "Failed to check delivery availability.");
    } finally {
      setShippingLoading(false);
    }
  };

  // Find similar products from the same category
  const similarProducts = products
    .filter(
      (p) =>
        (p.category?._id || p.category) ===
          (product.category?._id || product.category) && p._id !== product._id,
    )
    .slice(0, 4);

  const handleAddToCartCatalog = async (prodId, e) => {
    if (e) e.stopPropagation();
    await dispatch(addToCart({ productId: prodId, quantity: 1 })).unwrap();
  };

  const handleToggleWishlist = async (prodId, e) => {
    if (e) e.stopPropagation();
    const isFav = (wishlistProducts || []).some(
      (p) => (p._id || p) === prodId,
    );
    if (isFav) {
      await dispatch(removeWishlistProduct(prodId));
    } else {
      await dispatch(addWishlistProduct(prodId));
    }
  };

  // Generate deterministic rating & reviews based on product ID
  const rating =
    ((product._id.charCodeAt(product._id.length - 1) || 0) % 6) * 0.1 + 4.1;
  const reviewCount = (((product._id.charCodeAt(0) || 0) * 4) % 150) + 20;

  return (
    <div className="flex flex-col gap-5 text-slate-800 dark:text-slate-200 animate-fade-in font-sans select-none">
      {/* ─── Breadcrumbs ─── */}
      <nav className="text-xs flex items-center gap-1.5 flex-wrap bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm">
        <span
          className="hover:underline cursor-pointer font-bold text-[#9F2089] dark:text-pink-400"
          onClick={onBack}
        >
          🏠 Home
        </span>
        <span className="text-slate-300 dark:text-slate-700">›</span>
        <span className="capitalize text-slate-500 dark:text-slate-400 font-medium">
          {product.category?.name || "General"}
        </span>
        <span className="text-slate-300 dark:text-slate-700">›</span>
        <span className="text-slate-700 dark:text-white font-bold truncate max-w-[200px] sm:max-w-md">
          {product.title}
        </span>
      </nav>

      {/* ─── Split Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Media & Action Buttons & Similar Products (md:col-span-5) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-4.5">
            {/* Vertically Scrolling Thumbnails */}
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[350px] shrink-0 scrollbar-none">
              {(product.images || []).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    setActiveMedia({ type: "image", url: resolveOrPlaceholder(img) })
                  }
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    activeMedia.type === "image" && activeMedia.url === resolveOrPlaceholder(img)
                      ? "border-[#9F2089]"
                      : "border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <img
                    src={resolveOrPlaceholder(img)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}

              {getVideoUrl(product) && (
                <button
                  onClick={() =>
                    setActiveMedia({ type: "video", url: getVideoUrl(product) })
                  }
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 bg-slate-950 flex flex-col items-center justify-center relative ${
                    activeMedia.type === "video"
                      ? "border-[#9F2089]"
                      : "border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 font-bold">
                    <span className="text-white text-xs">▶️</span>
                  </div>
                  <span className="text-[9px] font-black text-white z-10 mt-5">
                    VIDEO
                  </span>
                </button>
              )}

              {(!product.images || product.images.length === 0) &&
                !getVideoUrl(product) && (
                  <div className="w-14 h-14 rounded-lg bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-bold text-slate-400 border border-slate-100 dark:border-slate-800">
                    🛍️
                  </div>
                )}
            </div>

            {/* Main Preview Box */}
            <div 
              className="flex-1 aspect-square bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-center relative group"
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleMouseMove}
            >
              {activeMedia.url ? (
                activeMedia.type === "video" ? (
                  <video
                    src={activeMedia.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain bg-black rounded-2xl"
                  />
                ) : (
                  <>
                    <img
                      src={activeMedia.url}
                      alt=""
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    
                    {/* Lens Overlay */}
                    {showZoom && (
                      <div 
                        className="absolute bg-blue-500/20 border border-blue-500/50 cursor-crosshair"
                        style={{
                          left: `${zoomStyle.lensX}px`,
                          top: `${zoomStyle.lensY}px`,
                          width: `${zoomStyle.lensWidth}px`,
                          height: `${zoomStyle.lensHeight}px`,
                        }}
                      />
                    )}

                    {/* Zoom Pane Overlay to the right */}
                    {showZoom && (
                      <div 
                        className="hidden md:block absolute top-0 left-full ml-4 w-[850px] h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl z-[100] pointer-events-none"
                        style={{
                           backgroundImage: `url(${activeMedia.url})`,
                           backgroundPosition: `${zoomStyle.bgX}% ${zoomStyle.bgY}%`,
                           backgroundSize: '250%',
                           backgroundRepeat: 'no-repeat'
                        }}
                      />
                    )}
                  </>
                )
              ) : (
                <span className="text-slate-350 dark:text-slate-700 font-black text-2xl">
                  🛍️
                </span>
              )}
              {/* Wishlist overlay button */}
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleWishlist(product._id, e); }}
                className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full border shadow-md transition-all duration-200 cursor-pointer ${
                  (wishlistProducts || []).some(p => (p._id || p) === product._id)
                    ? "bg-rose-500 border-rose-400 text-white"
                    : "bg-white/90 dark:bg-slate-900/90 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-rose-300 hover:text-rose-500"
                }`}
              >
                <svg className="w-5 h-5" fill={(wishlistProducts || []).some(p => (p._id || p) === product._id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 border-2 border-[#9F2089] text-[#9F2089] dark:text-pink-400 dark:border-pink-500 hover:bg-[#9F2089]/5 dark:hover:bg-pink-950/20 bg-white dark:bg-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.97]"
            >
              <Icons.Cart /> Add to Cart
            </button>
            <button
              disabled={product.stock <= 0}
              onClick={handleBuyNowClick}
              className="flex-1 py-4 bg-gradient-to-r from-[#9F2089] to-[#c0399f] hover:from-[#851b72] hover:to-[#9F2089] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.97] shadow-lg shadow-pink-500/25"
            >
              <Icons.Flash /> Buy Now
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: "🚚", label: "Free Delivery" },
              { icon: "↩️", label: "Easy Returns" },
              { icon: "🔒", label: "Secure Pay" },
            ].map((b) => (
              <div key={b.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800">
                <div className="text-lg mb-1">{b.icon}</div>
                <div className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">{b.label}</div>
              </div>
            ))}
          </div>

          {/* Similar Products list */}
          {similarProducts.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider">
                {similarProducts.length} Similar Products
              </h3>
              <div className="grid grid-cols-4 gap-2.5">
                {similarProducts.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => onProductClick(p)}
                    className="aspect-square bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 hover:border-[#9F2089] rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-103 shadow-2xs"
                  >
                    <img
                        src={firstOrPlaceholder(p.images)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Product Details Cards (md:col-span-7) */}
        <div className="md:col-span-7 flex flex-col gap-4">
          {/* Card 1: Title & Pricing */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col gap-2">
            <h1 className="text-base font-black text-slate-850 dark:text-white leading-snug">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{product.price}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                onwards
              </span>
              {product.discountPrice &&
                product.discountPrice > product.price && (
                  <>
                    <span className="text-xs text-slate-400 dark:text-slate-550 line-through">
                      ₹{product.discountPrice}
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">
                      {Math.round(
                        (1 - product.price / product.discountPrice) * 100,
                      )}
                      % OFF
                    </span>
                  </>
                )}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full shrink-0">
                <Icons.Star />
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-400">
                  {rating.toFixed(1)}
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                {reviewCount} Ratings, {Math.round(reviewCount * 0.4)} Reviews
              </span>
              <span className="text-[10px] font-black uppercase text-[#9F2089] dark:text-pink-400 bg-[#9F2089]/5 dark:bg-pink-950/20 px-2 py-0.5 rounded-md ml-auto">
                Trusted
              </span>
            </div>
          </div>

          {/* Card 2: Size Selection */}
          {getAvailableSizes(product).length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col gap-3.5">
              <span className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider">
                Select Size
              </span>
              <div className="flex gap-2.5 flex-wrap">
                {getAvailableSizes(product).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-full border-2 text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                      selectedSize === size
                        ? "border-[#9F2089] text-[#9F2089] dark:border-pink-500 dark:text-pink-400 bg-pink-50/10"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-455 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent"
                    }`}
                  >
                    <span>{size}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Card 3: Product Highlights */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
            <span className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider">
              Product Highlights
            </span>

            <div className="grid grid-cols-2 gap-4 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px] tracking-wide">
                  Occasion
                </span>
                <span className="text-slate-800 dark:text-white">
                  Casual / Ethnic Wear
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px] tracking-wide">
                  Color
                </span>
                <span className="text-slate-800 dark:text-white">
                  Multicolor
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px] tracking-wide">
                  Fabric
                </span>
                <span className="text-slate-800 dark:text-white">
                  Cotton blend / Premium Silk
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px] tracking-wide">
                  Generic Name
                </span>
                <span className="text-slate-800 dark:text-white capitalize">
                  {product.category?.name || "Apparel"}
                </span>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800/80" />

            <div className="flex flex-col gap-1 text-[11px]">
              <span className="font-bold text-slate-850 dark:text-white block mb-0.5 uppercase tracking-wide text-[9px] text-slate-400">
                Additional Details
              </span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {product.description ||
                  "High quality design with fine stitch work. Best suited for daily and casual occasions."}
              </p>
            </div>
          </div>

          {/* Card 4: Sold By */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-center font-black text-sm select-none">
                S
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                  Meesho Supplier
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5 bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded-md text-[9px] font-black text-indigo-600 dark:text-indigo-400 border border-indigo-100/10">
                    3.9 ★
                  </div>
                  <span className="text-[10px] text-slate-405 dark:text-slate-500 font-bold">
                    4,068 Followers | 37 Products
                  </span>
                </div>
              </div>
            </div>

            <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-[#9F2089] text-[#9F2089] dark:text-pink-400 text-[10px] font-bold rounded-xl transition-all cursor-pointer bg-transparent">
              View Shop
            </button>
          </div>

          {/* Card 5: Check Delivery */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col gap-3">
            <span className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider">
              Check Delivery Date
            </span>
            <form onSubmit={handleCheckPincode} noValidate className="flex gap-2">
              <input
                type="text"
                name="pincode"
                placeholder="Enter Delivery Pincode"
                maxLength={6}
                value={pincode}
                onChange={handlePincodeChange}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#9F2089]"
              />
              <button
                type="submit"
                disabled={shippingLoading}
                className="px-5 bg-transparent text-[#9F2589] dark:text-pink-400 font-bold text-xs hover:underline cursor-pointer disabled:opacity-50"
              >
                {shippingLoading ? "CHECKING..." : "CHECK"}
              </button>
            </form>
            {pincodeError && (
              <p className="text-[10px] text-rose-500 font-bold mt-0.5">
                {pincodeError}
              </p>
            )}
            {shippingInfo && !pincodeError && (
              <div className="flex flex-col gap-1 mt-1 text-[11px]">
                <p className="text-emerald-600 dark:text-emerald-450 font-bold">
                  ✓ Available for Delivery
                </p>
                <p className="text-slate-600 dark:text-slate-400 font-semibold">
                  Estimated Delivery: <strong className="text-slate-800 dark:text-white">{shippingInfo.deliveryDate}</strong>
                </p>
                <div className="flex items-center gap-4 mt-0.5">
                  <p className="text-slate-500 dark:text-slate-400">
                    Charge: {shippingInfo.shippingCharge > 0 ? `₹${shippingInfo.shippingCharge}` : <span className="text-emerald-600 dark:text-emerald-500 font-black">FREE</span>}
                  </p>
                  {shippingInfo.distance !== "N/A" && (
                    <p className="text-slate-500 dark:text-slate-400">Distance: {shippingInfo.distance}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 6: Ratings Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
            <span className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider">
              Product Ratings & Reviews
            </span>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  {rating.toFixed(1)} ★
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                  {reviewCount} Ratings
                </span>
              </div>

              <div className="w-px h-16 bg-slate-100 dark:bg-slate-800" />

              <div className="flex-1 flex flex-col gap-1.5 text-[10px] font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-12">Excellent</span>
                  <div className="flex-1 h-1.5 bg-slate-105 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: "65%" }}
                    />
                  </div>
                  <span className="w-6 text-right">65%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12">Very Good</span>
                  <div className="flex-1 h-1.5 bg-slate-105 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400"
                      style={{ width: "20%" }}
                    />
                  </div>
                  <span className="w-6 text-right">20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12">Good</span>
                  <div className="flex-1 h-1.5 bg-slate-105 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: "10%" }}
                    />
                  </div>
                  <span className="w-6 text-right">10%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12">Average</span>
                  <div className="flex-1 h-1.5 bg-slate-105 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400"
                      style={{ width: "3%" }}
                    />
                  </div>
                  <span className="w-6 text-right">3%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12">Poor</span>
                  <div className="flex-1 h-1.5 bg-slate-105 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: "2%" }}
                    />
                  </div>
                  <span className="w-6 text-right">2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ALL PRODUCTS CATALOG SECTION ─── */}
      <div className="flex flex-col gap-6 mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850">
          <h2 className="text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Products For You
          </h2>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            {products.length} items found
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const isFav = (wishlistProducts || []).some(
              (w) => (w._id || w) === p._id,
            );
            const rating = ((p._id.charCodeAt(p._id.length - 1) || 0) % 6) * 0.1 + 4.1;

            return (
              <div
                key={p._id}
                onClick={() => onProductClick(p)}
                className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-950">
                  <img
                      src={firstOrPlaceholder(p.images)}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                  <button
                    onClick={(e) => handleToggleWishlist(p._id, e)}
                    className="group/wish absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-900/90 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full border border-slate-100/30 dark:border-slate-800 shadow-xs transition-all duration-250 active:scale-90"
                  >
                    <svg
                      className={`w-5 h-5 transition-colors duration-200 ${isFav ? "fill-rose-500 text-rose-500" : "text-slate-400 group-hover/wish:text-rose-500"}`}
                      fill={isFav ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>

                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white font-bold text-[9px] px-2 py-0.5 rounded-md">
                    Free Delivery
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-black text-pink-600 dark:text-pink-400 tracking-wider">
                        {p.category?.name || "General"}
                      </span>
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-md">
                        <svg
                          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span className="text-[9px] font-black text-amber-700 dark:text-amber-400">
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 line-clamp-2 min-h-8 leading-snug">
                      {p.title}
                    </h4>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline gap-1.5 mb-3.5">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        ₹{p.price}
                      </span>
                      {p.discountPrice && p.discountPrice > p.price && (
                        <>
                          <span className="text-[10px] text-slate-400 dark:text-slate-550 line-through">
                            ₹{p.discountPrice}
                          </span>
                          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-md">
                            {Math.round(
                              (1 - p.price / p.discountPrice) * 100,
                            )}
                            % OFF
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleAddToCartCatalog(p._id, e)}
                      className="w-full py-2.5 bg-[#9F2089] hover:bg-[#851b72] text-white rounded-xl font-bold text-[11px] transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-1 active:scale-98 cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
