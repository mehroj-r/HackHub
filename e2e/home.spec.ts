import { expect, test } from "@playwright/test";

// docs/08 > "/ Landing" (redesign: the demo-day big screen): the example
// scoreboard, the two ways in, one line per role and the steps of a hackathon.
test("the home page loads and names the three role areas", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: /Run a hackathon/ }),
  ).toBeVisible();
  for (const role of ["Participants", "Judges", "Organizers"]) {
    await expect(page.getByRole("heading", { name: role })).toBeVisible();
  }
  await expect(page.getByRole("table", { name: /Example ranking/ })).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: "Run a hackathon" }),
  ).toHaveAttribute("href", "/register");
  await expect(
    page.getByRole("main").getByRole("link", { name: "Join one" }),
  ).toHaveAttribute("href", "/events");
});
