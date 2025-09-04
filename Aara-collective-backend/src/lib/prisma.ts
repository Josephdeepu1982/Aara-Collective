import { PrismaClient } from "../../generated/prisma/index.js";

let prisma: PrismaClient | null = null;

const getPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

export default getPrisma;
