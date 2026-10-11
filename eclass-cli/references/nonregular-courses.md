# e-Class 비정규과목 (법정의무교육 등) 상세

## 배경
- 법정의무교육(연구실안전·성폭력예방·인권 등)은 정규 수강과목 목록(`course ls`, `course_register_list_form.acl`)에 **안 나온다**.
- 메인 페이지(`/ilos/main/main_form.acl`) 좌측에 비정규과목으로 함께 렌더링된다.

## main_form.acl HTML 구조 (실측)
항목 1개당 패턴:
```html
<li class="term_info">비정규과목</li>
<em class="sub_open" onclick="eclassRoom('N2026B2603300201'); return false;"
    title="[법정의무/인권센터] 2026 통합폭력예방교육 (학부생) 강의실 들어가기"
    kj="N2026B2603300201" kj_auth="S"> ... 과목명 (01) </em>
<span> 2026.04.01~2026.12.31 </span>
```
- kjkey가 `N`으로 시작 = 비정규. 정규과목과 동일하게 `eclassRoom()`으로 코스룸 진입.
- title 속성에 반 구분 포함: 예) `[법정의무교육]연구실안전교육(정기B반-대학생)` — 학부생/대학원생 반이 따로 존재.

### 진입 엔드포인트 (2026-09-17 검증)
비정규 과목도 메인 페이지의 `eclassRoom(kjkey)` 함수로 정규와 동일하게 진입 가능하다. `BrowserClient.enterCourseRoom()`은 정규 목록 페이지(`course_register_list_form.acl`)로 이동 후 호출하는 구조라 비정규 kjkey를 넘기면 실패할 수 있으므로, 메인 페이지에서 직접 실행한다:
```js
await page.goto('https://eclass.tukorea.ac.kr/ilos/main/main_form.acl');
await page.evaluate((key) => window.eclassRoom(key), kjkey);
await page.waitForURL('**/ilos/st/course/submain_form.acl');
```
진입 후 submain 세션 컨텍스트로 `online_list_form.acl`(진도율 표), `test_view_form.acl?exam_setup_seq=N`(시험정보) 등 정규과목과 동일한 페이지 접근 가능.

## 온라인 강의 자동수강
상세 절차·출석 추적 메커니즘·와처 루프는 `korean-lms-course-autoplay` 스킬의 `references/tukorea-eclass-autoplay.md` 참조 (ilos 공통, 비정규 과목에도 그대로 적용).

재사용 스크립트(`~/work/eclass-cli/` 안에서 실행):
- `safety_watch.mjs` — 순차 자동재생 와처 원형. ITEMS(콘텐츠ID/이름/길이)만 바꾸면 다른 과목 재사용
- `verify_progress.mjs` — 진도 독립 재검증 + 스크린샷
- `open_player.mjs` / `inspect_player.mjs` — 플레이어 구조 디버깅용

## pitfall
1. `BrowserClient.getHtml()`은 전체 URL 필요. `/ilos/...`만 넘기면 Playwright "Cannot navigate to invalid URL".
2. 애드혹 .mjs는 `~/work/eclass-cli/` 안에 둬야 node_modules가 해석된다. /tmp 등 밖에 두면 ERR_MODULE_NOT_FOUND.
3. `course_register_list_form.acl`(수강과목 페이지)에는 kjkey도 비정규 텍스트도 없음 — 메인 페이지만이 비정규 소스.

## 현재 학기 실측 스냅샷 (2026-2, 박명철 계정)
- `[법정의무교육]연구실안전교육(정기B반-대학생)` kjkey=N2026B2608180501, 기간 2026.09.01~10.16
  - 강의: 1주 1차시 = 콘텐츠 5개 (안전의식 14:55, 안전의식2 29:19, 안전의식3 26:06, 실험 전후 안전 24:57, 실험 전후 안전2 23:41) — 총 118:58, 진도 0%
  - 시험: `연구실 안전교육 평가` exam_setup_seq=1, 퀴즈/온라인, 60분, 배점 100, 60점 이상 이수. 기간 09.01 09:30 ~ 10.16 23:59
- 그 외 비정규: 통합폭력예방(~12.31), 스마트폰과의존(~12.31), 성평등(~12.31), 연구윤리 3종(~12.31)
