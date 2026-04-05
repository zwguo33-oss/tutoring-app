// pages/evaluation/evaluation.js
const app = getApp();

Page({
  data: {
    bookingId: '',
    teacherName: '',
    subject: '',
    appointmentTime: '',
    rating: 0,
    ratingText: '点击星星评分',
    comment: '',
    selectedTags: [],
    tags: ['认真负责', '讲解清晰', '耐心细致', '方法得当', '氛围活跃', '收获满满']
  },
  
  onLoad(options) {
    if (options.bookingId) {
      this.setData({ bookingId: options.bookingId });
      this.loadBookingInfo(options.bookingId);
    }
  },
  
  // 加载预约信息
  async loadBookingInfo(bookingId) {
    try {
      const res = await app.request({
        url: `/booking/student/list`
      });
      
      const booking = (res.data || []).find(b => b._id === bookingId);
      
      if (booking) {
        this.setData({
          teacherName: booking.teacherId.nickname,
          subject: booking.subject,
          appointmentTime: this.formatDate(booking.appointmentTime)
        });
      }
    } catch (error) {
      console.error('加载预约信息失败:', error);
    }
  },
  
  // 设置评分
  setRating(e) {
    const rating = e.currentTarget.dataset.rating;
    const ratingTexts = ['非常差', '较差', '一般', '满意', '非常满意'];
    
    this.setData({
      rating,
      ratingText: ratingTexts[rating - 1]
    });
  },
  
  // 评价输入
  onCommentInput(e) {
    this.setData({ comment: e.detail.value });
  },
  
  // 切换标签
  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const { selectedTags } = this.data;
    
    const index = selectedTags.indexOf(tag);
    if (index > -1) {
      selectedTags.splice(index, 1);
    } else {
      selectedTags.push(tag);
    }
    
    this.setData({ selectedTags });
  },
  
  // 提交评价
  async submitEvaluation() {
    const { bookingId, rating, comment, selectedTags } = this.data;
    
    if (rating === 0) {
      wx.showToast({ title: '请先评分', icon: 'none' });
      return;
    }
    
    const fullComment = selectedTags.length > 0 
      ? `[${selectedTags.join(', ')}] ${comment}`
      : comment;
    
    wx.showLoading({ title: '提交中...' });
    
    try {
      await app.request({
        url: `/booking/${bookingId}/review`,
        method: 'POST',
        data: {
          rating,
          comment: fullComment
        }
      });
      
      wx.hideLoading();
      wx.showToast({ title: '评价成功', icon: 'success' });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '提交失败', icon: 'none' });
      console.error('提交评价失败:', error);
    }
  },
  
  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
});
