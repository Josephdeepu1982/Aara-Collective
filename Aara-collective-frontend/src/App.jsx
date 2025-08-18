import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroCarousel from "./components/HeroCarousel";
import FeaturedProducts from "./components/FeaturedProducts";
import { bestSellers, handleAddToCart } from "./components/ProductCard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";

const App = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <HeroCarousel />
                  <FeaturedProducts
                    products={bestSellers}
                    onAddToCart={handleAddToCart}
                  />
                </>
              }
            />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default App;
