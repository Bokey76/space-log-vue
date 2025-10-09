/**
=============================================================================
  Project: space-log-vue
  Author: Bokey(github: Bokey76)
  Created: 2025
  License: MIT License
  Description: 
  本项目开源，欢迎参考、学习和改进。。
  请尊重作者版权，保留作者信息及本文件中的 LICENSE 注释。
  欢迎通过 Pull Request 或 Issue 方式提出改进意见，一起让项目更好。
  如果你喜欢本项目，欢迎点个 Star ⭐ 支持，也欢迎分享和改进。
  关于作者：https://bokey.space
 =============================================================================
 * 
 */

import { createApp } from "vue";
// 引入app组件
import App from "./App.vue";
// 引入路由
import router from "./router";
// 引入Sass的入口文件
import "./assets/sass/index.scss";
// 引入vuex
import store from "./store";
// 引入接口
import api from "./api/api.js";

const app = createApp(App);
// --全局变量--
app.config.globalProperties.GLOBAL = process.env; // 引入全局环境变量
app.config.globalProperties.$api = api; // 引入axios全局变量

app.use(router).use(store).mount("#app");
