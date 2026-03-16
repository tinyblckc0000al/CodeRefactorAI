"""测试文件 - sample.py"""

import os
import sys
from typing import List


class DataProcessor:
    """数据处理类"""
    
    def __init__(self, name):
        self.name = name
        self.items = []
    
    def process(self, data: List[int]) -> List[int]:
        """处理数据"""
        result = []
        for item in data:
            result.append(item * 2)
        return result
    
    async def async_process(self, data: List[int]) -> List[int]:
        """异步处理"""
        return [x + 1 for x in data]


def calculate(a, b):
    """计算函数"""
    return a + b


# 全局变量
config = {"debug": True}
max_count = 100

def main():
    processor = DataProcessor("test")
    numbers = [1, 2, 3, 4, 5]
    processed = processor.process(numbers)
    print(processed)


if __name__ == "__main__":
    main()
