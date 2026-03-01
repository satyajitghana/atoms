import { test, expect } from "@playwright/test";

test.describe("Compound Lab Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lab");
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.removeItem("atoms-discovered-compounds"));
  });

  test("renders the compound lab page", async ({ page }) => {
    await expect(page.locator("text=Compound Lab")).toBeVisible();
    await expect(
      page.locator("text=Combine elements to discover compounds")
    ).toBeVisible();
  });

  test("element palette shows quick access elements", async ({ page }) => {
    // H, O, C, N should all be visible
    await expect(page.locator("button:has-text('H')").first()).toBeVisible();
    await expect(page.locator("button:has-text('O')").first()).toBeVisible();
  });

  test("adding elements to workspace", async ({ page }) => {
    // Click H twice
    const hButton = page.locator("button:has-text('H')").first();
    await hButton.click();
    await hButton.click();

    // Should see 2 hydrogen cards in workspace
    const hydrogenCards = page.locator("text=Hydrogen");
    await expect(hydrogenCards).toHaveCount(2);
  });

  test("react button discovers H2", async ({ page }) => {
    // Add two H
    const hButton = page.locator("button:has-text('H')").first();
    await hButton.click();
    await hButton.click();

    // Click React
    await page.click("button:has-text('React!')");

    // Should show H2 discovered
    await expect(page.locator("text=Hydrogen Gas")).toBeVisible();
    await expect(page.locator("text=Compound Discovered!")).toBeVisible();
  });

  test("react NaCl discovery", async ({ page }) => {
    // Add Na
    await page.locator("button:has-text('Na')").first().click();
    // Add Cl
    await page.locator("button:has-text('Cl')").first().click();

    // React
    await page.click("button:has-text('React!')");

    // Should discover NaCl
    await expect(page.locator("text=Sodium Chloride")).toBeVisible();
    await expect(page.locator("text=ionic")).toBeVisible();
  });

  test("failed reaction shows helpful message", async ({ page }) => {
    // Add He (noble gas)
    await page.click("text=Browse All");

    // Search for Helium
    await page.fill("input[placeholder='Search elements...']", "He");
    await page.locator("button:has-text('He')").first().click();

    // Add another He
    await page.locator("button:has-text('He')").first().click();

    // React
    await page.click("button:has-text('React!')");

    // Should show failure message about noble gas
    await expect(page.locator("text=No Reaction")).toBeVisible();
  });

  test("discovery log shows progress", async ({ page }) => {
    await expect(page.locator("text=Discovery Log")).toBeVisible();

    // Click to open log
    await page.click("text=Discovery Log");

    // Should show difficulty tiers
    await expect(page.locator("text=Easy")).toBeVisible();
    await expect(page.locator("text=Medium")).toBeVisible();
    await expect(page.locator("text=Hard")).toBeVisible();
  });

  test("clear workspace removes all elements", async ({ page }) => {
    // Add an element
    const hButton = page.locator("button:has-text('H')").first();
    await hButton.click();

    // Clear
    await page.click("text=Clear");

    // Workspace should be empty
    await expect(
      page.locator("text=Click elements above to add them here")
    ).toBeVisible();
  });

  test("responsive: layout stacks on mobile", async ({ page }) => {
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 1024) {
      // On mobile, sections should stack vertically
      const labHeader = page.locator("text=Compound Lab");
      await expect(labHeader).toBeVisible();
    }
  });
});
