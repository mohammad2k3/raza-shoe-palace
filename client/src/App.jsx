import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { StoreSettingsProvider } from './context/StoreSettingsContext';
import { CategoryProvider } from './context/CategoryContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderTrack from './pages/OrderTrack';
import Account from './pages/Account';
import MyOrders from './pages/MyOrders';
import About from './pages/About';
import Contact from './pages/Contact';

// Policy Pages
import ShippingPolicy from './pages/policies/ShippingPolicy';
import ReturnsPolicy from './pages/policies/ReturnsPolicy';
import PrivacyPolicy from './pages/policies/PrivacyPolicy';
import TermsPolicy from './pages/policies/TermsPolicy';
import NotFound from './pages/NotFound';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminInventory from './pages/admin/AdminInventory';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReviews from './pages/admin/AdminReviews';
import AdminBanners from './pages/admin/AdminBanners';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReports from './pages/admin/AdminReports';

function App() {
  return (
    <BrowserRouter>
      <StoreSettingsProvider>
        <CategoryProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Routes>
                  {/* Public Storefront Routes */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:identifier" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
                    <Route path="/order-track" element={<OrderTrack />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/account/orders" element={<MyOrders />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/policies/shipping" element={<ShippingPolicy />} />
                    <Route path="/policies/returns" element={<ReturnsPolicy />} />
                    <Route path="/policies/privacy" element={<PrivacyPolicy />} />
                    <Route path="/policies/terms" element={<TermsPolicy />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>

                  {/* Dedicated Admin Login */}
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* Protected Admin Console Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminProductForm />} />
                    <Route path="products/edit/:id" element={<AdminProductForm />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="inventory" element={<AdminInventory />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="reports" element={<AdminReports />} />
                  </Route>
                </Routes>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </CategoryProvider>
      </StoreSettingsProvider>
    </BrowserRouter>
  );
}

export default App;
