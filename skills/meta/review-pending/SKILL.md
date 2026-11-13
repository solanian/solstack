---
name: review-pending
description: Present pending skill proposals from ledger/pending one by one, get the user's approve/reject/edit verdict, and apply approved changes to skills/ with a version bump and changelog entry. Use when the user asks to confirm or reflect pending updates.
---

# Review Pending — 후보 컨펌 및 반영

목적: `ledger/pending/`의 제안을 사용자에게 보여주고, 승인분만 `skills/`에 반영한다.
이 스킬이 solstack의 유일한 쓰기 게이트다.

## 절차

1. `ledger/pending/*.md` 목록을 읽는다. 없으면 "대기 중인 제안이 없습니다"로 끝낸다.
2. 각 제안을 **하나씩** 사용자에게 보여준다: 제안 내용 + 수집 근거 + 반영 대상 경로.
3. 판정을 묻는다: `승인 / 반려 / 수정 후 승인 / 보류`.
   - 수정 후 승인이면 사용자 지시대로 제안을 고친 뒤 다시 보여준다.
4. **승인 처리** (판정별로 즉시 수행):
   - 승인: 제안의 반영 대상에 따라 `skills/patterns/<이름>/SKILL.md`를 만들거나
     기존 스킬을 편집한다. 스킬 작성 규칙(AGENTS.md) 준수.
   - 반려: pending 파일 삭제, 반려 이유 한 줄을 CHANGELOG에 기록.
   - 보류: 파일을 그대로 둔다.
5. 승인분이 하나라도 있으면:
   - `ledger/VERSION` 패치 bump (신규 스킬이면 마이너 bump)
   - `ledger/CHANGELOG.md` 최상단에 날짜·버전·변경 요약 기록
6. 전부 커밋(한 승인당 한 커밋) 후 push.
7. 처리 결과 요약: 승인/반려/보류 개수와 새 버전을 보고한다.

## 주의

- 이번 컨펌에서 새로 배운 게 있으면(예: 이런 형식의 제안은 싫다는 것) 그것 자체도
  `harvest` 근거가 될 수 있다 — 다음 harvest에서 쓴다.
- 사용자가 전면 승인("다 반영해")이라고 하더라도, 목록은 한 번은 보여준다.
