---
name: eclass-cli
description: 한국공학대학교 e-Class를 CLI로 과제확인/제출, 강의자료 조회/다운로드, 교수정보, 수강과목을 관리하는 도구를 사용할 때 참고하는 사용 스킬
---

# eclass-cli Skill

## 목적
`eclass-cli`를 이용해 한국공학대학교 e-Class(ilos)에서 다음 작업을 수행한다.
- 수강과목 목록 조회 / 과목 상세(교수정보, 평가방법, 주차별 계획) 조회
- 과제 목록 조회 (과목 필터링, JSON 출력)
- 과제 상세 조회 (제출방식, 마감일, 배점, 본문, 첨부파일)
- 과제 제출 (파일 첨부, TinyMCE 본문 이미지 임베딩)
- 강의자료 목록 조회 / 첨부파일 다운로드

## 실행 원칙
- 로컬 클론에서 직접 실행 우선 (npm 배포본이 최신 상태보다 뒤처질 수 있음).
- 로컬 클론: `~/work/eclass-cli`
- 빌드 후 실행: `cd ~/work/eclass-cli && pnpm build && node dist/src/cli.js <command>`
- 설정파일: `~/.eclass-cli/config.json` (`{"id":"학번","pw":"비밀번호"}`)
- 환경변수 오버라이드: `ECLASS_ID`, `ECLASS_PW`
- 모든 목록 명령에 `--json` 플래그 지원
- GitHub: `pinion05/eclass-cli`

## 설정

### 설정파일 (`~/.eclass-cli/config.json`)
```json
{
  "id": "학번",
  "pw": "비밀번호"
}
```
빈값 기본이며, 사용자가 직접 채우는 방식. 환경변수로 오버라이드 가능.

## 기본 명령

### 수강과목
```bash
node dist/src/cli.js course ls              # 수강과목 목록
node dist/src/cli.js course show 딥러닝     # 과목 상세 (교수정보 포함)
node dist/src/cli.js course show 딥러닝 --json
```

### 과제
```bash
node dist/src/cli.js assignment ls                    # 전체 과제
node dist/src/cli.js assignment ls --course 딥러닝     # 과목 필터
node dist/src/cli.js assignment ls --json             # JSON 출력
node dist/src/cli.js assignment submit <RT_SEQ> --file <경로>   # 파일 제출
node dist/src/cli.js assignment submit <RT_SEQ> --file <경로> --image <이미지>  # 파일+이미지
node dist/src/cli.js assignment submit <RT_SEQ> -t "<본문>" --file a.jpg --file b.jpg  # 본문+다중파일
```

### 강의자료
```bash
node dist/src/cli.js material ls --course 산업보안      # 강의자료 목록
node dist/src/cli.js material ls --course 산업보안 --json
node dist/src/cli.js material download <ARTL_NUM> -c <과목명> -o <저장경로>   # 다운로드 (과목명 필수!)
```

## 과목 공지사항 조회 (CLI 전용 명령 없음)
과목별 휴강·시간변경·팀편성 공지는 대학 게시판이 아니라 강의실 안 공지게시판에만 올라온다 — 휴강 확인 요청 시 반드시 여기까지 봐야 한다.
1. `enterCourseRoom(kjkey)` 후 `getHtml('https://eclass.tukorea.ac.kr/ilos/st/course/notice_list.acl')`
2. 목록 링크는 `pageMove('/ilos/st/course/notice_view_form.acl?ARTL_NUM=...')` onclick 형태다 — `goNoticeView` 류 정규식으로 잡으면 0건으로 오탐한다. 공지가 실제로 0건이면 ~759바이트 빈 목록 HTML이 정상 응답이다.
3. 본문: `getHtml('.../ilos/st/course/notice_view_form.acl?ARTL_NUM=<seq>')` — 본문은 스크립트 제거 후 태그→개행 변환으로 충분히 읽힌다.
재사용 스크립트: `scripts/course_notice_dump.mjs` (수강 과목 전체 공지 목록 일괄 덤프), `scripts/notice_view_dump.mjs` (ARTL_NUM 본문 조회 — kjkey·seq 상수만 교체)

## 비정규과목·법정의무교육 조회 (CLI에 전용 명령 없음)
`course ls`는 정규과목(KJ_KEY `A` 시작)만 반환한다. 법정의무교육(연구실안전교육·통합폭력예방교육·스마트폰과의존 예방교육 등)은 비정규과목(KJ_KEY `N` 시작)으로 배정되며 전용 CLI 명령이 없다 → BrowserClient로 메인 페이지를 직접 긁어서 확인한다.

검증된 절차(2026-09 실측):
1. `launch()` → `login(config)` 후 `getHtml('https://eclass.tukorea.ac.kr/ilos/main/main_form.acl')`
2. 정규식 추출: `eclassRoom\('(N\w+)'\); return false;"\s*title="([^"]+)"` → kjkey+과목명, 그 위치 이후 첫 `20\d\d\.\d\d\.\d+~20\d\d\.\d\d\.\d+` 매치가 수강기간
3. 재사용 스크립트(`~/work/eclass-cli/scripts/`에 이미 있음): `scan_nonregular.mjs` (목록 JSON), `nonreg_status.mjs <kjkey...>` (강의실 진입→online_list 진도율·학습내역), `nonreg_detail.mjs <kjkey...>` (항목당 학습시간/출석인정시간 상세 — 전체 100% 미만일 때 어느 항목이 얼마나 남았는지 진단), `nonreg_viewgo_dump.mjs <kjkey...>` (viewGo 풀 인자), `nonreg_week_click.mjs`/`nonreg_week_args.mjs` (주차 탭 클릭→주차별 인자)

pitfall:
- `getHtml()`은 **전체 URL** 필요 — `/ilos/...` 경로만 넘기면 "Cannot navigate to invalid URL". 항상 `https://eclass.${university}` prefix
- 애드혹 .mjs 스크립트는 반드시 `~/work/eclass-cli/` 안에 둘 것 — 밖(/tmp 등)에 두면 저장소 node_modules(cheerio 등) 해석 실패(ERR_MODULE_NOT_FOUND)
- 애드혹 BrowserClient import 경로는 `'../dist/src/transports/browser-client.js'` — 빌드 출력은 dist/src 아래에 있고 `./out/...`은 존재하지 않아 ERR_MODULE_NOT_FOUND로 실패한다
- `login()`의 `page.waitForURL` 타임아웃은 간헐적으로 터진다(서버 지연) — 몇 초 뒤 재실행하면 통과한다. 재시도까지 실패 시에만 세션 만료·설정 문제를 의심할 것.

상세 HTML 구조·2026-2학기 실측 스냅샷 → `references/nonregular-courses.md`

