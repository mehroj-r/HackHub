"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOutIcon, MenuIcon, UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { logout } from "./actions";
import { NavLinks } from "./nav-links";
import type { NavItem } from "./nav-items";

// Below md the navigation moves into a side sheet: the same items, plus the
// user menu items (or Log in / Register for a visitor).
export function MobileNav({
  items,
  user,
}: {
  items: NavItem[];
  user: { displayName: string; roleLabel: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon-lg"
          className="size-11 md:hidden"
          aria-label="Open menu"
        >
          <MenuIcon aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="truncate">
            {user ? `${user.displayName} · ${user.roleLabel}` : "Welcome to HackHub"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-6">
          <NavLinks items={items} orientation="vertical" onNavigate={close} />
          <Separator />
          {user ? (
            <div className="flex flex-col gap-1">
              <Button
                asChild
                variant="ghost"
                className="h-11 justify-start px-3 text-base"
              >
                <Link href="/profile" onClick={close}>
                  <UserIcon aria-hidden />
                  My profile
                </Link>
              </Button>
              <form action={logout}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="h-11 w-full justify-start px-3 text-base"
                >
                  <LogOutIcon aria-hidden />
                  Log out
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="h-11 text-base">
                <Link href="/login" onClick={close}>
                  Log in
                </Link>
              </Button>
              <Button asChild className="h-11 text-base">
                <Link href="/register" onClick={close}>
                  Register
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
