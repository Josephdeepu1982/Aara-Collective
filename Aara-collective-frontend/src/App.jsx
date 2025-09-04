import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroCarousel from "./components/HeroCarousel";
import FeaturedProductsContainer from "./components/FeaturedProductsContainer";

//Public pages
import { Routes, Route, Navigate } from "react-router-dom";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

// User-only page
import UserProfilePage from "./pages/UserProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";

// --- Admin imports ---
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/admin/Dashboard";
import OrdersPage from "./pages/admin/Orders";
import OrderDetailsPage from "./pages/admin/OrderDetails";
import ProductsPage from "./pages/admin/Products";
import CouponsPage from "./pages/admin/Coupons";
import CustomersPage from "./pages/admin/Customers";
import InventoryPage from "./pages/admin/Inventory";
import ReturnsPage from "./pages/admin/Returns";
import ReportsPage from "./pages/admin/Reports";
import ShippingPage from "./pages/admin/Shipping";
import SettingsPage from "./pages/admin/Settings";

const App = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route
              path="/"
              element={
                <>
                  <HeroCarousel />
                  <FeaturedProductsContainer />
                </>
              }
            />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* User-only route - must be signed in*/}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin only routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="coupons" element={<CouponsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="returns" element={<ReturnsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="shipping" element={<ShippingPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Default redirect for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default App;
