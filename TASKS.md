# CodeRefactor AI - 3天开发任务

## 目标
MVP: VSCode 插件，实现代码解析 + 依赖图 + Smell检测 + AI重写建议

---

## Day 1: 基础设施 + 解析

### 上午
| 任务 | 负责人 | 输出 |
|------|--------|------|
| VSCode 插件骨架 | Agent-1 | package.json, tsconfig, 基础结构 |
| Tree-sitter 集成 | Agent-1 | JS/TS parser |
| 命令注册 | Agent-1 | refactor.analyze, refactor.rewrite |

### 下午
| 任务 | 负责人 | 输出 |
|------|--------|------|
| 基础依赖图 | Agent-2 | 模块级依赖关系 |
| WebView 骨架 | Agent-1 | HTML + 基础 UI |
| 解析命令测试 | Agent-2 | 可运行的 demo |

---

## Day 2: 核心功能

### 上午
| 任务 | 负责人 | 输出 |
|------|--------|------|
| Smell 检测规则 | Agent-1 | ESLint 规则扩展 |
| AI 重写集成 | Agent-2 | Codex API 调用 |
| 约束提取 | Agent-1 | 显式约束解析 |

### 下午
| 任务 | 负责人 | 输出 |
|------|--------|------|
| 依赖图可视化 | Agent-2 | D3.js 渲染 |
| 重写预览 | Agent-1 | Diff 展示 |
| 功能验证测试 | Agent-2 | 基础验证 |

---

## Day 3: 完善 + 发布

### 上午
| 任务 | 负责人 | 输出 |
|------|--------|------|
| 复杂度分级 | Agent-1 | 简单/中等/复杂判断 |
| UI 优化 | Agent-2 | 更好的交互 |
| README 完善 | Agent-1 | 使用文档 |

### 下午
| 任务 | 负责人 | 输出 |
|------|--------|------|
| 本地测试 | Agent-2 | 完整功能测试 |
| VSCode 发布 | Agent-1 | .vsix 包 |
| GitHub 发布 | Agent-1 | Release |

---

## Agent 分配

- **Agent-1**: 前端/VSCode (TypeScript + WebView)
- **Agent-2**: 后端/AI (Python/Node + AI API)

## 关键里程碑

1. Day1 结束: 能解析代码 + 显示依赖
2. Day2 结束: 能检测 Smell + AI 重写
3. Day3 结束: 可发布的 VSCode 插件
