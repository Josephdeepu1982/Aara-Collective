import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroCarousel from "./components/HeroCarousel";
import FeaturedProducts from "./components/FeaturedProducts";
import { bestSellers, handleAddToCart } from "./components/ProductCard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShopPage from "./pages/ShopPage";

const App = () => {
  return (
    <>
      <Header />
      <main className="p-1">
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
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
