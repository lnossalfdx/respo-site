import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

export interface PhotoRecord {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "photos.db");
const LEGACY_JSON_FILE = path.join(DATA_DIR, "photos.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_PHOTOS = 500;

let db: DatabaseSync | null = null;

function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function getDb() {
  ensureDirs();

  if (!db) {
    db = new DatabaseSync(DB_FILE);
    db.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos (created_at ASC);
    `);
    migrateLegacyJson(db);
  }

  return db;
}

function migrateLegacyJson(database: DatabaseSync) {
  if (!fs.existsSync(LEGACY_JSON_FILE)) {
    return;
  }

  const existingCount = database
    .prepare("SELECT COUNT(*) AS count FROM photos")
    .get() as { count: number };

  if (existingCount.count > 0) {
    return;
  }

  try {
    const raw = fs.readFileSync(LEGACY_JSON_FILE, "utf-8");
    const parsed = JSON.parse(raw) as PhotoRecord[];

    const insert = database.prepare(
      "INSERT OR IGNORE INTO photos (id, name, url, created_at) VALUES (?, ?, ?, ?)"
    );

    const insertMany = database.transaction((rows: PhotoRecord[]) => {
      for (const row of rows) {
        insert.run(row.id, row.name, row.url, row.createdAt);
      }
    });

    insertMany(parsed);
  } catch {
    // Ignore malformed legacy data and keep the new storage healthy.
  }
}

export function getUploadDir() {
  ensureDirs();
  return UPLOAD_DIR;
}

export function listPhotos(): PhotoRecord[] {
  const database = getDb();
  return database
    .prepare(
      "SELECT id, name, url, created_at AS createdAt FROM photos ORDER BY created_at ASC"
    )
    .all() as PhotoRecord[];
}

export function createPhoto(photo: PhotoRecord) {
  const database = getDb();

  const insertPhoto = database.prepare(
    "INSERT INTO photos (id, name, url, created_at) VALUES (?, ?, ?, ?)"
  );
  const countPhotos = database.prepare("SELECT COUNT(*) AS count FROM photos");
  const selectOverflow = database.prepare(
    "SELECT id, url FROM photos ORDER BY created_at ASC LIMIT ?"
  );
  const deletePhoto = database.prepare("DELETE FROM photos WHERE id = ?");

  const transaction = database.transaction((entry: PhotoRecord) => {
    insertPhoto.run(entry.id, entry.name, entry.url, entry.createdAt);

    const { count } = countPhotos.get() as { count: number };
    const overflow = Math.max(0, count - MAX_PHOTOS);

    if (overflow > 0) {
      const stale = selectOverflow.all(overflow) as Array<{ id: string; url: string }>;
      for (const row of stale) {
        deletePhoto.run(row.id);
      }
      return stale;
    }

    return [] as Array<{ id: string; url: string }>;
  });

  return transaction(photo);
}
