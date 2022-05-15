// 用户请求相关模块
import request from '@/utils/request'
// import store from "@/store"

export const login = data => request({
  url: '/v1_0/authorizations',
  method: 'POST',
  data
})

// 发送验证码
// 注意：每个手机每分钟1次
export const sendSms = mobile => request({
  url: `/v1_0/sms/codes/${mobile}`,
  method: 'GET',
})

// 获取用户自己信息
export const getUserInfo = () => request({
  url: "/v1_0/user",
  method: 'GET',
  // 发送请求头数据
  /*  headers: {
     // 注意：该接口需要授权才能访问
     // token的数据格式：Bearer token数据，注意 Bearer 后面有一个空格
     Authorization: `Bearer ${store.state.user.token}`
   } */
})

// 获取用户频道列表
export const getUserChannels = () => request({
  url: "/v1_0/user/channels",
  method: 'GET',
})

// 关注用户
export const addFollow = (target) => request({
  url: "/v1_0/user/followings",
  method: 'POST',
  data: {
    target
  }
})

// 取消关注用户
export const deleteFollow = (target) => request({
  url: `/v1_0/user/followings/${target}`,
  method: 'DELETE',
})

// 获取用户资料
export const getUserProfile = () => request({
  url: '/v1_0/user/profile',
  method: 'GET',
})

// 修改用户资料
export const updateUserProfile = (data) => request({
  url: '/v1_0/user/profile',
  method: 'PATCH',
  data
})

// 修改用户照片资料
export const updateUserPhoto = (data) => request({
  url: '/v1_0/user/photo',
  method: 'PATCH',
  data
})