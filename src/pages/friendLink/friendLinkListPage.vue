<template>
    <div id="friend-list-page">
        <a-space class="px-16 py-8 w-full content-center justify-center" size="middle">
            <a-select v-model:value="friendLinkStatus" mode="multiple" style="width: 20rem;" placeholder="请选择友链状态"
                :options="statusOptions" @change="filterFriendLinkByStatus"></a-select>
            <a-button @click="createFriendLinkShow = true">新增友链</a-button>
        </a-space>
        <a-table :columns="listColumns" :data-source="listData" :expand-column-width="100" :rowKey="record => record.id"
            bordered>
            <template #bodyCell="{ column, record }">
                <!-- 封面 -->
                <template v-if="column.key === 'coverLink'">
                    <a-input v-if="currentColumn['id'] == record['id']" class="min-w-12"
                        v-model:value="currentColumn.coverLink" placeholder="请输入封面URL" />
                    <a-image :width="100" v-else
                        :src="utils.isNullOrEmpty(record[column.key]) ? 'default-link' : record[column.key]"
                        :fallback="store.state.config['not-found-image'].content"></a-image>
                </template>
                <!-- url -->
                <template v-if="column.key === 'url'">
                    <a-input v-if="currentColumn['id'] == record['id']" class="min-w-12"
                        v-model:value="currentColumn.url" placeholder="请输入URL" />
                    <a v-else :href="record[column.key]" target="_blank">{{ record[column.key] }}</a>
                </template>
                <!-- 状态 -->
                <template v-if="column.key == 'status' && currentColumn['id'] != record['id']">
                    <a-tag color="success" v-if="record[column.key] == 'active'">使用中</a-tag>
                    <a-tag color="warning" v-else-if="record[column.key] == 'inactive'">已弃用</a-tag>
                    <a-tag color="error" v-else-if="record[column.key] == 'rejected'">未通过</a-tag>
                    <a-tag color="processing" v-else-if="record[column.key] == 'pending'">待审核</a-tag>
                </template>
                <!-- 时间展示格式化 -->
                <template v-if="column.key === 'createTime' || column.key === 'updatedTime'">
                    {{ utils.formatDate(record[column.key]) }}
                </template>
                <!-- 编辑状态 -->
                <template v-if="currentColumn['id'] === record['id']">
                    <!-- 名称 -->
                    <a-input v-if="column.dataIndex === 'friendName'" class="min-w-12"
                        v-model:value="currentColumn.friendName" placeholder="请输入名称" />
                    <!-- 描述 -->
                    <a-textarea v-if="column.dataIndex === 'description'" class="min-w-12"
                        v-model:value="currentColumn.description" placeholder="请输入描述" allow-clear />
                    <!-- 状态 -->
                    <a-select v-if="column.dataIndex === 'status'" v-model:value="currentColumn.status"
                        placeholder="请选择状态" :options="statusOptions">
                    </a-select>
                </template>
                <!-- 操作列 -->
                <template v-if="column.key === 'action'">
                    <div class="actionBar">
                        <a v-if="currentColumn['id'] !== record['id']"
                            @click="utils.currentDataChange(record, currentColumn);">编辑</a>
                        <span class="actionBar" v-else>
                            <a @click="updateCurrentData(record)">保存</a>
                            <a @click="delete currentColumn['id'];">取消</a>
                        </span>
                        <a @click="deleteCurrentData(record.id)">删除</a>
                    </div>
                </template>
            </template>
        </a-table>
        <!-- 添加友链Model -->
        <a-modal v-model:open="createFriendLinkShow" title="新增友链" ok-text="确认" cancel-text="取消" @ok="createFriendLink">
            <a-space size="middle" direction="vertical" style="padding: 1rem 4rem;width: 100%;">
                名称
                <a-input placeholder="请输入名称" v-model:value="createFriendLinkData.friendName"></a-input>
                URL
                <a-input placeholder="请输入URL" v-model:value="createFriendLinkData.url"></a-input>
                描述
                <a-textarea v-model:value="createFriendLinkData.description" placeholder="请输入描述" allow-clear />
            </a-space>
        </a-modal>
    </div>
</template>

<script setup>
import utils from "@/utils";
import { Modal } from 'ant-design-vue';
import { onMounted, getCurrentInstance, ref, createVNode, reactive } from 'vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
const { proxy } = getCurrentInstance();
import { useStore } from 'vuex'
const store = useStore()
const listColumns = ref([
    {
        title: "id",
        dataIndex: "id",
        key: "id",
    },
    {
        title: "名称",
        dataIndex: "friendName",
        key: "friendName"
    },
    {
        title: "封面",
        dataIndex: "cover",
        key: "coverLink",
    },
    {
        title: "url",
        dataIndex: "url",
        key: "url"
    },
    {
        title: "描述",
        dataIndex: "description",
        key: "description",
        width: 400
    },
    {
        title: "状态",
        dataIndex: "status",
        key: "status"
    },
    {
        title: "创建时间",
        dataIndex: "createTime",
        key: "createTime"
    },
    {
        title: "更新时间",
        dataIndex: "updatedTime",
        key: "updatedTime"
    },
    {
        title: "操作",
        key: "action",
    },
])
let listData = ref([]); // 列表数据
let listCopy = ref([]) // 备份数据
let currentColumn = reactive({}); // 当前列数据
const statusOptions = ref([
    { value: 'active', label: "使用中" },
    { value: 'inactive', label: "已弃用" },
    { value: "pending", label: '待审核' },
    { value: 'rejected', label: "不通过" }
]) // 状态选项
const getListData = () => { // 获取列表数据
    proxy.$api.getAllFriendLink().then((res) => {
        listData.value = res.rows;
        listCopy.value = res.rows;
    });
};
const updateCurrentData = (record) => { // 保存当前列数据的编辑状态
    proxy.$api.updateFriendLink(currentColumn).then(res => {
        if (utils.analysisData(res)) utils.currentDataChange(currentColumn, record)
    })
    delete currentColumn['id']; // 删除currentColumn的id属性
}
const deleteCurrentData = (id) => { // 删除当前列
    Modal.confirm({
        title: '确定删除该友链吗？',
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red' }, '删除后不可恢复！'),
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
            proxy.$api.deleteFriendLink({ id: id }).then(res => {
                if (utils.analysisData(res)) {
                    listData.value = listData.value.filter(item => item.id !== currentColumn.id)
                    delete currentColumn['id']; // 删除currentColumn的id属性
                    getListData() // 重新获取表格数据
                }
            })
        },
    })
}
let createFriendLinkData = reactive({})
let createFriendLinkShow = ref(false)
const createFriendLink = () => { // 新增友链
    proxy.$api.addFriendLink(createFriendLinkData).then(res => {
        if (utils.analysisData(res)) {
            createFriendLinkShow.value = false
            getListData()
        }
    })
}
let friendLinkStatus = ref([])// 友链状态
const filterFriendLinkByStatus = () => { // 过滤友链状态
    friendLinkStatus.value = friendLinkStatus.value.filter((item) => {
        return item
    })
    if (!utils.isNullOrEmpty(friendLinkStatus.value)) {
        listData.value = listCopy.value.filter(item => {
            return friendLinkStatus.value.includes(item.status)
        })
    } else {
        listData.value = listCopy.value
    }
}
onMounted(() => {
    getListData()
})
</script>

<style lang="scss" scoped>
#friend-list-page {
    .actionBar {
        display: flex;
        flex-direction: column;
        text-align: center;
        a {
            text-wrap: nowrap;
        }
    }
}
</style>