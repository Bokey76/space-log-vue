<template>
    <div id="log-comment-page">
        <!-- 查询 -->
        <a-space class="text-nowrap px-1 py-3 flex items-center justify-center" size="middle">
            内容
            <a-input placeholder="请输入评论内容" v-model:value="searchData.content" style="width: 20rem;"></a-input>
            时间
            <a-range-picker v-model:value="searchData.time" format="YYYY-MM-DD" :placeholder="['开始时间', '结束时间']"
                style="width: 25rem;" />
            <a-select v-model:value="searchData.status" mode="multiple" style="width: 20rem;" placeholder="请选择评论状态"
                :options="statusOptions"></a-select>
            <a-select v-model:value="searchData.userId" show-search placeholder="请选择用户" style="width: 20rem"
                :options="userOptions" :filter-option="filterUserOption" :field-names="{ label: 'name', value: 'id' }">
                <template v-if="userOptions && userOptions.length <= 0" #notFoundContent>
                    <a-spin size="small" />
                </template>
            </a-select>
            <a-select v-model:value="searchData.entityId" show-search placeholder="请选择文章" style="width: 20rem"
                :options="articleOptions" :filter-option="filterArticleOption"
                :field-names="{ label: 'topic', value: 'id' }">
                <template v-if="articleOptions && articleOptions.length <= 0" #notFoundContent>
                    <a-spin size="small" />
                </template>
            </a-select>
            <a-button @click="search">搜索</a-button>
            <a-button @click="clear">清空</a-button>
            <a-button @click="createModalShow = true">新增评论</a-button>
        </a-space>
        <!-- 表格 -->
        <a-list item-layout="vertical" :data-source="listData" :pagination="pagination" bordered class="my-8">
            <template #renderItem="{ item }">
                <a-list-item :key="item.id">
                    <!-- 操作 -->
                    <template #actions>
                        <a-dropdown>
                            <template #overlay>
                                <a-menu @click="changeCommentStatus(item, $event)">
                                    <a-menu-item key="approved">审核通过</a-menu-item>
                                    <a-menu-item key="rejected">不通过</a-menu-item>
                                    <a-menu-item key="pending">待审核</a-menu-item>
                                </a-menu>
                            </template>
                            <a-button type="text" class="flex items-center">
                                {{ judgeCommentStatus(item.status) }}
                                <DownOutlined />
                            </a-button>
                        </a-dropdown>
                        <a-button type="text" class="action-a" @click="createSubComment(item)">回复</a-button>
                        <a-button type="text" class="action-a" v-if="item.childrenCount > 0"
                            :loading="item.getSubCommentLoading ? item.getSubCommentLoading : false"
                            @click="getSubComment(item)">
                            {{ item.shrinkOrNot == undefined || item.shrinkOrNot ? `展开 ${item.childrenCount} 条评论` :
                                `收起` }}</a-button>
                        <a-button type="text" class="action-a" @click="deleteComment(item)">删除</a-button>
                    </template>
                    <!-- 额外内容 -->
                    <template #extra>
                        <div class="max-w-xl flex flex-col justify-start h-full">
                            <a-descriptions :column="{ xl: 2, md: 1 }" class="mt-8">
                                <a-descriptions-item label="id">{{ item.id }}</a-descriptions-item>
                                <a-descriptions-item label="用户id">{{ item.userId }}</a-descriptions-item>
                                <a-descriptions-item label="状态">
                                    <a-tag color="success" v-if="item.status == 'approved'">审核通过</a-tag>
                                    <a-tag color="error" v-else-if="item.status == 'rejected'">不通过</a-tag>
                                    <a-tag color="processing" v-else>待审核</a-tag>
                                </a-descriptions-item>
                                <a-descriptions-item label="实体类型">{{ item.entityType }}</a-descriptions-item>
                                <a-descriptions-item label="实体id">{{ item.entityId }}</a-descriptions-item>
                                <a-descriptions-item label="父评论id">{{ item.parentId ? item.parentId : '-'
                                    }}</a-descriptions-item>
                                <template v-if="item.subUserId || item.subUserId == -1">
                                    <a-descriptions-item label="subUserId">{{
                                        item.subUserId }}</a-descriptions-item>
                                    <a-descriptions-item label="评论用户">{{ item.subUserId == -1 ? '管理员' :
                                        item.subUser?.name
                                        }}</a-descriptions-item>
                                </template>
                            </a-descriptions>
                        </div>
                    </template>
                    <!-- 内容 -->
                    <a-list-item-meta>
                        <template #title>
                            <div :class="item.parentId ? 'px-16 border-l-4' : ''">
                                <div v-if="item.userId == -1" class="flex items-center my-2">
                                    <UserOutlined class="text-8xl" />
                                    <span class="mx-5">管理员评论</span>
                                </div>
                                <div v-else-if="item.user" class="flex items-center my-2">
                                    <a-image :width="60" :height="60" style="border-color: #fff;" :preview="false"
                                        class="border-solid border-2 rounded-full overflow-hidden object-cover"
                                        :src="`${proxy.GLOBAL.VUE_APP_OSS_IMAGE_BASE_URL + proxy.GLOBAL.VUE_APP_OSS_BASE_DIR}/image/userAvatar/${item.user.id}.png`"
                                        :fallback="store.state.config['not-found-image'].content"></a-image>
                                    <span class="mx-5">{{ item.user.name }}</span>
                                </div>
                                <div v-else class="flex items-center my-2">
                                    <ExclamationOutlined class="text-8xl" />
                                    <span class="mx-5">未知用户</span>
                                </div>
                                <div class="comment-content">
                                    {{ item.content }}
                                </div>
                            </div>
                        </template>
                    </a-list-item-meta>
                    <div class="comment-descript-bar pl-4 flex items-center">
                        <div class="flex items-center">
                            <ClockCircleOutlined class="mr-2" />
                            <span>{{ utils.formatDate(item.createTime, true) }}</span>
                        </div>
                        <div class="mx-4 flex items-center">
                            <FireOutlined class="mr-2" />
                            <span>{{ item.like }}</span>
                        </div>
                    </div>
                </a-list-item>
            </template>
        </a-list>
        <!-- 添加评论modal -->
        <a-modal v-model:open="createModalShow" title="新增评论" ok-text="确认" cancel-text="取消" @ok="createComment">
            <a-space size="middle" direction="vertical" style="padding: 1rem 4rem;width: 100%;">
                <div>
                    评论文章
                    <a-select v-model:value="createCommentData.entityId" show-search placeholder="请选择文章"
                        style="width: 100%;" :options="articleOptions" :filter-option="filterArticleOption"
                        :field-names="{ label: 'topic', value: 'id' }" @change="newCommentEntityIdChange">
                        <template v-if="articleOptions && articleOptions.length <= 0" #notFoundContent>
                            <a-spin size="small" />
                        </template>
                    </a-select>
                </div>
                <div>
                    回复评论
                    <a-select v-model:value="createCommentData.parentId" show-search placeholder="请选择评论"
                        style="width: 100%;" :options="newCommentParentSelect" :filter-option="filterCommentOption"
                        :field-names="{ label: 'content', value: 'id' }">
                        <template v-if="listData && listData.length <= 0" #notFoundContent>
                            <a-spin size="small" />
                        </template>
                        <template #dropdownRender="{ menuNode: menu }">
                            <v-nodes :vnodes="menu" />
                            <a-divider style="margin: 4px 0" />
                            <a-button type="text" style="width: 100%;" @click="delete createCommentData.parentId">
                                <template #icon>
                                    <DeleteOutlined />
                                </template>
                                清空选择
                            </a-button>
                        </template>
                    </a-select>
                </div>
                <div>
                    评论内容
                    <a-textarea v-model:value="createCommentData.content" placeholder="请输入评论内容" allow-clear />
                </div>
            </a-space>
        </a-modal>
    </div>
