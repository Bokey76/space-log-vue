<template>
  <!-- 全屏结构路由 -->
  <div ref="allScreen" id="allScreen" v-show="showView.allView">
    <router-view name="all_view"></router-view>
  </div>
  <!-- 上下结构路由 -->
  <div v-show="showView.topView">
    <a-layout>
      <a-layout-header >
        <!-- 导航 -->
        <NaviMenu ></NaviMenu>
      </a-layout-header>
      <a-layout-content>
        <NaviBreadcrumb v-if="!store.getters.phonModelOrNot"></NaviBreadcrumb>
        <!-- 内容 -->
        <div id="contentView" :class="store.getters.phonModelOrNot ? 'p-8':'px-8'" ref="contentView">
          <router-view name="content_view"></router-view>
        </div>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup>
import { onMounted, reactive, watch,getCurrentInstance } from "vue";
import NaviBreadcrumb from "./components/customization/NaviBreadcrumb.vue";
import NaviMenu from "./components/customization/NaviMenu.vue";
import LightConfig from '@/assets/themeConfig/Light.json'
import DarkConfig from '@/assets/themeConfig/Dark.json'
import { useRoute } from "vue-router";
import { useStore } from 'vuex'
const store = useStore()
const { proxy } = getCurrentInstance()

// --rem设置--
// 重新设置根元素font-size
const reScreenSize = () => {
  let w = document.documentElement.clientWidth; // 获取设备的宽度
  if (w <= 768) {
    document.documentElement.style.fontSize = '5px';
    return;
  }
  let n =
    10 * (w / 1920) > 40
      ? 40 + "px"
      : 10 * (w / 1920) >= 7.4
        ? 10 * (w / 1920) + "px"
        : 7.4 + "px";
  document.documentElement.style.fontSize = n;
};

// --全局路由设置--
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
// --主题设置--
const setThemeMode = () => { // 获取缓存设置主题
  const theme = localStorage.getItem('theme')
  if (theme) store.commit('SET_THEME', theme)
}
watch(() => store.state.themeMode, (newVal) => { // 监听store中主题变化，设置对应主题样式
  localStorage.setItem('theme', newVal) // 设置缓存
  const root = document.documentElement
  const config = newVal == 'Light' ? LightConfig : DarkConfig
  for (let attribute in config) {
    root.style.setProperty(attribute, config[attribute])
  }
}, { immediate:true, deep: true })
// 全局窗口改变事件
const resize = () => {
  reScreenSize(); // 设置对应的根元素font-size
  store.commit('WINDOW_SIZE_CHANGE', { height: window.innerHeight, width: window.innerWidth }) // 修改VueX屏幕大小状态量
};

const getGlobalCOnfig = async () => { // 获取并设置全局配置
  await proxy.$api.getGlobalConfig().then(res => {
    store.commit("SET_CONFIG",res)
  })
}

onMounted(() => {
  getGlobalCOnfig()
  getRouterDefault(); // 获取路由meta初始值
  reScreenSize(); // 查看设备宽度，设置对应的根元素font-size
  setThemeMode(); // 设置主题
  window.addEventListener("load", reScreenSize); // 绑定文档加载完毕触发事件
  window.addEventListener("resize", () => {
    resize();
  }); // 窗口变化触发
});
</script>

<style lang="scss" scoped>
#allScreen {
  overflow: hidden;
  position: relative;
  height: 100vh;
  width: 100vw;
  background-color: $main-background-color;
}

#contentView {
  min-height: 100vh;
}

* {
  color: $main-text-color;
}
</style>
