const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tutoring-app-secret-key';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-secret-key';

// 中间件：验证管理员 token
const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未授权' });
    }
    
    const decoded = jwt.verify(token, ADMIN_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '需要管理员权限' });
    }
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token 无效' });
  }
};

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 简单验证（生产环境应该从数据库读取）
    if (username === process.env.ADMIN_USERNAME || 'admin' && 
        password === process.env.ADMIN_PASSWORD || 'admin123') {
      const token = jwt.sign(
        { role: 'admin' },
        ADMIN_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        success: true,
        data: { token }
      });
    } else {
      res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
});

// 获取所有用户
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (role) {
      query.role = role;
    }
    
    const users = await User.find(query)
      .select('-openid')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

// 获取所有老师资料（含证件）
router.get('/teachers', adminMiddleware, async (req, res) => {
  try {
    const { verified, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (verified !== undefined) {
      query.verified = verified === 'true';
    }
    
    const profiles = await TeacherProfile.find(query)
      .populate('userId', 'nickname phone wechatId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await TeacherProfile.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        profiles,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取老师列表失败'
    });
  }
});

// 审核老师资料
router.put('/teachers/:teacherId/verify', adminMiddleware, async (req, res) => {
  try {
    const { verified } = req.body;
    
    const profile = await TeacherProfile.findOneAndUpdate(
      { userId: req.params.teacherId },
      { verified },
      { new: true }
    );
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: '老师资料不存在'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '审核失败'
    });
  }
});

// 获取所有预约
router.get('/bookings', adminMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .populate('studentId', 'nickname phone')
      .populate('teacherId', 'nickname phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Booking.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        bookings,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取预约列表失败'
    });
  }
});

// 统计数据
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalBookings = await Booking.countDocuments();
    const verifiedTeachers = await TeacherProfile.countDocuments({ verified: true });
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalBookings,
        verifiedTeachers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
});

module.exports = router;
