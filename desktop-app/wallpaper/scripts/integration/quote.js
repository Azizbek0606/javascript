import axios from "axios";
import { db } from "../services/path_db.js";

const GITHUB_JSON_URL = "https://raw.githubusercontent.com/Azizbek0606/database_design/main/data.json";

db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY,
        quote TEXT NOT NULL,
        author TEXT DEFAULT 'unknown',
        date TEXT NOT NULL
    )
`);

async function fetchQuotes() {
    try {
        const response = await axios.get(GITHUB_JSON_URL);
        return { status: "success", data: response.data };
    } catch (error) {
        return { status: "error", message: `Error while getting data: ${error.message}` };
    }
}

export async function updateQuote() {
    try {
        const today = new Date().toISOString().split("T")[0];

        const lastQuote = db.prepare("SELECT * FROM quotes ORDER BY id DESC LIMIT 1").get();

        const fetchResult = await fetchQuotes();
        if (fetchResult.status === "error") {
            return fetchResult;
        }

        const quotes = fetchResult.data;
        if (!quotes || quotes.length === 0) {
            return { status: "error", message: "Quotes not found. Please try again" };
        }

        if (lastQuote && lastQuote.date === today) {
            return lastQuote;
        }

        const newId = lastQuote ? lastQuote.id + 1 : 1;
        const newQuote = quotes.find(q => q.id === newId) || quotes[0];

        const insert = db.prepare("INSERT INTO quotes (id, quote, author, date) VALUES (?, ?, ?, ?)");
        insert.run(newQuote.id, newQuote.quote, newQuote.author || "unknown", today);

        return newQuote;
    } catch (error) {
        return { status: "error", message: `Something went wrong: ${error.message}` };
    }
}
