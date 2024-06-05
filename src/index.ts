import { recursiveLinkCheck } from "./lib/recursiveLinkCheck.js";
import { writeFile } from "fs/promises";

const urls = ["https://www.kawari.earth"];

urls.forEach(async (url) => {
  const data = await recursiveLinkCheck(url, new Set([url + "/"]));
  await writeFile(
    `./data/${url.replace("https://", "").replace("www.", "")}-crawl.json`,
    JSON.stringify(Array.from(data), null, 2)
  );
});

// async function fetchAndParseLinks(links: string[]) {
//   const uniqueLinks = Array.from(new Set(links));
//   const newLinks: string[] = [];

//   for (const link of uniqueLinks) {
//     try {
//       const response = await fetch(link);
//       if (response.status === 200) {
//         const html = await response.text();
//         const root = parse(html);
//         const pageLinks: string[] = root
//           .querySelectorAll("a")
//           .map((a) => a.getAttribute("href"))
//           .filter(Boolean) as string[];

//         newLinks.push(...pageLinks);
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   if (newLinks.length > 0) {
//     await fetchAndParseLinks(newLinks);
//   }
// }
