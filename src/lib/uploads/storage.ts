import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { RuleError } from "@/lib/action-state";

import {
  EVENT_IMAGE_SIZE,
  type EventImageKind,
  IMAGE_ERRORS,
  imageFileError,
  isSafeSegment,
  resolveUploadPath,
} from "./files";

// Event logos and banners on the local disk, under UPLOAD_DIR (./uploads by
// default; a Docker volume at /app/uploads in production). The database keeps
// the path relative to UPLOAD_DIR; /uploads/[...path] serves it.

export function uploadDir(): string {
  // Not traced into the build: this is runtime data, not code.
  return path.resolve(
    /*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "uploads",
  );
}

/** A checked image, converted to the stored WebP but not written yet. */
export type PreparedImage = { kind: EventImageKind; webp: Buffer };

/**
 * Checks the file (type by its bytes, size) and converts it to a WebP of the
 * kind's size, cropped to cover. Returns the reason in the UI's words when
 * the file can't be used.
 */
export async function prepareEventImage(
  kind: EventImageKind,
  file: File,
): Promise<{ ok: true; image: PreparedImage } | { ok: false; error: string }> {
  // Check the size before reading a large file into memory.
  const sizeError = imageFileError(file, new Uint8Array(0));
  if (sizeError === IMAGE_ERRORS.size) return { ok: false, error: sizeError };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const error = imageFileError(file, bytes.subarray(0, 16));
  if (error) return { ok: false, error };

  const { width, height } = EVENT_IMAGE_SIZE[kind];
  try {
    const webp = await sharp(bytes, { limitInputPixels: 40_000_000 })
      .rotate() // respect the camera's orientation
      .resize(width, height, { fit: "cover", position: "attention" })
      .webp({ quality: 82 })
      .toBuffer();
    return { ok: true, image: { kind, webp } };
  } catch {
    return { ok: false, error: IMAGE_ERRORS.unreadable };
  }
}

/** Writes a prepared image as events/<eventId>/<kind>-<random>.webp and returns that path. */
export async function storeEventImage(
  eventId: string,
  image: PreparedImage,
): Promise<string> {
  if (!isSafeSegment(eventId)) throw new Error("Unsafe event id");
  const relative = `events/${eventId}/${image.kind}-${randomBytes(8).toString("hex")}.webp`;
  const full = resolveUploadPath(uploadDir(), relative);
  if (!full) throw new Error("Unsafe upload path");
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, image.webp, { flag: "wx" });
  return relative;
}

/**
 * Checks, converts and stores an event image in one go. Throws a RuleError
 * with the UI's message when the file can't be used.
 */
export async function saveEventImage(
  eventId: string,
  kind: EventImageKind,
  file: File,
): Promise<string> {
  const prepared = await prepareEventImage(kind, file);
  if (!prepared.ok) throw new RuleError(prepared.error);
  return storeEventImage(eventId, prepared.image);
}

/**
 * Removes a stored upload. Paths that could point outside UPLOAD_DIR are
 * ignored, and so is a file that's already gone.
 */
export async function deleteUpload(relative: string | null | undefined) {
  if (!relative) return;
  const full = resolveUploadPath(uploadDir(), relative);
  if (!full) return;
  try {
    await unlink(full);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") console.error(e);
  }
}

/** The bytes of a stored upload, or null when the path is unsafe or the file is missing. */
export async function readUpload(segments: string[]): Promise<Buffer | null> {
  const full = resolveUploadPath(uploadDir(), segments);
  if (!full) return null;
  try {
    return await readFile(full);
  } catch {
    return null;
  }
}
