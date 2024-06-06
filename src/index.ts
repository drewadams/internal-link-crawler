import {
  CheckerOptions,
  recursiveLinkCheck,
} from "./lib/recursiveLinkCheck.js";

import { writeFile } from "fs/promises";

// List of URLs to crawl
// No ending slash (/)
const URLs = ["https://www.google.com", "https://www.bing.com"];

const options: CheckerOptions = {
  batchSize: 10,
  timeout: 5000,
  maxDepth: 10,
};

URLs.forEach(async (url) => {
  const data = await recursiveLinkCheck(url, options);
  await writeFile(
    `./data/${url.replace("https://", "").replace("www.", "")}-crawl.json`,
    JSON.stringify(Array.from(data), null, 2)
  );
});
