import { createRouter,createWebHistory } from "vue-router";
import Cookies from 'js-cookie';
// 定义路由规则
const routes = [
    {
        path: '/login', // 管理员登录页
        name: '登录',
        components: {
            all_view: () => import('../pages/LoginPage.vue')
        },
        meta: {
            showView: 'allView'
        }
    },
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
        path: '/log/phone-list', // 博客列表
        name: '博客手机列表',
        components: {
            content_view: () => import('../pages/log/phone/LogListPage.vue'),
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
        path: '/log/comment', // 博客类目
        name: '评论管理',
        components: {
            content_view: () => import('../pages/log/LogCommentPage.vue'),
        },
        meta: {
            showView: 'topView',
        },
    },
    {
        path: '/message', // 留言管理
        name: '留言',
        components: {
            content_view: () => import('../pages/message/MessageListPage.vue'),
        }, // 该路径下匹配的路由组件
        meta: {
            showView: 'topView',
        },
    },
    {
        path: '/message/phone-edit', // 留言管理
        name: '留言编辑手机端',
        components: {
            content_view: () => import('../pages/message/phone/MessageEditPage.vue'),
        }, // 该路径下匹配的路由组件
        meta: {
            showView: 'topView',
        },
    },
    {
        path: '/message/phone-list', // 留言管理
        name: '留言列表手机端',
        components: {
            content_view: () => import('../pages/message/phone/MessageListPage.vue'),
        }, // 该路径下匹配的路由组件
        meta: {
            showView: 'topView',
        },
    },
    {
        path: '/user', // 用户管理
        name: '用户',
        components: {
            content_view: () => import('../pages/user/UserPage.vue'),
        }, // 该路径下匹配的路由组件
        meta: {
            showView: 'topView',
        },
    },
    {
        path: '/user/list', // 用户管理
        name: '用户列表',
        components: {
            content_view: () => import('../pages/user/UserListPage.vue'),
        }, // 该路径下匹配的路由组件
        meta: {
            showView: 'topView',
        },
    },
    {
        path: '/user/admin', // 用户管理
        name: '管理员列表',
        components: {
            content_view: () => import('../pages/user/AdminListPage.vue'),
        }, // 该路径下匹配的路由组件
        meta: {
            showView: 'topView',
        },
    },
    {
        path: '/friendLink', // 友链管理
        name: '友链',
        components: {
            content_view: () => import('../pages/friendLink/friendLinkListPage.vue'),
        }, // 该路径下匹配的路由组件
        meta: {
            showView: 'topView',
        },
    },
    {
        path: '/config', // 配置管理
        name: '配置',
        components: {
            content_view: () => import('../pages/configuration/ConfigListPage.vue'),
        }, // 该路径下匹配的路由组件
        meta: {
            showView: 'topView',
        },
    },
]

const router = createRouter({ // 创建路由对象
    history:createWebHistory(), // 注意这里是方法！
    routes
})

// 路由守卫
// 登录拦截守卫
router.beforeEach((to,form,next) => {
    const isAuthenticated = !!Cookies.get('token'); // 检查是否有 token
    if(to.path!='/login' && !isAuthenticated) { // 若访问不是login页面也没有token，跳转到login页面
        next({path:'/login'})
        return
    }
    next() // 放行
})

// 创建路由对象及暴露
export default router