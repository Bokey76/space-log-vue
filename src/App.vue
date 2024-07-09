<template>
  <!-- 全屏结构路由 -->
  <div ref="allScreen" v-show="showView.allView">
    <router-view name="all_view"></router-view>
  </div>
  <!-- 上下结构路由 -->
  <div v-show="showView.topView">
    <a-layout>
      <a-layout-header>
        <!-- 导航 -->
        <NaviMenu></NaviMenu>
      </a-layout-header>
      <a-layout-content>
        <NaviBreadcrumb></NaviBreadcrumb>
        <!-- 内容 -->
        <router-view name="content_view"></router-view>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, watch } from "vue";
import NaviBreadcrumb from "./components/customization/NaviBreadcrumb.vue";
import NaviMenu from "./components/customization/NaviMenu.vue";
import { useRoute } from "vue-router";
import { useStore } from 'vuex'
const store = useStore()

// --rem设置--
// 重新设置根元素font-size
const reScreenSize = () => {
  let w = document.documentElement.clientWidth; // 获取设备的宽度
  if (w <= 1400) return;
  let n =
    10 * (w / 1920) > 40
      ? 40 + "px"
      : 10 * (w / 1920) >= 7.4
      ? 10 * (w / 1920) + "px"
      : 7.4 + "px";
  document.documentElement.style.fontSize = n;
};

// --全局路由设置--
// 获取全屏路由
const allScreen = ref(null);
// 获取屏幕宽高，绑定到全屏路由上
const setScreenSize = () => {
  let w = window.innerWidth;
  let h = window.innerHeight;
  allScreen.value.style.width = w + "px";
  allScreen.value.style.height = h + "px";
};
const route = useRoute(); // 获取路由对象
let showView = reactive({
  // 声明结构路由 显示/隐藏 对象
  allView: false,
  topView: false,
});
// 获取路由参数meta初始值
const getRouterDefault = () => {
  showView[route.meta.showView] = true;
};
// 监听路由结构显示的meta参数，变化时重新设置结构路由 显示/隐藏 对象
watch(
  () => route.meta.showView,
  (value) => {
    for (let key in showView) {
      // 将所有结构隐藏
      showView[key] = false;
    }
    showView[value] = true; // 显示当前结构路由
  }
);

// 全局窗口改变事件
const resize = () => {
  reScreenSize(); // 设置对应的根元素font-size
  setScreenSize(); // 设置全屏路由的宽高为展示区宽高
  store.commit('WINDOW_SIZE_CHANGE', { height: window.innerHeight, width: window.innerWidth}) // 修改VueX屏幕大小状态量
};

onMounted(() => {
  getRouterDefault(); // 获取路由meta初始值
  document.addEventListener("DOMContentLoaded", setScreenSize); // 设置全屏路由的宽高为展示区宽高
  reScreenSize(); // 查看设备宽度，设置对应的根元素font-size
  window.addEventListener("load", reScreenSize); // 绑定文档加载完毕触发事件
  window.addEventListener("resize", () => {
    resize();
  }); // 窗口变化触发
});
</script>

<style lang="scss" scoped>
</style>
