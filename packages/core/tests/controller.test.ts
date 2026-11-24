import { mountTable } from "../src/index.js";
import type { TableColumn, TableRow, TabulatorConstructor } from "../src/types.js";

class MockTabulator {
  destroyed = false;
  constructor(public el: HTMLElement, public options: Record<string, unknown>) {}
  destroy(): void {
    this.destroyed = true;
  }
}

const mockTabulator = MockTabulator as unknown as TabulatorConstructor;

function mountContainer(id: string): HTMLElement {
  const el = document.createElement("div");
  el.id = id;
  document.body.appendChild(el);
  return el;
}

describe("mountTable", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("mounts on an HTMLElement", () => {
    const el = mountContainer("tbl1");
    const instance = mountTable({
      element: el,
      Tabulator: mockTabulator,
      columns: [{ field: "id", title: "ID" }] as TableColumn[],
      data: [{ id: 1 }] as TableRow[],
    });
    expect(instance).toBeInstanceOf(MockTabulator);
    expect((instance as MockTabulator).el).toBe(el);
    expect((instance as MockTabulator).options.columns).toHaveLength(1);
    expect((instance as MockTabulator).options.data).toHaveLength(1);
  });

  it("mounts on a selector string", () => {
    const el = mountContainer("tbl2");
    const instance = mountTable({
      element: "#tbl2",
      Tabulator: mockTabulator,
      columns: [] as TableColumn[],
      data: [] as TableRow[],
    });
    expect(instance).toBeInstanceOf(MockTabulator);
  });

  it("throws TypeError when element not found", () => {
    expect(() =>
      mountTable({
        element: "#does-not-exist",
        Tabulator: mockTabulator,
        columns: [] as TableColumn[],
        data: [] as TableRow[],
      })
    ).toThrow(TypeError);
  });

  it("throws TypeError when element is not an HTMLElement", () => {
    // @ts-expect-error - deliberately passing wrong type
    expect(() =>
      mountTable({
        element: 123,
        Tabulator: mockTabulator,
        columns: [] as TableColumn[],
        data: [] as TableRow[],
      })
    ).toThrow(TypeError);
  });
});
