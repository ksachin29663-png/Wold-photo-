// यह तुम्हारी खुद की बनाई हुई API है, किसी कंपनी पर निर्भर नहीं है!
export default async function handler(req, res) {
    const { q } = req.query;
    const query = q || 'cricket match';
    
    // बिना किसी API Key के सीधे सर्च इंजन को टारगेट करना
    const targetUrl = `https://images.search.yahoo.com/search/images?p=${encodeURIComponent(query)}&adlt=off`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });
        const htmlString = await response.text();

        // पूरे HTML पेज में से असली इमेज लिंक्स (.jpg, .png) छान कर निकालना
        const regex = /"murl":"(http[^"]+\.(jpg|jpeg|png|webp))"/g;
        let match;
        const imageUrls = [];

        while ((match = regex.exec(htmlString)) !== null) {
            if (!imageUrls.includes(match[1])) {
                imageUrls.push(match[1]);
            }
            if (imageUrls.length >= 40) break; // टॉप 40 फोटो निकालेंगे
        }

        // CORS अनुमति देना ताकि आपकी वेबसाइट इसे पढ़ सके
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        
        return res.status(200).json({ results: imageUrls });
    } catch (error) {
        return res.status(500).json({ error: "इंटरनेट से फोटो निकालने में दिक्कत आई।" });
    }
        }
                          
