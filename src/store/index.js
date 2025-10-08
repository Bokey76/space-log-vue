import { createStore } from "vuex";

const store = createStore({
  state: {
    // 屏幕大小对象
    WindowSize: {
      height: window.innerHeight,
      width: window.innerWidth,
    },
    themeMode: "Light", // 主题模式
    config: {}, // 全局配置
  },
  // 准备mutations-用于操作数据（state）
  mutations: {
    // 修改屏幕大小
    WINDOW_SIZE_CHANGE(state, value) {
      state.WindowSize = value;
    },
    // 设置主题
    SET_THEME(state, value) {
      state.themeMode = ''; // 为了触发watch变化
      state.themeMode = value;
    },
    SET_CONFIG(state,value) {
      state.config = value
    }
  },
  actions: {},
  getters: {
    phonModelOrNot(state) {
      return state.WindowSize.width < 1020
    }
  },
  // 使用modules引用模块和命名空间
  modules: {},
});

export default store;
