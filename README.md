# CodeRefactor AI

AI-powered code refactoring tool with constraint-based rewriting and functional equivalence verification.

## 核心能力

- **代码解析**: AST 解析 + 依赖分析
- **约束提取**: 显式约束 + AI 隐式约束理解
- **Smell 检测**: 死代码/冗余封装/不可达条件
- **AI 重写**: Codex/Gemini 驱动
- **功能等价验证**: 差分测试
- **可视化**: 依赖图 + 数据流

## 差异化

1. 约束提取 (业界无)
2. 功能等价验证 (业界无)
3. Self-Evolving (集成 EvoMap)
4. 复杂度分级处理

## 技术栈

- TypeScript (VSCode Extension)
- Tree-sitter (代码解析)
- Emerge (依赖图)
- RefakTS (精确重构 CLI)
- Codex/Gemini (AI)
- D3.js (可视化)

## 架构

```
┌─────────────────────────────────────────────┐
│           VSCode Extension                  │
├─────────────────────────────────────────────┤
│  UI Layer (Webview + D3.js)               │
├─────────────────────────────────────────────┤
│  Core Engine                               │
│  - Parser (Tree-sitter)                   │
│  - Constraint Extractor                    │
│  - Smell Detector (ESLint)                 │
│  - AI Rewriter (Codex)                    │
│  - Verifier (Diff Test)                   │
├─────────────────────────────────────────────┤
│  Integrations                              │
│  - RefakTS (精确重构)                     │
│  - EvoMap (Self-Evolving)                 │
└─────────────────────────────────────────────┘
```

## 开发计划 (3天)

### Day 1: 基础设施
- [ ] 项目初始化
- [ ] VSCode 插件骨架
- [ ] Parser 集成 (Tree-sitter)
- [ ] 基础命令注册

### Day 2: 核心功能
- [ ] 依赖图生成
- [ ] Smell 检测
- [ ] AI 重写集成

### Day 3: 验证 + 发布
- [ ] 功能等价验证
- [ ] 可视化
- [ ] 发布

## License

MIT

---

## 本地开发

```bash
# 安装依赖
npm install

# 编译
npm run compile

# 开发模式
npm run watch
```

## 推送指南

由于环境中没有 gh CLI，需要手动推送：

```bash
# 1. 在 GitHub 创建仓库
# 2. 添加 remote
git remote add origin https://github.com/YOUR_USERNAME/CodeRefactorAI.git

# 3. 推送
git push -u origin master
```

## 当前进度

- ✅ Day 1: 基础设施 + 核心模块
- ⏳ Day 2: 核心功能 (Smell检测, AI重写)
- ⏳ Day 3: 验证 + 发布
