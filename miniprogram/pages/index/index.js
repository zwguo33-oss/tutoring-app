// pages/index/index.js
Page({
  data: {
    
  },
  
  onLoad() {
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.role) {
      // 已登录，跳转到对应 dashboard
      this.navigateToDashboard(userInfo.role);
    }
  },
  
  // 选择角色
  selectRole(e) {
    const role = e.currentTarget.dataset.role;
    // 存储临时选择
    wx.setStorageSync('selectedRole', role);
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },
  
  // 开始使用
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },
  
  // 跳转到对应 dashboard
  navigateToDashboard(role) {
    if (role === 'teacher') {
      wx.switchTab({ url: '/pages/teacher-dashboard/teacher-dashboard' });
    } else {
      wx.switchTab({ url: '/pages/student-dashboard/student-dashboard' });
    }
  }
});
