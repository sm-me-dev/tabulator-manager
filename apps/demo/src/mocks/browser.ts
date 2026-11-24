import { setupWorker } from "msw/browser";
import { handlers, queryMockUsers, queryMockOrders } from "./handlers.js";

export const worker = setupWorker(...handlers);

export async function initMocks(): Promise<void> {
  // Try starting MSW Service Worker
  try {
    if ("serviceWorker" in navigator) {
      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: {
          url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
        },
      });
      return;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[demo] MSW Service Worker start bypassed; falling back to mock fetch handler:", err);
  }

  // Resilient fallback: transparent fetch interceptor when Service Worker is unavailable
  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (urlStr.includes("/api/health") && !urlStr.startsWith("http://render-backend") && !urlStr.includes(".onrender.com")) {
      return new Response(
        JSON.stringify({ status: "ok", source: "mock-fetch-fallback", timestamp: new Date().toISOString() }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/api/users") && !urlStr.startsWith("http://render-backend") && !urlStr.includes(".onrender.com")) {
      const parsedUrl = new URL(urlStr, window.location.href);
      const data = queryMockUsers(parsedUrl.search);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (urlStr.includes("/api/orders") && !urlStr.startsWith("http://render-backend") && !urlStr.includes(".onrender.com")) {
      const parsedUrl = new URL(urlStr, window.location.href);
      const data = queryMockOrders(parsedUrl.search);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return originalFetch(input, init);
  };
}
