# 제안: GitHub repo 생성/이동 전에 최종 소유자·이름을 한 번 확정받는다

- 날짜: 2026-11-13
- 발견 위치: solstack 초기 구축 세션 (OpenCode)
- 유형: correction
- 반영 대상: `skills/patterns/repo-destination-confirm/SKILL.md` (신규)

## 근거 (세션에서의 실제 사건)

- 1: 사용자가 "https://github.com/solanian/mystack 으로 옮겨줘"로 목적지를 지시 →
  실행 중 다시 "아니 https://github.com/dsseo-whereable/solstack"으로 수정 →
  곧바로 "아니 https://github.com/solanian/solstack"으로 재수정.
  목적지가 3번 바뀌어 총 4번의 repo 조작(생성→삭제→리네임→재push)이 발생.
- 2: 계정 전환(gh auth switch)이 그때마다 필요했고, 토큰 스코프 차이
  (solanian엔 delete_repo 없음)까지 확인해야 하는 부수 비용 발생.

## 제안 내용

GitHub repo를 새로 만들거나 옮기기 전에, 3가지를 한 문장으로 확정받고 진행한다:
소유자(계정/조직), repo 이름, 공개/비공개. 확정 문구의 예:
"`solanian/solstack` 프라이빗으로 진행합니다" — 사용자가 확인한 뒤에만 생성/이동을 실행한다.
이후 사용자가 중간에 목적지를 바꾸면, "이건 최종 결정인가요?"를 한 번 확인한 뒤
이전 작업물의 정리(삭제/리네임)까지 한 사이클로 묶어서 처리한다.

## 기대 효과

목적지 불확정 상태로 중간 저장소를 여러 개 만들고 지우는 낭비와,
계정/스코프 문제로 push가 실패하는 상황을 사전에 제거한다.