법정의무교육 **자동수강(와처)**: ilos 출석 추적 엔드포인트(hisno/at/time)와 와처 루프 절차는 `korean-lms-course-autoplay` 스킬의 `references/tukorea-eclass-autoplay.md` 참조.

## 정규과목 온라인강의 자동수강 + 영상 덤프 ("영상 다운받아서 스크립트"류 요청, 2026-09 검증)
정규과목(A KJ_KEY)도 비정규 와처와 동일 흐름으로 수강 가능 — 차이는 강의실 진입이 `enterCourseRoom(kjkey)`(BrowserClient 메서드)이라는 것뿐. 재사용 스크립트: `scripts/bp_online_dump.mjs <kjkey> <out.html>` (online_list 덤프+viewGo 인자·진도 파싱), `scripts/bp_watch.mjs` (상단 COURSE/ITEMS/ED_DT 상수만 바꿔 재사용; 재생 1.0x muted → 항목마다 `#close_` 정산 → 최종 진도 `/tmp/bp_final_progress.txt`).
- **영상 원본 URL**: 재생 개시 10초 후 iframe에서 `performance.getEntriesByType('resource')`의 `.m3u8/.mp4` 필터로 캡처 (playlist.m3u8 우선). 세션 쿠키는 `page.context().cookies()`를 JSON 저장.
- **다운로드는 와처와 병렬 폴러**: 와처가 항목을 넘어갈 때 `/tmp/bp_video_urls.json`이 덮어써지므로, 파이썬 폴러가 와처 상태 파일을 보다가 항목 바뀜을 감지하면 그 순간 URL을 항목별 저장 + `ffmpeg -headers "Cookie: ..." -i <m3u8> -c copy -bsf:a aac_adtstoasc out.mp4` 즉시 실행(와처 재생과 무관하게 HLS에서 독립 다운로드됨). 41분 3차시 → 76MB 전부 검증.
- **전사 병렬화**: 파일 뜨는 대로 whisper(turbo int8) 백그라운드 전사를 개시해 와처 종료와 동시에 스크립트 3개 전부 확보 가능. CPU 경합으로 전사가 1.5~2x 느려져도 총 소요는 와처 재생시간이 상한.
- 주차별 항목 진단(어느 주차·항목이 몇 % 남았는지, 출석인정기간 만료 여부): `scripts/hci_week4_check.mjs` (주차탭 클릭→학습내역 덤프). 교차검증: 주차 박스 `wb-status`의 `chk_gray/chk_green` + `x/y` 카운트, 상단 '나의진도율' 백분율로 서로 일치하는지 본다. 스윕 리포트의 [미완료] 중 기간만료 항목은 재생으로 복구 불가(아래 크론 노트) — 발견 즉시 사용자에게 최우선 보고 항목.
- 온라인강의 과제함 항목(`category: lecture_weeks`, seq가 작은 정수)은 `assignment show`가 빈 본문을 돌려주는 게 정상 — 수강 자체가 과제. 실제 지시는 영상 스크립트+주차 PPT의 일시정지 미션에 있다.
- **크론 세션에서 와처 대기 금지**: cron 세션은 claim stale bound(약 2시간)으로 강제 종료된다. 와처 종료를 세션 안에서 sleep/폴링으로 기다리면 API 호출 0 상태로 bound 초과 → 'wedged' error 판정(작업 자체는 완료돼도). 와처는 background+notify 기동 직후 보고하고 즉시 턴을 끊고, 완료 검증은 다음 실행의 continuity 단계에서 서버 진도율로 한다.
- **와처 생존 확인에 `pgrep -f <패턴>` 금지**: 폴링용 셸 명령 자신이 그 패턴에 매칭돼 이미 죽은 와처도 "ALIVE"로 오탐한다. 생존 판정은 ① 상태파일 `ts`·로그 마지막 라인 시각이 현재 시각과 폴링 주기 2배 이내인지 ② `kill -0 <PID>` 로 할 것. 와처가 외부에서 죽으면 상태 파일 갱신이 멈춘다 — 이때 떠있는 프로세스의 args(`ps -o args= -p <pid>`)를 봐서 누구(본 세션 vs 크론 에이전트)가 재기동한 와처인지부터 판별하라. 과거 백그라운드 프로세스의 "completed" 알림은 뒤늦게 배달되므로 현재 생존 판정 근거로 쓰지 않는다.
- 비정규 와처 스크립트: 단일 과목=`scripts/safety_watch.mjs`, 법정교육 여러 과목 한 번에=`scripts/edupolicy_watch2.mjs` (헤드리스 BrowserClient, 음소거 1.0x 순차 재생, 항목마다 강의실 재진입, 재생 완료 후 항목마다 `#close_` 출석 정산). 재생만 완료돼 진도 100% 미만인 항목의 정산=`scripts/edupolicy_topup.mjs`. 과목별 viewGo item_id 실측 테이블은 `korean-lms-course-autoplay` 스킬의 `references/nonregular-item-ids.md`.

## ⚠️ 강의자료 다운로드 주의사항 (핵심)

### 1. download 시 `-c/--course` 과목명 필수
상세페이지(`lecture_material_view_form.acl`)는 코스룸 세션 컨텍스트가 있어야 정상 응답한다.
과목명 없이 download 호출 → 빈 HTML → FILE_SEQ 추출 실패.

**반드시 과목명 지정:**
```bash
# 올바른 예
node dist/src/cli.js material download 6729347 -c 산업보안 -o /tmp/downloads/

# 잘못된 예 (빈 HTML 반환)
node dist/src/cli.js material download 6729347
```

### 2. artlNum 정규식 버그 (수정됨)
`material ls`의 artlNum 추출 정규식이 `&`를 구분자로 인식하지 못해 `6729347&SCH_KEY=&SCH_VALUE=...` 처럼 URL 파라미터까지 캡처하는 버그가 있었다. 정규식에 `&` 추가로 수정됨 (`src/domain/services/material-service.ts` 라인 70 근처).

### 3. 다운로드 경로 2가지 패턴
e-Class 강의자료 첨부파일 다운로드는 페이지 구조에 따라 두 가지 패턴이 존재한다:

- **패턴 A (직접 링크)**: `<a href="/ilos/co/efile_download.acl?FILE_SEQ=...">` — 가장 안정적. `download()` 함수에서 우선 시도.
- **패턴 B (downloadClick onclick)**: 레거시 패턴. `downloadClick()` 함수 인자에서 FILE_GROUP_ID 추출 후 `efile_list.acl` POST로 파일 목록 조회.

`download()`는 패턴 A를 먼저 시도하고, 실패시 패턴 B로 폴백한다.

### 4. 다운로드 파일명 추출
직접 링크의 `<a>` 텍스트에서 파일명+크기가 함께 나온다 (예: `진술조서.hwp (48.5KB)`). 정규식 `/^(.+?)\s*\(\d/` 로 파일명만 분리.

