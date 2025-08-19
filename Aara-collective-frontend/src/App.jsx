import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroCarousel from "./components/HeroCarousel";
import FeaturedProducts from "./components/FeaturedProducts";
import { bestSellers, handleAddToCart } from "./components/ProductCard";
import { Routes, Route } from "react-router-dom";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";

const App = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1">
          {/* flex-1 makes the content stretch to fill available space between header and footer. */}
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <HeroCarousel />
                  <FeaturedProducts
                    products={bestSellers} //mockdata
                    onAddToCart={handleAddToCart} //dummy function
                  />
                </>
              }
            />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default App;
