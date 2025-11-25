import { describe, expect, it } from "vitest";
import { CREDO_ITEMS } from "@/features/credo/config";

describe("CREDO_ITEMS", () => {
  it("has 11 items", () => {
    expect(CREDO_ITEMS).toHaveLength(11);
  });

  it("has unique ids and orders", () => {
    const ids = new Set(CREDO_ITEMS.map((i) => i.id));
    const orders = new Set(CREDO_ITEMS.map((i) => i.order));
    expect(ids.size).toBe(CREDO_ITEMS.length);
    expect(orders.size).toBe(CREDO_ITEMS.length);
  });
});
