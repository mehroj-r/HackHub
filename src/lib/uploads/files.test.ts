import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  detectImageType,
  IMAGE_ERRORS,
  imageFileError,
  isEmptyFile,
  MAX_IMAGE_BYTES,
  resolveUploadPath,
} from "./files";
import { eventImageUrl } from "./url";

const PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0,
]);
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]);
const WEBP = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50,
]);
const GIF = new TextEncoder().encode("GIF89a......");
const SVG = new TextEncoder().encode(
  '<svg xmlns="http://www.w3.org/2000/svg">',
);
const RIFF_WAVE = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x41, 0x56, 0x45,
]);

describe("detectImageType", () => {
  it("knows PNG, JPEG and WebP by their first bytes", () => {
    expect(detectImageType(PNG)).toBe("png");
    expect(detectImageType(JPEG)).toBe("jpeg");
    expect(detectImageType(WEBP)).toBe("webp");
  });

  it("refuses anything else, including other RIFF files and SVG", () => {
    expect(detectImageType(GIF)).toBeNull();
    expect(detectImageType(SVG)).toBeNull();
    expect(detectImageType(RIFF_WAVE)).toBeNull();
    expect(detectImageType(new Uint8Array(0))).toBeNull();
  });
});

describe("imageFileError", () => {
  const file = (size: number, type = "") => ({ size, type });

  it("accepts a PNG, JPEG or WebP up to 5 MB", () => {
    expect(imageFileError(file(1000, "image/png"), PNG)).toBeNull();
    expect(imageFileError(file(1000, "image/jpeg"), JPEG)).toBeNull();
    expect(
      imageFileError(file(MAX_IMAGE_BYTES, "image/webp"), WEBP),
    ).toBeNull();
    // Some browsers send no type; the bytes decide.
    expect(imageFileError(file(1000), PNG)).toBeNull();
    expect(
      imageFileError(file(1000, "application/octet-stream"), JPEG),
    ).toBeNull();
    expect(imageFileError(file(1000, "image/jpg"), JPEG)).toBeNull();
  });

  it("refuses a file over 5 MB", () => {
    expect(imageFileError(file(MAX_IMAGE_BYTES + 1, "image/png"), PNG)).toBe(
      IMAGE_ERRORS.size,
    );
  });

  it("goes by the bytes, not the declared type", () => {
    // A GIF or a script renamed and labelled as PNG.
    expect(imageFileError(file(1000, "image/png"), GIF)).toBe(
      IMAGE_ERRORS.type,
    );
    expect(imageFileError(file(1000, "image/png"), SVG)).toBe(
      IMAGE_ERRORS.type,
    );
    // Real PNG bytes with a type that disagrees.
    expect(imageFileError(file(1000, "image/gif"), PNG)).toBe(
      IMAGE_ERRORS.type,
    );
    expect(imageFileError(file(1000, "image/jpeg"), PNG)).toBe(
      IMAGE_ERRORS.type,
    );
  });
});

describe("isEmptyFile", () => {
  it("treats a missing field, a string and an empty file input as no file", () => {
    expect(isEmptyFile(null)).toBe(true);
    expect(isEmptyFile("logo.png")).toBe(true);
    expect(isEmptyFile(new File([], ""))).toBe(true);
    expect(isEmptyFile(new File([], "blob"))).toBe(true);
    expect(isEmptyFile(new File([PNG], "logo.png"))).toBe(false);
  });
});

describe("resolveUploadPath", () => {
  const root = path.resolve("/srv/uploads");

  it("resolves a normal path inside the root", () => {
    expect(resolveUploadPath(root, "events/abc123/logo-0f1e.webp")).toBe(
      path.join(root, "events", "abc123", "logo-0f1e.webp"),
    );
    expect(resolveUploadPath(root, ["events", "abc", "banner-1.webp"])).toBe(
      path.join(root, "events", "abc", "banner-1.webp"),
    );
  });

  it.each([
    "../etc/passwd",
    "events/../../etc/passwd",
    "events/abc/../../../secret",
    "..",
    ".",
    "events/./logo.webp",
    "/etc/passwd",
    "events//logo.webp",
    "",
    "events/.hidden",
    "events\\..\\..\\etc",
    "events/%2e%2e/logo.webp",
    "events/abc/logo.webp\u0000.png",
  ])("refuses %j", (relative) => {
    expect(resolveUploadPath(root, relative)).toBeNull();
  });

  it("refuses traversal passed as separate segments", () => {
    expect(resolveUploadPath(root, ["..", "etc", "passwd"])).toBeNull();
    expect(resolveUploadPath(root, ["events", "..", "..", "x"])).toBeNull();
    expect(resolveUploadPath(root, ["/etc/passwd"])).toBeNull();
    expect(resolveUploadPath(root, [])).toBeNull();
  });
});

describe("eventImageUrl", () => {
  it("is /uploads/<path>, or null without a path", () => {
    expect(eventImageUrl("events/abc/logo-1.webp")).toBe(
      "/uploads/events/abc/logo-1.webp",
    );
    expect(eventImageUrl(null)).toBeNull();
    expect(eventImageUrl(undefined)).toBeNull();
    expect(eventImageUrl("")).toBeNull();
  });
});
