import {
  customType,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    refreshTokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [index("refresh_tokens_user_id_token_unique").on(table.userId, table.refreshTokenHash)]
);

export const shows = pgTable("shows", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  language: text("language").notNull(),
  genres: text("genres").notNull(),
  status: text("status").notNull(),
  premiered: timestamp("premiered", { withTimezone: true }),
  ended: timestamp("ended", { withTimezone: true }),
  weight: integer("weight").notNull(),
  image: text("image"),
  summary: text("summary").notNull(),
});

export const showsWatched = pgTable(
  "shows_watched",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    showId: integer("show_id")
      .notNull()
      .references(() => shows.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.showId] })]
);

const vector768 = customType<{ data: string; driverData: string }>({
  dataType() {
    return "vector(768)";
  },
});

export const showsEmbeddings = pgTable("shows_embeddings", {
  showId: integer("show_id")
    .primaryKey()
    .references(() => shows.id, { onDelete: "cascade" }),
  embedding: vector768("embedding").notNull(),
  model: text("model").notNull().default("nomic-embed-text"),
  embeddedAt: timestamp("embedded_at", { withTimezone: true }).notNull().defaultNow(),
});
