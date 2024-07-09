import { createApp } from 'vue'
// 引入ant组件库
import ant from 'ant-design-vue'
// 引入app组件
import App from './App.vue'
// 引入路由
import router from './router'
// 引入Sass的入口文件
import './assets/sass/index.scss';
// 引入vuex
import store from './store'
// 引入接口
import api from './api/api.js'

const app = createApp(App)
// --全局变量--
app.config.globalProperties.GLOBAL = process.env // 引入全局环境变量
app.config.globalProperties.$api = api // 引入axios全局变量
app.use(router).use(ant).use(store).mount('#app')