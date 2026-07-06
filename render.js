// A5(148mm x 210mm) 판형 + 도련 3mm 기준으로 src/book.html -> output/*.pdf 렌더링
const path = require('path');
const puppeteer = require('puppeteer-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  const inputName = process.argv[2] || 'book.html';
  const outputName = process.argv[3] || '임용합격로드맵.pdf';
  const inputPath = path.join(__dirname, 'src', inputName);
  const outputPath = path.join(__dirname, 'output', outputName);

  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('file:///' + inputPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.emulateMediaType('print');

  await page.pdf({
    path: outputPath,
    width: '154mm',
    height: '216mm',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
    pageRanges: '',
  });

  await browser.close();
  console.log('saved:', outputPath);
}

main().catch(err => { console.error(err); process.exit(1); });
