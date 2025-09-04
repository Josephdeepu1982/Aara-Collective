//function helps creating a new order in the backend: Accepts order data from the frontend,  Validates the data using a schema to ensure it’s safe and complete, Creates the order using a service function & Sends back the created order with a success status

import type { Request, Response } from "express";
//Request: represents the incoming HTTP request (what the user sends).
//Response: represents the outgoing HTTP response (what you send back).
import { createOrderSchema } from "../dto/orders.dto.js";
import z from "zod"; //imports a Zod schema that defines what a valid order should look like.
import createOrder from "../services/orders.service.js";
import prisma from "../dao/prisma.js";
// import { PrismaClient } from "../../generated/prisma/index.js";

// const prisma = new PrismaClient();

const updateOrderSchema = z.object({
  status: z
    .enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
  paymentStatus: z
    .enum(["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"])
    .optional(),
  notes: z.string().max(2000).optional(),
});

const handlePostOrder = async (req: Request, res: Response) => {
  try {
    const parsed = createOrderSchema.parse(req.body);
    const result = await createOrder(parsed);
    return res.status(201).json(result); // { orderId, subtotalCents, ... }
  } catch (error) {
    console.error("Error creating order:", error);
    return res
      .status(400)
      .json({ error: "Invalid order data or creation failed" });
  }
};

const handleGetOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true, customer: true },
    });

    const normalized = orders.map((o) => ({
      id: o.id,
      customer: o.customer?.name ?? "Guest",
      email: o.customer?.email ?? "N/A",
      phone: o.customer?.phone ?? "N/A",
      date: new Date(o.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      amount: `$${(o.totalCents / 100).toFixed(2)}`,
      status: o.status,
      items: o.items.reduce((sum, item) => sum + item.quantity, 0),
    }));

    return res.json(normalized);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const handleGetOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing order ID" });
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        shippingAddress: true,
        items: { include: { product: true } },
      },
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
};

const handleUpdateOrder = async (req: Request, res: Response) => {
  try {
    const parsed = updateOrderSchema.parse(req.body);
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing order ID" });
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(parsed.status && { status: parsed.status }),
        ...(parsed.paymentStatus && { paymentStatus: parsed.paymentStatus }),
        ...(parsed.notes && { notes: parsed.notes }),
      },
      include: {
        customer: true,
        shippingAddress: true,
        items: { include: { product: true } },
      },
    });
    return res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return res
      .status(500)
      .json({ error: (error as any).message || "Failed to update order" });
  }
};

const handleDeleteOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Missing order ID" });
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });
    return res.json({ message: "Order deleted", id });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).json({ error: "Failed to delete order" });
  }
};

export {
  handlePostOrder,
  handleGetOrders,
  handleGetOrderById,
  handleUpdateOrder,
  handleDeleteOrder,
};
