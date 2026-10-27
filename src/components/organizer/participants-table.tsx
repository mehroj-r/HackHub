"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ExternalLinkIcon } from "lucide-react";

import {
  DetailPanel,
  FilterChips,
  ListItem,
  ListItems,
  ListRow,
  ListTable,
  matches,
  NoMatches,
  PanelSection,
  PlainHeader,
  RowButton,
  SearchBox,
  SortHeader,
  useSort,
  usePanel,
  useSorted,
} from "@/components/organizer/list-kit";
import {
  formatTashkentDate,
  isWebUrl,
} from "@/components/organizer/participants-format";
import { textLink } from "@/components/organizer/stacked-table";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// The Participants tab (docs/08 > Participants and teams; redesign: table +
// detail panel): search, team filter, sortable columns, and a side panel with
// the person's profile and team.

export type ParticipantTableRow = {
  userId: string;
  name: string | null;
  email: string;
  faculty: string | null;
  teamName: string | null;
  registeredAt: Date;
  skills: string[];
  bio: string | null;
  links: string[];
};

type Key = "name" | "faculty" | "team" | "registered";
type TeamFilter = "all" | "team" | "none";

export function ParticipantsTable({
  rows,
  initialQuery = "",
}: {
  rows: ParticipantTableRow[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<TeamFilter>("all");
  const [sort, toggleSort] = useSort<Key>({ key: "name", dir: "asc" });
  const panel = usePanel();

  const value = useCallback(
    (row: ParticipantTableRow, key: Key) =>
      key === "name"
        ? (row.name ?? row.email)
        : key === "faculty"
          ? row.faculty
          : key === "team"
            ? row.teamName
            : row.registeredAt.getTime(),
    [],
  );
  const searched = rows.filter((r) =>
    matches(query, r.name, r.email, r.faculty, r.teamName),
  );
  const shown = useSorted(
    searched.filter((r) =>
      filter === "all" ? true : filter === "team" ? !!r.teamName : !r.teamName,
    ),
    sort,
    value,
  );
  const open = rows.find((r) => r.userId === panel.id) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SearchBox
          id="participants-search"
          label="Search by name, email, faculty or team"
          value={query}
          onChange={setQuery}
        />
        <FilterChips
          label="Filter by team"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: searched.length },
            {
              value: "team",
              label: "In a team",
              count: searched.filter((r) => r.teamName).length,
            },
            {
              value: "none",
              label: "No team",
              count: searched.filter((r) => !r.teamName).length,
            },
          ]}
        />
      </div>

      <p className="sr-only" role="status">
        {shown.length === 1 ? "1 participant" : `${shown.length} participants`}
      </p>

      {shown.length === 0 ? (
        <NoMatches query={query} />
      ) : (
        <>
          <ListTable
            caption="Participants"
            head={
              <>
                <SortHeader column="name" sort={sort} onSort={toggleSort}>
                  Name
                </SortHeader>
                <PlainHeader>Email</PlainHeader>
                <SortHeader column="faculty" sort={sort} onSort={toggleSort}>
                  Faculty
                </SortHeader>
                <SortHeader column="team" sort={sort} onSort={toggleSort}>
                  Team
                </SortHeader>
                <SortHeader
                  column="registered"
                  sort={sort}
                  onSort={toggleSort}
                  className="w-36"
                >
                  Registered on
                </SortHeader>
              </>
            }
          >
            {shown.map((row) => {
              const name = row.name ?? row.email;
              return (
                <ListRow
                  key={row.userId}
                  onOpen={() => panel.show(row.userId)}
                  selected={panel.open && panel.id === row.userId}
                >
                  <td className="px-3">
                    <RowButton
                      onOpen={() => panel.show(row.userId)}
                      label={`${name}: open details`}
                    >
                      <span className="break-words">{name}</span>
                    </RowButton>
                  </td>
                  <td className="px-3 break-all text-muted-foreground">
                    {row.email}
                  </td>
                  <td className="px-3">
                    {row.faculty ?? (
                      <span className="text-muted-foreground">Not given</span>
                    )}
                  </td>
                  <td className="px-3">
                    {row.teamName ?? (
                      <span className="text-muted-foreground">No team</span>
                    )}
                  </td>
                  <td className="px-3 whitespace-nowrap">
                    {formatTashkentDate(row.registeredAt)}
                  </td>
                </ListRow>
              );
            })}
          </ListTable>

          <ListItems>
            {shown.map((row) => (
              <ListItem
                key={row.userId}
                onOpen={() => panel.show(row.userId)}
                title={row.name ?? row.email}
                detail={[row.faculty, row.teamName ?? "No team"]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ))}
          </ListItems>
        </>
      )}

      <Sheet open={panel.open && !!open} onOpenChange={panel.onOpenChange}>
        {open && (
          <ParticipantPanel row={open} onCloseAutoFocus={panel.restoreFocus} />
        )}
      </Sheet>
    </div>
  );
}

function ParticipantPanel({
  row,
  onCloseAutoFocus,
}: {
  row: ParticipantTableRow;
  onCloseAutoFocus: (event: Event) => void;
}) {
  return (
    <DetailPanel
      onCloseAutoFocus={onCloseAutoFocus}
      title={row.name ?? row.email}
      description={row.email}
    >
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Faculty</dt>
        <dd>{row.faculty ?? "Not given"}</dd>
        <dt className="text-muted-foreground">Team</dt>
        <dd>{row.teamName ?? "No team"}</dd>
        <dt className="text-muted-foreground">Registered on</dt>
        <dd className="tabular-nums">{formatTashkentDate(row.registeredAt)}</dd>
      </dl>

      {row.skills.length > 0 && (
        <PanelSection title="Skills">
          <ul className="flex flex-wrap gap-1.5">
            {row.skills.map((skill) => (
              <li key={skill}>
                <Badge variant="secondary">{skill}</Badge>
              </li>
            ))}
          </ul>
        </PanelSection>
      )}

      {row.bio && (
        <PanelSection title="Bio">
          <p className="text-sm whitespace-pre-line break-words">{row.bio}</p>
        </PanelSection>
      )}

      {row.links.length > 0 && (
        <PanelSection title="Links">
          <ul className="flex flex-col gap-1">
            {row.links.map((link) => (
              <li key={link}>
                {isWebUrl(link) ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      textLink,
                      "inline-flex min-h-11 items-center gap-1 text-sm break-all md:min-h-9",
                    )}
                  >
                    {link}
                    <ExternalLinkIcon
                      className="size-3.5 shrink-0"
                      aria-hidden
                    />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : (
                  <span className="text-sm break-all">{link}</span>
                )}
              </li>
            ))}
          </ul>
        </PanelSection>
      )}

      <Link
        href={`/profile/${row.userId}`}
        className={cn(textLink, "inline-flex min-h-11 items-center text-sm")}
      >
        Open the full profile
      </Link>
    </DetailPanel>
  );
}
