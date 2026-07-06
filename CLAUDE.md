# 해커스임용 합격로드맵 — 작업 시작 전 필독

새 세션(특히 다른 컴퓨터)에서 이 프로젝트를 열면 아래 순서로 먼저 읽고 시작할 것:

1. `PROJECT_STATUS.md` — 지금까지 확정된 스펙·진행 상태·산출물 경로 요약
2. `개발일지.md` — 모든 질문/답변과 그 이유를 시간순으로 기록한 이력
3. `원칙.md` — 사용자가 명시적으로 "원칙으로 만들어"라고 확정한 규칙 (있다면 항상 최우선 적용, 새 지시가 여기 있는 원칙과 다르면 반드시 먼저 확인받을 것)

작업 방식(요약 — 자세한 건 PROJECT_STATUS.md 6절):
- 챕터 내용 수정은 `src/parts/*.html`에서만, `node build_parts_preview.js`로 바로 확인
- "취합/최종본 만들어줘" 요청 시에만 `build_book.js` → `render.js` → `build_web.js` 순서로 최종 반영
- 매 개발 세션이 끝나면 `https://github.com/ch9712311231-dot/youdontwanna` 로 push
