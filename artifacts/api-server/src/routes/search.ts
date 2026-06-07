import { Router } from "express";

const router = Router();

router.get("/search", async (req, res) => {
  const query = (req.query.q as string) || "beautiful scenery";
  const targetUrl = `https://images.search.yahoo.com/search/images?p=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; Oppo) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36",
      },
    });
    const htmlString = await response.text();

    const regex = /"murl":"(http[^"]+\.(jpg|jpeg|png|webp))"/g;
    let match;
    const imageUrls: string[] = [];

    while ((match = regex.exec(htmlString)) !== null) {
      if (!imageUrls.includes(match[1])) {
        imageUrls.push(match[1]);
      }
      if (imageUrls.length >= 40) break;
    }

    return res.json({ results: imageUrls });
  } catch (error) {
    req.log.error({ error }, "Image search error");
    return res.status(500).json({ error: "इंटरनेट से फोटो निकालने में दिक्कत आई।", results: [] });
  }
});

export default router;
