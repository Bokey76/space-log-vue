<template>
  <div id="user-page">
    <!-- 导航页 -->
    <a-card title="用户管理" style="margin: 1rem 2rem;">
      <a-card-grid class="cardItem" v-for="item in naviData" :key="item.name" @click="router.push(item.path)">{{
        item.name }}</a-card-grid>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router";
const router = useRouter()

const naviData = ref([
  {
    name: '用户列表',
    path: '/user/list'
  },
  {
    name: '管理员列表',
    path: '/user/admin'
  },
]) // 导航数据
</script>

<style lang="scss" scoped>
#user-page {

  ::v-deep .ant-card .ant-card-head-title {
    text-align: center;
  }

  .cardItem {
    width: 50%;
    text-align: center;
    cursor: pointer;
  }

}
</style>