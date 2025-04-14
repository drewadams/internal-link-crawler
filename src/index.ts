import {
  CheckerOptions,
  recursiveLinkCheck,
} from "./lib/recursiveLinkCheck.js";

import { writeFile } from "fs/promises";

// List of URLs to crawl
// No ending slash (/)
const URLs = ["https://google.com", "https://example.com"];

const options: CheckerOptions = {
  batchSize: 10,
  timeout: 5000,
  maxDepth: 10,
};

URLs.forEach(async (url) => {
  const result = await recursiveLinkCheck(url, options);

  await writeFile(
    `./output/${url.replace("https://", "").replace("www.", "")}-crawl.json`,
    JSON.stringify(Array.from(result.all), null, 2)
  );

  await writeFile(
    `./output/${url.replace("https://", "").replace("www.", "")}-internal.json`,
    JSON.stringify(Array.from(result.internal), null, 2)
  );

  await writeFile(
    `./output/${url.replace("https://", "").replace("www.", "")}-external.json`,
    JSON.stringify(Array.from(result.external), null, 2)
  );

  await writeFile(
    `./output/${url.replace("https://", "").replace("www.", "")}-mailto.json`,
    JSON.stringify(Array.from(result.mailto), null, 2)
  );

  await writeFile(
    `./output/${url.replace("https://", "").replace("www.", "")}-tel.json`,
    JSON.stringify(Array.from(result.tel), null, 2)
  );
});
