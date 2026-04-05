const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tutoring-app-secret-key';

// 中间件：验证 token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未授权' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token 无效' });
  }
};

// 设置用户角色
router.post('/set-role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: '角色必须是 teacher 或 student'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { role },
      { new: true }
    );
    
    res.json({
      success: true,
      data: { role: user.role }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '设置角色失败'
    });
  }
});

// 获取用户信息
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-openid');
    
    let teacherProfile = null;
    if (user.role === 'teacher') {
      teacherProfile = await TeacherProfile.findOne({ userId: req.userId });
    }
    
    res.json({
      success: true,
      data: {
        user,
        teacherProfile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

module.exports = router;
