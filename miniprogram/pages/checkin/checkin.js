// pages/checkin/checkin.js
const app = getApp();

Page({
  data: {
    pendingCheckins: [],
    checkinRecords: []
  },
  
  onLoad() {
    this.loadBookings();
  },
  
  onShow() {
    this.loadBookings();
  },
  
  // 加载预约列表
  async loadBookings() {
    try {
      // 获取已接受但未完成的预约
      const res = await app.request({
        url: '/booking/teacher/list?status=accepted'
      });
      
      const bookings = res.data || [];
      
      // 计算距离并筛选待打卡的
      const pendingCheckins = [];
      const checkinRecords = [];
      
      for (const booking of bookings) {
        if (booking.teacherCheckin && booking.teacherCheckin.checked) {
          checkinRecords.push(booking);
        } else {
          // 计算当前位置与上课地点的距离
          const distance = await this.calculateDistance(booking.location);
          booking.distance = distance;
          pendingCheckins.push(booking);
        }
      }
      
      this.setData({ pendingCheckins, checkinRecords });
    } catch (error) {
      console.error('加载预约失败:', error);
    }
  },
  
  // 计算距离（简化版）
  calculateDistance(location) {
    return new Promise((resolve) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          const distance = this.getDistanceFromLatLonInM(
            res.latitude, res.longitude,
            location.latitude, location.longitude
          );
          resolve(Math.round(distance));
        },
        fail: () => {
          resolve(null);
        }
      });
    });
  },
  
  // 计算两点距离（Haversine 公式）
  getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    const R = 6371000; // 地球半径（米）
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
  
  deg2rad(deg) {
    return deg * (Math.PI / 180);
  },
  
  // 打卡
  async doCheckin(e) {
    const bookingId = e.currentTarget.dataset.id;
    
    wx.showLoading({ title: '打卡中...' });
    
    // 获取当前位置
    wx.getLocation({
      type: 'gcj02',
      success: async (res) => {
        try {
          await app.request({
            url: `/booking/${bookingId}/checkin`,
            method: 'POST',
            data: {
              latitude: res.latitude,
              longitude: res.longitude
            }
          });
          
          wx.hideLoading();
          wx.showToast({ title: '打卡成功', icon: 'success' });
          this.loadBookings();
        } catch (error) {
          wx.hideLoading();
          wx.showToast({ title: '打卡失败', icon: 'none' });
          console.error('打卡失败:', error);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '获取位置失败', icon: 'none' });
        console.error(err);
      }
    });
  },
  
  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  },
  
  // 格式化时间
  formatTime(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
});
