// src/book.html + book.css를 폰트/이미지까지 전부 인라인한 자기완결형 웹 미리보기 HTML로 빌드
const fs = require('fs');
const path = require('path');

const root = __dirname;
const bookHtmlPath = path.join(root, 'src', 'book.html');
const bookCssPath = path.join(root, 'src', 'book.css');

let html = fs.readFileSync(bookHtmlPath, 'utf8');
let css = fs.readFileSync(bookCssPath, 'utf8');

function toDataUri(absPath, mime) {
  const data = fs.readFileSync(absPath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

// 폰트: 웹 버전은 용량이 작은 서브셋 폰트 사용
css = css.replace(/url\('\.\.\/assets\/fonts\/([^']+)'\)/g, (m, fname) => {
  const abs = path.join(root, 'assets', 'fonts_subset', fname);
  return `url('${toDataUri(abs, 'font/woff2')}')`;
});

// 이미지(로고) 인라인
html = html.replace(/src="\.\.\/assets\/logo\/([^"]+)"/g, (m, fname) => {
  const abs = path.join(root, 'assets', 'logo', fname);
  return `src="${toDataUri(abs, 'image/png')}"`;
});

const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
const bodyInner = bodyMatch[1];

const screenCss = `
/* ---- 웹 미리보기 전용 스타일 (인쇄 파이프라인에는 영향 없음) ---- */
:root{
  --pv-bg:#141B22; --pv-bar-bg:#1B2530; --pv-bar-fg:#EAF6F8; --pv-bar-sub:#7FA7B3; --pv-bar-line:#2A3742;
}
@media (prefers-color-scheme: light){
  :root{ --pv-bg:#E4EBEF; --pv-bar-bg:#FFFFFF; --pv-bar-fg:#16323D; --pv-bar-sub:#5C7D89; --pv-bar-line:#D3E0E5; }
}
:root[data-theme="dark"]{ --pv-bg:#141B22; --pv-bar-bg:#1B2530; --pv-bar-fg:#EAF6F8; --pv-bar-sub:#7FA7B3; --pv-bar-line:#2A3742; }
:root[data-theme="light"]{ --pv-bg:#E4EBEF; --pv-bar-bg:#FFFFFF; --pv-bar-fg:#16323D; --pv-bar-sub:#5C7D89; --pv-bar-line:#D3E0E5; }

@media screen {
  html{background:var(--pv-bg);}
  body{background:var(--pv-bg); min-height:100vh; padding:0 0 80px;}
  #book-scroll{overflow-x:auto;}
  #book-deck{width:max-content; margin:0 auto; padding-top:24px; display:flex; flex-direction:column; align-items:center; gap:16px;}
  #book-deck .page{box-shadow:0 10px 34px rgba(0,0,0,.32); border-radius:1.5mm;}
  #pv-bar{position:sticky; top:0; z-index:50; background:var(--pv-bar-bg); color:var(--pv-bar-fg); font-family:'Pretendard',sans-serif;
    padding:12px 20px; display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;
    border-bottom:1px solid var(--pv-bar-line); box-shadow:0 2px 14px rgba(0,0,0,.16);}
  #pv-bar .t{font-weight:800; font-size:14px; letter-spacing:-.01em;}
  #pv-bar .m{font-size:12px; color:var(--pv-bar-sub); font-variant-numeric:tabular-nums;}
}
`;

const pageCount = (bodyInner.match(/class="page/g) || []).length;

const standalone = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>해커스임용 합격로드맵 — 웹 미리보기</title>
<style>
${css}
${screenCss}
</style>
</head>
<body>
<div id="pv-bar"><span class="t">해커스임용 합격 로드맵 · 웹 미리보기</span><span class="m">총 ${pageCount}페이지 · 실물 판형 188×257mm 기준</span></div>
<div id="book-scroll"><div id="book-deck">
${bodyInner}
</div></div>
</body>
</html>
`;

const outPath = path.join(root, 'output', '임용합격로드맵_web.html');
fs.writeFileSync(outPath, standalone, 'utf8');
console.log('saved:', outPath, `(${(Buffer.byteLength(standalone) / 1024 / 1024).toFixed(2)} MB, ${pageCount} pages)`);

// Artifact 게시용 조각본(별도 doctype/html/head/body 없이 style+본문만)
const fragment = `<style>
${css}
${screenCss}
</style>
<div id="pv-bar"><span class="t">해커스임용 합격 로드맵 · 웹 미리보기</span><span class="m">총 ${pageCount}페이지 · 실물 판형 188×257mm 기준</span></div>
<div id="book-scroll"><div id="book-deck">
${bodyInner}
</div></div>
`;
const fragPath = path.join(root, 'output', '_artifact_fragment.html');
fs.writeFileSync(fragPath, fragment, 'utf8');
console.log('saved:', fragPath);
