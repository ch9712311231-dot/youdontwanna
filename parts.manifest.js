// src/parts/*.html 순서와 라벨 — 목차(TOC) 순서와 반드시 일치해야 함.
// build_book.js(최종 병합)와 build_parts_preview.js(부분 미리보기)가 공통으로 참조하는 단일 목록.
module.exports = [
  { file: '00_cover.html', label: '표지' },
  { file: '01_toc.html', label: '목차' },
  { file: '02_part1_cover.html', label: 'PART 1 간지' },
  { file: '03_ch01_exam-intro.html', label: '① 임용 시험이란?' },
  { file: '04_ch02_basic-conditions.html', label: '② 중등 임용시험의 기본 조건' },
  { file: '05_ch03_korean-history.html', label: '③ 한국사능력검정' },
  { file: '06_ch04_subjects-scoring.html', label: '④ 시험 과목·문항수·배점·출제 범위' },
  { file: '07_ch05_recruitment-trend.html', label: '⑤ 모집인원 추이' },
  { file: '08_part2_cover.html', label: 'PART 2 간지' },
  { file: '09_pedagogy_mockup.html', label: 'PART 2 — 교육학 (가안)' },
];
