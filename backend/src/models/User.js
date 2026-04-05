const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 微信 openid
  openid: {
    type: String,
    required: true,
    unique: true
  },
  // 手机号
  phone: {
    type: String,
    required: true
  },
  // 微信号
  wechatId: {
    type: String,
    required: true
  },
  // 昵称
  nickname: {
    type: String,
    default: ''
  },
  // 头像
  avatar: {
    type: String,
    default: ''
  },
  // 角色：teacher 或 student
  role: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  },
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  // 更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
