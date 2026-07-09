// src/parts/*.html 각각을 output/parts/ 아래 독립 웹 미리보기로 빌드.
// 부분 수정 후 전체(book.html) 재조립 없이 해당 챕터만 바로 확인하기 위한 스크립트.
const fs = require('fs');
const path = require('path');

const root = __dirname;
const partsDir = path.join(root, 'src', 'parts');
const bookCssPath = path.join(root, 'src', 'book.css');
const outDir = path.join(root, 'output', 'parts');
const manifest = require('./parts.manifest');

fs.mkdirSync(outDir, { recursive: true });

function toDataUri(absPath, mime) {
  const data = fs.readFileSync(absPath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

const css = fs.readFileSync(bookCssPath, 'utf8').replace(/url\('\.\.\/assets\/fonts\/([^']+)'\)/g, (m, fname) => {
  const abs = path.join(root, 'assets', 'fonts_subset', fname);
  return `url('${toDataUri(abs, 'font/woff2')}')`;
});

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
  #book-deck .page{border-radius:1.5mm;}
  #pv-bar{position:sticky; top:0; z-index:50; background:var(--pv-bar-bg); color:var(--pv-bar-fg); font-family:'Pretendard',sans-serif;
    padding:12px 20px; display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;
    border-bottom:1px solid var(--pv-bar-line); box-shadow:0 2px 14px rgba(0,0,0,.16);}
  #pv-bar .t{font-weight:800; font-size:14px; letter-spacing:-.01em;}
  #pv-bar .m{font-size:12px; color:var(--pv-bar-sub); font-variant-numeric:tabular-nums;}
}
`;

for (const { file, label } of manifest) {
  let html = fs.readFileSync(path.join(partsDir, file), 'utf8');
  html = html.replace(/src="\.\.\/assets\/logo\/([^"]+)"/g, (m, fname) => {
    const abs = path.join(root, 'assets', 'logo', fname);
    return `src="${toDataUri(abs, 'image/png')}"`;
  });
  const pages = html.match(/<section class="page[\s\S]*?<\/section>/g) || [];
  const pageCount = pages.length;

  // 두 페이지 이상인 챕터는 두 페이지씩(spread) 짝지어 보여줌 — 1페이지 챕터는 그대로 단면 표시
  let deckHtml;
  if (pageCount >= 2) {
    let spreads = '';
    for (let i = 0; i < pages.length; i += 2) {
      spreads += `<div class="spread">\n${pages.slice(i, i + 2).join('\n')}\n</div>\n`;
    }
    deckHtml = spreads;
  } else {
    deckHtml = html;
  }

  const standalone = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${label} — 부분 미리보기</title>
<style>
${css}
${screenCss}
</style>
</head>
<body>
<div id="pv-bar"><span class="t">${label} · 부분 미리보기</span><span class="m">${pageCount}페이지 · src/parts/${file}</span></div>
<div id="book-scroll"><div id="book-deck">
${deckHtml}
</div></div>
</body>
</html>
`;

  const outPath = path.join(outDir, file);
  fs.writeFileSync(outPath, standalone, 'utf8');
  console.log('saved:', path.relative(root, outPath), `(${pageCount}p)`);
}
