import dotenv from "dotenv";
import type { Algorithm } from "jsonwebtoken";

dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || "",
  algorithms: (process.env.JWT_ALGORITHMS
    ? process.env.JWT_ALGORITHMS.split(",")
    : ["HS256"]) as Algorithm[],
};

