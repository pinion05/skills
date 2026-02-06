---
name: youtube-transcript
description: "Extract YouTube video transcripts with metadata and save as Markdown to Obsidian vault. Use this skill when the user requests downloading YouTube transcripts, converting YouTube videos to text, or extracting video subtitles. Does not download video/audio files, only metadata and subtitles."
---

# YouTube Transcript

## Overview

Extract YouTube video transcripts, metadata, and chapters using `youtube-transcript-api` and `yt-dlp`. Output formatted as Markdown with YAML frontmatter, saved to ~/Brains/brain/ (Obsidian vault).

## Quick Start

To extract a transcript from a YouTube video:

```bash
python scripts/extract_transcript.py <youtube_url>
```

Optional: Specify custom output filename:

```bash
python scripts/extract_transcript.py <youtube_url> custom_filename.md
```

## Output Format

### YAML Frontmatter

The generated Markdown includes comprehensive metadata:

- `title` - Video title
- `channel` - Channel name
- `url` - YouTube URL
- `upload_date` - Upload date (YYYY-MM-DD)
- `duration` - Video duration (HH:MM:SS)
- `description` - Video description (truncated to 500 chars)
- `tags` - Array of video tags
- `view_count` - View count
- `like_count` - Like count

### Body Structure

Transcript organized by video chapters (if available):

```markdown
## Chapter Title

**00:05:23** Transcript text for this segment.

**00:05:45** Next segment text.
```

If no chapters exist, all content appears under "## Transcript" heading.

Timestamps formatted as HH:MM:SS for consistency.

## Workflow

1. Extract metadata using `yt-dlp --dump-json`
2. Extract transcript using `youtube-transcript-api` (tries Korean → English → Japanese)
3. Remove duplicate entries (prefix removal)
4. Group transcript segments by video chapters (if present)
5. Format as Markdown with YAML frontmatter
6. Save to ~/Brains/brain/ with sanitized filename based on video title

## Language Support

The skill tries to extract transcripts in this order:

1. **Korean (ko)** - Priority for Korean content
2. **English (en)** - Fallback for international content
3. **Japanese (ja)** - Additional fallback

If none of the requested languages are available, the script exits with an error message.

## Requirements

Install required dependencies:

```bash
# Install yt-dlp for metadata extraction
apt install yt-dlp
# OR
pip install yt-dlp

# Install youtube-transcript-api for transcript extraction
pip install youtube-transcript-api
```

## Why youtube-transcript-api?

The skill uses `youtube-transcript-api` instead of directly downloading VTT files with yt-dlp because:

1. **More reliable** - Direct API access, avoids HTTP 429 (Too Many Requests) errors
2. **Better language support** - Easy to specify language preferences
3. **Cleaner data** - Returns structured data directly, no VTT parsing needed
4. **Faster** - No file download/cleanup overhead
5. **Auto-generated captions** - Works with auto-generated captions

## Deduplication

The skill automatically removes duplicate entries where a transcript segment is a prefix of the next segment. This is common in auto-generated captions where text accumulates.

To manually deduplicate existing transcript files:

```bash
python scripts/deduplicate_transcript.py <markdown_file>
```

## Troubleshooting

### "No subtitles available"

- The video may not have captions in the requested languages (ko/en/ja)
- Some videos disable captions entirely
- Try checking manually on YouTube to see if captions are available

### "youtube-transcript-api not installed"

```bash
pip install youtube-transcript-api
```

### "Failed to extract metadata"

Ensure yt-dlp is installed:

```bash
apt install yt-dlp
```

Or update yt-dlp if it's outdated:

```bash
pip install --upgrade yt-dlp
```

## Limitations

- Requires video to have subtitles (auto-generated or manual)
- Does not download video or audio files
- Description truncated to 500 characters in frontmatter
- Only supports ko, en, ja languages (configurable in script)
- Some videos may have region-locked captions
