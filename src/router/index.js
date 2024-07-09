import { createRouter,createWebHistory } from "vue-router";
// 定义路由规则
const routes = [
    {
        path: '/', // 首页
        name: '首页',
        components: {
            content_view: () => import('../pages/HomePage.vue'),
        }, // 该路径下匹配的路由组件
        meta: {
            showView: 'topView',
        },
    },
    {
        path: '/log', // 博客管理
        name: '博客',
        components: {
            content_view: () => import('../pages/log/LogPage.vue'),
        }, // 该路径下匹配的路由组件
        meta: {
            showView: 'topView',
        },
    },
    {
        path: '/log/list', // 博客列表
        name: '博客列表',
        components: {
            content_view: () => import('../pages/log/LogListPage.vue'),
        },
        meta: {
            showView: 'topView',
        },
    },
    {
        path: '/log/edit', // 博客编辑
        name: '博客编辑',
        components: {
            content_view: () => import('../pages/log/LogEditPage.vue'),
        },
        meta: {
            showView: 'topView',
        },
    },
    {
        path: '/log/type', // 博客类目
        name: '博客类目',
        components: {
            content_view: () => import('../pages/log/LogTypePage.vue'),
        },
        meta: {
            showView: 'topView',
        },
    },
    {
        path: '/debris', // 碎碎念管理
        name: '碎碎念',
        components: {
            content_view: () => import('../pages/debris/DebrisPage.vue'),
        }, // 该路径下匹配的路由组件
        meta: {
            showView: 'topView',
        },
    },
]
// 创建路由对象及暴露
export default createRouter({
    history:createWebHistory(), // 注意这里是方法！
    routes
})