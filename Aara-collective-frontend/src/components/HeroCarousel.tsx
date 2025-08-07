import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const slides = [
  {
    image: "/carousel/Banner1.png",
    title: "Authentic Indian Elegance",
    subtitle:
      "Discover handcrafted jewelry that brings India's rich heritage to your doorstep",
    cta: "Shop Now",
    link: "/jewellery",
  },
  {
    image: "/carousel/Banner2.png",
    title: "Traditional Attire",
    subtitle: "Elegant sarees and ethnic wear for the modern woman",
    cta: "Explore",
    link: "/clothing",
  },
  {
    image: "/carousel/Banner3.png",
    title: "Artisanal Footwear",
    subtitle: "Step into comfort and style with our handcrafted shoes",
    cta: "View Collection",
    link: "/shoes",
  },
];

const HeroCarousel = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  );

  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect(); // initial
  }, [api]);

  return (
    <div className="relative w-full h-screen">
      <Carousel
        plugins={[plugin.current]}
        setApi={setApi}
        className="w-full overflow-hidden"
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="relative h-screen aspect-[16/9]">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40">
                <div className="absolute inset-0 flex flex-col justify-center items-start z-10 px-20 max-w-xl">
                  <h2 className="text-white text-4xl font-bold font-serif mb-2">
                    {slide.title}
                  </h2>
                  <p className="text-white text-lg mb-4">{slide.subtitle}</p>
                  <a
                    href={slide.link}
                    className="bg-pink-700 hover:bg-pink-800 text-white py-2 px-6 rounded-md font-medium"
                  >
                    {slide.cta}
                  </a>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`w-3 h-3 rounded-full transition-all bg-brand-gold-500 ${
                i === selectedIndex
                  ? "bg-gold-400 scale-110"
                  : "bg-white bg-opacity-50 hover:bg-gold-300"
              }`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default HeroCarousel;
