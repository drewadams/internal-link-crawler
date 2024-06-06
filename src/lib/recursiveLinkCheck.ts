import { CheckerOptions } from "./types/checker.js";
import { fetchAndParseURL } from "./fetchAndParseURL.js";
import { stripAnchorsAndParamsFromURLString } from "./stripLinks.js";

export async function recursiveLinkCheck(
  baseURL: string,
  options?: CheckerOptions
) {
  const TIMEOUT = options?.timeout ?? 5000;
  const MAXDEPTH = options?.maxDepth ?? Infinity;
  const BATCH_SIZE = options?.batchSize ?? 10; // Set the batch size
  const uniqueLinks = new Set([baseURL + "/"]);
  let links = await fetchAndParseURL(baseURL, TIMEOUT);

  const queue = links.map((link) => {
    if (link.startsWith("/")) {
      link = baseURL + link;
    }
    return { link, depth: 1 };
  });

  while (queue.length > 0) {
    const batch = queue.splice(0, BATCH_SIZE); // Get the next batch of links
    console.log(queue.length, batch[0].depth);

    const results = await Promise.allSettled(
      batch.map(({ link }) => fetchAndParseURL(link, TIMEOUT))
    );

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const newLinks = result.value;
        if (newLinks.length > 0 && batch[index].depth < MAXDEPTH) {
          newLinks.forEach((l) => {
            l = stripAnchorsAndParamsFromURLString(l);
            if (l.startsWith("/")) {
              l = baseURL + l;
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

export { CheckerOptions };
