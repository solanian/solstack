---
name: session-commit
description: Record the work of a conversation session as git commits so that git log becomes the project's working history. Use before ending a session, or when the user asks to commit the session.
---

# Session Commit — 세션 단위 기록

목적: 두 가지다.
1. 감사 — git log 한 줄 한 줄이 "언제 뭘 왜 했는지" 알 수 있게 하는 것.
2. 롤백 — 잘못된 작업을 커밋 단위로 정확히 되돌릴 수 있게 하는 것.
이 프로젝트의 working history는 commit이고, 되돌리기 단위도 commit이다.

## 절차

1. **repo 확인**: 현재 프로젝트가 git repo가 아니면 `git init`부터 하고
   .gitignore를 세팅한 뒤 초기 커밋을 만든다.
2. **상태 확인**: `git status`로 변경 사항을 훑는다. 변경이 없으면 스킵.
3. **커밋 분할 판정**:
   - 논리적으로 다른 성격의 변경(기능 / 문서 / 설정 / 임시)은 분리 커밋.
   - 세션 안에서 이미 중간 커밋을 했으면, 남은 변경만 마무리 커밋으로.
   - 분할 기준을 묻는다면: "이 커밋이 잘못됐다면 혼자 revert할 수 있는가"로 판정한다.
4. **메시지 규칙** (git log가 히스토리가 되도록):
   - 형식: `<영어 prefix>: <한국어 요약>` (기계 계층 영어 / 인간 계층 한국어)
     prefix: feat | fix | docs | chore | refactor | test | session
   - 세션 마무리 커밋은 `session:` prefix를 쓴다.
   - 본문에 "무엇을 했고 왜인지" 1~3줄. 이 세션의 맥락이 없는 미래의 나도
     읽을 수 있게.
5. **커밋·push**: 원격이 있으면 push. 실패하면 이유를 보고하고 끝낸다.
6. **보고**: 커밋 목록과 메시지를 요약해 보여준다.

## 롤백

- 잘못된 작업은 `git revert`로 **되돌림 커밋을 새로 추가**하는 방식으로 undone.
  `reset --hard` 같은 히스토리 삭제는 하지 않는다 — git log가 진실을 유지해야 한다.
- 롤백 전에 사용자에게 무엇을 되돌리는지 보여주고 확인받는다.
- "실험이 실패해서 처음부터 다시" 같은 큰 되돌림도 revert로 흔적을 남긴다.

## 금지

- 커밋되지 않은 변경을 남긴 채 세션 종료 (사용자가 명시적으로 남기라고 한 경우 제외)
- 아무 의미 없는 메시지 ("update", "wip" 단독)
- 요청받지 않은 파일 커밋 (git status에서 의심되는 파일은 먼저 물어본다)
