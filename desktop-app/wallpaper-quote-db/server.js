require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

const dbPath = path.join(__dirname, 'database', 'quote.db');
const db = new Database(dbPath);

app.use(cors());
app.use(express.json());

app.get('/quotes', (req, res) => {
    try {
        const quotes = db.prepare("SELECT * FROM quotes").all();
        res.json({ success: true, data: quotes });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/quotes/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const quote = db.prepare("SELECT * FROM quotes WHERE id = ?").get(id);
        if (!quote) {
            return res.status(404).json({ success: false, message: "Iqtibos topilmadi!" });
        }
        res.json({ success: true, data: quote });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ API server ${PORT} portda ishga tushdi!`);
});
