# AI 代码重构工具 - 深度调研报告

> 调研时间: 2026-03-05
> 调研方式: GitHub API + Google Search + 已有知识

---

## 一、现有产品/项目分析

### 1.1 AI 代码重构工具 (GitHub)

| 项目 | ⭐ | 描述 | 特点 |
|------|---|------|------|
| **ai_refactor** | 41 | AI Refactor 实验工具 | 简单 AI 重写 |
| **RefactorMate** | 25 | Visual Studio AI 重构 | 商业产品 |
| **Metabob** | - | VSCode + GNN + LLM | AI 代码审查+重构 |
| **CarryCode** | 18 | 终端 AI 编程 Agent | CLI 工具 |
| **ReAI** | 8 | LLM Agent 重构 | 实验性质 |

### 1.2 VSCode 扩展 (Marketplace)

| 扩展 | 功能 |
|------|------|
| **Metabob** | AI 代码审查 + 重构建议 |
| **Qodo Gen** | AI 代码生成 + 重构 |
| **Code Dependency Visualizer** | Python 依赖图可视化 |
| **GitHub Copilot** | 代码补全 |
| **Tabnine** | 代码补全 |
| **Sourcegraph Cody** | 代码理解 + 问答 |

### 1.3 代码分析/图工具

| 工具 | ⭐ | 语言 | 用途 |
|------|---|------|------|
| **Joern** | 2973 | 多语言 | 代码依赖图分析 |
| **Tree-sitter** | - | 多语言 | AST 解析 |
| **static-analysis** | 14414 | Rust | 静态分析框架 |
| **CodeQL** | - | 多语言 | 代码查询 |

---

## 二、核心技术栈

### 2.1 代码解析 (AST)

| 技术 | 语言 | 成熟度 | 说明 |
|------|------|--------|------|
| **Tree-sitter** | 多语言 | ⭐⭐⭐⭐⭐ | Facebook 开源，最强多语言 AST |
| **Python ast** | Python | ⭐⭐⭐⭐⭐ | 内置，简单 |
| **Babel** | JS/TS | ⭐⭐⭐⭐⭐ | JS 编译 |
| **Esprima** | JS | ⭐⭐⭐ | JS AST |
| **TsMorph** | TS | ⭐⭐⭐⭐ | TS AST 操作 |

### 2.2 依赖图/数据流

| 技术 | 说明 |
|------|------|
| **Joern** | 最强开源代码分析，支持 C/C++/Java/JS/Python/Go |
| **CodeQL** | GitHub 代码查询 (商业) |
| **pydeps** | Python 依赖图 |
| **madge** | JS 模块依赖图 |

### 2.3 可视化

| 技术 | 用途 |
|------|------|
| **D3.js** | 数据流图 |
| **Mermaid** | 流程图 |
| **Graphviz** | 依赖图 |
| **VSCode Webview** | 内置 UI |

### 2.4 AI 重写

| 模型 | 用途 | 本地可用 |
|------|------|----------|
| **Codex** | 代码生成/重写 | ✅ 已安装 |
| **Gemini** | 代码理解 | ✅ 已安装 |
| **Claude** | 代码理解 | API |

---

## 三、需求拆解

### 3.1 功能模块

| 模块 | 子功能 | 技术难度 |
|------|--------|----------|
| **1. 代码读取** | 文件解析、模块识别 | ⭐ |
| **2. AST 解析** | 多语言支持、语法树构建 | ⭐⭐ |
| **3. 依赖图** | 导入分析、调用关系 | ⭐⭐⭐ |
| **4. 数据流图** | 变量追踪、控制流 | ⭐⭐⭐⭐ |
| **5. 功能理解** | AI 语义分析 | ⭐⭐⭐ |
| **6. AI 重写** | 代码转换、目标语言 | ⭐⭐⭐ |
| **7. 等价验证** | 测试生成、差分测试 | ⭐⭐⭐⭐⭐ |
| **8. 可视化** | 图形展示、交互 | ⭐⭐⭐ |

### 3.2 关键挑战

#### 挑战 1: 功能等价验证
**问题**: AI 重写后如何确保功能完全等价？

**方案**:
| 方案 | 成本 | 可靠性 | 说明 |
|------|------|--------|------|
| A. 自动化测试生成 | 中 | ⭐⭐⭐ | AI 生成测试用例，原代码+新代码都跑 |
| B. 差分测试 | 低 | ⭐⭐⭐ | 相同输入对比输出 |
| C. 形式化验证 | 高 | ⭐⭐⭐⭐⭐ | Coq/Lean 证明 |
| D. 模糊测试 | 低 | ⭐⭐ | 随机输入压力测试 |

