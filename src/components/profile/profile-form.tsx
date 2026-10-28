"use client";

import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { toast } from "sonner";

import { SavedTick } from "@/components/feedback/saved-tick";
import { ActionDock } from "@/components/layout/action-dock";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/action-state";
import { useActionResult } from "@/lib/forms/use-action-result";
import { useFieldValidation } from "@/lib/forms/use-field-validation";
import { profileFormSchema } from "@/lib/validation/profile";

// The /profile form (docs/08 > /profile), validating as you go (redesign >
// Forms): name, faculty, phone, bio and links are checked on blur with the server's
// own rules (profileFormSchema), errors sit under the field and the field
// keeps its value. Every field is controlled, so the values also survive
// React's form reset after the action returns. The server's result is the
// one that counts; its field errors still land under the fields.

export type ProfileFormValues = {
  name: string;
  faculty: string;
  phone: string;
  skills: string[];
  bio: string;
  links: string[];
};

const MAX_SKILLS = 10;
const MAX_LINKS = 3;
const MAX_BIO = 500;

export function ProfileForm({
  action,
  initial,
  goToEventsAfterSave,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initial: ProfileFormValues;
  /** The first save after registering goes on to /events (docs/08). */
  goToEventsAfterSave: boolean;
}) {
  const router = useRouter();
  // Read once: after the save the page re-renders with the profile in place,
  // and the prop turns false in the same update as the result. The kept-alive
  // form doesn't remount, so the first save clears it too.
  const [isFirstSave, setIsFirstSave] = useState(goToEventsAfterSave);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await action(prev, formData);
      if (result?.ok && !isFirstSave) setSavedAt(Date.now());
      return result;
    },
    null,
  );
  const v = useFieldValidation(
    profileFormSchema,
    state?.ok === false ? state.fieldErrors : undefined,
  );

  const [name, setName] = useState(initial.name);
  const [faculty, setFaculty] = useState(initial.faculty);
  const [phone, setPhone] = useState(initial.phone);
  const [bio, setBio] = useState(initial.bio);
  const [skills, setSkills] = useState(initial.skills);
  const [skillDraft, setSkillDraft] = useState("");
  const [links, setLinks] = useState(
    initial.links.length > 0 ? initial.links : [""],
  );

  useActionResult(state, (result) => {
    if (!result.ok) return;
    toast.success(result.message ?? "Profile saved.");
    if (!isFirstSave) return;
    setIsFirstSave(false);
    router.push("/events");
  });

  /** The hook's props, with our own onChange keeping the controlled value. */
  function wire<E extends HTMLInputElement | HTMLTextAreaElement>(
    name: string,
    set: (value: string) => void,
  ) {
    const props = v.fieldProps(name);
    return {
      ...props,
      onChange: (e: React.ChangeEvent<E>) => {
        set(e.target.value);
        props.onChange(e);
      },
    };
  }

  const errors = {
    name: v.errorFor("name"),
    faculty: v.errorFor("faculty"),
    phone: v.errorFor("phone"),
    skills: v.errorFor("skills"),
    bio: v.errorFor("bio"),
    links: v.errorFor("links"),
  };

  function addSkill() {
    const skill = skillDraft.trim();
    if (!skill) return;
    const known = skills.some((s) => s.toLowerCase() === skill.toLowerCase());
    if (!known && skills.length < MAX_SKILLS) setSkills([...skills, skill]);
    setSkillDraft("");
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {state?.ok === false && state.formError && (
        <Alert variant="destructive">
          <AlertDescription>{state.formError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            autoComplete="name"
            maxLength={80}
            value={name}
            {...wire<HTMLInputElement>("name", setName)}
          />
          <FieldError id={v.errorId("name")}>{errors.name}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.faculty)}>
          <FieldLabel htmlFor="faculty">Faculty</FieldLabel>
          <Input
            id="faculty"
            autoComplete="organization-title"
            maxLength={80}
            value={faculty}
            {...wire<HTMLInputElement>("faculty", setFaculty)}
          />
          <FieldError id={v.errorId("faculty")}>{errors.faculty}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.phone)}>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+998 90 123 45 67"
            maxLength={30}
            value={phone}
            {...wire<HTMLInputElement>("phone", setPhone)}
            aria-describedby={
              errors.phone ? `phone-hint ${v.errorId("phone")}` : "phone-hint"
            }
          />
          <FieldDescription id="phone-hint">
            Optional. Organizers use it to reach your team.
          </FieldDescription>
          <FieldError id={v.errorId("phone")}>{errors.phone}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.skills)}>
          <FieldLabel htmlFor="skill-draft">Skills</FieldLabel>
          <FieldDescription>
            Add up to {MAX_SKILLS}, one at a time. Optional.
          </FieldDescription>
          {skills.map((skill) => (
            <input key={skill} type="hidden" name="skills" value={skill} />
          ))}
          {skills.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Your skills">
              {skills.map((skill) => (
                <li key={skill}>
                  <Badge
                    variant="secondary"
                    className="h-11 gap-1 pr-0 md:h-8 md:pr-1"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() =>
                        setSkills(skills.filter((s) => s !== skill))
                      }
                      className="hover:bg-background/40 focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-full md:size-6 focus-visible:ring-2 focus-visible:outline-none"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Input
              id="skill-draft"
              value={skillDraft}
              maxLength={30}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              disabled={skills.length >= MAX_SKILLS}
              aria-invalid={errors.skills ? true : undefined}
              aria-describedby={errors.skills ? v.errorId("skills") : undefined}
            />
            <Button
              type="button"
              variant="outline"
              className="min-h-11 md:min-h-9"
              onClick={addSkill}
              disabled={skills.length >= MAX_SKILLS || !skillDraft.trim()}
            >
              <Plus aria-hidden />
              Add skill
            </Button>
          </div>
          <FieldError id={v.errorId("skills")}>{errors.skills}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.bio)}>
          <FieldLabel htmlFor="bio">Bio</FieldLabel>
          <Textarea
            id="bio"
            rows={5}
            value={bio}
            {...wire<HTMLTextAreaElement>("bio", setBio)}
            aria-describedby={
              errors.bio ? `bio-count ${v.errorId("bio")}` : "bio-count"
            }
          />
          <FieldDescription
            id="bio-count"
            aria-live="polite"
            className="tabular-nums"
          >
            {bio.length} / {MAX_BIO} characters
          </FieldDescription>
          <FieldError id={v.errorId("bio")}>{errors.bio}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.links)}>
          <FieldLabel htmlFor="link-0">Links</FieldLabel>
          <FieldDescription>
            Up to {MAX_LINKS}, each a full link starting with https://.
            Optional.
          </FieldDescription>
          {links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <Input
                id={`link-${i}`}
                type="url"
                inputMode="url"
                placeholder="https://github.com/you"
                value={link}
                {...wire<HTMLInputElement>("links", (value) =>
                  setLinks(links.map((l, j) => (j === i ? value : l))),
                )}
                aria-label={i === 0 ? undefined : `Link ${i + 1}`}
              />
              {links.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-11 md:size-9"
                  onClick={() => setLinks(links.filter((_, j) => j !== i))}
                  aria-label={`Remove link ${i + 1}`}
                >
                  <X aria-hidden />
                </Button>
              )}
            </div>
          ))}
          {links.length < MAX_LINKS && (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 self-start md:min-h-9"
              onClick={() => setLinks([...links, ""])}
            >
              <Plus aria-hidden />
              Add link
            </Button>
          )}
          <FieldError id={v.errorId("links")}>{errors.links}</FieldError>
        </Field>
      </FieldGroup>

      {/* Thumb-first: the save docks to the bottom on phones. */}
      <ActionDock className="bg-card/95 supports-[backdrop-filter]:bg-card/85 md:flex-row md:items-center md:gap-3 md:bg-transparent">
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          aria-busy={pending}
          className="h-11 w-full px-6 text-base md:w-auto"
        >
          {pending ? "Saving…" : "Save profile"}
        </Button>
        {/* Phones get the toast; the tick sits beside the button from md. */}
        <SavedTick savedAt={savedAt} className="hidden md:inline-flex" />
      </ActionDock>
    </form>
  );
}
