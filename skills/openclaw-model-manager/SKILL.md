---
name: model-manager
description: OpenClaw 模型配置管理技能。用于添加、删除、更新、查看、切换、检测模型配置。当用户需要：(1) 添加新模型到配置 (2) 删除模型 (3) 更新模型参数（contextWindow、maxTokens 等）(4) 查看当前模型列表 (5) 切换主模型 (6) 检查模型可用状态（测试连接）(7) 修复模型配置问题时使用此技能。
metadata:
  openclaw:
    emoji: "🔧"
    always: false
    requires:
      bins: []
      env: []
triggers:
  - skill models
  - skill model-manager
  - 技能 models
  - 技能 model-manager
  - skill models list
  - skill models set
  - skill models status
  - skill models check
  - skill models test
  - skill models add
  - skill models delete
  - skill models update
  - skill models fix
  - skill models help
  - 技能 models help
---

# Model Manager

OpenClaw 模型配置管理技能，用于统一维护 `openclaw.json` 中的模型与 provider 配置。

## 适用场景

适合以下场景：
- 添加新的模型或 provider
- 删除失效或不再使用的模型
- 修正模型参数（如 `contextWindow`、`maxTokens`、`reasoning`）
- 切换 OpenClaw 默认主模型
- 检查模型连通性与可用状态
- 排查 `401 / 403 / 429 / 400 / 5xx` 等模型调用问题
- 批量整理和优化模型配置

## 核心能力

- 添加模型
- 删除模型
- 更新模型参数
- 查看当前模型列表
- 切换主模型
- 检查模型可用状态
- 并行测试模型连接
- 辅助定位常见错误码问题

## 配置文件位置

```text
C:\Users\Administrator\.openclaw\openclaw.json
```

## 常见用户请求示例

- "把主模型改成 `minmax/MiniMax-M2.7`"
- "检查所有模型状态"
- "测试模型连接"
- "给 `bailian2/qwen3-max-2026-01-23` 补上参数"
- "删除一个不用的 provider"
- "把不可用模型找出来"
- "查看当前配置了哪些模型"

## Help 帮助信息

发送 `skill models help` 或 `技能 models help` 查看本技能的详细使用说明。

### 命令列表

| 命令 | 用途 | 效果 |
|------|------|------|
| `skill models list` | 查看所有已配置的模型列表 | 显示模型列表（带序号） |
| `skill models set <序号或模型名>` | 切换默认主模型 | 更新 `agents.defaults.model.primary` |
| `skill models status` | 查看当前模型配置状态 | 显示主模型、备用模型、配置摘要 |
| `skill models check` | 检查模型连通性 | 测试 API 连接，返回可用/不可用状态 |
| `skill models test` | 测试模型连接 | 发送测试请求，验证模型响应 |
| `skill models add <模型名>` | 添加新模型配置 | 在 `models` 中注册新模型 |
| `skill models delete <序号或模型名>` | 删除模型配置 | 从配置中移除指定模型 |
| `skill models update <序号或模型名>` | 更新模型参数 | 修改 `contextWindow`、`maxTokens` 等 |
| `skill models fix` | 修复模型配置问题 | 自动检测并修复常见配置错误 |
| `skill models help` | 显示帮助信息 | 输出本说明文档 |

### 序号操作说明

**查看模型列表**:
```
skill models list
```

**输出示例**:
```
序号  模型 ID                                    类型    状态
───  ────────────────────────────────────────  ──────  ──────
1    bailian/qwen3.5-plus                      云端      ✅ 主模型
2    custom-127-0-0-1-8000/Qwen3.5-9B-MLX-4bit  本地      ✅ 备用
3    bailian/qwen3-max-2026-01-23              云端      ⭕ 可用
...
```

**使用序号操作**:
```
# 切换主模型
skill models set 1  # 切换到序号 1 的模型
skill models set 2  # 切换到序号 2 的模型

# 删除模型
skill models delete 8  # 删除序号 8 的模型

# 更新模型参数
skill models update 3 contextWindow 200000  # 更新序号 3 的模型

# 使用完整名称（同样支持）
skill models set bailian/qwen3.5-plus
```
