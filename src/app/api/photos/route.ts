import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createPhoto, getUploadDir, listPhotos, type PhotoRecord } from "@/lib/photos";

const UPLOAD_DIR = getUploadDir();

// GET — return all photos
export async function GET() {
  const photos = listPhotos();
  return NextResponse.json({ photos });
}

// POST — save a new photo
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: unknown; dataUrl?: unknown };
    const { name, dataUrl } = body;

    if (typeof name !== "string" || typeof dataUrl !== "string") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Validate it's an image data URL
    if (!dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    // Save the image file
    const base64Data = dataUrl.split(",")[1];
    if (!base64Data) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    const mimeMatch = dataUrl.match(/data:(image\/\w+);/);
    const ext = mimeMatch ? mimeMatch[1].split("/")[1].replace("jpeg", "jpg") : "webp";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(base64Data, "base64");

    // Enforce 5MB limit on the decoded size
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large" }, { status: 400 });
    }

    fs.writeFileSync(filePath, buffer);

    const entry: PhotoRecord = {
      id: filename,
      name: name.trim().slice(0, 40),
      url: `/uploads/${filename}`,
      createdAt: new Date().toISOString(),
    };

    const removedEntries = createPhoto(entry);
    for (const removed of removedEntries) {
      const oldFile = path.join(UPLOAD_DIR, path.basename(removed.url));
      if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile);
      }
    }

    return NextResponse.json({ photo: entry });
  } catch (err) {
    console.error("[photos POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
