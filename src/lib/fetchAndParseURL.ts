import { fetchWithTimeout } from "./fetchWithTimeout.js";
import { parse } from "node-html-parser";
import { stripAnchorsAndParamsFromURLString } from "./stripLinks.js";

export async function fetchAndParseURL(
  url: string,
  timeout = 5000,
  includeExternal = false
) {
  if (!url) return [];
  const res = await fetchWithTimeout(url, timeout);
  if (res.status !== 200) return [];
  const html = await res.text();
  const root = parse(html);
  const links: string[] = root
    .querySelectorAll("a")
    .map((a) => a.getAttribute("href"))
    .filter(Boolean)
    .map((link) =>
      stripAnchorsAndParamsFromURLString(link as string)
    ) as string[];
  const filteredLinks: string[] = links.filter((link) => {
    if (!link) return false;
    if (includeExternal) return true;
    return link?.startsWith("/") || link?.startsWith(url);
  });
  return filteredLinks;
}
