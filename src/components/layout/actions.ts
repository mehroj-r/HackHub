"use server";

import { signOut } from "@/auth";

// Logging out needs no authorization: it only ends the caller's own session.
// The toast "You're logged out." is shown on / by <NoticeToast />.
export async function logout() {
  await signOut({ redirectTo: "/?notice=logged-out" });
}
