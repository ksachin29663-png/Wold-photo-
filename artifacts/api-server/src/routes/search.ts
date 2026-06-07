import { Router } from "express";

const router = Router();

const PIXABAY_KEY = process.env.PIXABAY_KEY || "";

router.get("/search", async (req, res) => {
  const query = (req.query.q as string) || "beautiful scenery";
  const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));

  if (!PIXABAY_KEY) {
    return res.status(503).json({
      error: "PIXABAY_KEY not configured",
      results: [],
      totalPages: 0,
      total: 0,
      needsKey: true,
    });
  }

  try {
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=36&page=${page}&safesearch=true&lang=en`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      req.log.error({ status: response.status, text }, "Pixabay API error");
      throw new Error(`Pixabay API error: ${response.status}`);
    }

    const data = await response.json() as {
      hits: Array<{
        webformatURL: string;
        largeImageURL: string;
        previewURL: string;
        tags: string;
        imageWidth: number;
        imageHeight: number;
        downloads: number;
      }>;
      totalHits: number;
      total: number;
    };

    const results = data.hits.map((item) => ({
      url: item.webformatURL,
      fullUrl: item.largeImageURL,
      thumb: item.previewURL,
      alt: item.tags,
    }));

    const totalPages = Math.ceil(data.totalHits / 36);

    return res.json({ results, totalPages, total: data.totalHits });
  } catch (error) {
    req.log.error({ error }, "Image search error");
    return res.status(500).json({ error: "फोटो लोड करने में समस्या आई।", results: [], totalPages: 0, total: 0 });
  }
});

export default router;
