# Bokey Space Admin

项目为日常分享、文章展示类项目，基本功能模块：
- 博客模块
- 评论模块（ps: 代码中暂时注释，打开可用，因为我的站点备案问题，暂时关闭评论功能）
- 留言模块（实际和评论是同一模块）
- 友链模块
- 全局配置模块

项目使用技术说明：

| 技术                                                   | 说明                                        |
| ------------------------------------------------------ | ------------------------------------------- |
| [Vue 3](https://vuejs.org/)                            | 项目主要框架 |
| [Ant Design Vue](https://www.antdv.com/)               | 企业级 UI 组件库 |
| [json-editor-vue3](https://github.com/cloydlau/json-editor-vue3) | 基于 Vue 3 的可视化 JSON 编辑器组件         |
| [md-editor-v3](https://www.npmjs.com/package/json-editor-vue3?ref=pkgstats.com)  | Markdown 编辑与渲染组件，支持实时预览与代码高亮 |
| [ECharts](https://echarts.apache.org/)                 | 可视化图表库，用于数据分析与展示      |


### ⚙️ 环境要求

> Node.js：推荐 v18+（最低支持 v16）
> 可以使用 npm run 启动项目（注意请先根据.env.example 完善配置文件）

### 项目启动 ✅

项目可以通过`npm run`方式启动

#### `npm run`启动

根据 npm script 来`run`项目：

```shell
npm run serve:dev # 开发环境，本地启动
npm run serve:beta # 测试环境，本地启动
npm run serve:pro # 生产环境，本地启动
npm run build:beta # 打包测试环境
npm run build:pro # 打包生产环境
```

### ⚖️ 开源协议

本项目基于 MIT License 开源。
你可以自由地使用、修改和再发布此项目，但请在明显位置保留以下作者标注：
Powered by Peacock · https://github.com/Bokey76
若在网页底部、关于页面、README 或其他可见位置保留此标识，将是对作者的尊重与支持 ❤️，感谢。

### 🌟 支持与反馈

如果这个项目对你有帮助，期待你的 Star ⭐支持！感谢！
你的支持是我持续改进与开源更多项目的动力 🙌。
如果项目使用时有bug🐞，欢迎提issue，我看到后会尽快修改修复（ps: 尽快哈，尽快😁）
如果有什么问题，可以通过我的网站找到我（虽然现在留言功能关闭了，日后可能会再开启，但站点里有联系方式可以找到我）

### 🧑‍💻 关于作者

<div style="display:flex;flex-direction: column;align-items:center;padding:20px 0;">
<img src="./src/assets/images/bokey.png" alt="作者头像" width="200" style="border-radius: 50%;border: 10px solid #161616;" />
<h2 style="margin:10px 0 0">Bokey</h2>
<p style="font-weight:700;">在世界留下属于自己的痕迹🐾</p>
</div>

🌐 我的站点：[bokey space](https://bokey.space)

📧 联系方式：参考[bokey space](https://bokey.space)中提供的联系方式

💬 GitHub：https://github.com/Bokey76
