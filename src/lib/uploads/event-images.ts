import "server-only";

import { isEmptyFile, type EventImageKind } from "./files";
import {
  deleteUpload,
  prepareEventImage,
  storeEventImage,
  type PreparedImage,
} from "./storage";

// The event form's two image fields, shared by createEvent and updateEvent.
// Field names: "logo" and "banner" (file inputs), "removeLogo" and
// "removeBanner" (checkboxes, edit only).

const KINDS: EventImageKind[] = ["logo", "banner"];
const REMOVE_FIELD: Record<EventImageKind, string> = {
  logo: "removeLogo",
  banner: "removeBanner",
};
export const PATH_COLUMN = { logo: "logoPath", banner: "bannerPath" } as const;

export type EventImageInput = {
  /** Field errors under "logo" / "banner", in the UI's words. */
  fieldErrors: Record<string, string[]>;
  /** New images to store, already converted to WebP. */
  images: PreparedImage[];
  /** Kinds whose current image should go, without a replacement. */
  remove: EventImageKind[];
};

/** Reads and checks both image fields. Nothing is written yet. */
export async function readEventImages(
  formData: FormData,
): Promise<EventImageInput> {
  const result: EventImageInput = { fieldErrors: {}, images: [], remove: [] };
  for (const kind of KINDS) {
    const value = formData.get(kind);
    if (!isEmptyFile(value)) {
      const prepared = await prepareEventImage(kind, value as File);
      if (prepared.ok) result.images.push(prepared.image);
      else result.fieldErrors[kind] = [prepared.error];
    } else if (formData.get(REMOVE_FIELD[kind]) === "on") {
      result.remove.push(kind);
    }
  }
  return result;
}

/** Writes the new images for this event and returns their paths by column. */
export async function storeEventImages(
  eventId: string,
  images: PreparedImage[],
): Promise<Partial<Record<"logoPath" | "bannerPath", string>>> {
  const paths: Partial<Record<"logoPath" | "bannerPath", string>> = {};
  try {
    for (const image of images) {
      paths[PATH_COLUMN[image.kind]] = await storeEventImage(eventId, image);
    }
  } catch (e) {
    await deleteUploads(Object.values(paths));
    throw e;
  }
  return paths;
}

export async function deleteUploads(paths: (string | null | undefined)[]) {
  await Promise.all(paths.map((p) => deleteUpload(p)));
}
