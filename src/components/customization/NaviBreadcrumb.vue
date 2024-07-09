<template>
  <a-breadcrumb>
    <a-breadcrumb-item v-for="item in pathArr" :key="item.path"><a @click="router.push(item.path)">{{ item.name }}</a></a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup>
import { watch , ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
let pathArr = ref([])
// 监听路由变化，动态生成面包屑
watch(
  () => router.currentRoute.value.fullPath,
  (newVal) => {
    pathArr.value = [] // 清空面包屑数据
    let tempPath = newVal.indexOf('?') > 0 ? newVal.slice(0,newVal.indexOf('?')) : newVal
    while(tempPath) {
        pathArr.value.unshift(router.getRoutes().find((item) => item.path == tempPath))
        let lastIndex = tempPath.lastIndexOf('/')
        tempPath = tempPath.substring(0, lastIndex)
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
</style>
<style lang="scss" scoped>
.ant-breadcrumb {
    ::v-deep ol {
        margin: 1rem 2rem;
    } 
    ::v-deep .ant-breadcrumb-link {
        margin: 0 1rem;
    }
    ::v-deep a {
        color: $main-text-color;
        padding: 0 1rem;
    }
}
</style>