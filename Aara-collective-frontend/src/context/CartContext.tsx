import { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of a cart item
export type CartItem = {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  quantity: number;
  variant?: string;
};

// Define what the context will provide
export type CartContextType = {
  cartItems: CartItem[];
  addItemToCart: (item: CartItem) => void;
  removeItemFromCart: (id: string) => void;
  updateItemQuantity: (id: string, qty: number) => void;
};

// Create the context object
export const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component that wraps your app
export const CartProviderComponent = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addItemToCart = (newItem: CartItem) => {
    setCartItems((previousItems) => {
      const existingIndex = previousItems.findIndex(
        (existingItem) => existingItem.id === newItem.id && existingItem.variant === newItem.variant,
      );
      if (existingIndex >= 0) {
        const updatedItems = [...previousItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + newItem.quantity,
        };
        return updatedItems;
      }
      return [...previousItems, newItem];
    });
  };

  const removeItemFromCart = (itemId: string) => {
    setCartItems((previousItems) => {
      return previousItems.filter((item) => item.id !== itemId);
    });
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    setCartItems((previousItems) => {
      return previousItems.map((item) => {
        if (item.id === itemId) {
          return { ...item, quantity: Math.max(1, newQuantity) };
        }
        return item;
      });
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
