import { useState } from "react";
import { firstOrPlaceholder, resolveOrPlaceholder, PLACEHOLDER_IMAGE } from '../../../../utils/imageUrl';
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { addToCart, fetchCart } from "../../../../redux/slices/cartSlice";
import {
  addWishlistProduct,
  removeWishlistProduct,
} from "../../../../redux/slices/wishlistSlice";
import {
  fetchUserProducts,
  fetchUserProductsByCategory,
} from "../../../../redux/slices/productSlice";

const Icons = {
  Heart: ({ filled = false }) => (
    <svg
      className={`w-5 h-5 transition-colors duration-200 ${filled ? "fill-rose-500 text-rose-500" : "text-slate-400 group-hover/wish:text-rose-500"}`}
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
  Star: () => (
    <svg
      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
      viewBox="0 0 24 24"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
};

const circleCategories = [
  {
    name: "Ethnic Wear",
    img: "https://images.meesho.com/images/marketing/1744634654837.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
  {
    name: "Western Dresses",
    img: "https://images.meesho.com/images/marketing/1744634725496.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
  {
    name: "Menswear",
    img: "https://images.meesho.com/images/marketing/1744634780426.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
  {
    name: "Footwear",
    img: "https://images.meesho.com/images/marketing/1744634814643.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
  {
    name: "Home Decor",
    img: "https://images.meesho.com/images/marketing/1744634835018.webp",
    catId: "69d9cf6480549e75e2a157f4", // Electronic
  },
  {
    name: "Beauty",
    img: "https://images.meesho.com/images/marketing/1744634871107.webp",
    catId: "6a2d1f45bf6fe0238c180392", // Beauty
  },
  {
    name: "Accessories",
    img: "https://images.meesho.com/images/marketing/1744634909968.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
  {
    name: "Grocery",
    img: "https://images.meesho.com/images/marketing/1744634937295.webp",
    catId: "6a2d202cbf6fe0238c18039b", // Food & Health
  },
];

const brands = [
  { image: "https://images.meesho.com/images/marketing/1743159302944.webp", url: "https://www.buywow.in" },
  { image: "https://images.meesho.com/images/marketing/1743159322237.webp", url: "https://mamaearth.in" },
  { image: "https://images.meesho.com/images/marketing/1743159363205.webp", url: "https://www.wildstone.in" },
  { image: "https://images.meesho.com/images/marketing/1743159377598.webp", url: "https://plumgoodness.com" },
  { image: "https://images.meesho.com/images/marketing/1743159393231.webp", url: "https://www.nivea.in" },
  { image: "https://images.meesho.com/images/marketing/1743159415385.webp", url: "https://himalayawellness.in" },
  { image: "https://images.meesho.com/images/marketing/1744636558884.webp", url: "https://www.mi.com/in" },
  { image: "https://images.meesho.com/images/marketing/1744636599446.webp", url: "https://www.bata.in" },
];

const originalBrandsList = [
  {
    image: "https://images.meesho.com/images/marketing/1744635542873.webp",
    catId: "6a2d1f45bf6fe0238c180392", // Beauty
  },
  {
    image: "https://images.meesho.com/images/marketing/1744635521751.webp",
    catId: "69d9cf6480549e75e2a157f4", // Electronic
  },
  {
    image: "https://images.meesho.com/images/marketing/1744635497001.webp",
    catId: "6a2d1f45bf6fe0238c180392", // Beauty
  },
  {
    image: "https://images.meesho.com/images/marketing/1744635464683.webp",
    catId: "69d9cf6480549e75e2a157f4", // Electronic
  },
  {
    image: "https://images.meesho.com/images/marketing/1744635432891.webp",
    catId: "6a2d1f45bf6fe0238c180392", // Beauty
  },
  {
    image: "https://images.meesho.com/images/marketing/1744635402151.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
  {
    image: "https://images.meesho.com/images/marketing/1744635614888.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
  {
    image: "https://images.meesho.com/images/marketing/1744635646070.webp",
    catId: "all",
  },
];
const goldCategories = [
  {
    title: "Lehenga",
    image: "https://images.meesho.com/images/marketing/1744722796811.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
  {
    title: "Menwear",
    image: "https://images.meesho.com/images/marketing/1744635113661.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
  {
    title: "Sarees",
    image: "https://images.meesho.com/images/marketing/1744635139351.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
  {
    title: "Jewellery",
    image: "https://images.meesho.com/images/marketing/1744635189897.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
];

const trends = [
  {
    title: "Trending Now",
    image: "https://images.meesho.com/images/marketing/1762433786046.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
  {
    title: "Budget Buys",
    image: "https://images.meesho.com/images/marketing/1762433761056.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
  {
    title: "Top Rated Picks",
    image: "https://images.meesho.com/images/marketing/1762433804035.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
  {
    title: "Daily Essentials",
    image: "https://images.meesho.com/images/marketing/1762433722680.webp",
    catId: "6a292926eb683b0e643372cc", // fashion
  },
];

export default function ShopCatalog({
  onProductClick,
  searchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState("relevance");
  const [priceFilter, setPriceFilter] = useState("all");

  const { products, isLoading: productLoading } = useAppSelector(
    (s) => s.product,
  );
  const { categories } = useAppSelector((s) => s.category);
  const { products: wishlistProducts } = useAppSelector((s) => s.wishlist);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory("all"); // Reset subcategory when category changes
    if (categoryId === "all") {
      dispatch(fetchUserProducts());
    } else {
      dispatch(fetchUserProductsByCategory(categoryId));
    }
  };

  const handleCircleCategorySelect = (categoryName) => {
    if (!categories || categories.length === 0) {
      handleCategorySelect("all");
      return;
    }
    const lowerSearch = categoryName.toLowerCase();
    let matchedCat = categories.find(c => c.name.toLowerCase() === lowerSearch);
    
    if (!matchedCat) {
      if (lowerSearch.includes("wear") || lowerSearch.includes("dress") || lowerSearch.includes("mens") || lowerSearch.includes("footwear") || lowerSearch.includes("accessories")) {
        matchedCat = categories.find(c => c.name.toLowerCase().includes("fashion") || c.name.toLowerCase().includes("clothing"));
      } else if (lowerSearch.includes("home")) {
        matchedCat = categories.find(c => c.name.toLowerCase().includes("home") || c.name.toLowerCase().includes("decor"));
      } else if (lowerSearch.includes("beauty")) {
        matchedCat = categories.find(c => c.name.toLowerCase().includes("beauty") || c.name.toLowerCase().includes("makeup"));
      } else if (lowerSearch.includes("grocery")) {
        matchedCat = categories.find(c => c.name.toLowerCase().includes("grocery") || c.name.toLowerCase().includes("food"));
      }
    }

    if (matchedCat) {
      handleCategorySelect(matchedCat._id);
    } else {
      handleCategorySelect("all");
    }
    
    const el = document.getElementById("products-for-you");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddToCart = async (productId, e) => {
    if (e) e.stopPropagation();
    await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
    dispatch(fetchCart());
  };

  const handleToggleWishlist = async (productId, e) => {
    if (e) e.stopPropagation();
    const isFav = (wishlistProducts || []).some(
      (p) => (p._id || p) === productId,
    );
    if (isFav) {
      await dispatch(removeWishlistProduct(productId));
    } else {
      await dispatch(addWishlistProduct(productId));
    }
  };

  // Filter calculations (by category, subcategory, search query, and price range)
  const filteredProducts = (products || []).filter((p) => {
    const matchesQuery =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === "all" ||
      p.category?._id === selectedCategory ||
      p.category === selectedCategory;

    const matchesSub =
      selectedSubCategory === "all" ||
      p.subCategory?._id === selectedSubCategory ||
      p.subCategory === selectedSubCategory;

    // Price range filters
    let matchesPrice = true;
    if (priceFilter === "under_200") {
      matchesPrice = p.price < 200;
    } else if (priceFilter === "200_500") {
      matchesPrice = p.price >= 200 && p.price <= 500;
    } else if (priceFilter === "500_1000") {
      matchesPrice = p.price >= 500 && p.price <= 1000;
    } else if (priceFilter === "over_1000") {
      matchesPrice = p.price > 1000;
    }

    return matchesQuery && matchesCat && matchesSub && matchesPrice;
  });

  // Sort calculations
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_low_high") {
      return a.price - b.price;
    }
    if (sortBy === "price_high_low") {
      return b.price - a.price;
    }
    if (sortBy === "newest") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    return 0; // relevance / default
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-in text-slate-800 dark:text-slate-100 pb-12">
      {/* Promo Banner */}
      <div className="w-full overflow-hidden rounded-3xl shadow-xs relative group">
        <img
          src="https://images.meesho.com/images/marketing/1767796583251.webp"
          alt="Meesho Mega Sale Banner"
          className="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-300"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        {/* Overlay text and button on the right side of the image */}
        <div className="absolute right-[5%] md:right-[8%] lg:right-[4%] top-1/2 -translate-y-1/2 flex flex-col  justify-center gap-2 sm:gap-4 md:gap-6 z-10 select-none">
          <div className="flex flex-col">
            <h2 className="text-xs sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
              Smart Shopping
            </h2>
            <h2 className="text-xs sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight drop-shadow-md mt-0.5 md:mt-1">
              Trusted by Millions
            </h2>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById("products-for-you");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-white hover:bg-slate-50 text-indigo-950 px-3 sm:px-6 md:px-8 py-1 sm:py-2.5 md:py-3 rounded-lg font-black text-[8px] sm:text-xs md:text-sm tracking-wider uppercase transition duration-300 active:scale-95 cursor-pointer shadow-xs w-50"
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl py-3 px-4 flex flex-wrap items-center justify-around gap-4 shadow-2xs text-xs font-bold text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center text-[10px]">
            🌸
          </span>
          <span>7 Days Easy Return</span>
        </div>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center text-[10px]">
            🌸
          </span>
          <span>Pay using UPI</span>
        </div>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center text-[10px]">
            🌸
          </span>
          <span>Lowest Prices</span>
        </div>
      </div>

      {/* Category Section Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6 py-4">
        {circleCategories.map((category, index) => (
          <div
            key={index}
            onClick={() => handleCircleCategorySelect(category.name)}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-2xs hover:shadow-lg transition-all duration-300 p-4 flex flex-col items-center text-center cursor-pointer select-none group hover:-translate-y-0.5"
          >
            <div className="w-full h-32 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
              <img
                src={category.img}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>

            <h3 className="mt-3 text-xs md:text-sm font-black text-slate-800 dark:text-slate-200">
              {category.name}
            </h3>
          </div>
        ))}
      </div>

      {/* Festive Gold Banner */}
      <section className="relative overflow-hidden w-full flex items-center">
        <img
          src="https://images.meesho.com/images/marketing/1744698265981.webp"
          alt=""
          className="w-full"
        />

        <div className="flex-col items-start absolute bottom-[11%] left-[12.5%] gap-[17px] border rounded-[8px] border-[#ffd182] bg-[#3f1f11] hidden md:flex">
          <a
            href="/gold/clp/2R2G"
            className="px-[41px] pt-[11px] pb-[13px] text-[#ffd182]  text-[32px]"
          >
            Shop Now
          </a>
        </div>

        <div className="absolute right-[8%] grid grid-cols-2 gap-4 md:gap-8 lg:gap-15 hidden md:grid">
          <a href="/lehengas-gold/clp/3OZZ">
            <div>
              <img
                src="https://images.meesho.com/images/marketing/1744722796811.webp"
                alt="Lehenga"
              />
            </div>
          </a>

          <a href="/menwear-gold/clp/3T58">
            <div>
              <img
                src="https://images.meesho.com/images/marketing/1744635113661.webp"
                alt="Menwear"
              />
            </div>
          </a>

          <a href="/sarees/clp/44F1">
            <div>
              <img
                src="https://images.meesho.com/images/marketing/1744635139351.webp"
                alt="Sarees"
              />
            </div>
          </a>

          <a href="/jewellery-gold/clp/3T56">
            <div>
              <img
                src="https://images.meesho.com/images/marketing/1744635189897.webp"
                alt="Jewellery"
              />
            </div>
          </a>
        </div>
      </section>

      {/* Original Brands Section */}
      <div className="w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              Original Brands
            </h2>
            <svg
              className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>

          <button
            onClick={() => handleCategorySelect("all")}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-black text-xs hover:underline cursor-pointer"
          >
            <span>VIEW ALL</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Brands Slider replaced with Left-to-Right Marquee */}
        <div className="w-full overflow-hidden select-none py-3">
          <div className="marquee-track-reverse gap-5">
            {[...originalBrandsList, ...originalBrandsList].map(
              (brand, index) => (
                <div
                  key={index}
                  onClick={() => handleCategorySelect(brand.catId)}
                  className="w-56 h-72 flex-shrink-0 cursor-pointer group pt-2 pb-1"
                >
                  <div className="w-full h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden shadow-2xs group-hover:shadow-lg group-hover:-translate-y-1.5 transition-all duration-300">
                    <img
                      src={brand.image}
                      alt="Original Brand"
                      className="w-full h-full object-cover group-hover:scale-100 transition-transform duration-500"
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Popular Brands Auto-scrolling Marquee */}
      <div className="w-full dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl py-4 overflow-hidden select-none shadow-2xs bg-[#f0e9ff]">
        <div className="marquee-track gap-6">
          {[...brands, ...brands].map((brand, index) => (
            <div
              key={index}
              onClick={() => window.open(brand.url, '_blank')}
              className="w-40 h-22 flex-shrink-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-center transition-all duration-300 hover:scale-108 hover:shadow-md cursor-pointer hover:border-pink-500 z-10"
            >
              <img
                src={brand.image}
                alt="Popular Brand"
                className="h-12 w-auto object-contain dark:brightness-90 dark:contrast-125"
              />
            </div>
          ))}
        </div>
      </div>

      <section className="relative w-full pt-4 pb-12 overflow-hidden rounded-3xl shadow-md select-none">
        {/* Background Image */}
        <img
          src="https://images.meesho.com/images/marketing/1762433553672.webp"
          alt="Trends Background"
          className="absolute inset-0 w-full h-full object-fill object-center select-none pointer-events-none"
        />
        {/* Content Wrapper */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10">
          {/* Trend Cards Grid (Constrained to max-w-3xl, shifted to the right side) */}
          <div className="max-w-3xl ml-auto mr-2 sm:mr-4 md:mr-6 lg:mr-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trends.map((trend, index) => (
                <div
                  key={index}
                  onClick={() => handleCategorySelect(trend.catId)}
                  className="group cursor-pointer flex flex-col items-center gap-3 hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* Image Wrapper */}
                  <div className="w-full overflow-hidden rounded-[24px] bg-transparent">
                    <img
                      src={trend.image}
                      alt={trend.title}
                      className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Pill Label */}
                  <div className="bg-[#FFFDEC] border border-amber-100/50 text-[#5C0C40] font-black py-2 px-4 rounded-xl shadow-xs group-hover:bg-[#FFA800] group-hover:text-white transition-all duration-300 text-center text-[10px] sm:text-xs md:text-sm w-[90%] tracking-tight">
                    {trend.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Absolute Left-Bottom White Download Button */}
        <button
          onClick={() => handleCategorySelect("all")}
          className="absolute left-[10%] sm:left-[8%] md:left-[4%] bottom-[6%] sm:bottom-[15%] bg-white hover:bg-slate-100 text-[#580a46] hover:text-purple-700 font-bold px-6 sm:px-8 py-2.5 sm:py-3.5 rounded transition duration-300 cursor-pointer shadow-lg active:scale-95 text-xs sm:text-xl md:text-xl z-20 border border-slate-100"
        >
          Download Now
        </button>
      </section>

      <div id="products-for-you" className="flex flex-col md:flex-row gap-8 mt-4">
        {/* Left Filters Sidebar */}
        <div className="w-full md:w-[250px] shrink-0 flex flex-col gap-6">
          {/* Sort By Dropdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-850 rounded-2xl p-4.5 shadow-2xs">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-150 focus:outline-hidden focus:border-pink-500 transition-colors"
            >
              <option value="relevance">Relevance</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          {/* Categories Checklist */}
          <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-850 rounded-2xl p-4.5 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Categories
              </span>
              <button
                onClick={() => handleCategorySelect("all")}
                className="text-[9px] font-black text-pink-600 dark:text-pink-400 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedCategory === "all"}
                  onChange={() => handleCategorySelect("all")}
                  className="w-4 h-4 accent-pink-600 rounded-sm cursor-pointer"
                />
                <span>All Categories</span>
              </label>

              {categories.map((cat) => (
                <label
                  key={cat._id}
                  className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategory === cat._id}
                    onChange={() => handleCategorySelect(cat._id)}
                    className="w-4 h-4 accent-pink-600 rounded-sm cursor-pointer"
                  />
                  <span className="capitalize">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Radio Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-850 rounded-2xl p-4.5 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Price Limits
              </span>
              <button
                onClick={() => setPriceFilter("all")}
                className="text-[9px] font-black text-pink-600 dark:text-pink-400 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { label: "All Prices", value: "all" },
                { label: "Under ₹200", value: "under_200" },
                { label: "₹200 - ₹500", value: "200_500" },
                { label: "₹500 - ₹1000", value: "500_1000" },
                { label: "Over ₹1000", value: "over_1000" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer select-none"
                >
                  <input
                    type="radio"
                    name="priceFilter"
                    checked={priceFilter === opt.value}
                    onChange={() => setPriceFilter(opt.value)}
                    className="w-4 h-4 accent-pink-600 cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Catalog Grid */}
        <div id="products-for-you" className="flex-1 flex flex-col gap-6 scroll-mt-24">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850">
            <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Products For You
            </h1>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
              {sortedProducts.length} items found
            </span>
          </div>

          {/* Product Listing */}
          {productLoading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-3 border-pink-600/25 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
              <span className="text-slate-400 dark:text-slate-500 text-sm font-semibold">
                Loading products...
              </span>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-16 text-center shadow-xs">
              <p className="text-slate-400 dark:text-slate-500 font-bold mb-1">
                No products found
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs">
                Try expanding search criteria or price limits.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((p) => {
                const isFav = (wishlistProducts || []).some(
                  (w) => (w._id || w) === p._id,
                );

                const rating =
                  ((p._id.charCodeAt(p._id.length - 1) || 0) % 6) * 0.1 + 4.1;

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
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />

                      <button
                        onClick={(e) => handleToggleWishlist(p._id, e)}
                        className="group/wish absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-900/90 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full border border-slate-100/30 dark:border-slate-800 shadow-xs transition-all duration-250 active:scale-90"
                      >
                        <Icons.Heart filled={isFav} />
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
                            <Icons.Star />
                            <span className="text-[9px] font-black text-amber-700 dark:text-amber-400">
                              {rating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 min-h-8 leading-snug">
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
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">
                                ₹{p.discountPrice}
                              </span>
                              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-md">
                                {Math.round(
                                  (1 - p.price / p.discountPrice) * 100,
                                )}
                                % OFF
                              </span>
                            </>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(p._id, e)}
                          className="w-full py-2.5 bg-[#9F2089] hover:bg-[#851b72] text-white rounded-xl font-bold text-[11px] transition-all duration-200 hover:shadow-lg hover:shadow-pink-100 dark:hover:shadow-none flex items-center justify-center gap-1 active:scale-98 cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
