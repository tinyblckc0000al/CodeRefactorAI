import { detectSmells } from '../core/smellDetector';
import { calculateComplexity } from '../core/complexity';
import { extractConstraints } from '../core/constraintExtractor';
import { buildDependencyGraph } from '../core/dependencyGraph';

export interface AnalysisResult {
    smells: Smell[];
    complexity: number;
    constraints: Constraint[];
    dependencies: DependencyNode[];
}

export interface Smell {
    type: string;
    message: string;
    line: number;
    severity: 'low' | 'medium' | 'high';
}

export interface Constraint {
    type: 'explicit' | 'implicit';
    description: string;
}

export interface DependencyNode {
    id: string;
    name: string;
    type: 'module' | 'function' | 'class';
    imports: string[];
}

export async function analyzeCode(code: string, language: string): Promise<AnalysisResult> {
    // 1. Smell 检测
    const smells = detectSmells    
    // (code, language);
2. 复杂度计算
    const complexity = calculateComplexity(code, language);
    
    // 3. 约束提取
    const constraints = extractConstraints(code, language);
    
    // 4. 依赖图构建
    const dependencies = buildDependencyGraph(code, language);
    
    return {
        smells,
        complexity,
        constraints,
        dependencies
    };
}
