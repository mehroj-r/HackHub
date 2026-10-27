import { readUpload } from "@/lib/uploads/storage";

// Serves stored event images (docs/07 > Uploads). A deliberate exception to
// "no API routes": a route handler is the only way to stream a file from the
// uploads volume. GET only, public (event images show on public pages), and
// only .webp files inside UPLOAD_DIR: anything else is a 404. File names are
// random and never reused, so they can be cached forever.

export async function GET(
  _request: Request,
  { params }: RouteContext<"/uploads/[...path]">,
) {
  const { path } = await params;
  if (!path.at(-1)?.endsWith(".webp")) return notFound();

  const file = await readUpload(path);
  if (!file) return notFound();

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(file.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function notFound() {
  return new Response("Not found", { status: 404 });
}
