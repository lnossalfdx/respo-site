import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const BUCKET_NAME = "wall-of-fame";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface PhotoRecord {
  id: string;
  name: string;
  image_path: string;
  image_url: string;
  created_at: string;
}

function jsonError(message: string, status: number, details?: unknown) {
  if (details) {
    console.error(`[photos] ${message}`, details);
  }

  return NextResponse.json({ success: false, error: message }, { status });
}

function sanitizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function getExtension(file: File) {
  const mimeExt = file.type.split("/")[1]?.toLowerCase();
  if (mimeExt) {
    return mimeExt.replace("jpeg", "jpg");
  }

  const nameParts = file.name.split(".");
  const fileExt = nameParts.length > 1 ? nameParts.pop() : undefined;
  return fileExt?.toLowerCase() || "bin";
}

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("photos")
    .select("id, name, image_path, image_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError("Failed to load photos", 500, error);
  }

  return NextResponse.json({
    success: true,
    photos: (data ?? []) as PhotoRecord[],
  });
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const formData = await req.formData();
    const rawName = formData.get("name");
    const rawFile = formData.get("file");

    if (typeof rawName !== "string" || !rawName.trim()) {
      return jsonError("Nome invalido", 400);
    }

    if (!(rawFile instanceof File)) {
      return jsonError("Arquivo nao enviado", 400);
    }

    const name = rawName.trim().slice(0, 40);
    const file = rawFile;

    if (!file.type.startsWith("image/")) {
      return jsonError("Apenas imagens sao permitidas", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError("Imagem muito grande. Limite de 5MB.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = getExtension(file);
    const safeName = sanitizeName(name) || "photo";
    const filePath = `photos/${Date.now()}-${randomUUID()}-${safeName}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return jsonError("Failed to upload image", 500, uploadError);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    const { data: insertedPhoto, error: insertError } = await supabaseAdmin
      .from("photos")
      .insert({
        name,
        image_path: filePath,
        image_url: imageUrl,
      })
      .select("id, name, image_path, image_url, created_at")
      .single();

    if (insertError) {
      await supabaseAdmin.storage.from(BUCKET_NAME).remove([filePath]);
      return jsonError("Failed to save photo metadata", 500, insertError);
    }

    return NextResponse.json({
      success: true,
      photo: insertedPhoto as PhotoRecord,
    });
  } catch (err) {
    return jsonError("Internal server error", 500, err);
  }
}
