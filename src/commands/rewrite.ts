import { analyzeCode, AnalysisResult } from './analyze';
import { aiRewrite } from '../integrations/aiRewriter';
import { verifyEquivalence } from '../integrations/verifier';

export interface RewriteResult {
    originalCode: string;
    suggestedCode: string;
    changes: Change[];
    verification: VerificationResult;
}

export interface Change {
    type: string;
    description: string;
    line: number;
}

export interface VerificationResult {
    passed: boolean;
    testsRun: number;
    testsPassed: number;
}

export async function rewriteCode(code: string, language: string): Promise<RewriteResult> {
    // 1. 先分析
    const analysis = await analyzeCode(code, language);
    
    // 2. AI 重写
    const suggestedCode = await aiRewrite(code, language, analysis);
    
    // 3. 验证功能等价
    const verification = await verifyEquivalence(code, suggestedCode, language);
    
    return {
        originalCode: code,
        suggestedCode,
        changes: [],
        verification
    };
}
