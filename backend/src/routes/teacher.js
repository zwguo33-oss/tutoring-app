const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const TeacherProfile = require('../models/TeacherProfile');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tutoring-app-secret-key';

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// 中间件：验证 token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未授权' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token 无效' });
  }
};

// 创建/更新老师资料
router.post('/profile', authMiddleware, upload.fields([
  { name: 'studentCard', maxCount: 1 },
  { name: 'idCard', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, gender, school, major, education, subjects, experience, introduction, availableTime } = req.body;
    
    // 解析上传的文件
    const documents = {};
    if (req.files.studentCard) {
      documents.studentCard = `/uploads/${req.files.studentCard[0].filename}`;
    }
    if (req.files.idCard) {
      documents.idCard = `/uploads/${req.files.idCard[0].filename}`;
    }
    if (req.files.resume) {
      documents.resume = `/uploads/${req.files.resume[0].filename}`;
    }
    
    // 解析空闲时间
    let parsedAvailableTime = [];
    if (availableTime) {
      parsedAvailableTime = JSON.parse(availableTime);
    }
    
    let teacherProfile = await TeacherProfile.findOne({ userId: req.userId });
    
    if (teacherProfile) {
      // 更新
      teacherProfile.name = name || teacherProfile.name;
      teacherProfile.gender = gender || teacherProfile.gender;
      teacherProfile.school = school || teacherProfile.school;
      teacherProfile.major = major || teacherProfile.major;
      teacherProfile.education = education || teacherProfile.education;
      teacherProfile.subjects = subjects ? JSON.parse(subjects) : teacherProfile.subjects;
      teacherProfile.experience = experience || teacherProfile.experience;
      teacherProfile.introduction = introduction || teacherProfile.introduction;
      teacherProfile.availableTime = parsedAvailableTime.length ? parsedAvailableTime : teacherProfile.availableTime;
      
      if (documents.studentCard) teacherProfile.documents.studentCard = documents.studentCard;
      if (documents.idCard) teacherProfile.documents.idCard = documents.idCard;
      if (documents.resume) teacherProfile.documents.resume = documents.resume;
      
      await teacherProfile.save();
    } else {
      // 创建
      teacherProfile = await TeacherProfile.create({
        userId: req.userId,
        name,
        gender,
        school,
        major,
        education,
        subjects: subjects ? JSON.parse(subjects) : [],
        experience,
        introduction,
        documents,
        availableTime: parsedAvailableTime
      });
    }
    
    res.json({
      success: true,
      data: teacherProfile
    });
  } catch (error) {
    console.error('创建老师资料错误:', error);
    res.status(500).json({
      success: false,
      message: '创建老师资料失败'
    });
  }
});

// 获取老师资料列表（学生查看）
router.get('/list', async (req, res) => {
  try {
    const { subject, school } = req.query;
    
    let query = { verified: true };
    if (subject) {
      query.subjects = { $in: [subject] };
    }
    if (school) {
      query.school = new RegExp(school, 'i');
    }
    
    const profiles = await TeacherProfile.find(query)
      .populate('userId', 'nickname avatar')
      .select('-documents.idCard -documents.studentCard'); // 不返回敏感证件
    
    res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取老师列表失败'
    });
  }
});

// 获取单个老师详情（学生查看，只看学校信息）
router.get('/:teacherId', async (req, res) => {
  try {
    const profile = await TeacherProfile.findOne({ userId: req.params.teacherId })
      .populate('userId', 'nickname avatar')
      .select('-documents.idCard -documents.studentCard'); // 只返回简历，不返回身份证和学生证
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: '老师不存在'
      });
    }
    
    // 只返回学校相关信息
    const publicProfile = {
      _id: profile._id,
      name: profile.name,
      gender: profile.gender,
      school: profile.school,
      major: profile.major,
      education: profile.education,
      subjects: profile.subjects,
      experience: profile.experience,
      introduction: profile.introduction,
      availableTime: profile.availableTime,
      averageRating: profile.averageRating,
      reviewCount: profile.reviewCount,
      user: profile.userId
    };
    
    res.json({
      success: true,
      data: publicProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取老师详情失败'
    });
  }
});

// 更新空闲时间
router.put('/available-time', authMiddleware, async (req, res) => {
  try {
    const { availableTime } = req.body;
    
    const profile = await TeacherProfile.findOneAndUpdate(
      { userId: req.userId },
      { availableTime },
      { new: true }
    );
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: '请先创建老师资料'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新空闲时间失败'
    });
  }
});

module.exports = router;
