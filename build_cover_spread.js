// src/parts/back-cover.html + src/parts/00_cover.html -> 표지 스프레드(뒤표지-앞표지 한 장)
// 인쇄용 PDF(output/표지_스프레드.pdf) + 화면 미리보기(output/표지_스프레드_미리보기.html) 생성.
// 본문 시퀀스(parts.manifest.js)와 별개 — 실제 인쇄소 임포지션처럼 뒤표지(좌)+앞표지(우)를 한 장으로 합친 별도 산출물.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const root = __dirname;
const partsDir = path.join(root, 'src', 'parts');

const back = fs.readFileSync(path.join(partsDir, 'back-cover.html'), 'utf8').trim();
const front = fs.readFileSync(path.join(partsDir, '00_cover.html'), 'utf8').trim();

function toDataUri(absPath, mime) {
  const data = fs.readFileSync(absPath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

// 1) 인쇄용 PDF — book.css(파일 링크) 그대로 사용, puppeteer로 308x216mm 한 장 출력
const printHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>표지 스프레드</title>
<link rel="stylesheet" href="book.css">
</head>
<body>
<div class="spread">
${back}
${front}
</div>
</body>
</html>
`;
const genPath = path.join(root, 'src', '_cover_spread.generated.html');
fs.writeFileSync(genPath, printHtml, 'utf8');

// 2) 화면 미리보기 — 폰트·로고 인라인한 자기완결형 HTML (build_web.js와 동일 패턴)
const css = fs.readFileSync(path.join(root, 'src', 'book.css'), 'utf8').replace(
  /url\('\.\.\/assets\/fonts\/([^']+)'\)/g,
  (m, fname) => `url('${toDataUri(path.join(root, 'assets', 'fonts_subset', fname), 'font/woff2')}')`
);
const inlineLogo = (html) => html.replace(
  /src="\.\.\/assets\/logo\/([^"]+)"/g,
  (m, fname) => `src="${toDataUri(path.join(root, 'assets', 'logo', fname), 'image/png')}"`
);
const previewHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>표지 스프레드 — 미리보기</title>
<style>
${css}
@media screen{
  html{background:#141B22;}
  body{background:#141B22; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:40px 0;}
  .spread{border-radius:1.5mm;}
}
</style>
</head>
<body>
<div class="spread">
${inlineLogo(back)}
${inlineLogo(front)}
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'output', '표지_스프레드_미리보기.html'), previewHtml, 'utf8');
console.log('saved: output/표지_스프레드_미리보기.html');

async function main() {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true });
  const page = await browser.newPage();
  await page.goto('file:///' + genPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.emulateMediaType('print');
  await page.pdf({
    path: path.join(root, 'output', '표지_스프레드.pdf'),
    width: '308mm',
    height: '216mm',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  await browser.close();
  fs.unlinkSync(genPath);
  console.log('saved: output/표지_스프레드.pdf');
}

main().catch(err => { console.error(err); process.exit(1); });
