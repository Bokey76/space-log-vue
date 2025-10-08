<template>
    <div id="user-list-page">
        <a-space style="padding: 1rem 2rem;width: 100% ;align-content: center;justify-content: center;" size="middle">
            邮箱
            <a-input placeholder="请输入邮箱" v-model:value="searchData.mail" style="width: 20rem;"></a-input>
            <a-button @click="search">搜索</a-button>
            <a-button @click="clear">清空</a-button>
            <a-button @click="createDataShow = true">新增管理员</a-button>
        </a-space>
        <!-- 表格 -->
        <a-table :columns="listColumns" :data-source="listData" :expand-column-width="100" :rowKey="record => record.id"
            :pagination="pagination" bordered>
            <template #bodyCell="{ column, record }">
                <!-- 时间展示格式化 -->
                <template v-if="column.key === 'createTime' || column.key === 'updatedTime'">
                    {{ utils.formatDate(record[column.key]) }}
                </template>
                <!-- 编辑状态 -->
                <template v-if="currentColumn['id'] === record['id']">
                    <!-- 邮箱 -->
                    <a-input v-if="column.dataIndex === 'mail'" v-model:value="currentColumn.mail" placeholder="请输入邮箱"
                        style="width: 20rem;" />
                    <!-- 用户名 -->
                    <a-input v-if="column.dataIndex === 'name'" v-model:value="currentColumn.name" placeholder="请输入名称"
                        style="width: 15rem;" />
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
        <!-- 添加管理员Model -->
        <a-modal v-model:open="createDataShow" title="新增管理员" ok-text="确认" cancel-text="取消" @ok="createOneData">
            <a-space size="middle" direction="vertical" style="padding: 1rem 4rem;width: 100%;">
                邮箱
                <a-input placeholder="请输入邮箱" v-model:value="createData.mail" style="width: 20rem;"></a-input>
            </a-space>
        </a-modal>
    </div>
</template>

<script setup>
import utils from "@/utils";
import { ref, reactive, onMounted, getCurrentInstance, computed, createVNode } from 'vue'
import { Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
const { proxy } = getCurrentInstance();
const listData = ref([]) // 表格数据
const listColumns = [
    {
        title: "id",
        dataIndex: "id",
        key: "id"
    },
    {
        title: "邮箱",
        dataIndex: "mail",
        key: "mail"
    },
    {
        title: "注册时间",
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
] // 表格行
let currentPage = ref(1) // 当前列表页
let pageSize = ref(10) // 页大小
let total = ref(0) // 数据总数
const pagination = computed(() => ({
    total: total.value,
    current: currentPage.value,
    pageSize: pageSize.value,
    onChange: pageChange,
    showTotal: (totals) => `共 ${totals} 条数据`, // 用于显示数据总量和当前数据顺序
    position: ['bottomCenter'], // 设置分页组件位置
    style: {
        textAlign: 'center', // 设置分页组件居中
    },
}))
const pageChange = (page) => { // 页码改变事件
    currentPage.value = page
    searchOrNot.value ? search(true) : getListData(true)
}
let currentColumn = reactive({}); // 当前列数据
const getListData = (pageChangeOrNot) => { // 获取数据
    if (!pageChangeOrNot) currentPage.value = 1 // 若不是换页操作，重置页码
    proxy.$api.getAdminData([currentPage.value, pageSize.value]).then(res => {
        total.value = res.count
        listData.value = res.rows;
    })
}
const updateCurrentData = (record) => { // 保存当前列数据的编辑状态
    proxy.$api.updateAdminData(currentColumn).then(res => {
        if (utils.analysisData(res)) utils.currentDataChange(currentColumn, record)
    })
    delete currentColumn['id']; // 删除currentColumn的id属性
}
const deleteCurrentData = (id) => { // 删除当前列
    Modal.confirm({
        title: '确定删除该管理员吗？',
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red' }, '删除后不可恢复！'),
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
            proxy.$api.deleteAdminById({ id: id }).then(res => {
                if (utils.analysisData(res)) {
                    listData.value = listData.value.filter(item => item.id !== currentColumn.id)
                    delete currentColumn['id']; // 删除currentColumn的id属性
                    getListData() // 重新获取表格数据
                }
            })
        },
    })
}

let searchData = reactive({
    mail: null,
}) // 搜索数据
let searchOrNot = ref(false) // 是否搜索状态量
const search = (pageChange) => { // 搜索函数
    if (!pageChange) currentPage.value = 1 // 若不是换页操作，重置页码
    proxy.$api.searchAdmin({ data: searchData, currentPage: currentPage.value, pageSize: pageSize.value }).then(res => {
        total.value = res.count
        listData.value = res.rows;
        if (!searchOrNot.value) searchOrNot.value = true // 设置搜索状态量，已经搜索过了
    })
}
const clear = () => { // 清空函数
    currentPage.value = 1 // 重置页码
    for (let item in searchData) { // 重置搜索内容
        searchData[item] = null
    }
    if (searchOrNot.value) searchOrNot.value = false // 设置搜索状态量
    getListData()
}
let createDataShow = ref(false) // 新增用户model显示状态量
let createData = reactive({
    mail: null,
}) // 新增的数据
const createOneData = () => { // 新增数据
    if (utils.objHasNullOrEmpty(createData)) return
    if (!utils.isValidEmail(createData.mail)) return
    proxy.$api.createAdmin(createData).then(res => {
        if (utils.analysisData(res)) {
            searchOrNot.value ? search(true) : getListData(true)
        }
    })
    createDataShow.value = false
}
onMounted(() => {
    getListData()
})
</script>

<style lang="scss" scoped>
#user-list-page {

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