<template>
    <div id="logList">
        <div class="flex justify-between items-center px-8">
            <LeftOutlined @click="router.back()" />
            <a-button @click="searchShow = true">搜索</a-button>
        </div>
        <a-list :data-source="listData" :pagination="pagination" bordered class="my-8">
            <template #renderItem="{ item }">
                <a-list-item :key="item.id">
                    <a-descriptions :title="item.topic" size="small" :column="{ md: 3, sm: 2, xs: 2 }">
                        <template #extra>
                            <div class="flex flex-col">
                                <a-button @click="item.createTime = dayjs(item.createTime);currentColumn = item; editDrawerShow = true">编辑简介</a-button>
                                <a-button class="mt-8" @click="router.push('/log/edit?id=' + item.id)">编辑内容</a-button>
                            </div>
                        </template>
                        <a-descriptions-item label="简介" :span="2">{{ item.introduction }}</a-descriptions-item>
                        <a-descriptions-item label="封面">
                            <a-image :width="50" :height="50" class="object-cover"
                                :src="`${proxy.GLOBAL.VUE_APP_OSS_IMAGE_BASE_URL + proxy.GLOBAL.VUE_APP_OSS_BASE_DIR}/image/articleCover/${item.id}.png`"
                                :fallback="store.state.config['not-found-image'].content"></a-image>
                        </a-descriptions-item>
                        <a-descriptions-item label="人气">{{ item.popularity }}</a-descriptions-item>
                        <a-descriptions-item label="点赞">{{ item.like }}</a-descriptions-item>
                        <a-descriptions-item label="类目">{{ typeOptions.find(type => type.id == item.typeId)?.theme }}</a-descriptions-item>
                        <a-descriptions-item label="状态">
                            <a-tag color="success" v-if="item.status == 'publish'">公开</a-tag>
                            <a-tag color="processing" v-else-if="item.status == 'archived'">封存</a-tag>
                            <a-tag color="default" v-else-if="item.status == 'draft'">草稿</a-tag>
                        </a-descriptions-item>
                        <a-descriptions-item label="创建时间">{{ utils.formatDate(item.createTime) }}</a-descriptions-item>
                    </a-descriptions>
                </a-list-item>
            </template>
        </a-list>
        <a-drawer title="编辑文章" width="80vw" placement="right" :open="editDrawerShow" @close="editDrawerShow = false">
            <a-form :model="currentColumn" layout="vertical">
                <a-form-item label="主题" name="topic">
                    <a-input v-model:value="currentColumn.topic" placeholder="请输入文章主题" />
                </a-form-item>
                <a-form-item label="简介" name="introduction">
                    <a-textarea v-model:value="currentColumn['introduction']" placeholder="请输入简介"
                        allow-clear></a-textarea>
                </a-form-item>
                <div class="columns-2">
                    <a-form-item label="类目" name="type">
                        <a-select v-model:value="currentColumn.typeId"
                            :options="typeOptions.map(item => ({ label: item.theme, value: item.id }))"
                            placeholder="请选择类目">
                        </a-select>
                    </a-form-item>
                    <a-form-item label="状态" name="status">
                        <a-select v-model:value="currentColumn.status" :options="statusOptions" placeholder="请选择状态">
                        </a-select>
                    </a-form-item>
                </div>
                <div class="columns-2">
                    <a-form-item label="封面" name="cover">
                        <a-upload v-model:file-list="imageFileList" name="file"
                        :action="proxy.GLOBAL.VUE_APP_BASE_URL + '/oss/uploadImageQueryIn?path=/image/articleCover/' + currentColumn.id"
                        :headers="fileHeaders" @change="handleUploadImageChange">
                        <a-button>上传封面</a-button>
                    </a-upload>
                </a-form-item>
                <a-form-item label="时间" name="createTime">
                    <a-date-picker show-time v-model:value="currentColumn.createTime"  />
                </a-form-item>
            </div>
            </a-form>
            <template #extra>
                <a-space>
                    <a-button @click="editDrawerShow = false">取消</a-button>
                    <a-button @click="updateCurrentData">提交</a-button>
                </a-space>
            </template>
        </a-drawer>
        <a-drawer title="搜索文章" width="80vw" placement="right" :open="searchShow" @close="searchShow = false">
            <a-form :model="searchData" layout="vertical">
                <a-form-item label="主题" name="topic">
                    <a-input placeholder="请输入文章主题" v-model:value="searchData.topic"></a-input>
                </a-form-item>
                <div class="columns-2">

                    <a-form-item label="类目" name="type">
                        <a-select v-model:value="searchData.typeId"
                            :options="typeOptions.map(item => ({ label: item.theme, value: item.id }))"
                            placeholder="请选择类目">
                        </a-select>
                    </a-form-item>
                    <a-form-item label="状态" name="status">
                        <a-select v-model:value="searchData.status" mode="multiple" placeholder="请选择文章状态"
                            :options="statusOptions"></a-select>
                    </a-form-item>
                </div>
                <div class="columns-2">
                    <a-form-item label="人气" name="popularity-srot">
                        <a-checkbox v-model:checked="searchData.popularity">人气</a-checkbox>
                    </a-form-item>
                    <a-form-item label="点赞" name="popularity-like">
                        <a-checkbox v-model:checked="searchData.like">点赞</a-checkbox>
                    </a-form-item>
                </div>
                <a-form-item label="发布时间" name="time">
                    <a-range-picker v-model:value="searchData.time" format="YYYY-MM-DD"
                        :placeholder="['开始时间', '结束时间']" />
                </a-form-item>
                <a-button @click="clear">清空</a-button>
            </a-form>
            <template #extra>
                <a-space>
                    <a-button @click="searchShow = false">取消</a-button>
                    <a-button @click="search">提交</a-button>
                </a-space>
            </template>
        </a-drawer>
    </div>
