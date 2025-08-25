//populate our database with initial or mock data.
import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

//main function where all seeding logic will run asynchronously
async function main() {
  //ensures our categories exist in the database without creating duplicates.
  //Up-sert: = "update / insert"
  // If a category with slug "jewellery" exists, do nothing (runs the update block which is empty: {}); else runs the create block to, create it.
  //slug refers to a human-readable, unique identifier for a resource, often used in URLs. Instead of using a less descriptive ID (like a numeric primary key)
  const jewellery = await prisma.category.upsert({
    where: { slug: "jewellery" },
    update: {},
    create: { name: "Jewellery", slug: "jewellery" },
  });
  const clothing = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: {},
    create: { name: "Clothing", slug: "clothing" },
  });
  const footwear = await prisma.category.upsert({
    where: { slug: "footwear" },
    update: {},
    create: { name: "Footwear", slug: "footwear" },
  });

  //Convert a dollar value to cents for consistent currency storage.
  const cents = (n: number) => Math.round(n * 100);
  //nested ternary operator to check the value of name
  const cat = (name: "Jewellery" | "Clothing" | "Footwear") =>
    name === "Jewellery"
      ? jewellery.id
      : name === "Clothing"
      ? clothing.id
      : footwear.id;

  const products = [
    {
      name: "Kundan Gold Necklace Set",
      subtitle: "Jewellery · Kundan",
      categoryId: jewellery.id,
      basePriceCents: cents(899),
      salePriceCents: null,
      isSale: false,
      isNew: true,
      isBestSeller: true,
      popularity: 80,
      images: [{ url: "/featuredProducts/necklace.png" }],
    },
    {
      name: "Embroidered Silk Saree",
      subtitle: "Clothing · Kurtis",
      categoryId: clothing.id,
      basePriceCents: cents(499),
      salePriceCents: cents(399),
      isSale: true,
      isNew: false,
      isBestSeller: false,
      popularity: 95,
      images: [{ url: "/featuredProducts/Churidar.png" }],
    },
    {
      name: "Traditional Juttis",
      subtitle: "Footwear",
      categoryId: footwear.id,
      basePriceCents: cents(129),
      salePriceCents: null,
      isSale: false,
      isNew: false,
      isBestSeller: false,
      popularity: 60,
      images: [{ url: "/featuredProducts/shoes.png" }],
    },
    {
      name: "Pearl Chandelier Earrings",
      subtitle: "Jewellery",
      categoryId: jewellery.id,
      basePriceCents: cents(249),
      salePriceCents: null,
      isSale: false,
      isNew: true,
      isBestSeller: false,
      popularity: 70,
      images: [{ url: "/featuredProducts/earring1.png" }],
    },
  ];

  //loops through an array of products and inserts each product into the database using Prisma's product.create() method.
  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        subtitle: p.subtitle,
        categoryId: p.categoryId,
        basePriceCents: p.basePriceCents,
        salePriceCents: p.salePriceCents,
        isSale: p.isSale,
        isNew: p.isNew,
        isBestSeller: p.isBestSeller,
        popularity: p.popularity,
        images: { create: p.images },
      },
    });
  }

  //upsert perfroms an update or insert
  //Looks for a coupon with the code "DISCOUNT20"
  //If found, updates its active status to true and sets percentOff to 20
  //If not found, creates a new coupon with that code, 20% off, and sets it as active
  await prisma.coupon.upsert({
    where: { code: "DISCOUNT20" },
    update: { active: true, percentOff: 20 },
    create: { code: "DISCOUNT20", percentOff: 20, active: true },
  });
}

//ensures your Prisma database connection is cleanly closed after the main() function finishes—whether it succeeds or throws an error.
//main() is the async function
//.finally(...) is a method that runs after the promise resolves or rejects.
//prisma.$disconnect() gracefully shuts down the Prisma Client, releasing any open DB connections.
main().finally(() => prisma.$disconnect());
