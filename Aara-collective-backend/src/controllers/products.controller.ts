//Defines 3 functions to handle product-related API requests:
// 1. getProducts: returns a list of products based on query filters.
// 2. getProductById: returns details of a single product using its ID.
// 3. getFeatured: returns a list of featured products with simplified info.

import type { Request, Response } from "express";
import prisma from "../dao/prisma.js";
import {
  getFeaturedProducts,
  getProductById,
  listProducts,
} from "../services/products.service.js";
import { productQuerySchema } from "../dto/products.dto.js";
import { createProductSchema } from "../dto/products.dto.js";

type IdParams = { id: string };

type CreateProductBody = {
  name: string;
  subtitle?: string;
  description?: string;
  basePriceCents: number;
  salePriceCents?: number;
  isActive?: boolean;
  isSale?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  categoryId: string;
  images?: { url: string; alt?: string }[];
  variants?: {
    sku: string;
    name?: string;
    priceCents?: number;
    stock?: number;
  }[];
};

//Supports requests to get list of products
const getProducts = async (request: Request, response: Response) => {
  const validatedQuery = productQuerySchema.parse(request.query); //Validate and clean up the query parameters from the URL.
  // request.query contains all the query parameters from the URL.
  //productQuerySchema is a Zod schema we defined to describe what a valid query should look like
  // parse() takes the raw query object, validates it against schmea, Cleans it up (e.g., converts strings to numbers if needed)
  const productList = await listProducts(validatedQuery);
  response.json(productList); // Send the product list back to the frontend as JSON
};

//Get a single product by its ID
const getProductUsingId = async (request: Request, response: Response) => {
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

const getFeatured = async (request: Request, response: Response) => {
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

const handleCreateProduct = async (req: Request, res: Response) => {
  try {
    const parsed = createProductSchema.parse(req.body);

    const newProduct = await prisma.product.create({
      data: {
        name: parsed.name,
        basePriceCents: parsed.basePriceCents,
        isActive: parsed.isActive,
        isSale: parsed.isSale,
        isNew: parsed.isNew,
        isBestSeller: parsed.isBestSeller,
        categoryId: parsed.categoryId,
        ...(parsed.subtitle !== undefined && { subtitle: parsed.subtitle }),
        ...(parsed.description !== undefined && {
          description: parsed.description,
        }),
        ...(parsed.salePriceCents !== undefined && {
          salePriceCents: parsed.salePriceCents,
        }),
        ...(parsed.images && parsed.images.length > 0
          ? {
              images: {
                create: parsed.images.map((i) => ({
                  url: i.url,
                  alt: i.alt ?? null,
                })),
              },
            }
          : {}),
        ...(parsed.variants && parsed.variants.length > 0
          ? {
              variants: {
                create: parsed.variants.map((v) => ({
                  sku: v.sku,
                  priceCents: v.priceCents,
                  stock: v.stock,
                  name: v.name ?? null,
                })),
              },
            }
          : {}),
      },
      include: { images: true, variants: true, category: true },
    });

    res.status(201).json(newProduct);
  } catch (error: any) {
    console.error("Error creating product:", error);
    res.status(400).json({ error: error.message });
  }
};

const handleDeleteProduct = async (req: Request<IdParams>, res: Response) => {
  try {
    const { id } = req.params;

    // First check if product exists
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    const referenced = await prisma.orderItem.findFirst({
      where: { productId: id },
    });
    if (referenced) {
      return res.status(409).json({
        error:
          "Cannot delete product with existing order history. Consider setting isActive=false.",
      });
    }

    // Delete related product images first
    await prisma.productImage.deleteMany({ where: { productId: id } });

    // Delete related product variants (if you have them)
    await prisma.productVariant.deleteMany({ where: { productId: id } });

    // Delete order items referencing this product (if needed)
    await prisma.orderItem.deleteMany({ where: { productId: id } });

    // Delete product
    await prisma.product.delete({ where: { id } });
    res.json({ message: "Product deleted successfully", id });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

const component = {
  getProducts,
  getProductUsingId,
  getFeatured,
  handleDeleteProduct,
  handleCreateProduct,
};

export default component;
