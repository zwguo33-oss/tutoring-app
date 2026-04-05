const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tutoring-app-secret-key';

// 微信登录/注册
router.post('/login', async (req, res) => {
  try {
    const { code, encryptedData, iv } = req.body;
    
    // 这里应该调用微信 API 获取 openid 和手机号
    // 简化版本：假设已经获取到这些信息
    const { openid, phone, wechatId, nickname, avatar } = req.body.userInfo || {};
    
    if (!openid || !phone || !wechatId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要信息'
      });
    }
    
    // 查找或创建用户
    let user = await User.findOne({ openid });
    
    if (!user) {
      user = await User.create({
        openid,
        phone,
        wechatId,
        nickname: nickname || '',
        avatar: avatar || ''
      });
    } else {
      // 更新用户信息
      user.phone = phone;
      user.wechatId = wechatId;
      if (nickname) user.nickname = nickname;
      if (avatar) user.avatar = avatar;
      await user.save();
    }
    
    // 生成 token
    const token = jwt.sign(
      { userId: user._id, openid: user.openid, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          openid: user.openid,
          phone: user.phone,
          wechatId: user.wechatId,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未授权' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-openid');
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token 无效'
    });
  }
});

module.exports = router;
