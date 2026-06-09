import { test, expect } from "@playwright/test";

const locales = ["nl", "en"] as const;
const pages = ["", "/diensten", "/team", "/galerij", "/contact", "/boek"] as const;

test.describe("Navigation & i18n", () => {
  test("root redirects to a locale root", async ({ page }) => {
    // next-intl negotiates locale from Accept-Language, so / → /nl or /en.
    const res = await page.goto("/");
    expect(res?.url()).toMatch(/\/(nl|en)\/?$/);
  });

  for (const locale of locales) {
    for (const path of pages) {
      test(`renders /${locale}${path || "/"} with H1 (${locale})`, async ({ page }) => {
        const res = await page.goto(`/${locale}${path}`);
        expect(res?.status()).toBe(200);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      });
    }
  }

  test("html lang matches locale", async ({ page }) => {
    for (const locale of locales) {
      await page.goto(`/${locale}`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
    }
  });

  test("language switcher preserves the path", async ({ page }) => {
    await page.goto("/nl/diensten");
    await page.locator(".site-header").getByRole("button", { name: "EN", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/diensten/);
  });

  test("hreflang alternates present", async ({ page }) => {
    await page.goto("/nl");
    for (const locale of locales) {
      await expect(page.locator(`link[hreflang="${locale}"]`)).toHaveCount(1);
    }
  });
});

test.describe("Content & responsiveness", () => {
  test("home hero shows headline and CTAs", async ({ page }) => {
    await page.goto("/nl");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/VAKMANSCHAP/i);
    await expect(page.locator(".hero-actions").getByRole("link")).toHaveCount(2);
  });

  for (const path of ["", "/diensten"] as const) {
    test(`no horizontal overflow at 375 on /nl${path || "/"}`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(`/nl${path}`);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(overflow).toBe(false);
    });
  }

  test("no console errors on home load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/nl");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
});

test.describe("Booking flow", () => {
  test("selecting a service advances to the barber step", async ({ page }) => {
    await page.goto("/nl/boek");
    // Step 1 visible
    await expect(page.getByRole("heading", { name: /Kies je dienst/i })).toBeVisible();
    // Pick the first service pill
    await page.locator(".svc-pill").first().click();
    // Continue becomes enabled, click it
    const cont = page.getByRole("button", { name: /Verder/i }).first();
    await expect(cont).toBeEnabled();
    await cont.click();
    // Step 2 (barber) heading visible
    await expect(page.getByRole("heading", { name: /Bij wie zit je/i })).toBeVisible();
  });
});
