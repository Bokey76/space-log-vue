<template>
    <div id="logEdit" :style="`height: ${editorHeight}px`">
        <!-- md编辑器 -->
        <MdEditor :content="originMdContent" :options="editorOptions" :preview="false"
            :save="() => createModalShow = true" style="height: 100%" :uploadImage="uploadImage" ref="mdEditor">
        </MdEditor>
        <!-- 添加留言modal -->
        <a-drawer title="评论内容" width="80vw" placement="right" :open="createModalShow" @close="createModalShow = false">
            <a-form :model="currentCommentData" layout="vertical">
                <a-form-item label="评论类型" name="entityType">
                    <a-select v-model:value="currentCommentData.entityType" :options="entityTypeList"></a-select>
                </a-form-item>
                <a-form-item label="评论实体" name="entityId">
                    <a-select v-model:value="currentCommentData.entityId" :options="entityList"
                        :field-names="{ label: 'content', value: 'id' }"></a-select>
                </a-form-item>
                <a-form-item label="父评论" name="parentId">
                    <a-select class="mb-8" v-model:value="currentCommentData.parentId" show-search placeholder="请选择留言"
                        style="width: 100%;" :options="parentComment" :filter-option="filterCommentOption"
                        :field-names="{ label: 'content', value: 'id' }">
                        <template v-if="parentComment && parentComment.length <= 0" #notFoundContent>
                            <a-spin size="small" />
                        </template>
                        <template #dropdownRender="{ menuNode: menu }">
                            <v-nodes :vnodes="menu" />
                            <a-divider style="margin: 4px 0" />
                            <a-button type="text" style="width: 100%;" @click="delete currentCommentData.parentId">
                                <template #icon>
                                    <DeleteOutlined />
                                </template>
                                清空选择
                            </a-button>
                        </template>
                    </a-select>
                </a-form-item>
                <a-form-item label="评论状态" name="status">
                    <a-select v-model:value="currentCommentData.status" :options="commentStatusList"></a-select>
                </a-form-item>
                <a-form-item label="二级评论的用户id" name="subUserId">
                    <span>{{ currentCommentData.subUserId || 'NULL' }}</span>
                </a-form-item>
                <a-form-item label="点赞" name="like">
                    <span>{{ currentCommentData.like || 0 }}</span>
                </a-form-item>
                <a-form-item label="评论时间" name="createTime">
                    <a-date-picker show-time v-model:value="currentCommentData.createTime"  />
                </a-form-item>
            </a-form>
            <template #extra>
                <a-space>
                    <a-button @click="createModalShow = false">取消</a-button>
                    <a-button @click="submitComment">提交</a-button>
                </a-space>
            </template>
        </a-drawer>
    </div>
</template>

