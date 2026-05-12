#!/bin/bash

echo "========================================"
echo " XunReader macOS 打包脚本"
echo "========================================"
echo ""

echo "[1/3] 安装依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "依赖安装失败"
    exit 1
fi

echo ""
echo "[2/3] 构建项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "构建失败"
    exit 1
fi

echo ""
echo "[3/3] 打包 macOS 安装包..."
npm run package:mac
if [ $? -ne 0 ]; then
    echo "打包失败"
    exit 1
fi

echo ""
echo "========================================"
echo " 打包完成！"
echo " 输出目录: dist/"
echo "========================================"
