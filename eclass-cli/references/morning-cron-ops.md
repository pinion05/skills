# 아침 LMS 크론 운영 노트

## 크론 잡 상수
- 잡 `lms-morning-lecture-watch` (매일 04:00): [0]어제 와처 서버진도 검증·미정산 topup → [1]e-Class lecture_weeks 실측·와처 기동 → [2]퀴즈/시험/과제 Todoist 등록(중복 판별 후) → [3]SDU 그리드 확인·미완료 주차 watch_week.py 기동. 퀴즈·시험·과제의 응시/제출은 절대 금지(등록까지만).

## 검증된 규칙

- **와처 기동 후 대기 금지**: 기동 확인(로그 tail + video t 전진) 후 즉시 보고·턴 종료. 완료 검증은 다음 실행의 [0]에서 서버 진도율로. `terminal()` 긴 sleep은 400초 이하로 나눠 잠들 것(420초+ 타임아웃 잦음).
- **기간만료 항목은 재생 무의미**: 출석인정기간 지난 항목은 재생·#close_ 정산이 돼도 서버 학습시간 0 유지("기간내 학습시간"만 집계). 크론은 출석인정기간이 남아있는 항목만 와처 대상으로.
- **전과목 스윕 스크립트**: `scripts/morning_sweep_online.mjs` — 정규과목 주차탭 전체 순회, 항목별 진도/기간 파싱, 주차탭 없는 과목 자동 스킵("조회할 자료가 없습니다" = 온라인강의 0건 정상).
- **와처 재시작 패턴**: 이전 와처가 중간에 죽었으면 PID kill 후 `_r2` 복제판(상태/로그/쿠키 파일명 분리)으로 재시작 — viewGo 이어보기로 정상 재개되고 종료 후 서버 재조회로 100% 정산 확인.
- **SDU 2단계 인증은 사용자 상주 세션에서 해결**: 크론/헤드리스는 폰 승인 요청 화면까지만 도달 가능하고 푸시 승인은 사람 손이 필요하다 — 크론 보고는 "SDU 재로그인 필요(폰 승인)" 고정. 사용자가 재로그인을 요청한 세션에서 sdu-lms-lecture-ops 타이핑 시퀀스로 로그인하면 2단계 푸시가 폰으로 가고, 승인 즉시 콜백 → 세션이 클론 프로필에 유지돼 다음 크론부터 자동 점검된다. 재로그인 성공 시 그 세션에서 곧바로 lecture_chapter 그리드 → 미완료 주차 watch_week.py 기동까지 마칠 것(기간 표기는 14:00 경계, 퀴즈 마감은 13:59:59 주의).
- **/usr/bin/python3만 websocket-client 보유** — watch_week.py 계열 실행은 반드시 `/usr/bin/python3`. 스크립트 위치는 스킬 디렉터리(`~/.hermes/skills/sdu-lms-lecture-ops/scripts/`).

## 9222 클론 크롬 재기동 레시피 (크론 새벽, X 서버 없을 때)
1. `Xvfb :9 -screen 0 1920x1080x24` 백그라운드(persist) — 헤드리스 셸에선 DISPLAY 미지정이라 크롬이 "Missing X server"로 즉사
2. `rm -f ~/.config/google-chrome-hermes-clone/Singleton*` (이전 비정상 종료 잔여 Lock이 있으면 재기동 실패)
3. `env DISPLAY=:9 google-chrome --user-data-dir=/home/pinion/.config/google-chrome-hermes-clone --remote-debugging-port=9222 '--remote-allow-origins=*' --no-first-run --no-default-browser-check` 백그라운드(persist) — **`--remote-allow-origins=*` 반드시 따옴표**: 백그라운드 셸이 zsh이라 벗기면 글롭 no-match로 즉사. 이 플래그 없으면 websocket 핸드셰이크 403
4. 검증: `curl http://127.0.0.1:9222/json/version` + 탭 websocket은 `webSocketDebuggerUrl` 키(9223 ZCode 프로필과 달리 `webSocketUrl` 아님)

## Todoist 등록 (td CLI 파손 대응)

- **td CLI 전면 파손**: `td today/upcoming/task list` 전부 `Cannot read properties of undefined (reading 'map')` — Todoist REST v2 폐기로 td 1.20.0이 깨짐. **대체: API 직접 호출** — 토큰은 `~/.config/todoist-cli/config.json`의 `api_token`, 조회 `GET https://api.todoist.com/api/v1/tasks`, 응답은 `{results:[...]}` 래핑. 등록 `POST https://api.todoist.com/api/v1/tasks` (body: `{"content":..., "due_date":"YYYY-MM-DD"}`). 검증은 응답 JSON의 id로 — "Created 문자열 확인" 방식은 무효.
- 중복 판별: 조회 결과에서 content에 과목명+항목명이 포함된 태스크가 있으면 재등록하지 않는다.
- **완료 처리(과제 제출 후 할일 닫기)**: `POST /api/v1/tasks/<id>/close` — 성공은 HTTP 204(빈 body). 완료 검증은 **활성 목록 `GET /api/v1/tasks`에서 해당 content가 사라졌는지**로 판정할 것: 단건 `GET /tasks/<id>`는 완료 후에도 `is_completed: None`을 반환해 신뢰 불가하고, `tasks/filter?query=`는 한글 쿼리를 INVALID_SEARCH_QUERY로 거부한다.
