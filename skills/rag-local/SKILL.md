---
name: rag-local
description: 本地 RAG 检索技能，使用 BGE-M3 + ChromaDB 进行语义检索。当用户询问本地文档、配置文件、项目代码、笔记等内容时使用。
metadata:
  openclaw:
    emoji: "🔍"
    always: false
    requires:
      bins: ["curl"]
      env: ["RAG_SERVICE_URL=http://127.0.0.1:8001"]
triggers:
  - RAG 搜索
  - 搜索本地
  - 我的笔记
  - 项目文档
  - 配置文件
  - 本地文档
  - 检索
  - 语义搜索
  - 查找文档
  - 查找笔记
  - 查找配置
---

# RAG 本地检索技能

使用 BGE-M3 嵌入模型 + ChromaDB 进行语义检索。

## 触发条件

• 用户询问本地文档内容
• 涉及项目代码/配置文件
• 明确提到"我的笔记"、"项目里"、"本地"
• 语义检索请求

## 使用方法

### 添加文档
```bash
curl -X POST http://127.0.0.1:8001/add \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "openclaw_docs",
    "document": "文档内容",
    "doc_id": "doc_001",
    "metadata": {"type": "config"}
  }'
```

### 检索文档
```bash
curl -X POST http://127.0.0.1:8001/query \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "openclaw_docs",
    "query": "查询内容",
    "n_results": 5
  }'
```

### 批量添加
```bash
curl -X POST http://127.0.0.1:8001/add_batch \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "docs",
    "documents": ["文档 1", "文档 2"],
    "ids": ["doc1", "doc2"]
  }'
```

### 查看状态
```bash
curl http://127.0.0.1:8001/heartbeat
```

## 返回格式

```json
{
  "documents": ["相关文档内容"],
  "scores": [0.85],
  "ids": ["doc_001"],
  "metadatas": [{"type": "config"}]
}
```

## 使用示例

**用户**: "我的 OpenClaw 配置文件在哪"

**技能**:
1. 检索 RAG 服务
2. 返回相关文档
3. 结合上下文回答

**回答**: "OpenClaw 配置文件在 `~/.openclaw/openclaw.json`"

---

## 服务状态

- 地址：http://127.0.0.1:8001
- 模型：BGE-M3 (1024 维)
- 数据库：ChromaDB (持久化)
- 位置：~/.openclaw/chroma/
