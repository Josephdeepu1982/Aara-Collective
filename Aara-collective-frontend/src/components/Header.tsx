import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { ShoppingCart, User, Search } from "lucide-react";

const Header = () => {
  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-gradient-to-b from-black/30 to-transparent">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img
            src="/Logo1.png"
            alt="Aara Collective Logo"
            className="h-14 w-auto"
          />
        </div>

        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList className="hidden md:flex space-x-6 text-sm font-medium text-pink-100">
            <NavigationMenuItem>
              <NavigationMenuLink
                href="#"
                className="hover:text-pink-600 transition-colors"
              >
                Jewellery
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="#"
                className="hover:text-pink-600 transition-colors"
              >
                Clothing
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="#"
                className="hover:text-pink-600 transition-colors"
              >
                Bags
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Icons */}
        <div className="flex items-center space-x-4 text-pink-100">
          <Search className="w-5 h-5 hover:text-pink-600 cursor-pointer transition-colors" />
          <User className="w-5 h-5 hover:text-pink-600 cursor-pointer transition-colors" />
          <ShoppingCart className="w-5 h-5 hover:text-pink-600 cursor-pointer transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default Header;
