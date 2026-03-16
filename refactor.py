#!/usr/bin/env python3
"""AI Refactor CLI - Python 代码解析和基础重构工具"""

import argparse
import ast
import json
import sys
from pathlib import Path
from typing import Any


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
    
    def rename(self, old_name: str, new_name: str) -> str:
        """重命名函数或变量"""
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
        
        transformer = RenameVisitor(old_name, new_name)
        new_tree = transformer.visit(self.tree)
        ast.fix_missing_locations(new_tree)
        return ast.unparse(new_tree)
    
    def extract_variable(self, var_name: str, target_expr: str) -> str:
        """提取变量 - 将指定表达式提取为变量
        
        简化版：查找第一个匹配的表达式的赋值语句，将其提取到函数开头
        """
        lines = self.source_code.split('\n')
        new_lines = []
        
        for i, line in enumerate(lines):
            if target_expr in line and '=' in line:
                # 找到目标表达式
                indent = len(line) - len(line.lstrip())
                prefix = line[:line.index(target_expr)].strip()
                
                # 提取赋值语句
                if '=' in line:
                    # 找到等号位置
                    eq_pos = line.index('=')
                    value = line[eq_pos + 1:].strip()
                    indent_str = ' ' * indent
                    new_lines.append(f"{indent_str}{var_name} = {value}")
                    new_lines.append(f"{indent_str}{target_expr} = {var_name}")
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)
        
        return '\n'.join(new_lines)


def analyze_file(filepath: str) -> dict:
    """分析 Python 文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        source = f.read()
    
    try:
        tree = ast.parse(source)
        analyzer = PythonAnalyzer()
        analyzer.visit(tree)
        
        return {
            'file': filepath,
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
            'error': str(e)
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
  python refactor.py extract sample.py new_var "item * 2"
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
    extract_parser.add_argument('expression', help='要提取的表达式')
    extract_parser.add_argument('-o', '--output', help='输出文件路径')
    
    args = parser.parse_args()
    
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
            else:
                print(f"❌ 解析错误: {result['error']}", file=sys.stderr)
                sys.exit(1)
    
    elif args.command == 'rename':
        with open(args.file, 'r', encoding='utf-8') as f:
            source = f.read()
        
        refactorer = CodeRefactorer(source)
        try:
            new_source = refactorer.rename(args.old_name, args.new_name)
            output = args.output or args.file
            with open(output, 'w', encoding='utf-8') as f:
                f.write(new_source)
            print(f"✅ 已重命名 '{args.old_name}' -> '{args.new_name}'")
            print(f"📁 已保存到: {output}")
        except Exception as e:
            print(f"❌ 重命名失败: {e}", file=sys.stderr)
            sys.exit(1)
    
    elif args.command == 'extract':
        with open(args.file, 'r', encoding='utf-8') as f:
            source = f.read()
        
        refactorer = CodeRefactorer(source)
        try:
            new_source = refactorer.extract_variable(args.var_name, args.expression)
            output = args.output or args.file
            with open(output, 'w', encoding='utf-8') as f:
                f.write(new_source)
            print(f"✅ 已提取变量 '{args.var_name}'")
            print(f"📁 已保存到: {output}")
        except Exception as e:
            print(f"❌ 提取变量失败: {e}", file=sys.stderr)
            sys.exit(1)
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
