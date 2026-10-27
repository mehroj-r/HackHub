import path from "node:path";

// The rules for uploaded event images, as pure functions (no sharp, no file
// system), so they're easy to unit test. storage.ts does the work.

export type EventImageKind = "logo" | "banner";

/** What each kind is stored as: a WebP of exactly this size, cropped to cover. */
export const EVENT_IMAGE_SIZE: Record<
  EventImageKind,
  { width: number; height: number }
> = {
  logo: { width: 512, height: 512 },
  banner: { width: 1600, height: 600 },
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const IMAGE_ERRORS = {
  type: "Choose a PNG, JPEG or WebP image.",
  size: "The image must be 5 MB or smaller.",
  unreadable: "We couldn't read this image. Try another file.",
} as const;

export type ImageType = "png" | "jpeg" | "webp";

const MIME: Record<ImageType, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

/** The image type from the file's first bytes, whatever its name or MIME type says. */
export function detectImageType(bytes: Uint8Array): ImageType | null {
  const at = (offset: number, ...values: number[]) =>
    values.every((v, i) => bytes[offset + i] === v);
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
  if (at(0, 0xff, 0xd8, 0xff)) return "jpeg";
  // "RIFF" <4-byte size> "WEBP"
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) {
    return "webp";
  }
  return null;
}

/**
 * Why this file can't be used, or null when it's fine. The declared MIME type
 * (when the browser sends one) must agree with the bytes, and the bytes decide.
 */
export function imageFileError(
  file: { size: number; type: string },
  head: Uint8Array,
): string | null {
  if (file.size > MAX_IMAGE_BYTES) return IMAGE_ERRORS.size;
  const detected = detectImageType(head);
  if (!detected) return IMAGE_ERRORS.type;
  // An image/* type that names a different format (say image/gif, or
  // image/png on JPEG bytes) is refused. No type or a generic one
  // (application/octet-stream) leaves it to the bytes.
  const declared = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (declared.startsWith("image/") && declared !== MIME[detected]) {
    return IMAGE_ERRORS.type;
  }
  return null;
}

/**
 * A file input left empty sends a zero-byte File (its name depends on the
 * browser and on how the action decodes it). A zero-byte file is never an
 * image, so it counts as no file.
 */
export function isEmptyFile(value: FormDataEntryValue | null): boolean {
  return value === null || typeof value === "string" || value.size === 0;
}

// One path segment: letters, digits, "-", "_" and ".", not starting with ".".
const SEGMENT = /^[A-Za-z0-9_-][A-Za-z0-9._-]*$/;

/** A single safe path segment, e.g. an event id used as a directory name. */
export function isSafeSegment(value: string): boolean {
  return SEGMENT.test(value) && value.length <= 200;
}

/**
 * The absolute path of `relative` inside `root`, or null if it could point
 * anywhere else: empty, absolute, backslashes, "..", ".", hidden or odd
 * segments, or a result outside `root` after resolving.
 */
export function resolveUploadPath(
  root: string,
  relative: string | string[],
): string | null {
  const segments = Array.isArray(relative) ? relative : relative.split("/");
  if (segments.length === 0 || segments.length > 10) return null;
  if (!segments.every(isSafeSegment)) return null;

  const base = path.resolve(root);
  const full = path.resolve(base, ...segments);
  return full.startsWith(base + path.sep) ? full : null;
}
