# 제안: 문서 본문은 한국어, SKILL.md frontmatter는 영어로 쓴다

- 날짜: 2026-11-13
- 발견 위치: solstack 구축 세션 (OpenCode)
- 유형: preference
- 반영 대상: `skills/patterns/korean-docs-english-frontmatter/SKILL.md` (신규)

## 근거 (세션에서의 실제 사건)

- 1: 이 세션의 모든 산출물(README, AGENTS.md, 스킬 3종, 제안 템플릿, 알림 문구)에서
  본문은 한국어, YAML frontmatter의 name/description은 영어로 일관되게 작성했고
  사용자가 이를 수정한 적이 없음.
- 2: 사용자의 모든 대화가 한국어이며, 에이전트 응답도 한국어로 진행됨.

## 제안 내용

- 하네스가 읽는 기계 계층(SKILL.md frontmatter의 name/description, 커밋 메시지,
  스크립트 주석, CLI 출력)은 영어로 유지한다 — 스킬 매칭/검색/공유 시 무손실.
- 인간이 읽는 계층(본문, 절차 설명, 제안 근거, 알림 문구)은 한국어로 쓴다.
- 두 계층이 섞일 때는 frontmatter → 영어, 본문 → 한국어가 기본값이다.

## 기대 효과

스킬이 늘어나도 문서 언어 정책을 매번 고민하지 않고,
하네스 호환성(영어 기반 매칭)과 독서 효율(한국어)을 동시에 유지한다.
