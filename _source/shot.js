const path = require('path');
const puppeteer = require('puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  const target = process.argv[2];
  const out = process.argv[3];
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 1.5 });
  await page.goto('file:///' + path.resolve(target).replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  const height = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 1600, height: Math.min(height, 6000), deviceScaleFactor: 1.5 });
  await page.screenshot({ path: out, fullPage: false });
  await browser.close();
  console.log('saved', out);
}
main().catch(e => { console.error(e); process.exit(1); });
