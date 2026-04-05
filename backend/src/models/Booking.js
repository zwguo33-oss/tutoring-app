const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // 学生 ID
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 老师 ID
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 科目
  subject: {
    type: String,
    required: true
  },
  // 预约时间
  appointmentTime: {
    type: Date,
    required: true
  },
  // 地点
  location: {
    address: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  // 状态：pending, accepted, completed, cancelled
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  // 老师打卡记录
  teacherCheckin: {
    checked: {
      type: Boolean,
      default: false
    },
    checkinTime: Date,
    checkinLocation: {
      latitude: Number,
      longitude: Number
    }
  },
  // 评价
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String
    },
    createdAt: Date
  },
  // 备注
  notes: {
    type: String,
    default: ''
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

bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
