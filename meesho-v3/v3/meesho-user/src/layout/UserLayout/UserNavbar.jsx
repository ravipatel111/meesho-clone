import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';

const CartIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const HeartIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const UserIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const SearchIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const MenuIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CATEGORIES = ['Kurtas', 'Sarees', 'Tops', 'Jeans', 'Dresses', 'Kurtis', 'T-Shirts', 'Leggings'];

const UserNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth?.user);
  const cartItems = useSelector((s) => s.cart?.items) || [];
  const wishlistItems = useSelector((s) => s.wishlist?.products) || [];
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const [search, setSearch] = useState('');
  const [searchError, setSearchError] = useState('');

  const validateSearch = (val) => {
    if (!val.trim()) return "Search query cannot be empty.";
    return "";
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    const err = validateSearch(val);
    setSearchError(err);
  };
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const err = validateSearch(search);
    if (err) {
      setSearchError(err);
      return;
    }
    navigate(`/home?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const navTo = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      {/* Main bar */}
      <div className="flex items-center gap-3 px-4 md:px-8 h-16">
        {/* Logo */}
        <div
          className="flex items-center gap-1.5 cursor-pointer shrink-0"
          onClick={() => navigate('/home', { state: { openCart: true } })}
        >
          <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center text-white font-bold text-sm select-none">
            M
          </div>
          <span className="font-bold text-lg text-pink-600 hidden sm:block tracking-tight">
            meesho
          </span>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} noValidate className="flex-1 max-w-2xl mx-auto relative">
          <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-pink-300 focus-within:border-pink-400 transition-colors">
            <input
              type="text"
              name="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Try Saree, Kurti, or Home Decor..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white transition-colors"
            >
              <SearchIcon />
            </button>
          </div>
          {searchError && (
            <p className="absolute -bottom-4 left-0 text-[10px] text-rose-500 font-bold ml-1">
              {searchError}
            </p>
          )}
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Wishlist */}
          <button
            onClick={() => navigate('/wishlist')}
            className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <span className={`${location.pathname === '/wishlist' ? 'text-pink-500' : 'text-gray-600 group-hover:text-pink-500'} transition-colors`}>
              <HeartIcon />
            </span>
            <span className="text-[10px] text-gray-500 hidden md:block">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 bg-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate('/home', { state: { openCart: true } })}
            className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <span className="text-gray-600 group-hover:text-pink-500 transition-colors">
              <CartIcon />
            </span>
            <span className="text-[10px] text-gray-500 hidden md:block">Cart</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 bg-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <span className="text-gray-600 group-hover:text-pink-500 transition-colors">
                <UserIcon />
              </span>
              <span className="text-[10px] text-gray-500 hidden md:block truncate max-w-[60px]">
                {user?.name?.split(' ')[0] || 'Profile'}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
                </div>
                {[
                  { label: 'My Orders',        path: '/order-history' },
                  { label: 'My Profile',        path: '/settings' },
                  { label: 'My Payments',       path: '/payments' },
                  { label: 'Change Password',   path: '/change-password' },
                ].map(({ label, path }) => (
                  <button
                    key={path}
                    onClick={() => { setProfileOpen(false); navigate(path); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-pink-600 transition-colors"
                  >
                    {label}
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            className="md:hidden px-2 py-2 text-gray-600 hover:text-pink-500"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Category strip */}
      <div className="hidden md:flex items-center gap-6 px-8 h-9 bg-gray-50 border-t border-gray-100 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => navigate(`/home?category=${encodeURIComponent(cat)}`)}
            className="text-xs font-medium text-gray-600 hover:text-pink-600 whitespace-nowrap transition-colors"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          {[
            { label: '🏠 Home',          path: '/home' },
            { label: '❤️ Wishlist',       path: '/wishlist' },
            { label: '📦 My Orders',      path: '/order-history' },
            { label: '👤 My Profile',     path: '/settings' },
            { label: '💳 My Payments',    path: '/payments' },
            { label: '🔑 Change Password',path: '/change-password' },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navTo(path)}
              className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50"
            >
              {label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left px-6 py-3 text-sm text-red-500 hover:bg-red-50"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default UserNavbar;
