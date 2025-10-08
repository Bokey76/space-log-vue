<template>
    <div id="logTypePage">
        <a-space class="px-16 py-8 w-full content-center justify-center" size="middle">
            <a-button @click="createModalShow = true">新增类目</a-button>
        </a-space>
        <!-- 表格 -->
        <a-table :columns="listColumns" :data-source="listData" :pagination="pagination" :rowKey="record => record.id"
            bordered>
            <template #bodyCell="{ column, record }">
                <!-- 编辑状态 -->
                <template v-if="currentColumn['id'] === record['id']">
                    <a-input v-if="column.dataIndex === 'theme'" v-model:value="currentColumn.theme"
                        placeholder="请输入类目标题" style="width: 15rem;" />
                    <a-textarea v-if="column.dataIndex === 'introduction'" v-model:value="currentColumn.introduction"
                        placeholder="请输入类目简介" allow-clear></a-textarea>
                </template>
                <!-- 类目封面 -->
                <template v-if="column.key === 'cover'">
                    <div class="actionBar" v-if="currentColumn['id'] === record['id']">
                        <a-upload v-model:file-list="imageFileList" name="file"
                            :action="proxy.GLOBAL.VUE_APP_BASE_URL + '/oss/uploadImageQueryIn?path=/image/articleTypeCover/' + record.id"
                            :headers="fileHeaders" @change="handleUploadImageChange">
                            <a>上传封面</a>
                        </a-upload>
                        <a @click="deleteArticleCover(record.id)">删除封面</a>
                    </div>
                    <a-image :width="200" v-else
                        :src="`${proxy.GLOBAL.VUE_APP_OSS_IMAGE_BASE_URL + proxy.GLOBAL.VUE_APP_OSS_BASE_DIR}/image/articleTypeCover/${record.id}.png`"
                        :fallback="store.state.config['not-found-image'].content"></a-image>
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
                        <a @click="deleteCurrentArticleType(record.id)">删除</a>
                    </div>
                </template>
            </template>
        </a-table>
        <!-- 创建类目modal -->
        <a-modal v-model:open="createModalShow" title="新增文章类目" ok-text="确认" cancel-text="取消" @ok="addArticleType">
            <a-space size="middle" direction="vertical" style="padding: 1rem 4rem;width: 100%;">
                <a-input ref="inputRef" v-model:value="addType.theme" placeholder="请输入类目名" />
                <a-textarea v-model:value="addType.introduction" placeholder="请输入类目简介" allow-clear></a-textarea>
            </a-space>
        </a-modal>
    </div>
</template>

<script setup>
import utils from "@/utils";
import Cookies from "js-cookie";
import { Modal, notification } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { ref, reactive, onMounted, getCurrentInstance, computed, createVNode } from "vue";
const { proxy } = getCurrentInstance();
import { useStore } from 'vuex'
const store = useStore()
let listData = ref([]); // 列表数据
const listColumns = ref([
    {
        title: "id",
        dataIndex: "id",
        key: "id",
    },
    {
        title: "类目名称",
        dataIndex: "theme",
        key: "theme",
    },
    {
        title: "封面",
        dataIndex: "cover",
        key: "cover",
    },
    {
        title: "类目简介",
        dataIndex: "introduction",
        key: "introduction",
    },
    {
        title: "人气",
        dataIndex: "popularity",
        key: "popularity",
    },
    {
        title: "操作",
        key: "action",
    },
]) // 列表行
let currentPage = ref(1) // 当前页
let pageSize = ref(10) // 每页条数
let total = ref(0) // 总数据量
const getListData = () => { // 获取文章类目数据
    proxy.$api.getArticleTypes([currentPage.value, pageSize.value]).then(res => {
        listData.value = res.rows;
        total.value = res.count;
    })
}
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
    getListData()
}
let currentColumn = reactive({}); // 当前列数据
const updateCurrentData = (record) => { // 更新当前列数据
    proxy.$api.updateArticleType(currentColumn).then(res => {
        if (utils.analysisData(res)) utils.currentDataChange(currentColumn, record)
    })
    delete currentColumn['id']; // 删除currentColumn的id属性
}
let imageFileList = ref([]) // 上传封面数组
const fileHeaders = {
    authorization: `Bearer ${Cookies.get("token")}`,
}; // 封面图片上传header
const handleUploadImageChange = (info) => { // 上传图片状态改变回调
    if (info.file.status === 'done') {
        notification['success']({
            message: '上传成功',
            description: '上传封面成功',
            duration: 3,
        })
    } else if (info.file.status === 'error') {
        notification['success']({
            message: '上传失败',
            description: '上传封面失败',
            duration: 3,
        })
    }
}
const deleteArticleCover = (id) => { // 删除文章封面
    Modal.confirm({
        title: '确定删除该封面吗？',
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red' }, '删除后不可恢复！'),
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
            proxy.$api.deleteImage({ path: `/image/articleTypeCover/${id}.png` }).then(res => {
                utils.analysisData(res)
            })
        },
    })
}
const deleteCurrentArticleType = (id) => { // 删除当前类目
    Modal.confirm({
        title: '确定删除该文章类目吗？',
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red' }, '删除后类目下的文章也会被删除，删除后不可恢复！'),
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
            proxy.$api.deleteArticleType({ id: id }).then(res => {
                if (utils.analysisData(res)) {
                    listData.value = listData.value.filter(item => item.id !== currentColumn.id)
                    delete currentColumn['id']; // 删除currentColumn的id属性
                    getListData() // 重新获取表格数据
                }
            })
        },
    })
}
// -- 创建
let createModalShow = ref(false) // 创建modal
let addType = reactive({})
const addArticleType = () => { // 创建类目
    if (utils.isNullOrEmpty(addType.theme) && utils.isNullOrEmpty(addType.introduction)) { // 判断是否为空
        Modal.error({
            title: '创建失败',
            content: '请完善类目名称和简介',
        })
        return
    }
    proxy.$api.addArticleType(addType).then((res) => {
        if (utils.analysisData(res)) {
            getListData() // 若添加成功,重新获取文章类目
            createModalShow.value = false
        }
    })
}
onMounted(() => {
    getListData()
})
</script>

<style lang="scss" scoped>
#logTypePage {

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