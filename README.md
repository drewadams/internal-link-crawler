# Simple internal link scraper

Built on Node.js with Typescript

## Requirements

Node.js installed

## Installation

```
git clone <repo>
cd <directory>
npm install
```

## Usage

<ol>
<li>Inside of <code class="dir">`src/index.ts`</code>, update the URLs variable with an array of URLs to be scraped</li>
<li>Update options variable with your desired settings</li>
<li>Run <code class="code">`npm run build`</code> or <code class="code">`npm run watch`</code> to build the runnable files</li>
<li>To run the scraper after build, use <code class="code">`npm run scrape`</code></li>
<li>JSON will be output to <code class="dir">/data</code></li>
</ol>

## Tests

If you are planning to reuse and edit this repo, there are a couple of prebuilt Jest tests that can be uses to ensure functionality remains.

### Usage

<span>Run <code class="code">`npm test`</code></span>