## 교수 연락처/개인정보 저장 분리
- `course show`로 교수 email 획득 가능하지만, 사용자가 **Hermes memory에 저장하지 말라고 명시**한 경우가 있음.
- 교수 연락처·개인정보는 **Honcho에만** 저장 (`honcho_conclude`).
- Hermes memory(`memory` tool)에는 넣지 말 것. 사용자가 삭제 요청하면 즉시 `memory remove`.

## 과목 전체 스윕 + 오늘 수업 프리뷰
"OO 과목 쑥 훑어보고 오늘 수업 내용 프리뷰해줘"류 요청의 절차 (아래 과제 파악 절차의 상위 세트):
1. `date`로 오늘 요일·시각 확인 → `course ls --json`으로 과목명 확정. time 필드와 대조해 오늘이 수업일/수업 직전인지 확인.
2. `course show <과목명> --json` → overview·grading(평가비중; 시험 비중이 크면 로드맵 중심으로 정리).
3. `material ls --course <과목명> --json` → **publishDate가 가장 최근인 자료 = 오늘/최근 수업 분량**. 업로드 시점은 과목·주차마다 달라(수업 중~종료 후) 조회 시점에 오늘 것이 없어도 이상이 아니다 — 이 경우 아래 '오늘 날짜 수업자료가 아직 업로드 전일 때' 절차로 진행한다.
4. `assignment ls --course <과목명> --json` → 과제 현황(학기 초 `[]`는 정상).
5. 강의자료 전부 다운로드 → ASCII 파일명으로 복사 → PPTX 텍스트 추출(아래 스니펫).
6. `scripts/plan-dump.mjs <kjkey>`로 주차별 로드맵 확보(하단 weeklyPlan 우회 절 참조). `course show`의 email이 null이어도 이 강의계획서 HTML에는 교수 E-mail이 있다.
7. 정리 순서: 과목 개요(교수·시간·교재·평가) → 학기 로드맵(주차↔교재 챕터 매핑) → 오늘 분량 상세(이론 흐름·실습·Lab) → 마지막 슬라이드의 과제/Mini Project 신호는 "과제 공지 가능성"으로 플래그.

### "오늘 날짜 수업자료"가 아직 업로드 전일 때 → 로드맵 기반 예습으로 완성
기다리거나 "없음"으로 보고하지 말고 그 자리에서 예습을 끝낸다:
1. 직전 주차 최신 자료를 다운로드해 흐름을 파악하고, `scripts/plan-dump.mjs <kjkey>` 로드맵으로 **오늘 분량을 추정**한다 — 주차 번호≠달력 주차: 공휴일·휴강으로 쉬어간 주는 실제 수업 횟수로 세야 한다(자료 목록 publishDate 간격으로 결강 주 확인). 추정 정확도를 끌어올리는 순서: ① 로드맵 각 주차의 "교재,참고도서: N장" 필드로 주차↔챕터 매핑 작성 ② 챕터 제목 나열이 유명 국내 입문 교재와 일치하는지 대조해 **교재를 특정**(예: 머신러닝 기초→선형회귀→퍼셉트론→다층 퍼셉트론→…→강화학습 = 『모두의 딥러닝』) ③ PPTX `docProps/core.xml`의 `lastModifiedBy`가 교수 실명·사번이 아닌 외부 이메일이면 교재 공식 슬라이드를 거의 그대로 쓰는 과목 — 이때는 교재 해당 장의 절 구조를 예상 강의 골격으로 그대로 쓸 수 있다 ④ 직전 챕터 PPT에서 관찰한 교수 패턴(예: 학습목표→개념→역사→수식→구현 코드→Lab→Summary→Mini Project)을 얹어 오늘 강의 흐름을 완성한다.
2. 추정임을 명시해 보고한다("로드맵 기준 오늘=4주차 5장 퍼셉트론, 오늘 자료는 미업로드").
3. 예습 맛보기 구성(검증된 형태): 지난 주차와의 연결(예: 선형회귀 y=Wx+b → 퍼셉트론은 같은 식+계단함수) → 오늘 핵심 개념 1~2개를 손계산 가능한 예로 **실측 숫자 검증**(예: AND 게이트 w1=w2=1, b=−1.5 네 케이스 출력 — 코드로 돌려 확인, 지어낸 숫자 금지). "~는 불가능하다"류 주장(예: XOR은 단층 퍼셉트론으로 구현 불가)도 파라미터 그리드 탐색으로 실제로 해가 없음을 확인한 뒤 서술한다. → 다음 주차와의 연결 스토리 → 마무리 퀴즈 1문제(간단 변형 문제가 좋다). 3분 안에 읽히는 분량.
4. 수업 종료 후 자료 재조회(자료 업로드+과제 등록 확인)를 제안하고 마친다 — 재조회는 사용자 요청 시 `material ls`부터 다시.

## 과제가 LMS에 없을 때 강의자료로 파악
2학기/계절학기 과목은 개강 전이거나 LMS 과제 등록이 늦을 수 있다.
`assignment ls --course <과목명>`이 `[]`면, 강의자료에서 과제/일정/평가정보를 파악:

0. 과목명 확정부터: 사용자가 말한 과목명은 축약·오기가 흔하다("딥러닝"→딥러닝응용, "AI비즈니스"→비즈니스기획). `course ls --json` 전체에서 유사명 후보를 찾고, "과제 확인" 요청이면 후보 과목 전부 `assignment ls`를 돌려본다.
1. `course show <과목명> --json` → 평가방향(grading), 주차별계획(weeklyPlan) 확인
2. `material ls --course <과목명> --json` → 강의자료 목록. publishDate가 최근(수업 직후)인 자료가 과제 단서다 — 과제는 보통 해당 주차 PPT 안에 명시된다.
3. 각 자료 다운로드: `material download <ARTL_NUM> -c <과목명> -o <경로>/`
4. HWP는 kordoc, PDF는 kordoc/pdfjs로 파싱 → 과제 지시사항/실습내용/발표주제 파악
5. PPTX는 python-pptx 없이 stdlib만으로 텍스트 추출 가능:

```python
import zipfile, re
z = zipfile.ZipFile(path)  # 확장자가 없어도 zip이면 읽힘
slides = sorted([n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)],
                key=lambda n: int(re.search(r"\d+", n).group()))
for s in slides:
    texts = re.findall(r"<a:t>([^<]*)</a:t>", z.read(s).decode("utf-8", "ignore"))
    print(s, " | ".join(t.strip() for t in texts if t.strip()))  # 슬라이드당 한 줄 join으로 덤프해야 흐름이 읽힌다
```

