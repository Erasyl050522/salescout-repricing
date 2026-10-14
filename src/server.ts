import express from "express";
import cors from "cors";
import { calculatePrice } from "./pricing";
import type { Product } from "./types";

export const app = express();
app.use(cors());
app.use(express.json());

function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  const validNumber = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0;
  return typeof p.sku === "string" && typeof p.name === "string" &&
    validNumber(p.myPrice) && validNumber(p.minPrice) && validNumber(p.maxPrice) &&
    validNumber(p.step) && p.minPrice <= p.maxPrice &&
    Number.isInteger(p.minPrice) && Number.isInteger(p.maxPrice) &&
    Array.isArray(p.competitors) && p.competitors.every((c: unknown) => {
      if (typeof c !== "object" || c === null) return false;
      const item = c as Record<string, unknown>;
      return typeof item.seller === "string" && validNumber(item.price) && typeof item.inStock === "boolean";
    });
}

app.post("/reprice", (req, res) => {
  if (!Array.isArray(req.body) || !req.body.every(isProduct)) {
    res.status(400).json({ error: "Expected an array of valid products" });
    return;
  }
  res.json(req.body.map(calculatePrice));
});
