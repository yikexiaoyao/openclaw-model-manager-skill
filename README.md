# OpenClaw Model Manager Skill

🔧 OpenClaw 通用模型管理技能 - 扫描、列表、切换、检测模型配置

## 功能特性

- 📋 查看已配置的模型列表（带序号）
- 🔄 切换默认主模型（配置 + Session 同时切换）
- ✅ 检查模型连通性（测试 API 连接）
- 📊 查看当前模型配置状态
- 🔧 更新模型参数（contextWindow、maxTokens 等）
- 🗑️ 删除失效或不再使用的模型
- 🐛 修复模型配置问题

## 快速开始

### 查看模型列表
```bash
skill models list
```

### 切换模型
```bash
skill models set 1          # 切换到序号 1 的模型
skill models set 2          # 切换到序号 2 的模型
skill models set bailian/qwen3.5-plus  # 使用模型名称
```

### 查看状态
```bash
skill models status
```

### 检查连通性
```bash
skill models check
```

### 测试模型连接
```bash
skill models test
```

## 命令列表

| 命令 | 用途 |
|------|------|
| `skill models list` | 查看所有已配置的模型列表 |
| `skill models set <序号或模型名>` | 切换默认主模型 |
| `skill models status` | 查看当前模型配置状态 |
| `skill models check` | 检查模型连通性 |
| `skill models test` | 测试模型连接 |
| `skill models add <模型名>` | 添加新模型配置 |
| `skill models delete <序号或模型名>` | 删除模型配置 |
| `skill models update <序号或模型名>` | 更新模型参数 |
| `skill models fix` | 修复模型配置问题 |
| `skill models help` | 显示帮助信息 |

## 重要说明

**`skill models set` 行为**：
- ✅ 修改配置文件（永久生效）
- ✅ 强制切换当前 Session（立即生效）
- ✅ 新 Session 自动继承配置

## 推荐用法

**完整切换（配置 + Session 同时生效）**：
```bash
skill models set 2 && /model 2
```

**只改配置（影响未来新建的 Session）**：
```bash
skill models set 2
```

**只改当前 Session（不持久化）**：
```bash
/model 2
```

## 安装

通过 ClawHub 安装：
```bash
clawhub install yikexiaoyao/openclaw-model-manager-skill
```

## 配置说明

配置文件位置：`~/.openclaw/openclaw.json`

## License

MIT
