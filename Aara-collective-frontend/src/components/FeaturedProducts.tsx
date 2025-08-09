import React, { useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { CarouselApi } from "@/components/ui/carousel";
import ProductCard, { type Product } from "./ProductCard";
//This is a TypeScript-specific import. It imports a type definition named Product from the same file.

///describes the shape of the props object that a React component will receive.
type Props = {
  products: Product[]; //list of best selling products
  onAddToCart?: (product: Product) => void; // callback when adding to cart
  title?: string; //section title
};

const FeaturedProducts = ({
  products,
  onAddToCart,
  title = "Featured Products",
}: Props) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  //we use api to access carousel methods like scrollNext() and scrollPrev().
  //useState<...>(null) initializes state with null. The generic <...> tells TypeScript what type api will eventually be.
  //CarouselApi | null: api will either be CarouselApi or null. CarouselApi passes us an object with methods like .scrollPrev() and .scrollNext().

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10">
      {/* Section Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900">
            {" "}
            {title}
          </h2>
          <p className="text-sm text-gray-500">
            Our most popular pieces loved by customers
          </p>
        </div>

        {/* Chevron buttons */}
        <div className="hidden gap-2 md:flex">
          <button
            onClick={() => api?.scrollPrev()}
            className="rounded-full bg-pink-800/60 p-2 text-white transition hover:bg-pink-700/80"
            aria-label="Previous products"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => api?.scrollNext()}
            className="rounded-full bg-pink-800/60 p-2 text-white transition hover:bg-pink-700/80"
            aria-label="Next products"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      {/* Carousel with product cards */}
      {/* Carousel accepts a setApi prop — this gives you access to the internal carousel API (like .scrollNext()). */}
      {/* CarouselContent is the scrollable track that holds all the items. */}
      {/* We map over a list of products and rendering each one as a carousel item. basis-* classes control how many items are visible per screen size: */}
      {/* ProductCard receives the product data and a callback for adding to cart. */}
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-3/4 pl-2 sm:basis-1/2 md:basis-1/3 md:pl-4 lg:basis-1/4"
            >
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Mobile chevron buttons (overlayed) */}
        <button
          onClick={() => api?.scrollPrev()}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-pink-800/60 p-2 text-white transition hover:bg-pink-700/80 md:hidden"
          aria-label="Previous products"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => api?.scrollNext()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-pink-800/60 p-2 text-white transition hover:bg-pink-700/80 md:hidden"
          aria-label="Next products"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </Carousel>
    </section>
  );
};

export default FeaturedProducts;
