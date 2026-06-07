import { Router } from "express";

const router = Router();

const UNSPLASH_KEY = process.env.UNSPLASH_KEY || "8U2Zf4R86_6L_wH0zQ8wRdfpOnV48_Uun2K8M2x6-8g";

router.get("/search", async (req, res) => {
  const query = (req.query.q as string) || "beautiful scenery";
  const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));

  try {
    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${encodeURIComponent(query)}&per_page=36&client_id=${UNSPLASH_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json() as {
      results: Array<{ urls: { regular: string; full: string; small: string }; alt_description: string | null }>;
      total_pages: number;
      total: number;
    };

    const results = data.results.map((item) => ({
      url: item.urls.regular,
      fullUrl: item.urls.full,
      thumb: item.urls.small,
      alt: item.alt_description || query,
    }));

    return res.json({ results, totalPages: data.total_pages, total: data.total });
  } catch (error) {
    req.log.error({ error }, "Image search error");
    return res.status(500).json({ error: "फोटो लोड करने में समस्या आई।", results: [] });
  }
});

export default router;
