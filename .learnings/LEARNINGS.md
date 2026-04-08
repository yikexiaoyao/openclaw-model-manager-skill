# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice

---

## LRN-20260408-001 best_practice

**Logged**: 2026-04-08T18:33:00+08:00
**Priority**: high
**Status**: pending
**Area**: config

### Summary
实施前检查清单必须主动执行，不能依赖用户提醒

### Details
用户指出每次实施前应该主动检查依赖、配置、权限、环境状态
之前习惯等用户提醒才检查，这是被动行为

### Suggested Action
- 每次执行任务前自动检查相关前置条件
- 记录检查过程和结果到 MEMORY.md

### Metadata
- Source: user_feedback
- Tags: workflow, proactive
- Pattern-Key: preflight.checklist
- Recurrence-Count: 1
- First-Seen: 2026-04-08

---

## LRN-20260408-002 best_practice

**Logged**: 2026-04-08T18:36:00+08:00
**Priority**: high
**Status**: pending
**Area**: config

### Summary
小模型沙箱配置必须启用，防止提示注入攻击

### Details
当前 fallback 模型 Qwen3.5-9B-MLX-4bit (9B 参数) 无沙箱保护
小模型更容易被攻击，需要限制资源访问

### Suggested Action
- 添加配置：`agents.defaults.sandbox.mode: "all"`
- 禁用：`gateway.controlUi.allowInsecureAuth: false`

### Metadata
- Source: security_audit
- Tags: security, sandbox, small-model
- Pattern-Key: sandbox.required
- Recurrence-Count: 1
- First-Seen: 2026-04-08
- See Also: LRN-20260408-001

---
