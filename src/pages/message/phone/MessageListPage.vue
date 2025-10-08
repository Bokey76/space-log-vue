<template>
    <div id="message-list-phone-page">
        <div class="flex justify-between items-center px-8">
            <LeftOutlined @click="router.back()" />
            <a-button @click="searchCommentShow = true">搜索</a-button>
        </div>
        <!-- 表格 -->
        <a-list item-layout="vertical" :data-source="listData" :pagination="pagination" bordered class="my-8">
            <template #renderItem="{ item }">
                <a-list-item :key="item.id">
                    <template #actions>
                        <a-button type="text" class="ml-4" @click="router.push('/message/phone-edit?replyId=' + item.id)">回复</a-button>
                        <a-button type="text" class="ml-4"
                            @click="router.push('/message/phone-edit?id=' + item.id)">编辑</a-button>
                        <a-button type="text" class="action-a" v-if="item.childrenCount > 0"
                            :loading="item.getSubCommentLoading ? item.getSubCommentLoading : false"
                            @click="getSubComment(item)">
                            {{ item.shrinkOrNot == undefined || item.shrinkOrNot ? `展开 ${item.childrenCount} 条留言` :
                                `收起` }}</a-button>
                    </template>
                    <div :class="item.parentId ? 'px-16 border-l-4' : ''">
                        <div class="flex justify-between items-center my-2">
                            <a-descriptions :title="''" size="small" :column="{ md: 3, sm: 2, xs: 2 }">
                                <a-descriptions-item label="" :span="2">
                                    <div class="flex items-center">
                                        <template v-if="item.userId == -1">
                                            <UserOutlined class="text-8xl" />
                                            <span class="mx-5">管理员留言</span>
                                        </template>
                                        <template v-else-if="item.user">
                                            <a-image :height="60" :width="60" style="border-color: #fff;" :preview="false"
                                                class="border-solid border-2 rounded-full overflow-hidden object-cover"
                                                :src="`${proxy.GLOBAL.VUE_APP_OSS_IMAGE_BASE_URL + proxy.GLOBAL.VUE_APP_OSS_BASE_DIR}/image/userAvatar/${item.user.id}.png`"
                                                :fallback="store.state.config['not-found-image'].content"></a-image>
                                            <span class="mx-5">{{ item.user.name }}</span>
                                        </template>
                                        <template v-else>
                                            <ExclamationOutlined class="text-8xl" />
                                            <span class="mx-5">未知用户</span>
                                        </template>
                                    </div>
                                </a-descriptions-item>
                                <a-descriptions-item label="" :span="2">
                                    <div class="comment-content mt-4 rounded-3xl overflow-hidden w-full">
                                        <MdPreView :mdContent="item.content"></MdPreView>
                                    </div>
                                </a-descriptions-item>
                                <a-descriptions-item label="状态">
                                    <a-tag :color="judgeCommentStatus(item.status)?.tagColor">{{ judgeCommentStatus(item.status)?.text }}</a-tag>
                                </a-descriptions-item>
                                <a-descriptions-item label="实体类型">
                                    <a-tag color="default">{{
                                        entityTypeList.find(type => type.value ==
                                            item.entityType)?.label
                                    }}</a-tag>
                                </a-descriptions-item>
                                <a-descriptions-item label="评论实体" v-if="item.entityType == 'Article'"
                                    :span="2">{{articleSnippet.find(article => article.id ==
                                        item.entityId)?.topic
                                    }}</a-descriptions-item>
                                <a-descriptions-item label="父评论id" v-if="item.parentId">{{ item.parentId
                                    }}</a-descriptions-item>
                                <a-descriptions-item label="subUserId" v-if="item.subUserId">{{ item.subUserId
                                    }}</a-descriptions-item>
                                <a-descriptions-item label="喜欢">{{ item.like }}</a-descriptions-item>
                                <a-descriptions-item label="时间">{{ utils.formatDate(item.createTime)
                                    }}</a-descriptions-item>
                            </a-descriptions>
                        </div>
                    </div>

                </a-list-item>
            </template>
        </a-list>
        <!-- 编辑评论 -->
        <a-drawer title="评论内容" width="80vw" placement="right" :open="searchCommentShow"
            @close="searchCommentShow = false">
            <div class="w-full flex flex-col p-8" style="height: 60vh;">
                <a-form :model="searchData" layout="vertical">
                    <a-form-item label="内容" name="content">
                        <a-input placeholder="请输入留言内容" v-model:value="searchData.content"></a-input>
                    </a-form-item>
                    <a-form-item label="实体类型" name="entityType">
                        <a-select v-model:value="searchData.entityType" placeholder="请选择实体类型"
                            :options="entityTypeList"></a-select>
                    </a-form-item>
                    <a-form-item label="评论实体" name="entityId">
                        <a-select v-model:value="searchData.entityId" show-search placeholder="请选择评论实体"
                            :options="entityList" :field-names="{ label: 'topic', value: 'id' }"
                            :filter-option="filterEntityOption"></a-select>
                    </a-form-item>
                    <a-form-item label="父评论" name="parentId">
                        <a-select v-model:value="searchData.parentId" show-search placeholder="请选择父评论"
                            :options="parentComment" :field-names="{ label: 'content', value: 'id' }"
                            :filter-option="filterParentCommentOption"></a-select>
                    </a-form-item>
                    <a-form-item label="评论时间" name="createTime">
                        <a-range-picker v-model:value="searchData.time" format="YYYY-MM-DD"
                            :placeholder="['开始时间', '结束时间']" />
                    </a-form-item>
                    <a-form-item label="状态" name="status">
                        <a-select v-model:value="searchData.status" mode="multiple" placeholder="请选择状态"
                            :options="statusOptions"></a-select>
                    </a-form-item>
                    <a-form-item label="用户" name="userId">
                        <a-select v-model:value="searchData.userId" show-search placeholder="请选择用户"
                            :options="userOptions" :filter-option="filterUserOption"
                            :field-names="{ label: 'name', value: 'id' }">
                            <template v-if="userOptions && userOptions.length <= 0" #notFoundContent>
                                <a-spin size="small" />
                            </template>
                        </a-select>
                    </a-form-item>
                </a-form>
                <a-button class="mb-8" @click="clear">清空</a-button>
            </div>
            <template #extra>
                <a-space>
                    <a-button @click="searchCommentShow = false">取消</a-button>
                    <a-button @click="search">搜索</a-button>
                </a-space>
            </template>
        </a-drawer>
    </div>
