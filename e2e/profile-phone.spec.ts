import "dotenv/config";

import { expect, test, type Browser, type Page } from "@playwright/test";

// The optional profile phone: typed any way, saved as +998…, shown grouped;
// a value that isn't a phone is flagged on blur; clearing it saves nothing.
// On /profile/[userId] only organizers and the owner see it. The organizer
// logs in with SEED_ORGANIZER_EMAIL / SEED_ORGANIZER_PASSWORD from .env.

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
test.describe.configure({ timeout: 90_000 });

const PASSWORD = "correct-horse-1";
const PHONE_ERROR = "Enter a phone number like +998 90 123 45 67.";

async function registerFresh(page: Page) {
  await page.goto("/register");
  await page
    .getByLabel("Email")
    .fill(`phone.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirm password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/profile$/);
}

const phoneField = (page: Page) => page.getByLabel("Phone", { exact: true });
const savedToast = (page: Page) =>
  page.locator("[data-sonner-toast]").filter({ hasText: "Profile saved." });

async function saveFirstProfile(page: Page, phone: string) {
  await page.getByLabel("Name").fill("Phone Tester");
  await page.getByLabel("Faculty").fill("Computer Science");
  await phoneField(page).fill(phone);
  await page.getByRole("button", { name: "Save profile" }).click();
  // The first save after registering goes on to /events.
  await expect(page).toHaveURL(/\/events$/);
}

test("a local number is saved as +998 and shown grouped", async ({ page }) => {
  await registerFresh(page);
  await expect(phoneField(page)).toHaveAttribute("type", "tel");
  await expect(phoneField(page)).toHaveAttribute("autocomplete", "tel");
  await expect(phoneField(page)).toHaveAttribute("inputmode", "tel");
  await expect(
    page.getByText("Optional. Organizers use it to reach your team."),
  ).toBeVisible();

  await saveFirstProfile(page, "90 123-45-67");

  await page.goto("/profile");
  await page.reload();
  await expect(phoneField(page)).toHaveValue("+998 90 123 45 67");

  // A later save keeps it as it is.
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(savedToast(page)).toHaveCount(1);
  await page.reload();
  await expect(phoneField(page)).toHaveValue("+998 90 123 45 67");
});

test("a value that isn't a phone is flagged on blur", async ({ page }) => {
  await registerFresh(page);

  await phoneField(page).fill("12ab");
  await phoneField(page).blur();

  await expect(phoneField(page)).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#phone-error")).toHaveText(PHONE_ERROR);

  // The server refuses it too, and the typed value stays.
  await page.getByLabel("Name").fill("Phone Tester");
  await page.getByLabel("Faculty").fill("Computer Science");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.locator("#phone-error")).toHaveText(PHONE_ERROR);
  await expect(page).toHaveURL(/\/profile$/);
  await expect(phoneField(page)).toHaveValue("12ab");

  // Fixing it clears the message as you type.
  await phoneField(page).fill("+998 90 123 45 67");
  await expect(page.locator("#phone-error")).toHaveCount(0);
});

test("clearing the phone saves no phone", async ({ page }) => {
  await registerFresh(page);
  await saveFirstProfile(page, "998901234567");

  await page.goto("/profile");
  await expect(phoneField(page)).toHaveValue("+998 90 123 45 67");
  await phoneField(page).fill("");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(savedToast(page)).toHaveCount(1);

  await page.reload();
  await expect(phoneField(page)).toHaveValue("");
});

/** A new 390 px context, so each person has their own session. */
async function phonePage(browser: Browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  return context.newPage();
}

async function sessionUserId(page: Page): Promise<string> {
  const res = await page.request.get("/api/auth/session");
  const session = (await res.json()) as { user: { id: string } };
  return session.user.id;
}

const telLink = (page: Page) => page.locator("main a[href^='tel:']");

test("only organizers and the owner see a profile's phone", async ({
  browser,
}) => {
  // A saves a phone.
  const a = await phonePage(browser);
  await registerFresh(a);
  await saveFirstProfile(a, "90 886-54-12");
  const aId = await sessionUserId(a);

  // A sees their own.
  await a.goto(`/profile/${aId}`);
  await expect(a.getByRole("heading", { name: "Phone Tester" })).toBeVisible();
  await expect(telLink(a)).toHaveAttribute("href", "tel:+998908865412");
  await expect(telLink(a)).toHaveText("+998 90 886 54 12");

  // Another participant sees no phone at all, not even its label.
  const b = await phonePage(browser);
  await registerFresh(b);
  await b.goto(`/profile/${aId}`);
  await expect(b.getByRole("heading", { name: "Phone Tester" })).toBeVisible();
  await expect(telLink(b)).toHaveCount(0);
  await expect(
    b.getByRole("heading", { name: "Phone", exact: true }),
  ).toHaveCount(0);
  await expect(b.locator("main")).not.toContainText("886");

  // The organizer does.
  const o = await phonePage(browser);
  await o.goto("/login");
  await o.getByLabel("Email").fill(process.env.SEED_ORGANIZER_EMAIL!);
  await o.getByLabel("Password").fill(process.env.SEED_ORGANIZER_PASSWORD!);
  await o.getByRole("button", { name: "Log in" }).click();
  await expect(o).toHaveURL(/\/organizer/);
  await o.goto(`/profile/${aId}`);
  await expect(telLink(o)).toHaveAttribute("href", "tel:+998908865412");
  await expect(telLink(o)).toHaveText("+998 90 886 54 12");
});