</template>

<script setup>
import utils from "@/utils";
import { UserOutlined, ExclamationOutlined, DownOutlined, ExclamationCircleOutlined, DeleteOutlined, FireOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';
import { reactive, ref, getCurrentInstance, onMounted, computed, createVNode, defineComponent } from 'vue';
import { Modal } from 'ant-design-vue';
const { proxy } = getCurrentInstance()
import { useStore } from 'vuex'
const store = useStore()
// #region 数据获取及展示，增删改查
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
const getListData = (pageChangeOrNot = false) => { // 获取列表数据
    if (!pageChangeOrNot) currentPage.value = 1 // 若不是换页操作，重置页码
    // 重置页大小和total
    pageSize.value = originPageSize
    total.value = originTotal
    proxy.$api.getCommentList([currentPage.value, pageSize.value], { entityType: "Article", parentId: null,order:'[["createTime", "DESC"]]' }).then(res => {
        total.value = res.count
        originTotal = res.count
        listData.value = res.rows;
    })
}
const judgeCommentStatus = (status) => { // 判断评论状态函数
    switch (status) {
        case 'approved':
            return '审核通过'
        case 'rejected':
            return '不通过'
        case 'pending':
            return '待审核'
        default:
            return '未知状态'
    }
}
const changeCommentStatus = (item, event) => { // 评论状态改变事件
    proxy.$api.updateComment({
        id: item.id,
        status: event.key
    }).then(res => {
        if (utils.analysisData(res)) {
            searchOrNot.value ? search(true) : getListData(true)
        }
    })
}
const deleteComment = (item) => { // 删除评论
    Modal.confirm({
        title: '确定删除该评论吗？',
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red' }, '删除后不可恢复！'),
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
            proxy.$api.deleteCommentById({ id: item.id }).then(res => {
                if (utils.analysisData(res)) {
                    getListData() // 重新获取表格数据
                }
            })
        },
    })
}
const getSubComment = (item) => { // 获取子评论数据（请求or已保存在父评论的数据）
    if (item.shrinkOrNot == undefined || item.shrinkOrNot) { // 若是展开评论
        item.getSubCommentLoading = true
        if (utils.isNullOrEmpty(item.subCommentArr)) { // 若之前没请求过，发送请求
            proxy.$api.getSubComment({ id: item.id }).then(res => {
                const commentIndex = listData.value.findIndex(comment => comment.id == item.id)
                if (res.rows.length > 0) {
                    listData.value.splice(commentIndex + 1, 0, ...res.rows)
                    pageSize.value += res.rows.length
                    total.value += res.rows.length
                    item.subCommentArr = res.rows // 保存子评论数据在父评论中
                }
                item.getSubCommentLoading = false
            })
        } else { // 具有子评论数据
            const commentIndex = listData.value.findIndex(comment => comment.id == item.id)
            listData.value.splice(commentIndex + 1, 0, ...item.subCommentArr)
            pageSize.value += item.subCommentArr.length
            total.value += item.subCommentArr.length
            item.getSubCommentLoading = false
        }
        item.shrinkOrNot = false
    } else { // 收缩评论
        const commentIndex = listData.value.findIndex(comment => comment.id == item.id)
        listData.value.splice(commentIndex + 1, item.subCommentArr.length) // 去除list数据
        pageSize.value -= item.subCommentArr.length
        total.value -= item.subCommentArr.length
        item.shrinkOrNot = true
    }
}
let createModalShow = ref(false) // 创建评论Model框的 显示/隐藏
let newCommentParentSelect = ref([]) // 新评论的父评论数组
let createCommentData = reactive({
    entityType: "Article", // 评论类型固定文章
}) // 创建评论数据载体
const VNodes = defineComponent({
    props: {
        vnodes: {
            type: Object,
            required: true,
        },
    },
    render() {
        return this.vnodes;
    },
});
const newCommentEntityIdChange = () => { // 新评论的评论对象改变
    delete createCommentData.parentId
    proxy.$api.searchAllComment({
        entityType: "Article",
        entityId: createCommentData.entityId,
    }).then(res => {
        if (utils.analysisData(res)) {
            newCommentParentSelect.value = res.rows
        }
    })
}
const createSubComment = (parentComment) => { // 点击评论的回复事件
    createModalShow.value = true
    createCommentData.entityId = parentComment.entityId // 设置评论实体
    newCommentEntityIdChange()
    if (!utils.isNullOrEmpty(parentComment.parentId)) { // 若评论的是子评论，设置新评论的parentId和subUserId
        createCommentData.parentId = parentComment.parentId
        createCommentData.subUserId = parentComment.userId
    } else {
        createCommentData.parentId = parentComment.id
    }
}
const createComment = () => { // 创建评论
    if (!utils.isNullOrEmpty(createCommentData.parentId)) { // 若评论了其他评论
        const parentComment = listData.value.find(comment => comment.id == createCommentData.parentId) // 找到该评论
        // 若该父评论有父评论，且当前新评论没有subUserId，就将新评论的parentId设为祖父评论id，subUserId设为父评论id
        if (!utils.isNullOrEmpty(parentComment.parentId) && utils.isNullOrEmpty(createCommentData.subUserId)) {
            createCommentData.parentId = parentComment.parentId
            createCommentData.subUserId = parentComment.userId
        }
    }
    proxy.$api.adminAddComment(createCommentData).then(res => {
        if (utils.analysisData(res)) {
            searchOrNot.value ? search(true) : getListData(true)
        }
    })
    createModalShow.value = false
}
// #endregion

