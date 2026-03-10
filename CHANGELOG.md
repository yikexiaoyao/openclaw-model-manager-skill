# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-10

### Added
- 初始版本发布
- 核心功能：模型扫描、列表显示、一键切换
- 健康监控：自动故障检测和切换
- 详细状态查看和帮助系统
- 完整的测试套件
- 专业文档和安装指南

### Features
- ✅ 动态扫描OpenClaw配置的所有模型
- ✅ 支持中文界面和emoji显示
- ✅ 5分钟缓存机制提高性能
- ✅ 自动备份配置确保安全
- ✅ 详细的错误提示和建议
- ✅ 支持命令别名（model, ml, 模型）

### Technical
- 模块化架构：CommandProcessor, ModelScanner, ResponseFormatter, ModelHealthMonitor
- 可配置行为：通过config.json调整所有设置
- 完整测试覆盖：单元测试和集成测试
- 生产就绪：错误处理、日志记录、监控

## [Unreleased]

### Planned
- 添加模型性能对比功能
- 支持更多平台（Discord, Slack等）
- 添加成本分析和用量监控
- 支持多语言界面
- 添加Web管理界面
