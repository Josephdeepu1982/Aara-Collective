//This code gives our app a direct line to the database —> a clean, reliable way to read and write data without writing raw SQL.
//This file imports Prisma’s tools, creates a helper called prisma, and then shares it with the rest of our app. Anytime you want to read or write data—like fetching products, creating orders, or updating coupons—you’ll use this prisma object.
//Without this setup: we’d have to manually connect to the database every time, risk creating multiple connections (which can crash your app & lose type safety and autocompletion

import { PrismaClient } from "../../generated/prisma/index.js";
//pulls in Prisma’s main tool —> PrismaClient class from your generated types and schema.
//This class knows how to talk to our database using the models you defined (like Product, Order, Coupon, etc.).

const prisma = new PrismaClient();
//creates a new instance of the Prisma client.
//This object lets you do things like:
// 1. prisma.product.findMany() → get all products
// 2. prisma.order.create({...}) → create a new order
// 3. prisma.coupon.update({...}) → update a coupon

export default prisma;
//makes the prisma instance available to other files.
