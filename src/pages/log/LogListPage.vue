<template>
  <div id="logList">
    <!-- 筛选搜索 -->
    <a-space class="px-16 py-8 w-full content-center justify-center" size="middle">
      主题
      <a-input placeholder="请输入文章主题" v-model:value="searchData.topic" style="width: 20rem;"></a-input>
      类目
      <a-select v-model:value="searchData.typeId"
        :options="typeOptions.map(item => ({ label: item.theme, value: item.id }))" style="width: 20rem"
        placeholder="请选择类目">
      </a-select>
      <a-select v-model:value="searchData.status" mode="multiple" style="width: 20rem;" placeholder="请选择文章状态"
        :options="statusOptions"></a-select>
      <a-checkbox v-model:checked="searchData.popularity">人气</a-checkbox>
      <a-checkbox v-model:checked="searchData.like">点赞</a-checkbox>
      发布时间
      <a-range-picker v-model:value="searchData.time" format="YYYY-MM-DD" :placeholder="['开始时间', '结束时间']"
        style="width: 25rem;" />
      <a-button @click="search">搜索</a-button>
      <a-button @click="clear">清空</a-button>
    </a-space>
    <!-- 表格 -->
    <a-table :columns="listColumns" :data-source="listData" :expand-column-width="100" :rowKey="record => record.id"
      :pagination="pagination" bordered>
      <template #bodyCell="{ column, record }">
        <!-- 主题 -->
        <template v-if="column.key == 'topic' && currentColumn['id'] !== record['id']">
          <a @click="router.push({ name: '博客编辑', query: { id: record.id } })">{{ record[column.key] }}</a>
        </template>
        <!-- 封面 -->
        <template v-if="column.key === 'cover'">
          <div class="actionBar" v-if="currentColumn['id'] === record['id']">
            <a-upload v-model:file-list="imageFileList" name="file"
              :action="proxy.GLOBAL.VUE_APP_BASE_URL + '/oss/uploadImageQueryIn?path=/image/articleCover/' + record.id"
              :headers="fileHeaders" @change="handleUploadImageChange">
              <a>上传封面</a>
            </a-upload>
            <a @click="deleteArticleCover(record.id)">删除封面</a>
          </div>
          <a-image :width="100" v-else
            :src="`${proxy.GLOBAL.VUE_APP_OSS_IMAGE_BASE_URL + proxy.GLOBAL.VUE_APP_OSS_BASE_DIR}/image/articleCover/${record.id}.png`"
            :fallback="store.state.config['not-found-image'].content"></a-image>
        </template>
        <!-- 文章类目 -->
        <template v-if="column.key === 'typeId'">
          <!-- 文章类目 -->
          <a-select v-if="currentColumn['id'] === record['id']" v-model:value="currentColumn.typeId"
            :options="typeOptions.map(item => ({ label: item.theme, value: item.id }))" style="width: 15rem"
            placeholder="请选择类目">
          </a-select>
          <span v-else>{{typeOptions.find(item => item.id == record.typeId)?.theme || '未知'}}</span>
        </template>
        <!-- 状态 -->
        <template v-if="column.key === 'status'">
          <a-select v-model:value="currentColumn.status" v-if="currentColumn['id'] === record['id']"
            :options="statusOptions" style="width: 20rem" placeholder="请选择状态">
          </a-select>
          <template v-else>
            <a-tag color="success" v-if="record[column.key] == 'publish'">公开</a-tag>
            <a-tag color="processing" v-else-if="record[column.key] == 'archived'">封存</a-tag>
            <a-tag color="default" v-else-if="record[column.key] == 'draft'">草稿</a-tag>
          </template>
        </template>
        <!-- 时间展示格式化 -->
        <template v-if="column.key === 'createTime' || column.key === 'updatedTime'">
          {{ utils.formatDate(record[column.key]) }}
        </template>
        <!-- 编辑状态 -->
        <template v-if="currentColumn['id'] === record['id']">
          <!-- 文章标题 -->
          <a-input v-if="column.dataIndex === 'topic'" v-model:value="currentColumn.topic" placeholder="请输入文章主题" />

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
      <template #expandColumnTitle>
        <span>简介</span>
      </template>
      <template #expandedRowRender="{ record }">
        <a-textarea v-if="currentColumn['id'] === record['id']" v-model:value="currentColumn['introduction']"
          placeholder="请输入简介" allow-clear></a-textarea>
        <p v-else>
          {{ record.introduction }}
        </p>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import utils from "@/utils";
