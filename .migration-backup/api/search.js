export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { q } = req.query;
    const query = q || 'Indian cricket team';
    const targetUrl = `https://images.search.yahoo.com/search/images?p=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Oppo) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36'
            }
        });
        const htmlString = await response.text();

        const regex = /"murl":"(http[^"]+\.(jpg|jpeg|png|webp))"/g;
        let match;
        const imageUrls = [];

        while ((match = regex.exec(htmlString)) !== null) {
            if (!imageUrls.includes(match[1])) {
                imageUrls.push(match[1]);
            }
            if (imageUrls.length >= 40) break;
        }

        return res.status(200).json({ results: imageUrls });
    } catch (error) {
        return res.status(500).json({ error: error.message, results: [] });
    }
              }
          
