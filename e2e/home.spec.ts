import { expect, test } from "@playwright/test";

test("the home page loads and names the three role areas", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "HackHub" })).toBeVisible();
  await expect(page.getByText("Participants")).toBeVisible();
  await expect(page.getByText("Judges")).toBeVisible();
  await expect(page.getByText("Organizers")).toBeVisible();
});
