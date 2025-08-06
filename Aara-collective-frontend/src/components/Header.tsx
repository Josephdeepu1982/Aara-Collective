import React from "react";
import { ShoppingCart, User, Search } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img
            src="/Logo1.png"
            alt="Aara Collective Logo"
            className="h-14 w-auto"
          />
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
          <a href="#" className="hover:text-pink-700">
            Jewellery
          </a>
          <a href="#" className="hover:text-pink-700">
            Clothing
          </a>
          <a href="#" className="hover:text-pink-700">
            Bags
          </a>
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          <Search className="w-5 h-5 text-gray-700 hover:text-pink-700 cursor-pointer" />
          <User className="w-5 h-5 text-gray-700 hover:text-pink-700 cursor-pointer" />
          <ShoppingCart className="w-5 h-5 text-gray-700 hover:text-pink-700 cursor-pointer" />
        </div>
      </div>
    </header>
  );
};

export default Header;
