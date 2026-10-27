// Public URL of a stored upload (an event's logo or banner). The path is the
// one saved in the database, relative to UPLOAD_DIR, for example
// "events/<eventId>/logo-<random>.webp". Files are served by
// src/app/uploads/[...path]/route.ts. Safe to import from client components.

/** `/uploads/<path>`, or null when there's no image. */
export function eventImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `/uploads/${path.split("/").map(encodeURIComponent).join("/")}`;
}
