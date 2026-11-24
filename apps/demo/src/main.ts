import { TabulatorFull as Tabulator } from "tabulator-tables";
import {
  mountTable,
  readTableState,
  writeTableState,
  UrlStateAdapter,
  StandardJalaliDateAdapter,
  normalizeDigits,
  TabulatorManagerCompat,
  type TableState,
} from "@tabulator-manager/core";
import { initMocks } from "./mocks/browser.js";
import { TransportCoordinator, type TransportState } from "./transport/health-checker.js";
import { MOCK_USERS } from "./mocks/mock-data.js";

// Make global for legacy compatibility demonstration
(window as unknown as { Tabulator?: unknown; TabulatorManager?: unknown }).Tabulator = Tabulator;
(window as unknown as { TabulatorManager?: unknown }).TabulatorManager = TabulatorManagerCompat;

const jalaliAdapter = new StandardJalaliDateAdapter();
const transport = new TransportCoordinator();
let currentHistoryMode: "push" | "replace" = "replace";

// Initialize MSW and Transport Coordinator
async function bootstrap() {
  await initMocks();
  await transport.start();

  initTransportUI();
  initTabs();
  initUrlInspector();

  // Initialize Scenarios
  initUsersTable();
  initOrdersTable();
  initJalaliScenario();
  initLegacyScenario();
}

// Transport UI State Management
function initTransportUI() {
  const badge = document.getElementById("transport-badge")!;
  const badgeDot = document.getElementById("badge-dot")!;
  const badgeText = document.getElementById("badge-text")!;
  const btnMock = document.getElementById("btn-source-mock")!;
  const btnLive = document.getElementById("btn-source-live")!;
  const btnReprobe = document.getElementById("btn-reprobe")!;

  transport.subscribe((state: TransportState) => {
    if (state.status === "live_active") {
      badgeDot.className = "w-2 h-2 rounded-full bg-emerald-400";
      badgeText.textContent = `🟢 Live Laravel Backend Active (${state.responseTimeMs ?? "<50"}ms)`;
      badge.className = "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 transition-all duration-300";
    } else {
      badgeDot.className = "w-2 h-2 rounded-full bg-yellow-400 animate-pulse";
      badgeText.textContent = "🟡 Server waking (serving local mock)";
      badge.className = "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-950/40 border border-yellow-500/40 text-yellow-300 transition-all duration-300";
    }

    if (state.dataSource === "mock") {
      btnMock.className = "px-2.5 py-1 text-xs font-medium rounded-md transition-colors bg-indigo-600 text-white shadow-sm";
      btnLive.className = "px-2.5 py-1 text-xs font-medium rounded-md transition-colors text-gray-400 hover:text-gray-200";
    } else {
      btnLive.className = "px-2.5 py-1 text-xs font-medium rounded-md transition-colors bg-emerald-600 text-white shadow-sm";
      btnMock.className = "px-2.5 py-1 text-xs font-medium rounded-md transition-colors text-gray-400 hover:text-gray-200";
    }
  });

  btnMock.addEventListener("click", () => {
    transport.setDataSource("mock");
    reloadAllTables();
  });

  btnLive.addEventListener("click", () => {
    transport.setDataSource("live");
    reloadAllTables();
  });

  btnReprobe.addEventListener("click", () => {
    badgeText.textContent = "Checking backend health...";
    transport.checkHealth();
  });

  // History mode toggle
  const historyToggle = document.getElementById("toggle-history-mode");
  const historyModeLabel = document.getElementById("current-history-mode");
  if (historyToggle && historyModeLabel) {
    historyToggle.addEventListener("click", () => {
      currentHistoryMode = currentHistoryMode === "replace" ? "push" : "replace";
      historyModeLabel.textContent = currentHistoryMode === "push" ? "pushState" : "replaceState";
    });
  }
}

// Tab Switching
function initTabs() {
  const tabButtons = document.querySelectorAll<HTMLButtonElement>(".tab-btn");
  const tabPanes = document.querySelectorAll<HTMLElement>(".tab-pane");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      if (!targetId) return;

      tabButtons.forEach((b) => {
        b.className = "tab-btn px-3.5 py-1.5 text-xs font-medium rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#161922] transition-colors";
      });
      btn.className = "tab-btn px-3.5 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 transition-colors";

      tabPanes.forEach((pane) => {
        if (pane.id === targetId) {
          pane.classList.remove("hidden");
        } else {
          pane.classList.add("hidden");
        }
      });
    });
  });
}

// Multi-Table: Users Table
let usersTabulator: unknown = null;
let usersAdapter: UrlStateAdapter | null = null;

