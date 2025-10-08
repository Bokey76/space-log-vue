<template>
    <div :id="props.chartId" style="height: 100%;width: 100%;"></div>
</template>

<script setup>
import { reactive, watch, defineProps } from 'vue';
import * as echarts from "echarts/core";
import { PieChart, GraphChart, LineChart } from "echarts/charts";
import { TooltipComponent, GridComponent, LegendComponent, TitleComponent, DatasetComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
echarts.use([
  PieChart,
  GraphChart,
  LineChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  CanvasRenderer
]);
let props = defineProps({
    chartOptions: {
        type: Object,
        default: () => {}
    }, // 图表配置项
    ChangeResize: {
        type: Boolean,
        default: false
    }, // 图表重绘状态量
    chartId: {
        type: String,
        required: true
    }, // 图表id
    click: {
        type: Function,
        default: () => {}
    }, // 点击回调
})
watch(() => props.chartOptions, () => {
    echartsInit()
}, { deep: true })
watch(() => props.ChangeResize, () => {
    myChart.resize()
})
let myChart = reactive({}) // echarts实例载体
// 初始化echarts图表
let echartsInit = () => {
    myChart = echarts.init(document.getElementById(props.chartId))
    myChart.clear() // 清空实例，但似乎无效(无法消除警告)
    myChart.setOption(props.chartOptions)
    myChart.on('click', props.click)
}
</script>

<style lang="scss" scoped>
</style>