<template>
    <div id="login-page" class="flex-box">
        <div id="login-card" class="flex-box min-w-96">
            <form @submit.prevent="login">
                <a-space direction="vertical" size="middle" class="flex-box">
                    <h1>登录</h1>
                    <a-input v-model:value="loginData.mail" class="card-item text-center" size="large"
                        placeholder="请输入管理员邮箱" />
                    <a-button v-if="sendCodeRest <= 0" @click="getLoginCode">发送验证码</a-button>
                    <a-button v-else :disabled="true">请 {{ sendCodeRest }} 秒后重试</a-button>
                    <a-input v-model:value="loginData.code" class="card-item text-center" size="large"
                        placeholder="请输入验证码" />
                    <a-button class="card-item" html-type="submit">登录</a-button>
                </a-space>
            </form>
        </div>
    </div>
</template>

<script setup>
import { reactive, getCurrentInstance, ref } from "vue"
import { useRouter } from "vue-router";
const router = useRouter()
import Cookies from 'js-cookie';
import utils from "@/utils";
const { proxy } = getCurrentInstance();
let loginData = reactive({ // 登录数据
    mail: null,
    code: null,
})
let sendCodeRest = ref(0) // 发送验证码按钮的休息时长
const login = () => { // 登录
    proxy.$api.adminLogin(loginData).then(res => {
        if (utils.analysisData(res)) { // 若登录成功，保存登录信息(包括token)，跳转到首页
            for (let key in res.data) {
                if (key != 'createTime' && key != 'updatedTime') {
                    // Cookies.set(key, res.data[key], { secure: true, expires: 10, sameSite: 'Strict' }) // secure：https  sameSite：和后端在同一域名下
                    Cookies.set(key, res.data[key], { expires: 10, secure: false })
                }
            }
            router.push('/')
        }
    })
}
const getLoginCode = () => {
    sendCodeRest.value = 60 // 60秒的休息时间
    const sendCodeInterval = setInterval(() => {
        if (--sendCodeRest.value <= 0) {
            clearInterval(sendCodeInterval)
        }
    }, 1000);
    proxy.$api.getLoginCode({ mail: loginData.mail }).then(res => {
        utils.analysisData(res)
    })
}
</script>

<style lang="scss" scoped>
#login-page {
    width: 100%;
    height: 100%;

    h1 {
        font-size: $large-font-size;
    }

    #login-card {
        border-radius: 20px;
        padding: 2rem;
        border: 1px solid $main-text-color;
    }

}

.flex-box {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>