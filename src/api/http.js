//导入axios
import axios from 'axios'

// --aixos默认设置--
axios.defaults.timeout = 10000;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.baseURL = process.env.VUE_APP_BASE_URL // 设置默认的请求地址

// --请求拦截器-- 
// 添加Authorization请求头，用于权限处理
// axios.interceptors.request.use(
//     config => {
//       // 添加请求头等前置处理
//       config.headers['Authorization'] = 'Bearer' + ' ' + Cookies.get('token')
//       return config
//     },
//     error => {
//       // 请求错误处理
//       console.log('Request Error:', error)
//       return Promise.reject(error)
//     }
// )

// //导出我们建立的axios实例模块
export default axios