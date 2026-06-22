import "dotenv/config";

import postgres from "postgres";

const adminUrl = process.env.DATABASE_ADMIN_URL;
const dbName = process.env.DATABASE_NAME || "";

if (!adminUrl) {
  throw new Error("DATABASE_ADMIN_URL must be set");
}

if (!dbName) {
  throw new Error("DATABASE_NAME must be set");
}

const sql = postgres(adminUrl, { max: 1 });

async function main() {
  const rows = await sql`SELECT 1 from pg_database where datname = ${dbName}`;

  if (rows.length === 0) {
    await sql.unsafe(`CREATE DATABASE ${dbName}`);
    console.warn(`Created database: ${dbName}`);
  } else {
    console.error(`Database already exists: ${dbName}`);
  }

  await sql.end();
}

main().catch((error) => {
  console.error("Error setting up database:", error);
  process.exit(1);
});
