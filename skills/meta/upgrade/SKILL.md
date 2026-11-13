---
name: upgrade
description: Check if this working copy is behind the remote repo, show what changed, and after user confirmation pull the updates. Use at session start if an update notice exists, or when the user asks to sync.
---

# Upgrade — 원격 변경 확인 및 반영

목적: 여러 작업지에서 쓰는 mystack을 최신으로 맞춘다. 항상 사용자 확인 후 pull.

## 절차

1. 저장소 루트에서 `node scripts/update-check.mjs --force`를 실행한다.
   - `UPDATE-NOTICE.md`가 이미 있으면 재실행 없이 그 내용을 사용한다.
2. 뒤처져 있지 않으면 "최신입니다"로 끝난다.
3. 뒤처져 있으면 사용자에게 보여준다: 로컬 버전 → 원격 버전, 새 커밋 목록, 변경 요약.
4. 컨펌을 받는다: `지금 pull / 나중에`.
   - 나중에: `UPDATE-NOTICE.md`를 그대로 두고 끝낸다. (세션 시작 알림이 다시 뜸)
5. 지금 pull:
   - 로컬 커밋(pending 제안 등)이 있으면 **먼저 push**한다.
   - `git pull --ff-only` 실행. 실패(로컬 변경 충돌)하면 충돌 내용을 보여주고
     사용자 결정을 기다린다. 강제 리셋은 절대 하지 않는다.
6. `UPDATE-NOTICE.md`를 삭제하고, 새 버전 번호를 보고한다.

## 참고

- update-check는 시간당 1회 throttle된다. 세션 시작 훅이 자동으로 돌려주므로
  이 스킬은 "알림 봤을 때 처리" 역할이다.
- 세션 시작 시 루트에 `UPDATE-NOTICE.md`가 있으면 이 스킬을 자동으로 떠올린다.
