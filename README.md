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
│   ├── update-check.mjs   # 원격 대비 뒤처짐 확인 → UPDATE-NOTICE.md 생성
│   └── validate-skills.mjs # SKILL.md frontmatter 검증 (CI에서도 실행)
└── hooks/
    ├── session-start.mjs  # 세션 시작: throttle 체크 + notice를 컨텍스트로 주입
    └── session-end.mjs    # 세션 종료: throttle 체크 (다음 세션용)
```

## 빠른 시작

머신당 한 번만 클론하고 설치한다. **프로젝트 repo에 넣지 않는다.**

```bash
git clone https://github.com/solanian/solstack.git ~/solstack && cd ~/solstack

# 스킬 설치 + Claude 훅 + 전역 규칙 포인터
node scripts/install.mjs --host auto --with-hooks --with-rules

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

1. **머신당 클론 1개**: 각 머신에서 이 repo를 클론(예: `~/solstack`)하고 `node scripts/install.mjs --host auto --with-hooks --with-rules`
   - 프로젝트 repo에는 아무것도 넣지 않는다. 스킬은 하네스 전역 디렉터리에 심링크되므로
     어떤 프로젝트의 세션에서도 쓸 수 있다.
2. Claude Code 훅이 알아서 돌려준다:
   - **SessionStart**: throttle된 update-check 실행 → 뒤처져 있으면 notice가 세션 컨텍스트로 주입됨
   - **SessionEnd**: 동일한 throttle된 체크 (다음 세션을 위해)
3. `--with-rules`가 `~/.claude/CLAUDE.md`(와 `~/.codex/AGENTS.md`)에 게이트 규칙 포인터를
   붙여넣으므로, solstack 폴더 밖에서 작업해도 게이트가 보인다.
4. 확인 후 `/upgrade`로 pull (로컬 변경 보호를 위해 `--ff-only`만 허용)

## 하네스별 설치 위치

| 하네스 | 스킬 경로 |
|---|---|
| Claude Code | `~/.claude/skills/<skill-name>` |
| Codex | `~/.codex/skills/<skill-name>` |
| Antigravity | IDE 설정의 Global skills 디렉터리 (docs: https://antigravity.google/docs/skills/) |

Antigravity의 전역 스킬 경로는 환경에 따라 다르므로 `--dest`로 직접 지정할 수 있다.
