#!/usr/bin/env python3
"""AI Refactor CLI - Python 代码解析和基础重构工具"""

import argparse
import ast
import json
import sys
from pathlib import Path
from typing import Any, Optional


class PythonAnalyzer(ast.NodeVisitor):
    """AST 分析器，提取代码结构"""
    
    def __init__(self):
        self.imports = []
        self.functions = []
        self.classes = []
        self.variables = []
        self.current_class = None
    
    def visit_Import(self, node):
        for alias in node.names:
            self.imports.append({
                'name': alias.name,
                'asname': alias.asname
            })
        self.generic_visit(node)
    
    def visit_ImportFrom(self, node):
        for alias in node.names:
            self.imports.append({
                'module': node.module,
                'name': alias.name,
                'asname': alias.asname
            })
        self.generic_visit(node)
    
    def visit_FunctionDef(self, node):
        func_info = {
            'name': node.name,
            'line': node.lineno,
            'args': [arg.arg for arg in node.args.args],
            'decorators': [d.id if hasattr(d, 'id') else ast.unparse(d) for d in node.decorator_list]
        }
        if self.current_class:
            func_info['class'] = self.current_class
        self.functions.append(func_info)
        self.generic_visit(node)
    
    def visit_AsyncFunctionDef(self, node):
        self.visit_FunctionDef(node)
    
    def visit_ClassDef(self, node):
        class_info = {
            'name': node.name,
            'line': node.lineno,
            'bases': [ast.unparse(b) for b in node.bases],
            'methods': []
        }
        self.classes.append(class_info)
        self.current_class = node.name
        self.generic_visit(node)
        self.current_class = None
    
    def visit_Assign(self, node):
        for target in node.targets:
            if isinstance(target, ast.Name):
                self.variables.append({
                    'name': target.id,
                    'line': node.lineno,
                    'value': ast.unparse(node.value)[:50]
                })
        self.generic_visit(node)


