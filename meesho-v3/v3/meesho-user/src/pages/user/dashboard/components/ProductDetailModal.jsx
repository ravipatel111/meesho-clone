import { firstOrPlaceholder, getFirstProductImage, PLACEHOLDER_IMAGE } from '../../../../utils/imageUrl';
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { addToCart } from "../../../../redux/slices/cartSlice";
import { addWishlistProduct, removeWishlistProduct } from "../../../../redux/slices/wishlistSlice";

const Icons = {
  Heart: ({ filled = false }) => (
    <svg
      className={`w-5 h-5 transition-colors duration-200 ${filled ? "fill-rose-500 text-rose-500" : "text-slate-400"}`}
      fill={filled ? "currentColor" : "none"}
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
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Star: () => (
    <svg className="w-3.5 h-3.5 fill-amber-400 text-amber-400" viewBox="0 0 24 24">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
};

export default function ProductDetailModal({ product, onClose, showToastMsg }) {
  const dispatch = useAppDispatch();
  const { products: wishlistProducts } = useAppSelector((s) => s.wishlist);

  const isFav = (wishlistProducts || []).some((w) => (w._id || w) === product._id);

  const handleToggleWishlist = async () => {
    if (isFav) {
      await dispatch(removeWishlistProduct(product._id));
      showToastMsg("Removed from Wishlist", "success");
    } else {
      await dispatch(addWishlistProduct(product._id));
      showToastMsg("Added to Wishlist!", "success");
    }
  };

  const handleAddToCart = async () => {
    await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    onClose();
  };

  // Generate deterministic rating & reviews based on product ID
  const rating = ((product._id.charCodeAt(product._id.length - 1) || 0) % 6) * 0.1 + 4.1;
  const reviewCount = ((product._id.charCodeAt(0) || 0) * 3) % 150 + 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 dark:border-slate-800 my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-850 sticky top-0 bg-white dark:bg-slate-900 rounded-t-3xl z-10">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Product Details
          </span>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 rounded-xl transition-colors cursor-pointer"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto text-xs">
          {/* Product Image Panel */}
          <div className="aspect-square bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            {getFirstProductImage(product.images) ? (
              <img
                src={firstOrPlaceholder(product.images)}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-350 dark:text-slate-700 font-black text-xl">
                🛍️
              </div>
            )}
          </div>

          {/* Product Info Panel */}
          <div className="flex flex-col justify-between gap-6 text-slate-800 dark:text-slate-200">
            <div>
              {/* Category tag & ratings */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                  {product.category?.name || "General"}
                </span>
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-0.5 rounded-full">
                  <Icons.Star />
                  <span className="text-[9px] font-black text-amber-700 dark:text-amber-450">
                    {rating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>
              </div>

              <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white leading-snug mt-3">
                {product.title}
              </h3>

              {/* Pricing breakdown */}
              <div className="flex items-baseline gap-2 mt-3.5">
                <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  ₹{product.price}
                </span>
                {product.discountPrice && product.discountPrice > product.price && (
                  <>
                    <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                      ₹{product.discountPrice}
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">
                      {Math.round((1 - product.price / product.discountPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="mt-5">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-[11px] uppercase tracking-wider">
                  Product Description
                </span>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-semibold text-[11px]">
                  {product.description || "No description provided."}
                </p>
              </div>

              {/* Stock status indicator */}
              <div className="mt-5 flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Availability:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                  <span className={`font-bold ${product.stock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {product.stock > 0
                      ? `${product.stock} items left in stock`
                      : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons Panel */}
            <div className="flex gap-3 text-xs pt-4 border-t border-slate-100 dark:border-slate-850">
              <button
                onClick={handleToggleWishlist}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-slate-700 dark:text-slate-300 cursor-pointer active:scale-97"
              >
                <Icons.Heart filled={isFav} /> Wishlist
              </button>
              <button
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all hover:shadow-lg active:scale-97 cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
