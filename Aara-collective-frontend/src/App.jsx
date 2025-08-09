import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroCarousel from "./components/HeroCarousel";
import FeaturedProducts from "./components/FeaturedProducts";
import { bestSellers, handleAddToCart } from "./components/ProductCard";

const App = () => {
  return (
    <>
      <Header />
      <main className="p-1">
        <HeroCarousel />
        <FeaturedProducts
          products={bestSellers}
          onAddToCart={handleAddToCart}
        />
      </main>
      <Footer />
    </>
  );
};

export default App;
