import "dotenv/config";

import { expect, test, type Page } from "@playwright/test";

// docs/06 TC-01, TC-02, TC-04, TC-07 on the demo seed (npm run db:seed:demo):
// "Demo Hack · judging" has three criteria (max 10) and two submitted teams.
// Logs in as judge@hackhub.test with SEED_DEMO_PASSWORD.

test.describe.configure({ mode: "serial", timeout: 60_000 });

async function openNullPointers(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("judge@hackhub.test");
  await page.getByLabel("Password").fill(process.env.SEED_DEMO_PASSWORD!);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/judge$/);
  await page.getByRole("link", { name: /^\d*\s*Null Pointers/ }).first().click();
  await expect(page).toHaveURL(/\/judge\/teams\//);
}

const innovation = (page: Page) => page.getByRole("radiogroup", { name: /Innovation/ });
// The criterion's posted value: the hidden input next to its radiogroup.
const hiddenInnovation = (page: Page) =>
  innovation(page).locator("xpath=../..").locator('input[type="hidden"][name^="score:"]');

test("one 0–max scale per criterion; scores save and update (TC-01, TC-04)", async ({
  page,
}) => {
  await openNullPointers(page);
  await expect(page.getByRole("radiogroup")).toHaveCount(3);
  await expect(innovation(page).getByRole("radio")).toHaveCount(11);

  await innovation(page).getByRole("radio", { name: "10" }).click();
  await expect(innovation(page).getByRole("radio", { name: "10" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Scores saved.")).toBeVisible();
  await page.reload();
  await expect(innovation(page).getByRole("radio", { name: "10" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
});

test("Skip to the scorecard moves focus there", async ({ page }) => {
  await openNullPointers(page);
  await page.getByRole("link", { name: "Skip to the scorecard" }).click();
  await expect(page.locator("#scorecard")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(innovation(page).getByRole("radio").and(page.locator(":focus"))).toHaveCount(1);
});

test("keys 0–9 score the focused criterion; Backspace clears", async ({ page }) => {
  await openNullPointers(page);
  await innovation(page).getByRole("radio", { name: "10" }).focus();
  await page.keyboard.press("7");
  await expect(innovation(page).getByRole("radio", { name: "7" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.keyboard.press("1");
  await page.keyboard.press("0");
  await expect(innovation(page).getByRole("radio", { name: "10" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.keyboard.press("Backspace");
  await expect(hiddenInnovation(page)).toHaveValue("");
  await page.keyboard.press("ArrowRight");
  await expect(hiddenInnovation(page)).toHaveValue("0");

  // A digit then an immediate Tab and digit lands in the next criterion.
  await page.keyboard.press("6");
  await page.keyboard.press("Tab");
  await page.keyboard.press("4");
  await expect(hiddenInnovation(page)).toHaveValue("6");
  await expect(
    page.getByRole("radiogroup", { name: /Execution/ }).getByRole("radio", { name: "4" }),
  ).toHaveAttribute("aria-checked", "true");
});

test("junk and out-of-range posts are refused and keep the saved score (TC-02, TC-07)", async ({
  page,
}) => {
  await openNullPointers(page);
  await innovation(page).getByRole("radio", { name: "10" }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Scores saved.")).toBeVisible();

  await expect(page.getByText("Scores saved.")).toHaveCount(0, { timeout: 10_000 });

  // The buttons can only post valid values, so post junk the way a crafted
  // request would: the server still has to refuse it.
  for (const junk of ["11", "1e", "-1", "7.5"]) {
    await hiddenInnovation(page).evaluate((el, v) => {
      (el as HTMLInputElement).value = v;
    }, junk);
    await page.locator("form").filter({ has: hiddenInnovation(page) }).evaluate((form) => {
      const save = form.querySelector<HTMLButtonElement>('button[value="save"]')!;
      (form as HTMLFormElement).requestSubmit(save);
    });
    await expect(page.getByText("Enter a whole number from 0 to 10.")).toBeVisible();
    await expect(page.getByText("Scores saved.")).toHaveCount(0);
  }

  await page.reload();
  await expect(innovation(page).getByRole("radio", { name: "10" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
});
