# OpenClaw Model Manager Skill

## 功能概述
通用模型管理技能，提供统一的模型扫描、列表显示和切换功能。

## 主要功能
- ✅ **一键扫描模型列表** - 自动扫描OpenClaw配置的所有模型
- ✅ **一键切换模型** - 通过序号快速切换模型
- ✅ **模型健康监控** - 自动检测模型故障并切换到备用模型
- ✅ **详细状态查看** - 显示模型配置、认证状态和系统信息
- ✅ **智能帮助系统** - 三级帮助结构（通用/命令/特定命令）
- ✅ **故障通知** - 模型切换时发送Telegram通知

## 安装
```bash
# 方法1: 从skillhub安装
skillhub install model-manager-skill

# 方法2: 本地安装
openclaw skills install ./model-manager-skill
```

## 使用方法

### 基本命令
```
models           # 显示已配置模型列表
models <序号>    # 切换到指定序号的模型
models status    # 显示详细系统状态
models refresh   # 刷新模型缓存
models scan      # 扫描所有模型
models help      # 查看详细帮助
```

### 健康监控
```
monitor start    # 启动模型健康监控
monitor stop     # 停止监控
monitor status   # 查看监控状态
monitor check    # 手动执行健康检查
monitor recover  # 手动切换回主用模型
```

### 帮助系统
```
help            # 显示通用帮助信息
models help     # 查看models命令详细帮助
monitor help    # 查看monitor命令详细帮助
<命令> help     # 查看特定命令帮助
```

## 配置说明
所有配置都在 `config.json` 中，包括：
- 命令别名和子命令
- 显示选项（emoji、缓存等）
- 监控参数（检查间隔、失败阈值等）
- 安全设置

## 技术架构
- **核心模块**: CommandProcessor, ModelScanner, ResponseFormatter, ModelHealthMonitor
- **模板系统**: 可定制的消息模板
- **缓存机制**: 5分钟缓存提高性能
- **错误处理**: 完整的错误捕获和用户友好提示

## 许可证
MIT License

## 贡献
欢迎提交Issue和Pull Request！
