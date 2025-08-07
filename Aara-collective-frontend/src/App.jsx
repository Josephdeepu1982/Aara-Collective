import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroCarousel from "./components/HeroCarousel";

const App = () => {
  return (
    <>
      <Header />
      <main className="p-1">
        <HeroCarousel />
        <p className="mt-8 text-center text-lg">Welcome to Aara Collective</p>
      </main>
      <Footer />
    </>
  );
};

export default App;
