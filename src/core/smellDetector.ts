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
