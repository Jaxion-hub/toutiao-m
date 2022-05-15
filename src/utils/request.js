// 请求模块
import axios from 'axios'
import store from '@/store'

const request = axios.create({
  baseURL: 'http://toutiao.itheima.net' // 基准路径
})

// 添加请求拦截器
request.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  // config 本次请求的请求配置对象
  const { user } = store.state
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  // console.log(config);
  // 注意：这里务必要返回 config 配置对象，否则请求就停在这里出不去了
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

export default request
