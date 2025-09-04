import { error } from "console";
import type { Request, Response, NextFunction } from "express";

//notFound Middleware runs when someone tries to access a route that doesn’t exist. It sends back a 404 Not Found response with a simple error message.
export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ error: "Route Not Found" });
};

//errorHandler Middleware. This function catches any errors that happen inside our app routes or middleware. It looks for a status on the error object (like 401, 403, etc.), and if none is found, it defaults to 500 (Internal Server Error). It then sends back a JSON response with the error message.
export const generalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({ error: message });
};

//Note: _Underscore are here for structure, but unused.
