import { Router } from "express";

const router = Router();

async function getDuckDuckGoVqd(query: string): Promise<string> {
  const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  const html = await res.text();

  const match = html.match(/vqd=["']?([\d-]+)["']?/);
  if (match) return match[1];

  const match2 = html.match(/vqd=([\d-]+)/);
  if (match2) return match2[1];

  throw new Error("Could not extract vqd token from DuckDuckGo");
}

interface DDGImage {
  image: string;
  thumbnail: string;
  title: string;
  url: string;
  width: number;
  height: number;
}

async function searchDuckDuckGo(
  query: string,
  page: number
): Promise<{ results: DDGImage[]; hasMore: boolean }> {
  const vqd = await getDuckDuckGoVqd(query);

  const s = (page - 1) * 36;

  const apiUrl =
    `https://duckduckgo.com/i.js?` +
    `q=${encodeURIComponent(query)}&` +
    `vqd=${vqd}&` +
    `f=,,,,,&` +
    `p=1&` +
    `s=${s}&` +
    `u=bing&` +
    `l=in-en&` +
    `o=json&` +
    `v7exp=a`;

  const res = await fetch(apiUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://duckduckgo.com/",
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  if (!res.ok) {
    throw new Error(`DuckDuckGo API returned ${res.status}`);
  }

  const data = (await res.json()) as { results: DDGImage[]; next?: string };
  return {
    results: data.results || [],
    hasMore: !!data.next,
  };
}

router.get("/search", async (req, res) => {
  const query = (req.query.q as string) || "beautiful scenery";
  const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));

  try {
    const { results: ddgResults, hasMore } = await searchDuckDuckGo(
      query,
      page
    );

    const results = ddgResults.slice(0, 36).map((item) => ({
      url: item.image,
      fullUrl: item.image,
      thumb: item.thumbnail || item.image,
      alt: item.title || query,
    }));

    const totalPages = hasMore ? page + 3 : page;
    const total = results.length + (hasMore ? 36 * 3 : 0);

    return res.json({ results, totalPages, total });
  } catch (error) {
    req.log.error({ error }, "Image search error");
    return res
      .status(500)
      .json({
        error: "फोटो लोड करने में समस्या आई।",
        results: [],
        totalPages: 0,
        total: 0,
      });
  }
});

export default router;
