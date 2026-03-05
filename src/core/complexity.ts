export function calculateComplexity(code: string, language: string): number {
    let complexity = 1;
    
    // 圈复杂度计算
    const patterns = [
        /\bif\b/g,
        /\belse\b/g,
        /\bfor\b/g,
        /\bwhile\b/g,
        /\bcase\b/g,
        /\bcatch\b/g,
        /\?\s*[^:]+:/g,  // 三元运算符
        /&&/g,
        /\|\|/g
    ];
    
    for (const pattern of patterns) {
        const matches = code.match(pattern);
        if (matches) {
            complexity += matches.length;
        }
    }
    
    return complexity;
}

export function getComplexityLevel(complexity: number): 'simple' | 'medium' | 'complex' {
    if (complexity < 10) return 'simple';
    if (complexity < 20) return 'medium';
    return 'complex';
}
