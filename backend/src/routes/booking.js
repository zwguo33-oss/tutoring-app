const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
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

// 学生创建预约
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({
        success: false,
        message: '只有学生可以创建预约'
      });
    }
    
    const { teacherId, subject, appointmentTime, location, notes } = req.body;
    
    const booking = await Booking.create({
      studentId: req.userId,
      teacherId,
      subject,
      appointmentTime: new Date(appointmentTime),
      location,
      notes: notes || ''
    });
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建预约失败'
    });
  }
});

// 老师获取预约列表
router.get('/teacher/list', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: '只有老师可以查看此列表'
      });
    }
    
    const { status } = req.query;
    let query = { teacherId: req.userId };
    
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .populate('studentId', 'nickname phone wechatId')
      .sort({ appointmentTime: -1 });
    
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取预约列表失败'
    });
  }
});

// 学生获取预约列表
router.get('/student/list', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({
        success: false,
        message: '只有学生可以查看此列表'
      });
    }
    
    const { status } = req.query;
    let query = { studentId: req.userId };
    
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .populate('teacherId', 'nickname')
      .sort({ appointmentTime: -1 });
    
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取预约列表失败'
    });
  }
});

// 老师接受预约
router.put('/:bookingId/accept', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: '只有老师可以接受预约'
      });
    }
    
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.bookingId, teacherId: req.userId },
      { status: 'accepted' },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '接受预约失败'
    });
  }
});

// 老师打卡
router.post('/:bookingId/checkin', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: '只有老师可以打卡'
      });
    }
    
    const { latitude, longitude } = req.body;
    
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.bookingId, teacherId: req.userId },
      {
        'teacherCheckin.checked': true,
        'teacherCheckin.checkinTime': new Date(),
        'teacherCheckin.checkinLocation': { latitude, longitude }
      },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '打卡失败'
    });
  }
});

// 学生评价老师
router.post('/:bookingId/review', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({
        success: false,
        message: '只有学生可以评价'
      });
    }
    
    const { rating, comment } = req.body;
    
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.bookingId, studentId: req.userId },
      {
        status: 'completed',
        review: {
          rating,
          comment,
          createdAt: new Date()
        }
      },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }
    
    // 更新老师平均评分
    const teacherProfile = await TeacherProfile.findOne({ userId: booking.teacherId });
    if (teacherProfile) {
      const totalRating = teacherProfile.averageRating * teacherProfile.reviewCount + rating;
      teacherProfile.reviewCount += 1;
      teacherProfile.averageRating = totalRating / teacherProfile.reviewCount;
      await teacherProfile.save();
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '评价失败'
    });
  }
});

// 取消预约
router.put('/:bookingId/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { 
        _id: req.params.bookingId,
        $or: [{ studentId: req.userId }, { teacherId: req.userId }]
      },
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '取消预约失败'
    });
  }
});

module.exports = router;
