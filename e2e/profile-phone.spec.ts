import { expect, test, type Page } from "@playwright/test";

// The optional profile phone: typed any way, saved as +998…, shown grouped;
// a value that isn't a phone is flagged on blur; clearing it saves nothing.

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
