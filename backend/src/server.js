require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件（上传的文件）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tutoring-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB 连接成功'))
.catch(err => console.error('❌ MongoDB 连接失败:', err));

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const teacherRoutes = require('./routes/teacher');
const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin');

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/admin', adminRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
});
