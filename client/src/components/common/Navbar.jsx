import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCategories } from '../../context/CategoryContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { categories } = useCategories();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const closeAll = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-luxury-gray transition-luxury">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            {/* Mobile Hamburger & Search Trigger */}
            <div className="flex items-center space-x-0.5 sm:space-x-2 md:hidden shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-luxury-black hover:text-luxury-gold focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1.5 text-luxury-black hover:text-luxury-gold"
                aria-label="Search"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Brand Logo / Wordmark */}
            <div className="flex-1 md:flex-initial text-center md:text-left min-w-0">
              <Link to="/" onClick={closeAll} className="inline-block group max-w-full">
                <span className="block font-serif text-base sm:text-2xl lg:text-3xl font-extrabold tracking-wider sm:tracking-luxury text-luxury-black group-hover:text-luxury-gold transition-luxury truncate">
                  RAZA SHOE PALACE
                </span>
                <span className="block text-[8px] sm:text-[9px] tracking-widest sm:tracking-ultra text-luxury-muted uppercase font-sans -mt-0.5 font-semibold">
                  Step Into Style.
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                onClick={closeAll}
                className={`text-sm font-semibold tracking-wider uppercase transition-luxury hover:text-luxury-gold ${
                  location.pathname === '/' ? 'text-luxury-gold' : 'text-luxury-black'
                }`}
              >
                Home
              </Link>

              <Link
                to="/shop"
                onClick={closeAll}
                className={`text-sm font-semibold tracking-wider uppercase transition-luxury hover:text-luxury-gold ${
                  location.pathname === '/shop' && !location.search ? 'text-luxury-gold' : 'text-luxury-black'
                }`}
              >
                Shop All
              </Link>

              {/* Dynamic Categories Dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center space-x-1 text-sm font-semibold tracking-wider uppercase transition-luxury hover:text-luxury-gold text-luxury-black py-2"
                >
                  <span>Collections</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>

                <div className="absolute top-full left-0 w-64 max-h-96 overflow-y-auto bg-white shadow-xl border border-luxury-gray py-3 rounded-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-2 border-b border-luxury-gray/50 mb-1">
                    <span className="text-[10px] tracking-ultra uppercase text-luxury-muted font-bold">
                      Categories
                    </span>
                  </div>
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/shop?category=${cat.slug}`}
                      onClick={closeAll}
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-luxury-black hover:bg-luxury-ivory hover:text-luxury-gold transition-colors"
                    >
                      <span>{cat.name}</span>
                      {cat.productCount !== undefined && (
                        <span className="text-[10px] text-luxury-muted font-normal">
                          ({cat.productCount})
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/about"
                onClick={closeAll}
                className={`text-sm font-semibold tracking-wider uppercase transition-luxury hover:text-luxury-gold ${
                  location.pathname === '/about' ? 'text-luxury-gold' : 'text-luxury-black'
                }`}
              >
                About
              </Link>

              <Link
                to="/contact"
                onClick={closeAll}
                className={`text-sm font-semibold tracking-wider uppercase transition-luxury hover:text-luxury-gold ${
                  location.pathname === '/contact' ? 'text-luxury-gold' : 'text-luxury-black'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Actions: Search, Wishlist, Cart, User */}
            <div className="flex items-center space-x-1 sm:space-x-4 md:space-x-6 shrink-0">
              {/* Desktop Search Toggle */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden md:flex p-2 text-luxury-black hover:text-luxury-gold transition-luxury"
                aria-label="Search Catalog"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                onClick={closeAll}
                className="relative p-1.5 sm:p-2 text-luxury-black hover:text-luxury-gold transition-luxury"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-luxury-gold text-luxury-black text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Icon */}
              <Link
                to="/cart"
                onClick={closeAll}
                className="relative p-1.5 sm:p-2 text-luxury-black hover:text-luxury-gold transition-luxury"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-luxury-black text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItemsCount}
                  </span>
                )}
              </Link>

              {/* Account Dropdown */}
              <div className="relative">
                {user ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center space-x-1 text-xs uppercase tracking-wider font-semibold text-luxury-black hover:text-luxury-gold border border-luxury-gray px-2 sm:px-3 py-1 sm:py-1.5 rounded-full"
                    >
                      <User className="w-4 h-4 text-luxury-gold" />
                      <span className="hidden lg:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                      <ChevronDown className="w-3 h-3 text-luxury-muted hidden sm:inline" />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white border border-luxury-gray shadow-xl py-2 z-50">
                        <div className="px-4 py-2 border-b border-luxury-gray/50">
                          <p className="text-xs font-semibold text-luxury-black truncate">{user.name}</p>
                          <p className="text-[11px] text-luxury-muted truncate">{user.email}</p>
                        </div>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 text-xs text-luxury-gold font-bold uppercase tracking-wider hover:bg-luxury-ivory transition-colors"
                          >
                            <Shield className="w-4 h-4 mr-2 text-luxury-gold" />
                            Admin Dashboard
                          </Link>
                        )}

                        <Link
                          to="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-xs text-luxury-black hover:bg-luxury-ivory transition-colors"
                        >
                          <User className="w-4 h-4 mr-2 text-luxury-muted" />
                          My Profile
                        </Link>

                        <Link
                          to="/account/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-xs text-luxury-black hover:bg-luxury-ivory transition-colors"
                        >
                          <Package className="w-4 h-4 mr-2 text-luxury-muted" />
                          My Orders
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left border-t border-luxury-gray/50 mt-1"
                        >
                          <LogOut className="w-4 h-4 mr-2 text-red-500" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeAll}
                    className="flex items-center space-x-1.5 p-1.5 sm:p-2 text-xs uppercase tracking-wider font-semibold text-luxury-black hover:text-luxury-gold"
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden lg:inline">Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Expandable Bar */}
        {searchOpen && (
          <div className="border-t border-luxury-gray bg-luxury-ivory/95 backdrop-blur-md px-3 sm:px-4 py-3">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 sm:w-5 sm:h-5 text-luxury-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search footwear..."
                  className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-2.5 sm:py-3 bg-white border border-luxury-gray text-xs sm:text-sm focus:outline-none focus:border-luxury-gold"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 sm:px-4 py-1.5 bg-luxury-black text-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-luxury-gray bg-white px-4 pt-3 pb-8 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-xl">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shoes..."
                className="w-full pl-9 pr-4 py-2.5 bg-luxury-ivory border border-luxury-gray text-xs focus:outline-none focus:border-luxury-gold"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-luxury-muted" />
            </form>

            <div className="flex flex-col space-y-2.5 font-semibold text-xs sm:text-sm uppercase tracking-wider">
              <Link to="/" onClick={closeAll} className="py-2 border-b border-luxury-gray/40">
                Home
              </Link>
              <Link to="/shop" onClick={closeAll} className="py-2 border-b border-luxury-gray/40">
                Shop All Footwear
              </Link>

              <div className="pt-1">
                <span className="text-[10px] font-bold text-luxury-muted tracking-ultra uppercase block mb-2">
                  Collections
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/shop?category=${cat.slug}`}
                      onClick={closeAll}
                      className="p-2.5 bg-luxury-ivory text-[11px] font-medium text-luxury-black hover:text-luxury-gold rounded-sm flex items-center justify-between"
                    >
                      <span className="truncate">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link to="/about" onClick={closeAll} className="py-2 border-b border-luxury-gray/40">
                About Our Heritage
              </Link>
              <Link to="/contact" onClick={closeAll} className="py-2 border-b border-luxury-gray/40">
                Store & Support
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={closeAll}
                  className="py-2 text-luxury-gold font-bold flex items-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;