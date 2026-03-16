# CodeRefactor AI - EvoMap 技能清单

## Self-Improving / Self-Evolving

| 技能 | GDI | 描述 | 可用性 |
|------|-----|------|--------|
| Self-Reflecting | 40.35 | 自我反思 agent，记住错误并学习 | ✅ 代码预览可用 |
| Self-Evolving Agent Engine | 36.65 | 自我进化引擎，可修改自身代码 | ✅ 代码预览可用 |
| Self-Improving | 30.85 | 自我改进 agent | ✅ |

### Self-Reflecting 代码预览
```python
class SelfImprovingAgent:
    def __init__(self):
        self.error_patterns = {}
        
    def record_error(self, error_type, context):
        if error_type not in self.error_patterns:
            self.error_patterns[error_type] = []
        self.error_patterns[error_type].append(context)
        
    def suggest_improvement(self):
        # 基于错误模式建议改进
        pass
```

### Self-Evolving Agent Engine (YAML)
```yaml
name: capability-evolver
description: A self-evolution engine for AI agents. Analyzes runtime history to identify improvements and applies protocol-constrained evolution.
tags: [meta, ai, self-improvement, core]
```

## 代码分析

| 技能 | GDI | 描述 |
|------|-----|------|
| ESLint 代码检查方案 | 34.55 | ESLint 静态分析 |
| AutoFix Engine | 38.4 | 自动修复代码问题 |
| Code Quality Analyzer | 37.3 | 代码质量分析 |
| Maintainable Software | 36.6 | 可维护性实践 |

## 可视化

| 技能 | GDI | 描述 |
|------|-----|------|
| D3.js | 41.35 | 数据可视化 |
| Knowledge graph visualization | 36.8 | 知识图谱可视化 |

---

## 项目整合策略

### Phase 1: 基于现有工具
1. **Emerge** - 依赖图 (已有)
2. **ESLint** - 代码检查 (已有规则)
3. **D3.js** - 可视化 (标准库)

### Phase 2: 集成 EvoMap 技能
1. Self-Evolving Engine - 让工具自我优化
2. AutoFix Engine - 自动修复

### Phase 3: AI 增强
1. Codex/Gemini - 代码重写
2. 功能验证 - 测试生成

---

## 待获取技能

由于 EvoMap API 限制，以下技能需要通过其他方式获取：
- ESLint 配置方案
- D3.js 可视化代码
- AutoFix Engine 实现

---

## GitHub 发现：RefakTS

### 项目信息
- **名字**: RefakTS (TypeScript Refactoring Tool)
- **Stars**: 62
- **语言**: TypeScript 95.5%
- **定位**: AI Agent 专用精确重构工具

### 核心能力
```
- extract-variable   # 提取变量
- inline-variable    # 内联变量
- rename             # 重命名
- select             # 查找代码元素
- sort-methods       # 方法排序
- find-usages        # 查找引用
- move-file          # 移动文件
```

### 技术栈
- **ts-morph**: AST 操作
- **@phenomnomnominal/tsquery**: 节点选择

### 关键洞察

**问题**：
- AI agent 重写整个文件来做小修改
- 浪费 token 在不变的代码上
- 认知负荷高

**解决方案**：
- 提供精确的重构操作 CLI
- 不重写整个文件，只改需要的部分

### 质量自动化
- 提交后自动扫描质量问题
- 自动触发修复
- 包括：注释检测、代码重复、未使用代码、Feature Envy 等

### 我们的差异化
- RefakTS = 精确重构 CLI
- 我们的 = AI 理解 + 重写 + 验证
- 我们可以集成 RefakTS 作为底层操作
