const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS और स्टेटिक फाइल्स (HTML) के लिए सेटअप
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Unsplash API Key (यहाँ अपनी असली की डालें या डेमो चलने दें)
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_KEY || "8U2Zf4R86_6L_wH0zQ8wRdfpOnV48_Uun2K8M2x6-8g";

// सर्च करने के लिए सर्वर रूट (Endpoint)
app.get('/api/search', async (req, res) => {
    const query = req.query.q || 'beautiful scenery';
    const url = `https://api.unsplash.com/search/photos?page=1&query=${query}&per_page=30&client_id=${UNSPLASH_ACCESS_KEY}`;

    try {
        // dynamic import for node-fetch
        const { default: fetch } = await import('node-fetch');
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("सर्वर एरर:", error);
        res.status(500).json({ error: "इमेज लोड करने में समस्या आई।" });
    }
});

// सर्वर शुरू करें
app.listen(PORT, () => {
    console.log(`सर्वर चालू है: http://localhost:${PORT}`);
});
