❌ 错误: {{errorType}}
{{separator}}

{{errorMessage}}

{{#suggestedCommands}}
💡 你可能想使用:
{{#commands}}
• {{.}}
{{/commands}}
{{/suggestedCommands}}

{{#correctionSuggestions}}
🤔 你是不是想找:
{{#suggestions}}
• {{.}}
{{/suggestions}}
{{/correctionSuggestions}}

🔧 可用命令:
• {{primaryCommand}} - 显示模型列表
• {{primaryCommand}} status - 查看系统状态
• {{primaryCommand}} refresh - 刷新缓存
• {{primaryCommand}} <序号> - 切换到指定模型