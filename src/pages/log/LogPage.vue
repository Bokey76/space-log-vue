<template>
  <div id="logPage">
    <!-- 导航页 -->
    <a-card title="博客管理" style="margin: 1rem 2rem;">
      <a-card-grid class="cardItem" v-for="item in naviData" :key="item.name" @click="router.push(item.path)">{{
        item.name }}</a-card-grid>
    </a-card>
    <!-- 数据看台 -->
    <div id="dataBar">
      <div id="dataHeader">
        <h3>博客数据</h3>
        <a-range-picker v-model:value="dataTime" format="YYYY-MM-DD" :placeholder="['开始时间', '结束时间']"
          style="width: 40rem;" @change="timeChange" />
      </div>
      <!-- 数字看台：1.浏览数 2.点赞数 3.文章数量 4.类目数 -->
      <a-row style="width: 100%;padding: 0 1rem;margin: 0;" :gutter="16">
        <a-col :span="6">
          <a-card>
            <a-statistic title="浏览数" :value="numBarData.popularity"></a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="点赞数" :value="numBarData.like"></a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="文章数" :value="numBarData.articleCount"></a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic title="类目数" :value="numBarData.articleTypeCount"></a-statistic>
          </a-card>
        </a-col>
      </a-row>
      <!-- 图表看台：1. 2.文章人气/文章点赞折线图 3.文章编辑时间日历图  4.文章类目/文章数量饼状图  -->
      <a-row style="width: 100%;margin: 2rem 0;" :gutter="32">
        <a-col :span="12" style="height: 50rem;margin: 2rem 0;">
          <ChartTemplate :chartOptions="chartOptions.popularityAndLikeConfig" chartId="popularityAndLikeChart"
            :ChangeResize="windowChange" class="chart">
          </ChartTemplate>
          <a-button id="nextArticleBtn" v-show="nextArticleBtnShow" @click="nextArticle">换一批</a-button>
        </a-col>
        <a-col :span="12" style="height: 50rem;margin: 2rem 0;">
          <ChartTemplate :chartOptions="chartOptions.articleTypeAndNumData" chartId="articleTypeChart"
            :ChangeResize="windowChange" class="chart">
          </ChartTemplate>
        </a-col>
        <a-col :span="24" style="height: 80rem;margin: 2rem 0;">
          <ChartTemplate :chartOptions="chartOptions.articleRelationsData" chartId="articleRelations"
            :ChangeResize="windowChange" :click="clickRelationArticle" class="chart">
          </ChartTemplate>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import ChartTemplate from '@/components/common/ChartTemplate.vue'
