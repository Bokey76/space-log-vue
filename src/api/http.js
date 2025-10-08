//导入axios
import axios from "axios";
import Cookies from "js-cookie";
import router from "@/router/index";
import { notification } from "ant-design-vue";

// --aixos默认设置--
axios.defaults.timeout = 5 * 60 * 1000; // 5 分钟
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.baseURL = process.env.VUE_APP_BASE_URL; // 设置默认的请求地址

// --请求拦截器--
// 添加Authorization请求头，用于权限处理
axios.interceptors.request.use(
  (config) => {
    // 添加请求头等前置处理
    config.headers["Authorization"] = "Bearer" + " " + Cookies.get("token");
    return config;
  },
  (error) => {
    // 请求错误处理
    console.log("Request Error:", error);
    return Promise.reject(error);
  }
);

// --响应拦截器--
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 检查是否是 token 过期的错误
      if (error.response.status === 401) {
        // 清除信息
        const allCookies = Cookies.get();
        for (const cookieName in allCookies) {
          if (Object.prototype.hasOwnProperty.call(allCookies, cookieName)) {
            Cookies.remove(cookieName);
          }
        }
        notification.info({
          message: "登录过期",
          description: error.response.data.msg,
          duration: 3,
        });
        router.push("/login"); // 返回登录页
      }
    }
    return Promise.reject(error);
  }
);

// //导出我们建立的axios实例模块
export default axios;
