---
name: harvest
description: Extract recurring patterns, mistakes, and tacit knowledge from the current session into pending proposals for the user to confirm. Use at the end of a task, or when the user asks to capture what was learned.
---

# Harvest — 세션에서 배운 것을 후보 제안으로 적재

목적: 반복해서 나오는 유의미한 패턴·실수·선호를 놓치지 않고 `ledger/pending/`에
제안으로 남겨, 다음 `review-pending`에서 사용자 컨펌을 거쳐 스킬로 발전시킨다.

## 절차

1. **근거 수집**: 이번 세션에서 다음 신호를 찾는다.
   - 사용자가 같은 방향을 두 번 이상 고친 것 (스타일, 형식, 레벨, 단위 등)
   - 에이전트가 처음에 잘못했다가 정정된 것
   - 사용자가 특별히 언급하거나 강조한 기준
   - 같은 절차를 두 번 이상 수행한 것 (명령 조합, 검증 순서, 파일 위치)
2. **후보 판별**: 근거가 1회뿐인 것은 넣지 않는다. "반복"이 관건이다.
   이미 `skills/`에 있는 내용과 겹치면 제안하지 않고 스킵한다.
3. **제안 작성**: 후보마다 `ledger/pending/YYYY-MM-DD-<짧은-이름>.md` 파일을 만들고
   `TEMPLATE.md` 형식을 따른다. 근거(세션에서의 실제 발화/사건)를 반드시 인용한다.
4. **보고**: 만든 제안 목록과 각각의 한 줄 요약을 사용자에게 보여준다. 이 시점에서
   승인을 구하지 않는다 — 승인은 `review-pending`의 몫이다.
5. **커밋**: 제안 파일들을 커밋하고 push한다 (다른 작업지에서도 보이도록).

## 금지

- `skills/` 직접 수정 (AGENTS.md 게이트 1)
- 근거 없는 정성적 추론으로 제안 생성
- 한 세션에서 제안 5개 초과 (당장 중요한 것 위주로)
