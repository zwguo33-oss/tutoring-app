// pages/login/login.js
const app = getApp();

Page({
  data: {
    selectedRole: '',
    phone: '',
    wechatId: '',
    showManualInput: false
  },
  
  onLoad() {
    // 检查是否已有登录
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.role) {
      // 已登录，跳转到对应 dashboard
      this.navigateToDashboard(userInfo.role);
    }
  },
  
  // 选择角色
  selectRole(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({ selectedRole: role });
  },
  
  // 获取手机号
  getPhoneNumber() {
    const that = this;
    
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo;
        
        // 获取手机号（需要用户授权）
        wx.requestSubscribeMessage({
          tmplIds: [],
          success: () => {
            that.setData({
              phone: userInfo.phoneNumber || '',
              wechatId: userInfo.openId || '',
              showManualInput: true
            });
          }
        });
      },
      fail: () => {
        that.setData({ showManualInput: true });
      }
    });
  },
  
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },
  
  onWechatInput(e) {
    this.setData({ wechatId: e.detail.value });
  },
  
  // 提交角色选择
  async submitRole() {
    const { selectedRole, phone, wechatId } = this.data;
    
    if (!selectedRole) {
      wx.showToast({ title: '请选择身份', icon: 'none' });
      return;
    }
    
    if (!phone || !wechatId) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '登录中...' });
    
    try {
      // 调用登录 API
      const res = await app.request({
        url: '/auth/login',
        method: 'POST',
        data: {
          userInfo: {
            phone,
            wechatId,
            nickname: '',
            avatar: ''
          }
        }
      });
      
      // 设置角色
      await app.request({
        url: '/user/set-role',
        method: 'POST',
        data: { role: selectedRole }
      });
      
      // 保存登录信息
      wx.setStorageSync('token', res.data.token);
      wx.setStorageSync('userInfo', {
        ...res.data.user,
        role: selectedRole
      });
      app.globalData.token = res.data.token;
      app.globalData.userInfo = { ...res.data.user, role: selectedRole };
      
      wx.hideLoading();
      
      // 跳转到对应 dashboard
      this.navigateToDashboard(selectedRole);
      
    } catch (error) {
      wx.hideLoading();
      console.error('登录失败:', error);
    }
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
