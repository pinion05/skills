---
name: hello-world
description: A simple skill that prints "Hello, World!" message. Use this as a template for creating new skills. Trigger phrases: "say hello", "hello world", "test skill".
metadata:
  author: Claude Code Guide
  version: 1.0.0
  category: example
  tags: [tutorial, beginner, template]
---

# Hello World Skill

가장 간단한 Skill 예제입니다. 이 Skill을 사용하여 Skills 시스템의 기본을 이해할 수 있습니다.

## 설명

이 Skill은 "Hello, World!" 메시지를 출력하는 가장 기본적인 예제입니다.
새로운 Skill을 만들 때 템플릿으로 사용할 수 있습니다.

## 사용 방법

- "say hello"
- "hello world"
- "test skill"

## 파일 구조

```
hello-world/
├── SKILL.md          # Skill 설정 파일 (필수)
└── scripts/          # 실행 스크립트 (선택)
    └── hello.sh      # Hello 메시지 출력 스크립트
```

## 템플릿으로 사용하기

1. 이 폴더를 복사하세요: `cp -r ~/.claude/skills/hello-world ~/.claude/skills/your-skill`
2. 새 폴더의 `SKILL.md`를 수정하세요
3. `name`과 `description`을 변경하세요
4. 필요한 스크립트를 추가하세요
