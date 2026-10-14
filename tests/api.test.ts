import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/server";

const item = { sku: "X", name: "Item", myPrice: 200, minPrice: 100, maxPrice: 300, step: 1, competitors: [{ seller: "S", price: 150, inStock: true }] };

describe("POST /reprice", () => {
  it("returns results in input order", async () => {
    const response = await request(app).post("/reprice").send([item, { ...item, sku: "Y" }]);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { sku: "X", oldPrice: 200, newPrice: 149, reason: "UNDERCUT" },
      { sku: "Y", oldPrice: 200, newPrice: 149, reason: "UNDERCUT" },
    ]);
  });
  it("rejects non-arrays", async () => {
    expect((await request(app).post("/reprice").send({ product: item })).status).toBe(400);
  });
  it("rejects malformed products", async () => {
    expect((await request(app).post("/reprice").send([{ sku: "bad" }])).status).toBe(400);
  });
  it("accepts empty arrays", async () => {
    const response = await request(app).post("/reprice").send([]);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
