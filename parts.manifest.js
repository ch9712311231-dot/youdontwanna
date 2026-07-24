// src/parts/*.html 순서와 라벨 — 목차(TOC) 순서와 반드시 일치해야 함.
// 파일명 앞 번호가 실제 읽는 순서와 동일하도록 맞춰져 있음(2026-07-24 재정렬).
// build_book.js(최종 병합)와 build_parts_preview.js(부분 미리보기)가 공통으로 참조하는 단일 목록.
module.exports = [
  { file: '01_cover.html', label: '표지' },
  { file: '02_headline.html', label: '머리말' },
  { file: '03_toc.html', label: '목차' },
  { file: '04_part1_cover.html', label: 'PART 1 간지' },
  { file: '05_ch01_exam-intro.html', label: '① 임용 시험이란?' },
  { file: '06_ch02_basic-conditions.html', label: '② 중등 임용시험의 기본 조건' },
  { file: '07_ch04_subjects-scoring.html', label: '③ 시험 과목·문항수·배점·출제 범위' },
  { file: '08_ch09_exam-notice.html', label: '④ 응시자 유의사항' },
  { file: '09_ch06_interview-prep.html', label: '⑤ 면접 준비방법' },
  { file: '10_ch05_recruitment-trend.html', label: '⑥ 모집인원 추이' },
  { file: '11_ch07_selection-criteria.html', label: '⑦ 합격자 선정 방법' },
  { file: '12_ch08_faq.html', label: '⑧ 평가원에 자주 묻는 질문' },
  { file: '13_part2_cover.html', label: 'PART 2 간지' },
  { file: '14_pedagogy_mockup.html', label: 'PART 2 — 교육학 (가안)' },
];
