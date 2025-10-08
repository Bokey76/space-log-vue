<template>
  <div id="home-page">
    <div id="admin-bar" class="flex justify-between items-center">
      <span>网站已经为爱发电{{ beforeDate }}天了</span>
      <div class="flex">
        <span>欢迎您{{ adminMail }}管理员</span>
        <a-button id="exit" class="md:block hidden" @click="exit">退出登录</a-button>
      </div>
    </div>
    <div v-if="store.getters.phonModelOrNot">
      <a-card title="手机功能面板" class="mt-4 text-center">
        <a-card-grid class="cardItem" v-for="item in phoneNaviData" :key="item.name" @click="router.push(item.path)">{{
          item.name }}</a-card-grid>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { notification } from "ant-design-vue";
import Cookies from "js-cookie";
import { useRouter } from "vue-router";
const router = useRouter()
import { useStore } from 'vuex'
const store = useStore()

let beforeDate = ref(0) // 发电天数
let adminMail = ref('') // 管理员邮箱
const getDateBefore = (date) => { // 获取日期与现在之间的天数
  // 将输入的日期字符串转换为 Date 对象
  const targetDate = date instanceof Date ? date : new Date(date);
  // 获取当前日期
  const currentDate = new Date();
  // 计算两个日期之间的毫秒差异
  const timeDifference = currentDate - targetDate;
  // 将毫秒差异转换为天数
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  return daysDifference;
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

// #region
const phoneNaviData = ref([
  {
    name: '博客列表',
    path: '/log/phone-list'
  },
  {
    name: '博客上传',
    path: '/log/edit'
  },
  {
    name: '评论列表',
    path: '/message/phone-list'
  },
  {
    name: '评论上传',
    path: '/message/phone-edit'
  },
]) // 导航数据
// #endregion
onMounted(() => {
  beforeDate.value = getDateBefore('2024/07/06')
  adminMail.value = Cookies.get('mail')
})
</script>

<style lang="scss" scoped>
#home-page {

  #admin-bar {

    span {
      margin: 0 1rem;
      font-size: $x-small-font-size;
    }

    #exit {
      margin: 0 2rem 0 1rem;
    }
  }

  .cardItem {
    width: 50%;
    text-align: center;
    cursor: pointer;
  }
}
</style>