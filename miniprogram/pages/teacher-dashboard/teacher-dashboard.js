// pages/teacher-dashboard/teacher-dashboard.js
const app = getApp();

Page({
  data: {
    userInfo: {},
    currentDate: '',
    stats: {
      pendingCount: 0,
      completedCount: 0,
      rating: 0
    },
    pendingBookings: []
  },
  
  onLoad() {
    this.loadUserInfo();
    this.loadBookings();
  },
  
  onShow() {
    // 每次显示时刷新数据
    this.loadBookings();
  },
  
  // 加载用户信息
  async loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    const date = new Date();
    const currentDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    
    this.setData({ userInfo, currentDate });
  },
  
  // 加载预约列表
  async loadBookings() {
    try {
      const res = await app.request({
        url: '/booking/teacher/list?status=pending'
      });
      
      this.setData({
        pendingBookings: res.data || [],
        'stats.pendingCount': (res.data || []).length
      });
    } catch (error) {
      console.error('加载预约失败:', error);
    }
  },
  
  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  },
  
  // 接受预约
  async acceptBooking(e) {
    const bookingId = e.currentTarget.dataset.id;
    
    wx.showLoading({ title: '处理中...' });
    
    try {
      await app.request({
        url: `/booking/${bookingId}/accept`,
        method: 'PUT'
      });
      
      wx.hideLoading();
      wx.showToast({ title: '已接受预约', icon: 'success' });
      this.loadBookings();
    } catch (error) {
      wx.hideLoading();
      console.error('接受预约失败:', error);
    }
  },
  
  // 拒绝预约
  async cancelBooking(e) {
    const bookingId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认拒绝',
      content: '确定要拒绝这个预约吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          try {
            await app.request({
              url: `/booking/${bookingId}/cancel`,
              method: 'PUT'
            });
            
            wx.hideLoading();
            wx.showToast({ title: '已拒绝', icon: 'success' });
            this.loadBookings();
          } catch (error) {
            wx.hideLoading();
            console.error('拒绝预约失败:', error);
          }
        }
      }
    });
  },
  
  // 处理预约点击
  handleBooking(e) {
    const bookingId = e.currentTarget.dataset.id;
    // 可以跳转到预约详情页面
  },
  
  // 跳转到资料页
  goToProfile() {
    wx.navigateTo({ url: '/pages/teacher-profile/teacher-profile' });
  },
  
  // 跳转到时间表
  goToSchedule() {
    wx.navigateTo({ url: '/pages/teacher-profile/teacher-profile' });
  },
  
  // 跳转到预约管理
  goToBookings() {
    wx.navigateTo({ url: '/pages/booking/booking' });
  },
  
  // 跳转到打卡页
  goToCheckin() {
    wx.navigateTo({ url: '/pages/checkin/checkin' });
  }
});