class CodeRefactorer:
    """代码重构器"""
    
    def __init__(self, source_code: str):
        self.source_code = source_code
        self.tree = ast.parse(source_code)
    
    def _find_name_locations(self, name: str) -> dict:
        """查找名称在代码中的所有位置"""
        locations = {'definitions': [], 'references': []}
        
        class NameFinder(ast.NodeVisitor):
            def __init__(self, target_name):
                self.target_name = target_name
            
            def visit_FunctionDef(self, node):
                if node.name == self.target_name:
                    locations['definitions'].append({
                        'type': 'function',
                        'line': node.lineno,
                        'name': node.name
                    })
                self.generic_visit(node)
            
            def visit_AsyncFunctionDef(self, node):
                self.visit_FunctionDef(node)
            
            def visit_ClassDef(self, node):
                if node.name == self.target_name:
                    locations['definitions'].append({
                        'type': 'class',
                        'line': node.lineno,
                        'name': node.name
                    })
                self.generic_visit(node)
            
            def visit_Name(self, node):
                if node.id == self.target_name:
                    locations['references'].append({
                        'type': 'name',
                        'line': node.lineno,
                        'ctx': type(node.ctx).__name__
                    })
                self.generic_visit(node)
        
        finder = NameFinder(name)
        finder.visit(self.tree)
        return locations
    
    def rename(self, old_name: str, new_name: str) -> str:
        """重命名函数或变量"""
        
        # 验证旧名称是否存在
        locations = self._find_name_locations(old_name)
        if not locations['definitions'] and not locations['references']:
            raise ValueError(f"名称 '{old_name}' 在代码中未找到")
        
        class RenameVisitor(ast.NodeTransformer):
            def __init__(self, old_name, new_name):
                self.old_name = old_name
                self.new_name = new_name
            
            def visit_Name(self, node):
                if node.id == self.old_name:
                    node.id = self.new_name
                return node
            
            def visit_FunctionDef(self, node):
                if node.name == self.old_name:
                    node.name = self.new_name
                self.generic_visit(node)
                return node
            
            def visit_AsyncFunctionDef(self, node):
                if node.name == self.old_name:
                    node.name = self.new_name
                self.generic_visit(node)
                return node
            
            def visit_ClassDef(self, node):
                if node.name == self.old_name:
                    node.name = self.new_name
                self.generic_visit(node)
                return node
            
            def visit_Attribute(self, node):
                # 处理 self.old_name 这样的属性访问
                if isinstance(node.value, ast.Name):
                    if node.value.id == self.old_name:
                        node.value.id = self.new_name
                self.generic_visit(node)
                return node
        
        transformer = RenameVisitor(old_name, new_name)
        new_tree = transformer.visit(self.tree)
        ast.fix_missing_locations(new_tree)
        return ast.unparse(new_tree)
    
    def extract_variable(self, var_name: str, target_line: int) -> str:
        """提取变量 - 将指定行的表达式提取为变量
        
        Args:
            var_name: 新变量名
            target_line: 要提取的行号 (1-indexed)
        """
        lines = self.source_code.split('\n')
        
        if target_line < 1 or target_line > len(lines):
            raise ValueError(f"行号 {target_line} 超出范围 (1-{len(lines)})")
        
        target_content = lines[target_line - 1]
        
        # 解析该行代码
        try:
            # 尝试解析整行
            target_ast = ast.parse(target_content, mode='eval')
        except SyntaxError:
            # 如果失败，尝试作为表达式语句解析
            try:
                target_ast = ast.parse(target_content, mode='exec')
            except SyntaxError as e:
                raise ValueError(f"无法解析第 {target_line} 行: {e}")
        
        # 查找该行的赋值语句
        class AssignFinder(ast.NodeVisitor):
            def __init__(self, line_no):
                self.line_no = line_no
                self.assignments = []
            
            def visit_Assign(self, node):
                if node.lineno == self.line_no:
                    # 获取等号左侧的变量名
                    if node.targets and isinstance(node.targets[0], ast.Name):
                        var = node.targets[0].id
                        value = ast.unparse(node.value)
                        self.assignments.append({
                            'var': var,
                            'value': value,
                            'node': node
                        })
                self.generic_visit(node)
            
            def visit_AnnAssign(self, node):
                if node.lineno == self.line_no:
                    if isinstance(node.target, ast.Name):
                        var = node.target.id
                        value = ast.unparse(node.value) if node.value else None
                        self.assignments.append({
                            'var': var,
                            'value': value,
                            'node': node,
                            'annotated': True,
                            'annotation': ast.unparse(node.annotation) if node.annotation else None
                        })
                self.generic_visit(node)
        
        finder = AssignFinder(target_line)
        finder.visit(self.tree)
        
        if not finder.assignments:
            raise ValueError(f"第 {target_line} 行不是有效的赋值语句")
        
        assignment = finder.assignments[0]
        original_var = assignment['var']
        value_expr = assignment['value']
        
        # 构建新代码
        # 1. 在函数开头或模块顶部添加新变量
        # 2. 将原赋值改为对新变量的引用
        
        # 找到合适的位置插入新变量（在第一个函数定义之前或文件开头）
        insert_pos = 0
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped.startswith('def ') or stripped.startswith('async def ') or \
               stripped.startswith('class ') or stripped.startswith('@'):
                insert_pos = i
                break
        
        # 获取目标行的缩进
        target_indent = len(target_content) - len(target_content.lstrip())
        indent_str = ' ' * target_indent
        
        # 创建新变量行
        if assignment.get('annotated'):
            new_var_line = f"{indent_str}{var_name}: {assignment['annotation']} = {value_expr}"
        else:
            new_var_line = f"{indent_str}{var_name} = {value_expr}"
        
        # 修改原行为对新变量的引用
        new_target_line = f"{indent_str}{original_var} = {var_name}"
        
        # 重建代码
        new_lines = lines[:insert_pos]
        if insert_pos > 0 and new_lines and new_lines[-1].strip():
            new_lines.append('')  # 空行分隔
        new_lines.append(new_var_line)
        new_lines.append('')  # 空行分隔
        new_lines.extend(lines[insert_pos:target_line - 1])
        new_lines.append(new_target_line)
        new_lines.extend(lines[target_line:])
        
        return '\n'.join(new_lines)


def analyze_file(filepath: str) -> dict:
    """分析 Python 文件"""
    path = Path(filepath)
    
    if not path.exists():
        return {
            'file': filepath,
            'success': False,
            'error': f"文件不存在: {filepath}"
        }
    
    if not path.is_file():
        return {
            'file': filepath,
            'success': False,
            'error': f"不是文件: {filepath}"
        }
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            source = f.read()
    except Exception as e:
        return {
            'file': filepath,
            'success': False,
            'error': f"读取文件失败: {e}"
        }
    
    try:
        tree = ast.parse(source)
        analyzer = PythonAnalyzer()
        analyzer.visit(tree)
        
        return {
            'file': str(path.absolute()),
            'success': True,
            'structure': {
                'imports': analyzer.imports,
                'classes': analyzer.classes,
                'functions': analyzer.functions,
                'variables': analyzer.variables
            }
        }
    except SyntaxError as e:
        return {
            'file': filepath,
            'success': False,
            'error': f"语法错误: {e}"
        }


