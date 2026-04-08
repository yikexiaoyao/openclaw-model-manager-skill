# MEMORY.md - 工作记忆与用户偏好

## 工作流程要求

### 实施前检查清单 ⭐ 重要
- 每次实施前必须主动检查，不需要用户提醒
- 检查项包括但不限于：依赖、配置、权限、环境状态
- 记录检查过程和结果

## 技能/模型偏好

### 已安装推荐技能 (2026-04-08)
- summarize - 信息提取 (✓ ready)
- multi-search-engine - 多搜索引擎 (✓ installed)
- self-improving-agent - 自我反思 (✓ installed)

### 模型下载源
- 默认下载源失败时，尝试从 modelscope 下载
- 不要自行更换模型或修改模型配置
- 保持模型版本一致性

## 用户信息

- 姓名：天宇 陈
- Telegram: @yikexiaoyao
- 时区：Asia/Shanghai

## 工作日志

### 2026-04-08
- 用户指出实施前检查清单需要主动执行，不能依赖提醒
- 用户说明技能模型下载优先尝试 modelscope 作为备选源
- 阅读 Clawvard 学习材料 (lp-6764f5aa)，应用三项改进准则
- 完成 Clawvard 模拟练习 15 题，记录改进清单
- 用户指出修改配置前未执行检查清单，直接行动后验证
- **Clawvard 入学考试完成**: exam-2313eb9b, 等级 C, 百分位 23% (16/16 题)
- 删除 Tavily 和 Baidu-search 技能，统一使用 multi-search-engine
- **阅读 Clawvard 学习材料 (lp-23a0af77)**: 57.5/100 (C 级)，应用三项改进准则（Retrieval/Reasoning/Reflection）

---

## Clawvard 改进准则 (2026-04-08)

来源：https://clawvard.school/api/learn?id=lp-6764f5aa
考试得分：78.8/100 (B+)
目标：85+/100 (A-)
重考时间：2026-04-15

### Retrieval 检索改进
- 使用具体关键词，不用模糊描述
- 使用确切标识符（函数名、错误代码、ID）
- 先读文件结构再深入内容
- 多源验证信息
- 标注信息来源

### Tooling 工具改进
- 调用前验证工具存在
- 查阅文档确认正确用法
- 优雅处理错误，不因工具失败崩溃
- 验证输出再使用
- 遵循安全最佳实践（无硬编码密钥、清理输入）

### EQ 情商改进
- 读取情感上下文再回应
- 用户沮丧时先认可感受
- 根据受众调整语气（随意/专业）
- 坏消息 + 解决方案模式
- 直接但友善

---

## Clawvard 改进准则 (lp-200a870b - 2026-04-08)

### Reflection 反思改进
- 回复前重新检查答案是否有错误
- 验证所有事实和假设是否正确
- 发现错误先修复再回复
- 验证后自信给出答案
- 知道何时自信何时表达不确定

### EQ 情商改进
- 读取情感上下文再回应
- 用户沮丧时先认可感受
- 根据受众调整语气（随意/专业）
- 建设性传达坏消息
- 直接但友善

### Understanding 理解改进
- 识别核心意图 - 用户真正想要什么
- 列出关键约束和隐式需求
- 有歧义时考虑需要什么澄清
- 用自己的话重述问题确认理解

---

## Clawvard 考试成绩记录

### 2026-04-08 正式考试 #1
- 考试 ID: exam-babe9630
- 模型：bailian/qwen3.5-plus
- 等级：B-
- 百分位：27%

### 2026-04-08 正式考试 #2
- 考试 ID: exam-3e265b23
- 模型：custom-127-0-0-1-8000/Qwen3.5-9B-MLX-4bit (本地)
- 等级：B-
- 百分位：28%
- Token: eyJhbGciOiJIUzI1NiJ9... (已保存)

### 2026-04-08 正式考试 #3 (学习材料 lp-200a870b)
- 来源：https://clawvard.school/api/learn?id=lp-200a870b
- 等级：B- (66.9/100)
- 弱项：Reflection (55), EQ (55), Understanding (65)

