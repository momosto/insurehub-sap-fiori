// Usage: node tools/screenshot.cjs <url> <out.png> [waitMs] [width] [height]
// Loads a page in headless Chrome (puppeteer), prints console errors, saves a screenshot. Used for docs/img.
const puppeteer = require("puppeteer");
(async () => {
  const [url, out, wait = "5000", width = "1400", height = "800"] = process.argv.slice(2);
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: +width, height: +height } });
  const page = await browser.newPage();
  page.on("console", (m) => {
    if (m.type() === "error" && !/404|preload/i.test(m.text())) console.log("console.error:", m.text().slice(0, 300));
  });
  page.on("pageerror", (e) => console.log("pageerror:", e.message.slice(0, 300)));
  await page.goto(url, { waitUntil: "networkidle0", timeout: 90000 });
  await new Promise((r) => setTimeout(r, +wait));
  await page.screenshot({ path: out });
  await browser.close();
  console.log("saved", out);
})();
