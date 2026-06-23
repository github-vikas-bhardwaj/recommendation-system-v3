CREATE TABLE "shows_embeddings" (
	"show_id" integer PRIMARY KEY NOT NULL,
	"embedding" vector(768) NOT NULL,
	"model" text DEFAULT 'nomic-embed-text' NOT NULL,
	"embedded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shows_embeddings" ADD CONSTRAINT "shows_embeddings_show_id_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX shows_embeddings_embedding_hnsw_idx
  ON shows_embeddings
  USING hnsw (embedding vector_cosine_ops);