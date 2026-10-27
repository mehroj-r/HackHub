"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// One image field of the event form: a file input, a preview of the chosen or
// current image, and (on edit) "Remove". The server checks the file again and
// converts it; the 5 MB check here only saves uploading a file that would be
// refused anyway.

const MAX_BYTES = 5 * 1024 * 1024;
const TOO_BIG = "The image must be 5 MB or smaller.";

type Props = {
  name: "logo" | "banner";
  label: string;
  hint: string;
  /** The image the event has now, if any (edit only). */
  currentUrl: string | null;
  errors?: { message: string }[];
  /** Square avatar or wide header: the preview's shape. */
  shape: "square" | "wide";
};

export function EventImageField({
  name,
  label,
  hint,
  currentUrl,
  errors,
  shape,
}: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);

  // Free the object URL of the previous preview.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // React resets the form after every submit, which empties the file input:
  // drop the preview too, so it never shows a file that won't be sent.
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const clear = () => {
      setPreview(null);
      setRemove(false);
    };
    form.addEventListener("reset", clear);
    return () => form.removeEventListener("reset", clear);
  }, []);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setLocalError(null);
    if (!file) {
      setPreview(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError(TOO_BIG);
      event.target.value = "";
      setPreview(null);
      return;
    }
    setRemove(false);
    setPreview(URL.createObjectURL(file));
  }

  const shown = preview ?? (remove ? null : currentUrl);
  const allErrors = localError ? [{ message: localError }] : errors;
  const invalid = !!allErrors?.length;
  const removeId = `${name}-remove`;

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden border bg-muted text-muted-foreground",
            shape === "square"
              ? "size-24 rounded-2xl"
              : "aspect-[8/3] w-full rounded-lg sm:w-64",
          )}
        >
          {shown ? (
            // A local blob or a same-origin upload: next/image adds nothing here.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-6" aria-hidden />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Input
            ref={input}
            id={name}
            name={name}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onChange}
            aria-invalid={invalid}
            aria-describedby={`${name}-description${invalid ? ` ${name}-error` : ""}`}
            className="h-11 md:h-9"
          />
          <FieldDescription id={`${name}-description`}>{hint}</FieldDescription>
          {currentUrl && !preview && (
            <label
              htmlFor={removeId}
              className="flex min-h-11 items-center gap-2 text-sm md:min-h-9"
            >
              <input
                type="checkbox"
                className="size-4 accent-primary"
                id={removeId}
                name={name === "logo" ? "removeLogo" : "removeBanner"}
                checked={remove}
                onChange={(e) => setRemove(e.target.checked)}
              />
              Remove the current {name === "logo" ? "logo" : "header image"}
            </label>
          )}
          <FieldError id={`${name}-error`} errors={allErrors} />
        </div>
      </div>
    </Field>
  );
}
