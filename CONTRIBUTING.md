# 贡献指南

感谢你考虑为OpenClaw Model Manager Skill做出贡献！

## 如何贡献

### 报告问题
- 使用GitHub Issues报告bug或建议新功能
- 在报告前请先搜索是否已有类似问题
- 提供详细的问题描述和复现步骤

### 提交代码
1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request

### 开发环境设置
```bash
# 克隆仓库
git clone https://github.com/your-username/openclaw-model-manager-skill.git
cd openclaw-model-manager-skill

# 安装依赖
npm install

# 运行测试
npm test

# 开发模式
npm run dev
```

### 代码规范
- 使用ES6+语法
- 遵循现有的代码风格
- 添加适当的注释
- 编写单元测试
- 更新相关文档

### 提交信息规范
使用[约定式提交](https://www.conventionalcommits.org/)格式：
- `feat:` 新功能
- `fix:` bug修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具变动

### 测试要求
- 新功能必须包含测试
- 修复bug时添加回归测试
- 保持测试覆盖率不下降

## 行为准则
请遵守[贡献者公约](https://www.contributor-covenant.org/version/2/0/code_of_conduct/)。

## 许可证
贡献的代码将采用与本项目相同的MIT许可证。
