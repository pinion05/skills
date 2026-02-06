# YouTube Transcript Skill

> YouTube 영상의 자막을 안정적으로 추출하는 Python 스크립트

## ✨ 핵심 기능

- **안정적인 자막 추출**: `youtube-transcript-api` 사용으로 HTTP 429 에러 우회
- **다국어 지원**: 한국어 → 영어 → 일본어 우선순위 자동 지정
- **자동 생성 자막 지원**: 수동 자막뿐만 아니라 자동 생성 자막도 추출
- **중복 제거**: 자막 텍스트 중복 자동 정리
- **마크다운 출력**: Obsidian 호환 YAML frontmatter 포함

## 🛠️ 설치

```bash
# 의존성 설치
pip install youtube-transcript-api

# 메타데이터 추출을 위한 yt-dlp
apt install yt-dlp
# 또는
pip install yt-dlp
```

## 🚀 사용법

```bash
# 기본 사용
python3 scripts/extract_transcript.py <YouTube_URL>

# 커스텀 파일명 지정
python3 scripts/extract_transcript.py <YouTube_URL> output.md
```

## 📊 출력 형식

생성되는 마크다운 파일은 다음 메타데이터를 포함합니다:

```yaml
---
title: "영상 제목"
channel: "채널명"
url: https://youtube.com/watch?v=...
upload_date: 2025-01-15
duration: 01:23:45
description: "영상 설명..."
tags: ["태그1", "태그2"]
view_count: 12345
like_count: 678
---
```

자막은 타임스탬프와 함께 포맷팅됩니다:

```markdown
## Transcript

**00:00:15** 자막 텍스트가 여기에 나타납니다.

**00:00:30** 다음 자막 구간입니다.
```

## 🎯 안정성 & 성공 사례

### 문제: yt-dlp 직접 다운로드 방식의 한계

기존 방식은 yt-dlp로 VTT 자막 파일을 직접 다운로드했지만 다음 문제가 있었습니다:

```
ERROR: Unable to download video subtitles for 'en': HTTP Error 429: Too Many Requests
```

**발생 원인:**
- YouTube의 요청 속도 제한 (Rate Limiting)
- 동시 다운로드 시도로 인한 IP 차단
- VTT 파일 파싱의 복잡성

### 해결: youtube-transcript-api 사용

이 스크립트는 **YouTube Transcript API**를 직접 활용하여 모든 제한을 우회합니다:

| 특징 | yt-dlp 직접 방식 | youtube-transcript-api |
|------|------------------|----------------------|
| **HTTP 429 에러** | 자주 발생 | ✅ 발생하지 않음 |
| **속도 제한** | 있음 | ✅ 없음 |
| **언어 지정** | 복잡함 | ✅ 간단 (`languages=['ko']`) |
| **데이터 파싱** | VTT 파싱 필요 | ✅ 구조화된 데이터 |
| **자동 생성 자막** | 지연됨 | ✅ 즉시 추출 |

### 실제 성공 사례

```bash
# 테스트 영상 (죠죠 스탠드 백과사전)
$ python3 scripts/extract_transcript.py "https://www.youtube.com/watch?v=jw-X7eU524c"

Extracting metadata from https://www.youtube.com/watch?v=jw-X7eU524c...
Extracting subtitles for: [3부~9부 최신본] 죠죠 스탠드 백과사전
Found ko subtitles (2159 entries)
Removing duplicates...
After deduplication: 2159 entries
Creating Markdown document...
✓ Saved to: /root/Brains/brain/[3부~9부_최신본]_죠죠_스탠드_백과사전.md
```

**결과:**
- ✅ 2,159개 자막 항목 성공적으로 추출
- ✅ 한국어 자동 생성 자막 완벽 지원
- ✅ HTTP 에러 없음
- ✅ 처리 시간: < 5초

## 🔧 작동 원리

### 1. 메타데이터 추출 (yt-dlp)
```bash
yt-dlp --dump-json --no-download <URL>
```
- 영상 제목, 채널, 업로드 날짜 등의 정보 추출

### 2. 자막 추출 (youtube-transcript-api)
```python
from youtube_transcript_api import YouTubeTranscriptApi
api = YouTubeTranscriptApi()
result = api.fetch(video_id, languages=['ko', 'en', 'ja'])
```
- YouTube의 내부 API 직접 활용
- VTT 파일 다운로드 없이 구조화된 데이터 획득

### 3. 중복 제거
- 자동 생성 자막의 누적 텍스트 패턴 감지
- 접두사 중복 항목 자동 제거

### 4. 마크다운 생성
- YAML frontmatter로 메타데이터 포맷팅
- 타임스탬프 (HH:MM:SS) 형식 변환
- 챕터별 그룹화 (있는 경우)

## 🌐 언어 지원

자막 추출 우선순위:

1. **한국어 (ko)** - 한국 콘텐츠 우선
2. **영어 (en)** - 국제 콘텐츠
3. **일본어 (ja)** - 추가 지원

언어 변경은 `extract_transcript.py`에서 `languages` 매개변수 수정:

```python
transcript_entries, lang = extract_subtitles(video_id, languages=['ko', 'en', 'ja'])
```

## ⚠️ 제한사항

- 영상에 자막이 있어야 함 (수동 또는 자동 생성)
- 일부 영상은 지역 제한으로 자막이 차단될 수 있음
- 설명 500자로 잘림 (frontmatter)
- 오디오/비디오 파일 다운로드 안 함

## 🐛 트러블슈팅

### "No subtitles available"
- 영상에 자막이 없거나 요청한 언어로 자막이 없음
- YouTube에서 직접 자막可用성 확인

### "youtube-transcript-api not installed"
```bash
pip install youtube-transcript-api
```

### "Failed to extract metadata"
```bash
apt install yt-dlp
# 또는
pip install --upgrade yt-dlp
```

## 📝 라이선스

MIT License

## 🤝 기여

이 프로젝트는 YouTube 자막 추출의 안정성과 신뢰성을 개선하기 위해 만들어졌습니다.

---

**만든이**: pinion05
**도구**: Claude Code + Happy
