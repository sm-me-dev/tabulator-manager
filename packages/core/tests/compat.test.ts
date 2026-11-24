import { TabulatorManagerCompat, mountTable, readTableState, writeTableState } from "../src/index.js";

class MockTabulator {
  destroyed = false;
  constructor(public el: HTMLElement, public options: Record<string, unknown>) {}
  destroy(): void {
    this.destroyed = true;
  }
}

const mockTabulator = MockTabulator as unknown as typeof window.Tabulator;

describe("TabulatorManagerCompat (deprecated shim)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    (window as unknown as { Tabulator?: unknown }).Tabulator = mockTabulator;
    (window as unknown as { TabulatorManager?: unknown }).TabulatorManager =
      TabulatorManagerCompat;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    delete (window as unknown as { Tabulator?: unknown }).Tabulator;
  });

  it("warns on construction (deprecation notice)", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const el = document.createElement("div");
    el.id = "tbl-compat";
    document.body.appendChild(el);
    new TabulatorManagerCompat("#tbl-compat", "/url", {
      columns: [],
      data: [],
    });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("deprecated")
    );
    spy.mockRestore();
  });

  it("mounts via legacy global constructor", () => {
    const el = document.createElement("div");
    el.id = "tbl-compat2";
    document.body.appendChild(el);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (window as any).TabulatorManager("#tbl-compat2", "/url", {
      columns: [{ field: "id", title: "ID" }],
      data: [{ id: 1 }],
    });

    expect(instance).toBeInstanceOf(TabulatorManagerCompat);
  });

  it("mounts when passed an HTMLElement directly and handles omitted columns/data", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);

    const instance = new TabulatorManagerCompat(el);
    expect(instance).toBeInstanceOf(TabulatorManagerCompat);
    instance.destroy();
  });

  it("exposes static utilities on TabulatorManagerCompat", () => {
    expect(TabulatorManagerCompat.mountTable).toBe(mountTable);
    expect(TabulatorManagerCompat.readTableState).toBe(readTableState);
    expect(TabulatorManagerCompat.writeTableState).toBe(writeTableState);
  });

  it("destroys the underlying instance", () => {
    (window as unknown as { Tabulator?: unknown }).Tabulator = mockTabulator;
    const el = document.createElement("div");
    el.id = "tbl-compat3";
    document.body.appendChild(el);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (window as any).TabulatorManager("#tbl-compat3", "/url", {
      columns: [],
      data: [],
    });
    instance.destroy();
    expect(true).toBe(true); // destroy should not throw
  });

  it("throws when container not found", () => {
    (window as unknown as { Tabulator?: unknown }).Tabulator = mockTabulator;
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (window as any).TabulatorManager("#nope", "/url", {})
    ).toThrow(TypeError);
  });

  it("throws when no global Tabulator constructor", () => {
    delete (window as unknown as { Tabulator?: unknown }).Tabulator;
    expect(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (window as any).TabulatorManager("#x", "/url", {})
    ).toThrow(TypeError);
  });
});