과제 슬라이드는 보통 마지막 부분에 있다("ASSIGNMENT", "이번 주 미션", "첫 과제 & 다음 주 예고" 제목) — 첫 2장과 마지막 3장을 우선 확인.

pitfall — 다운로드 파일명: `material download`는 링크 텍스트를 파일명으로 쓰므로 선행 `-`, 확장자 누락, 인코딩 깨짐이 흔하다. 파싱 전 단순 ASCII 이름으로 복사할 것 — 이때 `mv -- '- 제04장_선형회귀.pptx' ch04.pptx`처럼 `--` 구분자 필수. `--` 없으면 직접 mv는 물론 셸 루프(`for f in *`)까지 선행 `-`를 옵션으로 먹어 실패한다. zipfile은 확장자와 무관하게 읽힌다.

실제 사례 1: 산업보안 과목 — LMS 과제 0건이었으나 강의자료 4개(진술조서 양식, 조사방법 슬라이드, 이론강의 PDF, 판례 PDF)에서 중간고사=조별발표, 평가구조, 주차별 일정을 파악함.
실제 사례 2: 비즈니스기획 과목 — 정규과목 전체 `assignment ls`가 전부 `[]`였으나 당일 업로드된 주차별 PPT 2개의 마지막 슬라이드에서 과제 2종(수업 시 개인발표용 자기소개서·아이디어 노트, LMS 업로드형 관찰 미션)을 파악함. LMS 과제함에 등록 전 기간에도 PPT가 과제의 1차 출처.

pitfall — 과제 등록은 됐는데 `assignment show`의 "내용:"이 비어 있을 때(2026-09 비즈니스기획 실측): LMS 본문(textviewer div)이 실제로 공란이고, 첨부파일도 없을 수 있다. 이때 과제의 실제 지시는 최신 주차 PPT 마지막 슬라이드("이번 주 미션"·"ASSIGNMENT")에 있다. 원문 HTML 확인 절차: `enterCourseRoom(kjkey)` 후 `getHtml('https://eclass.tukorea.ac.kr/ilos/st/course/report_view_form.acl?RT_SEQ=<seq>')` — 다른 경로(ilof/..., /ilos/st/report/...)는 전부 404. 재사용 스크립트: `scripts/assignment-dump.mjs` (인자: kjkey seq → /tmp/assignment_<seq>.html 덤프).

## 과제 정의 확정 절차 ("과제가 정확히 뭐야?"·"더 확실하게" 요청 시)
1. **과제함 원문을 그 자리에서 재덤프**한다 — 본문·첨부는 마감 전 언제든 추가될 수 있어, 며칠 전 덤프 결과를 재사용하면 추가된 지시를 놓친다.
2. **지시한 주차 PPT 미션 슬라이드를 원문 그대로 스크랩**해 전달한다(사용자가 원문 확인을 원함) — zipfile 슬라이드 덤프의 `<a:t>` 전체를 순서 그대로.
3. **이후 주차 PPT까지 뒤져 과제의 실사용처를 교차확인**한다 — 다음 주차 PPT의 "오늘 준비물"·"발표 방법" 슬라이드가 해당 결과물의 이중 용도(제출+수업 발표)를 밝혀주고, 신규 과제 지시가 추가됐는지도 여기서 확인된다.
4. **마감 임박 보고는 그 턴의 `date` 출력으로 오늘 날짜·남은 시간을 새로 계산**한다 — 이전 턴에서 계산한 D-N/남은 시간을 재사용하면 하루 이상 어긋난 카운트다운을 그대로 전달하게 된다(마감 당일인데 "2일 남음"으로 오보한 사례 있음).
5. /tmp 작업 파일(다운로드 PPT 등)은 24시간 프루닝된다 — 며칠 뒤 같은 자료가 필요하면 캐시 경로를 믿지 말고 `material download`부터 다시 한다.

## 사례 탐색형 과제("불편→성공 사례 찾아오기")의 후보 선정
- 교수가 주차 PPT 예시로 이미 쓴 서비스(사례 해부 표 등)는 피한다 — 다른 학생과 겹칠 확률이 가장 높다. 지시문에 국내 한정이 없으면 해외 사례도 유효하고, 사용자도 "안 겹치는 걸로"를 기본 선호로 지시한 바 있다.
- 후보를 제안하기 전에 **출처 기사가 실존하는지 뉴스 검색(`nsearch news <키워드>`)으로 검증**한다 — 출처가 필수 조건인 과제에서 존재 확인 안 된 출처를 제안하면 초안 단계에서 재작업이 생긴다. 창업자 인터뷰 기사가 스크랩 원문 인용에 가장 좋다.
- 후보 제안 형식(검증됨): 각 후보에 불편 한 문장 / 해결 한 문장 / 실존 출처(언론사+기사제목+URL) / 경쟁 2개(비슷·다른·내 선택 이유)까지 **원문 지시 항목 전부를 채운 완성형**으로 제시한다 — 후보 이름만 나열하면 사용자가 선택한 뒤 다시 팩트 조사 왕복이 생긴다.

## `--file` vs `--image` vs `--text` 차이
- `--file`: 첨부파일 (Plupload multipart POST) — **다중 지원** (`--file a.pdf --file b.docx`)
- `--image`: 본문 에디터에 인라인 이미지 임베딩 (클릭 인터랙션 방식) — **다중 지원**
- `--text`/`-t`: 본문 내용 (미지정 시 학번 자동 입력). 값은 TinyMCE `setContent()`에 HTML로 전달됨
- 섞어 쓰면 순차 실행: 파일 업로드 → 이미지 임베딩 → 제출

