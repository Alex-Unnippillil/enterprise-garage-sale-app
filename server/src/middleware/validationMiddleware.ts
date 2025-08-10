import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (
  schema: AnyZodObject,
  property: "body" | "query" = "body"
) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten() });
      return;
    }
    // replace property with parsed data for downstream handlers
    (req as any)[property] = result.data;
    next();
  };

export const validateBody = (schema: AnyZodObject) => validate(schema, "body");
export const validateQuery = (schema: AnyZodObject) => validate(schema, "query");
