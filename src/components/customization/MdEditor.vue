<template>
  <div id="editorBox">
    <MdEditor style="height: 100%;" v-model="mdContent" v-bind="props.options" @onSave="save(mdContent)"
      @onUploadImg="props.uploadImage" @onChange="props.editChange()">
      <!-- 自定义工具栏插槽 -->
      <template #defToolbars>
        <div class="md-editor-toolbar-item" @click="router.back()" title="返回">
          <RedoOutlined class="md-editor-icon" />
        </div>
        <Emoji title="表情" :emojis="emojis" :selectAfterInsert="false"></Emoji>
      </template>
      <!-- 自定义页脚插槽 -->
      <template #defFooters>
        <slot name="defFooters"></slot>
      </template>
    </MdEditor>
  </div>
</template>

<script setup>
import { Emoji } from "@vavt/v3-extension";
import { RedoOutlined } from '@ant-design/icons-vue';
import { ref, defineProps, watch, defineExpose } from "vue";
import { MdEditor } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import "@vavt/v3-extension/lib/asset/Emoji.css";
import { useRouter  } from "vue-router";
const router = useRouter()
let mdContent = ref("");
defineExpose({ mdContent }) // 暴露内容给父组件
const emojis = ["😀", "😵‍💫", "😃", "😁", "🥳", "😆", "🤣", "😭", "😱", "😅", "🙃", "🙂", "🥲", "😬", "😡", "😔", "🥺", "😍", "🥰", "😘", "😗", "😘", "😇", "👼", "💋", "💗", "❤️", "💘", "💕", "💖", "💞", "❣️", "❤️‍🔥", "💔", "👋", "👌", "✌️", "👍", "🙌", "🙏",
  "💪", "👊", "🔥", "👽", "🌎", "🌍", "🌐", "💻", "🖥️", "📱", "📷", "☎️", "📞", "⌨️", "🎧", "🖱️", "🖨️", "🎙️", "🎤", "🔗", "💃", "🕺", "🧑‍🚀", "🧑‍✈️", "🎉", "🎊", "🍾", "🥂", "🍻", "🎓", "🎱", "🔮", "✨", "💫", "🌟", "⭐", "✈️", "🛩️", "🛸", "🛰️", "🚇", "🚍", "🚌", "🚗", "🚗",
  "🚲", "🛴", "🛹", "🛼", "🏀", "⚽", "🏈", "⚾", "🏓", "🏸", "🥎", "💣", "💥", "🔥", "💧", "⚡", "💢", "💤", "♨️", "🚿", "㊗️", "🈚", "🚾", "🈲", "㊙️", "🉑", "⚠️", "🛁", "🔧", "⚙️", "🔒", "🔓", "🔑", "🗝️", "💯", "📋", "📄", "📝", "📈", "🗠", "📉", "📊", "💲", "💰", "💸", "💳", "🛒",
  "🏠", "🏢", "🏦", "🏨", "🏬", "🏥", "📌", "📍", "🎯", "🎲", "🀄", "🧩", "🖼️", "🔍", "👁️‍🗨️", "❗", "✔️", "❌", "🔘", "⛅", "☀️", "☁️", "🌧️", "🌦️", "🌩️", "🌪️", "☔", "❄️"]; // 表情包
const props = defineProps({
  content: {
    type: String,
    default: "",
  }, // 父元素给予的md文档内容
  options: {
    type: Object,
  }, // md编辑器的配置项
  save: {
    type: Function,
    default: () => { }, // 保存按钮的回调函数
  }, // 保存按钮的回调函数
  uploadImage: {
    type: Function,
    default: () => { },
  }, // 图片上传的回调函数
  editChange: {
    type: Function,
    default: () => { },
  }, // 内容改变的回调函数
});
// 监听内容变化
watch(
  () => props.content,
  (newVal) => {
    mdContent.value = newVal;
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
#editorBox {
  width: 100%;

}
</style>