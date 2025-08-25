// This code centralizes all product-fetching logic in one place.
// Tells frontend how to fetch products from the database.

import { Prisma } from "../../generated/prisma/index.js"; //gives autocompletion
import prisma from "./prisma.js"; //imports your Prisma client instance, which is our app’s connection to the database.

// Defines an async function that takes in filtering and sorting options from the frontend (like category, price range, status, etc.) -> returns a list of products based on filters.
export async function findProducts(options: {
  categorySlug?: string; //if category is “Jewelry,” the is "jewelry" —> clean, lowercase, and URL-friendly.
  minCents?: number;
  maxCents?: number;
  status?: "sale" | "new" | "best";
  sort: "newest" | "price-low" | "price-high" | "popular";
  skip: number;
  take: number;
}) {
  const filters: any = {}; //Creates an empty object to store filters the user selects in the frontend (category, price range, status, etc.).
  // Later, it’s passed to prisma.product.findMany({ where: filters }) to query the database.

  //filter by category
  //User selects a category on the frontend, like “Jewelry”
  //category is passed to the backend as a string called categorySlug, e.g. "jewelry"
  //checks if user has selected a category -> if yes, it adds a filter to the query: Only fetch products whose related category has a matching slug.
  //filters.category = { slug: "jewelry" }; and And Prisma will return products that belong to the "Jewelry" category.
  if (options.categorySlug) {
    filters.category = { slug: options.categorySlug };
  }

  //filter by product status -> if the user selects “sale”, the filter becomes: filters.isSale = true;
  //When we pass this filters object into Prisma’s query: prisma.product.findMany({ where: filters, ...}), Prisma translates it into a SQL query
  if (options.status === "sale") filters.isSale = true;
  if (options.status === "new") filters.isNew = true;
  if (options.status === "best") filters.isBestSeller = true;

  //filter by price range
  //Checks if the user has provided either a minimum price (minCents) or a maximum price (maxCents). If neither is provided, we skip this whole block.
  //filters.OR = [ : OR condition to Show products that match either of the two price rules
  //gte: Greater than or equal to minCents (or 0 if not provided).
  // lte: Less than or equal to maxCents (or 9999999 if not provided).
  // user filters by: minPrice = 1000 & maxPrice = 5000 -> returns products on sale and not on sale with price between 1000 and 5000 (gte: 1000,lte: 5000)
  if (options.minCents != null || options.maxCents != null) {
    filters.OR = [
      {
        //products on sale
        salePriceCents: {
          gte: options.minCents ?? 0,
          lte: options.maxCents ?? 9999999,
        },
      },
      {
        //not sale price products
        AND: [
          { salePriceCents: null },
          {
            basePriceCents: {
              gte: options.minCents ?? 0,
              lte: options.maxCents ?? 9999999,
            },
          },
        ],
      },
    ];
  }

  //Sorting Logic
  // sets up a variable called sortOrder, which tells Prisma how to order the results
  //Use Arrays for price sorting: [{ salePriceCents: "asc" }, { basePriceCents: "asc" }] -> Try sorting by sale price first. If that’s missing, fall back to base price.
  let sortOrder: any = { createdAt: "desc" }; //By default, it sorts by createdAt in "desc" order. (newest products appear first.)
  if (options.sort === "price-low") {
    sortOrder = [{ salePriceCents: "asc" }, { basePriceCents: "asc" }];
    //It sorts first by: salePriceCents (if the product is on sale) Then basePriceCents (if not on sale) "asc" means ascending—from low to high.
  }
  if (options.sort === "price-high") {
    sortOrder = [{ salePriceCents: "desc" }, { basePriceCents: "desc" }];
  }
  if (options.sort === "popular") {
    sortOrder = { popularity: "desc" };
  }

  //Fetches both the list of products, and total count of products that match the filters, at the same time
  // it returns both together so your component has: The actual products to display & The total count for pagination (e.g. “Showing 8 of 120 items”)
  //const [products, totalCount] = await Promise.all([ runs two database queries in parallel using Promise.all, which is faster than doing them one after the other.
  //prisma.product.findMany(...)fetches the actual product data:

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: filters, // Only get products that match the filters (e.g. category, price range)
      //prisma maps to SQL: WHERE category_id = 'abc' AND sale_price_cents >= 1000
      orderBy: sortOrder, // Sort them (e.g. newest first, cheapest first)
      //ORDER BY created_at DESC
      skip: options.skip, // Skip some products (for pagination)
      //OFFSET 8 -> Skips the first 8 rows—useful for pagination.
      take: options.take, // Limit how many products to fetch (e.g. 8 per page). LIMIT 8: Fetches only 8 rows—again, for pagination.
      include: {
        images: { take: 1 }, // Include just one image per product (usually the thumbnail)
        category: true, // Include full category info (not just the ID)
      },
    }),
    prisma.product.count({ where: filters }), //This counts how many products match the filters, regardless of pagination.
    //So if you're showing 8 products per page, and this returns 120, you know there are 15 pages total.
  ]);
  return { items: products, total: totalCount };
}

//Get featured products (best sellers or new arrivals) for the carousel
//rabs a limited number of products that are either: Marked as best sellers Or flagged as new arrivals
//show 8 products by default
//eturn prisma.product.findMany({ -> runs a Prisma query to fetch multiple products from your database.
//Only fetch products that are either: Marked as isBestSeller: true Or marked as isNew: true
//Sorts the results so: Best sellers come first (isBestSeller: "desc" means true before false) Among those, newer products show up before older ones (createdAt: "desc")
export function findFeatured(limit = 8) {
  return prisma.product.findMany({
    where: {
      OR: [{ isBestSeller: true }, { isNew: true }],
    },
    orderBy: [{ isBestSeller: "desc" }, { createdAt: "desc" }],
    //"desc" means descending—from high to low.
    take: limit, //Limits how many products to return. If limit = 8, you get only 8 featured products.
    include: {
      images: { take: 1 }, //Includes one image per product (usually the thumbnail)
      category: true, //Includes the full category info (not just the ID)
    },
  });
}

//Get a single prodcut by its ID
//findByID takes input: id. We call this when a user clicks on a product to view its details.
//return prisma.product.findUnique({ tells Prisma to find one unique product in the database. It uses the id field to locate it.
export function findByID(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: true, //Get all images for the product (not just one thumbnail)
      category: true, //Get the full category object (like name, slug, etc.)
      variants: true, //Get all variants (like sizes, colors, or styles)
    },
  });
}
