import { fetchAndParseURL } from "./fetchAndParseURL.js";
import { stripAnchorsAndParamsFromURLString } from "./stripLinks.js";

export async function recursiveLinkCheck(
  baseUrl: string,
  uniqueLinks: Set<string>,
  options?: CheckerOptions
) {
  const TIMEOUT = options?.timeout ?? 5000;
  const MAXDEPTH = options?.maxDepth ?? Infinity;
  const BATCH_SIZE = options?.batchSize ?? 10; // Set the batch size
  const url = baseUrl;

  let links = await fetchAndParseURL(baseUrl);
  let depth = options?.maxDepth ?? Infinity;

  const queue = links.map((link) => {
    if (link.startsWith("/")) {
      link = url + link;
    }
    return { link, depth: 1 };
  });

  while (queue.length > 0) {
    const batch = queue.splice(0, BATCH_SIZE); // Get the next batch of links
    console.log(queue.length, batch[0].depth);

    const results = await Promise.allSettled(
      batch.map(({ link, depth }) => fetchAndParseURL(link))
    );

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const newLinks = result.value;
        if (newLinks.length > 0 && batch[index].depth < MAXDEPTH) {
          newLinks.forEach((l) => {
            l = stripAnchorsAndParamsFromURLString(l);
            if (l.startsWith("/")) {
              l = url + l;
            }
            if (!uniqueLinks.has(l)) {
              uniqueLinks.add(l);
              queue.push({ link: l, depth: batch[index].depth + 1 });
            }
          });
        }
      } else {
        console.error(result.reason);
      }
    });
  }

  console.log(uniqueLinks);
  return uniqueLinks;
}

interface CheckerOptions {
  timeout?: number;
  maxDepth?: number;
  batchSize?: number; // Add a batchSize option
}
