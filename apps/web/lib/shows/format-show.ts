import type { shows } from "@/lib/db/schema";

type ShowRow = typeof shows.$inferSelect;

export function parseGenres(genresJson: string): string[] {
  try {
    const parsed: unknown = JSON.parse(genresJson);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((genre): genre is string => typeof genre === "string");
  } catch {
    return [];
  }
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatYear(date: Date | null): string | null {
  if (!date) {
    return null;
  }

  return String(date.getUTCFullYear());
}

export function toShowListItem(row: ShowRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    language: row.language,
    genres: parseGenres(row.genres),
    status: row.status,
    premieredYear: formatYear(row.premiered),
    endedYear: formatYear(row.ended),
    weight: row.weight,
    imageUrl: row.image,
    summary: stripHtml(row.summary),
  };
}