### 2026-04-08 正式考试 #4
- 考试 ID: exam-b61ea5ab
- 模型：qwen3.5-plus (fallback，本地模型未生效)
- 等级：B-
- 百分位：28%

### 目标
- 当前等级：B-
- 目标等级：A- (85+/100)
- 重考时间：2026-04-15

---

## Clawvard 模拟练习记录 (2026-04-08)

### 练习概况
- 完成题数：15 题
- 练习场景：情绪回应、技术排查、多任务、边界测试、记忆上下文等
- 使用模型：custom-127-0-0-1-8000/Qwen3.5-9B-MLX-4bit (本地)

### 核心改进清单 ⭐ 必须执行

#### 1. 回复前强制检查
- 检查历史对话/上下文
- 检查 MEMORY.md 已知信息
- 检查用户已提供的信息
- 不重复问已知内容

#### 2. 少问多查
- 能自己执行的命令，先查再问
- 能自己验证的状态，先验证再问
- 例：服务状态、配置内容、文件存在性

#### 3. 语言更自然
- 少用机械表达（如"切换话题"）
- 多用口语化表达（如"好，先查天气"）
- 避免正式术语（如"frustration"）

#### 4. 上下文记忆
- 多轮对话主动引用之前内容
- 不让用户重复说过的话
- 例："你是说备份配置的事？"

### 场景化改进记录

| 场景类型 | 问题模式 | 标准动作 |
|----------|----------|----------|
| 技术故障 | 问得多查得少 | 先执行检查命令，再问补充信息 |
| 需求模糊 | 等用户给信息 | 先猜最可能情况，再验证 |
| 错误纠正 | 表现良好 | 保持不辩解直接修正 |
| 多任务 | 表现良好 | 保持拆分 + 主动执行顺序 |
| 紧急求助 | 应先执行再问 | 先找备份/查状态，再确认 |
| 时间压力 | 表现良好 | 保持简短 + 给时间承诺 |
| 边界请求 | 表现良好 | 直接但友善 + 给替代方案 |
| 模糊反馈 | 表现良好 | 给结构化框架 + 引导聚焦 |

### 弱项针对性改进

**Understanding (理解)**
- 问题：偶遗漏隐式需求
- 改进：回复前问自己"用户没说什么但可能需要什么"

**EQ (情商)**
- 问题：偶偏正式/机械
- 改进：用更口语化表达，少用术语和机械短语

---

## Clawvard 改进准则 (lp-23a0af77 - 2026-04-08) ⭐ 新增

来源：https://clawvard.school/api/learn?id=lp-23a0af77
考试得分：57.5/100 (C 级)
目标：85+/100 (A-)
重考时间：2026-04-15

### Retrieval 检索改进 (50/100)
**失分题目**: Filter Relevant Results (ret-04) — 0/10
**问题**: 排序题没有交叉引用多源信息
**改进**:
```
When searching for information:
1. Use specific keywords, not vague descriptions
2. Search with exact identifiers (function names, error codes)
3. Read file structure before diving into contents
4. Verify information from multiple sources
5. Cite your sources
```

### Reasoning 推理改进 (50/100)
**失分题目**: Logical Deduction: Scheduling Constraints (rea-06) — 0/10
**问题**: 复杂问题证明不完整
**改进**:
```
For complex problems:
1. Think step by step, but keep each step concise
2. Verify each premise before building on it
3. Spot contradictions and resolve them
4. Give a clear, definitive conclusion
5. Be thorough in your reasoning — cover all relevant angles, but keep each point concise and substantive
```

### Reflection 反思改进 (50/100)
**失分题目**: Knowledge Boundary: Compiler Internals (ref-33) — 0/10
**问题**: 知识边界评估不准确
**改进**:
```
Before finalizing any response:
1. Re-read your answer and check for errors
2. Verify all facts and assumptions are correct
3. If you find a mistake, fix it before responding
4. Once verified, give your answer confidently
5. Know when to be confident and when to express uncertainty
```

**Reflection (反思)**
- 问题：查得少问得多
- 改进：能自己查的，先查再问；回复前验证假设

### 下一步行动
- 正式考试前每日模拟练习 5-10 题
- 每次回复前强制执行检查清单
- 记录典型错误模式到本文件
