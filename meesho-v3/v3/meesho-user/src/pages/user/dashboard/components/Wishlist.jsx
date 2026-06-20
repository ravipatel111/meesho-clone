import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { firstOrPlaceholder } from "../../../../utils/imageUrl";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../../../../redux/slices/cartSlice";
import { removeWishlistProduct } from "../../../../redux/slices/wishlistSlice";
import { useState } from "react";

const Icons = {
  HeartEmpty: () => (
    <svg className="w-16 h-16 text-rose-300 dark:text-rose-900 mx-auto mb-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Star: () => (
    <svg className="w-3 h-3 fill-amber-400 text-amber-400" viewBox="0 0 24 24">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
  Cart: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-4 h-4 fill-rose-500 text-rose-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Arrow: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
};

export default function Wishlist({ onProductClick }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products: wishlistProducts } = useAppSelector((s) => s.wishlist);
  const [addedProducts, setAddedProducts] = useState([]);

  const handleAddToCart = async (productId, e) => {
    if (e) e.stopPropagation();
    await dispatch(addToCart({ productId, quantity: 1 }));
    setAddedProducts((prev) => [...prev, productId]);
  };

  const handleRemoveWishlist = async (productId, e) => {
    if (e) e.stopPropagation();
    await dispatch(removeWishlistProduct(productId));
  };

  return (
    <div className="animate-fade-in text-slate-805 dark:text-slate-200 max-w-6xl mx-auto px-1 pb-12">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 p-6 lg:p-8 mb-8 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4.5">
            <div className="w-12 h-12 bg-gradient-to-br from-[#9F2089] to-[#c0399f] rounded-2xl flex items-center justify-center shadow-md shadow-pink-500/10 shrink-0">
              <Icons.Heart />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-850 dark:text-white tracking-tight">My Wishlist</h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 font-bold mt-0.5">Items you love, saved to check out anytime</p>
            </div>
          </div>
          <span className="text-xs font-black text-[#9F2089] dark:text-pink-400 bg-pink-500/10 px-4.5 py-2 rounded-full border border-pink-500/10 uppercase tracking-widest">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-xs overflow-hidden">
          <div className="py-24 text-center px-6 max-w-sm mx-auto flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-rose-50/50 dark:bg-slate-800/50 rounded-full flex items-center justify-center border-2 border-dashed border-rose-250 dark:border-rose-800 shadow-2xs">
              <Icons.HeartEmpty />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-extrabold text-base text-slate-850 dark:text-white">Your Wishlist is Empty</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
                Save products you love here. They'll wait for you until you're ready to buy!
              </p>
            </div>
            <button
              onClick={() => navigate("/home")}
              className="mt-2 inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#9F2089] to-[#c0399f] hover:from-[#851b72] hover:to-[#9F2089] text-white rounded-2xl text-xs font-black transition-all hover:shadow-lg hover:shadow-pink-500/25 active:scale-97 cursor-pointer uppercase tracking-wider"
            >
              <span>Explore Products</span>
              <Icons.Arrow />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((p) => {
            if (!p || typeof p === "string") return null;
            const rating = ((p._id.charCodeAt(p._id.length - 1) || 0) % 6) * 0.1 + 4.1;
            const reviewCount = ((p._id.charCodeAt(0) || 0) % 900) + 100;
            const discountPct = p.originalPrice
              ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
              : 0;
            const isAdded = addedProducts.includes(p._id);

            return (
              <div
                key={p._id}
                onClick={() => onProductClick(p)}
                className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 hover:border-[#9F2089]/30 dark:hover:border-pink-500/25 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-950/40">
                  <img
                    src={firstOrPlaceholder(p.images)}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {discountPct > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-xs">
                        {discountPct}% OFF
                      </span>
                    )}
                    <span className="bg-slate-900/75 backdrop-blur-xs text-white text-[9px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider border border-white/10">
                      Free Delivery
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemoveWishlist(p._id, e)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs rounded-full border border-slate-100 dark:border-slate-800 shadow-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors duration-200 text-rose-500 z-10 cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <Icons.Heart />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4.5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] uppercase font-black text-[#9F2089] dark:text-pink-400 tracking-wider bg-pink-500/10 px-2.5 py-0.5 rounded-md">
                        {p.category?.name || "General"}
                      </span>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md">
                        <Icons.Star />
                        <span className="text-[9px] font-black text-amber-700 dark:text-amber-400">
                          {rating.toFixed(1)}
                        </span>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500">({reviewCount})</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed min-h-9">
                      {p.title}
                    </h4>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-base font-black text-slate-900 dark:text-white">₹{p.price}</span>
                      {p.originalPrice && (
                        <span className="text-xs text-slate-400 line-through font-bold">₹{p.originalPrice}</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(p._id, e)}
                      disabled={isAdded}
                      className={`w-full py-3 rounded-2xl font-black text-xs transition-all duration-200 active:scale-97 cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wide ${
                        isAdded
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#9F2089] to-[#c0399f] hover:from-[#851b72] hover:to-[#9F2089] text-white shadow-md shadow-pink-500/15"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Icons.Check />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <Icons.Cart />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
