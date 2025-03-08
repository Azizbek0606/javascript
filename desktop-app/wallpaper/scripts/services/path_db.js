import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database", "data.db");
const db = new Database(dbPath);

export { db };
