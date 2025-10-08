<template>
    <div class="navi flex items-center  px-16 h-full justify-between">
        <a-button id="exit" class="bock md:hidden" @click="exit">退出登录</a-button>
        <a-menu mode="horizontal" class="flex-1 hidden md:block" :items="naviItems" @click="naviTo"></a-menu>
        <a-segmented v-model:value="currentTheme" @change="themeChange" :options="colorTheme" />
    </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import { notification } from "ant-design-vue";
import Cookies from "js-cookie";
import { useStore } from 'vuex'
const store = useStore()
const naviItems = ref([
    {
        key: 'home',
        label: '首页',
        title: '首页',
        path: '/',
    },
    {
        key: 'log',
        label: '博客',
        title: '博客',
        path: '/log',
    },
    {
        key: 'message',
        label: '留言',
        title: '留言',
        path: '/message',
    },
    {
        key: 'user',
        label: '用户',
        title: '用户',
        path: '/user',
    },
    {
        key: 'friendLink',
        label: '友链',
        title: '友链',
        path: '/friendLink',
    },
    {
        key: 'config',
        label: '配置',
        title: '配置',
        path: '/config',
    }
])
const naviTo = (e) => {
    router.push(e.item.path)
}
// --主题切换模块--
const colorTheme = reactive(['Light', 'Dark'])
let currentTheme = ref(colorTheme[0])
const themeChange = (newVal) => { // 改变主题事件
    currentTheme.value = newVal
    store.commit('SET_THEME', newVal)
}
const getLocalTheme = () => { // 获取本地主题
    const theme = localStorage.getItem('theme')
    if (theme) {
        currentTheme.value = theme
    } else {
        currentTheme.value = 'Light'
    }
}
const exit = () => { // 退出登录函数
  const allCookies = Cookies.get();
  for (const cookieName in allCookies) {
    if (Object.prototype.hasOwnProperty.call(allCookies, cookieName)) {
      Cookies.remove(cookieName);
    }
  }
  notification.success({
    message: "退出成功♻️",
    description: "继续探索世界，谱写自己的乐章叭🎷",
    duration: 3,
  })
  router.push('/login')
}
onMounted(() => {
    getLocalTheme()
})
</script>

<style lang="scss" scoped>
.navi,.ant-menu-horizontal {
    border-bottom: 1px solid $secondary-text-color
}
</style>