function initUsersTable() {
  const container = document.getElementById("users-table-container");
  if (!container) return;

  usersAdapter = new UrlStateAdapter("users");
  const initial = usersAdapter.current();

  usersTabulator = mountTable({
    element: container,
    Tabulator,
    columns: [
      { title: "ID", field: "id", width: 60, headerSort: true },
      { title: "Name", field: "name", headerSort: true },
      { title: "Role", field: "role", headerSort: true },
      {
        title: "Score",
        field: "score",
        width: 80,
        headerSort: true,
        formatter: (cell) => {
          const val = Number(cell.getValue());
          const color = val >= 75 ? "text-emerald-400" : val >= 50 ? "text-indigo-400" : "text-amber-400";
          return `<span class="font-mono font-medium ${color}">${val}</span>`;
        },
      },
      {
        title: "Status",
        field: "status",
        width: 90,
        formatter: (cell) => {
          const val = String(cell.getValue());
          const badgeClass =
            val === "active" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-gray-700/30 text-gray-400 border-gray-600/30";
          return `<span class="text-[10px] px-2 py-0.5 rounded-full border ${badgeClass}">${val}</span>`;
        },
      },
    ],
    options: {
      pagination: true,
      paginationMode: "remote",
      filterMode: "remote",
      sortMode: "remote",
      paginationSize: initial.size,
      paginationInitialPage: initial.page,
      layout: "fitColumns",
      ajaxURL: transport.getEndpointUrl("/api/users"),
      ajaxURLGenerator: (_url, _config, params) => {
        const state = readTableState("users");
        const s: TableState = {
          page: params.page || state.page,
          size: params.size || state.size,
          sort: state.sort,
          filters: state.filters,
        };
        usersAdapter?.update(s, currentHistoryMode);
        updateInspectorUI();
        return `${transport.getEndpointUrl("/api/users")}?${window.location.search.replace(/^\?/, "")}`;
      },
      ajaxResponse: (_url, _params, response) => {
        return {
          data: response.data,
          last_page: response.meta.last_page,
        };
      },
    },
  });

  // Filter input binding
  const filterInput = document.getElementById("users-filter-input") as HTMLInputElement | null;
  if (filterInput) {
    filterInput.addEventListener("input", (e) => {
      const val = (e.target as HTMLInputElement).value.trim();
      const state = usersAdapter!.current();
      const newFilters = val ? [{ field: "name", operator: "contains" as const, value: val }] : [];
      usersAdapter!.update({ ...state, page: 1, filters: newFilters }, currentHistoryMode);
      updateInspectorUI();
      (usersTabulator as { setData: () => void })?.setData();
    });
  }
}

// Multi-Table: Orders Table
let ordersTabulator: unknown = null;
let ordersAdapter: UrlStateAdapter | null = null;

function initOrdersTable() {
  const container = document.getElementById("orders-table-container");
  if (!container) return;

  ordersAdapter = new UrlStateAdapter("orders");
  const initial = ordersAdapter.current();

  ordersTabulator = mountTable({
    element: container,
    Tabulator,
    columns: [
      { title: "Order #", field: "order_number", headerSort: true },
      { title: "Customer", field: "customer", headerSort: true },
      {
        title: "Amount",
        field: "amount",
        headerSort: true,
        formatter: (cell) => `<span class="font-mono text-emerald-400">$${cell.getValue()}</span>`,
      },
      {
        title: "Date (Jalali)",
        field: "order_date",
        headerSort: true,
        formatter: (cell) => `<span class="font-mono text-gray-300 text-xs">${cell.getValue()}</span>`,
      },
    ],
    options: {
      pagination: true,
      paginationMode: "remote",
      filterMode: "remote",
      sortMode: "remote",
      paginationSize: initial.size,
      paginationInitialPage: initial.page,
      layout: "fitColumns",
      ajaxURL: transport.getEndpointUrl("/api/orders"),
      ajaxURLGenerator: (_url, _config, params) => {
        const state = readTableState("orders");
        const s: TableState = {
          page: params.page || state.page,
          size: params.size || state.size,
          sort: state.sort,
          filters: state.filters,
        };
        ordersAdapter?.update(s, currentHistoryMode);
        updateInspectorUI();
        return `${transport.getEndpointUrl("/api/orders")}?${window.location.search.replace(/^\?/, "")}`;
      },
      ajaxResponse: (_url, _params, response) => {
        return {
          data: response.data,
          last_page: response.meta.last_page,
        };
      },
    },
  });

  const filterInput = document.getElementById("orders-filter-input") as HTMLInputElement | null;
  if (filterInput) {
    filterInput.addEventListener("input", (e) => {
      const val = (e.target as HTMLInputElement).value.trim();
      const state = ordersAdapter!.current();
      const newFilters = val ? [{ field: "customer", operator: "contains" as const, value: val }] : [];
      ordersAdapter!.update({ ...state, page: 1, filters: newFilters }, currentHistoryMode);
      updateInspectorUI();
      (ordersTabulator as { setData: () => void })?.setData();
    });
  }
}

