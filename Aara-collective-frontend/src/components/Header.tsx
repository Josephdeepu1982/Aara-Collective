import React, { useMemo, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Search } from "lucide-react";
import { useCartContext } from "@/context/useCartContext";

const formatSGD = (amount: number) =>
  new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(amount);

const CART_OPEN_EVENT = "cart:open";

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const { cartItems, removeItemFromCart, updateItemQuantity } =
    useCartContext();

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    [cartItems],
  );

  const totalAmount = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum + (item.quantity ?? 0) * (item.salePrice ?? item.price),
        0,
      ),
    [cartItems],
  );

  //Adds a scroll listener on mount -> Updates isScrolled to trigger header style changes
  useEffect(() => {
    //scrollY returns the Y coordinate of the top edge of the current viewport
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  //Listens for a custom event (cart:open) -> Opens the cart drawer when triggered
  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener(CART_OPEN_EVENT, openHandler);
    return () => window.removeEventListener(CART_OPEN_EVENT, openHandler);
  }, []);

  const textColor = isHomePage && !isScrolled ? "text-white" : "text-gray-900";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        isHomePage && !isScrolled
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur border-b border-amber-200"
      }`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/Logo1.png"
            alt="Aara Collective Logo"
            className="h-14 w-auto"
          />
        </Link>

        {/* Navigation */}
        <NavigationMenu>
          <NavigationMenuList
            className={`hidden md:flex space-x-6 text-sm font-medium ${textColor}`}
          >
            {["Jewellery", "Clothing", "Bags"].map((label) => (
              <NavigationMenuItem key={label}>
                <NavigationMenuLink asChild>
                  <Link
                    to="/shop"
                    className="hover:text-pink-700 transition-colors"
                  >
                    {label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Icons */}
        <div className={`flex items-center space-x-4 ${textColor}`}>
          <button
            aria-label="Search"
            className="hover:text-pink-600 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link to="/login" aria-label="Account">
            <User className="w-5 h-5 hover:text-pink-600 transition-colors" />
          </Link>

          {/* Cart */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="relative" aria-label="Open cart">
                <ShoppingCart className="w-5 h-5 hover:text-pink-600 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex min-w-[18px] items-center justify-center rounded-full bg-pink-600 px-1.5 text-[10px] font-semibold text-white shadow">
                    {totalItems}
                  </span>
                )}
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-full max-w-[480px] sm:max-w-[560px]"
            >
              <SheetHeader>
                <SheetTitle className="text-left text-lg font-semibold text-gray-900">
                  Your Cart
                </SheetTitle>
              </SheetHeader>

              {/* Cart Items */}
              <div className="mt-4 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 p-4 text-sm text-gray-600">
                    Your cart is empty.
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const unit = item.salePrice ?? item.price;
                    return (
                      <div
                        key={item.id + (item.variant ?? "")}
                        className="flex gap-3 rounded-lg border border-amber-200 bg-white p-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="line-clamp-1 text-sm font-medium text-gray-900">
                                {item.name}
                              </div>
                              {item.variant && (
                                <div className="text-xs text-gray-500">
                                  {item.variant}
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-semibold text-pink-700">
                              {formatSGD(unit)}
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded border px-2 text-xs"
                                onClick={() =>
                                  updateItemQuantity(
                                    item.id,
                                    Math.max(1, (item.quantity ?? 1) - 1),
                                  )
                                }
                              >
                                −
                              </button>
                              <span className="text-sm">{item.quantity}</span>
                              <button
                                className="rounded border px-2 text-xs"
                                onClick={() =>
                                  updateItemQuantity(
                                    item.id,
                                    (item.quantity ?? 1) + 1,
                                  )
                                }
                              >
                                +
                              </button>
                            </div>
                            <button
                              className="text-xs text-gray-500 underline hover:text-red-600"
                              onClick={() => removeItemFromCart(item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Totals */}
              <div className="mt-6 space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Items</span>
                  <span className="font-medium text-gray-900">
                    {totalItems}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-pink-800">
                    {formatSGD(totalAmount)}
                  </span>
                </div>

                <SheetFooter className="mt-4 flex gap-2">
                  <Button
                    asChild
                    className="w-full bg-pink-700 hover:bg-pink-800"
                  >
                    <Link to="/checkout" onClick={() => setOpen(false)}>
                      Make Payment
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/shop" onClick={() => setOpen(false)}>
                      Continue Shopping
                    </Link>
                  </Button>
                </SheetFooter>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
