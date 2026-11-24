import { describe, it, expect, beforeEach } from "vitest";
import { readTableState, writeTableState, type TableState } from "../src/index.js";
import contractFixtures from "../../../fixtures/contracts/table-state-contract.json";

describe("Cross-Contract Verification (TypeScript Core vs Contract Fixtures)", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "http://localhost/");
  });

  for (const fixture of contractFixtures) {
    it(`parses query according to contract: ${fixture.name}`, () => {
      const parsed = readTableState(fixture.tableId, fixture.queryString ? `?${fixture.queryString}` : "");
      expect(parsed).toEqual(fixture.expectedState);
    });
  }

  it("round-trips writeTableState without clobbering external params or hash", () => {
    window.history.replaceState({}, "", "http://localhost/app?view=grid&theme=dark#results");

    const state: TableState = {
      page: 2,
      size: 30,
      sort: [{ field: "score", dir: "desc" }],
      filters: [{ field: "title", operator: "contains", value: "test" }],
    };

    writeTableState("users", state);

    const currentUrl = new URL(window.location.href);
    expect(currentUrl.searchParams.get("view")).toBe("grid");
    expect(currentUrl.searchParams.get("theme")).toBe("dark");
    expect(currentUrl.hash).toBe("#results");

    const reRead = readTableState("users", currentUrl.search);
    expect(reRead).toEqual(state);
  });

  it("isolates multiple table states when writing", () => {
    window.history.replaceState({}, "", "http://localhost/app?tm[orders][page]=4&tm[orders][size]=15");

    const usersState: TableState = {
      page: 1,
      size: 25,
      sort: [{ field: "created_at", dir: "asc" }],
      filters: [],
    };

    writeTableState("users", usersState);

    const updatedUrl = new URL(window.location.href);

    // Orders state is completely preserved
    const ordersRead = readTableState("orders", updatedUrl.search);
    expect(ordersRead.page).toBe(4);
    expect(ordersRead.size).toBe(15);

    // Users state was written correctly
    const usersRead = readTableState("users", updatedUrl.search);
    expect(usersRead.page).toBe(1);
    expect(usersRead.size).toBe(25);
    expect(usersRead.sort).toEqual([{ field: "created_at", dir: "asc" }]);
  });
});
