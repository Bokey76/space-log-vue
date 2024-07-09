<template>
  <div id="logPage">
    <a-card title="博客管理">
      <a-card-grid class="cardItem" v-for="item in naviData" :key="item.name" @click="router.push(item.path)">{{ item.name }}</a-card-grid>
    </a-card>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter()
import { ref } from 'vue';
const naviData = ref([
  {
    name: '博客列表',
    path: '/log/list'
  },
  {
    name: '博客上传',
    path: '/log/edit'
  },
  {
    name: '博客类目',
    path: '/log/type'
  },
])
</script>

<style lang="scss" scoped>
#logPage {

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