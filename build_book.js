// src/parts/*.html(목차 순서) -> src/book.html 로 합치는 스크립트
// book.html/book.css를 직접 수정하지 말고, src/parts/*.html을 수정한 뒤 이 스크립트를 실행할 것.
const fs = require('fs');
const path = require('path');

const partsDir = path.join(__dirname, 'src', 'parts');
const outPath = path.join(__dirname, 'src', 'book.html');
const manifest = require('./parts.manifest');

const body = manifest
  .map(({ file }) => fs.readFileSync(path.join(partsDir, file), 'utf8').trim())
  .join('\n\n');

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>해커스임용 합격로드맵</title>
<link rel="stylesheet" href="book.css">
</head>
<body>

${body}

</body>
</html>
`;

fs.writeFileSync(outPath, html, 'utf8');
console.log('saved:', outPath, `(${manifest.length}개 파트 병합)`);
