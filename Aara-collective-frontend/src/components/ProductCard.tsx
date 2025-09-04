import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/context/useCartContext";

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

type Props = {
  product: Product;
  clickable?: boolean;
  onAddToCart?: (p: Product) => void;
  showAddButton?: boolean;
  onClick?: () => void;
  className?: string;
};

const sgd = (amount: number) =>
  new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(
    amount,
  );

const ProductCard: React.FC<Props> = ({
  product,
  clickable = false,
  onAddToCart,
  showAddButton = true,
  onClick,
  className = "",
}) => {
  const navigate = useNavigate();
  const { addItemToCart } = useCartContext();

  const priceToShow =
    product.isSale && typeof product.salePrice === "number"
      ? product.salePrice
      : product.price;

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addItemToCart({
        id: product.id,
        name: product.name,
        image: product.image,
        price: priceToShow,
        salePrice:
          product.isSale && typeof product.salePrice === "number"
            ? product.salePrice
            : undefined,
        quantity: 1,
      });
    }
    window.dispatchEvent(new CustomEvent("cart:open"));
  };

  const handleCardClick = () => {
    if (onClick) return onClick();
    if (clickable) navigate(`/product/${product.id}`);
  };

  return (
    <div
      role={clickable || onClick ? "button" : "group"}
      tabIndex={clickable || onClick ? 0 : -1}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if ((clickable || onClick) && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-[#f6e7c8] bg-white shadow-sm transition hover:shadow-md ${className}`} // ✅
    >
      {/* Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {product.isNew && (
          <span className="absolute left-2 top-2 rounded bg-pink-700 px-2 py-0.5 text-xs font-semibold text-white">
            NEW
          </span>
        )}
        {product.isBestSeller && (
          <span className="absolute right-2 top-2 rounded bg-yellow-500/90 px-2 py-0.5 text-xs font-semibold text-white">
            ★ Best Seller
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3">
        <div className="min-h-[3.5rem]">
          <h3 className="line-clamp-1 text-[15px] font-medium text-gray-900">
            {product.name}
          </h3>
          {product.subtitle && (
            <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
              {product.subtitle}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          {product.isSale && typeof product.salePrice === "number" ? (
            <>
              <span className="text-[15px] font-semibold text-pink-700">
                {sgd(product.salePrice)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {sgd(product.price)}
              </span>
            </>
          ) : (
            <span className="text-[15px] font-semibold text-gray-900">
              {sgd(product.price)}
            </span>
          )}
        </div>

        {/* CTA */}
        {showAddButton && (
          <div className="mt-3">
            <Button
              className="w-full bg-pink-700 hover:bg-pink-800"
              onClick={handleAdd}
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
