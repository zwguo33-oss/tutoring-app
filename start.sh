#!/bin/bash

# 家教小程序启动脚本

echo "🚀 启动家教预约系统..."

# 检查 MongoDB
if ! pgrep -x "mongod" > /dev/null; then
  echo "⚠️  MongoDB 未运行，请手动启动:"
  echo "   brew services start mongodb-community  (macOS)"
  echo "   或 docker run -d -p 27017:27017 --name mongodb mongo:latest"
  exit 1
fi

echo "✅ MongoDB 运行中"

# 启动后端
cd "$(dirname "$0")/backend"

if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install
fi

echo "🔧 启动后端服务..."
npm start &
BACKEND_PID=$!

echo ""
echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
echo ""
echo "📱 小程序开发步骤:"
echo "   1. 打开微信开发者工具"
echo "   2. 导入 miniprogram 目录"
echo "   3. 在 app.js 中修改 apiBaseUrl 为你的服务器地址"
echo "   4. 在 project.config.json 中填入你的小程序 AppID"
echo ""
echo "🌐 后台管理地址：http://localhost:3000/admin/index.html"
echo ""
echo "按 Ctrl+C 停止服务"

wait $BACKEND_PID
