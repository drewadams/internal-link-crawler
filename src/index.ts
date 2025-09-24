import {
  CheckerOptions,
  recursiveLinkCheck,
} from "./lib/recursiveLinkCheck.js";
import { mkdir, writeFile } from "fs/promises";

// List of URLs to crawl
// No ending slash (/)
const URLs = ["https://www.premera.com/fep"];

const options: CheckerOptions = {
  batchSize: 10,
  timeout: 5000,
  maxDepth: 15,
};

const cleanUrl = (url: string | URL) => {
  url = url.toString();
  if (url.endsWith("/")) {
    url = url.slice(0, -1); // Remove trailing slash
  }
  return url.replace("https://", "").replace("www.", "").replace(/\//g, "-");
}

URLs.forEach(async (url) => {
  const result = await recursiveLinkCheck(url, options);
  url = cleanUrl(url)
  console.log(url)
  await mkdir("./output/" + url, { recursive: true });
  await writeFile(
    `./output/${cleanUrl(url)}/main-crawl.json`,
    JSON.stringify(Array.from(result.all), null, 2)
  );

  await writeFile(
    `./output/${cleanUrl(url)}/internal.json`,
    JSON.stringify(Array.from(result.internal), null, 2)
  );

  await writeFile(
    `./output/${cleanUrl(url)}/external.json`,
    JSON.stringify(Array.from(result.external), null, 2)
  );

  await writeFile(
    `./output/${cleanUrl(url)}/mailto.json`,
    JSON.stringify(Array.from(result.mailto), null, 2)
  );

  await writeFile(
    `./output/${cleanUrl(url)}/tel.json`,
    JSON.stringify(Array.from(result.tel), null, 2)
  );
});
