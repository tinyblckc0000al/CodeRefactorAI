import { Smell } from '../commands/analyze';

export function detectSmells(code: string, language: string): Smell[] {
    const smells: Smell[] = [];
    
    // 1. Unused variable (simple pattern)
    const unusedPattern = /(?:const|let|var)\s+(\w+)\s*=/g;
    let match;
    while ((match = unusedPattern.exec(code)) !== null) {
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
    
    // 2. Long function (>50 lines)
    const funcPattern = /(?:function|const|let)\s+(\w+)\s*[=(]/g;
    while ((match = funcPattern.exec(code)) !== null) {
        const funcStart = match.index;
        const nextFunc = code.indexOf('function ', funcStart + 1);
        const funcEnd = nextFunc === -1 ? code.length : nextFunc;
        const funcBody = code.substring(funcStart, funcEnd);
        const lineCount = funcBody.split('\n').length;
        
        if (lineCount > 50) {
            smells.push({
                type: 'long-function',
                message: `Function has ${lineCount} lines (recommended: < 50)`,
                line: code.substring(0, funcStart).split('\n').length,
                severity: lineCount > 100 ? 'high' : 'medium'
            });
        }
    }
    
    // 3. Magic number
    const magicPattern = /\b\d{2,}\b/g;
    while ((match = magicPattern.exec(code)) !== null) {
        const lineNum = code.substring(0, match.index).split('\n').length;
        const line = code.split('\n')[lineNum - 1];
        if (line && !line.includes('//') && !line.includes('/*')) {
            smells.push({
                type: 'magic-number',
                message: `Magic number '${match[0]}' should be extracted to a constant`,
                line: lineNum,
                severity: 'low'
            });
        }
    }
    
    // 4. Console statement
    const consolePattern = /console\.(log|debug|info)/g;
    while ((match = consolePattern.exec(code)) !== null) {
        smells.push({
            type: 'console-statement',
            message: 'Remove console statement before production',
            line: code.substring(0, match.index).split('\n').length,
            severity: 'low'
        });
    }
    
    return smells;
}
