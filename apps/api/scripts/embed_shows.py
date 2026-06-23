"""Embed all shows (name + summary) into shows_embeddings via Ollama."""

from __future__ import annotations

import os
import re
import sys
from dataclasses import dataclass

import psycopg
from dotenv import load_dotenv
from langchain_ollama import OllamaEmbeddings

BATCH_SIZE = 100
EMBED_MODEL = "nomic-embed-text"
EMBED_DIMENSIONS = 768


def load_config() -> tuple[str, str, str]:
    load_dotenv()

    database_url = os.getenv("DATABASE_URL")
    ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    embed_model = os.getenv("OLLAMA_EMBED_MODEL", EMBED_MODEL)

    if not database_url:
        raise RuntimeError("DATABASE_URL is not set in apps/api/.env")

    return database_url, ollama_base_url, embed_model


@dataclass(frozen=True)
class ShowRow:
    id: int
    name: str
    summary: str


def strip_html(html: str) -> str:
    text = re.sub(r"<[^>]*>", " ", html)
    return re.sub(r"\s+", " ", text).strip()


def show_document(show: ShowRow) -> str:
    return f"{show.name}\n\n{strip_html(show.summary)}"


def vector_to_pg(values: list[float]) -> str:
    if len(values) != EMBED_DIMENSIONS:
        raise ValueError(f"Expected {EMBED_DIMENSIONS} dimensions, got {len(values)}")

    return "[" + ",".join(f"{v:.8f}" for v in values) + "]"


def fetch_shows(conn: psycopg.Connection, *, only_missing: bool) -> list[ShowRow]:
    query = """
    SELECT s.id, s.name, s.summary
    FROM shows s
  """
    if only_missing:
        query += """
    WHERE NOT EXISTS (
      SELECT 1 FROM shows_embeddings e WHERE e.show_id = s.id
    )
    """
    query += " ORDER BY s.id"

    with conn.cursor() as cur:
        cur.execute(query)
        rows = cur.fetchall()

    return [ShowRow(id=row[0], name=row[1], summary=row[2]) for row in rows]


UPSERT_SQL = """
INSERT INTO shows_embeddings (show_id, embedding, model, embedded_at)
VALUES (%s, %s::vector, %s, now())
ON CONFLICT (show_id) DO UPDATE SET
  embedding = EXCLUDED.embedding,
  model = EXCLUDED.model,
  embedded_at = now()
"""


def upsert_batch(
    conn: psycopg.Connection,
    *,
    shows: list[ShowRow],
    vectors: list[list[float]],
    model: str,
) -> None:
    if len(shows) != len(vectors):
        raise ValueError("shows and vectors length mismatch")

    rows = [
        (show.id, vector_to_pg(vector), model) for show, vector in zip(shows, vectors, strict=True)
    ]

    with conn.cursor() as cur:
        cur.executemany(UPSERT_SQL, rows)
    conn.commit()


def main() -> None:
    database_url, ollama_base_url, embed_model = load_config()

    embeddings = OllamaEmbeddings(
        model=embed_model,
        base_url=ollama_base_url,
    )

    with psycopg.connect(database_url) as conn:
        shows = fetch_shows(conn, only_missing=True)
        total = len(shows)

        if total == 0:
            print("Nothing to embed — all shows already have embeddings.")
            return

        print(f"Embedding {total} shows with {embed_model} (batch size {BATCH_SIZE})...")

        done = 0
        for start in range(0, total, BATCH_SIZE):
            batch = shows[start : start + BATCH_SIZE]
            texts = [show_document(show) for show in batch]
            vectors = embeddings.embed_documents(texts)
            upsert_batch(conn, shows=batch, vectors=vectors, model=embed_model)

            done += len(batch)
            print(f"  {done}/{total}")

        print("Done.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Error: {error}", file=sys.stderr)
        sys.exit(1)
