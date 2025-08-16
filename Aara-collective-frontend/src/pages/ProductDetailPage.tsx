import { useState } from "react";
import { Link, useParams } from "react-router-dom";
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

//------Mock Data using Product type. To be replaced with API----------//
const MOCK_PRODUCT: Product = {
  id: "1",
  name: "Kundan Gold Necklace Set",
  price: 899,
  salePrice: null,
  description:
    "Handcrafted Kundan set with meenakari detailing and semi-precious stones. Perfect for weddings and celebrations.",
  longDescription:
    "Kundan jewelry has a rich history dating back to the Mughal era.\n\nEach piece is carefully hand‑set in gold-plated frames with attention to detail. The necklace features floral motifs, complemented by matching earrings and a maang tikka.",
  category: "Jewellery",
  images: [
    "https://images.unsplash.com/photo-1601821765780-754fa98637c1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1200&q=80",
  ],
  variants: [
    { name: "Gold", inStock: true },
    { name: "Rose Gold", inStock: true },
    { name: "Silver", inStock: false },
  ],
  features: [
    "Authentic Kundan work with gold plating",
    "Semi-precious stones and pearls",
    "Includes necklace, earrings, and maang tikka",
    "Handcrafted by skilled artisans",
    "Comes in a premium gift box",
  ],
  specifications: {
    Material: "Gold plated",
    "Stone Type": "Kundan, semi-precious stones",
    Weight: "Approx. 120g",
    "Closure Type": "Lobster clasp",
    Occasion: "Wedding, Festival, Ceremony",
    Care: "Store in dry box, avoid water and perfume",
  },
  reviews: [
    {
      id: "r1",
      user: "Priya Sharma",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      rating: 5,
      date: "2 months ago",
      title: "Stunning craftsmanship",
      comment:
        "Purchased for my wedding—quality and detailing are exceptional. Looked even better in person!",
    },
    {
      id: "r2",
      user: "Ananya Gupta",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 4,
      date: "3 months ago",
      title: "Beautiful but a bit heavy",
      comment:
        "Absolutely gorgeous piece. Slightly heavier than expected, but it makes a statement.",
    },
  ],
  //Related Prodcuts Section
  relatedProducts: [
    {
      id: "2",
      name: "Pearl Chandelier Earrings",
      price: 249,
      image:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      subtitle: "Jewellery",
    },
    {
      id: "3",
      name: "Gold Bangles Set",
      price: 599,
      image:
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80",
      subtitle: "Jewellery",
    },
    {
      id: "4",
      name: "Ruby Studded Maang Tikka",
      price: 349,
      image:
        "https://images.unsplash.com/photo-1610951771882-a9b23e7b21ff?auto=format&fit=crop&w=800&q=80",
      subtitle: "Jewellery",
    },
    {
      id: "5",
      name: "Antique Gold Jhumkas",
      price: 199,
      image:
        "https://images.unsplash.com/photo-1575863438850-fb1c06a38885?auto=format&fit=crop&w=800&q=80",
      subtitle: "Jewellery",
    },
  ],
};

//-------------Component-----------------//

const ProductDetailPage = ({}: Props) => {
  // props is currently empty object. We can add in props later

  // *Placeholder* We use useParams() to extract the id from the URL (e.g. /product/1). Here we use Mock data
  const { id } = useParams();
  //*Placeholder* Assign the mock data to a variable. API fetch in real app
  const product = MOCK_PRODUCT;

  //UI States
  // State to show product image
  const [selectedImage, setSelectedImage] = useState(0);
  //Controls which tab is active in the UI. 3 valid types.
  const [tab, setTab] = useState<"description" | "specs" | "reviews">(
    "description",
  );
  //Tracks the quantity of the product the user wants to buy.
  const [qty, setQty] = useState(1);

  // <string> annotation tells TypeScript this state will always be a string.
  //product.variants[0]? -> access the name of the first variant in the product.variants array.
  //?.name is optional chaining -> If product.variants[0] is undefined or null, it won’t crash the app.Instead, it returns undefined.
  //?? "" is the nullish coalescing operator.It returns the value on the left unless that value is null or undefined.If the left side is undefined, it falls back to the right side ("").
  const [selectedVariant, setSelectedVariant] = useState<string>(
    product.variants[0]?.name ?? "",
  );

  //Average rating calculation
  //we sum up all the review ratings and divide by total number of reviews for the product.
  //.reduce() method loops through all reviews and add up their rating values.
  //  acc is the accumulator (starts at 0)
  //  r is each individual review
  //  r.rating accesses the rating property inside the review object.
  //Math.max(1, ....) avoids division by zero (divide by 1 instead of 0).
  const averageRating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    Math.max(1, product.reviews.length);

  //Price formatting helper
  //TypeScript arrow function that takes a number n (like 49.99) and returns a string like "SGD 49.99"
  //Number formatter using the Intl API
  //.format(n) -> applies the formatter to the number n

  const priceLabel = (n: number) =>
    Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(
      n,
    );

  //Increase / Decrease quantity
  // decQty decreases quantity but never below 1. Math.max(1, q - 1) to ensure the result is never less than 1
  // incQty increases quantity by 1.
  const decQty = () => setQty((q) => Math.max(1, q - 1));
  const incQty = () => setQty((q) => q + 1);

  //--component end---
};