// #region 搜索
let searchData = reactive({
    entityType: "Article",
    order:'[["createTime", "DESC"]]'
}) // 搜索内容
let searchOrNot = ref(false) // 是否搜索状态量
let statusOptions = ref([
    { value: 'pending', label: "待审核" },
    { value: 'approved', label: "通过" },
    { value: 'rejected', label: "未通过" },
]) // 评论状态选项
let userOptions = ref([]) // 用户选项
const getSearchData = () => { // 获取搜索数据
    proxy.$api.getAllUserIdAndName().then(res => {
        userOptions.value = res.rows
        userOptions.value.push({ id: -1, name: '站长' })
    })
    proxy.$api.getAllArticleIdAndTopic().then(res => {
        articleOptions.value = res.rows
    })
}
const filterUserOption = (input, option) => { // selector过滤用户通过用户名
    return option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}
let articleOptions = ref([])
const filterArticleOption = (input, option) => { // selector过滤文章通过主题
    return option.topic.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}
const filterCommentOption = (input, option) => { // selector过滤评论通过内容
    return option.content.toLowerCase().indexOf(input.toLowerCase()) >= 0;
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
        if(['entityType','createTime'].includes(item)) continue
        if(item == 'status') {
            searchData[item] = []
            continue
        }
        searchData[item] = null
    }
    if (searchOrNot.value) searchOrNot.value = false // 设置搜索状态量
    getListData()
}
// #endregion
onMounted(() => {
    getSearchData()
    getListData()
})
</script>

<style lang="scss" scoped>
#log-comment-page {
    .action-a {
        margin-left: 1rem;
    }

    .comment-content {
        font-size: $small-font-size;
    }

    .comment-descript-bar {
        color: $secondary-text-color;
        font-size: 16px;
    }
}
</style>