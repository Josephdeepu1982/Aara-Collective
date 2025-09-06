//Fetches a list of featured products from your backend API
// Converts each product into the format your UI card expects

import { useEffect, useState } from "react";
import FeaturedProducts from "./FeaturedProducts";
import api from "@/lib/api";
import type { Product as UIProduct } from "../components/ProductCard";
import { useCartContext } from "@/context/useCartContext";

//Converts a product from the API format into the format your UI card expects
const convertToUIProduct = (product: any): UIProduct => ({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  subtitle: product.subtitle,
  category: product.category,
  isNew: product.isNew,
  isSale: product.isSale,
  salePrice: product.salePrice,
  isBestSeller: product.isBestSeller,
});

const FeaturedProductsContainer = () => {
  const [items, setItems] = useState<UIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //gives access to the shared cart state and functions defined in CartProviderComponent.
  const { addItemToCart } = useCartContext();

  //fetchdata when the componenet loads. Calls getFeatured() to fetch products > Converts each product using mapToUI >Once done (success or fail), sets loading to false
  useEffect(() => {
    api
      .getFeaturedProducts()
      .then((data) => setItems(data.map(convertToUIProduct)))
      .catch((error) =>
        setError(error.message || "failed to load featured products"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="p-8 text-center text-sm">Loading featured…</div>;
  if (error)
    return <div className="p-8 text-center text-sm text-red-600">{error}</div>;

  const handleAddToCart = (p: UIProduct) => {
    addItemToCart({
      id: p.id,
      name: p.name,
      image: p.image,
      price: p.salePrice ?? p.price,
      salePrice: p.salePrice,
      quantity: 1,
    });
  };

  return (
    <FeaturedProducts
      products={items}
      title="Featured Products"
      onAddToCart={handleAddToCart}
    />
  );
};

export default FeaturedProductsContainer;
