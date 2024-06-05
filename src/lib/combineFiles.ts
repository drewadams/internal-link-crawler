import { readFile, readdir, writeFile } from "fs/promises";

const files = await readdir("./data");

let finalData: { [key: string]: string[] } = {};
for (let file of files) {
  console.log(file);
  const siteName = file.replace("-crawl.json", "");
  if (file.endsWith(".json")) {
    const data = JSON.parse(await readFile(`./data/${file}`, "utf-8"));
    finalData[siteName] = [...data];
  }
}
console.log(finalData);
await writeFile("./data/combined.json", JSON.stringify(finalData, null, 2));
