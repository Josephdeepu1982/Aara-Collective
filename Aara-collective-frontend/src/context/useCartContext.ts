import { useContext } from "react";
import { CartContext } from "./CartContext";

export const useCartContext = () => {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error(
      "useCartContext must be used inside <CartProviderComponent>",
    );
  }
  return value;
};