## 과제 제출 시 주의
- 본문(textarea)이 비어있으면 제출 불가 → `-t/--text` 미지정 시 학번(ID)이 자동 입력된다. 실제 과제 내용(캡션·목격담 등)은 반드시 `-t`로.
- `-t` 값은 TinyMCE `setContent()`에 **HTML로** 전달된다 — 마크다운 `**`는 리터럴로 남고, 일반 텍스트 개행은 렌더 시 붙어 보일 수 있다. 포맷이 중요하면 `<p>`/`<br>` 태그로 작성할 것.
- 제출 후 제출된 파일 목록 + 제출 시각 재확인 출력
- **`--submit` 같은 확인 플래그는 존재하지 않는다 — `assignment submit` 실행 자체가 곧 제출이다.** 사용자의 명시적 승인(예: "제출")을 받은 후에만 실행하고, 그 전까지는 최종본(본문 전문+첨부 목록)을 채팅에 보여주고 대기한다.
- 제출 후 검증: `scripts/assignment-dump.mjs <kjkey> <seq>`로 페이지를 다시 덤프해 본문 핵심 문장·첨부 파일명이 실제 반영됐는지 grep으로 확인 — 도구의 성공 출력만으로 반영 여부를 단정하지 않는다. 제출일시는 `제출일시` 셀 근처(`2026.09.18 오후 10:01:09` 패턴)에서, 첨부 확인은 `efile_download.acl?FILE_SEQ=...&CONTENT_SEQ=...` 링크+파일명에서 읽는다. 내 제출의 CONTENT_SEQ도 이 efile_download 링크에서 얻는다.
- **PDF 시안 제출물도 ASCII 파일명으로**: 시안을 최종 제출 파일로 쓸 때도 `/tmp/bp/bp_week3_parkmyeongcheol.pdf`식 ASCII명 사본을 만들어 `-file`로 올린다 — 시안 산출물명(`A_minimal.pdf` 등) 그대로 올려도 되지만 과목_이름 컨벤션을 젹하면 제출 목록 grep이 쉬워진다. 제출 직후 dump에서 내 첨부 파일명+크기가 서버에 뜨는지 확인한다.
- 사용자가 "스크린샷까지" 요청하면(제출 증빙): `scripts/assignment-screenshot.mjs <kjkey> <seq> <contentSeq>` — 실세션으로 상세페이지를 렌더링해 fullPage+viewport PNG를 뽑아 `MEDIA:`로 전송. HTML 덤프와 스크린샷을 함께 주면 텍스트 판독은 HTML 기준으로 한다.

## 관찰 미션형 과제(사진+캡션) Discord→LMS 제출 워크플로
"불편 사진 N장 채집 + 캡션/태그"류 과제(주차 관찰 미션 등)의 전체 절차:
1. Discord 첨부 이미지는 `/home/pinion/.hermes/cache/images/img_<hash>.<ext>`로 저장된다 — mtime 최신 파일이 이번 메시지의 것. **사용자가 말한 장수와 실제 도착 파일 수를 대조**하고, 적으면 첨부 누락이므로 빠진 사진만 재전송 요청한다.
2. 제출 직전 캐시에서 작업 디렉터리(`/tmp/...`)로 복사하며 **ASCII 파일명**(`photo1_elevator.jpg` 식)을 부여한다 — LMS 업로드 페이지가 한글 파일명을 교내 방화벽 차단 사유로 명시하고 있으며, 제출 후 grep 검증도 쉬워진다.
3. 캡션 초안: vision_analyze(400 지속 시 GLM-4.5V 직접호출 — 위 슬라이드 이미지 분석 절 참조)로 **장면 식별**만 하고, 캡션의 불편 포인트는 **사용자가 텍스트로 설명한 내용을 우선**한다 — VLM 해석(예: 손잡이를 문으로 오인)으로 사용자 설명을 덮어쓰면 교정 왕복이 생긴다. 태그(`#시간`/`#수고`/`#감정` 등)는 과제 지시 슬라이드의 태그 체계를 그대로 따른다.
4. 최종본(본문 전문 + 첨부 목록)을 채팅에 그대로 출력해 승인 대기 → 확인 답변 후에만 `submit` 실행.
5. 사진은 `-f`로 전부 첨부, 캡션·목격담은 `-t` 본문에 넣는다. 제출 후 dump 재검증 필수.

## 과제 산출물 PPT 생성
"PPT로 만들어줘" 요청(제출은 이미 끝났고 개인 소장·발표용 산출물)의 절차:
1. **환경**: python-pptx는 시스템 python이 PEP 668로 거부한다 — `~/ml-study/bin/python -m pip install python-pptx`로 설치(이 venv에는 pip 심볼릭링크가 없어 반드시 `-m pip`). 실행도 `~/ml-study/bin/python`.
2. **스타일**: 과제가 나온 교수의 주차 PPT에서 팔레트·폰트 톤을 그대로 계승(예: 다크 배경+레드 포인트+Pretendard). 과제 지시 슬라이드의 섹션 라벨(MISSION/PHOTO/TAKEAWAY 류)을 재사용하면 교수 눈에 익은 구조가 된다.
3. **사진 포함 슬라이드**: `PIL`로 contain-fit 좌표 계산 후 삽입(왜곡 방지), 캡션 카드를 우측에 배치하는 좌우 분할이 검증됨.
4. **텍스트 검증은 pptx 직추출로**: `python-pptx`로 `shape.text_frame.text`를 전수 덤프해 최종 확인 — 렌더링 이미지의 VLM/OCR 판독은 저해상도 한글을 심하게 오독하므로(패쇄망→패배망 등) 레이아웃 확인용으로만 쓰고 텍스트 정합 검사에 쓰지 않는다. per-item 텍스트(사진별 WHY 설명 등)가 한 값으로 공유돼 전 슬라이드에 복제되는 버그는 직추출로만 잡힌다.
5. **렌더 QA**: `soffice --headless --convert-to pdf` → `pdftoppm -png -r 60` → GLM-4.5V로 잘림/겹침 확인. 전송은 PPTX와 PDF 둘 다(교수 PC에 Pretendard 없으면 폰트 대체됨).

### 산출물 말투 = 구어체
사용자는 과제 산출물 문장에서 격식체·AI티를 싫어한다("말투 휴머나이저 돌려줘"). 문서 초안부터 구어체로 쓰고, 이미 쓴 문장이면 다음 기준으로 고친다: `~했습니다`→`~해봤습니다`, 명사형 종결(`사용 불가`, `반복해서 발생하는 상황`)→풀어쓴 구어(`못 쓴다`, `매일 반복되는 일이다`), `~에게 ~를 맡긴다` 같은 번역투는 `~한테 맡긴다`. 요약 보고 채팅은 아니고 **산출물 본문**에 적용되는 규칙.

### 문서형 산출물 시안 = 컨펌 사이클(사용자 지정 워크플로)
사용자는 산출물 디자인을 직접 고른다 — 에이전트가 하나의 "완성본"을 바로 만들지 않는다:
1. **동일 내용·서로 다른 스타일 3종**(예: 미니멀 / 브랜드 카드 / 보고서형)을 **병렬 위임(delegate_task 3건)**으로 제작해 전부 이미지로 전송한다. 각 위임 context에 공통 사양(전체 텍스트·A4 1장·폰트·말투 규칙)을 동일하게 주고 디자인 방향만 다르게 한다.
2. 사용자가 하나를 선택하면(응답이 "1"이면 목록의 첫 번째 안이다) **선택안을 기준으로 변형 3종을 다시 포크**해 다음 컨펌을 돌린다. 다만 마감 임박 등으로 사용자가 선택과 동시에 "제출해"라고 지시하면 포크 없이 곧바로 제출 플로우로 간다.
3. 승인된 시안의 제출은 기존 규칙대로 최종본 전문 출력 → 명시적 승인 → submit.

