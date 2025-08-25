// Data Transfer Object: DTO is an object that carries data between processes.
//This code helps your backend validate and clean up order data before saving it to the database or processing it.
//Zod acts like a gatekeeper for your backend. When an API request comes in (say, someone placing an order), Zod checks: Is the data shaped correctly?Are all required fields present? Are the values valid (e.g. email format, quantity ≥ 1)?Are optional fields either valid or missing?

import { z } from "zod";

//orderItem: Defines what each product in the order should look like: A valid product ID, An optional variant ID (like size or color) & A quantity that must be at least 1
export const orderItemSchema = z.object({
  productId: z.string().cuid(), // must be a valid CUID string
  variantId: z.string().cuid().optional(), // optional variant ID
  quantity: z.number().int().min(1), // must be a whole number, at least 1
});

//Defines the full order structure: Optional customer info (email, name, couponCode, notes), Required shipping details (name, email, address, etc.) & A list of items (must include at least one)
export const createOrderSchema = z.object({
  email: z.string().email().optional(), // optional customer email
  name: z.string().optional(), // optional customer name
  couponCode: z.string().optional(), // optional coupon
  notes: z.string().max(2000).optional(), // optional notes, max 2000 characters
  //Shipping details
  shipping: z.object({
    fullName: z.string().min(1), // required name
    email: z.string().email(), // required email
    phone: z.string().optional(), // optional phone
    address: z.string().min(1), // required address
    city: z.string().min(1), // required city
    country: z.string().min(1), // required country
    postalCode: z.string().min(1), // required postal code
  }),
  // List of items in the order - must include atelast 1 iteam
  items: z.array(orderItemSchema).min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
//z.infer<typeof orderSchema>: Creates a TypeScript type (OrderInput) that matches the schema. This gives you type safety when working with the validated data.
