import { createStore } from 'vuex'

const store = createStore({
    // 准备state-用于存储数据
  state: { 
    // 屏幕大小对象
    WindowSize: {
        height: window.innerHeight,
        width: window.innerWidth,
    },
  },
  // 准备mutations-用于操作数据（state）
  mutations: {
    // 修改屏幕大小
    WINDOW_SIZE_CHANGE(state,value) {
        state.WindowSize = value
    }
   },
  // 准备actions--用于响应组件中的动作(请求后台)
  actions: { },
  // 准备getter--用于处理数据便于展示
  getters: { },
  // 使用modules引用模块和命名空间
  modules: { }
})

export default store
