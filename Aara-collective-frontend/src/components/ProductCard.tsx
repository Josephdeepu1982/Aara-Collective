import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

//type Product = { ... } defines a custom TypeScript type that describes the shape of a product object.
//export makes that type available to other files that import it.
export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  subtitle?: string;
  category?: string;
  isNew?: boolean;
  isSale?: boolean;
  salePrice?: number;
  isBestSeller?: boolean;
};
//describes the shape of the props object that a React component will receive. type Props = { ... } creates a custom Typescript type named Props. We say that Props must include a product key, and its value must match the Product type defined above.
type Props = {
  product: Product;
  onAddToCart?: (product: Product) => void; //triggred when user clicks "Add to Cart" button
  onClick?: () => void; //triggered when the entire card is clicked—like making the card behave like a link or open a modal.
  clickable?: boolean; // default false
  showAddButton?: boolean;
  badgeText?: string; //Optional text to show as a badge like "New" or "Best Seller".
  className?: string;
};

//Props type ensures that product is a Product object with id, name, price...etc. uses object destructuring to pull out individual props from the Props object.
const ProductCard = ({
  product,
  onAddToCart,
  onClick,
  clickable = false,
  showAddButton = true,
  badgeText,
  className = "",
}: Props) => {
  const navigate = useNavigate();
  const goDetails = () => navigate(`/product/${product.id}`);

  //useMemo is a react hook that caches the result of a calculation. It only recalculates when product changes.This improves performance by avoiding unnecessary recalculations on every render.
  //priceToShow: If the product is on sale and has a valid salePrice, use that.Otherwise, use the regular price.
  //format the price in SGD using the JS built-in Javascript Intl.NumberFormat API to format the product's price.
  // { style: "currency", currency: "SGD" } tells it to format the number as Singapore Dollars.
  // .format(priceToShow) takes the raw number (e.g. 129.99) and turns it into "SGD 129.99".
  //React will only re-run the function inside useMemo if the [product] object changes.
  const formattedPrice = useMemo(() => {
    const priceToShow =
      product.isSale && product.salePrice ? product.salePrice : product.price;
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "SGD",
    }).format(priceToShow);
  }, [product]);

  // Check if there's a valid sale
  const hasSale =
    product.isSale && product.salePrice && product.salePrice < product.price;

  //Determine badge text
  const derivedBadge =
    badgeText ||
    (product.isBestSeller ? "Best Seller" : product.isNew ? "New" : undefined);

  // Handle whole-card click (if enabled) + optional external onClick hook
  const handleCardClick = () => {
    if (!clickable) return;
    if (onClick) {
      onClick();
      return;
    }
    goDetails();
  };

  // Keyboard activation (Enter/Space) for accessibility when clickable
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!clickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      className={`group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md ${
        clickable ? "cursor-pointer" : ""
      } ${className}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : -1}
      aria-label={clickable ? `View details for ${product.name}` : undefined}
    >
      {/* Product image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* badge */}
        {derivedBadge && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-semibold text-white ${
              derivedBadge === "Best Seller" ? "bg-[#d4af37]" : "bg-pink-700"
            }`}
          >
            {derivedBadge}
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="space-y-1 p-4">
        <h3 className="line-clamp-1 text-sm font-medium text-gray-900">
          {product.name}
        </h3>

        {/* Show subtitle if it exists - If product.subtitle exists (i.e., it's not null, undefined, or an empty string), then render this <p> tag. 
        shorthand for if (product.subtitle) {return <p>...</p>;}*/}
        {product.subtitle && (
          <p className="line-clamp-1 text-xs text-gray-500">
            {product.subtitle}
          </p>
        )}

        {/* Price Section */}
        <div className="mt-1">
          <span className="text-base font-semibold tracking-tight text-pink-700">
            {formattedPrice}
          </span>
          {hasSale && (
            <span className="ml-2 text-sm text-gray-400 line-through">
              {new Intl.NumberFormat("en-SG", {
                style: "currency",
                currency: "SGD",
              }).format(product.price)}
            </span>
          )}
        </div>

        {/* Add to cart Button */}
        {showAddButton && (
          <div className="mt-3">
            <Button
              className="bg-pink-700 hover:bg-pink-800"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onAddToCart?.(product);
              }}
            >
              Add to cart
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

// Sample product data
export const bestSellers: Product[] = [
  {
    id: "1",
    name: "Kundan Necklace Set",
    price: 179.0,
    image: "/featuredProducts/necklace.png",
    subtitle: "Jewellery · Kundan",
  },
  {
    id: "2",
    name: "Embroidered Kurti",
    price: 89.0,
    image: "/featuredProducts/Saree.png",
    subtitle: "Clothing · Kurtis",
  },
  {
    id: "3",
    name: "Jutti Mojari",
    price: 59.0,
    image: "/featuredProducts/Saree1.png",
    subtitle: "Footwear",
  },
  {
    id: "4",
    name: "Polki Earrings",
    price: 129.0,
    image: "/featuredProducts/Bangles.png",
    subtitle: "Jewellery · Polki",
  },
];

// Cart handler
export const handleAddToCart = (product: Product) => {
  console.log("Add to cart:", product.id);
};