import { useRouter } from 'vue-router'
import Cookies from "js-cookie";
const router = useRouter()
import { Modal, notification } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { ref, reactive, onMounted, getCurrentInstance, createVNode, computed } from "vue";
const { proxy } = getCurrentInstance();
import { useStore } from 'vuex'
const store = useStore()
const listColumns = [
  {
    title: "id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "主题",
    dataIndex: "topic",
    key: "topic",
    width: 400,
  },
  {
    title: "文章封面",
    dataIndex: "cover",
    key: "cover",
  },
  {
    title: "类目id",
    dataIndex: "typeId",
    key: "typeId",
  },
  {
    title: "人气",
    dataIndex: "popularity",
    key: "popularity",
  },
  {
    title: "点赞数",
    dataIndex: "like",
    key: "like",
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "发布时间",
    name: "创建时间",
    dataIndex: "createTime",
    key: "createTime",
  },
  {
    title: "更新时间",
    dataIndex: "updatedTime",
    key: "updatedTime",
  },
  {
    title: "操作",
    key: "action",
  },
]; // 列表行
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
let currentColumn = reactive({}); // 当前列数据
const getListData = (pageChangeOrNot) => { // 获取列表数据
    if (!pageChangeOrNot) currentPage.value = 1 // 若不是换页操作，重置页码
    proxy.$api.getArticleList([currentPage.value, pageSize.value]).then((res) => {
      total.value = res.count
      listData.value = res.rows;
    })
};
let typeOptions = ref([]) // 类目下拉框选项数据
const getArticleTypes = () => { // 获取文章类目数据
  proxy.$api.getArticleTypesList().then((res) => {
    typeOptions.value = res
  });
}
const updateCurrentData = (record) => { // 保存当前列数据的编辑状态
  proxy.$api.updateCurrentData(currentColumn).then(res => {
    if (utils.analysisData(res)) utils.currentDataChange(currentColumn, record)
  })
  delete currentColumn['id']; // 删除currentColumn的id属性
}

const deleteCurrentData = (id) => { // 删除当前列
  Modal.confirm({
    title: '确定删除该文章吗？',
    icon: createVNode(ExclamationCircleOutlined),
    content: createVNode('div', { style: 'color:red' }, '删除后不可恢复！'),
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      proxy.$api.deleteArticle({ id: id }).then(res => {
        if (utils.analysisData(res)) {
          listData.value = listData.value.filter(item => item.id !== currentColumn.id)
          delete currentColumn['id']; // 删除currentColumn的id属性
          getListData() // 重新获取表格数据
        }
      })
    },
  })
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
const deleteArticleCover = (id) => { // 删除文章封面
  Modal.confirm({
    title: '确定删除该封面吗？',
    icon: createVNode(ExclamationCircleOutlined),
    content: createVNode('div', { style: 'color:red' }, '删除后不可恢复！'),
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      proxy.$api.deleteImage({ path: `/image/articleCover/${id}.png` }).then(res => {
        utils.analysisData(res)
      })
    },
  })
}
let statusOptions = ref([
  { value: 'publish', label: "公开" },
  { value: 'archived', label: "封存" },
  { value: 'draft', label: "草稿" },
]) // 留言状态选项
let searchData = reactive({}) // 筛选搜索数据
let searchOrNot = ref(false) // 是否搜索状态量
const search = (pageChange) => { // 筛选搜索
  if (!pageChange) currentPage.value = 1 // 若不是换页操作，重置页码
  proxy.$api.searchArticle({ data: searchData, currentPage: currentPage.value, pageSize: pageSize.value }).then(res => {
    total.value = res.count
    listData.value = res.rows;
    if (!searchOrNot.value) searchOrNot.value = true // 设置搜索状态量，已经搜索过了
  })
}
const clear = () => { // 清空搜索内容
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
onMounted(() => {
  getListData();
  getArticleTypes()
});
</script>

<style lang="scss" scoped>
#logList {

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