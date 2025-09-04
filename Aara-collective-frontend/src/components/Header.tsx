import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { ShoppingCart, User, Search } from "lucide-react";
import { useEffect, useState } from "react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Check if current page is the landing page and transparent background only in landing page
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    if (isHomePage) {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

  const headerClasses = [
    "top-0 left-0 w-full z-50 transition-colors duration-300",
    isHomePage && !isScrolled
      ? "absolute bg-gradient-to-b from-black/30 to-transparent"
      : "fixed bg-white shadow-md",
  ].join(" ");

  const textColor =
    isHomePage && !isScrolled ? "text-pink-100" : "text-pink-900";

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        {/* Uses Flexbox to space out the logo, menu, and icons. */}

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/">
            <img
              src="/Logo1.png"
              alt="Aara Collective Logo"
              className="h-14 w-auto cursor-pointer"
            />
          </Link>
        </div>

        {/* Navigation Menu - Only visible on medium screens and up */}
        <NavigationMenu>
          <NavigationMenuList
            className={`hidden md:flex space-x-6 text-sm font-medium ${textColor}`}
          >
            {["Jewellery", "Clothing", "Bags"].map((item) => (
              <NavigationMenuItem key={item}>
                <NavigationMenuLink asChild>
                  <Link
                    to="/shop"
                    className="hover:text-pink-700 transition-colors"
                  >
                    {item}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Clickable Icons */}
        <div className="flex items-center space-x-4 text-pink-700">
          <Search className="w-5 h-5 hover:text-pink-600 cursor-pointer transition-colors" />
          
          <Link to="/login">
            <User className="w-5 h-5 hover:text-pink-600 cursor-pointer transition-colors" />
          </Link>

          <Link to="/cart">
            <ShoppingCart className="w-5 h-5 hover:text-pink-600 cursor-pointer transition-colors" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
