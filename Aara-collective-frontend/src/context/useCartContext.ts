import { useContext } from "react";
import { CartContext } from "./CartContext";

export const useCartContext = () => {
  //avoids the need to write const cart = useContext(CartContext) everywhere;
  const value = useContext(CartContext);
  //Throws an error if used outside the provider.
  if (!value) {
    throw new Error(
      "useCartContext must be used inside <CartProviderComponent>",
    );
  }
  return value;
};
