import { readFile } from "node:fs/promises";
import path from "node:path";

import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { shows } from "../lib/db/schema";

config({ path: ".env.local" });

const BATCH_SIZE = 500;
const DATA_FILE = path.join(process.cwd(), "data/shows.json");

type RawShow = {
  id: number;
  name: string;
  type: string;
  language: string;
  genres: string[];
  status: string;
  premiered: string | null;
  ended: string | null;
  weight: number;
  image: { original?: string } | null;
  summary: string;
};

function parseDate(value: string | null | undefined): Date | null {
  if (!value || value === "Present") {
    return null;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function toShowRow(raw: RawShow) {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    language: raw.language,
    genres: JSON.stringify(raw.genres),
    status: raw.status,
    premiered: parseDate(raw.premiered),
    ended: parseDate(raw.ended),
    weight: raw.weight,
    image: raw.image?.original ?? null,
    summary: raw.summary,
  };
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set");
  }

  const fileContents = await readFile(DATA_FILE, "utf8");
  const rawShows = JSON.parse(fileContents) as RawShow[];

  if (!Array.isArray(rawShows) || rawShows.length === 0) {
    throw new Error(`No shows found in ${DATA_FILE}`);
  }

  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle(client);

  const rows = rawShows.map(toShowRow);

  try {
    await db.transaction(async (tx) => {
      await tx.delete(shows);

      for (let index = 0; index < rows.length; index += BATCH_SIZE) {
        const batch = rows.slice(index, index + BATCH_SIZE);
        await tx.insert(shows).values(batch);
      }
    });

    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(shows);

    console.warn(`Imported ${rows.length} shows (${count} rows in shows table).`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Failed to import shows:", error);
  process.exit(1);
});
