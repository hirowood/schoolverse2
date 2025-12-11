import { describe, it, expect } from "vitest";

const BASE_URL = process.env.SMOKE_BASE_URL;

const pages = ["/", "/dashboard", "/curriculum", "/virtual-classroom", "/user-chat"];
const apis = ["/api/monster/definitions"];

// Skip all if base URL not provided
const maybeDescribe = BASE_URL ? describe : describe.skip;

maybeDescribe("Smoke: main pages", () => {
  for (const path of pages) {
    it(`GET ${path} returns 200`, async () => {
      const res = await fetch(new URL(path, BASE_URL).toString());
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text.length).toBeGreaterThan(0);
    }, 15_000);
  }
});

maybeDescribe("Smoke: key APIs", () => {
  for (const path of apis) {
    it(`GET ${path} returns success json`, async () => {
      const res = await fetch(new URL(path, BASE_URL).toString());
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toBeDefined();
    }, 10_000);
  }
});
