CREATE TABLE "shows_watched" (
	"user_id" uuid NOT NULL,
	"show_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shows_watched_user_id_show_id_pk" PRIMARY KEY("user_id","show_id")
);
--> statement-breakpoint
ALTER TABLE "shows_watched" ADD CONSTRAINT "shows_watched_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shows_watched" ADD CONSTRAINT "shows_watched_show_id_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id") ON DELETE cascade ON UPDATE no action;