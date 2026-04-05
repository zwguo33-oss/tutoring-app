const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema({
  // 关联用户 ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // 姓名
  name: {
    type: String,
    required: true
  },
  // 性别
  gender: {
    type: String,
    enum: ['male', 'female']
  },
  // 学校
  school: {
    type: String,
    required: true
  },
  // 专业
  major: {
    type: String,
    required: true
  },
  // 学历
  education: {
    type: String,
    enum: ['本科', '硕士', '博士'],
    default: '本科'
  },
  // 可教科目
  subjects: [{
    type: String
  }],
  // 教学经历
  experience: {
    type: String,
    default: ''
  },
  // 自我介绍
  introduction: {
    type: String,
    default: ''
  },
  // 证件文件
  documents: {
    // 学生证
    studentCard: {
      type: String
    },
    // 身份证
    idCard: {
      type: String
    },
    // 简历
    resume: {
      type: String
    }
  },
  // 空闲时间
  availableTime: [{
    // 星期几 (0-6, 0 是周日)
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6
    },
    // 时间段
    timeSlots: [{
      start: String, // 例如 "09:00"
      end: String    // 例如 "12:00"
    }]
  }],
  // 审核状态
  verified: {
    type: Boolean,
    default: false
  },
  // 平均评分
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  // 评价数量
  reviewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

teacherProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);
