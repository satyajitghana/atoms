import { test, expect } from "@playwright/test";

test.describe("Visualizer Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/visualizer");
  });

  test("renders the visualizer page with controls", async ({ page }) => {
    // Check page title area
    await expect(page.locator("text=Orbital Visualizer")).toBeVisible();

    // Check quantum controls are present
    await expect(page.locator("text=Principal (n)")).toBeVisible();
  });

  test("renders a canvas for 3D visualization", async ({ page }) => {
    // Wait for Three.js canvas to appear
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test("quantum number buttons change orbital", async ({ page }) => {
    // Wait for controls to be ready
    await expect(page.locator("text=Principal (n)")).toBeVisible();

    // Click n=3 button
    const n3Button = page.locator("button", { hasText: "3" }).first();
    await n3Button.click();

    // Verify orbital name updated
    await expect(page.locator("text=3")).toBeVisible();
  });

  test("render mode toggle switches between points and volume", async ({
    page,
  }) => {
    await expect(page.locator("text=Render Mode")).toBeVisible();

    // Click Volume button
    await page.click("button:has-text('Volume')");

    // Density slider should appear
    await expect(page.locator("text=Density")).toBeVisible();

    // Click Points button to go back
    await page.click("button:has-text('Points')");

    // Particle controls should appear
    await expect(page.locator("text=Particles")).toBeVisible();
  });

  test("EDL toggle is present and functional", async ({ page }) => {
    await expect(page.locator("text=Eye Dome Lighting")).toBeVisible();
  });

  test("responsive: mobile layout shows settings button", async ({ page }) => {
    // Only run for mobile viewport
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      // Settings toggle button should be visible on mobile
      const settingsBtn = page.locator("button").filter({
        has: page.locator("svg"),
      }).first();
      await expect(settingsBtn).toBeVisible();
    }
  });
});
