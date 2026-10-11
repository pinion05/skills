// e-Class 비정규과목(법정의무교육 등) 스캔 → JSON 출력
// 사용법: 이 파일을 ~/work/eclass-cli/ 로 복사한 뒤 (사전 pnpm build)
//   node scan_nonregular.mjs
// 반드시 저장소 루트에서 실행 — node_modules 해석 때문에.
import { BrowserClient } from './dist/src/transports/browser-client.js';
import { getConfig } from './dist/src/config/config.js';

const config = getConfig();
const client = new BrowserClient();
await client.launch();
await client.login(config);

// getHtml()은 전체 URL 필요 (경로만 넘기면 invalid URL 에러)
const html = await client.getHtml('https://eclass.tukorea.ac.kr/ilos/main/main_form.acl');

const courses = [];
for (const m of html.matchAll(/eclassRoom\('(N\w+)'\); return false;"\s*title="([^"]+)"/g)) {
  const block = html.slice(m.index, m.index + 1500);
  const period = block.match(/20\d\d\.\d\d\.\d+~20\d\d\.\d\d\.\d+/)?.[0] ?? '';
  courses.push({ kjkey: m[1], title: m[2], period });
}
console.log(JSON.stringify(courses, null, 2));
process.exit(0);
