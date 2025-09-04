//Defines 3 functions to handle product-related API requests:
// 1. getProducts: returns a list of products based on query filters.
// 2. getProductById: returns details of a single product using its ID.
// 3. getFeatured: returns a list of featured products with simplified info.

import type { Request as ExpressRequest, Response } from "express";
import {
  getFeaturedProducts,
  getProductById,
  listProducts,
} from "../services/products.service.js"; // service functions that fetch product data from the backend
import { productQuerySchema } from "../dto/products.dto.js"; // Schema to checks if the query parameters are valid

//Supports requests to get list of products
const getProducts = async (request: ExpressRequest, response: Response) => {
  const validatedQuery = productQuerySchema.parse(request.query); //Validate and clean up the query parameters from the URL.
  // request.query contains all the query parameters from the URL.
  //productQuerySchema is a Zod schema we defined to describe what a valid query should look like
  // parse() takes the raw query object, validates it against schmea, Cleans it up (e.g., converts strings to numbers if needed)
  const productList = await listProducts(validatedQuery);
  response.json(productList); // Send the product list back to the frontend as JSON
};

//Get a single product by its ID
const getProductUsingId = async (
  request: ExpressRequest,
  response: Response
) => {
  const productId = request.params.id; // Get the product ID from the URL path
  if (!productId) {
    return response.status(400).json({ error: "Product ID is required" });
  }
  const productDetails = await getProductById(productId);
  if (!productDetails) {
    return response.status(404).json({ error: "Product not found" });
  }
  response.json(productDetails);
};

const getFeatured = async (request: ExpressRequest, response: Response) => {
  const featuredList = await getFeaturedProducts(8); // Fetch 8 featured products from the backend

  // Format each product to only include the fields needed by the frontend
  const formattedList = featuredList.map((productItem) => {
    return {
      id: productItem.id,
      name: productItem.name,
      price:
        (productItem.isSale && productItem.salePriceCents
          ? productItem.salePriceCents
          : productItem.basePriceCents) / 100,
      image: productItem.images[0]?.url ?? "",
      subtitle: productItem.category.name,
      isBestSeller: productItem.isBestSeller,
    };
  });
  response.json(formattedList);
};

const component = {
  getProducts,
  getProductUsingId,
  getFeatured,
};

export default component;
