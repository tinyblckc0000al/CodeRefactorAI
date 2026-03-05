import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// RefakTS CLI 集成
// 用于精确重构操作

export interface RefaktCommand {
    name: string;
    args: string[];
}

export class RefaktsIntegration {
    private installed: boolean = false;
    
    async checkInstallation(): Promise<boolean> {
        try {
            await execAsync('refakts --version');
            this.installed = true;
            return true;
        } catch {
            return false;
        }
    }
    
    async install(): Promise<void> {
        try {
            await execAsync('npm install -g refakts');
            this.installed = true;
        } catch (error) {
            throw new Error('Failed to install RefakTS: ' + error);
        }
    }
    
    // 提取变量
    async extractVariable(location: string, name: string): Promise<string> {
        return this.run('extract-variable', [`"${location}"`, '--name', name]);
    }
    
    // 内联变量
    async inlineVariable(location: string): Promise<string> {
        return this.run('inline-variable', [`"${location}"`]);
    }
    
    // 重命名
    async rename(location: string, newName: string): Promise<string> {
        return this.run('rename', [`"${location}"`, '--to', newName]);
    }
    
    // 查找引用
    async findUsages(target: string): Promise<string> {
        return this.run('find-usages', [target]);
    }
    
    // 移动文件
    async moveFile(source: string, target: string): Promise<string> {
        return this.run('move-file', [source, '--to', target]);
    }
    
    private async run(command: string, args: string[]): Promise<string> {
        if (!this.installed) {
            await this.checkInstallation();
            if (!this.installed) {
                throw new Error('RefakTS not installed. Run: npm install -g refakts');
            }
        }
        
        try {
            const { stdout, stderr } = await execAsync(
                `refakts ${command} ${args.join(' ')}`,
                { timeout: 30000 }
            );
            return stdout || stderr;
        } catch (error: any) {
            throw new Error(`RefakTS ${command} failed: ${error.message}`);
        }
    }
}

export const refakts = new RefaktsIntegration();