**A4 1장 시안 파이프라인(검증됨)**: HTML → `google-chrome --headless=new --no-sandbox --disable-gpu --print-to-pdf=<out>.pdf --no-pdf-header-footer file://<html>` → `pdfinfo`로 Pages==1 게이트(2페이지면 내용 축소 후 재렌더) → `pdftoppm -png -r 110 -singlefile` 미리보기를 MEDIA로 전송. 한글 폰트는 fontconfig의 NanumGothic 계열을 CSS에 지정. HTML→PDF 크롬 렌더는 시작 전 스텁 1회로 렌더 환경을 먼저 검증한다.
- 병렬 위임 검증 게이트(부모가 직접): 3종 전부 `pdfinfo` Pages==1·A4 크기 확인 + `pdftotext`로 지정 문장(서비스명·출처 등) 포함 확인 후 전송 — 위임의 자체 검증 보고만 믿고 보내지 않는다.

## 학기/과목 컨텍스트
- KJ_KEY 형식: 정규=`A{연도}{학기}C...` (예: `A20262CAI3200301` = 2026년 2학기), 비정규(법정의무교육 등)=`N{연도}B...` (예: `N2026B2608180501`)
- 2학기 과목(KJ_KEY에 `2`)은 1학기 과제 목록에 안 나타남 → `course ls`로 전체 과목 확인 후 `assignment ls --course <과목명>`으로 필터.
- 새 학기 과목은 개강 전이면 과제가 0건일 수 있음.

### 주차별 계획(weeklyPlan)이 빈 배열일 때
`course show`의 weeklyPlan은 `plan_form.acl`을 **강의실 세션 없이** 직접 호출하므로 대부분 `[]`로 반환된다(메인페이지로 리다이렉트됨). 검증된 우회법:
1. `enterCourseRoom(kjkey)`로 강의실 진입 **후** `getHtml('https://eclass.tukorea.ac.kr/ilos/st/course/plan_form.acl')` 호출 → 세션 컨텍스트가 있어야 정상 응답
2. 재사용 스크립트: `~/work/eclass-cli/scripts/plan-dump.mjs` (kjkey 인자) → `/tmp/plan.html` 저장
3. HTML에서 "주차계획서" 섹션 텍스트 파싱. 각 주차 = 주요학습내용/학습목표/교재,참고도서

## 디버깅 패턴
강의자료 다운로드 실패 시 디버깅 순서:
1. `material ls --course <과목명> --json`으로 artlNum 확인 (깨끗한 숫자인지)
2. `material download <artlNum> -c <과목명>`으로 재시도
3. 여전히 실패 시, 상세페이지 HTML 직접 확인:
   - `client.enterCourseRoom(kjkey)` 후 `getHtml(lecture_material_view_form.acl?ARTL_NUM=...)` 
   - hidden inputs (`ky`, `ud`, `CONTENT_SEQ`) 존재 확인
   - `a[href*="efile_download"]` 또는 `[onclick*="downloadClick"]` 존재 확인
4. HWP 파일 파싱은 `kordoc` 스킬 사용

## 슬라이드 이미지(그림 위주 슬라이드) 분석
텍스트 덤프에서 특정 슬라이드가 제목뿐이면 이미지 슬라이드다. "N페이지 설명해줘" 요청 시:

수업 진행 중 실시간 요청("지금 수업에서 OO 하고 있음")이면 고품질 애니메이션 대신 스틸 이미지 한 장+핵심 요약으로 즉시 응답한다 — 애니메이션·심화는 사후 요청 시에만.

1. **어느 PPT 파일인지 먼저 확정** — 강의자료는 여러 챕터 PPT가 병존하므로 페이지 번호만으로 파일이 특정되지 않는다. 앞 대화에 받아둔 파일이 없으면 material ls부터 다시.
1a. **수업 중 사용자가 교수 화면의 문장을 인용해 현재 슬라이드를 특정해줄 때**(예: `현재 강의페이지 = "..." 텍스트가 포함된 페이지`): ① `material ls` 재조회(수업 중 방금 업로드됐을 수 있음) → ② 보유 PPTX 전부에서 해당 텍스트 grep(zipfile 슬라이드 XML 덤프 재사용) → ③ 둘 다 없으면 **아직 미업로드된 오늘 챕터 슬라이드**다. 이때는 로드맵으로 챕터를 확정하고 교재 해당 장의 구조 기준으로 핵심 요약+스틸 이미지를 만들어 즉시 응답하되, "오늘 파일은 수업 후 업로드 예정"임을 명시한다. 갖고 있지 않은 파일의 슬라이드 내용을 확정된 사실처럼 서술하지 않는다(내용은 교재 챕터 구조 기반 추정임을 밝힌다). 사용자의 후속 메시지가 "ppt임"·"오늘수업 ppt" 같은 축약이면 = PPT 다운로드 요청이므로 material ls 재조회 결과(없으면 미업로드 상태)를 그대로 보고하고 수업 후 재조회를 제안한다.
2. `ppt/slides/_rels/slideN.xml.rels`에서 `Target="../media/<file>"` 전부 추출 → `ppt/media/<file>`을 임시 디렉터리에 꺼낸다. 슬라이드 하나에 이미지가 여러 개일 수 있다(표 이미지+그래프 이미지 등) — 전부 분석해 조합.
3. vision_analyze 실패(400 반복 등) 시 GLM-4.5V 직접 호출로 대체: 키는 `~/.hermes/.env`의 `GLM_API_KEY`(주의: `ZAI_API_KEY` 행은 주석이며 auth.json credential_pool에는 fingerprint만 있다) → `POST https://api.z.ai/api/paas/v4/chat/completions`, model `glm-4.5v`, 이미지는 ≤640px JPEG base64 data URL. vision_analyze 동일 인자 연속 실패 시 재시도하지 말고 즉시 이 경로로 전환.
4. 설명 구성: 이미지 내용(표·그래프 수치) + 그 슬라이드가 단원 흐름에서 하는 역할(앞뒤 슬라이드와 연결) + 필요시 슬라이드 원본 이미지를 `MEDIA:`로 첨부.
5. **수식 이미지 읽기**: GLM-4.5V에 "수식을 LaTeX으로 정확히 읽어줘"로 지시하면 손실함수·최소제곱법 공식 등이 정확히 전사된다(800px 썸네일이면 충분). 수식 페이지 설명 요청 시: 전사 → 각 수식을 한국어 문장으로 풀기(기호 나열❌) → "왜 이런 식이 나오는지" 아이디어 1줄 → 앞뒤 슬라이드와의 연결. 이 사용자는 문장 풀이 방식을 요청한다. pitfall — 투명 배경 PNG: PPTX media의 수식 이미지가 P 모드(팔레트+투명)일 수 있는데, VLM에는 검은 빈 이미지로 보여 **교재에 없는 유명 공식을 지어내는 환각**이 발생한다. 읽기 전 반드시 흰 배경 합성 후 JPEG로: `Image.alpha_composite(Image.new("RGBA", im.size, (255,255,255,255)), im.convert("RGBA")).convert("RGB")`, 작은 수식 이미지(폭<600px)는 2배 LANCZOS 업스케일. 판독 결과가 지나치게 일반적이면 빈 이미지를 의심하고 픽셀 비율(`(np.asarray(img)<200).sum()/size`)로 진단.

