# Changelog

## 0.1.3 - 2026-11-13

- AGENTS.md 개정: 반려된 스킬에 대한 죽은 참조 제거
  (`e2e-before-done`, `repo-destination-confirm` 스킬 언급 → "pending 제안으로 상세화"로 교체).
  원칙 자체는 유지. (사용자 승인 2026-11-13)

## 0.1.2 - 2026-11-13

### pending 리뷰 기록 (버전 무변경, 2026-11-13)

- **반려** `repo-destination-confirm` — (사용자 판정, 이유 미기재)
- **반려** `e2e-before-done` — (사용자 판정, 이유 미기재)
- **흡수** `korean-docs-english-frontmatter` — 신규 스킬 불필요.
  AGENTS.md 언어 정책이 제안 내용과 동일한 내용을 이미 포함함.
  학습: 유형 preference 중 "상시 적용"은 스킬보다 헌법이 자연스러움.

### 본 기록 (이전)

- 원칙 2개 추가: **프로젝트는 기본 git repo** (git init + 초기 커밋이 기본 동작),
  **세션 = working history** (git log가 히스토리이자 롤백 지점).
- 신규 스킬 `session-commit`: 세션 단위 커밋 절차, revert 기반 롤백 원칙
  (reset --hard 금지, 롤백 전 사용자 컨펌), 커밋 분할 기준("혼자 revert 가능한가").
- (사용자 지시 + show-before-write 승인 2026-11-13)

## 0.1.1 - 2026-11-13

- 게이트 2 → **show-before-write**로 교체: skills/와 AGENTS.md의 모든 쓰기는
  최종 내용 전문을 보여주고 승인받은 뒤에만 기록. "지시 자체가 승인" 예외 제거.
- 사건 근거: 헌법 v2가 전문 승인 없이(요약 제시만으로) 기록됨 — 사용자가 빈틈을
  지적, 게이트 2·4 개정 승인 (2026-11-13).
- 게이트 4: 개정 경로를 pending 컨펌 또는 show-before-write 승인으로 한정,
  요약 제시는 승인으로 불충분함을 명시.

## 0.1.0 - 2026-11-13

- 초기 구성: meta 스킬 3종(harvest, review-pending, upgrade), 게이트 규칙(AGENTS.md),
  설치/업데이트 체크 스크립트, 형식 예시 패턴 1개
