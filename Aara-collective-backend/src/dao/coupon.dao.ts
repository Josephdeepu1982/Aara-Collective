import { Prisma } from "../../generated/prisma/index.js"; //gives autocompletion
import prisma from "./prisma.js"; //imports your Prisma client instance, which is our app’s connection to the database.

//This code tells prisma to map an SQL query to check if coupon is valid and can be applied
//checks if coupon is currently active based on:
// 1. Its code (e.g. "SUMMER25")
// 2. Whether it's marked as active: true
// 3. Whether the current time is within its valid date range: startsAt is either missing or already started && endsAt is either missing or not yet expired
//Less Than or Equal & Greater Than or Equal
export const findActiveCoupon = (code: string) => {
  const now = new Date();
  return prisma.coupon.findFirst({
    where: {
      code,
      active: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      //"Coupon is valid if it has no start date, or if its start date is in the past or now."
      AND: [{ endsAt: null }, { endsAt: { gte: now } }],
      //"Coupon is valid only if it has no end date, or if its end date is in the future or now."
    },
  });
};
