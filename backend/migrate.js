const fs = require("node:fs");
const path = require("node:path");
const db = require("./db");

async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name varchar(255) NOT NULL PRIMARY KEY,
      applied_at timestamp NOT NULL DEFAULT current_timestamp()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const migrationDirectory = path.join(__dirname, "migrations");
  const files = fs.readdirSync(migrationDirectory)
    .filter((file) => /^\d+.*\.js$/.test(file))
    .sort();

  const [appliedRows] = await db.query("SELECT name FROM schema_migrations");
  const applied = new Set(appliedRows.map((row) => row.name));

  for (const file of files) {
    if (applied.has(file)) continue;

    const migration = require(path.join(migrationDirectory, file));
    await migration.up(db);
    await db.query("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
    console.log(`Applied ${file}`);
  }
}

migrate()
  .catch((error) => {
    console.error("Database migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());