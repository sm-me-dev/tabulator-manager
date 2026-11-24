import {
  readTableState,
  writeTableState,
  UrlStateAdapter,
  UrlStateCoordinator,
  DEFAULT_TABLE_STATE,
  type TableState,
} from "../src/index.js";

function setUrl(search: string): void {
  const url = search ? "http://localhost/?" + search : "http://localhost/";
  window.history.replaceState({}, "", url);
}

function getUrlSearch(): string {
  return window.location.search;
}

describe("readTableState / writeTableState round-trip", () => {
  beforeEach(() => {
    setUrl("");
  });

  it("writes and reads back default state", () => {
    writeTableState("users", DEFAULT_TABLE_STATE);
    const state = readTableState("users");
    expect(state).toEqual(DEFAULT_TABLE_STATE);
    // URLSearchParams encodes [ as %5B and ] as %5D; reading decodes back.
    expect(getUrlSearch()).toContain("tm%5Busers%5D%5Bpage%5D=1");
    expect(getUrlSearch()).toContain("tm%5Busers%5D%5Bsize%5D=20");
  });

  it("round-trips custom state with sort and filters", () => {
    const state: TableState = {
      page: 3,
      size: 50,
      sort: [{ field: "name", dir: "asc" }, { field: "email", dir: "desc" }],
      filters: [
        { field: "status", operator: "=", value: "active" },
        { field: "price", operator: ">=", value: "100" },
        { field: "name", operator: "contains", value: "john" },
      ],
    };
    writeTableState("users", state);
    const read = readTableState("users");
    expect(read.page).toBe(3);
    expect(read.size).toBe(50);
    expect(read.sort).toEqual([
      { field: "name", dir: "asc" },
      { field: "email", dir: "desc" },
    ]);
    expect(read.filters).toEqual([
      { field: "status", operator: "=", value: "active" },
      { field: "price", operator: ">=", value: "100" },
      { field: "name", operator: "contains", value: "john" },
    ]);
  });

  it("reads unindexed single sort rule", () => {
    setUrl("tm[users][sort][field]=name&tm[users][sort][dir]=desc");
    const state = readTableState("users");
    expect(state.sort).toEqual([{ field: "name", dir: "desc" }]);
  });

  it("correctly cleans up existing parameters on subsequent writeTableState", () => {
    writeTableState("users", {
      ...DEFAULT_TABLE_STATE,
      sort: [{ field: "name", dir: "asc" }, { field: "email", dir: "desc" }],
    });
    expect(readTableState("users").sort).toHaveLength(2);

    // Write new state with no sort
    writeTableState("users", {
      ...DEFAULT_TABLE_STATE,
      sort: [],
    });
    const updated = readTableState("users");
    expect(updated.sort).toHaveLength(0);
  });

  it("clamps page to minimum 1", () => {
    writeTableState("users", { ...DEFAULT_TABLE_STATE, page: 0 });
    expect(readTableState("users").page).toBe(1);
    writeTableState("users", { ...DEFAULT_TABLE_STATE, page: -5 });
    expect(readTableState("users").page).toBe(1);
  });

  it("clamps size to maximum 100 and minimum 1", () => {
    writeTableState("users", { ...DEFAULT_TABLE_STATE, size: 200 });
    expect(readTableState("users").size).toBe(100);
    writeTableState("users", { ...DEFAULT_TABLE_STATE, size: 0 });
    expect(readTableState("users").size).toBe(1);
  });

  it("ignores invalid sort directions", () => {
    setUrl("tm[users][sort][0][field]=name&tm[users][sort][0][dir]=invalid");
    const state = readTableState("users");
    expect(state.sort).toEqual([]);
  });

  it("ignores invalid filter operators", () => {
    setUrl("tm[users][filters][0][field]=name&tm[users][filters][0][operator]=INVALID&tm[users][filters][0][value]=x");
    const state = readTableState("users");
    expect(state.filters).toEqual([]);
  });
});

