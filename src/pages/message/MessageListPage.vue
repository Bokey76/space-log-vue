<template>
  <div id="log-comment-page">
    <!-- 查询 -->
    <a-space class="text-nowrap px-1 py-3 flex items-center justify-center" size="middle">
      内容
      <a-input placeholder="请输入留言内容" v-model:value="searchData.content" style="width: 20rem;"></a-input>
      时间
      <a-range-picker v-model:value="searchData.time" format="YYYY-MM-DD" :placeholder="['开始时间', '结束时间']"
        style="width: 25rem;" />
      <a-select v-model:value="searchData.status" mode="multiple" style="width: 20rem;" placeholder="请选择留言状态"
        :options="statusOptions"></a-select>
      <a-select v-model:value="searchData.userId" show-search placeholder="请选择用户" style="width: 20rem"
        :options="userOptions" :filter-option="filterUserOption" :field-names="{ label: 'name', value: 'id' }">
        <template v-if="userOptions && userOptions.length <= 0" #notFoundContent>
          <a-spin size="small" />
        </template>
      </a-select>
      <a-button @click="search">搜索</a-button>
      <a-button @click="clear">清空</a-button>
      <a-button @click="createModalShow = true">新增留言</a-button>
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
                  <a-menu-item key="archived">封存</a-menu-item>
                </a-menu>
              </template>
              <a-button type="text" class="flex items-center">
                {{ judgeCommentStatus(item.status) }}
                <DownOutlined />
              </a-button>
            </a-dropdown>
            <a-button type="text" class="action-a" @click="createSubComment(item)">回复</a-button>
            <template v-if="currentComment.id == item.id">
              <a-button type="text" class="action-a" @click="updateComment(currentComment)">保存</a-button>
              <a-button type="text" class="action-a" @click="delete currentComment['id']">取消</a-button>
            </template>
            <a-button v-else type="text" class="action-a" @click="utils.currentDataChange(item, currentComment)">编辑</a-button>
            <a-button type="text" class="action-a" v-if="item.childrenCount > 0"
              :loading="item.getSubCommentLoading ? item.getSubCommentLoading : false" @click="getSubComment(item)">
              {{ item.shrinkOrNot == undefined || item.shrinkOrNot ? `展开 ${item.childrenCount} 条留言` :
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
                  <a-tag color="processing" v-else-if="item.status == 'pending'">待审核</a-tag>
                  <a-tag color="warning" v-else-if="item.status == 'archived'">封存</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="实体类型">{{ item.entityType }}</a-descriptions-item>
                <a-descriptions-item label="实体id">{{ item.entityId }}</a-descriptions-item>
                <a-descriptions-item label="父留言id">{{ item.parentId ? item.parentId : '-'
                }}</a-descriptions-item>
                <template v-if="item.subUserId || item.subUserId == -1">
                  <a-descriptions-item label="subUserId">{{
                    item.subUserId }}</a-descriptions-item>
                  <a-descriptions-item label="留言用户">{{ item.subUserId == -1 ? '管理员' :
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
                  <span class="mx-5">管理员留言</span>
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
                <div class="comment-content mt-4 rounded-3xl overflow-hidden">
                  <MdPreView :mdContent="item.content" v-if="currentComment.id != item.id"></MdPreView>
                  <!-- md编辑器 -->
                  <MdEditor :content="currentComment.content" v-else :options="editorOptions" :uploadImage="uploadImage"
                    ref="updateCommentMdEditor" class="h-full"></MdEditor>
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
    <!-- 添加留言modal -->
    <a-modal v-model:open="createModalShow" title="新增留言" :width="'70vw'" ok-text="确认" cancel-text="取消"
      @ok="createComment">
      <div class="w-full flex flex-col p-8" style="height: 60vh;">
        回复留言
        <a-select class="mb-8" v-model:value="createCommentData.parentId" show-search placeholder="请选择留言"
          style="width: 100%;" :options="newCommentParentSelect" :filter-option="filterCommentOption"
          :field-names="{ label: 'content', value: 'id' }">
          <template v-if="newCommentParentSelect && newCommentParentSelect.length <= 0" #notFoundContent>
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
        留言内容
        <!-- md编辑器 -->
        <MdEditor :content="createCommentData.content" :options="editorOptions" :uploadImage="uploadImage"
          ref="mdEditor" class="h-full">
        </MdEditor>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import utils from "@/utils";
import { UserOutlined, ExclamationOutlined, DownOutlined, ExclamationCircleOutlined, DeleteOutlined, FireOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';
import { reactive, ref, getCurrentInstance, onMounted, computed, createVNode, defineComponent, watch, onBeforeUnmount } from 'vue';
import { useStore } from "vuex";
import { onBeforeRouteLeave } from "vue-router";
import { Modal } from 'ant-design-vue';
import MdEditor from "@/components/customization/MdEditor.vue";
import MdPreView from "@/components/common/MdPreView.vue";
const { proxy } = getCurrentInstance()
const store = useStore();

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
  proxy.$api.getCommentList([currentPage.value, pageSize.value], { entityType: "Message", parentId: null,order:'[["createTime", "DESC"]]' }).then(res => {
    total.value = res.count
    originTotal = res.count
    listData.value = res.rows;
  })
}
const judgeCommentStatus = (status) => { // 判断留言状态函数
  switch (status) {
    case 'approved':
      return '审核通过'
    case 'rejected':
      return '不通过'
    case 'pending':
      return '待审核'
    case 'archived':
      return '封存'
    default:
      return '未知状态'
  }
}
const updateCommentMdEditor = ref() // 更新用的md编辑器
let currentComment = reactive({}) // 当前编辑的留言
const updateComment = (comment) => { // 保存留言更改
  comment.content = updateCommentMdEditor.value.mdContent
  proxy.$api.updateComment(comment).then(res => {
    if (utils.analysisData(res)) {
      searchOrNot.value ? search(true) : getListData(true)
      uploadUnSaveImagesPath.value = []
    }
  })
}
const changeCommentStatus = (item, event) => { // 留言状态改变事件
  proxy.$api.updateComment({
    id: item.id,
    status: event.key
  }).then(res => {
    if (utils.analysisData(res)) {
      searchOrNot.value ? search(true) : getListData(true)
    }
  })
}
const deleteComment = (item) => { // 删除留言
  Modal.confirm({
    title: '确定删除该留言吗？',
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
let createModalShow = ref(false) // 创建留言Model框的 显示/隐藏
let newCommentParentSelect = ref([]) // 新留言的父留言数组
let createCommentData = reactive({
  entityType: "Message", // 留言类型固定文章
  entityId: -1
}) // 创建留言数据载体
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
const createSubComment = (parentComment) => { // 点击留言的回复事件
  createModalShow.value = true
  createCommentData.entityId = parentComment.entityId // 设置留言实体
  if (!utils.isNullOrEmpty(parentComment.parentId)) { // 若留言的是子留言，设置新留言的parentId和subUserId
    createCommentData.parentId = parentComment.parentId
    createCommentData.subUserId = parentComment.userId
  } else {
    createCommentData.parentId = parentComment.id
  }
}
const filterCommentOption = (input, option) => { // selector过滤评论通过内容
  return option.content.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}
const createComment = () => { // 创建留言
  if (!utils.isNullOrEmpty(createCommentData.parentId)) { // 若留言了其他留言
    const parentComment = newCommentParentSelect.value.find(comment => comment.id == createCommentData.parentId) // 找到该留言
    // 若该父留言有父留言，且当前新留言没有subUserId，就将新留言的parentId设为祖父留言id，subUserId设为父留言id
    if (!utils.isNullOrEmpty(parentComment.parentId) && utils.isNullOrEmpty(createCommentData.subUserId)) {
      createCommentData.parentId = parentComment.parentId
      createCommentData.subUserId = parentComment.userId
    }
  }
  createCommentData.content = mdEditor.value.mdContent
  proxy.$api.adminAddComment(createCommentData).then(res => {
    if (utils.analysisData(res)) {
      searchOrNot.value ? search(true) : getListData(true)
      mdEditor.value.mdContent = ''
      createCommentData.content = ''
      uploadUnSaveImagesPath.value = []
    }
  })
  createModalShow.value = false
}
// #endregion

// #region 搜索
let searchData = reactive({
  entityType: "Message",
  order:'[["createTime", "DESC"]]'
}) // 搜索内容
let searchOrNot = ref(false) // 是否搜索状态量
let statusOptions = ref([
  { value: 'pending', label: "待审核" },
  { value: 'approved', label: "通过" },
  { value: 'rejected', label: "未通过" },
  { value: 'archived', label: "封存" }
]) // 留言状态选项
let userOptions = ref([]) // 用户选项
const getSearchData = () => { // 获取搜索数据
  proxy.$api.getAllUserIdAndName().then(res => {
    userOptions.value = res.rows
    userOptions.value.push({ id: -1, name: '站长' })
  })
  proxy.$api.searchAllComment({
    entityType: "Message",
    attributes: ["id", "content", "parentId", "userId"]
  }).then(res => {
    newCommentParentSelect.value = res.rows
  })
}
const filterUserOption = (input, option) => { // selector过滤用户通过用户名
  return option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0;
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
    if (item == 'entityType') continue
    if (item == 'status') {
      searchData[item] = []
      continue
    }
    searchData[item] = null
  }
  if (searchOrNot.value) searchOrNot.value = false // 设置搜索状态量
  getListData()
}
// #endregion

// #region meEditor部份
const mdEditor = ref(); // 获取子组件实例
let editorOptions = reactive({
  theme: "dark", // 主题 dark | light
  toolbarsExclude: ["github"], // 不显示的tool
  showCodeRowNumber: true, // 显示代码块的行号
  autoFoldThreshold: 100, // 代码块，默认折叠代码的行数
  toolbars: [
    "revoke",
    "next",
    "save",
    1,
    "bold",
    "underline",
    "italic",
    "-",
    "title",
    "strikeThrough",
    "sub",
    "sup",
    "quote",
    "unorderedList",
    "orderedList",
    "task",
    "-",
    "codeRow",
    "code",
    "link",
    "image",
    "table",
    "mermaid",
    "katex",
    "-",
    "=",
    "pageFullscreen",
    "fullscreen",
    "preview",
    "htmlPreview",
    "previewOnly",
    "catalog",
  ], // 工具bar内容
  footers: ["markdownTotal", 0, "=", "scrollSwitch"], // 页脚内容
}); // md编辑器组件配置
watch(() => store.state.themeMode, (newVal => {
  if (!utils.isNullOrEmpty(newVal)) {
    editorOptions.theme = newVal == 'Light' ? 'light' : 'dark'
  }
}),{immediate:true})
let uploadUnSaveImagesPath = ref([]); // 上传过未保存的图片路径
const uploadImage = async (files, callback) => { // 上传图片回调函数
  const res = await Promise.all( // 处理各个图片的上传
    files.map((file) => {
      return new Promise((rev, rej) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", `/image/messageImage/admin/`); // 上传到oss的路径
        formData.append("uuidOrNot", true); // 上传到oss的路径
        proxy.$api.uploadImage(formData).then((res) => { // 上传oss图片
          if (utils.analysisData(res)) {
            uploadUnSaveImagesPath.value.push(res.data.path); // 记录上传的未保存图片路径
            rev(res);
          } else {
            rej(res);
          }
        });
      });
    })
  );
  callback(res.map((item) => item.data.url)); // 执行回调，插入图片url
};
const deleteAllUploadImage = () => { // 删除所有上传到oss未保存的图片
  if (uploadUnSaveImagesPath.value.length > 0) {
    for (let path of uploadUnSaveImagesPath.value) {
      proxy.$api.deleteImage({ path: path }).then((res) => {
        utils.analysisData(res);
      });
    }
    uploadUnSaveImagesPath.value = []; // 清空图片暂存
  }
}
const defaultUnSaveTip = () => { // 离开浏览器删除未保存的图片，用于浏览器的beforeUnload事件
  deleteAllUploadImage()
};
onBeforeRouteLeave(async (to, form, next) => { // 监听路由离开，删除未保存的图片
  await deleteAllUploadImage();
  next();
});
// #endregion
onMounted(() => {
  getSearchData()
  getListData()
  window.addEventListener("beforeunload", defaultUnSaveTip); // 监听浏览器关闭和刷新事件，提示还没保存
})
onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", defaultUnSaveTip);
});
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