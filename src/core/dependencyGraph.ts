import { DependencyNode } from '../commands/analyze';

export function buildDependencyGraph(code: string, language: string): DependencyNode[] {
    const nodes: DependencyNode[] = [];
    
    if (language === 'javascript' || language === 'typescript') {
        // 提取 import 语句
        const importPattern = /import\s+(?:\{([^}]+)\}|(\w+)|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importPattern.exec(code)) !== null) {
            const moduleName = match[4];
            nodes.push({
                id: moduleName,
                name: moduleName,
                type: 'module',
                imports: [moduleName]
            });
        }
        
        // 提取 require
        const requirePattern = /const\s+\{?\s*(\w+)\s*\}?\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        while ((match = requirePattern.exec(code)) !== null) {
            const moduleName = match[2];
            nodes.push({
                id: moduleName,
                name: moduleName,
                type: 'module',
                imports: [moduleName]
            });
        }
        
        // 提取函数定义
        const funcPattern = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*:\s*(?:async\s*)?\()/g;
        while ((match = funcPattern.exec(code)) !== null) {
            const funcName = match[1] || match[2] || match[3];
            if (funcName && !funcName.includes('.')) {
                nodes.push({
                    id: funcName,
                    name: funcName,
                    type: 'function',
                    imports: []
                });
            }
        }
        
        // 提取类定义
        const classPattern = /class\s+(\w+)(?:\s+extends\s+(\w+))?/g;
        while ((match = classPattern.exec(code)) !== null) {
            const className = match[1];
            const extendsClass = match[2];
            nodes.push({
                id: className,
                name: className,
                type: 'class',
                imports: extendsClass ? [extendsClass] : []
            });
        }
    }
    
    return nodes;
}
