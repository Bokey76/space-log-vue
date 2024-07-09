<template>
    <div id="logTypePage">
        <!-- 表格 -->
        <a-table :columns="listColumns" :data-source="listData" :pagination="pagination" :rowKey="record => record.id"
            bordered >
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
                        :src="`${proxy.GLOBAL.VUE_APP_OSS_IMAGE_BASE_URL}/image/articleTypeCover/${record.id}.png`"
                        fallback="data:image/png;base64,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"></a-image>
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
                        <a @click="deleteCurrentArticle(record.id)">删除</a>
                    </div>
                </template>
            </template>
        </a-table>
    </div>
</template>

<script setup>
import utils from "@/utils";
import { Modal, notification } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { ref, reactive, onMounted, getCurrentInstance, computed , createVNode } from "vue";
const { proxy } = getCurrentInstance();
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
  authorization: 'authorization-text',
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
    }

}
</style>