## 강의자료 기반 그림·애니메이션 생성
"그림 비슷하게 더 데이터 많은 버전", "애니메이션 만들어줘" 요청 시:
1. **matplotlib은 execute_code 샌드박스에 없다** → `terminal()`에서 `~/ml-study/bin/python` heredoc로 실행 (numpy·matplotlib·PIL 모두 있음). 샌드박스에서 import 시도하지 말 것.
2. 원본 그림 스타일(색·마커)을 먼저 vision으로 확인하고 동일 스타일로 재현 + 데이터 수만 증가.
3. GIF: 프레임마다 `ax.clear()` 후 재그리기 → `np.asarray(fig.canvas.buffer_rgba())`를 PIL 프레임으로 append → `frames[0].save(..., save_all=True, append_images=frames[1:], duration=180~250, loop=0)`.
4. **학습 알고리즘 애니메이션은 무난한 초기값(W=0,b=0)으로 시작하면 수렴이 순식간이라 학습 과정이 안 보인다** — 나쁜 초기값(예: W=-2, b=15, 반대 기울기) + 낮은 학습률로 출발해 과정이 눈에 보이게 할 것. 좌측=산점도+모델 직선(제목에 epoch·파라미터), 우측=loss 곡선+현재 위치 점의 2패널 구성이 검증됨.
5. 생성 후 PIL로 중간 프레임 JPEG을 뽑아 GLM-4.5V로 검증(그래프 정상 렌더 여부)하고 `MEDIA:`로 전송. matplotlib 저장 PNG는 RGBA라 JPEG 저장 시 `OSError: cannot write mode RGBA` — 반드시 `.convert("RGB")` 후 저장. GIF 프레임 수는 PIL `n_frames`로 재확인 — 저장 프레임 수와 다르게 읽힐 수 있다. GLM-4.5V가 200 OK인데 content가 빈 문자열로 오는 경우가 있다 — 동일 인자 재시기하지 말고 픽셀 통계 검증으로 대체(경로색·곡면색 픽셀 수가 임계 이상인지 numpy로 확인).
6. **사용자는 GIF보다 영상(MP4) 선호** — GIF로 먼저 보냈으면 "영상으로 보내줘" 재요청이 올 수 있으니 애니메이션은 처음부터 MP4로 만들 것. 절차: PNG 프레임을 `/tmp/.../frames/f%03d.png`로 저장 → `ffmpeg -y -framerate 5 -i frames/f%03d.png -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart out.mp4` (시스템 ffmpeg 있음) → `ffprobe -show_streams`로 codec/h264·해상도·duration·프레임 수 검증 후 `MEDIA:` 전송. fps는 프레임 수/지속시간에 맞춰 조정(5fps=느린 학습 관찰용 적정). **ffmpeg이 프레임 0개로 실패하면 대부분 홀수 폭 문제** — `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2"` 추가(yuv420p는 짝수 치수 요구).
7. **한글 라벨 폰트**: matplotlib 기본 DejaVu Sans는 한글 글리프가 없어 라벨이 깨진다 — 스크립트 상단에서 `fm.fontManager.addfont("/usr/share/fonts/nanum/NanumGothicExtraBold.ttf")` 후 `plt.rc("font", family="NanumGothic"); plt.rc("axes", unicode_minus=False)`. 한글을 쓰는 플롯은 항상 선행.
8. **3D 시각화(다중 회귀·손실 곡면)**: `mpl_toolkits.mplot3d`의 `projection="3d"`. 검증된 구성 = 좌측 3D 산점도+회귀평면(데이터 공간), 우측 손실 곡면+빨간 하강 경로(파라미터 공간) — "같은 학습의 두 뷰"라는 설명이 함께 가야 함. 손실 곡면은 격자 `np.meshgrid` + `plot_surface(cmap="viridis", alpha=0.75)`, 학습 경로는 `ax.plot(pw, pb, pl, "r-")`. 파라미터 3개면 하나(보통 b)를 최적값으로 고정한 2파라미터 단면으로 보여준다. 3D 서피스 렌더는 프레임당 1~2초라 프레임 수를 ~40개로 제한.
9. **실데이터셋 선호**: 사용자는 합성 데이터보다 실제 데이터셋을 선호한다 — 시각화 예제 데이터는 "허깅페이스/사이킷런 실데이터로" 제안이 오면 즉시 전환. `~/ml-study` venv에 `datasets` 없으면 `~/ml-study/bin/python -m pip install datasets`(pip 실행 파일명은 `pip3`라 `-m pip`로 호출). 허깅페이스 데이터셋명이 틀리면 `DatasetNotFoundError` — California Housing은 `sklearn.datasets.fetch_california_housing`이 더 안정적(20,640행, 특징: MedInc·AveRooms 등). 이상치(방수>8 등) 마스크 + 300개 샘플링 후 npz로 캐시.
10. **긴 파이썬 스크립트 전달**: `terminal()`의 heredoc은 내부 `&`·특수문자로 실패할 수 있다 — `printf '%s\n' 'line1' 'line2' ... > script.py && ~/ml-study/bin/python script.py` 형태로 파일 작성 후 실행이 안전하다.
11. **Manim(3Blue1Brown 스타일 고급 애니메이션)**: "더 예쁜 영상 만드는 툴"·수학 개념 설명 영상 등 matplotlib 품질을 넘어서는 요구 시. `~/ml-study` venv에 ManimCommunity manim 설치됨 — 재설치 시 `sudo apt-get install -y pkg-config libpango1.0-dev libcairo2-dev` 후 `~/ml-study/bin/python -m pip install manim` (pkg-config가 pangocairo≥1.30을 못 찾으면 wheel 빌드 단계에서 실패). 렌더: `cd <작업dir> && ~/ml-study/bin/python -m manim -qh --disable_caching scene.py SceneName -o out.mp4` → 출력은 `./media/videos/<스크립트명>/1080p60/out.mp4`, ffprobe로 codec/해상도/duration 검증 후 전송. pitfall: numpy 배열을 진위 평가(`if prev:`)하면 ambiguous truth ValueError — 반드시 `is not None` 비교. 3D 장면(ThreeDScene)은 `set_camera_orientation(phi=70*DEGREES, theta=-50*DEGREES)` + `begin_ambient_camera_rotation(rate≈0.12)` 궤도 회전이 입체감의 핵심. 경사하강 재현 검증 구성: `Surface`(손실 곡면, `checkerboard_colors=[BLUE_D, BLUE_E]`, fill_opacity 0.75) + 노란 `Dot3D`·`Line3D` 세그먼트를 경로마다 누적 재생. matplotlib 대비 렌더 시간이 길어 저해상도(-ql)로 1차 확인 후 -qh로 최종 렌더.
12. **개념 비교 시뮬레이션(지역최소값 탈출, 발산 등)은 렌더 전 수치 검증이 선행 게이트** — "일반 GD는 갇히고 모멘텀은 탈출한다" 같은 교육적 주장을 담은 영상은, 먼저 순수 시뮬레이션으로 학습률·β(모멘텀 계수) 조합을 그리드 탐색해 주장이 실제로 성립하는 조합을 찾은 뒤 그 조합으로만 렌더한다. 검증 없이 렌더하면 탈출이 일어나지 않는 파라미터로 영상이 나와 설명과 화면이 어긋난다. loss 곡선 설계 레시피: 포물선 기저 `a(x−c)²` + 음의 가우시안 우물 `−A·exp(−((x−m)²)/w)` 조합으로 local min을 원하는 위치에 강제하고, 격자 샘플링으로 local/global 최소 위치·barrier 높이를 프린트해 확인(단일 우물로는 local dip이 안 생기는 실수가 흔함). 비교 영상 구성: 좌(실패: 일반 GD)·우(성공: momentum) 동일 곡선·동일 출발점 2패널 + 지역 최소(주황 원)/전역 최소(빨간 별) 마커 + 성공 쪽에는 이동 궤적 trail — 모멘텀 업데이트는 `v = β·v − lr·grad; x += v`.

