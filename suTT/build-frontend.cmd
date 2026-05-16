
@echo off
cd frontend
npm install
npm run build:win
echo 前端打包完成，请查看 frontend/dist 目录
pause