**推荐**: 方案 A + B 结合

#### 挑战 2: 数据流追踪
**问题**: 如何准确跟踪变量传递、状态变化？

**方案**:
- AST + 控制流分析 (CFG)
- 使用 Joern 图数据库查询
- AI 辅助理解语义

#### 挑战 3: 多语言支持
**优先级**:
1. **Phase 1**: Python (生态好，ast 内置)
2. **Phase 2**: JavaScript/TypeScript (Tree-sitter)
3. **Phase 3**: Go, Rust

---

## 四、差异化定位

### 4.1 现有方案的不足

| 方案 | 不足 |
|------|------|
| Copilot/Tabnine | 只是补全，无重构 |
| Cline/Cursor | 交互式，非自动化 |
| Metabob | 主要做审查，非完整重构 |
| 传统重构工具 | 无 AI 语义理解 |

### 4.2 我们的机会

**核心差异化**: 
> 自动化 + 完整流程 (理解→图→重写→验证)

| 差异化点 | 说明 |
|----------|------|
| **完整流程** | 读取→解析→图→重写→验证 |
| **可视化** | 依赖图+数据流图展示 |
| **等价验证** | 自动测试+差分验证 |
| **跨语言** | 目标语言可指定 |

---

## 五、技术架构

```
┌────────────────────────────────────────────────────────────────┐
│                     VSCode Extension                           │
├────────────────────────────────────────────────────────────────┤
│  UI Layer (Webview)                                           │
│  ├─ 代码展示面板 (左)                                         │
│  ├─ 依赖图/数据流可视化 (中)                                   │
│  └─ 重写预览 + Diff (右)                                       │
├────────────────────────────────────────────────────────────────┤
│  Core Engine                                                  │
│  ├─ FileReader: 文件/目录读取                                 │
│  ├─ ASTParser: 多语言 AST 解析 (Tree-sitter)                │
│  ├─ DependencyGraph: 依赖图构建 (Joern)                        │
│  ├─ DataFlowAnalyzer: 数据流分析                               │
│  ├─ SemanticAnalyzer: AI 语义理解 (Codex/Gemini)              │
│  ├─ CodeRewriter: AI 驱动重写                                 │
│  ├─ EquivalenceVerifier: 功能等价验证                          │
│  └─ Visualizer: D3.js/Mermaid 渲染                           │
├────────────────────────────────────────────────────────────────┤
│  Language Adapters                                            │
│  ├─ PythonAdapter (ast + Tree-sitter)                        │
│  ├─ JavaScriptAdapter (Babel + Tree-sitter)                  │
│  ├─ TypeScriptAdapter (TsMorph + Tree-sitter)                │
│  └─ GoAdapter / RustAdapter (后续)                            │
└────────────────────────────────────────────────────────────────┘
```

---

## 六、实施路线

### Phase 1: MVP (2-3 周)
**目标**: 单语言 + 基础重构 + 简单可视化

| 任务 | 时间 | 技术 |
|------|------|------|
| VSCode 扩展脚手架 | 2 天 | yo code |
| Python AST 解析 | 3 天 | ast + Tree-sitter |
| 依赖图提取 | 3 天 | pydeps/自定义 |
| 简单重构能力 | 5 天 | Codex API |
| 基础 UI | 3 天 | Webview |

**交付**: 能解析 Python 文件，展示依赖图，做简单重写

### Phase 2: 增强 (1-2 月)
- 多语言支持 (JS/TS)
- 数据流分析
- 更好的可视化
- 更强的 AI 重写

### Phase 3: 验证 (持续)
- 自动化测试生成
- 差分测试
- 形式化验证 (可选)

---

## 七、下一步行动

1. **确认方向**: 这个方向可以吗？要不要调整？
2. **选语言**: Python 还是 JS/TS 先做？
3. **MVP 范围**: 精简到最小可用功能
4. **开始编码**: 让 Codex/Gemini 辅助

---

## 附录: 参考资源

- Tree-sitter: https://tree-sitter.github.io
- Joern: https://joern.io
- VSCode Webview: https://code.visualstudio.com/api/extension-guides/webview
- Metabob: https://marketplace.visualstudio.com/items?itemName=Metabob.metabob
