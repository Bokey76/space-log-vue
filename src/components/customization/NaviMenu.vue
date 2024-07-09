<template>
  <a-menu mode="horizontal" :items="naviItems" @click="naviTo"></a-menu>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
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
        key: 'debris',
        label: '碎碎念',
        title: '碎碎念',
        path: '/debris',
    },
])
const naviTo = (e) => {
    router.push(e.item.path)
}
</script>

<style lang="scss" scoped>

</style>