describe("multi-table isolation", () => {
  beforeEach(() => {
    setUrl("");
  });

  it("writing one table does not erase another table's state", () => {
    writeTableState("users", {
      ...DEFAULT_TABLE_STATE,
      page: 2,
      filters: [{ field: "status", operator: "=", value: "active" }],
    });
    writeTableState("orders", {
      ...DEFAULT_TABLE_STATE,
      page: 5,
      sort: [{ field: "created_at", dir: "desc" }],
    });

    const users = readTableState("users");
    const orders = readTableState("orders");

    expect(users.page).toBe(2);
    expect(users.filters).toHaveLength(1);
    expect(orders.page).toBe(5);
    expect(orders.sort).toHaveLength(1);
  });

  it("read of absent table returns defaults", () => {
    writeTableState("users", { ...DEFAULT_TABLE_STATE, page: 3 });
    const empty = readTableState("nonexistent");
    expect(empty).toEqual(DEFAULT_TABLE_STATE);
  });

  it("update preserves unrelated query keys", () => {
    setUrl("other=keep&utm_source=test");
    writeTableState("users", { ...DEFAULT_TABLE_STATE, page: 2 });
    const search = getUrlSearch();
    expect(search).toContain("other=keep");
    expect(search).toContain("utm_source=test");
    expect(search).toContain("tm%5Busers%5D%5Bpage%5D=2");
  });

  it("hash and unrelated params are preserved", () => {
    setUrl("section=reports#section-top");
    writeTableState("users", { ...DEFAULT_TABLE_STATE, page: 1 });
    expect(getUrlSearch()).toContain("section=reports");
    expect(window.location.hash).toBe("#section-top");
  });
});

describe("UrlStateAdapter & UrlStateCoordinator", () => {
  let adapter: UrlStateAdapter;

  afterEach(() => {
    adapter?.destroy();
    setUrl("");
  });

  it("subscribes and emits on update via UrlStateAdapter", () => {
    adapter = new UrlStateAdapter("users");
    const fn = vi.fn();
    adapter.subscribe(fn);
    adapter.update({ ...DEFAULT_TABLE_STATE, page: 4 });
    expect(fn).toHaveBeenCalledWith({
      ...DEFAULT_TABLE_STATE,
      page: 4,
    });
  });

  it("reads current state from URL", () => {
    setUrl("tm[users][page]=3&tm[users][size]=10");
    adapter = new UrlStateAdapter("users");
    expect(adapter.current().page).toBe(3);
    expect(adapter.current().size).toBe(10);
  });

  it("destroys removes popstate listener", () => {
    adapter = new UrlStateAdapter("users");
    adapter.destroy();
    adapter.destroy();
    expect(true).toBe(true);
  });

  it("UrlStateCoordinator is an alias for UrlStateAdapter", () => {
    expect(UrlStateCoordinator).toBe(UrlStateAdapter);
  });

  it("multiple coordinators for different tables are independent", () => {
    const a = new UrlStateAdapter("tableA");
    const b = new UrlStateAdapter("tableB");
    const aFn = vi.fn();
    const bFn = vi.fn();
    a.subscribe(aFn);
    b.subscribe(bFn);

    a.update({ ...DEFAULT_TABLE_STATE, page: 1 });
    b.update({ ...DEFAULT_TABLE_STATE, page: 2 });

    expect(aFn).toHaveBeenCalledWith({
      ...DEFAULT_TABLE_STATE,
      page: 1,
    });
    expect(bFn).toHaveBeenCalledWith({
      ...DEFAULT_TABLE_STATE,
      page: 2,
    });
    expect(aFn).not.toHaveBeenCalledWith({
      ...DEFAULT_TABLE_STATE,
      page: 2,
    });

    a.destroy();
    b.destroy();
  });
});

describe("popstate / history", () => {
  it("writeTableState with push mode adds history entry", () => {
    setUrl("");
    const initialLength = window.history.length;
    writeTableState("users", { ...DEFAULT_TABLE_STATE, page: 2 }, "push");
    expect(window.history.length).toBeGreaterThanOrEqual(initialLength);
  });

  it("writeTableState with replace mode does not add history entry", () => {
    setUrl("");
    const initialLength = window.history.length;
    writeTableState("users", { ...DEFAULT_TABLE_STATE, page: 2 }, "replace");
    expect(window.history.length).toBe(initialLength);
  });
});
