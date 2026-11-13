# solstack

개인용 에이전트 스킬북. Claude Code / Codex / Antigravity 어디서든 같은 스킬을 쓰고,
작업하면서 발견한 암묵지와 반복 패턴을 **직접 컨펌받아** 스킬로 축적한다.

paperthin(범용 설치 레이어) + gstack(업데이트 채널/게이트) + pstack(플레이북)의
필요한 부분만 뽑아 만든 최소 구성.

## 구조

```
solstack/
├── AGENTS.md              # 에이전트가 반드시 지켜야 할 운영 규칙 (게이트 포함)
├── skills/
│   ├── meta/              # 자기 관리 스킬: harvest / review-pending / upgrade
│   └── patterns/          # 작업 패턴 스킬 (harvest → 컨펌 → 여기에 쌓임)
├── ledger/
│   ├── pending/           # 컨펌 대기 후보 제안 (게이트: 여기서 승인 없이는 반영 불가)
│   ├── CHANGELOG.md
│   └── VERSION
├── scripts/
│   ├── install.mjs        # 하네스별 설치 (claude/codex/antigravity/auto)
│   └── update-check.mjs   # 원격 대비 뒤처짐 확인 → UPDATE-NOTICE.md 생성
└── hooks/
    └── session-end.mjs    # 세션 종료 시 update-check 실행 (throttle 내장)
```

## 빠른 시작

```bash
# 설치 (감지되는 모든 하네스에)
node scripts/install.mjs --host auto

# 업데이트 뒤처짐 확인 (원할 때)
node scripts/update-check.mjs --force
```

에이전트 세션 안에서는:

| 명령 | 하는 일 |
|---|---|
| `/harvest` | 이번 세션의 반복 패턴·실수·암묵지를 후보 제안으로 적재 (`ledger/pending/`) |
| `/review-pending` | 대기 중 후보를 하나씩 보여주고 승인/반려 → 승인분만 skills에 반영 |
| `/upgrade` | 다른 작업지에서 밀어올린 변경을 확인 후 pull |

## 발전 루프 (coil)

```
작업 세션 ──▶ /harvest ──▶ ledger/pending/ 후보 제안
                                │
              컨펌 게이트        ▼
                         /review-pending ──승인──▶ skills/ 반영 + VERSION bump
                                │반려                │
                                ▼                    ▼
                              폐기              git push (SSOT)
                                                     │
                        다른 작업지 ◀── update-check 알림 + 수동 pull
```

규칙 하나만 기억: **에이전트가 `skills/`를 임의로 고칠 수 없다.**
모든 변경은 `ledger/pending/` 제안 → 컨펌 → 반영 순서로만 간다.

## 여러 작업지에서 쓰기

1. 각 작업 환경에서 이 repo를 클론하고 `node scripts/install.mjs --host auto`
2. 세션 시작/종료 훅이 `update-check.mjs`를 실행 (시간당 1회 throttle)
3. 뒤처져 있으면 `UPDATE-NOTICE.md`가 생기고, 에이전트가 세션 시작 알림을 띄움
4. 확인 후 `/upgrade`로 pull (로컬 변경 보호를 위해 `--ff-only`만 허용)

## 하네스별 설치 위치

| 하네스 | 스킬 경로 |
|---|---|
| Claude Code | `~/.claude/skills/<skill-name>` |
| Codex | `~/.codex/skills/<skill-name>` |
| Antigravity | IDE 설정의 Global skills 디렉터리 (docs: https://antigravity.google/docs/skills/) |

Antigravity의 전역 스킬 경로는 환경에 따라 다르므로 `--dest`로 직접 지정할 수 있다.
