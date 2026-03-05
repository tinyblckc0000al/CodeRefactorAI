import * as vscode from 'vscode';
import { analyzeCode } from './commands/analyze';
import { rewriteCode } from './commands/rewrite';
import { visualizeGraph } from './commands/visualize';

export function activate(context: vscode.ExtensionContext) {
    // 注册命令
    const analyzeCmd = vscode.commands.registerCommand('refactor.analyze', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor');
            return;
        }
        
        const code = editor.document.getText();
        const result = await analyzeCode(code, editor.document.languageId);
        
        // 显示结果
        vscode.window.showInformationMessage(`Analyzed: ${result.smells.length} smells found`);
        
到 Web        // 输出View
        const panel = vscode.window.createWebviewPanel(
            'refactorView',
            'CodeRefactor AI',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );
        
        panel.webview.html = generateHtml(result);
    });
    
    const rewriteCmd = vscode.commands.registerCommand('refactor.rewrite', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor');
            return;
        }
        
        const code = editor.document.getText();
        const result = await rewriteCode(code, editor.document.languageId);
        
        // 显示重构建议
        const selection = await vscode.window.showInformationMessage(
            'AI Rewritten code available',
            'Preview',
            'Apply'
        );
        
        if (selection === 'Apply' && result.suggestedCode) {
            const edit = new vscode.WorkspaceEdit();
            edit.replace(
                editor.document.uri,
                new vscode.Range(0, 0, editor.document.lineCount, 0),
                result.suggestedCode
            );
            await vscode.workspace.applyEdit(edit);
        }
    });
    
    const visualizeCmd = vscode.commands.registerCommand('refactor.visualize', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor');
            return;
        }
        
        const code = editor.document.getText();
        const graph = await visualizeGraph(code, editor.document.languageId);
        
        // 在新窗口显示图
        const panel = vscode.window.createWebviewPanel(
            'dependencyGraph',
            'Dependency Graph',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );
        
        panel.webview.html = generateGraphHtml(graph);
    });
    
    context.subscriptions.push(analyzeCmd, rewriteCmd, visualizeCmd);
}

function generateHtml(result: any): string {
    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: system-ui; padding: 20px; }
        .smell { padding: 10px; margin: 5px 0; background: #fee; border-left: 3px solid red; }
        .metric { display: inline-block; margin: 10px 20px; }
    </style>
</head>
<body>
    <h1>Code Analysis Results</h1>
    <div>
        <div class="metric">Complexity: <strong>${result.complexity}</strong></div>
        <div class="metric">Smells: <strong>${result.smells.length}</strong></div>
    </div>
    <h2>Code Smells</h2>
    ${result.smells.map((s: any) => `<div class="smell">${s.type}: ${s.message}</div>`).join('')}
</body>
</html>`;
}

function generateGraphHtml(graph: any): string {
    return `<!DOCTYPE html>
<html>
<head>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        body { font-family: system-ui; padding: 20px; }
        svg { border: 1px solid #ccc; }
        .node circle { fill: #69b3a2; stroke: #fff; stroke-width: 2px; }
        .link { stroke: #999; stroke-opacity: 0.6; }
    </style>
</head>
<body>
    <h1>Dependency Graph</h1>
    <div id="graph"></div>
    <script>
        const data = ${JSON.stringify(graph)};
        // D3.js force graph here
    </script>
</body>
</html>`;
}

export function deactivate() {}
