import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GridIcon, ListIcon, FilterIcon } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useNavigate } from "react-router-dom";

// shadcn/ui components
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

//type Product = { ... } defines a custom TypeScript type that describes the shape of a product object.
type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  subtitle?: string;
};

type ShopProduct = Product & {
  category: string;
  isNew?: boolean;
  isSale?: boolean;
  salePrice?: number;
  isBestSeller?: boolean;
  createdAt?: string;
  popularity?: number;
};

//---------------------Mock Data-----------------------------
//Mock Data to be replaced with Database API call
//ShopProduct[]: specifies that MOCK_PRODUCTS is an array where each element within the array must conform to the ShopProduct type
const MOCK_PRODUCTS: ShopProduct[] = [
  {
    id: "1",
    name: "Kundan Gold Necklace Set",
    price: 899,
    image: "/featuredProducts/necklace.png",
    category: "Jewellery",
    isNew: true,
    isBestSeller: true,
    popularity: 80,
    createdAt: "2025-08-01",
  },
  {
    id: "2",
    name: "Embroidered Silk Saree",
    price: 499,
    image: "/featuredProducts/Churidar.png",
    category: "Clothing",
    isSale: true,
    salePrice: 399,
    popularity: 95,
    createdAt: "2025-07-25",
  },
  {
    id: "3",
    name: "Traditional Juttis",
    price: 129,
    image: "/featuredProducts/shoes.png",
    category: "Footwear",
    popularity: 60,
    createdAt: "2025-07-15",
  },
  {
    id: "4",
    name: "Pearl Chandelier Earrings",
    price: 249,
    image: "/featuredProducts/earring1.png",
    category: "Jewellery",
    isNew: true,
    popularity: 70,
    createdAt: "2025-08-05",
  },
  {
    id: "5",
    name: "Bridal Lehenga Set",
    price: 1299,
    image: "/featuredProducts/Saree1.png",
    category: "Clothing",
    isBestSeller: true,
    popularity: 88,
    createdAt: "2025-07-05",
  },
  {
    id: "6",
    name: "Gold Bangles Set",
    price: 599,
    image: "/featuredProducts/Bracelet.png",
    category: "Jewellery",
    isSale: true,
    salePrice: 499,
    popularity: 77,
    createdAt: "2025-06-28",
  },
  {
    id: "7",
    name: "Kolhapuri Necklace",
    price: 89,
    image: "/featuredProducts/necklace2.png",
    category: "Jewellery",
    popularity: 55,
    createdAt: "2025-06-15",
  },
  {
    id: "8",
    name: "Traditional Saree",
    price: 159,
    image: "/featuredProducts/Saree.png",
    category: "Clothing",
    popularity: 65,
    createdAt: "2025-08-02",
  },
];

//---------------------ShopPage Component-----------------------------

const ShopPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); //useSearchParams lets use read the current URL's query parameters.
  // For example: /shop?category=Jewellery&status=sale
  // searchParams.get("category") → "Jewellery"
  // searchParams.get("status") →  "sale"

  //UI States.
  // in Typescript we can specify <type> of value the state should hold.
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "newest" | "price-low" | "price-high" | "popular"
  >("newest");
  const [showFilters, setShowFilters] = useState(true);

  //Set up Filters for categories, price range and status for  users to narrow down products they want to see
  //We need to identify all the available categories. allCategories looks at all the products, idenitfies their categories (Jewellery, clothing..etc) and creates an array
  //useMemo() categorizes the products once per page load, and caches the result. The empty dependency array [] means this logic runs only once when the component first mounts.
  //MOCK_PRODUCTS.map((p) => p.category) → MOCK_PRODUCTS.map() loops through all (product) and gets its category string. This creates an array of all categories (may include duplicates)
  // new Set(...) → Removes duplicates by converting the array into a Set
  // Array.from(...) → Converts the Set back into a regular array
  const allCategories = useMemo(() => {
    return Array.from(
      new Set(MOCK_PRODUCTS.map((product) => product.category)),
    );
  }, []);

  //selectedCategories keeps track of the categories the user has selected. Starts empty array.
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  //priceRange stores the minimum and maximum price the user wants to see. Uses a slider to select from a range from $0 to $1500.
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  //tracks whether the user wants to see: products on sale/new arrivals/best sellers.
  const [status, setStatus] = useState({
    sale: false,
    newArrivals: false,
    best: false,
  });

  //Pagination state →  keeps track of which page the user is currently viewing. Starts at page 1. When user clicks next page, setPage updates its value.
  const [page, setPage] = useState(1);
  const pageSize = 8; //defines how many products to show per page

  //------------------Get filter Data from URL so that URL can be shared----------------------//

  //useEffect runs once on mount, and again when allCategories changes (e.g. if Mock product data updates) or searchParams changes (e.g. if the URL query string changes)
  //Reads filters from the URL (category, status) and applies those filters to the component state
  //This makes your shop page URL-driven, so users can share links like /shop?category=Jewellery&status=sale#results
  useEffect(() => {
    //Grabs the value of the category (Example → ?category=earrings) & status (Example → ??status=sale) query parameter from the URL, and stores it in cat & stat
    const cat = searchParams.get("category");
    const stat = searchParams.get("status");

    //if cat from the URL exists and is a valid category → set it as the selected filter.
    // Uses decodeURIComponent in case the category name has URL-encoded characters (e.g. Clothing%20&%20Accessories).
    if (cat && allCategories.includes(decodeURIComponent(cat))) {
      setSelectedCategories([decodeURIComponent(cat)]);
    }
    //check if the URL says status=sale, status=new, or status=best → set it as the selected filter.
    //Take the current status object (s) (Line 172), Copy everything inside it (...s) & Then turn on one specific filter by setting its value to true
    if (stat === "sale") setStatus((s) => ({ ...s, sale: true }));
    if (stat === "new") setStatus((s) => ({ ...s, newArrivals: true }));
    if (stat === "best") setStatus((s) => ({ ...s, best: true }));

    // If the URL ends with #results, it scrolls smoothly to the results section
    // when someone clicks the link aaracollective.com/?category=earrings#results, the filtered grid will be displayed to them
    //setTimeout() helps schedule the execution of a function after a specified delay (specified in ms)
    if (window.location.hash === "#results") {
      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  }, [allCategories, searchParams]);

  //--------Applies Filters (Category, price & status) to show products that user has selected ------------//

  //useMemo caches the filtered result so it only recalculates when one of the dependencies changes.
  //MOCK_PRODUCTS.filter(...) loops through all products and returns only those that match the current filters.
  const filtered = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      //If the product (in MOCK_PRODUCTS) is on sale → use salePrice. else, use regular price
      const price = p.isSale && p.salePrice ? p.salePrice : p.price;

      //if no category is selected, then include all products. If some categories are selected, it returns true only for products that match one of them
      // logical OR (||) operator returns true if either side is true.
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category);

      //only include products whose price falls within the selected range.
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      //If the user didn't select the 'Sale' filter, show all products. if sale was selected, only show products that are actually on sale.
      const matchesStatus =
        (!status.sale || p.isSale) &&
        (!status.newArrivals || p.isNew) &&
        (!status.best || p.isBestSeller);

      //Only show products that match all three filters.
      return matchesCategory && matchesPrice && matchesStatus;
    });
  }, [selectedCategories, priceRange, status]);

  //---------- Take the list of filtered products and sort it based on price, popularity or newest arrivals-----------------//

  //useMemo cache the results and re-sort only when filtered products change or the sort oprion (sortBy) changes
  const sorted = useMemo(() => {
    const arr = [...filtered]; //Makes a copy of the filtered products so we don’t accidentally modify the original list.

    //switch() lets us compare one value against multiple possible cases, and run different code depending on which case matches. It is a cleaner alternative to writing a bunch of if...else if...else statements.
    // switch (value) {
    //case "option1": (Each case is a possible match)
    // code to run if value === "option1"
    //break; (tells JavaScript to stop checking further cases)
    //case "option2":
    // code to run if value === "option2"
    //break;
    //default: (code to run if none of the above match)

    //Sort(): If the result is negative → a comes before b
    //If the result is positive → b comes before a
    //If the result is zero → they stay in the same order
    switch (sortBy) {
      case "price-low": // Sort products from low to high
        arr.sort((a, b) => {
          const pa = a.isSale && a.salePrice ? a.salePrice : a.price;
          const pb = b.isSale && b.salePrice ? b.salePrice : b.price;
          return pa - pb;
        });
        break;
      case "price-high": // Sort products from high to low
        arr.sort((a, b) => {
          const pa = a.isSale && a.salePrice ? a.salePrice : a.price;
          const pb = b.isSale && b.salePrice ? b.salePrice : b.price;
          return pb - pa;
        });
        break;
      case "popular": // Sort by popularity
        arr.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
        //If b.popularity is defined, use it. If it's null or undefined, use 0 instead.
        break;
      case "newest": // Sort by newest first
      default:
        arr.sort((a, b) => {
          return (
            new Date(b.createdAt ?? "").getTime() -
            new Date(a.createdAt ?? "").getTime()
            //If b.createdAt exists, use it. If it’s undefined or null, use an empty string "" instead.
            //new Date(...) Converts the string (like "2025-08-01") into a JavaScript Date object.
            //.getTime(): Converts the Date into a timestamp — a number representing milliseconds since Jan 1, 1970.
          );
        });
        break;
    }
    return arr;
  }, [filtered, sortBy]);

  //pagination logic → Calculates how many pages are needed to show in the pagination bar
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  //Total number of products after sorting / number of products we want to show per page. Example: 42 / 12 = 3.5 → You need 4 pages to show all items
  //Math.ceil(...): Rounds up to the nearest whole number
  //Math.max(1, ...): Ensures you always have at least 1 page, even if there are 0 products

  //pagination logic → Display only the products for the current page (not all at once)
  //(page - 1) * pageSize = 12 → Start index
  //page * pageSize = 24 → End index
  //sorted.slice(12, 24) → This grabs products from index 12 to 23 — the second page of items.
  const pageItems = sorted.slice((page - 1) * pageSize, page * pageSize);

  //pageSize = how many products per page (fixed number)
  // totalPages = how many pages the album needs
  // pageItems = dynamic array that contains the actual products to show on the current page (Example: 8,8,2)

  // ----- When user checks / unchecks a category filter, handle update of selectedCategories -----//
  //Typescript function Paramters: c is the category name (e.g. "Necklaces")
  //checked: whether the checkbox is checked (true) or unchecked (false) can be either boolean or a string true or false.
  const toggleCategory = (c: string, checked: boolean | string) => {
    setPage(1); //resets the pagination to 1
    //updates list of selected categories
    setSelectedCategories(
      //prev is short for previous state. represents the current value of selectedCategories before the update.
      (prev) =>
        checked ? [...new Set([...prev, c])] : prev.filter((x) => x !== c),
      //if Checked? is true, it adds categoreis to the list of categories. set avoids duplicate categories
      //if unchecked (checked? is false), Remove the category c from the list.
      // filter(x is a parameter — each item in the array being processed. x !== c is the condition that checks if x is not equal to c) returns true / false
    );
  };

  //-----Build the sidebar filters Panel that lets user select product categories, adjust price range and filter by product status-----//
  const FiltersPanel = (
    <div className="w-full md:w-64">
      <div className="rounded-lg border border-[#f6e7c8] bg-white p-4 shadow-sm">
        {/* categories */}
        {/* Loops through all available categories, and shows a checkbox for eachone */}
        {/* When checked/unchecked: Calls toggleCategory() to update selectedCategories, Triggers filtering logic and Resets pagination to page 1 */}
        <h3 className="mb-4 text-lg font-medium text-pink-800">Categories</h3>
        <div className="space-y-3">
          {allCategories.map((c) => (
            <label key={c} className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={selectedCategories.includes(c)}
                onCheckedChange={(checked) => toggleCategory(c, checked)}
              />
              {/* Label text next to the checkbox */}
              <span>{c}</span>
            </label>
          ))}
        </div>
        {/* Price Range */}
        {/* Shows a slider from $0 to $1500. Updates priceRange state */}
        <h3 className="mt-6 mb-4 text-lg font-medium text-pink-800">
          Price Range
        </h3>
        <Slider
          value={priceRange}
          min={0}
          max={1500}
          step={10}
          onValueChange={(val) => {
            setPage(1);
            setPriceRange([val[0], val[1]]);
          }}
        />
        {/* Displays the selected min and max prices below the slider */}
        <div className="mt-2 flex justify-between text-xs text-gray-600">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
        {/* Status */}
        {/* Loops through three status types sale, newArrivals & best */}
        {/* When checkbox is checked */}
        <h3 className="mt-6 mb-4 text-lg font-medium text-pink-800">
          Product Status
        </h3>
        <div className="space-y-3 text-sm">
          {["sale", "newArrivals", "best"].map((key) => (
            <label key={key} className="flex items-center gap-3">
              <Checkbox
                checked={status[key as keyof typeof status]}
                // As valid status keys are "sale" | "newArrivals" | "best" and not any string, we need to tell typescript that the string is one of the known keys in status
                onCheckedChange={(v) => {
                  setPage(1);
                  setStatus((s) => ({ ...s, [key]: !!v }));
                  // s is the previous state of status
                  //[key]: !!v updates the specific key with the new value
                  //!!v converts it to a strict boolean: !!true → true
                  //So if the checkbox is checked, v is true. If unchecked v is false
                }}
              />
              {/* Shows the labels next to the checkbox */}
              {/* Uses ternary chain for conditonal rendering: If key is "sale" → show "On Sale", If key is "newArrivals" → show "New Arrivals", Otherwise → show "Best Sellers" */}
              <span>
                {key === "sale"
                  ? "On Sale"
                  : key === "newArrivals"
                    ? "New Arrivals"
                    : "Best Sellers"}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  //--------Render-----//
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold">Shop</h1>
        <p className="mt-1 text-gray-600">
          Discover our collection of modern Indian accessories
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* on Mobile a Filters button appears*/}
        <div className="flex items-center gap-2">
          {/* shadcn drawer component that gives us a sliding panel (drawer). */}
          <Sheet>
            <SheetTrigger asChild>
              {/* //asChild means it wraps a custom trigger element—a <Button>. */}
              <Button variant="outline" className="md:hidden">
                <FilterIcon className="mr-2 h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side={"left"} className="w-80">
              {/* The actual panel that slides from left side. */}
              <SheetHeader>
                <SheetTitle className="text-left">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-6">{FiltersPanel}</div>
            </SheetContent>
          </Sheet>

          {/* On desktop, users see a Show / Hide Filters button */}
          <Button
            variant="ghost"
            className="hidden md:inline-flex"
            // Hidden on mobile, visible on medium screens and up.
            onClick={() => setShowFilters((v) => !v)}
            // Toggles the showFilters state between true and false.
            //(v) => !v : receives the previous value of showFilters (v) and returns its opposite.
          >
            <FilterIcon />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {/* Dynamically changes the button label based on current state. */}
          </Button>
        </div>

        {/* Create a Sorting dropdown list */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Sort by</span>
            <Select
              value={sortBy}
              onValueChange={(
                v: "newest" | "price-low" | "price-high" | "popular",
              ) => {
                setPage(1);
                setSortBy(v);
              }}
              // Controlled component: value={sortBy} keeps it in sync with state.
              // v: "newest" | "price-low" | "price-high" | "popular" is typescript to ensure only valid sort options are passed to setSortBy.
            >
              {/* SelectTrigger is the clickable dropdown box.
              SelectValue shows the current selection or a placeholder ("Newest"). */}
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Newest" />
              </SelectTrigger>
              <SelectContent>
                {/*SelectContent Defines drop down menu items */}
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle to switch between grid view and list view */}
          <div className="ml-2 flex items-center gap-1">
            <Button
              size="icon" // Size: icon makes it a square button sized for icons.
              variant={viewMode === "grid" ? "default" : "outline"} //Variant: "default" if grid view is active (solid button)."outline" if not (bordered button).
              onClick={() => setViewMode("grid")}
              className={
                viewMode === "grid" //viewMode is useState with typescript defines "grid"|"list"
                  ? "bg-pink-700 hover:bg-pink-800 text-white"
                  : ""
              }
              aria-label="Grid view"
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className={
                viewMode === "list"
                  ? "bg-pink-700 hover:bg-pink-800 text-white"
                  : ""
              }
              aria-label="List view"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with two sections: filters sidebar and product results */}
      <div className="flex gap-6">
        {/* Desktop filters Sidebar  */}
        {/* If showFilters is true, it shows the filter panel. hidden on smaller screens */}
        {showFilters && <div className="hidden md:block">{FiltersPanel}</div>}

        {/* Section to display all Products */}

        {/* Grid View : products rendered using a ProductCard component*/}
        {/* If the product is on sale, it shows the sale price; otherwise, it shows the regular price.*/}
        <div id="results" className="min-w-0 flex-1">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pageItems.map((p) => {
                const cardPrice =
                  p.isSale && p.salePrice ? p.salePrice : p.price;
                return (
                  <ProductCard
                    key={p.id}
                    product={{
                      id: p.id,
                      name: p.name,
                      image: p.image,
                      price: cardPrice,
                      subtitle: p.category,
                    }}
                    clickable // ⬅️ whole card navigates to /product/:id
                    showAddButton={false}
                  />
                );
              })}
            </div>
          ) : (
            // List view of products, that includes an image and price
            <div className="space-y-6">
              {pageItems.map((p) => {
                const onSale = p.isSale && p.salePrice && p.salePrice < p.price;
                return (
                  <div
                    key={p.id}
                    className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm sm:flex-row"
                  >
                    <div className="h-48 w-full sm:w-48">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {/* Details */}
                    <div className="flex-1 p-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{p.category}</p>

                      {/* Price Formatting in SGD*/}
                      {/* Intl.NumberFormat is a built-in JavaScript tool that helps you format numbers based on a specific locale and style. */}
                      {/* .format(p.price)	Takes the actual number (like 49.99) and formats it into a currency string (like $49.99 or S$49.99) */}
                      {/* If onSale is true, The sale price in pink and bold. If false, The original price in gray and strikethrough */}
                      <div className="mt-2">
                        {onSale ? (
                          <>
                            <span className="font-semibold text-pink-700">
                              {Intl.NumberFormat("en-SG", {
                                style: "currency",
                                currency: "SGD",
                              }).format(p.salePrice!)}
                            </span>
                            <span className="ml-2 text-sm text-gray-400 line-through">
                              {Intl.NumberFormat("en-SG", {
                                style: "currency",
                                currency: "SGD",
                              }).format(p.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-gray-900">
                            {Intl.NumberFormat("en-SG", {
                              style: "currency",
                              currency: "SGD",
                            }).format(p.price)}
                          </span>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="mt-4 flex gap-3">
                        <Button className="bg-pink-700 hover:bg-pink-800">
                          Add to cart
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/product/${p.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-10">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) {
                        setPage(page - 1);
                        document
                          .getElementById("results")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={page === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i + 1);
                        document
                          .getElementById("results")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) {
                        setPage(page + 1);
                        document
                          .getElementById("results")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ShopPage;