</template>

<script setup>
import utils from "@/utils";
import { ExclamationOutlined, UserOutlined, LeftOutlined } from '@ant-design/icons-vue'
import MdPreView from "@/components/common/MdPreView.vue";
import { onMounted, ref, reactive, getCurrentInstance, computed } from "vue";
const { proxy } = getCurrentInstance()
import { useStore } from 'vuex'
const store = useStore()
import { useRouter } from 'vue-router'
const router = useRouter()
let currentPage = ref(1) // 当前列表页
const originPageSize = 10 // 原始页大小
let pageSize = ref(originPageSize) // 展示页大小
let originTotal = 0 // 原始数据总数
let total = ref(originTotal) // 展示数据总数
let listData = ref([]) // 列表数据
const pagination = computed(() => ({
    total: total.value,
    current: currentPage.value,
    pageSize: pageSize.value,
    onChange: pageChange,
    showTotal: (totals) => `共 ${totals} 条数据`, // 用于显示数据总量和当前数据顺序
}))
const pageChange = (page) => { // 页面改变事件
    pageSize.value = originPageSize // 回归页面大小
    currentPage.value = page
    searchOrNot.value ? search(true) : getListData(true)
}
const getListData = (pageChangeOrNot = false) => {
    if (!pageChangeOrNot) currentPage.value = 1 // 若不是换页操作，重置页码
    // 重置页大小和total
    pageSize.value = originPageSize
    total.value = originTotal
    proxy.$api.getCommentList([currentPage.value, pageSize.value], searchData).then(res => {
        total.value = res.count
        originTotal = res.count
        listData.value = res.rows;
    })
}
const getSubComment = (item) => { // 获取子留言数据（请求or已保存在父留言的数据）
    if (item.shrinkOrNot == undefined || item.shrinkOrNot) { // 若是展开留言
        item.getSubCommentLoading = true
        if (utils.isNullOrEmpty(item.subCommentArr)) { // 若之前没请求过，发送请求
            proxy.$api.getSubComment({ id: item.id }).then(res => {
                const commentIndex = listData.value.findIndex(comment => comment.id == item.id)
                if (res.rows.length > 0) {
                    listData.value.splice(commentIndex + 1, 0, ...res.rows)
                    pageSize.value += res.rows.length
                    total.value += res.rows.length
                    item.subCommentArr = res.rows // 保存子留言数据在父留言中
                }
                item.getSubCommentLoading = false
            })
        } else { // 具有子留言数据
            const commentIndex = listData.value.findIndex(comment => comment.id == item.id)
            listData.value.splice(commentIndex + 1, 0, ...item.subCommentArr)
            pageSize.value += item.subCommentArr.length
            total.value += item.subCommentArr.length
            item.getSubCommentLoading = false
        }
        item.shrinkOrNot = false
    } else { // 收缩留言
        const commentIndex = listData.value.findIndex(comment => comment.id == item.id)
        listData.value.splice(commentIndex + 1, item.subCommentArr.length) // 去除list数据
        pageSize.value -= item.subCommentArr.length
        total.value -= item.subCommentArr.length
        item.shrinkOrNot = true
    }
}
const judgeCommentStatus = (status) => { // 判断留言状态函数
    switch (status) {
        case 'approved':
            return {tagColor:"success",text:'审核通过'}
        case 'rejected':
            return {tagColor:"error",text:'不通过'}
        case 'pending':
            return {tagColor:"processing",text:'待审核'}
        case 'archived':
            return {tagColor:"warning",text:'封存'}
        default:
            return {tagColor:"default",text:'未知状态'}
    }
}
let searchOrNot = ref(false) // 是否搜索状态量
let searchCommentShow = ref(false) // 搜索评论的drawer
let searchData = reactive({
    order: '[["createTime", "DESC"]]'
}) // 搜索内容
const statusOptions = ref([
    { value: 'pending', label: "待审核" },
    { value: 'approved', label: "通过" },
    { value: 'rejected', label: "未通过" },
    { value: 'archived', label: "封存" }
]) // 留言状态选项
const entityTypeList = ref([
    {
        label: '文章',
        value: 'Article'
    },
    {
        label: '留言',
        value: 'Message'
    },
]) // 评论类型列表
let allCommentSnippet = ref([]) // 所有评论的简介
let userOptions = ref([]) // 用户选项
let articleSnippet = ref([]) // 所有文章的简介
const getSearchData = () => { // 获取搜索数据
    proxy.$api.getAllUserIdAndName().then(res => {
        userOptions.value = res.rows
        userOptions.value.push({ id: -1, name: '站长' })
    })
    proxy.$api.searchAllComment({
        attributes: ["id", "content", "parentId", "userId", "entityType"]
    }).then(res => {
        allCommentSnippet.value = res.rows
    })
    proxy.$api.getAllArticleIdAndTopic().then(res => {
        articleSnippet.value = res.rows
    })
}
let entityList = computed(() => {  // 评论实体列表
    switch (searchData.entityType) {
        case 'Message':
            return [
                {
                    topic: '无实体',
                    id: -1
                },
            ];
        case 'Article': {
            return articleSnippet.value
        }
        default:
            return []
    }
})
let parentComment = computed(() => { // 父评论列表
    return allCommentSnippet.value.filter(item => {
        if (item.entityType != searchData.entityType) {
            return false
        }
        if (searchData.entityId && item.entityId == searchData.entityId) {
            return false
        }
        return true
    })
})
const filterUserOption = (input, option) => { // selector过滤用户通过用户名
    return option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}
