import { test, expect } from "@playwright/test";

test.describe("SSR Hydration & Zero Duplicate Request Verification", () => {
  test("Plain script tag: hydrates SSR data without duplicate initial requests", async ({ page }) => {
    await page.goto("/plain.html");

    // Table rendered with SSR data
    const rows = page.locator("#table-users .tabulator-table tbody tr");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("Alice");
    await expect(rows.nth(1)).toContainText("Bob");

    // Zero initial network fetch requests triggered during hydration
    const fetchCount = await page.evaluate(() => (window as unknown as { networkFetchCount: number }).networkFetchCount);
    expect(fetchCount).toBe(0);
  });

  test("ESM consumer: mounts multiple tables with zero initial requests", async ({ page }) => {
    await page.goto("/esm.html");

    // Both tables rendered
    const usersRows = page.locator("#table-users .tabulator-table tbody tr");
    await expect(usersRows).toHaveCount(2);
    await expect(usersRows.nth(0)).toContainText("user_alpha");

    const logsRows = page.locator("#table-logs .tabulator-table tbody tr");
    await expect(logsRows).toHaveCount(2);
    await expect(logsRows.nth(0)).toContainText("info");

    const fetchCount = await page.evaluate(() => (window as unknown as { networkFetchCount: number }).networkFetchCount);
    expect(fetchCount).toBe(0);
  });

  test("Blade consumer: hydrates server-rendered payload, loads subsequent pages without duplicate requests", async ({ page }) => {
    await page.goto("/blade.html");

    // Initial server-supplied articles
    const rows = page.locator("#table-articles .tabulator-table tbody tr");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("First Article");

    // 0 initial network requests during SSR hydration
    let fetchCount = await page.evaluate(() => (window as unknown as { networkFetchCount: number }).networkFetchCount);
    expect(fetchCount).toBe(0);

    // Request Next Page: exactly 1 request to server
    await page.click("#btn-blade-next");
    await expect(rows.nth(0)).toContainText("Third Article");

    fetchCount = await page.evaluate(() => (window as unknown as { networkFetchCount: number }).networkFetchCount);
    expect(fetchCount).toBe(1);

    // URL is updated with namespaced page
    expect(page.url()).toContain("tm%5Barticles%5D%5Bpage%5D=2");
  });

  test("Inertia consumer: hydrates props and pushes state without duplicate initial requests", async ({ page }) => {
    await page.goto("/inertia.html");

    const rows = page.locator("#table-inertia .tabulator-table tbody tr");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("Inertia Post 1");

    const fetchCount = await page.evaluate(() => (window as unknown as { networkFetchCount: number }).networkFetchCount);
    expect(fetchCount).toBe(0);

    await page.click("#btn-inertia-filter");
    expect(page.url()).toContain("tm%5Binertia_tbl%5D%5Bfilters%5D%5B0%5D%5Bfield%5D=score");
    expect(page.url()).toContain("150");
  });
});