import DoubleLineChart from '@/assets/chartConfig/DoubleLineChart.json'
import RelationChart from '@/assets/chartConfig/RelationChart.json'
import PieChart from '@/assets/chartConfig/PieChart.json'
import { useStore } from 'vuex'
const store = useStore()
import { useRouter } from "vue-router";
import utils from "@/utils";
const router = useRouter()
import { reactive, ref, onMounted, getCurrentInstance, watch } from 'vue';
const { proxy } = getCurrentInstance()
const naviData = ref([
  {
    name: '博客列表',
    path: '/log/list'
  },
  {
    name: '博客上传',
    path: '/log/edit'
  },
  {
    name: '博客类目',
    path: '/log/type'
  },
  {
    name: '评论管理',
    path: '/log/comment'
  },
]) // 导航数据
let windowChange = ref(false) // 监听窗口变化状态量
watch(() => store.state.WindowSize, () => {
  windowChange.value = !windowChange.value
}, { deep: true })
let dataTime = ref([]) // 时间数据
const timeChange = (data) => { // 更改时间函数
  if (!data) { // 清空操作
    dataTime.value = []
  }
  getNumAndChartData() // 重新获取图表数据
}
let numBarData = reactive({}) // 数据看台数据
let chartOptions = reactive({
  popularityAndLikeConfig: {}, // 人气/点赞 折线图数据
  articleTypeAndNumData: {}, // 文章类目/文章数量饼状图
  articleRelationsData: {}, // 文章关系图数据
}) // 图表数据
const getNumBarData = () => { // 获取数据看台数据
  proxy.$api.getArticleNumData({ time: dataTime.value.map((item) => { return item['$d'] }) }).then(res => {
    utils.currentDataChange(res, numBarData)
  })
}
let articleCurrentPage = ref(1) // 文章 人气/点赞 折线图数据 的当前页
const articlePageSize = 10 // 文章 人气/点赞 折线图数据 的页大小
let articleTotal = ref(0) // 文章 人气/点赞 折线图数据 的总页数
let nextArticleBtnShow = ref(false) // 文章 人气/点赞 折线图数据 的下一页按钮是否显示
const nextArticle = () => { // 换一批文章事件
  articleCurrentPage.value++
  getPopularityAndLikeData()
}
const getPopularityAndLikeData = () => { // 获取文章 人气/点赞 折线图数据
  if (articleCurrentPage.value * articlePageSize > articleTotal.value + articlePageSize) {
    articleCurrentPage.value = 1
  }
  proxy.$api.getArticlePopularityAndLikeData({ time: dataTime.value.map((item) => { return item['$d'] }), currentPage: articleCurrentPage.value, pageSize: articlePageSize }).then(res => {
    articleTotal.value = res.count
    nextArticleBtnShow.value = articleTotal.value > articlePageSize
    if (Object.keys(chartOptions.popularityAndLikeConfig).length <= 0) { // 若已经初始化，则不必重新赋值
      chartOptions.popularityAndLikeConfig = DoubleLineChart // 导入默认双线图配置
      // 个性化默认配置
      chartOptions.popularityAndLikeConfig.title.text = '文章人气/点赞折线图' // title
      chartOptions.popularityAndLikeConfig.xAxis.name = '文章'
      chartOptions.popularityAndLikeConfig.yAxis.name = '数量'
      chartOptions.popularityAndLikeConfig.series[0].encode.x = 'topic'
      chartOptions.popularityAndLikeConfig.series[0].encode.y = 'popularity'
      chartOptions.popularityAndLikeConfig.series[0].name = '人气'
      chartOptions.popularityAndLikeConfig.series[1].name = '点赞'
      chartOptions.popularityAndLikeConfig.series[1].encode.x = 'topic'
      chartOptions.popularityAndLikeConfig.series[1].encode.y = 'like'
      chartOptions.popularityAndLikeConfig.tooltip.formatter = (params) => {
        let result = `<h4 class="tipTitle">${params[0]['name']}</h4>`
        result += `<div class="tipCol"><div class="tipPoint"></div>人气：${params[0]['value'][2]}</div>`
        result += `<div class="tipCol"><div class="tipPoint"></div>点赞：${params[0]['value'][3]}</div>`
        return `<div class="tooltip">${result}</div>`
      }
    }
    chartOptions.popularityAndLikeConfig.dataset[0].source = res.data
  })
}
const getArticleTypeData = () => { // 获取文章类目/文章数量饼状图数据
  proxy.$api.getArticleTypeAndNumData({ time: dataTime.value.map((item) => { return item['$d'] }) }).then(res => {
    chartOptions.articleTypeAndNumData = PieChart // 导入默认双线图配置
    chartOptions.articleTypeAndNumData.title.text = '文章类目/数量饼状图'
    chartOptions.articleTypeAndNumData.series[0].data = res
    chartOptions.articleTypeAndNumData.series[0].name = '类目数量'
    chartOptions.articleTypeAndNumData.tooltip.formatter = (params) => {
      let result = `<h4 class="tipTitle">${params.data.name}</h4>`
      result += `<div class="tipCol"><div class="tipPoint"></div>文章数目：${params.data.value}</div>`
      result += `<div class="tipCol"><div class="tipPoint"></div>类目人气：${params.data.popularity}</div>`
      return result
    }
  })
}
const getArticleRelationsData = () => { // 获取文章关系图数据
  proxy.$api.getArticleRelationsData({ time: dataTime.value.map((item) => { return item['$d'] }) }).then(res => {
    chartOptions.articleRelationsData = RelationChart // 导入默认关系图配置
    chartOptions.articleRelationsData.title.text = '文章体系'
    for (let node of res.nodes) {
      node.draggable = true // 设置可拖动
      node.symbolSize = node.type == 'articleType' ? 60 : 40 // 设置元素大小，文章类别为60，文章为30
    }
    chartOptions.articleRelationsData.series[0].data = res.nodes.map(node => ({
      ...node,
      name: node.name.length > 10 ? node.name.slice(0, 10) + '...' : node.name,
      originName: node.name
    })) // name超过10个字符就截取，并保留原名给tooltip
    chartOptions.articleRelationsData.series[0].links = res.links
    chartOptions.articleRelationsData.series[0].categories = res.categories
    chartOptions.articleRelationsData.tooltip.formatter = (params) => {
      let result = `<h4 class="tipTitle">${params.data.originName}</h4>`
      for (let index in params.value) {
        if (index != '主题') result += `<div class="tipCol"><span class="tipPoint"></span>${index}：${params.value[index]}</div>`
      }
      return `<div class="tooltip">${result}</div>`
    }
  })
}
const clickRelationArticle = (params) => { // 关系图点击事件
  if (params.data.type == 'article') {
    router.push(`/log/edit?id=${params.value.id}`)
  }
}
const getNumAndChartData = () => { // 获取数据看台图表数据
  getPopularityAndLikeData()
  getArticleTypeData()
  getArticleRelationsData()
  getNumBarData()
}
onMounted(() => {
  getNumAndChartData()
})
</script>

<style lang="scss" scoped>
#logPage {
  ::v-deep .ant-card .ant-card-head-title {
    text-align: center;
  }

  .cardItem {
    width: 50%;
    text-align: center;
    cursor: pointer;
  }

  #dataBar {
    #dataHeader {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem;
    }

  }

  #nextArticleBtn {
    position: absolute;
    top: 3rem;
    right: 5rem;
  }

  .chart {
    background-color: $main-car-color;
    padding: 4rem 2rem;
    border-radius: 10px;
  }

}

::v-deep .tooltip {
  max-width: 50rem;
  white-space: normal;
  /* 允许文本换行 */
}

::v-deep .tipCol {
  margin: 1rem;
  display: flex;
  flex-direction: row;
  align-items: center;
}

::v-deep .tipPoint {
  height: 1rem;
  width: 1rem;
  background-color: $main-text-color;
  margin-right: 1rem;
  border-radius: 50%;
}
</style>