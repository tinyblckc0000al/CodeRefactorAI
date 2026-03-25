# CodeRefactorAI

> An AI-powered code refactoring engine built for the era of AI-generated code.

## Problem

Large Language Models (LLMs) are now capable of writing substantial amounts of code. However, AI-generated code comes with unique challenges that traditional tooling doesn't address:

1. **Implicit Dependencies** — LLMs often generate code using libraries or functions without clear import statements, making dependency graphs unreliable.

2. **Hidden Side Effects** — Code modifications may unintentionally affect other functionalities, especially in projects with complex state management.

3. **Equivalence Verification** — When refactoring AI-generated code, how do we verify that the new code behaves identically to the original?

## Solution

CodeRefactorAI is an AI refactoring engine designed specifically for AI-generated code. Our approach combines three core technologies:

- **Dependency Analysis** — Deep static analysis to accurately map code dependencies beyond surface-level imports
- **Side-Effect Tracking** — Model the state changes and side effects of code blocks to predict ripple effects
- **Equivalence Verification** — Validate that refactored code maintains identical behavior through contract-based testing

Additionally, we pioneered:
- **Constraint Extraction** — Extracting both explicit and AI-implicit constraints from code
- **Smell Detection** — Identifying dead code, redundant encapsulation, unreachable conditions
- **Self-Evolving** — Integration with EvoMap for continuous improvement

## What It Enables

- **Trustworthy AI Code Refactoring** — Refactor AI-generated code with confidence, knowing dependencies and side effects are tracked
- **Automated Code Quality** — Enforce consistent patterns across AI-generated codebases
- **Safe Migration** — Safely refactor legacy code with AI assistance while preserving semantics
- **CI/CD Integration** — Automate refactoring in build pipelines with equivalence guarantees

## Tech Stack

- **Core Engine**: TypeScript (VSCode Extension)
- **Parser**: Tree-sitter for precise code parsing
- **Analysis**: AST parsing, dependency analysis
- **AI Integration**: OpenAI Codex, Gemini (extensible)
- **Visualization**: D3.js for dependency graphs

## Status

This project is currently under active development, with a working prototype and planned validation on real-world codebases.

## Demo

A minimal prototype demonstrating AI-powered refactoring:

- **Input**: Simple JavaScript/TypeScript function
- **Output**: Refactored structure with extracted functions

Run:

```bash
cd demo
node index.js
```

The demo includes:
- `index.js` - Main demo entry point
- `example-input.js` - Sample input code
- `example-output.js` - Expected output after refactoring

## Roadmap

### Phase 1: Prototype (Current)
- [x] VSCode extension scaffolding
- [x] AST parsing foundation
- [x] Simple dependency extraction
- [x] Minimal demo with AI refactoring

### Phase 2: Dependency & Analysis
- [ ] Advanced dependency graph construction
- [ ] Side-effect modeling for common patterns
- [ ] Smell detection (dead code, redundant encapsulation)
- [ ] Constraint extraction (explicit + implicit)

### Phase 3: Production-Grade Refactoring Engine
- [ ] Equivalence verification framework
- [ ] Multi-language support (Python, Go, Rust)
- [ ] Self-evolving with EvoMap integration
- [ ] CI/CD integration and APIs

---

**License**: MIT  
**Author**: tinyblckc0000al  
**Repository**: https://github.com/tinyblckc0000al/CodeRefactorAI