// Scenario 3: Jalali Calendar Date Filter
let jalaliTabulator: unknown = null;

function initJalaliScenario() {
  const container = document.getElementById("jalali-table-container");
  if (!container) return;

  jalaliTabulator = mountTable({
    element: container,
    Tabulator,
    columns: [
      { title: "ID", field: "id", width: 60 },
      { title: "Name", field: "name" },
      { title: "Role", field: "role" },
      {
        title: "Jalali Date",
        field: "jalali_date",
        headerSort: true,
        formatter: (cell) => `<span class="font-mono text-indigo-300 font-medium">${cell.getValue()}</span>`,
      },
      {
        title: "Gregorian ISO",
        field: "created_at",
        headerSort: true,
        formatter: (cell) => `<span class="font-mono text-gray-400 text-xs">${cell.getValue()}</span>`,
      },
    ],
    options: {
      pagination: true,
      paginationSize: 10,
      layout: "fitColumns",
      data: MOCK_USERS,
    },
  });

  const input = document.getElementById("jalali-range-input") as HTMLInputElement | null;
  const btnApply = document.getElementById("apply-jalali-filter");
  const rawBox = document.getElementById("debug-raw-input");
  const normBox = document.getElementById("debug-normalized");
  const gregBox = document.getElementById("debug-gregorian");

  const updateDebugInfo = (rawRange: string) => {
    if (rawBox) rawBox.textContent = rawRange;
    const normalized = normalizeDigits(rawRange);
    if (normBox) normBox.textContent = normalized;

    const [fromJalali, toJalali] = jalaliAdapter.splitRange(normalized);
    const fromGreg = fromJalali ? jalaliAdapter.toGregorian(fromJalali) : null;
    const toGreg = toJalali ? jalaliAdapter.toGregorian(toJalali) : null;
    if (gregBox) {
      gregBox.textContent = fromGreg && toGreg ? `${fromGreg} to ${toGreg}` : fromGreg || toGreg || "None";
    }

    if (jalaliTabulator && fromJalali && toJalali) {
      (jalaliTabulator as { setFilter: (fn: (row: Record<string, string>) => boolean) => void }).setFilter(
        (data: Record<string, string>) => data.jalali_date >= fromJalali && data.jalali_date <= toJalali
      );
    }
  };

  btnApply?.addEventListener("click", () => {
    if (input) updateDebugInfo(input.value);
  });

  document.querySelectorAll<HTMLButtonElement>(".jalali-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const range = btn.getAttribute("data-range");
      if (range && input) {
        input.value = range;
        updateDebugInfo(range);
      }
    });
  });

  if (input) updateDebugInfo(input.value);
}

// Scenario 1: Legacy Compatibility Shim
function initLegacyScenario() {
  const mountPoint = document.getElementById("legacy-mount-point");
  if (!mountPoint) return;

  // Uses window.TabulatorManager legacy shim with @deprecated constructor
  new TabulatorManagerCompat(mountPoint, "/api/users", {
    data: MOCK_USERS.slice(0, 5),
    columns: [
      { title: "ID", field: "id", width: 70 },
      { title: "Name", field: "name" },
      { title: "Email", field: "email" },
      { title: "Legacy Status", field: "status" },
    ],
  });
}

// Scenario 4: Real-Time URL Query Inspector
function initUrlInspector() {
  window.addEventListener("popstate", () => {
    updateInspectorUI();
  });

  const btnCopy = document.getElementById("btn-copy-url");
  btnCopy?.addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.search);
    const orig = btnCopy.textContent;
    btnCopy.textContent = "Copied!";
    setTimeout(() => (btnCopy.textContent = orig), 1500);
  });

  const btnReset = document.getElementById("btn-reset-url");
  btnReset?.addEventListener("click", () => {
    window.history.replaceState({}, "", window.location.pathname);
    updateInspectorUI();
    reloadAllTables();
  });

  updateInspectorUI();
}

function updateInspectorUI() {
  const urlDisplay = document.getElementById("inspector-url");
  const usersStateDisplay = document.getElementById("inspector-users-state");
  const ordersStateDisplay = document.getElementById("inspector-orders-state");

  const search = window.location.search;
  if (urlDisplay) urlDisplay.textContent = search || "? (empty - default states active)";

  const usersState = readTableState("users");
  if (usersStateDisplay) usersStateDisplay.textContent = JSON.stringify(usersState, null, 2);

  const ordersState = readTableState("orders");
  if (ordersStateDisplay) ordersStateDisplay.textContent = JSON.stringify(ordersState, null, 2);
}

function reloadAllTables() {
  if (usersTabulator) (usersTabulator as { setData: () => void }).setData();
  if (ordersTabulator) (ordersTabulator as { setData: () => void }).setData();
  updateInspectorUI();
}

// Run bootstrap
bootstrap();
