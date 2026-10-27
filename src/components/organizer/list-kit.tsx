"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  SearchIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// The pieces of the organizer lists (redesign: table + detail panel): a
// search box, filter chips, sortable column headers, the table shell with a
// sticky header, and the side panel. Filtering and sorting run in the browser
// on rows the server already authorized and loaded.

export type SortDir = "asc" | "desc";
export type Sort<K extends string> = { key: K; dir: SortDir };

const collator = new Intl.Collator("en", {
  sensitivity: "base",
  numeric: true,
});

/** Sort rows by the chosen key; strings compare like a person would, empties last. */
export function useSorted<T, K extends string>(
  rows: T[],
  sort: Sort<K>,
  value: (row: T, key: K) => string | number | null,
): T[] {
  return useMemo(() => {
    const sign = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = value(a, sort.key);
      const y = value(b, sort.key);
      if (x === y) return 0;
      if (x === null || x === "") return 1;
      if (y === null || y === "") return -1;
      const order =
        typeof x === "number" && typeof y === "number"
          ? x - y
          : collator.compare(String(x), String(y));
      return order * sign;
    });
  }, [rows, sort, value]);
}

export function useSort<K extends string>(initial: Sort<K>) {
  const [sort, setSort] = useState(initial);
  const toggle = (key: K) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  return [sort, toggle] as const;
}

/**
 * Which row the side panel shows. The row stays chosen while the panel closes,
 * so its content doesn't vanish mid-close and focus goes back to the row that
 * opened it.
 */
export function usePanel() {
  const [state, setState] = useState<{ id: string | null; open: boolean }>({
    id: null,
    open: false,
  });
  // The control that opened the panel gets focus back when it closes.
  const trigger = useRef<HTMLElement | null>(null);
  return {
    id: state.id,
    open: state.open,
    show: (id: string) => {
      const active = document.activeElement;
      trigger.current =
        active instanceof HTMLElement && active !== document.body
          ? active
          : null;
      setState({ id, open: true });
    },
    onOpenChange: (open: boolean) => setState((s) => ({ ...s, open })),
    restoreFocus: (event: Event) => {
      if (trigger.current?.isConnected) {
        event.preventDefault();
        trigger.current.focus();
      }
    },
  };
}

/** True when any of the fields contains the query, ignoring case. */
export function matches(
  query: string,
  ...fields: (string | null | undefined)[]
) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => f?.toLowerCase().includes(q));
}

export function SearchBox({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-sm">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 pl-9 md:h-9"
          autoComplete="off"
        />
      </div>
    </div>
  );
}

/** Filter chips: one choice at a time, each a toggle button with its count. */
export function FilterChips<V extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: V; label: string; count: number }[];
  value: V;
  onChange: (value: V) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:min-h-8",
              on
                ? "border-foreground/40 bg-secondary font-semibold text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {option.label}
            <span className="font-mono text-xs tabular-nums">
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** A column header that sorts; aria-sort says the current order. */
export function SortHeader<K extends string>({
  column,
  sort,
  onSort,
  children,
  className,
}: {
  column: K;
  sort: Sort<K>;
  onSort: (key: K) => void;
  children: string;
  className?: string;
}) {
  const active = sort.key === column;
  const Icon = !active
    ? ChevronsUpDownIcon
    : sort.dir === "asc"
      ? ArrowUpIcon
      : ArrowDownIcon;
  return (
    <th
      scope="col"
      aria-sort={
        active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
      }
      className={cn("p-0 text-left font-medium", className)}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex h-10 w-full items-center gap-1.5 rounded-md px-3 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {children}
        <Icon className="size-3.5 shrink-0" aria-hidden />
      </button>
    </th>
  );
}

export function PlainHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "h-10 px-3 text-left text-sm font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

/**
 * The desktop table: a scroll box with a sticky header, compact 40 px rows and
 * tabular numbers. Rows open the side panel; each row's first cell holds the
 * button that does it, so the keyboard reaches every row.
 */
export function ListTable({
  caption,
  head,
  children,
}: {
  caption: string;
  head: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="hidden max-h-[min(70vh,48rem)] overflow-auto rounded-2xl border bg-card md:block">
      <table className="w-full border-collapse text-sm tabular-nums">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--border)]">
          <tr>{head}</tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}

/** A table row that opens the panel on click anywhere in it. */
export function ListRow({
  onOpen,
  selected,
  children,
}: {
  onOpen: () => void;
  selected: boolean;
  children: React.ReactNode;
}) {
  return (
    <tr
      onClick={onOpen}
      className={cn(
        "h-10 cursor-pointer hover:bg-muted/60",
        selected && "bg-muted",
      )}
    >
      {children}
    </tr>
  );
}

/** The row's first cell: a real button, so the row works from the keyboard. */
export function RowButton({
  onOpen,
  children,
  label,
}: {
  onOpen: () => void;
  children: React.ReactNode;
  /** "Open details for {name}" */
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      aria-label={label}
      className="inline-flex min-h-10 w-full items-center rounded-md text-left font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </button>
  );
}

/** Phone: each row is one big tappable item (redesign > Thumb-first). */
export function ListItems({ children }: { children: React.ReactNode }) {
  return (
    <ul className="flex flex-col divide-y rounded-2xl border bg-card md:hidden">
      {children}
    </ul>
  );
}

export function ListItem({
  onOpen,
  title,
  detail,
  aside,
}: {
  onOpen: () => void;
  title: string;
  detail: string;
  aside?: React.ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset active:bg-muted"
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-medium break-words">{title}</span>
          <span className="text-sm break-words text-muted-foreground">
            {detail}
          </span>
        </span>
        {aside}
      </button>
    </li>
  );
}

/** The side panel: full screen on a phone, a right-hand panel from sm up. */
export function DetailPanel({
  title,
  description,
  children,
  onCloseAutoFocus,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  /** usePanel().restoreFocus */
  onCloseAutoFocus?: (event: Event) => void;
}) {
  return (
    <SheetContent
      side="right"
      onCloseAutoFocus={onCloseAutoFocus}
      className="w-full overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-md motion-reduce:data-closed:animate-none motion-reduce:data-open:animate-none"
    >
      <SheetHeader className="pr-12">
        <SheetTitle className="text-xl font-semibold break-words">
          {title}
        </SheetTitle>
        {description && (
          <SheetDescription className="break-all">
            {description}
          </SheetDescription>
        )}
      </SheetHeader>
      <div className="flex flex-col gap-6 px-4 pb-6">{children}</div>
    </SheetContent>
  );
}

/** A labelled block inside the panel. */
export function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

export function NoMatches({ query }: { query: string }) {
  return (
    <p
      role="status"
      className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground"
    >
      {query.trim()
        ? `Nothing matches ‘${query.trim()}’.`
        : "Nothing matches this filter."}
    </p>
  );
}
