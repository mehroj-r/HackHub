"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { CheckIcon, ExternalLinkIcon } from "lucide-react";

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

// The Teams tab (docs/08 > Participants and teams; redesign: table + detail
// panel): team, members "{n} of {max}", "Submitted {date}" / "Not submitted".
// Opening a team shows its members and its submission read-only in the panel.

export type TeamTableRow = {
  id: string;
  name: string;
  members: { userId: string; name: string | null; email: string }[];
  submission: {
    title: string;
    description: string;
    repoUrl: string;
    /** When the version shown was submitted: the last edit, or the first submit. */
    submittedAt: Date;
  } | null;
};

type Key = "name" | "size" | "submitted";
type SubmissionFilter = "all" | "submitted" | "missing";

export function TeamsTable({
  rows,
  maxTeamSize,
}: {
  rows: TeamTableRow[];
  maxTeamSize: number;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SubmissionFilter>("all");
  const [sort, toggleSort] = useSort<Key>({ key: "name", dir: "asc" });
  const panel = usePanel();

  const value = useCallback(
    (row: TeamTableRow, key: Key) =>
      key === "name"
        ? row.name
        : key === "size"
          ? row.members.length
          : (row.submission?.submittedAt.getTime() ?? null),
    [],
  );
  const searched = rows.filter((t) =>
    matches(
      query,
      t.name,
      t.submission?.title,
      ...t.members.flatMap((m) => [m.name, m.email]),
    ),
  );
  const shown = useSorted(
    searched.filter((t) =>
      filter === "all"
        ? true
        : filter === "submitted"
          ? !!t.submission
          : !t.submission,
    ),
    sort,
    value,
  );
  const open = rows.find((t) => t.id === panel.id) ?? null;
  const memberNames = (t: TeamTableRow) =>
    t.members.map((m) => m.name ?? m.email).join(", ");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SearchBox
          id="teams-search"
          label="Search by team, member or project"
          value={query}
          onChange={setQuery}
        />
        <FilterChips
          label="Filter by submission"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: searched.length },
            {
              value: "submitted",
              label: "Submitted",
              count: searched.filter((t) => t.submission).length,
            },
            {
              value: "missing",
              label: "Not submitted",
              count: searched.filter((t) => !t.submission).length,
            },
          ]}
        />
      </div>

      <p className="sr-only" role="status">
        {shown.length === 1 ? "1 team" : `${shown.length} teams`}
      </p>

      {shown.length === 0 ? (
        <NoMatches query={query} />
      ) : (
        <>
          <ListTable
            caption="Teams"
            head={
              <>
                <SortHeader column="name" sort={sort} onSort={toggleSort}>
                  Team
                </SortHeader>
                <th
                  scope="col"
                  className="h-10 px-3 text-left text-sm font-medium text-muted-foreground"
                >
                  Members
                </th>
                <SortHeader
                  column="size"
                  sort={sort}
                  onSort={toggleSort}
                  className="w-28"
                >
                  Size
                </SortHeader>
                <SortHeader
                  column="submitted"
                  sort={sort}
                  onSort={toggleSort}
                  className="w-52"
                >
                  Submission
                </SortHeader>
              </>
            }
          >
            {shown.map((team) => (
              <ListRow
                key={team.id}
                onOpen={() => panel.show(team.id)}
                selected={panel.open && panel.id === team.id}
              >
                <td className="px-3">
                  <RowButton
                    onOpen={() => panel.show(team.id)}
                    label={`${team.name}: open details`}
                  >
                    <span className="break-words">{team.name}</span>
                  </RowButton>
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {memberNames(team)}
                </td>
                <td className="px-3 whitespace-nowrap">
                  {team.members.length} of {maxTeamSize}
                </td>
                <td className="px-3">
                  <SubmissionBadge submission={team.submission} />
                </td>
              </ListRow>
            ))}
          </ListTable>

          <ListItems>
            {shown.map((team) => (
              <ListItem
                key={team.id}
                onOpen={() => panel.show(team.id)}
                title={team.name}
                detail={`${team.members.length} of ${maxTeamSize} · ${memberNames(team)}`}
                aside={<SubmissionBadge submission={team.submission} short />}
              />
            ))}
          </ListItems>
        </>
      )}

      <Sheet open={panel.open && !!open} onOpenChange={panel.onOpenChange}>
        {open && (
          <TeamPanel
            team={open}
            maxTeamSize={maxTeamSize}
            onCloseAutoFocus={panel.restoreFocus}
          />
        )}
      </Sheet>
    </div>
  );
}

function SubmissionBadge({
  submission,
  short,
}: {
  submission: TeamTableRow["submission"];
  short?: boolean;
}) {
  if (!submission) return <Badge variant="outline">Not submitted</Badge>;
  return (
    <Badge className="bg-success text-success-foreground">
      <CheckIcon aria-hidden />
      {short
        ? "Submitted"
        : `Submitted ${formatTashkentDate(submission.submittedAt)}`}
    </Badge>
  );
}

function TeamPanel({
  onCloseAutoFocus,
  team,
  maxTeamSize,
}: {
  onCloseAutoFocus: (event: Event) => void;
  team: TeamTableRow;
  maxTeamSize: number;
}) {
  const { submission } = team;
  return (
    <DetailPanel
      onCloseAutoFocus={onCloseAutoFocus}
      title={team.name}
      description={`${team.members.length} of ${maxTeamSize} members`}
    >
      <PanelSection title="Members">
        <ul className="flex flex-col">
          {team.members.map((member) => (
            <li key={member.userId}>
              <Link
                href={`/profile/${member.userId}`}
                className={cn(
                  textLink,
                  "inline-flex min-h-11 items-center text-sm break-all md:min-h-9",
                )}
              >
                {member.name ?? member.email}
              </Link>
            </li>
          ))}
        </ul>
      </PanelSection>

      <PanelSection title="Submission">
        {submission ? (
          <div className="flex flex-col items-start gap-2">
            <SubmissionBadge submission={submission} />
            <p className="text-base font-semibold break-words">
              {submission.title}
            </p>
            <p className="text-sm whitespace-pre-line break-words">
              {submission.description}
            </p>
            {isWebUrl(submission.repoUrl) ? (
              <a
                href={submission.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  textLink,
                  "inline-flex min-h-11 items-center gap-1 text-sm break-all md:min-h-9",
                )}
              >
                {submission.repoUrl}
                <ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <span className="text-sm break-all text-muted-foreground">
                {submission.repoUrl}
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This team hasn&apos;t submitted a project.
          </p>
        )}
      </PanelSection>
    </DetailPanel>
  );
}
