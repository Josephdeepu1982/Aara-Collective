//function helps creating a new order in the backend: Accepts order data from the frontend,  Validates the data using a schema to ensure it’s safe and complete, Creates the order using a service function & Sends back the created order with a success status

import type { Request, Response } from "express";
//Request: represents the incoming HTTP request (what the user sends).
//Response: represents the outgoing HTTP response (what you send back).
import { createOrderSchema } from "../dto/orders.dto.js"; //imports a Zod schema that defines what a valid order should look like.
import createOrder from "../services/orders.service.js";

const handlePostOrder = async (
  incomingRequest: Request,
  outgoingResponse: Response
) => {
  const validatedOrderData = createOrderSchema.parse(incomingRequest.body); // Validate the incoming order data using the schema
  const createdOrder = await createOrder(validatedOrderData); // Create the order in the database
  outgoingResponse.status(201).json(createdOrder);
};

export default handlePostOrder;
