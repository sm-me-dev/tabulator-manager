import { http, HttpResponse } from "msw";
import { readTableState, StandardJalaliDateAdapter } from "@tabulator-manager/core";
import { MOCK_USERS, MOCK_ORDERS } from "./mock-data.js";

const jalaliAdapter = new StandardJalaliDateAdapter();

export function queryMockUsers(search: string) {
  const state = readTableState("users", search);
  let result = [...MOCK_USERS];

  for (const filter of state.filters) {
    const val = filter.value.trim().toLowerCase();
    if (!val) continue;

    if (filter.field === "name" || filter.field === "title") {
      result = result.filter((u) => u.name.toLowerCase().includes(val));
    } else if (filter.field === "role") {
      result = result.filter((u) => u.role.toLowerCase().includes(val));
    } else if (filter.field === "status") {
      result = result.filter((u) => u.status === val);
    } else if (filter.field === "score") {
      const num = Number(val);
      if (!isNaN(num)) {
        if (filter.operator === ">=") result = result.filter((u) => u.score >= num);
        else if (filter.operator === "<=") result = result.filter((u) => u.score <= num);
        else if (filter.operator === "=") result = result.filter((u) => u.score === num);
        else if (filter.operator === "!=") result = result.filter((u) => u.score !== num);
      }
    } else if (filter.field === "jalali_date" || filter.field === "created_at") {
      // Check if value is a date range
      const [from, to] = jalaliAdapter.splitRange(filter.value);
      if (from && to) {
        result = result.filter((u) => u.jalali_date >= from && u.jalali_date <= to);
      } else if (from) {
        result = result.filter((u) => u.jalali_date.startsWith(from));
      }
    }
  }

  for (const sort of state.sort) {
    const dir = sort.dir === "desc" ? -1 : 1;
    result.sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[sort.field];
      const vb = (b as unknown as Record<string, unknown>)[sort.field];
      if (va === vb) return 0;
      return (va! > vb! ? 1 : -1) * dir;
    });
  }

  const page = Math.max(1, state.page);
  const size = Math.max(1, state.size);
  const total = result.length;
  const start = (page - 1) * size;
  const data = result.slice(start, start + size);
  const last_page = Math.max(1, Math.ceil(total / size));

  return {
    data,
    meta: {
      current_page: page,
      per_page: size,
      total,
      last_page,
    },
  };
}

export function queryMockOrders(search: string) {
  const state = readTableState("orders", search);
  let result = [...MOCK_ORDERS];

  for (const filter of state.filters) {
    const val = filter.value.trim().toLowerCase();
    if (!val) continue;

    if (filter.field === "order_number") {
      result = result.filter((o) => o.order_number.toLowerCase().includes(val));
    } else if (filter.field === "customer") {
      result = result.filter((o) => o.customer.toLowerCase().includes(val));
    } else if (filter.field === "status") {
      result = result.filter((o) => o.status === val);
    } else if (filter.field === "amount" || filter.field === "total") {
      const num = Number(val);
      if (!isNaN(num)) {
        if (filter.operator === ">=") result = result.filter((o) => o.amount >= num);
        else if (filter.operator === "<=") result = result.filter((o) => o.amount <= num);
        else if (filter.operator === "=") result = result.filter((o) => o.amount === num);
      }
    } else if (filter.field === "order_date") {
      const [from, to] = jalaliAdapter.splitRange(filter.value);
      if (from && to) {
        result = result.filter((o) => o.order_date >= from && o.order_date <= to);
      } else if (from) {
        result = result.filter((o) => o.order_date.startsWith(from));
      }
    }
  }

  for (const sort of state.sort) {
    const dir = sort.dir === "desc" ? -1 : 1;
    result.sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[sort.field];
      const vb = (b as unknown as Record<string, unknown>)[sort.field];
      if (va === vb) return 0;
      return (va! > vb! ? 1 : -1) * dir;
    });
  }

  const page = Math.max(1, state.page);
  const size = Math.max(1, state.size);
  const total = result.length;
  const start = (page - 1) * size;
  const data = result.slice(start, start + size);
  const last_page = Math.max(1, Math.ceil(total / size));

  return {
    data,
    meta: {
      current_page: page,
      per_page: size,
      total,
      last_page,
    },
  };
}

export const handlers = [
  http.get("*/api/health", () => {
    return HttpResponse.json({
      status: "ok",
      source: "mock-service-worker",
      timestamp: new Date().toISOString(),
    });
  }),

  http.get("*/api/users", ({ request }) => {
    const url = new URL(request.url);
    const response = queryMockUsers(url.search);
    return HttpResponse.json(response);
  }),

  http.get("*/api/orders", ({ request }) => {
    const url = new URL(request.url);
    const response = queryMockOrders(url.search);
    return HttpResponse.json(response);
  }),
];
