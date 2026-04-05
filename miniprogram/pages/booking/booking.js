// pages/booking/booking.js
const app = getApp();

Page({
  data: {
    teacherId: '',
    teacherName: '',
    subjects: ['数学', '英语', '物理', '化学', '生物', '语文', '历史', '地理'],
    subjectIndex: 0,
    appointmentDate: '',
    appointmentTime: '',
    address: '',
    notes: '',
    location: {
      address: '',
      latitude: 0,
      longitude: 0
    }
  },
  
  onLoad(options) {
    if (options.teacherId) {
      this.setData({ teacherId: options.teacherId });
      this.loadTeacherInfo(options.teacherId);
    }
    
    // 设置默认日期为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    this.setData({ appointmentDate: dateStr });
  },
  
  // 加载老师信息
  async loadTeacherInfo(teacherId) {
    try {
      const res = await app.request({
        url: `/teacher/${teacherId}`
      });
      
      this.setData({
        teacherName: res.data.name
      });
    } catch (error) {
      console.error('加载老师信息失败:', error);
    }
  },
  
  // 科目选择
  onSubjectChange(e) {
    this.setData({ subjectIndex: e.detail.value });
  },
  
  // 日期选择
  onDateChange(e) {
    this.setData({ appointmentDate: e.detail.value });
  },
  
  // 时间选择
  onTimeChange(e) {
    this.setData({ appointmentTime: e.detail.value });
  },
  
  // 地址输入
  onAddressInput(e) {
    this.setData({ address: e.detail.value });
  },
  
  // 备注输入
  onNotesInput(e) {
    this.setData({ notes: e.detail.value });
  },
  
  // 选择位置
  chooseLocation() {
    const that = this;
    
    wx.chooseLocation({
      success: (res) => {
        that.setData({
          location: {
            address: res.address + res.name,
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
      },
      fail: (err) => {
        wx.showToast({ title: '选择位置失败', icon: 'none' });
        console.error(err);
      }
    });
  },
  
  // 提交预约
  async submitBooking() {
    const { 
      teacherId, subjectIndex, subjects, 
      appointmentDate, appointmentTime, 
      location, address, notes 
    } = this.data;
    
    if (!location.latitude || !location.longitude) {
      wx.showToast({ title: '请选择上课位置', icon: 'none' });
      return;
    }
    
    if (!appointmentDate || !appointmentTime) {
      wx.showToast({ title: '请选择预约时间', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '提交中...' });
    
    try {
      const appointmentTimeStr = `${appointmentDate}T${appointmentTime}:00`;
      
      await app.request({
        url: '/booking',
        method: 'POST',
        data: {
          teacherId,
          subject: subjects[subjectIndex],
          appointmentTime: appointmentTimeStr,
          location,
          notes
        }
      });
      
      wx.hideLoading();
      wx.showToast({ title: '预约成功', icon: 'success' });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      console.error('预约失败:', error);
    }
  }
});
