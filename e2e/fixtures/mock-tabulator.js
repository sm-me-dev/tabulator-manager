// Mock Tabulator constructor for testing
(function (global) {
  class MockTabulator {
    constructor(element, options = {}) {
      this.element = typeof element === "string" ? document.querySelector(element) : element;
      if (!this.element) {
        throw new Error("Element not found: " + element);
      }
      this.options = options;
      this.columns = options.columns || [];
      this.data = options.data || [];
      this.filters = [];
      this.sorters = [];
      this.rendered = false;
      this.destroyed = false;

      this.render();
    }

    render() {
      this.element.innerHTML = "";
      this.element.classList.add("tabulator-mounted");

      const table = document.createElement("table");
      table.className = "tabulator-table";

      // Render header
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      this.columns.forEach((col) => {
        const th = document.createElement("th");
        th.textContent = col.title || col.field;
        th.dataset.field = col.field;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Render body rows
      const tbody = document.createElement("tbody");
      this.data.forEach((row, idx) => {
        const tr = document.createElement("tr");
        tr.dataset.rowId = String(row.id || idx);
        this.columns.forEach((col) => {
          const td = document.createElement("td");
          td.dataset.field = col.field;
          td.textContent = row[col.field] !== undefined ? String(row[col.field]) : "";
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      this.element.appendChild(table);
      this.rendered = true;
    }

    setData(newData) {
      this.data = newData;
      this.render();
    }

    getData() {
      return this.data;
    }

    destroy() {
      this.destroyed = true;
      this.element.innerHTML = "";
      this.element.classList.remove("tabulator-mounted");
    }
  }

  global.Tabulator = MockTabulator;
})(typeof window !== "undefined" ? window : globalThis);
