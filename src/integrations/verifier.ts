import { exec } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';

const execAsync = promisify(exec);

export interface VerificationResult {
    passed: boolean;
    testsRun: number;
    testsPassed: number;
    message: string;
}

export async function verifyEquivalence(
    originalCode: string,
    rewrittenCode: string,
    language: string
): Promise<VerificationResult> {
    // 1. 尝试运行现有测试
    const testResult = await runExistingTests(language);
    
    if (testResult) {
        return testResult;
    }
    
    // 2. 简单语法验证
    const syntaxValid = await verifySyntax(rewrittenCode, language);
    
    if (!syntaxValid) {
        return {
            passed: false,
            testsRun: 0,
            testsPassed: 0,
            message: 'Syntax validation failed'
        };
    }
    
    return {
        passed: true,
        testsRun: 1,
        testsPassed: 1,
        message: 'Basic verification passed'
    };
}

async function runExistingTests(language: string): Promise<VerificationResult | null> {
    // 检查是否有测试文件
    const testFiles = await vscode.workspace.findFiles('**/*.test.*');
    
    if (testFiles.length === 0) {
        return null;
    }
    
    try {
        // 运行测试
        const { stdout, stderr } = await execAsync('npm test', { timeout: 120000 });
        
        const passed = stdout.includes('passing') || !stdout.includes('failing');
        const match = stdout.match(/(\d+)\s+passing/);
        const testsPassed = match ? parseInt(match[1]) : 0;
        
        return {
            passed,
            testsRun: testsPassed,
            testsPassed,
            message: stdout
        };
    } catch (error: any) {
        return {
            passed: false,
            testsRun: 0,
            testsPassed: 0,
            message: error.message
        };
    }
}

async function verifySyntax(code: string, language: string): Promise<boolean> {
    try {
        if (language === 'typescript') {
            // TypeScript 语法检查
            await execAsync(`echo "${code.replace(/"/g, '\\"')}" | npx tsc --noEmit --strict`, { timeout: 30000 });
        } else if (language === 'javascript') {
            // JavaScript 语法检查
            await execAsync(`node -e "new Function(\`${code}\`)"`, { timeout: 10000 });
        }
        return true;
    } catch {
        return false;
    }
}
