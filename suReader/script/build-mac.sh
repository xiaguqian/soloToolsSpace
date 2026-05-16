#!/bin/bash
echo "======================================"
echo "SuReader Mac 打包脚本"
echo "======================================"

echo "1. 检查 Node.js 环境..."
node --version
if [ $? -ne 0 ]; then
    echo "错误: 未安装 Node.js，请先安装 Node.js"
    exit 1
fi

echo ""
echo "2. 安装依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "错误: 依赖安装失败"
    exit 1
fi

echo ""
echo "3. 构建前端资源..."
npm run build
if [ $? -ne 0 ]; then
    echo "错误: 前端构建失败"
    exit 1
fi

echo ""
echo "4. 打包 Electron 应用..."
npm run electron:build:mac
if [ $? -ne 0 ]; then
    echo "错误: Electron 打包失败"
    exit 1
fi

echo ""
echo "======================================"
echo "打包完成！"
echo "输出目录: dist/"
echo "======================================"
