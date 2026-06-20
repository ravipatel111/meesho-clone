import { useState } from "react";

// Social Icons SVGs
const FacebookIcon = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const TwitterIcon = () => (
  <svg
    className="w-4.5 h-4.5 text-white"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

// High-fidelity Multi-colored Google Play Logo
const GooglePlayLogo = () => (
  <svg
    className="w-5.5 h-5.5 shrink-0"
    viewBox="0 0 256 256"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.9 2.4c-.6.6-.9 1.6-.9 2.8v245.6c0 1.2.3 2.2.9 2.8l1.3 1.3L153.2 116v-2.8L14.2 1.1l-1.3 1.3z"
      fill="#00A0E4"
    />
    <path
      d="M199.7 165.7l-46.5-46.5v-2.8l46.5-46.5 1.3.7 55.1 31.3c15.8 9 15.8 23.7 0 32.7l-55.1 31.1-1.3.7z"
      fill="#FFCC00"
    />
    <path
      d="M201 165l-47.8-47.8L13.6 252.8c5.2 5.5 13.8 6.2 23.4 0.7l164-93.5z"
      fill="#EA3E36"
    />
    <path
      d="M201 91L37 17.5C27.4 12 18.8 12.7 13.6 18.2l139.6 139.6L201 91z"
      fill="#00F076"
    />
  </svg>
);

// High-fidelity Apple App Store Logo
const AppleLogo = () => (
  <svg
    className="w-5.5 h-5.5 text-white fill-current shrink-0"
    viewBox="0 0 170 170"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.37.13-9.13-1.9-14.28-6.08-3.38-2.68-7.23-7.39-11.55-14.13-10.15-15.66-15.23-33.15-15.23-52.46 0-16.14 4.21-29.02 12.63-38.65 8.41-9.63 18.89-14.48 31.43-14.56 6.03 0 12.45 1.66 19.26 4.98 6.81 3.32 11.53 4.98 14.13 4.98 2.23 0 6.69-1.54 13.38-4.63 6.69-3.08 12.82-4.56 18.39-4.43 12.74.45 22.86 5.06 30.37 13.82-11.22 6.81-16.73 16.03-16.53 27.65.25 9.28 3.79 16.99 10.62 23.13 6.83 6.14 15.01 9.63 23.54 10.48-1.74 5.3-3.64 10.37-5.71 15.21zm-28.53-118.8c0 8.08-3.01 15.21-9.03 21.4-6.03 6.18-13.06 9.87-21.1 11.05.25-7.53 3.29-14.74 9.13-21.65 5.84-6.9 13.09-10.97 20.75-12.22.25 1.42.25 1.42.25 1.42z" />
  </svg>
);

export default function Footer() {
  // Accordion open by default to match the provided screenshot
  const [isOpen, setIsOpen] = useState(true);

  return (
    <footer className="w-full bg-[#f8f8ff] dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 text-[#555555] dark:text-slate-400 py-12 mt-12 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Link Sections: 5 columns using a flex wrapper for custom width alignment */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 pb-10 border-b border-slate-200 dark:border-slate-850">
          {/* Column 1: Meesho Branding and App download badges */}
          <div className="w-full lg:w-[32%] flex flex-col gap-4">
            <h3 className="text-3xl font-extrabold text-[#333333] dark:text-white tracking-tight leading-tight">
              Shop Non-Stop on Meesho
            </h3>
            <p className="text-[16px] font-semibold text-[#666666] dark:text-slate-400 leading-normal">
              Trusted by crores of Indians
              <br />
              Cash on Delivery
            </p>

            {/* Store Download Badges side by side */}
            <div className="flex flex-row flex-wrap items-center gap-3 mt-2">
              {/* Google Play */}
              <a
                href="#"
                className="flex items-center gap-2.5 bg-black hover:bg-slate-900 text-white rounded-md px-3.5 py-1.5 transition-all duration-300 hover:scale-[1.02] active:scale-95 border border-slate-800 h-[42px] w-[145px]"
              >
                <GooglePlayLogo />
                <div className="flex flex-col leading-none">
                  <span className="text-[8px] tracking-wider text-slate-350 font-bold uppercase">
                    GET IT ON
                  </span>
                  <span className="text-[13px] font-bold mt-0.5 whitespace-nowrap">
                    Google Play
                  </span>
                </div>
              </a>

              {/* App Store */}
              <a
                href="#"
                className="flex items-center gap-2.5 bg-black hover:bg-slate-900 text-white rounded-md px-3.5 py-1.5 transition-all duration-300 hover:scale-[1.02] active:scale-95 border border-slate-800 h-[42px] w-[145px]"
              >
                <AppleLogo />
                <div className="flex flex-col leading-none">
                  <span className="text-[8px] tracking-wider text-slate-350 font-bold uppercase">
                    Available on the
                  </span>
                  <span className="text-[13px] font-bold mt-0.5 whitespace-nowrap">
                    App Store
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Column 2: Career / Site links (Vertically aligned at the top directly) */}
          <div className="w-full lg:w-[13%] flex flex-col gap-3.5">
            <ul className="flex flex-col gap-3 text-base font-semibold text-[#555555] dark:text-slate-400">
              <li>
                <a href="#" className="hover:text-pink-600 transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-600 transition-colors">
                  Become a supplier
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-600 transition-colors">
                  Hall of Fame
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-600 transition-colors">
                  Sitemap
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Blogs (Vertically aligned at the top directly) */}
          <div className="w-full lg:w-[16%] flex flex-col gap-3.5">
            <ul className="flex flex-col gap-3 text-base font-semibold text-[#555555] dark:text-slate-400">
              <li>
                <a href="#" className="hover:text-pink-600 transition-colors">
                  Legal and Policies
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-600 transition-colors">
                  Meesho Tech Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-600 transition-colors">
                  Notices and Returns
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Reach out to us */}
          <div className="w-full lg:w-[16%] flex flex-col gap-4">
            <h4 className="text-base font-bold text-[#333333] dark:text-white tracking-wide">
              Reach out to us
            </h4>
            <div className="flex flex-row items-center gap-3">
              {/* Facebook */}
              <a
                href="#"
                className="w-8.5 h-8.5 rounded-full bg-[#3b5998] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xs hover:shadow-md cursor-pointer"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>

              {/* Instagram */}
              <a
                href="#"
                className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xs hover:shadow-md cursor-pointer"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>

              {/* Youtube */}
              <a
                href="#"
                className="w-8.5 h-8.5 rounded-full bg-[#c4302b] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xs hover:shadow-md cursor-pointer"
                aria-label="YouTube"
              >
                <YoutubeIcon />
              </a>

              {/* Linkedin */}
              <a
                href="#"
                className="w-8.5 h-8.5 rounded-full bg-[#0077b5] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xs hover:shadow-md cursor-pointer"
                aria-label="LinkedIn"
              >
                <LinkedinIcon />
              </a>

              {/* Twitter */}
              <a
                href="#"
                className="w-8.5 h-8.5 rounded-full bg-[#00acee] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xs hover:shadow-md cursor-pointer"
                aria-label="Twitter"
              >
                <TwitterIcon />
              </a>
            </div>
          </div>

          {/* Column 5: Contact Details */}
          <div className="w-full lg:w-[23%] flex flex-col gap-4 text-xs font-medium">
            <h4 className="text-base font-bold text-[#333333] dark:text-white tracking-wide">
              Contact Us
            </h4>
            <div className="flex flex-col gap-1.5 leading-relaxed text-[11px] text-[#666666] dark:text-slate-400">
              <p>Meesho Technologies Private Limited</p>
              <p>CIN: U62099KA2024PTC186568</p>
              <p>
                3rd Floor, Wing-E, Helios Business Park,
                <br />
                Park, Kadubeesanahalli Village, Varthur Hobli,
                <br />
                Outer Ring Road Bellandur, Bangalore,
                <br />
                Bangalore South, Karnataka, India, 560103
              </p>
              <p className="mt-1">
                E-mail address:{" "}
                <a
                  href="mailto:legalsupport@meesho.com"
                  className="hover:underline text-indigo-650 dark:text-indigo-400 font-bold"
                >
                  legalsupport@meesho.com
                </a>
              </p>
              <p className="text-[10px] text-[#888888] dark:text-slate-500 mt-2 font-semibold">
                &copy; 2015-2026 Meesho.com
              </p>
            </div>
          </div>
        </div>

        {/* Collapsible Accordion (More About Meesho) */}
        <div className="mt-8">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 overflow-hidden shadow-2xs">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between px-6 py-4.5 text-left text-[#333333] dark:text-white font-extrabold text-[15px] hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span>More About Meesho</span>
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                  isOpen ? "transform rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Accordion Content Panels */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                isOpen
                  ? "max-h-[1000px] border-t border-slate-100 dark:border-slate-850"
                  : "max-h-0"
              } overflow-hidden`}
            >
              <div className="p-6 flex flex-col gap-6 text-[12px] text-[#666666] dark:text-slate-400 font-medium leading-relaxed">
                <div>
                  <h5 className="font-extrabold text-[#333333] dark:text-white text-[13px] mb-1.5">
                    Discover a World of Affordable Fashion & Everyday Essentials
                  </h5>
                  <p>
                    Upgrade your wardrobe and stock your home with the latest
                    trends and essentials at prices designed for everyday value.
                    Meesho offers a vast selection of products across all
                    categories, ensuring you find everything you need at prices
                    suited for everyday budgets.
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-[#333333] dark:text-white text-[13px] mb-1.5">
                    Shop Millions of Products Across All Categories
                  </h5>
                  <p>
                    From trendy fashion finds to essential homeware, Meesho is
                    your one-stop shop for everything you need. Explore millions
                    of products across a wide variety of categories, ensuring
                    you find the perfect item for any occasion.
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-[#333333] dark:text-white text-[13px] mb-1.5">
                    Latest Women's Fashion Is Right Here
                  </h5>
                  <p>
                    Explore our stunning collection of women's fashion,
                    including sarees, kurtis, lehengas, western dresses, and
                    more. Handpicked styles and quality fabrics ensure you look
                    your best for any event, from casual outings to festive
                    celebrations.
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-[#333333] dark:text-white text-[13px] mb-1.5">
                    Men's Fashion & Wardrobe Upgrades
                  </h5>
                  <p>
                    From smart casuals and daily tees to traditional sherwanis,
                    discover the latest in men's clothing. Upgrade your style
                    with our curated collections of shirts, trousers, footwear,
                    and activewear at unbeatable prices.
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-[#333333] dark:text-white text-[13px] mb-1.5">
                    Home Decor & Essential Household Items
                  </h5>
                  <p>
                    Transform your living space with our elegant home decor,
                    bedsheets, cushions, curtains, and kitchen essentials. Bring
                    comfort and aesthetic appeal to every room with
                    budget-friendly high-quality options.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
