import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// EvoMap Self-Evolving 集成
// 记录重构效果，自动优化策略

export interface RefactorRecord {
    timestamp: string;
    originalCode: string;
    rewrittenCode: string;
    verificationPassed: boolean;
    smellsFixed: string[];
    complexityBefore: number;
    complexityAfter: number;
}

export class EvoMapIntegration {
    private recordsPath: string;
    private records: RefactorRecord[] = [];
    
    constructor() {
        this.recordsPath = path.join(process.cwd(), '.coderefactor-history.json');
        this.load();
    }
    
    private load(): void {
        try {
            if (fs.existsSync(this.recordsPath)) {
                this.records = JSON.parse(fs.readFileSync(this.recordsPath, 'utf-8'));
            }
        } catch {
            this.records = [];
        }
    }
    
    private save(): void {
        fs.writeFileSync(this.recordsPath, JSON.stringify(this.records, null, 2));
    }
    
    // 记录重构
    async record(result: RefactorRecord): Promise<void> {
        result.timestamp = new Date().toISOString();
        this.records.push(result);
        this.save();
        
        // 分析趋势
        await this.analyzeTrends();
    }
    
    // 分析效果趋势
    private async analyzeTrends(): Promise<void> {
        const recent = this.records.slice(-10);
        
        if (recent.length < 3) return;
        
        // 计算成功率
        const successRate = recent.filter(r => r.verificationPassed).length / recent.length;
        
        // 计算平均复杂度降低
        const avgReduction = recent.reduce((sum, r) => 
            sum + (r.complexityBefore - r.complexityAfter), 0) / recent.length;
        
        console.log(`[EvoMap] Success Rate: ${(successRate * 100).toFixed(1)}%`);
        console.log(`[EvoMap] Avg Complexity Reduction: ${avgReduction.toFixed(1)}`);
        
        // 如果成功率下降，提示需要调整
        if (successRate < 0.7) {
            console.warn('[EvoMap] Warning: Success rate below 70%, consider adjusting strategy');
        }
    }
    
    // 获取优化建议
    getOptimizationSuggestions(): string[] {
        const suggestions: string[] = [];
        
        if (this.records.length < 5) {
            return ['Need more data for optimization'];
        }
        
        const recent = this.records.slice(-10);
        
        // 分析失败的模式
        const failed = recent.filter(r => !r.verificationPassed);
        if (failed.length > 3) {
            suggestions.push('Consider more conservative refactoring for complex code');
        }
        
        // 分析复杂度
        const highComplexity = recent.filter(r => r.complexityAfter > 15);
        if (highComplexity.length > 5) {
            suggestions.push('Focus on reducing complexity in high-complexity functions');
        }
        
        return suggestions;
    }
    
    // 获取统计
    getStats(): any {
        return {
            totalRefactors: this.records.length,
            successRate: this.records.filter(r => r.verificationPassed).length / this.records.length,
            avgComplexityReduction: this.records.reduce((sum, r) => 
                sum + (r.complexityBefore - r.complexityAfter), 0) / Math.max(1, this.records.length)
        };
    }
}

export const evomap = new EvoMapIntegration();
