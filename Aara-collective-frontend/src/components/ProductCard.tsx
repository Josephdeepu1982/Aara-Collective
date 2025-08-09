import React from "react";

//type Product = { ... } defines a custom TypeScript type that describes the shape of a product object.
//export makes that type available to other files that import it.
export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  subtitle?: string;
};
//describes the shape of the props object that a React component will receive. type Props = { ... } creates a custom Typescript type named Props. We say that Props must include a product key, and its value must match the Product type defined above.
type Props = {
  product: Product;
  onAddToCart?: (product: Product) => void;
};

//Props type ensures that product is a Product object with id, name, price...etc
const ProductCard = ({ product, onAddToCart }: Props) => {
  //format the price in SGD using the JS built-in Javascript Intl.NumberFormat API to format the product's price.
  // { style: "currency", currency: "SGD" } tells it to format the number as Singapore Dollars.
  // .format(product.price) takes the raw number (e.g. 129.99) and turns it into "SGD 129.99".
  const formattedPrice = Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(product.price);

  return (
    <div className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
      {/* Product image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* badge */}
        <span className="absolute left-2 top-2 rounded-full bg-gold-500/90 px-2 py-1 text-xs font-semibold text-white">
          Best Seller
        </span>
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

        {/* Price */}
        <p className="text-base font-semibold tracking-tight text-pink-700">
          {formattedPrice}
        </p>

        {/* Add to cart Button */}
        <button
          className="mt-2 w-full rounded-md bg-pink-700 py-2 text-sm font-medium text-white transtiion hover:bg-pink-800"
          onClick={() => onAddToCart?.(product)} // optional chaining to avoid errors
          aria-label={`Add ${product.name} to cart`}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

// 🛍️ Sample product data
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
