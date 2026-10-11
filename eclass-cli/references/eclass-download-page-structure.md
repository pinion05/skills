# e-Class 강의자료 다운로드 페이지 HTML 구조

## 상세페이지 접근 전제조건
`lecture_material_view_form.acl?ARTL_NUM=<num>` 페이지는 **course room 세션 컨텍스트**가 있어야 정상 응답한다.
순서: `course ls` → kjkey 획득 → `enterCourseRoom(kjkey)` → 상세페이지 GET.

`enterCourseRoom` 없이 직접 GET → 메인페이지 HTML 반환 (본문 없음).

## 패턴 A: 직접 링크 (2026년 기준 현행)

첨부파일이 `<a>` 태그의 `href` 속성에 직접 다운로드 URL을 포함:

```html
<a class="site-link"
   href="/ilos/co/efile_download.acl?FILE_SEQ=RBBKUNOZDX5BS&amp;CONTENT_SEQ=6729347&amp;ky=A20262CAI3200301&amp;ud=2024591013&amp;pf_st_flag=2"
   target="file_down"
   title="첨부파일 다운로드">
   - 3)진술조서(진정인용-영업비밀 유출).hwp (48.5KB)
</a>
```

선택자: `a[href*="efile_download"]`
URL 디코딩: `&amp;` → `&` 치환 후 `BASE_URL` 프리픽스 추가.

### 파일명 추출
`<a>` 텍스트 = `"진술조서.hwp (48.5KB)"` 형태.
정규식: `/^(.+?)\s*\(\d/` → `"진술조서.hwp"` 분리.

### hidden inputs (패턴 A에서는 불필요하지만 참조용)
```html
<input type="hidden" name="KJ_KEY" value="A20262CAI3200301">
<input type="hidden" name="ARTL_NUM" value="6729347">
<input type="hidden" name="path" value="KC03">
<input type="hidden" name="auth" value="st">
```
`ky`, `ud`, `CONTENT_SEQ`는 hidden input이 아니라 `<a href>` 파라미터에 포함되어 있음.

## 패턴 B: downloadClick onclick (레거시)

```javascript
// onclick 속성에서 FILE_GROUP_ID 추출
$('[onclick*="downloadClick"]').attr('onclick')
// → downloadClick('FILE_GROUP_ID_VALUE', ...)
```

이후 `efile_list.acl` POST로 파일 목록 조회 → `FILE_SEQ` 추출 → 다운로드 URL 조합.

## 첨부파일 영역 DOM 구조 (공통)

```html
<div id="tbody_file">
  첨부파일(1개)
  <div class="attfile-list">
    - 3)진술조서(진정인용-영업비밀 유출).hwp (48.5KB)
  </div>
</div>
<input id="file1_6729347" type="hidden">  <!-- 다중 파일시 file2_, file3_ -->
```

## 디버깅 재현 스크립트 패턴

ESM 환경 (package.json `type: "module"`)에서 디버그 스크립트 작성시:
- `.mjs` 확장자 사용 (`.js`는 EML로 인식되어 require 불가)
- `cheerio` import: `import * as cheerio from 'cheerio'` (`import cheerio from 'cheerio'` 사용 불가 - default export 없음)
- dist 경로에서 직접 import: `import { getConfig } from '~/work/eclass-cli/dist/src/config/config.js'`
- BrowserClient 사용순서: `new BrowserClient(university)` → `await client.launch()` → `await client.login(config)`

## artlNum 정규식 (수정 후)

`pageMove()` onclick에서 ARTL_NUM 추출시 `&`도 구분자로 처리:
```typescript
// 수정 전 (버그): &를 멈추지 못함
/ARTL_NUM\s*=\s*['"]?([^'")\s]+)/i

// 수정 후: & 추가
/ARTL_NUM\s*=\s*['"]?([^'")\s&]+)/i
```

버그 증상: `artlNum` = `"6729347&SCH_KEY=&SCH_VALUE=&display=1&start=1"` 로 캡처됨.
