export type BackendStatus = "waking" | "live_active" | "offline";
export type DataSource = "mock" | "live";

export interface TransportState {
  status: BackendStatus;
  dataSource: DataSource;
  renderUrl: string;
  lastChecked: Date | null;
  responseTimeMs: number | null;
}

export class TransportCoordinator {
  private state: TransportState;
  private listeners = new Set<(s: TransportState) => void>();
  private pollTimer: number | null = null;
  private isChecking = false;

  constructor(renderUrl?: string) {
    const urlFromQuery = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("backend")
      : null;

    this.state = {
      status: "waking",
      dataSource: "mock",
      renderUrl: urlFromQuery || renderUrl || "https://tabulator-manager-api.onrender.com",
      lastChecked: null,
      responseTimeMs: null,
    };
  }

  getState(): TransportState {
    return { ...this.state };
  }

  subscribe(listener: (s: TransportState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  setRenderUrl(url: string): void {
    this.state.renderUrl = url.trim().replace(/\/+$/, "");
    this.checkHealth();
  }

  setDataSource(source: DataSource): void {
    this.state.dataSource = source;
    this.emit();
  }

  getBaseUrl(): string {
    return this.state.dataSource === "live" ? this.state.renderUrl : "";
  }

  getEndpointUrl(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (this.state.dataSource === "live") {
      return `${this.state.renderUrl}${cleanPath}`;
    }
    // Mock mode must stay inside the MSW service-worker scope, which is the
    // Vite base (e.g. "/tabulator-manager/" on GitHub Pages), not the origin root.
    const base = (import.meta.env?.BASE_URL ?? "/").replace(/\/+$/, "");
    return `${base}${cleanPath}`;
  }

  async start(): Promise<void> {
    await this.checkHealth();
  }

  async checkHealth(): Promise<boolean> {
    if (this.isChecking) return false;
    this.isChecking = true;

    const startTime = performance.now();
    const healthUrl = `${this.state.renderUrl}/api/health`;

    try {
      // Fast probe with strict 2.5s timeout as required
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(healthUrl, {
        method: "GET",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      const duration = Math.round(performance.now() - startTime);
      this.state.lastChecked = new Date();
      this.state.responseTimeMs = duration;

      if (response.ok) {
        this.state.status = "live_active";
        this.emit();
        this.schedulePoll(30000); // Relaxed polling when healthy
        this.isChecking = false;
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch {
      // Backend asleep or slow to wake up
      this.state.status = "waking";
      this.state.lastChecked = new Date();
      this.state.responseTimeMs = null;
      this.emit();
      this.schedulePoll(9000); // Fast 8-10s polling while server is waking up
      this.isChecking = false;
      return false;
    }
  }

  private schedulePoll(delayMs: number): void {
    if (this.pollTimer !== null) {
      window.clearTimeout(this.pollTimer);
    }
    this.pollTimer = window.setTimeout(() => {
      this.checkHealth();
    }, delayMs);
  }

  private emit(): void {
    const current = this.getState();
    this.listeners.forEach((fn) => fn(current));
  }

  destroy(): void {
    if (this.pollTimer !== null) {
      window.clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    this.listeners.clear();
  }
}
