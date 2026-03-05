import { Smell } from '../commands/analyze';

// 基于 ESLint 规则扩展的 Smell 检测
export function detectSmells(code: string, language: string): Smell[] {
    const smells: Smell[] = [];
    
    // 1. 检测死代码 (未使用变量)
    const unusedVarPattern = /(?:const|let|var)\s+(\w+)\s*=/g;
    let match;
    while ((match = unusedVarPattern.exec(code)) !== null) {
        const varName = match[1];
        const usageCount = (code.match(new RegExp(`\\b${varName}\\b`, 'g')) || []).length;
        if (usageCount === 1) {
            smells.push({
                type: 'unused-variable',
                message: `Variable '${varName}' is declared but never used`,
                line: code.substring(0, match.index).split('\n').length,
                severity: 'medium'
            });
        }
    }
    
    // 2. 检测过长的函数
    const functionPattern = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*:\s*(?:async\s*)?\()/g;
    let funcMatch;
    while ((funcMatch = functionPattern.exec(code)) !== null) {
        const funcName = funcMatch[1] || funcMatch[2] || funcMatch[3];
        if (funcName) {
            const funcStart = funcMatch.index;
            const nextFunc = code.indexOf('function ', funcStart + 1);
            const funcEnd = nextFunc === -1 ? code.length : nextFunc;
            const funcBody = code.substring(funcStart, funcEnd);
            const lineCount = funcBody.split('\n').length;
            
            if (lineCount > 50) {
                smells.push({
                    type: 'long-function',
                    message: `Function '${funcName}' has ${lineCount} lines (recommended: < 50)`,
                    line: code.substring(0, funcStart).split('\n').length,
                    severity: lineCount > 100 ? 'high' : 'medium'
                });
            }
        }
    }
    
    // 3. 检测不必要的 async 包装
    const unnecessaryAsync = /async\s+function\s+\w+\s*\(\s*\)\s*\{\s*return\s+(\w+)/g;
    let asyncMatch;
    while ((asyncMatch = unnecessaryAsync.exec(code)) !== null) {
        smells.push({
            type: 'unnecessary-async',
            message: `Unnecessary async wrapper, can return '${asyncMatch[1]}' directly`,
            line: code.substring(0, asyncMatch.index).split('\n').length,
            severity: 'low'
        });
    }
    
    // 4. 检测魔法数字
    const magicNumber = /\b\d{2,}\b/g;
    let magicMatch;
    while ((magicMatch = magicNumber.exec(code)) !== null) {
        const lineNum = code.substring(0, magicMatch.index).split('\n').length;
        const line = code.split('\n')[lineNum - 1];
        if (!line.includes('//') && !line.includes('/*')) {
            smells.push({
                type: 'magic-number',
                message: `Magic number '${magicMatch[0]}' should be extracted to a named constant`,
                line: lineNum,
                severity: 'low'
            });
        }
    }
    
    // 5. 检测 console.log
    const consolePattern = /console\.(log|debug|info)/g;
    let consoleMatch;
    while ((consoleMatch = consolePattern.exec(code)) !== null) {
        smells.push({
            type: 'console-statement',
            message: `Remove console statement before production`,
            line: code.substring(0, consoleMatch.index).split('\n').length,
            severity: 'low'
        });
    }
    
    return smells;
}

// 扩展 Smell 检测
export function detectMoreSmells(code: string, language: string): Smell[] {
    const smells: Smell[] = [];
    
    // 6. 检测重复代码 (简单近似)
    const lines = code.split('\n');
    for (let i = 0; i < lines.length - 3; i++) {
        const block = lines.slice(i, i + 4).join('\n').trim();
        if (block.length > 50) {
            for (let j = i + 1; j < lines.length - 3; j++) {
                const compareBlock = lines.slice(j, j + 4).join('\n').trim();
                if (block === compareBlock && block.length > 100) {
                    smells.push({
                        type: 'duplicate-code',
                        message: `Duplicate code block found (lines ${i + 1} and ${j + 1})`,
                        line: i + 1,
                        severity: 'medium'
                    });
                    break;
                }
            }
        }
    }
    
    // 7. 检测 Feature Envy (过度访问其他对象)
    const thisPattern = /this\.(\w+)/g;
    const thisRefs: string[] = [];
    while ((match = thisPattern.exec(code)) !== null) {
        thisRefs.push(match[1]);
    }
    
    if (thisRefs.length > 10) {
        smells.push({
            type: 'feature-envy',
            message: `Method accesses ${thisRefs.length} fields of 'this' - possible Feature Envy`,
            line: 1,
            severity: 'medium'
        });
    }
    
    // 8. 检测 God Class 倾向 (大量方法)
    const methodPattern = /(?:function\s+(\w+)|(\w+)\s*\([^)]*\)\s*\{)/g;
    const methods: string[] = [];
    while ((match = methodPattern.exec(code)) !== null) {
        methods.push(match[1] || match[2]);
    }
    
    if (methods.length > 20) {
        smells.push({
            type: 'god-class',
            message: `Class has ${methods.length} methods - consider splitting`,
            line: 1,
            severity: 'high'
        });
    }
    
    // 9. 检测 Promise 嵌套 (回调地狱)
    const promiseNest = code.match(/\.then\([^)]*\)\s*\.then/g);
    if (promiseNest && promiseNest.length > 2) {
        smells.push({
            type: 'promise-hell',
            message: `${promiseNest.length} nested .then() - consider async/await`,
            line: 1,
            severity: 'medium'
        });
    }
    
    // 10. 检测不安全的 any 类型
    const unsafeAny = /:\s*any\b/g;
    let anyMatch;
    while ((anyMatch = unsafeAny.exec(code)) !== null) {
        smells.push({
            type: 'unsafe-any',
            message: 'Use of `any` type reduces type safety',
            line: code.substring(0, anyMatch.index).split('\n').length,
            severity: 'low'
        });
    }
    
    return smells;
}
