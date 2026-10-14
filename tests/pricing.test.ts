import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { calculatePrice } from "../src/pricing";
import type { Product, PriceResult } from "../src/types";

const base: Product = {
  sku: "TEST", name: "Example", myPrice: 999, minPrice: 100, maxPrice: 500,
  step: 10, competitors: [{ seller: "A", price: 300, inStock: true }],
};
const change = (overrides: Partial<Product>): Product => ({ ...base, ...overrides });

describe("calculatePrice", () => {
  it("matches all supplied fixtures", () => {
    const products = JSON.parse(readFileSync(new URL("../data/products.json", import.meta.url), "utf8")) as Product[];
    const expected = JSON.parse(readFileSync(new URL("../data/expected.json", import.meta.url), "utf8")) as PriceResult[];
    expect(products.map(calculatePrice)).toEqual(expected);
  });
  it("undercuts the lowest available competitor", () => {
    expect(calculatePrice(change({ competitors: [
      { seller: "A", price: 320, inStock: true },
      { seller: "B", price: 250, inStock: true },
      { seller: "C", price: 1, inStock: false },
    ] }))).toEqual({ sku: "TEST", oldPrice: 999, newPrice: 240, reason: "UNDERCUT" });
  });
  it("uses max price if no competitors exist", () => {
    expect(calculatePrice(change({ competitors: [] }))).toMatchObject({ newPrice: 500, reason: "NO_COMPETITORS" });
  });
  it("ignores all out-of-stock competitors", () => {
    expect(calculatePrice(change({ competitors: [{ seller: "A", price: 10, inStock: false }] }))).toMatchObject({ newPrice: 500, reason: "NO_COMPETITORS" });
  });
  it("clamps below minimum", () => {
    expect(calculatePrice(change({ competitors: [{ seller: "A", price: 90, inStock: true }] }))).toMatchObject({ newPrice: 100, reason: "AT_MIN" });
  });
  it("clamps above maximum", () => {
    expect(calculatePrice(change({ competitors: [{ seller: "A", price: 600, inStock: true }] }))).toMatchObject({ newPrice: 500, reason: "AT_MAX" });
  });
  it("treats exact bounds as UNDERCUT", () => {
    expect(calculatePrice(change({ competitors: [{ seller: "A", price: 110, inStock: true }] }))).toMatchObject({ newPrice: 100, reason: "UNDERCUT" });
    expect(calculatePrice(change({ competitors: [{ seller: "A", price: 510, inStock: true }] }))).toMatchObject({ newPrice: 500, reason: "UNDERCUT" });
  });
  it("floors fractional values", () => {
    expect(calculatePrice(change({ step: 0.5, competitors: [{ seller: "A", price: 349.9, inStock: true }] }))).toMatchObject({ newPrice: 349, reason: "UNDERCUT" });
  });
  it("does not mutate input", () => {
    const product = change({});
    const before = JSON.stringify(product);
    calculatePrice(product);
    expect(JSON.stringify(product)).toBe(before);
  });
});
