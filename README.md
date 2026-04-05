# 家教预约小程序

一个完整的家教预约平台，包含微信小程序前端和 Node.js 后端。

## 功能特性

### 学生端
- 🔍 搜索和筛选老师（按科目、学校）
- 📋 查看老师资料（学校、专业、可教科目）
- 📅 预约课程（选择时间、地点）
- ⭐ 课程评价和评分
- 📝 查看预约历史

### 老师端
- 📝 创建个人资料（上传学生证、身份证、简历）
- 🕐 设置空闲时间
- 📬 接收和管理预约
- 📍 位置打卡（到达上课地点）
- 📊 查看评价和评分

### 后台管理
- 👥 用户管理（查看所有用户信息）
- ✅ 老师资料审核
- 📈 数据统计
- 📋 预约记录管理

## 技术栈

### 后端
- **框架:** Node.js + Express
- **数据库:** MongoDB + Mongoose
- **认证:** JWT
- **文件上传:** Multer

### 前端
- **平台:** 微信小程序
- **语言:** 原生 WXML/WXSS/JavaScript

## 快速开始

### 1. 安装后端依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置 MongoDB 连接和密钥
```

### 3. 启动 MongoDB

```bash
# macOS (使用 Homebrew)
brew services start mongodb-community

# 或者使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. 启动后端服务

```bash
cd backend
npm start
# 或开发模式
npm run dev
```

### 5. 配置小程序

1. 打开微信开发者工具
2. 导入 `miniprogram` 目录
3. 在 `app.js` 中修改 `apiBaseUrl` 为你的服务器地址
4. 在 `project.config.json` 中填入你的小程序 AppID

## 项目结构

```
tutoring-app/
├── backend/
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由
│   │   ├── middleware/      # 中间件
│   │   ├── utils/           # 工具函数
│   │   └── server.js        # 入口文件
│   ├── uploads/             # 上传文件存储
│   ├── package.json
│   └── .env.example
└── miniprogram/
    ├── pages/
    │   ├── index/           # 首页
    │   ├── login/           # 登录/角色选择
    │   ├── teacher-dashboard/  # 老师仪表板
    │   ├── student-dashboard/  # 学生仪表板
    │   ├── teacher-profile/    # 老师资料
    │   ├── booking/         # 预约页面
    │   ├── checkin/         # 打卡页面
    │   └── evaluation/      # 评价页面
    ├── components/          # 组件
    ├── utils/               # 工具函数
    ├── app.js
    ├── app.json
    └── project.config.json
```

## API 接口

### 认证
- `POST /api/auth/login` - 微信登录
- `GET /api/auth/me` - 获取当前用户信息

### 用户
- `POST /api/user/set-role` - 设置用户角色
- `GET /api/user/profile` - 获取用户资料

### 老师
- `POST /api/teacher/profile` - 创建/更新老师资料
- `GET /api/teacher/list` - 获取老师列表
- `GET /api/teacher/:id` - 获取老师详情
- `PUT /api/teacher/available-time` - 更新空闲时间

### 预约
- `POST /api/booking` - 创建预约
- `GET /api/booking/teacher/list` - 老师获取预约列表
- `GET /api/booking/student/list` - 学生获取预约列表
- `PUT /api/booking/:id/accept` - 接受预约
- `POST /api/booking/:id/checkin` - 打卡
- `POST /api/booking/:id/review` - 评价
- `PUT /api/booking/:id/cancel` - 取消预约

### 管理
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/users` - 用户列表
- `GET /api/admin/teachers` - 老师列表
- `PUT /api/admin/teachers/:id/verify` - 审核老师
- `GET /api/admin/bookings` - 预约列表
- `GET /api/admin/stats` - 统计数据

## 安全考虑

1. **JWT 认证**: 所有需要认证的接口都需要携带 Token
2. **角色权限**: 学生和老师接口有角色校验
3. **文件上传**: 限制文件大小和类型
4. **敏感信息**: 学生查看老师资料时不显示身份证和学生证

## 部署建议

### 后端部署
- 使用 PM2 管理 Node.js 进程
- 配置 Nginx 反向代理
- 使用 MongoDB Atlas 或自建 MongoDB 集群
- 配置 HTTPS

### 小程序部署
- 在微信公众平台提交审核
- 配置合法域名（后端 API 地址）
- 开启生产环境

## 待开发功能

- [ ] 消息通知（预约提醒）
- [ ] 在线支付
- [ ] 课程表视图
- [ ] 老师认证加 V
- [ ] 评价回复
- [ ] 黑名单功能
- [ ] 数据统计图表

## License

MIT
