import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GridIcon, ListIcon, FilterIcon } from "lucide-react";
import ProductCard, {
  type Product as UIProduct,
} from "@/components/ProductCard";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import type { ApiProduct } from "@/lib/api";

// shadcn/ui components
import { useCartContext } from "@/context/useCartContext";
import { useToast } from "@/hooks/use-toast";
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

// add this near your other types
type StatusState = { sale: boolean; newArrivals: boolean; best: boolean };

//---------------------Data from DB-----------------------------
// Converts backend product format to frontend format
const convertToUIProduct = (product: ApiProduct): UIProduct => ({
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

// Known category slugs your backend understands (for sidebar + URL)
const allowedCategories = ["jewellery", "clothing", "footwear"];

// Choose one status filter to send to backend
const chooseStatusFilter = (statusState: {
  sale: boolean;
  newArrivals: boolean;
  best: boolean;
}) => {
  if (statusState.sale) return "sale";
  if (statusState.newArrivals) return "new";
  if (statusState.best) return "best";
  return undefined;
};

//---------------------ShopPage Component-----------------------------

const ShopPage = () => {
  const navigate = useNavigate();
  const { addItemToCart } = useCartContext();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams(); //useSearchParams lets use read the current URL's query parameters.
  // For example: /shop?category=Jewellery&status=sale
  // searchParams.get("category") → "Jewellery"
  // searchParams.get("status") →  "sale"

  //UI States.
  // in Typescript we can specify <type> of value the state should hold.
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(true);

  // filters (state is the source of truth; we also mirror to URL)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  const [status, setStatus] = useState<StatusState>({
    sale: false,
    newArrivals: false,
    best: false,
  });
  const [sortBy, setSortBy] = useState<
    "newest" | "price-low" | "price-high" | "popular"
  >("newest");

  // paging
  const pageSize = 12;
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page") ?? "1"),
  );

  //data
  const [items, setItems] = useState<UIProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cat = searchParams.get("category");
    const catSlug = cat?.toLowerCase();
    if (
      catSlug &&
      allowedCategories.includes(catSlug as (typeof allowedCategories)[number])
    ) {
      setSelectedCategories([catSlug]);
    }
    const stat = searchParams.get("status");
    if (stat === "sale") setStatus((s) => ({ ...s, sale: true }));
    if (stat === "new") setStatus((s) => ({ ...s, newArrivals: true }));
    if (stat === "best") setStatus((s) => ({ ...s, best: true }));

    const sort = searchParams.get("sort");
    if (
      sort === "price-low" ||
      sort === "price-high" ||
      sort === "popular" ||
      sort === "newest"
    ) {
      setSortBy(sort);
    }

    const min = Number(searchParams.get("minPrice"));
    const max = Number(searchParams.get("maxPrice"));
    if (!Number.isNaN(min) || !Number.isNaN(max)) {
      setPriceRange([
        Number.isNaN(min) ? 0 : min,
        Number.isNaN(max) ? 1500 : max,
      ]);
    }
    const initialPage = Number(searchParams.get("page") ?? "1");
    setPage(Number.isNaN(initialPage) ? 1 : initialPage);

    if (window.location.hash === "#results") {
      setTimeout(
        () =>
          document
            .getElementById("results")
            ?.scrollIntoView({ behavior: "smooth" }),
        0,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- build API query from state -----
  const queryObject = useMemo(() => {
    const statusParam = chooseStatusFilter(status);
    const category = selectedCategories[0]; // API supports a single category
    return {
      category,
      status: statusParam, // "sale" | "new" | "best" | undefined
      sort: sortBy,
      page,
      pageSize,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 1500 ? priceRange[1] : undefined,
    };
  }, [selectedCategories, status, sortBy, page, pageSize, priceRange]);

  // ----- keep URL in sync with filters -----
  useEffect(() => {
    const sp = new URLSearchParams(searchParams);
    const statusParam = chooseStatusFilter(status);

    if (selectedCategories[0]) sp.set("category", selectedCategories[0]);
    else sp.delete("category");

    if (statusParam) sp.set("status", statusParam);
    else sp.delete("status");

    if (priceRange[0] > 0) sp.set("minPrice", String(priceRange[0]));
    else sp.delete("minPrice");
    if (priceRange[1] < 1500) sp.set("maxPrice", String(priceRange[1]));
    else sp.delete("maxPrice");

    if (sortBy !== "newest") sp.set("sort", sortBy);
    else sp.delete("sort");

    sp.set("page", String(page));

    setSearchParams(sp, { replace: true });
  }, [selectedCategories, status, sortBy, priceRange, page, setSearchParams]);

  // ----- fetch whenever query changes -----
  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .getProducts(queryObject)
      .then((res) => {
        setItems(res.items.map(convertToUIProduct));
        setTotal(res.total);
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Failed to load products";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [queryObject]);

  // helper to compute unit price
  const unitPrice = (p: UIProduct) =>
    p.isSale && typeof p.salePrice === "number" ? p.salePrice : p.price;

  // helper: add to cart + open drawer + toast
  const addToCartAndOpen = (p: UIProduct) => {
    const unit = unitPrice(p);
    addItemToCart({
      id: p.id,
      name: p.name,
      image: p.image,
      price: unit,
      // include salePrice for UI if present
      salePrice:
        p.isSale && typeof p.salePrice === "number" ? p.salePrice : undefined,
      quantity: 1,
    });
    window.dispatchEvent(new CustomEvent("cart:open")); // auto-open drawer
    toast({ title: "Added to cart", description: `${p.name} added.` });
  };

  // ----- UI helpers -----
  const toggleCategory = (c: string, checked: boolean | "indeterminate") => {
    const next = !!checked
      ? Array.from(new Set([...selectedCategories, c]))
      : selectedCategories.filter((x) => x !== c);
    setSelectedCategories(next.slice(0, 1)); // enforce single category for API
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  //-----Build the sidebar filters Panel that lets user select product categories, adjust price range and filter by product status-----//
  const FiltersPanel = (
    <div className="w-full md:w-64">
      <div className="rounded-lg border border-[#f6e7c8] bg-white p-4 shadow-sm">
        {/* categories */}
        {/* Loops through all available categories, and shows a checkbox for eachone */}
        {/* When checked/unchecked: Calls toggleCategory() to update selectedCategories, Triggers filtering logic and Resets pagination to page 1 */}
        <h3 className="mb-4 text-lg font-medium text-pink-800">Categories</h3>
        <div className="space-y-3">
          {allowedCategories.map((c) => (
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
    <div className="mx-auto w-full max-w-7xl px-4 py-8 pt-28">
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
              {items.map((p) => {
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
                    clickable
                    showAddButton={true}
                    onAddToCart={() => addToCartAndOpen(p)}
                  />
                );
              })}
            </div>
          ) : (
            // List view of products, that includes an image and price
            <div className="space-y-6">
              {items.map((p) => {
                const onSale = p.isSale && p.salePrice && p.salePrice < p.price;
                const unit = onSale ? p.salePrice! : p.price;
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
                        {/* 🔧 replaced inline logic with helper for parity */}
                        <Button
                          className="bg-pink-700 hover:bg-pink-800"
                          onClick={() => addToCartAndOpen(p)} // ✅ DRY behavior
                        >
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
