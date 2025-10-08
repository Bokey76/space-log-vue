<template>
    <div id="config-page">
        <a-space class="px-16 py-8 w-full content-center justify-center" size="middle">
            <a-input placeholder="请输入配置名称" v-model:value="configLabel" @change="filterConfig"></a-input>
            <a-select v-model:value="configStatus" mode="multiple" style="width: 25rem;" placeholder="请选择数据类型"
                :options="statusOptions" @change="filterConfig"></a-select>
            <a-checkbox v-model:checked="searchConfigEnvSelectAll">全选</a-checkbox>
            <a-button @click="createConfigShow = true">新增配置</a-button>
        </a-space>
        <a-table :columns="listColumns" :data-source="listData" :expand-column-width="100" :rowKey="record => record.id"
            bordered>
            <template #bodyCell="{ column, record }">
                <!-- 数据类型 -->
                <template v-if="column.key === 'type'">
                    <template v-if="currentColumn['id'] === record['id']">
                        <a-select v-model:value="currentColumn.type" style="width: 25rem;" placeholder="请选择配置环境"
                            :options="statusOptions"></a-select>
                    </template>
                    <template v-else>
                        {{statusOptions.find(item => item.value == record.type)?.label}}
                    </template>
                </template>
                <!-- 内容  -->
                <template v-if="column.key === 'content' && currentColumn['id'] != record['id']">
                    {{ record['content'] }}
                </template>
                <!-- 编辑状态 -->
                <template v-if="currentColumn['id'] === record['id']">
                    <template v-if="column.key === 'content'">
                        <a-textarea v-if="currentColumn.type != 'JSON'" v-model:value="currentColumn.content" placeholder="请输入配置内容" allow-clear />
                        <json-editor v-else v-model="currentColumn.content" currentMode="code" language="cn"></json-editor>
                    </template>
                    <template v-if="column.key === 'label'">
                        <a-input placeholder="请输入配置名称" v-model:value="currentColumn.label"></a-input>
                    </template>
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
        <!-- 添加配置Model -->
        <a-modal v-model:open="createConfigShow" title="新增配置" ok-text="确认" cancel-text="取消" width="70vw" @ok="createConfig">
            <a-space size="middle" direction="vertical" style="padding: 1rem 4rem;width: 100%;">
                配置名称
                <a-input placeholder="请输入配置名称" v-model:value="createConfigData.label"></a-input>
                配置内容
                <a-textarea v-if="createConfigData.type != 'JSON'" v-model:value="createConfigData.content" placeholder="请输入配置内容" allow-clear />
                <json-editor v-else v-model="createConfigData.content" currentMode="code" language="cn"></json-editor>
                配置数据类型
                <a-select v-model:value="createConfigData.type" placeholder="请选择数据类型" class="flex-1"
                    :options="statusOptions"></a-select>
            </a-space>
        </a-modal>
    </div>
</template>

<script setup>
import utils from "@/utils";
import JsonEditor from 'json-editor-vue3';
import { Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { onMounted, getCurrentInstance, ref, createVNode, reactive } from 'vue'
const { proxy } = getCurrentInstance();
// #region 配置
const listColumns = ref([
    {
        title: "id",
        dataIndex: "id",
        key: "id",
    },
    {
        title: "名称",
        dataIndex: "label",
        key: "label"
    },
    {
        title: "内容",
        dataIndex: "content",
        key: "content",
    },
    {
        title: "数据类型",
        dataIndex: "type",
        key: "type"
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
    { value: 'STRING', label: "字符串" },
    { value: 'JSON', label: "JSON" },
]) // 状态选项
const getListData = () => { // 获取列表数据
    proxy.$api.getAllConfig().then((res) => {
        listData.value = res.rows;
        listCopy.value = res.rows;
    });
};
const updateCurrentData = (record) => { // 保存当前列数据的编辑状态
    let submitData = JSON.parse(JSON.stringify(currentColumn))
    if(submitData.type == 'JSON') {
        submitData.content = JSON.stringify(submitData.content)
    }
    proxy.$api.updateConfig(submitData).then(res => {
        if (utils.analysisData(res)) utils.currentDataChange(currentColumn, record)
    })
    delete currentColumn['id']; // 删除currentColumn的id属性
}
const deleteCurrentData = (id) => { // 删除当前列
    Modal.confirm({
        title: '确定删除该配置吗？',
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red' }, '删除后不可恢复！'),
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
            proxy.$api.deleteConfig({ id: id }).then(res => {
                if (utils.analysisData(res)) {
                    listData.value = listData.value.filter(item => item.id !== currentColumn.id)
                    delete currentColumn['id']; // 删除currentColumn的id属性
                    getListData() // 重新获取表格数据
                }
            })
        },
    })
}
let createConfigData = reactive({})
let createConfigShow = ref(false)
const createConfig = () => { // 新增配置
    let submitData = JSON.parse(JSON.stringify(createConfigData))
    if(submitData.type == 'JSON') {
        submitData.content = JSON.stringify(submitData.content)
    }
    proxy.$api.addConfig(submitData).then(res => {
        if (utils.analysisData(res)) {
            createConfigShow.value = false
            getListData()
        }
    })
}
let configStatus = ref([])// 配置状态
let configLabel = ref(null) // 配置名称
let searchConfigEnvSelectAll = ref(false) // 搜索全选状态量
const filterConfig = () => { // 过滤配置
    configStatus.value = configStatus.value.filter((item) => { // 去除undefined
        return item
    })
    if (!utils.isNullOrEmpty(configStatus.value) || !utils.isNullOrEmpty(configLabel.value)) {
        if (!utils.isNullOrEmpty(configStatus.value)) {
            listData.value = listCopy.value.filter(item => {
                console.log(item.type, configStatus.value.includes(String(item.type)));
                return configStatus.value.includes(String(item.type))
            })
        }
        if (!utils.isNullOrEmpty(configLabel.value)) {
            listData.value = listData.value.filter(item => {
                return item.label.includes(configLabel.value)
            })
        }
    } else {
        listData.value = listCopy.value
    }
}
// #endregion 

// #region 文件上传
// let currentOssPath = ref('/')
// const getOssFileList = () => { // 获取oss文件目录
//     proxy.$api.getFilesInPath(currentOssPath.value,'/').then(res => {
//         console.log(res);
//     })
// }
// #endregion
onMounted(() => {
    getListData()
    // getOssFileList()
})
</script>

<style lang="scss" scoped>
#config-page {
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