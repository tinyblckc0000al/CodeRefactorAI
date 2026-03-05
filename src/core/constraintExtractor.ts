import { Constraint } from '../commands/analyze';

export function extractConstraints(code: string, language: string): Constraint[] {
    const constraints: Constraint[] = [];
    
    // 1. 显式约束：类型签名
    const typePattern = /:\s*(string|number|boolean|any|void|never|unknown|\w+(\[\])?)/g;
    let match;
    while ((match = typePattern.exec(code)) !== null) {
        constraints.push({
            type: 'explicit',
            description: `Parameterreturn type: ${match[1]}`
        });
    }
    
   / // 2. 显式约束：API 签名
    const functionPattern = /function\s+(\w+)\s*\(([^)]*)\)/g;
    while ((match = functionPattern.exec(code)) !== null) {
        constraints.push({
            type: 'explicit',
            description: `Function '${match[1]}' with params: ${match[2]}`
        });
    }
    
    // 3. 隐式约束：边界条件（需要 AI 理解）
    if (code.includes('if') || code.includes('throw') || code.includes('catch')) {
        constraints.push({
            type: 'implicit',
            description: 'Contains error handling - must preserve exception behavior'
        });
    }
    
    // 4. 隐式约束：副作用
    if (code.includes('console.') || code.includes('fetch') || code.includes('await')) {
        constraints.push({
            type: 'implicit',
            description: 'Contains I/O operations - side effects must be preserved'
        });
    }
    
    return constraints;
}
