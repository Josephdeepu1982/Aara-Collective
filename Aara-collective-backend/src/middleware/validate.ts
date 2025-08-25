import type { AnyZodObject } from "zod";
import type { Request, Response, NextFunction } from "express";

//This code sets up two helpers that check if incoming data from the frontend is valid and safe before your backend uses it.
//We using a library called Zod, which lets you define rules for what data should look like

//checks the query parameters in the URL (like ?category=home&price=100),
// make sure: category is a string, price is a number & Nothing weird or unexpected sneaks in
//If the data matches the zod schema rules, it replaces req.query with the cleaned version. If the data is invalid, Zod throws an error
//schema.parse(data) checks if data match the rules we defined in the schema
const validateQuery =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.query = schema.parse(req.query); // validate and clean query
    next();
  };

//Checks the body of the request (like the JSON sent in a POST or PUT). If valid, it replaces req.body with the cleaned version. If not, it throws an error
const validateBody =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body); // validate and clean body
    next();
  };

export default { validateQuery, validateBody };
