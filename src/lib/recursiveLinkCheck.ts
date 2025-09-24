import type { CheckerOptions } from "./types/checker.js";
import { fetchAndParseURL } from "./fetchAndParseURL.js";
import { stripAnchorsAndParamsFromURLString } from "./stripLinks.js";

export async function recursiveLinkCheck(
  baseURL: string,
  options?: CheckerOptions
) {
  const TIMEOUT = options?.timeout ?? 5000;
  const MAX_DEPTH = options?.maxDepth ?? Infinity;
  const BATCH_SIZE = options?.batchSize ?? 10;

  // Normalize base URL - ensure it ends with / for consistent comparison
  const normalizedBaseURL = baseURL.endsWith("/") ? baseURL : baseURL + "/";
  
  // Organize links by type
  const links: Record<LinkType, Set<string>> = {
    internal: new Set<string>([normalizedBaseURL]),
    external: new Set<string>(),
    tel: new Set<string>(),
    mailto: new Set<string>(),
  };

  let initialLinks = await fetchAndParseURL(
    baseURL,
    TIMEOUT,
    true,
    options?.basicAuth
  ); // Always fetch all links

  const queue = initialLinks
    .filter((link) => {
      const linkType = categorizeLinkType(link, baseURL);

      if (linkType !== "internal") {
        links[linkType].add(link);
        return false; // Don't add non-internal links to queue
      }
      return true;
    })
    .map((link) => {
      if (link.startsWith("/")) {
        // For relative links, we need to construct the full URL properly
        // Remove any existing path from baseURL and add the relative path
        const baseUrlObj = new URL(baseURL);
        link = baseUrlObj.origin + link;
      }
      if (link.endsWith("/")) {
        link = link.slice(0, -1); // Remove trailing slash
      }
      return { link, depth: 1 };
    });

  while (queue.length > 0) {
    const batch = queue.splice(0, BATCH_SIZE);
    console.log(
      `Queue: ${queue.length}, Current depth: ${batch[0]?.depth || "unknown"}`
    );

    const results = await Promise.allSettled(
      batch.map(({ link }) =>
        fetchAndParseURL(link, TIMEOUT, true, options?.basicAuth)
      )
    );

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const newLinks = result.value;
        if (newLinks.length > 0 && batch[index].depth < MAX_DEPTH) {
          newLinks.forEach((l) => {
            l = stripAnchorsAndParamsFromURLString(l);

            // Normalize relative links
            if (l.startsWith("/")) {
              // For relative links, construct full URL using origin only
              const baseUrlObj = new URL(baseURL);
              l = baseUrlObj.origin + l;
            }

            // Categorize and process
            const linkType = categorizeLinkType(l, baseURL);

            // Queue internal links if not seen before
            if (linkType === "internal" && !links.internal.has(l)) {
              queue.push({ link: l, depth: batch[index].depth + 1 });
            }

            // Add to appropriate collection
            links[linkType].add(l);
          });
        }
      } else {
        console.error(
          `Failed to fetch: ${batch[index].link} - ${result.reason}`
        );
      }
    });
  }

  const allLinks = new Set([
    ...links.internal,
    ...links.external,
    ...links.tel,
    ...links.mailto,
  ]);

  console.log(
    `Total links: ${allLinks.size} (Internal: ${links.internal.size}, External: ${links.external.size}, Tel: ${links.tel.size}, Mailto: ${links.mailto.size})`
  );
  return {
    all: allLinks,
    ...links,
  };
}

// Define link types for better organization
type LinkType = "internal" | "external" | "tel" | "mailto";

// Link categorization function
function categorizeLinkType(url: string, baseURL: string): LinkType {
  if (url.startsWith("tel:")) return "tel";
  if (url.startsWith("mailto:")) return "mailto";
  
  // Handle hash-only links (should be filtered out or considered invalid)
  if (url === "#" || url === "") return "external";

  // Normalize base URL for comparison
  const normalizedBaseURL = baseURL.endsWith("/") ? baseURL : baseURL + "/";

  // Check if internal - must start with the full base URL including path
  if (url.startsWith("/")) {
    // Relative links are internal if they extend the base path
    return "internal";
  }
  
  if (url.startsWith(normalizedBaseURL)) {
    return "internal";
  }

  try {
    const urlObj = new URL(url);
    const baseUrlObj = new URL(baseURL);
    
    // Same hostname check, but also need to check if the path is under the base path
    if (urlObj.hostname === baseUrlObj.hostname) {
      const basePath = baseUrlObj.pathname.endsWith("/") ? baseUrlObj.pathname : baseUrlObj.pathname + "/";
      const urlPath = urlObj.pathname.endsWith("/") ? urlObj.pathname : urlObj.pathname + "/";
      
      // Internal if the URL path starts with the base path
      return urlPath.startsWith(basePath) ? "internal" : "external";
    }
    
    return "external";
  } catch (e) {
    // If URL parsing fails, consider it external
    return "external";
  }
}

export { CheckerOptions };
