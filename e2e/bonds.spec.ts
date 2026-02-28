import { test, expect } from "@playwright/test";

test.describe("Bonds Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/bonds");
  });

  test("renders the bond visualization page", async ({ page }) => {
    await expect(page.locator("text=Bond Visualization")).toBeVisible();
  });

  test("bond type selector shows all three types", async ({ page }) => {
    await expect(page.locator("button:has-text('σ (s-s)')")).toBeVisible();
    await expect(page.locator("button:has-text('σ (p-p)')")).toBeVisible();
    await expect(page.locator("button:has-text('π (p-p)')")).toBeVisible();
  });

  test("switching bond types updates description", async ({ page }) => {
    // Click sigma p-p
    await page.click("button:has-text('σ (p-p)')");
    await expect(
      page.locator("text=Head-on overlap of two p orbitals")
    ).toBeVisible();

    // Click pi p-p
    await page.click("button:has-text('π (p-p)')");
    await expect(
      page.locator("text=Side-by-side overlap of two p orbitals")
    ).toBeVisible();
  });

  test("bond distance slider is present", async ({ page }) => {
    await expect(page.locator("text=Bond Distance")).toBeVisible();
  });

  test("3D canvas renders for bond visualization", async ({ page }) => {
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });
});
