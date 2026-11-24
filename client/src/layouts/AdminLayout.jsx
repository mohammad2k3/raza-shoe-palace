import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Boxes,
  Users,
  Ticket,
  Star,
  Image as ImageIcon,
  Settings,
  BarChart3,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If loading, show skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs uppercase tracking-luxury text-luxury-gold">Loading Raza Admin Portal...</p>
        </div>
      </div>
    );
  }

  // Guard: require admin authentication
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Dynamic Categories', path: '/admin/categories', icon: Layers },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Variant Inventory', path: '/admin/inventory', icon: Boxes },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Discount Coupons', path: '/admin/coupons', icon: Ticket },
    { label: 'Review Moderation', path: '/admin/reviews', icon: Star },
    { label: 'Homepage Banners', path: '/admin/banners', icon: ImageIcon },
    { label: 'Business Settings', path: '/admin/settings', icon: Settings },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Luxury Dark Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-luxury-black text-gray-300 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-luxury-charcoal">
          <div>
            <Link to="/admin" className="block">
              <span className="font-serif text-lg font-bold tracking-luxury text-white">
                RAZA PALACE
              </span>
              <span className="block text-[9px] uppercase tracking-ultra text-luxury-gold font-bold">
                Admin Control Center
              </span>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-gray-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all ${
                  isActive
                    ? 'bg-luxury-gold text-luxury-black font-bold shadow-sm'
                    : 'text-gray-400 hover:bg-luxury-charcoal hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-luxury-black' : 'text-luxury-gold'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </Link>
            );
          })}
        </nav>

        {/* Live Storefront Link & Admin Info */}
        <div className="p-4 border-t border-luxury-charcoal bg-luxury-charcoal/40 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center space-x-2 w-full py-2 bg-luxury-black border border-luxury-charcoal text-xs text-luxury-gold uppercase tracking-wider font-semibold hover:border-luxury-gold transition-colors"
          >
            <span>View Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-luxury-black lg:hidden hover:text-luxury-gold"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <Shield className="w-3.5 h-3.5 text-luxury-gold" />
              <span>Production Admin Suite</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/admin/products/new"
              className="px-3.5 py-1.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors"
            >
              + Add Product
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