def main():
    parser = argparse.ArgumentParser(
        description='🤖 AI Refactor - Python 代码解析和重构工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  python refactor.py analyze sample.py
  python refactor.py analyze sample.py --json
  python refactor.py rename sample.py calculate compute
  python refactor.py rename sample.py calculate compute -o newfile.py
  python refactor.py extract sample.py new_var 10
        '''
    )
    subparsers = parser.add_subparsers(dest='command', help='子命令')
    
    # analyze 子命令
    analyze_parser = subparsers.add_parser('analyze', help='分析 Python 文件结构')
    analyze_parser.add_argument('file', help='Python 文件路径')
    analyze_parser.add_argument('--json', action='store_true', help='JSON 格式输出')
    
    # rename 子命令
    rename_parser = subparsers.add_parser('rename', help='重命名函数/变量/类')
    rename_parser.add_argument('file', help='Python 文件路径')
    rename_parser.add_argument('old_name', help='原名称')
    rename_parser.add_argument('new_name', help='新名称')
    rename_parser.add_argument('-o', '--output', help='输出文件路径')
    
    # extract 子命令
    extract_parser = subparsers.add_parser('extract', help='提取变量')
    extract_parser.add_argument('file', help='Python 文件路径')
    extract_parser.add_argument('var_name', help='新变量名')
    extract_parser.add_argument('line', type=int, help='要提取的行号')
    extract_parser.add_argument('-o', '--output', help='输出文件路径')
    
    args = parser.parse_args()
    
    if args.command is None:
        parser.print_help()
        sys.exit(1)
    
    if args.command == 'analyze':
        result = analyze_file(args.file)
        if args.json:
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            if result['success']:
                s = result['structure']
                print(f"📁 {result['file']}")
                if s['imports']:
                    print(f"\n📥 导入 ({len(s['imports'])})")
                    for imp in s['imports'][:5]:
                        name = imp.get('name') or imp.get('module')
                        print(f"   import {name}")
                    if len(s['imports']) > 5:
                        print(f"   ... 还有 {len(s['imports']) - 5} 个")
                
                if s['classes']:
                    print(f"\n🏠 类 ({len(s['classes'])})")
                    for cls in s['classes']:
                        print(f"   class {cls['name']}")
                
                if s['functions']:
                    print(f"\n⚡ 函数 ({len(s['functions'])})")
                    for func in s['functions'][:5]:
                        cls = func.get('class', '')
                        prefix = f"{cls}." if cls else ""
                        print(f"   def {prefix}{func['name']}()")
                    if len(s['functions']) > 5:
                        print(f"   ... 还有 {len(s['functions']) - 5} 个")
                
                if s['variables']:
                    print(f"\n📌 变量 ({len(s['variables'])})")
                    for var in s['variables'][:5]:
                        print(f"   {var['name']} = {var['value']}")
                    if len(s['variables']) > 5:
                        print(f"   ... 还有 {len(s['variables']) - 5} 个")
                
                if not any([s['imports'], s['classes'], s['functions'], s['variables']]):
                    print("   (未检测到结构)")
            else:
                print(f"❌ {result['error']}", file=sys.stderr)
                sys.exit(1)
    
    elif args.command == 'rename':
        path = Path(args.file)
        if not path.exists():
            print(f"❌ 文件不存在: {args.file}", file=sys.stderr)
            sys.exit(1)
        
        try:
            with open(args.file, 'r', encoding='utf-8') as f:
                source = f.read()
        except Exception as e:
            print(f"❌ 读取文件失败: {e}", file=sys.stderr)
            sys.exit(1)
        
        refactorer = CodeRefactorer(source)
        try:
            new_source = refactorer.rename(args.old_name, args.new_name)
            output = args.output or args.file
            
            # 如果覆盖原文件，先备份
            if output == args.file:
                backup_path = f"{args.file}.bak"
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(source)
                print(f"📦 已备份原文件到: {backup_path}")
            
            with open(output, 'w', encoding='utf-8') as f:
                f.write(new_source)
            print(f"✅ 已重命名 '{args.old_name}' -> '{args.new_name}'")
            print(f"📁 已保存到: {output}")
        except ValueError as e:
            print(f"❌ {e}", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"❌ 重命名失败: {e}", file=sys.stderr)
            sys.exit(1)
    
    elif args.command == 'extract':
        path = Path(args.file)
        if not path.exists():
            print(f"❌ 文件不存在: {args.file}", file=sys.stderr)
            sys.exit(1)
        
        try:
            with open(args.file, 'r', encoding='utf-8') as f:
                source = f.read()
        except Exception as e:
            print(f"❌ 读取文件失败: {e}", file=sys.stderr)
            sys.exit(1)
        
        refactorer = CodeRefactorer(source)
        try:
            new_source = refactorer.extract_variable(args.var_name, args.line)
            output = args.output or args.file
            
            # 如果覆盖原文件，先备份
            if output == args.file:
                backup_path = f"{args.file}.bak"
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(source)
                print(f"📦 已备份原文件到: {backup_path}")
            
            with open(output, 'w', encoding='utf-8') as f:
                f.write(new_source)
            print(f"✅ 已提取变量 '{args.var_name}' (第 {args.line} 行)")
            print(f"📁 已保存到: {output}")
        except ValueError as e:
            print(f"❌ {e}", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"❌ 提取变量失败: {e}", file=sys.stderr)
            sys.exit(1)


if __name__ == '__main__':
    main()
