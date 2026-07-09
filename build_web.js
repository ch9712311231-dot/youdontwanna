// src/book.html + book.css를 폰트/이미지까지 전부 인라인한 자기완결형 웹 미리보기 HTML로 빌드
// 화면에서는 두 페이지씩(spread) 짝지어 보여주고, 맨 위에 표지 임포지션(뒤표지-앞표지) 미리보기를 별도로 얹는다.
const fs = require('fs');
const path = require('path');

const root = __dirname;
const bookHtmlPath = path.join(root, 'src', 'book.html');
const bookCssPath = path.join(root, 'src', 'book.css');
const backCoverPath = path.join(root, 'src', 'parts', 'back-cover.html');

let html = fs.readFileSync(bookHtmlPath, 'utf8');
let css = fs.readFileSync(bookCssPath, 'utf8');
let backCover = fs.readFileSync(backCoverPath, 'utf8');

function toDataUri(absPath, mime) {
  const data = fs.readFileSync(absPath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

// 폰트: 웹 버전은 용량이 작은 서브셋 폰트 사용
css = css.replace(/url\('\.\.\/assets\/fonts\/([^']+)'\)/g, (m, fname) => {
  const abs = path.join(root, 'assets', 'fonts_subset', fname);
  return `url('${toDataUri(abs, 'font/woff2')}')`;
});

// 이미지(로고·본문 이미지) 인라인
const inlineLogo = (str) => str.replace(/src="\.\.\/assets\/(logo|img)\/([^"]+)"/g, (m, dir, fname) => {
  const abs = path.join(root, 'assets', dir, fname);
  return `src="${toDataUri(abs, 'image/png')}"`;
});
html = inlineLogo(html);
backCover = inlineLogo(backCover);

const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
const bodyInner = bodyMatch[1];
const pages = bodyInner.match(/<section class="page[\s\S]*?<\/section>/g) || [];
const pageCount = pages.length;
const frontCover = pages[0];

// 본문을 두 페이지씩(spread) 짝지음 — PDF(render.js) 출력에는 영향 없음(book.html엔 .spread 래퍼가 없어 그대로 순차 낱장)
// 표지(0)는 위 표지 임포지션 미리보기에서 이미 보여주므로 본문 덱에서는 제외(중복 표시 방지).
// 목차(1)는 인쇄 관례상 오른쪽(recto) 단독 시작 — 왼쪽에 빈 면을 넣어 짝을 맞추고,
// 그 이후(파트 간지부터)는 정상적으로 두 페이지씩 짝지음.
const blank = '<section class="page nopad blank"></section>';
let deckHtml = '';
deckHtml += `<div class="spread">\n${blank}\n${pages[1]}\n</div>\n`;
for (let i = 2; i < pages.length; i += 2) {
  deckHtml += `<div class="spread">\n${pages.slice(i, i + 2).join('\n')}\n</div>\n`;
}

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
  #book-deck{width:max-content; margin:0 auto; padding-top:8px; display:flex; flex-direction:column; align-items:center; gap:16px;}
  #book-deck .page{border-radius:1.5mm;}
  #cover-proof{width:max-content; margin:0 auto; padding:24px 0 0; display:flex; flex-direction:column; align-items:center; gap:8px;}
  #cover-proof .cp-label{color:var(--pv-bar-sub); font-size:12px; font-weight:700; letter-spacing:.02em;}
  #cover-proof .page{border-radius:1.5mm;}
  #pv-bar{position:sticky; top:0; z-index:50; background:var(--pv-bar-bg); color:var(--pv-bar-fg); font-family:'Pretendard',sans-serif;
    padding:12px 20px; display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;
    border-bottom:1px solid var(--pv-bar-line); box-shadow:0 2px 14px rgba(0,0,0,.16);}
  #pv-bar .t{font-weight:800; font-size:14px; letter-spacing:-.01em;}
  #pv-bar .m{font-size:12px; color:var(--pv-bar-sub); font-variant-numeric:tabular-nums;}
}
`;

const coverProofBlock = `<div id="cover-proof">
  <span class="cp-label">표지 임포지션 미리보기 (뒤표지 · 앞표지 — 실제 출력물은 output/표지_스프레드.pdf 별도 파일)</span>
  <div class="spread">
${backCover}
${frontCover}
  </div>
</div>`;

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
<div id="pv-bar"><span class="t">해커스임용 합격 로드맵 · 웹 미리보기</span><span class="m">총 ${pageCount}페이지 · 실물 판형 A5(148×210mm) 기준</span></div>
${coverProofBlock}
<div id="book-scroll"><div id="book-deck">
${deckHtml}
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
<div id="pv-bar"><span class="t">해커스임용 합격 로드맵 · 웹 미리보기</span><span class="m">총 ${pageCount}페이지 · 실물 판형 A5(148×210mm) 기준</span></div>
${coverProofBlock}
<div id="book-scroll"><div id="book-deck">
${deckHtml}
</div></div>
`;
const fragPath = path.join(root, 'output', '_artifact_fragment.html');
fs.writeFileSync(fragPath, fragment, 'utf8');
console.log('saved:', fragPath);
