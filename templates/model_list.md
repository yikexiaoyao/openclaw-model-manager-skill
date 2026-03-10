🤖 已配置模型列表 ({{total}}个)
{{separator}}

{{#models}}
{{index}}. {{emoji}} {{displayName}}
   • 状态: {{status}}
   {{#showContext}}• 上下文: {{context}} tokens{{/showContext}}
   {{#showAuthStatus}}• 认证: {{authStatus}}{{/showAuthStatus}}
   • 命令: {{command}}

{{/models}}
{{#hasMore}}
📄 还有 {{remaining}} 个模型未显示（当前显示限制: {{maxModels}}个）
{{/hasMore}}

{{#systemOptions}}
{{index}}. 📊 系统状态
   • 查看详细配置信息
   • 命令: {{command}}

{{index2}}. 🔄 刷新缓存  
   • 强制更新模型列表
   • 命令: {{command2}}
{{/systemOptions}}

💡 使用示例：
• 发送 "{{primaryCommand}} 1" 切换到第一个模型
• 发送 "{{primaryCommand}} status" 查看详细状态
• 发送 "{{primaryCommand}} refresh" 刷新缓存

⏰ 最后更新: {{timestamp}}