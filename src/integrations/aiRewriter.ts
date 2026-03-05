import { exec } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import { AnalysisResult } from '../commands/analyze';

const execAsync = promisify(exec);

export async function aiRewrite(
    code: string,
    language: string,
    analysis: AnalysisResult
): Promise<string> {
    // 获取 API key
    const config = vscode.workspace.getConfiguration('refactorAI');
    const apiKey = config.get<string>('codexApiKey');
    
    if (!apiKey) {
        throw new Error('Codex API key not configured. Set refactorAI.codexApiKey in settings.');
    }
    
    // 构建 prompt
    const prompt = buildRewritePrompt(code, language, analysis);
    
    // 调用 Codex CLI
    try {
        const { stdout } = await execAsync(
            `codex -q "${prompt.replace(/"/g, '\\"')}"`,
            { timeout: 60000 }
        );
        
        return stdout.trim();
    } catch (error) {
        console.error('Codex call failed:', error);
        throw new Error('AI rewrite failed. Please check your API key.');
    }
}

function buildRewritePrompt(code: string, language: string, analysis: AnalysisResult): string {
    const constraints = analysis.constraints
        .map(c => `- ${c.type}: ${c.description}`)
        .join('\n');
    
    const smells = analysis.smells
        .map(s => `- ${s.type}: ${s.message}`)
        .join('\n');
    
    return `You are a code refactoring expert. 

Original ${language} code:
\`\`\`${language}
${code}
\`\`\`

Constraints (must preserve):
${constraints}

Code smells to fix:
${smells}

Requirements:
1. Maintain functional equivalence (same inputs → same outputs)
2. Fix all code smells
3. Preserve all constraints
4. Keep the same API signature
5. Optimize for readability and maintainability

Provide the refactored code:`;
}

export async function callGemini(code: string, prompt: string): Promise<string> {
    const config = vscode.workspace.getConfiguration('refactorAI');
    const apiKey = config.get<string>('geminiApiKey');
    
    if (!apiKey) {
        throw new Error('Gemini API key not configured');
    }
    
    // Gemini API 调用
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}
