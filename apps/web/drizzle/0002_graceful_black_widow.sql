CREATE TABLE "shows" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"language" text NOT NULL,
	"genres" text NOT NULL,
	"status" text NOT NULL,
	"premiered" timestamp with time zone NOT NULL,
	"ended" timestamp with time zone NOT NULL,
	"weight" integer NOT NULL,
	"image" text NOT NULL,
	"summary" text NOT NULL
);