## 휴일·연휴 주간 "이번 주 수업 해?" 확인 절차 (조취과 재직자)
조기취업형 계약학과 2·3학년은 금 야간+토 종일 수업 구조라 법정공휴일이 겹치는 주(개천절 10/3 등)는 실측 확인이 필수다.
1. `date`로 목표 금/토 요일·공휴일 여부 확인.
2. `course ls --json`으로 시간표 확보 — 요일↔과목↔시간/호수 대응.
3. 학사일정 `https://www.tukorea.ac.kr/haksa/3000/subview.do`에서 해당 주 특이일정(중간고사·행사) 확인.
4. 조기취업학부 게시판 `https://contract.tukorea.ac.kr/bbs/contract/607/artclList.do`에 `개천절`·`공휴일`·`휴강`·`보강` 제목 검색 — 휴강 공지는 "M/D(토) 전체 휴강 + HRD-NET QR체크 X + 셔틀 미운행" 형태. 전년 동일 공휴일 공지는 게시 패턴 참고로만 쓴다(연도마다 다름).
5. 공지가 없으면 과목별 강의실 공지(위 과목 공지사항 조회 절차)까지 확인 — 급한 시간변경 공지는 학부 게시판이 아니라 과목 조교가 강의실 공지로 올린다.
6. 판정: 공휴일 주라도 휴강 공지 미게시면 "시간표상 정상 + 공지 재확인 권장"으로 보고. 확정 근거 없이 휴강이라 단정하지 않는다.

K2web(www.tukorea.ac.kr·contract.tukorea.ac.kr 공통) 게시판 파싱:
- 목록: POST `artclList.do` with `page=N`. 제목 검색은 POST `srchColumn=sj&srchWrd=<단어>` — `page`만 넘기면 검색이 무시돼 결과가 없는 것처럼 보인다.
- 행 단위 파싱은 `<a href=artclView>` 기준 split 후 각 청크에서 `<strong>` 제목·`\d{4}\.\d{2}\.\d{2}` 날짜 추출 — `<tr>` 정규식으로 자르면 날짜가 다음 행으로 흘러 전부 `?`가 된다.
- 본문: artclView URL GET — 스크립트 제거+태그→개행 변환으로 충분. 첨부파일명은 본문 하단 "첨부파일" 근처에 나온다.

## 아침 LMS 크론 운영 노트
- 크론 잡 `lms-morning-lecture-watch`(매일 04:00) 절차·함정·전과목 스윕 스크립트(`scripts/morning_sweep_online.mjs`) 사용법 → `references/morning-cron-ops.md`. 핵심: 기간만료 항목은 재생해도 학습시간 0(와처 대상 ❌), SDU 재로그인은 사용자 상주 세션에서만 가능(성공 시 세션이 클론 프로필에 유지돼 크론 자동 점검 재개), watch_week.py 실행은 `/usr/bin/python3`.
- **SDU 세션 keepalive 크론**(2026-10-02 구축): `~/.hermes/scripts/sdu_keepalive.py` — 6시간마다(`0 */6 * * *`, no_agent) lecture_chapter.asp를 9222 크롬에서 열어 세션 타임아웃을 리셋하고, 로그인 마커(`u192024591013`)로 상태 판정. 정상=빈 stdout(침묵), 만료=`SDU_SESSION_EXPIRED` 알림(재로그인은 폰 승인 필요해 상주 세션 요청으로 안내), 크롬 다운=`SDU_KEEPALIVE_CHROME_DOWN`. 이중 안전망: keepalive가 새어도 새벽 4시 lms-morning-lecture-watch가 Xvfb 재기동 레시피로 자체 복구 시도.

## 참조 파일
- `references/eclass-download-page-structure.md` — 강의자료 다운로드 페이지 HTML 구조, 패턴 A/B 상세, 디버깅 재현 스크립트 패턴, artlNum 정규식 수정 내역

## 기술 스택
- TypeScript + pnpm (ESM)
- Playwright (headless Chromium)
- Commander.js (CLI)
- Cheerio (HTML 파싱)
- Zod (타입 검증)
- BrowserClient: `launch()` → `login(config)` → `enterCourseRoom(kjkey)` 순서 필수

## 프로젝트 구조
```
~/work/eclass-cli/
├── src/
│   ├── cli.ts                    # CLI 진입점
│   ├── commands/                 # course, assignment, material 명령
│   ├── domain/
│   │   ├── models.ts             # Zod 스키마
│   │   └── services/
│   │       ├── course-service.ts
│   │       ├── assignment-service.ts
│   │       └── material-service.ts  # download 로직 (핵심)
│   ├── transports/
│   │   └── browser-client.ts     # Playwright 래퍼 (login, getHtml, downloadFile, enterCourseRoom)
│   ├── config/config.ts          # getConfig() 
│   ├── output/formatters.ts      # printMaterials, outputJson
│   └── runtime/create-app-context.ts  # 의존성 주입
├── dist/                         # 빌드 출력 (pnpm build)
└── package.json                  # type: "module" (ESM)
```
