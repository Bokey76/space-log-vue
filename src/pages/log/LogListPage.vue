<template>
  <div id="logList">
    <!-- 筛选搜索 -->
    <a-space style="padding: 1rem 2rem;width: 100% ;align-content: center;justify-content: center;" size="middle">
      主题
      <a-input placeholder="请输入文章主题" v-model:value="searchData.topic" style="width: 20rem;"></a-input>
      类目
      <a-select v-model:value="searchData.typeId"
        :options="typeOptions.map(item => ({ label: item.theme, value: item.id }))" style="width: 20rem"
        placeholder="请选择类目">
        <template #dropdownRender="{ menuNode: menu }">
          <v-nodes :vnodes="menu" />
          <a-divider />
          <a-space direction="vertical" align="center" style="width: 100%;">
            <a-input ref="inputRef" v-model:value="addType.theme" placeholder="请输入类目名" />
            <a-textarea v-model:value="addType.introduction" placeholder="请输入类目简介" allow-clear></a-textarea>
            <a-button type="text" @click="addArticleType">
              <template #icon>
                <plus-outlined />
              </template>
              添加类目
            </a-button>
          </a-space>
        </template>
      </a-select>
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
        <!-- 编辑状态 -->
        <template v-if="currentColumn['id'] === record['id']">
          <!-- 文章标题 -->
          <a-input v-if="column.dataIndex === 'topic'" v-model:value="currentColumn.topic" placeholder="请输入文章主题"
            style="width: 15rem;" />
          <!-- 文章类目 -->
          <a-select v-if="column.dataIndex === 'typeId'" v-model:value="currentColumn.typeId"
            :options="typeOptions.map(item => ({ label: item.theme, value: item.id }))" style="width: 15rem"
            placeholder="请选择类目">
            <template #dropdownRender="{ menuNode: menu }">
              <v-nodes :vnodes="menu" />
              <a-divider />
              <a-space direction="vertical" align="center" style="width: 100%;">
                <a-input ref="inputRef" v-model:value="addType.theme" placeholder="请输入类目名" />
                <a-textarea v-model:value="addType.introduction" placeholder="请输入类目简介" allow-clear></a-textarea>
                <a-button type="text" @click="addArticleType">
                  <template #icon>
                    <plus-outlined />
                  </template>
                  添加类目
                </a-button>
              </a-space>
            </template>
          </a-select>
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
            :src="`${proxy.GLOBAL.VUE_APP_OSS_IMAGE_BASE_URL}/image/articleCover/${record.id}.png`"
            fallback="data:image/png;base64,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"></a-image>
        </template>
        <!-- 时间展示格式化 -->
        <template v-if="column.key === 'createTime' || column.key === 'updatedTime'">
          {{ utils.formatDate(record[column.key]) }}
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
const router = useRouter()
import { Modal, notification } from 'ant-design-vue';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { ref, reactive, onMounted, getCurrentInstance, defineComponent, createVNode, computed } from "vue";
const { proxy } = getCurrentInstance();
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
  searchOrNot.value ? search() : getListData()
}
let currentColumn = reactive({}); // 当前列数据
const getListData = () => { // 获取列表数据
  proxy.$api.getArticleList([currentPage.value, pageSize.value]).then((res) => {
    total.value = res.count
    listData.value = res.rows;
  });
};

let typeOptions = ref([]) // 类目下拉框选项数据
let addType = reactive({
  theme: null,
  introduction: null,
}) // 添加类目数据
const VNodes = defineComponent({ // 定义拉下菜单的原始内容组件
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
const getArticleTypes = () => { // 获取文章类目数据
  proxy.$api.getArticleTypesList().then((res) => {
    typeOptions.value = res
  });
}
const addArticleType = () => { // 添加文章类目
  if (utils.isNullOrEmpty(addType.theme) && utils.isNullOrEmpty(addType.introduction)) { // 判断是否为空
    Modal.error({
      title: '添加失败',
      content: '请完善类目名称和简介',
    })
    return
  }
  proxy.$api.addArticleType(addType).then((res) => {
    if (utils.analysisData(res)) getArticleTypes() // 若添加成功,重新获取文章类目
  })
}

const updateCurrentData = (record) => { // 保存当前列数据的编辑状态
  proxy.$api.updateCurrentData(currentColumn).then(res => {
    if (utils.analysisData(res)) utils.currentDataChange(currentColumn, record)
  })
  delete currentColumn['id']; // 删除currentColumn的id属性
}

const deleteCurrentArticle = (id) => { // 删除文章
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
      proxy.$api.deleteImage({ path: `/image/articleCover/${id}.png` }).then(res => {
        utils.analysisData(res)
      })
    },
  })
}
let searchData = reactive({}) // 筛选搜索数据
let searchOrNot = ref(false) // 是否搜索状态量
const search = () => { // 筛选搜索
  proxy.$api.searchArticle({ data: searchData, currentPage: currentPage.value, pageSize: pageSize.value }).then(res => {
    total.value = res.count
    listData.value = res.rows;
    if (!searchOrNot.value) searchOrNot.value = true // 设置搜索状态量，已经搜索过了
  })
}
const clear = () => { // 清空搜索内容
  for (let item in searchData) {
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
  }

}
</style>