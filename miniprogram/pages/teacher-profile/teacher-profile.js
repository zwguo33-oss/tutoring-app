// pages/teacher-profile/teacher-profile.js
const app = getApp();

Page({
  data: {
    formData: {
      name: '',
      gender: '',
      school: '',
      major: '',
      education: '',
      subjects: [],
      experience: '',
      introduction: '',
      documents: {}
    },
    genderIndex: -1,
    eduIndex: -1,
    allSubjects: ['数学', '英语', '物理', '化学', '生物', '语文', '历史', '地理', '音乐', '美术', '编程'],
    selectedSubjects: []
  },
  
  onLoad() {
    this.loadProfile();
  },
  
  // 加载资料
  async loadProfile() {
    try {
      const res = await app.request({
        url: '/user/profile'
      });
      
      if (res.data.teacherProfile) {
        const profile = res.data.teacherProfile;
        const genderIndex = profile.gender === 'male' ? 0 : profile.gender === 'female' ? 1 : -1;
        const eduIndex = ['本科', '硕士', '博士'].indexOf(profile.education);
        
        this.setData({
          formData: profile,
          genderIndex,
          eduIndex,
          selectedSubjects: profile.subjects || []
        });
      }
    } catch (error) {
      console.error('加载资料失败:', error);
    }
  },
  
  // 输入处理
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },
  
  // 性别选择
  onGenderChange(e) {
    const index = e.detail.value;
    this.setData({
      genderIndex: index,
      'formData.gender': index === 0 ? 'male' : index === 1 ? 'female' : ''
    });
  },
  
  // 学历选择
  onEduChange(e) {
    const index = e.detail.value;
    this.setData({
      eduIndex: index,
      'formData.education': ['本科', '硕士', '博士'][index]
    });
  },
  
  // 切换科目
  toggleSubject(e) {
    const subject = e.currentTarget.dataset.subject;
    const { selectedSubjects } = this.data;
    
    const index = selectedSubjects.indexOf(subject);
    if (index > -1) {
      selectedSubjects.splice(index, 1);
    } else {
      selectedSubjects.push(subject);
    }
    
    this.setData({ selectedSubjects });
  },
  
  // 上传图片
  uploadImage(e) {
    const type = e.currentTarget.dataset.type;
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        wx.showLoading({ title: '上传中...' });
        
        // 这里应该调用上传 API
        // 简化处理：保存临时路径
        this.setData({
          [`formData.documents.${type}`]: tempFilePath
        });
        
        wx.hideLoading();
        wx.showToast({ title: '上传成功', icon: 'success' });
      }
    });
  },
  
  // 提交资料
  async submitProfile() {
    const { formData, selectedSubjects } = this.data;
    
    if (!formData.name || !formData.school || !formData.major) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '保存中...' });
    
    try {
      // 创建 FormData 上传
      const uploadTask = wx.uploadFile({
        url: `${app.globalData.apiBaseUrl}/teacher/profile`,
        filePath: formData.documents.studentCard || formData.documents.idCard || formData.documents.resume,
        name: 'studentCard',
        formData: {
          name: formData.name,
          gender: formData.gender,
          school: formData.school,
          major: formData.major,
          education: formData.education,
          subjects: JSON.stringify(selectedSubjects),
          experience: formData.experience,
          introduction: formData.introduction
        },
        header: {
          'Authorization': `Bearer ${app.globalData.token}`
        },
        success: (res) => {
          wx.hideLoading();
          const data = JSON.parse(res.data);
          if (data.success) {
            wx.showToast({ title: '保存成功', icon: 'success' });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } else {
            wx.showToast({ title: data.message || '保存失败', icon: 'none' });
          }
        },
        fail: (err) => {
          wx.hideLoading();
          wx.showToast({ title: '上传失败', icon: 'none' });
          console.error(err);
        }
      });
    } catch (error) {
      wx.hideLoading();
      console.error('保存资料失败:', error);
    }
  }
});
