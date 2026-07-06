// src/parts/*.html(목차 순서) -> src/book.html 로 합치는 스크립트
// book.html/book.css를 직접 수정하지 말고, src/parts/*.html을 수정한 뒤 이 스크립트를 실행할 것.
const fs = require('fs');
const path = require('path');

const partsDir = path.join(__dirname, 'src', 'parts');
const outPath = path.join(__dirname, 'src', 'book.html');

// 목차(TOC) 순서 그대로. 파일명 앞자리 번호가 이 순서와 어긋나지 않도록 유지할 것.
const manifest = [
  '00_cover.html',
  '01_toc.html',
  '02_part1_cover.html',
  '03_ch01_exam-intro.html',
  '04_ch02_basic-conditions.html',
  '05_ch03_korean-history.html',
  '06_ch04_subjects-scoring.html',
  '07_ch05_recruitment-trend.html',
  '08_part2_cover.html',
  '09_pedagogy_mockup.html',
];

const body = manifest
  .map(name => fs.readFileSync(path.join(partsDir, name), 'utf8').trim())
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
