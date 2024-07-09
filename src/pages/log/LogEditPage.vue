<template>
  <div id="logEdit" :style="`height: ${editorHeight}px`">
    <!-- md编辑器 -->
    <MdEditor :content="originMdContent" :options="editorOptions" :save="editorSave" style="height: 100%"
      :uploadImage="uploadImage" :editChange="editChange" ref="mdEditor">
      <!-- 自定义页脚 -->
      <template v-slot:defFooters>
        <span v-if="articleData.topic != null">标题：{{ articleData.topic }}</span>
        <span v-if="articleData.topic != null" style="margin-left: 1rem;">最后更新时间：{{
          utils.formatDate(articleData.updatedTime, true) }}</span>
      </template>
    </MdEditor>
  </div>
  <!-- 新文章数据输入提示框 -->
  <a-modal v-model:open="newArticleUploadBar" title="文章信息" @ok="uploadNewArticle" ok-text="确认" cancel-text="取消">
    <a-form :model="newArticleData">
      <a-form-item label="标题" name="topic" :rules="[{ required: true, message: '请输入文章标题' }]">
        <a-input v-model:value="newArticleData.topic" style="width: 20rem;" placeholder="请输入文章标题" />
      </a-form-item>
      <a-form-item label="简介" name="introduction" :rules="[{ required: true, message: '请输入文章简介' }]">
        <a-textarea v-model:value="newArticleData.introduction" placeholder="请输入简介" allow-clear></a-textarea>
      </a-form-item>
      <a-form-item label="标题" name="topic" :rules="[{ required: true, message: '请选择文章类目' }]">
        <a-select v-model:value="newArticleData.typeId"
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
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import utils from "@/utils";
import { PlusOutlined } from '@ant-design/icons-vue';
import { Modal, notification } from 'ant-design-vue';
import { ref, onMounted, watch, getCurrentInstance, reactive, defineComponent } from 'vue';
const { proxy } = getCurrentInstance();
import { onBeforeRouteLeave, useRouter } from 'vue-router'
const router = useRouter()
import { useStore } from 'vuex';
const store = useStore()
import MdEditor from '@/components/customization/MdEditor.vue';
let originMdContent = ref(""); // md内容
const mdEditor = ref() // 获取子组件实例
let articleData = reactive({})
let editorOptions = ref({
  theme: "light", // 主题 dark | light
  toolbarsExclude: ["github"], // 不显示的tool
  showCodeRowNumber: true, // 显示代码块的行号
  autoFoldThreshold: 100, // 代码块，默认折叠代码的行数
  toolbars: [
    "0",
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
  footers: ['markdownTotal', 0, '=', 'scrollSwitch'], // 页脚内容
}); // md编辑器组件配置
let uploadImagesPath = ref([]) // 上传过未保存的图片路径
const uploadImage = async (files, callback) => { // 上传图片回调函数
  if (articleId.value < 0) { // 若是新建文章不支持上传图片，提示并退出
    notification.error({ message: '请保存后重试', description: '新文章暂时不支持上传图片' })
    return
  }
  const res = await Promise.all( // 处理各个图片的上传
    files.map((file) => {
      return new Promise((rev, rej) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", `/image/articleContent/${articleId.value}/`); // 上传到oss的路径
        formData.append("uuidOrNot", true); // 上传到oss的路径
        proxy.$api.uploadImage(formData).then((res) => { // 上传oss图片
          if (utils.analysisData(res)) {
            uploadImagesPath.value.push(res.data.path) // 记录上传的未保存图片路径
            rev(res)
          } else {
            rej(res)
          }
        })
      })
    })
  )
  callback(res.map((item) => item.data.url)); // 执行回调，插入图片url
}
let editorHeight = ref(0) // 编辑器高度
watch(() => store.state.WindowSize.height, (newVal) => { // 监听高度变化，设置编辑器高度
  editorHeight.value = newVal - document.getElementById('logEdit').offsetTop
})
let articleId = ref(-1) // 是否是新建的上传文章
const getArticleContent = (id) => { // 请求文章内容
  proxy.$api.getArticleContent([id]).then(res => {
    originMdContent.value = res.content
    articleData = res.data
  })
}
let newArticleUploadBar = ref(false) // 新文章数据输入框的 显示/隐藏
let newArticleData = reactive({
  topic: null,
  introduction: null,
  typeId: null,
}) // 新文章数据
let typeOptions = ref([]) // 文章类目数据
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
const getArticleTypes = () => { // 获取文章类目数据
  proxy.$api.getArticleTypesList().then((res) => {
    typeOptions.value = res
  });
}
const editorSave = (mdContent) => { // 编辑器保存回调函数
  originMdContent.value = mdContent // 同步更新文章内容到父组件
  editOrNot.value = false // 重置保存状态量
  if (articleId.value >= 0) { // 若当前为访问某文章，提交该文章的新内容
    updateArticleContent() // 更新文章内容
  } else { // 若当前为编辑新文章，提示输入文章信息，提交为新文章
    if (typeOptions.value.length == 0) getArticleTypes() // 若没有文章类目选择，获取文章类目
    newArticleUploadBar.value = true // 显示新文章数据输入框
  }
}
const uploadNewArticle = () => { // 新文章上传
  for (let item in newArticleData) { // 判断必填数据是否为空
    if (utils.isNullOrEmpty(newArticleData[item])) { // 判断是否为空
      notification['error']({
        message: '提示',
        description: '请完善文章信息',
        duration: 3,
      })
      return
    }
  }
  newArticleUploadBar.value = false // 隐藏新文章数据输入框
  let data = {
    data: newArticleData,
    content: originMdContent.value,
  }
  proxy.$api.addNewArticle(data).then(res => {
    if (utils.analysisData(res)) { // 若成功保存，跳转到该文章的编辑页
      router.replace(`/log/edit?id=${res.data.id}`)
    }
  })
}
const updateArticleContent = () => { // 更新文章内容
  proxy.$api.updateArticleContent({ id: articleId.value, content: originMdContent.value }).then(res => {
    utils.analysisData(res)
  })
}
let editOrNot = ref(false) // 是否是编辑文章
const unSaveTip = async () => { // 为保存提示
  if (editOrNot.value) {
    let saveOrNot = () => { // 封装函数，将Modal用Promise封装，阻塞进程进行，在用户选择后再继续进程
      return new Promise((resolve, reject) => {
        Modal.confirm({
          title: '提示',
          content: '您还没有保存哦，是否保存文件内容',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            resolve(true)
          },
          onCancel: () => {
            reject(false)
          }
        })
      })
    }
    await saveOrNot().then(res => {
      if (res) { // 若确定保存
        editorSave(mdEditor.value.mdContent) // 保存回调
        editOrNot.value = false // 重置状态
      }
    }).catch(err => {
      if (!err && uploadImagesPath.value.length > 0) { // 若取消保存，判断是否上传图片，删除上传的图片
        for (let path of uploadImagesPath.value) {
          proxy.$api.deleteImage({ path: path }).then(res => {
            utils.analysisData(res)
          })
        }
        uploadImagesPath.value = [] // 清空图片暂存
      }
    })
  }
}
onBeforeRouteLeave(async (to, form, next) => { // 监听路由离开，判断是否编辑文章，提示是否报保存
  await unSaveTip()
  next()
})
let articleContentInit = false // 文章内容初始化状态量
const editChange = () => { // 编辑器内容改变回调
  if (articleId.value < 0) { // 若为新文章，直接改变状态量
    editOrNot.value = true
  } else { // 若为旧文章，判断是否是原本内容到达触发的变化(第一次触发change事件)，若是原本内容到达触发变化，不改变，否则改变
    articleContentInit ? editOrNot.value = true : articleContentInit = true
  }
}
onMounted(() => {
  editorHeight.value = store.state.WindowSize.height - document.getElementById('logEdit').offsetTop // 设置编辑器高度
  router.currentRoute.value.query.id ? articleId.value = router.currentRoute.value.query.id : articleId.value = -1
  if (articleId.value >= 0) getArticleContent(articleId.value) // 若访问文章内容，发送请求
  window.addEventListener('beforeunload', async (e) => {
    e = e || window.event
    if (e && editOrNot.value) {
      e.returnValue = "还未保存，确定关闭浏览器吗？"
    }
    return "还未保存，确定关闭浏览器吗？"
  }) // 监听浏览器关闭和刷新事件，提示还没保存
})
</script>

<style lang="scss" scoped>
#logEdit {
  height: 100%;
  overflow: hidden;
}
</style>