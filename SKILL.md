# Model Manager Skill

## 功能概述
通用模型管理技能，提供统一的模型扫描、列表显示和切换功能。

## 安装
```bash
# 从skillhub安装
skillhub install model-manager-skill

# 或从本地安装
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
models help      # 查看models命令详细帮助
```

### 命令别名
```
model           # 同 models
ml              # 同 models  
模型            # 同 models
```

### 帮助系统
```
help            # 显示通用帮助信息
models help     # 查看models命令详细帮助
monitor help    # 查看monitor命令详细帮助
<命令> help     # 查看特定命令帮助（如: status help）
```

### 示例
```
用户: models
助手: 🤖 已配置模型列表 (2个)
      ========================================
      
      1. 🚀 DeepSeek V3.2
         • 状态: ✅ 主用
         • 上下文: 125k tokens
         • 认证: ✅
         • 命令: models 1
      
      2. 🆓 通义千问80B
         • 状态: ⚡ 备用
         • 上下文: 256k tokens
         • 认证: ⚠️
         • 命令: models 2
      
      3. 📊 系统状态
         • 查看详细配置信息
         • 命令: models status
      
      4. 🔄 刷新缓存
         • 强制更新模型列表
         • 命令: models refresh
      
      💡 使用示例：
      • 发送 "models 1" 切换到DeepSeek
      • 发送 "models status" 查看详细状态
      
      ⏰ 最后更新: 2026-03-10 20:30:00

用户: models 2
助手: ✅ 切换成功！
      ==============================
      
      当前模型: 🆓 通义千问80B
      特点: 完全免费，256k超大上下文
      
      📱 下次切换使用: models 2
      ⏰ 切换时间: 2026-03-10 20:31:00
```

## 配置说明

技能支持以下配置（编辑 `config.json`）:

### 命令配置
```json
{
  "commands": {
    "primary": "models",
    "aliases": ["model", "ml", "模型"],
    "subcommands": {
      "status": ["状态", "st"],
      "refresh": ["刷新", "rf"],
      "scan": ["扫描", "sc"]
    }
  }
}
```

### 显示配置
```json
{
  "display": {
    "showEmojis": true,        # 是否显示表情图标
    "showContext": true,       # 是否显示上下文长度
    "showAuthStatus": true,    # 是否显示认证状态
    "maxModelsPerPage": 10,    # 每页显示最大模型数
    "cacheDuration": 300       # 缓存时间（秒）
  }
}
```

### 行为配置
```json
{
  "behavior": {
    "autoRefresh": true,       # 是否自动刷新
    "confirmSwitch": false,    # 切换前是否需要确认
    "logSwitches": true,       # 是否记录切换日志
    "backupBeforeSwitch": true # 切换前是否备份配置
  }
}
```

## 高级功能

### 模型扫描
技能会自动扫描OpenClaw配置的模型，支持：
- 动态模型发现
- 自动序号分配
- 实时状态更新

### 缓存管理
- 5分钟缓存提高性能
- 支持手动刷新
- 配置变更自动检测

### 错误处理
- 友好的错误提示
- 智能建议
- 自动纠正拼写错误

## 故障排除

### 常见问题

#### 1. 模型列表为空
```
可能原因:
• OpenClaw未配置任何模型
• 权限不足无法读取配置
• 缓存数据损坏

解决方案:
• 检查OpenClaw配置
• 发送 "models refresh" 强制刷新
• 重启OpenClaw服务
```

#### 2. 切换失败
```
可能原因:
• 模型认证无效
• API密钥过期
• 网络连接问题

解决方案:
• 发送 "models status" 检查认证状态
• 更新API密钥配置
• 检查网络连接
```

#### 3. 命令不响应
```
可能原因:
• 技能未正确加载
• 命令格式错误
• 权限限制

解决方案:
• 检查技能是否已安装
• 发送 "help" 查看正确格式
• 检查用户权限设置
```

### 恢复操作
技能会自动创建配置备份，位置:
```
~/.openclaw/skills/model-manager/backups/
```

手动恢复:
```bash
# 找到最新的备份文件
ls -la ~/.openclaw/skills/model-manager/backups/

# 恢复配置
cp ~/.openclaw/skills/model-manager/backups/config_backup_*.json ~/.openclaw/openclaw.json
```

### 模型健康监控
技能包含完整的模型健康监控系统:

#### 监控命令
```
monitor start    # 启动模型健康监控
monitor stop     # 停止监控
monitor status   # 查看监控状态
monitor check    # 手动执行健康检查
monitor recover  # 手动切换回主用模型
monitor help     # 查看监控帮助
```

#### 自动故障转移
当主用模型不可用时，系统会自动:
1. **检测故障**: 连续3次检查失败后判定为故障
2. **自动切换**: 立即切换到备用模型
3. **发送通知**: 通过Telegram发送切换通知
4. **持续监控**: 继续监控主用模型恢复状态
5. **自动恢复**: 主用模型恢复后自动切换回来（可配置）

#### 监控配置
```json
{
  "monitoring": {
    "enabled": true,           # 是否启用监控
    "checkInterval": 300,      # 检查间隔（秒）
    "failureThreshold": 3,     # 连续失败次数阈值
    "autoRecover": true,       # 是否自动恢复
    "notifications": {
      "enable": true,          # 启用通知
      "onSwitch": true,        # 切换时通知
      "onRecovery": true,      # 恢复时通知
      "onFailure": false       # 每次失败时通知
    }
  }
}
```

#### 故障场景示例
```
主用模型: DeepSeek V3.2
备用模型: 通义千问80B

场景:
1. DeepSeek API故障 → 连续3次检查失败
2. 系统自动切换到通义千问80B
3. Telegram收到通知: "🚨 模型自动切换通知..."
4. 对话继续使用备用模型
5. DeepSeek恢复后 → 自动切换回DeepSeek
6. Telegram收到恢复通知
```

## 开发扩展

### 项目结构
```
model-manager-skill/
├── index.js              # 主入口文件
├── config.json           # 配置文件
├── package.json          # 包配置
├── SKILL.md              # 技能文档
├── src/
│   ├── ModelScanner.js   # 模型扫描器
│   ├── CommandProcessor.js # 指令处理器
│   └── ResponseFormatter.js # 响应格式化器
├── templates/            # 响应模板
└── tests/               # 测试文件
```

### 添加新命令
在 `CommandProcessor.js` 中添加新的处理方法:
```javascript
async _handleNewCommand(args, context) {
  // 实现新命令逻辑
}
```

### 自定义模板
编辑 `templates/` 目录下的模板文件:
- `model_list.md` - 模型列表模板
- `switch_result.md` - 切换结果模板
- `error_message.md` - 错误消息模板

### 添加新提供商
在 `ModelScanner.js` 中添加新的模型提供商支持:
```javascript
_getDisplayName(modelId) {
  // 添加新的模型名称映射
  const nameMap = {
    // ... 现有映射
    'new-provider/model': '新模型名称'
  };
  // ...
}
```

## 版本历史

### v1.0.0 (2026-03-10)
- 初始版本发布
- 支持模型扫描和列表显示
- 支持按序号切换模型
- 支持系统状态查看
- 支持缓存管理
- 完整的错误处理

## 技术支持

### 问题反馈
- GitHub Issues: https://github.com/openclaw/skills/issues
- Discord社区: https://discord.gg/clawd

### 贡献指南
1. Fork项目仓库
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 许可证
MIT License - 详见 LICENSE 文件