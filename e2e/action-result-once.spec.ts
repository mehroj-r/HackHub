import { expect, test, type Page } from "@playwright/test";

// A form's success toast and redirect run once per save. With cacheComponents,
// Next keeps visited routes alive and re-runs their effects when they are shown
// again, so a plain useEffect on the action state replayed the last result:
// every visit to Profile toasted "Profile saved." and jumped to /events.

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
test.describe.configure({ timeout: 90_000 });

const PASSWORD = "correct-horse-1";

async function registerFresh(page: Page) {
  await page.goto("/register");
  await page
    .getByLabel("Email")
    .fill(`once.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirm password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/profile$/);
}

function tab(page: Page, name: string) {
  return page
    .getByRole("navigation", { name: "Sections" })
    .getByRole("link", { name, exact: true });
}

const savedToast = (page: Page) =>
  page.locator("[data-sonner-toast]").filter({ hasText: "Profile saved." });

test("Profile doesn't replay its first save on later visits", async ({
  page,
}) => {
  await registerFresh(page);

  await page.getByLabel("Name").fill("Once Tester");
  await page.getByLabel("Faculty").fill("Computer Science");
  await page.getByRole("button", { name: "Save profile" }).click();

  // The first save after registering goes on to /events, once.
  await expect(page).toHaveURL(/\/events$/);
  await expect(savedToast(page)).toHaveCount(1);
  await expect(savedToast(page)).toHaveCount(0, { timeout: 10_000 });

  for (let round = 0; round < 3; round++) {
    await tab(page, "Profile").click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByLabel("Name")).toHaveValue("Once Tester");
    // Long enough for a replayed effect to toast and navigate away.
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/profile$/);
    await expect(savedToast(page)).toHaveCount(0);

    await tab(page, "Events").click();
    await expect(page).toHaveURL(/\/events$/);
  }

  // A later save toasts once and stays on Profile.
  await tab(page, "Profile").click();
  await page.getByLabel("Faculty").fill("Software Engineering");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(savedToast(page)).toHaveCount(1);
  await page.waitForTimeout(1500);
  await expect(page).toHaveURL(/\/profile$/);
});

// The submit form has the same first-time redirect (to the team page).
// Needs the demo seed's "Open Hack · live" (registration and submissions open).
test("Submit doesn't replay its first submission on later visits", async ({
  page,
}) => {
  await registerFresh(page);
  await page.getByLabel("Name").fill("Submit Tester");
  await page.getByLabel("Faculty").fill("Computer Science");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page).toHaveURL(/\/events$/);

  await page.getByRole("link", { name: /Open Hack · live/ }).first().click();
  await expect(page).toHaveURL(/\/events\/[^/]+$/);
  await page.getByRole("button", { name: "Register", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Registered (done)" }),
  ).toBeVisible();
  const teamPath = `${new URL(page.url()).pathname}/team`;
  await page.goto(teamPath);
  await page.getByLabel("Team name").fill(`Once ${Date.now() % 1e8}`);
  await page.getByRole("button", { name: "Create team" }).click();

  await page.getByRole("link", { name: "Submit project" }).click();
  await expect(page).toHaveURL(/\/team\/submit$/);
  await page.getByLabel("Project title").fill("Replay guard");
  await page
    .getByLabel("Description")
    .fill("Checks that a form's success runs once per save.");
  await page
    .getByLabel("Repository link")
    .fill("https://github.com/example/replay-guard");
  await page.getByRole("button", { name: "Submit project" }).click();

  // The first submission goes on to the team page, once.
  await expect(page).toHaveURL(/\/team$/);
  const toast = page.locator("[data-sonner-toast]");
  await expect(toast.filter({ hasText: "Project submitted." })).toHaveCount(1);
  await expect(toast).toHaveCount(0, { timeout: 10_000 });

  for (let round = 0; round < 2; round++) {
    await page.getByRole("link", { name: "Edit submission" }).click();
    await expect(page).toHaveURL(/\/team\/submit$/);
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/team\/submit$/);
    await expect(toast).toHaveCount(0);
    await page.getByRole("link", { name: "Team", exact: true }).first().click();
    await expect(page).toHaveURL(/\/team$/);
  }

  // A later save is an edit: it toasts once and stays.
  await page.getByRole("link", { name: "Edit submission" }).click();
  await page.getByLabel("Project title").fill("Replay guard v2");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(toast.filter({ hasText: "Submission updated." })).toHaveCount(1);
  await page.waitForTimeout(1500);
  await expect(page).toHaveURL(/\/team\/submit$/);
});