<script setup>
import utils from "@/utils";
import {
    ref,
    onMounted,
    watch,
    getCurrentInstance,
    reactive,
    defineComponent,
    onBeforeUnmount,
    computed,
} from "vue";
const { proxy } = getCurrentInstance();
import { DeleteOutlined } from '@ant-design/icons-vue'; // 确保路径正确
import { onBeforeRouteLeave, useRouter } from "vue-router";
const router = useRouter();
import { useStore } from "vuex";
const store = useStore();
import MdEditor from "@/components/customization/MdEditor.vue";
import dayjs from 'dayjs';
let originMdContent = ref(""); // md内容
const mdEditor = ref(); // 获取子组件实例
let editorOptions = reactive({
    theme: "dark", // 主题 dark | light
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
    footers: ["markdownTotal", 0, "=", "scrollSwitch"], // 页脚内容
}); // md编辑器组件配置
let editorHeight = ref(0); // 编辑器高度
watch(
    () => store.state.WindowSize.height,
    (newVal) => { // 监听高度变化，设置编辑器高度
        editorHeight.value = newVal - document.getElementById("logEdit").offsetTop;
    }
);
watch(() => store.state.themeMode, (newVal => {
    if (!utils.isNullOrEmpty(newVal)) {
        editorOptions.theme = newVal == 'Light' ? 'light' : 'dark'
    }
}), { immediate: true })
let commentListData = ref([]) // 评论列表
const entityTypeList = ref([
    {
        label: '文章',
        value: 'Article'
    },
    {
        label: '留言',
        value: 'Message'
    },
]) // 评论类型列表
const commentStatusList = ref([
    {
        label: '审核通过',
        value: 'approved'
    },
    {
        label: '不通过',
        value: 'rejected'
    },
    {
        label: '待审核',
        value: 'pending'
    },
    {
        label: '封存',
        value: 'archived'
    },
]) // 评论状态
const getAllCommentList = () => { // 获取所有评论列表
    proxy.$api.searchAllComment({ "attributes": ["id", "content", "entityType"] }).then(res => {
        commentListData.value = res.rows
    })
}
let entityList = computed(() => {
    switch (currentCommentData.entityType) {
        case 'Message':
            return [
                {
                    content: '无实体',
                    id: -1
                },
            ];
        case 'Article': {
            return commentListData.value.filter(item => item.entityType == 'Article')
        }
        default:
            return []
    }
}) // 评论实体列表
let parentComment = computed(() => { // 父评论列表
    return commentListData.value.filter(item => {
        if (item.entityType != currentCommentData.entityType) {
            return false
        }
        if (currentCommentData.entityId && item.entityId == currentCommentData.entityId) {
            return false
        }
        return true
    })
})
const createSubComment = (parentComment) => { // 点击留言的回复事件
    currentCommentData.entityId = parentComment.entityId // 设置留言实体
    if (!utils.isNullOrEmpty(parentComment.parentId)) { // 若留言的是子留言，设置新留言的parentId和subUserId
        currentCommentData.parentId = parentComment.parentId
        currentCommentData.subUserId = parentComment.userId
    } else {
        currentCommentData.parentId = parentComment.id
    }
}
const getCurrentCommentData = () => { // 获取当前评论数据，判断是否是回复留言
    const commentId = router.currentRoute.value.query?.id
    const replyCommentId = router.currentRoute.value.query?.replyId
    if (commentId) {
        proxy.$api.searchAllComment({ "id": commentId }).then(res => {
            if (res.rows[0]) {
                res.rows[0].createTime = dayjs(res.rows[0].createTime)
                utils.currentDataChange(res.rows[0], currentCommentData)
                mdEditor.value.mdContent = currentCommentData.content
            }
        })
    } else if (replyCommentId) {
        proxy.$api.searchAllComment({ "id": replyCommentId }).then(res => {
            if (res.rows[0]) {
                createSubComment(res.rows[0])
            }
        })
    }
}
const updateComment = () => { // 保存留言更改
    currentCommentData.content = mdEditor.value.mdContent
    proxy.$api.updateComment(currentCommentData).then(res => {
        if (utils.analysisData(res)) {
            uploadUnSaveImagesPath.value = []
            createModalShow.value = false
        }
    })
}
let createModalShow = ref(false) // 创建留言Model框的 显示/隐藏
let currentCommentData = reactive({
    entityType: "Message",
    entityId: -1,
    status: "approved",
    createTime: dayjs()
}) // 留言数据载体
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
const filterCommentOption = (input, option) => { // selector过滤评论通过内容
    return option.content.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}
const createComment = () => { // 创建留言
    if (!utils.isNullOrEmpty(currentCommentData.parentId)) { // 若留言了其他留言
        const parentComment = commentListData.value.find(comment => comment.id == currentCommentData.parentId) // 找到该留言
        // 若该父留言有父留言，且当前新留言没有subUserId，就将新留言的parentId设为祖父留言id，subUserId设为父留言id
        if (!utils.isNullOrEmpty(parentComment.parentId) && utils.isNullOrEmpty(currentCommentData.subUserId)) {
            currentCommentData.parentId = parentComment.parentId
            currentCommentData.subUserId = parentComment.userId
        }
    }
    currentCommentData.content = mdEditor.value.mdContent
    proxy.$api.adminAddComment(currentCommentData).then(res => {
        if (utils.analysisData(res)) {
            mdEditor.value.mdContent = ''
            currentCommentData.content = ''
            uploadUnSaveImagesPath.value = []
            createModalShow.value = false
        }
    })
    createModalShow.value = false
}
const submitComment = () => { // 判断是创建留言还是更新留言
    if (router.currentRoute.value.query?.id) {
        updateComment()
    } else {
        createComment()
    }
}
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
const initData = () => { // 页面初始化
    getAllCommentList()
    getCurrentCommentData()
}
onMounted(() => {
    initData()
    editorHeight.value =
        store.state.WindowSize.height -
        document.getElementById("logEdit").offsetTop; // 设置编辑器高度
    window.addEventListener("beforeunload", defaultUnSaveTip); // 监听浏览器关闭和刷新事件，提示还没保存
});
onBeforeUnmount(() => {
    window.removeEventListener("beforeunload", defaultUnSaveTip);
});
</script>

<style lang="scss" scoped>
#logEdit {
    height: 100%;
    overflow: hidden;
}
</style>