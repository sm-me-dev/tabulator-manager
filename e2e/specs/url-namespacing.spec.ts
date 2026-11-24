import { test, expect } from "@playwright/test";

test.describe("URL Namespacing, Multi-table Isolation & State Management", () => {
  test("Plain script tag: pagination, sorting, filtering in URL", async ({ page }) => {
    await page.goto("/plain.html");

    // Next page
    await page.click("#btn-next-page");
    expect(page.url()).toContain("tm%5Busers%5D%5Bpage%5D=2");

    // Sort
    await page.click("#btn-sort-name");
    expect(page.url()).toContain("tm%5Busers%5D%5Bsort%5D%5B0%5D%5Bfield%5D=name");
    expect(page.url()).toContain("tm%5Busers%5D%5Bsort%5D%5B0%5D%5Bdir%5D=desc");

    // Filter
    await page.click("#btn-filter-active");
    expect(page.url()).toContain("tm%5Busers%5D%5Bfilters%5D%5B0%5D%5Bfield%5D=active");
  });

  test("ESM: multi-table namespacing does not overwrite or destroy other tables", async ({ page }) => {
    await page.goto("/esm.html");

    // Update Users table to page 2
    await page.click("#btn-users-page2");
    expect(page.url()).toContain("tm%5Busers%5D%5Bpage%5D=2");

    // Update Logs table with filter
    await page.click("#btn-logs-filter-err");
    // Verify both tm[users] and tm[logs] coexist in the URL!
    expect(page.url()).toContain("tm%5Busers%5D%5Bpage%5D=2");
    expect(page.url()).toContain("tm%5Blogs%5D%5Bfilters%5D%5B0%5D%5Bfield%5D=level");
    expect(page.url()).toContain("error");
  });
});