const filterParentCommentOption = (input, option) => { // selector过滤用户通过用户名
    return option.content.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}
const filterEntityOption = (input, option) => { // selector过滤用户通过用户名
    return option.topic.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}
const search = (pageChangeOrNot = false) => { // 搜索
    searchOrNot.value = true
    if (!pageChangeOrNot) currentPage.value = 1 // 若不是换页操作，重置页码
    // 重置页大小
    pageSize.value = originPageSize
    total.value = originTotal
    proxy.$api.searchComment({ data: searchData, currentPage: currentPage.value, pageSize: pageSize.value }).then(res => {
        total.value = res.count
        originTotal = res.count
        listData.value = res.rows;
    })
}
const clear = () => { // 清空搜索
    currentPage.value = 1 // 重置页码
    for (let item in searchData) { // 重置搜索内容
        if (item == 'order') continue
        if (item == 'status') {
            searchData[item] = []
            continue
        }
        searchData[item] = null
    }
    if (searchOrNot.value) searchOrNot.value = false // 设置搜索状态量
    getListData()
}

onMounted(() => {
    getListData()
    getSearchData()
})
</script>

<style lang="scss" scoped>
.ant-list-bordered .ant-list-item {
    padding-inline: 2rem;
}
</style>

<style lang="scss">
#message-list-phone-page {
    .ant-list-item-action {
        display: flex;
        justify-content: end;
    }
}
</style>