import axios from "./http";
import QS from "qs"; // 导入qs库来对请求参数进行处理

export default {
  // get方法 ?分割地址和参数方式传参 eg：www.baidu.com?id=1&name=2
  get: (url, params = {}) => {
    return new Promise((resolve, reject) => {
      axios
        .get(url + "?" + QS.stringify(params))
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err.data);
        });
    });
  },
  // get方法 参数放在地址中方式传参 eg：www.baidu.com/1/2
  getParamsIn: (url, params = []) => {
    return new Promise((resolve, reject) => {
      let paramsStr = "";
      params.forEach((value) => {
        paramsStr += "/" + value;
      });
      axios
        .get(url + paramsStr)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err.data);
        });
    });
  },
  // post方法
  post: (url, data = {}) => {
    return new Promise((resolve, reject) => {
      axios
        .post(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err.data);
        });
    });
  },
  // post方法 header添加：'Content-Type': 'multipart/form-data'
  postFormData: (url, data = {}) => {
    return new Promise((resolve, reject) => {
      axios
        .post(url, data, {headers: {'Content-Type': 'multipart/form-data'}})
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err.data);
        });
    });
  },
  // delete方法 ?分割地址和参数方式传参
  delete: (url, params = {}) => {
    return new Promise((resolve, reject) => {
      axios
        .delete(url + "?" + QS.stringify(params))
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err.data);
        });
    });
  },
  // delete方法 参数放在地址中方式传参
  deleteParamsIn: (url, params = []) => {
    return new Promise((resolve, reject) => {
      let paramsStr = "";
      params.forEach((value) => {
        paramsStr += "/" + value;
      });
      axios
        .delete(url + paramsStr)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err.data);
        });
    });
  },
};
