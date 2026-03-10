{{#success}}
✅ 切换成功！
{{separator}}

当前模型: {{emoji}} {{modelName}}
特点: {{description}}

📱 下次切换使用: {{primaryCommand}} {{index}}
⏰ 切换时间: {{timestamp}}

{{#hasBackup}}
🛡️ 配置备份已创建: {{backupFile}}
{{/hasBackup}}
{{/success}}

{{^success}}
❌ 切换失败
{{separator}}

错误信息: {{errorMessage}}

💡 建议:
{{#suggestions}}
• {{.}}
{{/suggestions}}

🔧 故障排除:
1. 检查模型认证状态
2. 发送 "{{primaryCommand}}" 查看可用模型
3. 联系管理员获取帮助
{{/success}}