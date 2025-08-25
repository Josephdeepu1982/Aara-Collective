//Business Rules for fetching product data from the backend and reshaping it for the frontend:
// 1. Listing products with filters and pagination
// 2. Fetching a single product by ID
// 3. Getting a list of featured products

import { findByID, findFeatured, findProducts } from "../dao/product.dao.js"; //functions to fetch products from the database
import clampPageSize from "../utils/pagination.js"; //helper to ensure that the number of items per page > 1 item and <100 items.
import type { ProductQuery } from "../dto/products.dto.js"; //Zod makes sure the incoming query parameters is in the format you expect, and gives you defaults or errors if it’s not.

const convertToCents = (price?: number) => {
  if (price != null) {
    return Math.round(price * 100); //rounds up/dn a number to the nearest integer
  }
  return undefined;
};

//listProducts(): Gets a list of products based on filters (category, price, status, etc.) and paginates the results.
// we define an async function called "listProducts" that takes in a query object which contains filters like category, price range, sort order, and pagination info.
//The query object represents user-supplied filters, typically parsed from the URL query string in a route like /shop?category=jewelry&page=2&sort=price-low.
export const listProducts = async (query: ProductQuery) => {
  const pageSize = clampPageSize(query.pageSize);
  //use imported helper clampPageSize() to ensure page size isn’t too big or too small. Prevents users from requesting 1000 products at once or crashing the backend.

  const offset = (query.page - 1) * pageSize; //Calculates how many products to skip based on the current page. For example, if you're on page 3 and showing 8 products per page, you skip the first 16 ((3 - 1) * 8).

  //We create an object called queryOptions, that will be passed to the backend DAO (findProducts()).
  //sort,skip & take will always be present, Conditionally added: categorySlug: if user selected a category, minCents: if user set a minimum price, maxCents: if user set a maximum price, status: if user filtered by "sale", "new", or "best"
  //Inline Type Definition written directly in declaration line (not stored in a separate type or interface): we tell typescript, queryOptions must match this exact shape defined.
  const queryOptions: {
    //Defines the type of queryOptions inline
    categorySlug?: string;
    minCents?: number;
    maxCents?: number;
    status?: "sale" | "new" | "best";
    sort: "newest" | "price-low" | "price-high" | "popular";
    skip: number;
    take: number;
  } = {
    //initialize the queryOptions with default values.
    sort: query.sort,
    skip: offset,
    take: pageSize,
  };
  //If the user selected a category (like "jewelry"), add it to the query options. This tells the backend to only fetch products from that category.
  if (query.category !== undefined) {
    queryOptions.categorySlug = query.category;
  }
  //Converts the minimum price from dollars to cents. Only adds it to the query if it’s defined.
  const minCents = convertToCents(query.minPrice);
  if (minCents !== undefined) {
    queryOptions.minCents = minCents;
  }
  const maxCents = convertToCents(query.maxPrice);
  if (maxCents !== undefined) {
    queryOptions.maxCents = maxCents;
  }
  //If the user filtered by status (like "sale" or "new"), include it in the query.
  if (query.status !== undefined) {
    queryOptions.status = query.status;
  }

  //Calls our DAO function findProducts() with the built query options.
  //Returns two things: rawProducts: the actual product data & totalCount: how many products matched the filters (used for pagination)
  const result = await findProducts(queryOptions);
  const rawProducts = result.items;
  const totalCount = result.total;

  //Loops through each product and transforms it into a shape that the frontend can easily render.
  //Choose the correct price: Sale/Regular Price
  const formattedProducts = rawProducts.map((product) => {
    const finalPriceCents =
      product.isSale && product.salePriceCents
        ? product.salePriceCents
        : product.basePriceCents;

    //Returns a clean object for each product with:
    return {
      id: product.id,
      name: product.name,
      price: finalPriceCents / 100, // Convert cents back to dollars
      image: product.images[0]?.url ?? "", // grabs the URL of the first image for a product if it exissts or fallback to empty string
      subtitle: product.category.name,
      category: product.category.name,
      isNew: product.isNew,
      isSale: product.isSale,
      salePrice: product.salePriceCents
        ? product.salePriceCents / 100
        : undefined,
      isBestSeller: product.isBestSeller,
      createdAt: product.createdAt,
      popularity: product.popularity,
    };
  });
  // Return formatted product list along with pagination info to teh front end
  return {
    items: formattedProducts,
    total: totalCount,
    page: query.page,
    pageSize: pageSize,
  };
};

//getProductById: Fetches a single product using its unique ID.
export const getProductById = (productId: string) => {
  return findByID(productId);
};

//getFeaturedProducts(): Retrieves a limited number of featured products for homepage display (default is 8)
export const getFeaturedProducts = (maxItems = 8) => {
  return findFeatured(maxItems);
};
