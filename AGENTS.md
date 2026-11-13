# AGENTS.md — solstack 운영 규칙

이 저장소는 당신(에이전트)과 사용자가 함께 발전시키는 개인 스킬북이다.
아래 규칙은 모든 하네스에서 이 저장소를 다룰 때 예외 없이 적용된다.

## 게이트 1: skills/ 직접 수정 금지

- `skills/` 아래의 어떤 파일도 승인 절차 없이 수정·삭제·추가하지 않는다.
- 개선 아이디어, 반복 패턴, 사용자의 암묵지 발견 → `ledger/pending/`에 후보 제안 파일로만 적재한다.
  - 파일명: `YYYY-MM-DD-<짧은-이름>.md`
  - 형식: `ledger/pending/TEMPLATE.md` 따름
- 사용자가 명시적으로 "이거 스킬로 만들어/바꿔"라고 지시한 경우에도
  `review-pending` 절차를 거쳐 반영한다. (지시 자체가 승인이므로 확인은 한 번이면 충분)

## 게이트 2: 컨펌 없는 반영 금지

- pending 후보를 반영할 때는 `skills/meta/review-pending/SKILL.md` 절차를 따른다.
- 반영 시 반드시: `ledger/VERSION` bump + `ledger/CHANGELOG.md` 기록 + 커밋.
- 반려된 후보는 파일을 삭제하되, 반려 이유를 CHANGELOG에 한 줄 남긴다(학습 데이터).

## 게이트 3: 동기화는 잃지 않는 방향으로만

- 원격에 변경이 있으면 `UPDATE-NOTICE.md`가 생긴다. 세션 시작 시 이 파일을 먼저 확인하고
  사용자에게 알린다. 사용자가 확인하기 전까지는 pull하지 않는다.
- pull은 `git pull --ff-only`만 허용한다. 로컬 변경이 막고 있으면 사용자에게 보여주고 결정을 맡긴다.
- 이 저장소의 로컬 커밋(pending 제안 포함)은 먼저 push하고 pull한다.

## 스킬 작성 규칙

- 각 스킬은 폴더 하나: `SKILL.md` (+ 필요시 `references/`, `scripts/`).
- SKILL.md는 500줄 미만. 절차형 지식은 references/로 분리.
- 스킬 간 하드 의존 금지. 한 스킬은 단독으로도 읽을 수 있어야 한다.
- 모든 스킬은 Claude Code / Codex / Antigravity 어디서나 동작해야 하므로
  특정 하네스 전용 기능(CLI 명령, 특정 MCP)은 "어댑터 노트"로 분리해 표기한다.
