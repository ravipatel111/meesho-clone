import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Chevron = ({ open }) => (
  <svg
    width={15}
    height={15}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`shrink-0 transition-transform duration-200 text-gray-400 ${open ? "rotate-90" : ""}`}
  >
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
);

function NavItem({ icon, label, href, children }) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const checkActive = (targetHref) => {
    if (!targetHref) return false;
    try {
      const currentUrl = new URL(pathname + search, window.location.origin);
      const targetUrl = new URL(targetHref, window.location.origin);
      if (currentUrl.pathname !== targetUrl.pathname) return false;
      const currentTab =
        currentUrl.searchParams.get("tab") ||
        (currentUrl.pathname === "/home" ? "shop" : "home");
      const targetTab =
        targetUrl.searchParams.get("tab") ||
        (targetUrl.pathname === "/home" ? "shop" : "home");
      if (currentTab !== targetTab) return false;
      const currentFilter =
        currentUrl.searchParams.get("filter") ||
        currentUrl.searchParams.get("status");
      const targetFilter =
        targetUrl.searchParams.get("filter") ||
        targetUrl.searchParams.get("status");
      if (targetFilter && currentFilter !== targetFilter) return false;
      return true;
    } catch {
      return pathname + search === targetHref;
    }
  };

  const isActive = href && checkActive(href);
  const hasActiveChild = children?.some((c) => c.href && checkActive(c.href));
  const [open, setOpen] = useState(hasActiveChild || false);
  const highlighted = isActive || hasActiveChild;

  if (!children) {
    return (
      <li>
        <button
          onClick={() => href && navigate(href)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-semibold transition-colors duration-150 ${
            highlighted
              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-100"
          }`}
        >
          <span
            className={
              highlighted
                ? "text-indigo-500 dark:text-indigo-400"
                : "text-gray-400 dark:text-slate-500"
            }
          >
            {icon}
          </span>
          <span className="flex-1 text-left">{label}</span>
        </button>
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-semibold transition-colors duration-150 ${
          highlighted
            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-100"
        }`}
      >
        <span
          className={
            highlighted
              ? "text-indigo-500 dark:text-indigo-400"
              : "text-gray-400 dark:text-slate-500"
          }
        >
          {icon}
        </span>
        <span className="flex-1 text-left">{label}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <ul className="mt-0.5 mb-1 ml-[22px] pl-3 space-y-0.5 border-l-2 border-gray-100 dark:border-slate-800">
          {children.map((c) => {
            const childActive = checkActive(c.href);
            return (
              <li key={c.label}>
                <button
                  onClick={() => c.href && navigate(c.href)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors duration-150 ${
                    childActive
                      ? "text-gray-900 bg-gray-100 font-semibold dark:text-slate-100 dark:bg-slate-800"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/40 font-medium"
                  }`}
                >
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="shrink-0 opacity-40"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {c.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────
const icons = {
  dashboard: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  ),
  products: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4v2l8 5 8-5V4zM4 13h16v7H4z" />
    </svg>
  ),
  categories: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5S15.01 22 17.5 22s4.5-2.01 4.5-4.5S19.99 13 17.5 13zm0 7a2.5 2.5 0 010-5 2.5 2.5 0 010 5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" />
    </svg>
  ),
  orders: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
    </svg>
  ),
  wishlist: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  users: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  ),
  profile: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  ),
  payments: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  ),
};

// Admin nav — each sidebar item maps to its own dedicated route.
const ADMIN_NAV = [
  {
    label: "Dashboard",
    icon: icons.dashboard,
    href: "/dashboard",
  },
  {
    label: "Products",
    icon: icons.products,
    href: "/products",
  },
  {
    label: "Categories",
    icon: icons.categories,
    href: "/categories",
  },
  {
    label: "Orders",
    icon: icons.orders,
    children: [
      { label: "All Orders",  href: "/orders" },
      { label: "Pending",     href: "/orders?status=pending" },
      { label: "Delivered",   href: "/orders?status=delivered" },
    ],
  },
  { label: "Users",    icon: icons.users,    href: "/users" },
  { label: "Payments", icon: icons.payments, href: "/payments" },
];

const USER_NAV = [
  {
    label: "Shop",
    icon: icons.dashboard,
    href: "/home",
  },
  {
    label: "My Orders",
    icon: icons.orders,
    href: "/order-history",
  },
  {
    label: "Wishlist",
    icon: icons.wishlist,
    href: "/wishlist",
  },
  {
    label: "Profile",
    icon: icons.profile,
    href: "/settings",
  },
  {
    label: "Change Password",
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
      </svg>
    ),
    href: "/change-password",
  },
];

const Sidebar = ({ isOpen = true }) => {
  const user = useSelector((s) => s.auth?.user);
  
  let navItems = [];
  if (user?.role === "admin") {
    if (user?.adminRole === "superadmin") {
      navItems = [
        ...ADMIN_NAV,
        {
          label: "Sub-Admins",
          icon: (
            <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          ),
          href: "/subadmins",
        }
      ];
    } else {
      navItems = ADMIN_NAV.filter(item => item.label !== "Users" && item.label !== "Payments");
    }
  } else {
    navItems = USER_NAV;
  }

  return (
    <aside
      className={`fixed top-[70px] left-0 bottom-0 w-[270px] bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 shadow-sm z-30 flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Role badge */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${user?.role === "admin" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" : "bg-green-50 text-green-600"}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {user?.role === "admin" ? (user?.adminRole === "superadmin" ? "Super Admin" : "Admin Panel") : "My Account"}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
