// Data Transfer Object: DTO is an object that carries data between processes.
//We can’t control what’s in the URL. Someone might mistype minPrice=free or page=-1. Zod helps you validate and clean that data before your backend or frontend uses it.
// Zod makes sure the incoming query parameters is in the format you expect, and gives you defaults or errors if it’s not.

import { z } from "zod";

export const productQuerySchema = z.object({
  category: z.string().optional(), //field: category, accpets a string (optional) -> Lets users filter products by category (e.g., "jewelry", "bags")
  minPrice: z.coerce.number().min(0).optional(),
  //field: minPrice, accepts a number ≥ 0 (optional) -> Filters products with price above this value
  maxPrice: z.coerce.number().min(0).optional(),
  status: z.enum(["sale", "new", "best"]).optional(), //field: status accepts One of "sale", "new", "best" (optional) -> Filters by product status or tag
  sort: z
    .enum(["newest", "price-low", "price-high", "popular"])
    .default("newest"),
  page: z.coerce.number().min(1).default(1),
  //field: page, accepts A number ≥ 1 -> Controls pagination; defaults to page 1
  //z.coerce? converts strings to numbers automatically. So if someone sends ?minPrice=100 in the URL (which is a string), Zod will turn it into a number for you. No manual parsing needed.
  pageSize: z.coerce.number().min(1).max(100).default(12),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  basePriceCents: z.number().min(1, "Price must be greater than 0"),
  salePriceCents: z.number().optional(),
  isActive: z.boolean().default(true),
  isSale: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  categoryId: z.string().min(1, "Category is required"),

  images: z
    .array(
      z.object({
        url: z.string().min(1, "Image URL is required"),
        alt: z.string().optional(),
      })
    )
    .optional(),

  variants: z
    .array(
      z.object({
        sku: z.string(),
        name: z.string().nullable().optional(),
        priceCents: z.number().min(0),
        stock: z.number().min(0).default(0),
      })
    )
    .optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

//ProductQuery Creates a TypeScript type based on the schema.
//someone visits: /products?category=earrings&minPrice=100&sort=price-low&page=2
//Zod will:
// 1. Convert minPrice and page to numbers
// 2. Fill in defaults for pageSize and status if missing
// 3. Validate that sort is one of the allowed values
// 4. Give you a clean, typed object to work with in your component or backend
