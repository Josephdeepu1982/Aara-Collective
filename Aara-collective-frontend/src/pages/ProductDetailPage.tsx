import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { useCartContext } from "@/context/useCartContext";

import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  RefreshCw,
  ShieldCheck,
  Minus,
  Plus,
  ArrowRight,
} from "lucide-react";

//shadcn/ui
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import ProductCard from "@/components/ProductCard";
import { priceLabel } from "@/lib/money";

//----------Typescript Types--------------//

type Props = {};

//product variant, such as size or color.
type Variant = {
  name: string;
  inStock: boolean;
};

//customer review for product
type Review = {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
};

//product type
type Product = {
  id: string;
  name: string; // Product name
  price: number;
  salePrice?: number | null; // Optional sale price
  description: string;
  longDescription: string;
  category: string;
  images: string[]; // Array of image URLs
  variants: Variant[]; // Array of product variants
  features: string[];
  specifications: Record<string, string>; // Key-value specs (e.g., "Material": "Silk")
  //Record<string, string> is a TypeScript utility type that creates an object type with specific key-value constraints.
  reviews: Review[]; // Array of customer reviews
  relatedProducts: {
    // Array of related products
    id: string;
    name: string;
    price: number;
    image: string;
    subtitle?: string;
  }[];
};

const ProductDetailPage = ({}: Props) => {
  // props is currently empty object. We can add in props later

  const { id } = useParams<{ id: string }>();
  const { addItemToCart } = useCartContext();
  const { toast } = useToast();
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [tab, setTab] = useState<"description" | "specs" | "reviews">(
    "description",
  );
  const [qty, setQty] = useState(1);

  useEffect(() => {
    // handle missing id cleanly
    if (!id) {
      setLoading(false);
      setError("Missing product id.");
      return;
    }

    let cancelled = false; // guard setState after unmount
    setLoading(true);
    setError(null);

    api
      .getSingleProduct(id)
      .then((res: any) => {
        console.log("Fetched product:", res);
        if (cancelled) return;

      
        const mapped: Product = {
          id: String(res.id),
          name: res.name,
          price: res.basePriceCents ? res.basePriceCents / 100 : 0,
          salePrice: res.salePriceCents ? res.salePriceCents / 100 : null,
          description: res.description ?? "",
          longDescription: res.longDescription ?? "",
          category: res.category ?? "Jewellery",
          images: Array.isArray(res.images)
            ? res.images
            : res.image
              ? [res.image]
              : [],
          variants: (res.variants ?? []).map((v: any) => ({
            name: v.name,
            inStock: !!v.inStock,
          })),
          features: res.features ?? [],
          specifications: res.specifications ?? {},
          reviews: (res.reviews ?? []).map((r: any) => ({
            id: String(r.id),
            user: r.user ?? "Anonymous",
            avatar: r.avatar ?? "",
            rating: Number(r.rating ?? 0),
            date: r.date ?? "",
            title: r.title ?? "",
            comment: r.comment ?? "",
          })),
          relatedProducts: (res.relatedProducts ?? []).map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: p.price ?? 0,
            image: p.image,
            subtitle: p.subtitle,
          })),
        };

        setData(mapped);
        setSelectedImage(0);
        setSelectedVariant(mapped.variants[0]?.name ?? "");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load product";
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    console.log("Product id from URL:", id);
  }, [id]);

  if (loading)
    return <div className="p-8 text-center text-sm">Loading product…</div>;
  if (error)
    return <div className="p-8 text-center text-sm text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-center text-sm">Not found.</div>;

  // Use fetched data with a safe fallback to mock
  const product = data;

  const averageRating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    Math.max(1, product.reviews.length);

  //Price formatting helper
  //TypeScript arrow function that takes a number n (like 49.99) and returns a string like "SGD 49.99"
  //Number formatter using the Intl API
  //.format(n) -> applies the formatter to the number n

  const onAddToCart = () => {
    // build the cart item from your product state
    addItemToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice ?? undefined,
      image: product.images[0] ?? "/placeholder.png",
      quantity: qty, // your qty state
      variant: selectedVariant || undefined, // your variant state
    });

    toast({
      title: "Added to cart",
      description: `${product.name} (${selectedVariant || "Default"}) x${qty}`,
    });
  };
  //Increase / Decrease quantity
  // decQty decreases quantity but never below 1. Math.max(1, q - 1) to ensure the result is never less than 1
  // incQty increases quantity by 1.
  const decQty = () => setQty((q) => Math.max(1, q - 1));
  const incQty = () => setQty((q) => q + 1);

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="text-sm">
            <ol className="flex items-center">
              <li className="text-gray-500">
                <Link to="/" className="hover:text-pink-700">
                  Home
                </Link>
              </li>
              <li className="mx-2 text-gray-400">/</li>
              <li className="text-gray-500">
                <Link to="/shop" className="hover:text-pink-700">
                  Shop
                </Link>
              </li>
              <li className="mx-2 text-gray-400">/</li>
              <li className="text-pink-700 font-medium">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border bg-gray-50">
              <img
                src={product.images[selectedImage] || "/placeholder.png"}
                alt={product.name}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square overflow-hidden rounded-md border ${selectedImage === i ? "border-pink-700" : "border-gray-200"}`}
                >
                  <img
                    src={img}
                    alt={`${product.name}${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          {/* Right: Info */}
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <div className="mt-2 flex items-center">
                <div className="flex text-[#d4af37]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.round(averageRating)
                          ? "fill-[#d4af37]"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  {product.reviews.length} reviews
                </span>
              </div>
            </div>

            {/* Price */}
            <div>
              {product.salePrice != null ? (
                <div className="flex items-center">
                  <span className="text-3xl font-semibold text-pink-700">
                    {priceLabel(product.salePrice)}
                  </span>
                  <span className="ml-3 text-xl text-gray-400 line-through">
                    {priceLabel(product.price)}
                  </span>
                  <span>
                    SAVE{" "}
                    {priceLabel(
                      Math.max(0, product.price - (product.salePrice ?? 0)),
                    )}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-semibold text-gray-900">
                  {priceLabel(product.price)}
                </span>
              )}
            </div>
            {/* Short Description */}
            <p className="text-gray-700">{product.description}</p>

            {/* Variants */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-900">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isActive = selectedVariant === v.name;
                  return (
                    <button
                      key={v.name}
                      disabled={!v.inStock}
                      onClick={() => v.inStock && setSelectedVariant(v.name)}
                      className={`rounded-md border px-3 py-2 text-sm ${isActive ? "border-pink-700 bg-pink-50 text-pink-700" : "border-gray-700 hover:border-pink-300"} ${!v.inStock ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      {v.name}
                      {!v.inStock && (
                        <span className="ml-2 text-xs text-gray-500">
                          (Out of stock)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-900">
                Quantity
              </h3>
              <div className="flex w-32 items-center rounded-md border">
                <button
                  onClick={decQty}
                  className="px-3 py-2 text-gray-600 hover:text-pink-700"
                >
                  <Minus size={16} />
                </button>
                <input
                  readOnly
                  value={qty}
                  className="w-full py-2 text-gray-600 hover:text-pink-700"
                />
                <button
                  onClick={incQty}
                  className="px-3 py-2 text-gray-600 hover:text-pink-700"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button
                className="bg-pink-700 hover:bg-pink-800"
                onClick={onAddToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
              <Button variant="outline">
                <Heart className="mr-2 h-4 w-4" /> Add to Wishlist
              </Button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="flex items-center rounded-lg border p-3">
                <Truck className="mr-3 h-5 w-5 text-pink-700" />
                <div>
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-gray-500">On orders over S$50</p>
                </div>
              </div>
              <div className="flex items-center rounded-lg border p-3">
                <RefreshCw className="mr-3 h-5 w-5 text-pink-700" />
                <div>
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-gray-500">30 days</p>
                </div>
              </div>
              <div className="flex items-center rounded-lg border p-3">
                <ShieldCheck className="mr-3 h-5 w-5 text-pink-700" />
                <div>
                  <p className="text-sm font-medium">Secure Checkout</p>
                  <p className="text-xs text-gray-500">100% protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex gap-6 border-b">
            {/* flex: Lays out child elements (like buttons) in a row. */}
            <button
              onClick={() => setTab("description")}
              className={`border-b-2 py-3 text-sm font-medium ${
                tab === "description"
                  ? "border-pink-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              // onClick={() => setTab("description")} sets the active tab to "description"
              //className={...}: Dynamically applies styles based on whether the tab is active
              //tab === "description": border-pink-700: Highlights the bottom border in pink to show it's active. Else, border-transparent: Hides the border.
            >
              Description
            </button>
            <button
              onClick={() => setTab("specs")}
              className={`border-b-2 py-3 text-sm font-medium ${
                tab === "specs"
                  ? "border-pink-700 text-pink-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setTab("reviews")}
              className={`border-b-2 py-3 text-sm font-medium ${
                tab === "reviews"
                  ? "border-pink-700 text-pink-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Reviews ({product.reviews.length})
            </button>
          </div>

          {/* short-circuit conditional:if tab === "description" then render the below */}
          <div className="py-8">
            {tab === "description" && (
              <div>
                {/* whitespace-pre-line ensures that any \n line breaks in your text actually show up when rendered in the browser. */}
                <p className="whitespace-pre-line text-gray-700">
                  {product.longDescription}
                </p>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Features
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-gray-700">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === "specs" && (
              <div className="overflow-hidden rounded-lg border">
                <table className="min-w-full divide-y">
                  <tbody className="divide-y">
                    {Object.entries(product.specifications).map(
                      ([key, value], index) => (
                        <tr key={index}>
                          {/* w-1/3: Sets the width of the element to one-third of its parent's width. */}
                          <td className="w-1/3 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900">
                            {key}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {value}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "reviews" && (
              <div className="space-y-8">
                {/* Lays out two things side by side: Left: Review title and star rating Right: A button to write a review */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Customer Reviews
                    </p>
                    <div className="mt-1 flex items-center">
                      {/* Star Rating */}
                      {/* creates 5 stars using .map() */}
                      {/* { length: 5 }creates a new array with 5 empty slots. */}
                      {/* The underscore _ is just a placeholder for a value we don’t care about. we’re creating an array of 5 empty items, so twe write _ instead of unused.*/}
                      {/* For each star: If its index is less than the rounded average rating, it’s filled with gold (#d4af37). Otherwise, it’s gray (unfilled). */}
                      <div className="flex text-[#d4af37]">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={18}
                            className={
                              index < Math.round(averageRating)
                                ? "fill-[#d4af37]"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        Based on {product.reviews.length} reviews
                      </span>
                    </div>
                  </div>
                  <Button variant="outline">Write a review</Button>
                </div>

                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-start">
                      <img
                        src={review.avatar}
                        alt={review.user}
                        className="mr-4 h-10 w-10 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {review.user}
                        </p>
                        <div className="mt-1 flex items-center">
                          <div className="flex text-[#d4af37]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < review.rating
                                    ? "fill-[#d4af37]"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-xs text-gray-500">
                            {review.date}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-medium text-gray-900">
                          {review.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-700">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <Separator className="my-10" />

        {/* Related Products */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              You may also like
            </h2>
            <Link
              to="/shop"
              className="inline-flex items-center text-pink-700 hover:text-pink-800"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {product.relatedProducts.map((relatedProducts) => (
              <ProductCard
                key={relatedProducts.id}
                product={{
                  id: relatedProducts.id,
                  name: relatedProducts.name,
                  price: relatedProducts.price,
                  image: relatedProducts.image,
                  subtitle: relatedProducts.subtitle ?? "Jewellery",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  //--component end---
};

export default ProductDetailPage;
