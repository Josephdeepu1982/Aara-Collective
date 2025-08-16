import React from "react";
import ProductCard, { type Product } from "./ProductCard";

// Define the shape of props the component will receive
type Props = {
  product: Product;
  onAddToCart?: (product: Product) => void; //triggred when user clicks "Add to Cart" button
  onClick?: () => void; //triggered when the entire card is clicked—makes the card behave like a link (clickable).
  showAddButton?: boolean;
  className?: string;
};

const InlineProductCard = ({
  product,
  onAddToCart,
  onClick,
  showAddButton = true,
  className = "",
}: Props) => {
  return (
    <ProductCard
      product={product}
      onAddToCart={onAddToCart}
      onClick={onClick}
      showAddButton={showAddButton}
      className={className}
    />
  );
};

export default InlineProductCard;
