---
name: markdown-to-html
description: Convert Markdown text to beautifully styled, self-contained HTML with embedded CSS. Perfect for newsletters, documentation, reports, and email templates.
metadata:
  openclaw:
    emoji: "📄"
    always: false
    requires:
      bins: ["python3"]
      env: []
triggers:
  - skill md2html
  - skill markdown-to-html
  - 技能 md2html
  - 技能 markdown-to-html
  - convert markdown to html
  - markdown to html
  - render markdown
  - style markdown
  - skill md2html help
  - 技能 md2html help
---

# Markdown to HTML Converter

A zero-dependency Python tool that converts Markdown files into beautiful, self-contained HTML documents with embedded CSS styling. No external libraries needed — uses only Python's standard library.

## Features

- **Full Markdown support**: Headings, bold, italic, strikethrough, links, images, code blocks with syntax hints, blockquotes, ordered and unordered lists, horizontal rules, and tables
- **Two built-in themes**: Light (GitHub-inspired) and Dark mode with carefully chosen colors
- **Self-contained output**: All CSS is embedded inline — the resulting HTML file works anywhere with no external dependencies
- **Responsive design**: Output looks great on desktop and mobile screens
- **Stdin support**: Pipe content directly for use in shell pipelines

## Usage Examples

Convert a file with the default light theme:
```bash
python main.py README.md -o readme.html
```

Use the dark theme for a presentation:
```bash
python main.py notes.md -o notes.html --theme dark --title "Meeting Notes"
```

Pipe from another command:
```bash
cat CHANGELOG.md | python main.py - -o changelog.html
```

Use in a newsletter pipeline:
```bash
python main.py issue-42.md --title "Lobster Diary #42" -o issue.html
```

## Supported Markdown Elements

| Element | Syntax | Supported |
|---------|--------|-----------|
| Headings | `# H1` through `###### H6` | ✅ |
| Bold | `**text**` | ✅ |
| Italic | `*text*` | ✅ |
| Strikethrough | `~~text~~` | ✅ |
| Links | `[text](url)` | ✅ |
| Images | `![alt](url)` | ✅ |
| Code blocks | Triple backtick with language | ✅ |
| Inline code | Single backtick | ✅ |
| Blockquotes | `> text` | ✅ |
| Unordered lists | `- item` or `* item` | ✅ |
| Ordered lists | `1. item` | ✅ |
| Horizontal rules | `---` | ✅ |

## Command Line Options

- `input` — Markdown file path, or `-` for stdin
- `-o, --output` — Output HTML file (defaults to stdout)
- `--theme` — `light` (default) or `dark`
- `--title` — HTML document title (default: "Document")

## Help 帮助信息

发送 `skill md2html help` 或 `技能 md2html help` 查看本技能的详细使用说明。

### 命令列表

| 命令 | 用途 | 效果 |
|------|------|------|
| `skill md2html <文件>` | 转换 Markdown 为 HTML | 生成带 CSS 样式的独立 HTML 文件 |
| `skill md2html <文件> -o <输出>` | 指定输出文件名 | 自定义输出 HTML 文件路径 |
| `skill md2html <文件> --theme dark` | 使用深色主题 | 生成暗色风格 HTML |
| `skill md2html <文件> --title "标题"` | 设置文档标题 | 自定义 HTML `<title>` 和页面标题 |
| `skill md2html help` | 显示帮助信息 | 输出本说明文档 |

### 使用示例

```bash
# 基础转换（浅色主题）
skill md2html README.md

# 指定输出文件
skill md2html notes.md -o notes.html

# 深色主题 + 自定义标题
skill md2html presentation.md --theme dark --title "会议笔记"

# 管道输入
cat CHANGELOG.md | skill md2html - -o changelog.html
```

### 支持的 Markdown 元素

- 标题 (H1-H6)、粗体、斜体、删除线
- 链接、图片、代码块（含语法高亮提示）
- 行内代码、引用块、有序/无序列表
- 水平分割线、表格
