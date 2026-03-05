import { buildDependencyGraph } from '../core/dependencyGraph';

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

export interface GraphNode {
    id: string;
    label: string;
    type: 'module' | 'function' | 'class';
}

export interface GraphLink {
    source: string;
    target: string;
    type: 'import' | 'call' | 'extends';
}

export async function visualizeGraph(code: string, language: string): Promise<GraphData> {
    const dependencies = await buildDependencyGraph(code, language);
    
    const nodes = dependencies.map(dep => ({
        id: dep.id,
        label: dep.name,
        type: dep.type
    }));
    
    const links: GraphLink[] = [];
    for (const dep of dependencies) {
        for (const imp of dep.imports) {
            links.push({
                source: dep.id,
                target: imp,
                type: 'import'
            });
        }
    }
    
    return { nodes, links };
}
