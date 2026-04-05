// pages/student-dashboard/student-dashboard.js
const app = getApp();

Page({
  data: {
    searchKeyword: '',
    selectedSubject: '',
    subjects: ['数学', '英语', '物理', '化学', '生物', '语文', '历史', '地理'],
    teacherList: []
  },
  
  onLoad() {
    this.loadTeachers();
  },
  
  onShow() {
    this.loadTeachers();
  },
  
  // 加载老师列表
  async loadTeachers() {
    try {
      const { selectedSubject, searchKeyword } = this.data;
      
      let url = '/teacher/list';
      const params = [];
      
      if (selectedSubject) {
        params.push(`subject=${selectedSubject}`);
      }
      if (searchKeyword) {
        params.push(`school=${searchKeyword}`);
      }
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      
      const res = await app.request({ url });
      
      this.setData({
        teacherList: res.data || []
      });
    } catch (error) {
      console.error('加载老师列表失败:', error);
    }
  },
  
  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },
  
  // 搜索老师
  searchTeachers() {
    this.loadTeachers();
  },
  
  // 选择科目
  selectSubject(e) {
    const subject = e.currentTarget.dataset.subject;
    this.setData({ selectedSubject: subject }, () => {
      this.loadTeachers();
    });
  },
  
  // 查看老师详情
  viewTeacherDetail(e) {
    const teacherId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teacher-profile/teacher-profile?teacherId=${teacherId}`
    });
  },
  
  // 预约老师
  bookTeacher(e) {
    const teacherId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/booking/booking?teacherId=${teacherId}`
    });
  }
});
