import { test, expect } from "@playwright/test";

test.describe("Elements Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/elements");
  });

  test("renders the periodic table", async ({ page }) => {
    await expect(page.locator("text=Element Explorer")).toBeVisible();

    // Check that hydrogen element is visible
    await expect(page.locator("button:has-text('H')").first()).toBeVisible();
  });

  test("clicking an element shows orbital details", async ({ page }) => {
    // Click on Oxygen (O)
    await page.locator("button:has-text('O')").first().click();

    // Should show element name
    await expect(page.locator("text=Oxygen")).toBeVisible();

    // Should show electron configuration
    await expect(page.locator("text=1s2 2s2 2p4")).toBeVisible();
  });

  test("element selection shows aufbau diagram", async ({ page }) => {
    // Click on Carbon (C)
    await page.locator("button:has-text('C')").first().click();

    // Aufbau diagram should appear
    await expect(page.locator("text=Electron Configuration")).toBeVisible();
  });

  test("orbital pills are shown when element selected", async ({ page }) => {
    // Click on Nitrogen (N)
    await page.locator("button:has-text('N')").first().click();

    // Orbital section should be visible
    await expect(page.locator("text=Orbitals")).toBeVisible();
  });

  test("3D viewer shows when element is selected", async ({ page }) => {
    await page.locator("button:has-text('H')").first().click();

    // Canvas should appear for 3D visualization
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test("clear selection button works", async ({ page }) => {
    // Select an element
    await page.locator("button:has-text('H')").first().click();
    await expect(page.locator("text=Hydrogen")).toBeVisible();

    // Click the X button to clear selection
    const clearBtn = page
      .locator("button")
      .filter({ has: page.locator("svg.lucide-x") });
    if ((await clearBtn.count()) > 0) {
      await clearBtn.first().click();
      // Should go back to showing the full periodic table
      await expect(
        page.locator("text=Select an element to visualize")
      ).toBeVisible();
    }
  });

  test("responsive: table is scrollable on mobile", async ({ page }) => {
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      // The periodic table container should have overflow-x-auto
      const container = page.locator(".overflow-x-auto").first();
      await expect(container).toBeVisible();
    }
  });

  test("category legend is shown in non-compact mode", async ({ page }) => {
    // Before selecting an element, category legend should be visible
    await expect(page.locator("text=Noble Gas")).toBeVisible();
  });
});
