import { notification } from "ant-design-vue";
export default {
  /**
   * 解析返回数据的合法性，自动提示错误
   * @param {Object} res 后端返回数据，一般结构：{code,msg,data}，code<0时错误提示
   * @param {String} options 对提示title的一些配置(可选)，结构：{ errTitle:"错误提示", successTitle:"提示"  }
   * @returns true / false 返回操作是否成功的boolean
   */
  analysisData: (
    res,
    options = { errTitle: "错误提示", successTitle: "提示" }
  ) => {
    if (res.code < 0) {
      // 错误提示
      notification["error"]({
        message: options.errTitle,
        description: res.msg ? res.msg : "操作失败",
        duration: 3,
      });
      return false;
    }
    // 成功提示...
    notification["success"]({
      message: options.successTitle,
      description: res.msg ? res.msg : "操作成功",
      duration: 3,
    });
    return true;
  },
  // 当前选中数据赋值，将对象属性一个个赋值，防止vue监听不到
  currentDataChange: (row, data) => {
    // row是elementPlus的表格行数据，data是对话框的current数据
    Object.keys(row).forEach((key) => {
      // 必须一个个属性赋值，不然vue无法监听到改变
      data[key] = row[key];
    });
  },
  //
  /**
   * 格式化时间为YYYY-MM-DD 或 YYYY-MM-DD HH:MM:SS
   * @param {*} date 时间，可自动转化为date对象
   * @param {*} detail 是否需要详细到时分秒的格式
   * @returns
   */
  formatDate: (date = new Date(), detail = false) => {
    if (typeof date !== Date) {
      // 格式转化
      date = new Date(date);
    }
    let year = date.getFullYear(); //获取完整的年份(4位)
    let month = date.getMonth() + 1; //获取当前月份(0-11,0代表1月)
    let strDate = date.getDate(); // 获取当前日(1-31)
    if (month < 10) month = `0${month}`; // 如果月份是个位数，在前面补0
    if (strDate < 10) strDate = `0${strDate}`; // 如果日是个位数，在前面补0
    if (detail) {
      // 若为需要详细到时分秒的格式
      return `${year}-${month}-${strDate} ${String(
        date.getHours() + 1
      ).padStart(2, "0")}:${String(date.getMinutes()).padStart(
        2,
        "0"
      )}:${String(date.getSeconds()).padStart(2, "0")}`;
    }
    return `${year}-${month}-${strDate}`;
  },
  /**
   * 判断是否为空，支持对象、字符串、数组
   * @param {*} obj 需要判断的对象
   * @returns {boolean} 是否为空
   *  */
  isNullOrEmpty(obj) {
    // 检查是否为null或undefined
    if (obj === null || obj === undefined) {
      return true;
    }
    // 检查是否为空对象
    if (typeof obj === "object" && Object.keys(obj).length === 0) {
      return true;
    }
    // 检查是否为空数组
    if (Array.isArray(obj) && obj.length === 0) {
      return true;
    }
    // 检查是否为空字符串
    if (typeof obj === "string" && obj.trim() === "") {
      return true;
    }
    // 如果以上条件都不满足，则认为不是null、undefined或空对象
    return false;
  },
  /**
   * 判断对象中的所有属性是否为空(不深层遍历！)
   * 注意：若是ref对象需要加.value！！！
   * @param {*} obj 需要判断的对象
   * @returns {boolean} 是否有属性为空
   */
  objHasNullOrEmpty(obj) {
    if (obj == null) {
      // 如果是 null 或 undefined，返回 true
      return true;
    }
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // 确保是对象的自有属性
        if (this.isNullOrEmpty(obj[key])) {
          notification["error"]({
            message: "操作失败",
            description: "请完善信息再提交",
            duration: 3,
          });
          return true;
        }
      }
    }
    return false;
  },
  /**
   * 检查数据是否为邮箱格式
   * @param {String} data 数据内容
   * @returns {boolean} 是否为邮箱格式
   */
  isValidEmail(email) {
    const emailPattern =
      /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    const result = emailPattern.test(email);
    if (!result) {
      notification["error"]({
        message: "操作失败",
        description: "请输入正确的邮箱格式",
        duration: 3,
      });
    }
    return result;
  },
};
