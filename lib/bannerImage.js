const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

// Prefer URLs that clearly point at an image file - next/image handles those
// far more reliably than a page URL that happens to render one.
const IMAGE_EXTENSION = /\.(jpe?g|png|webp|avif)(\?|$)/i;

/**
 * Finds a banner image for a course using Tavily's search API.
 *
 * Returns a URL string, or null when the key is missing, the request fails or
 * nothing usable comes back — callers should treat a banner as optional and
 * fall back to a placeholder rather than failing course creation over it.
 */
export async function findBannerImage({ courseName, category }) {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    console.warn("TAVILY_API_KEY is not set — skipping banner image lookup.");
    return null;
  }
  if (!courseName) return null;

  // Keep the query to the plain subject. Appending phrasing like "course banner
  // illustration" reliably returns zero images — Tavily matches images against
  // pages it finds, and marketing wording matches nothing.
  const query = [courseName, category].filter(Boolean).join(" ");

  try {
    const response = await fetch(TAVILY_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        include_images: true,
        search_depth: "basic",
        max_results: 5,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Tavily search failed:", response.status, body);
      return null;
    }

    const result = await response.json();

    // Tavily returns either bare URL strings or { url, description } objects
    // depending on include_image_descriptions, so normalize both.
    const urls = (Array.isArray(result?.images) ? result.images : [])
      .map((image) => (typeof image === "string" ? image : image?.url))
      .filter((url) => typeof url === "string" && url.startsWith("https://"));

    return urls.find((url) => IMAGE_EXTENSION.test(url)) ?? urls[0] ?? null;
  } catch (error) {
    console.error("Tavily banner image lookup failed:", error);
    return null;
  }
}