</template>

<script setup>
import utils from "@/utils";
import { LeftOutlined } from '@ant-design/icons-vue'
import { ref, reactive, computed, getCurrentInstance, onMounted } from 'vue'
const { proxy } = getCurrentInstance();
import { useRouter } from 'vue-router'
const router = useRouter()
import dayjs from 'dayjs';
import Cookies from "js-cookie";
import { notification } from 'ant-design-vue';
import { useStore } from 'vuex'
const store = useStore()

let listData = ref([]); // 列表数据
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
let currentColumn = reactive({
    createTime: dayjs()
}); // 当前列数据
let editDrawerShow = ref(false)
const getListData = (pageChangeOrNot) => { // 获取列表数据
    if (!pageChangeOrNot) currentPage.value = 1 // 若不是换页操作，重置页码
    proxy.$api.getArticleList([currentPage.value, pageSize.value]).then((res) => {
        total.value = res.count
        listData.value = res.rows;
    });
};
let statusOptions = ref([
    { value: 'publish', label: "公开" },
    { value: 'archived', label: "封存" },
    { value: 'draft', label: "草稿" },
]) // 留言状态选项
let typeOptions = ref([]) // 类目下拉框选项数据
const getArticleTypes = () => { // 获取文章类目数据
    proxy.$api.getArticleTypesList().then((res) => {
        typeOptions.value = res
    });
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
        notification['error']({
            message: '上传失败',
            description: '上传封面失败',
            duration: 3,
        })
    }
}
const updateCurrentData = () => { // 保存当前列数据的编辑状态
    proxy.$api.updateCurrentData(currentColumn).then(res => {
        utils.analysisData(res)
    })
    delete currentColumn['id']; // 删除currentColumn的id属性
}

// #region
let searchShow = ref(false) // 搜索展示
let searchData = reactive({}) // 搜索数据
let searchOrNot = ref(false) // 是否搜索状态量
const search = () => {
    if (!pageChange) currentPage.value = 1 // 若不是换页操作，重置页码
    proxy.$api.searchArticle({ data: searchData, currentPage: currentPage.value, pageSize: pageSize.value }).then(res => {
        total.value = res.count
        listData.value = res.rows;
        if (!searchOrNot.value) searchOrNot.value = true // 设置搜索状态量，已经搜索过了
    })
}
const clear = () => {
    currentPage.value = 1 // 重置页码
    for (let item in searchData) { // 重置搜索内容
        if (item == 'status') {
            searchData[item] = []
            continue
        }
        searchData[item] = null
    }
    if (searchOrNot.value) searchOrNot.value = false // 设置搜索状态量
    getListData()
}

// #enregion

onMounted(() => {
    getListData();
    getArticleTypes()
});

</script>

<style lang="scss" scoped>
.ant-list-bordered .ant-list-item {
    padding-inline: 2rem;
}
</style>

<style lang="scss">
#logList {
    .ant-list .ant-list-item .ant-list-item-action {
        margin-inline-start: 0;
    }

    .ant-descriptions .ant-descriptions-title {
        max-width: 60vw;
        white-space: normal
    }
}
</style>