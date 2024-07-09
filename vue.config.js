const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 关闭控制台警告
  chainWebpack: (config) => {
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      })
      return definitions
    })
  },
  css: { // 添加css配置，全局引入Sass全局变量和Sass全局函数
    loaderOptions: {
      // sass-loader
      scss: {
        additionalData: `
        @import '@/assets/sass/variable.scss';
        @import '@/assets/sass/mixin.scss';
        `,
      }
    }
  },
  // 关闭全屏报错覆盖
  devServer: {
    client: {
      overlay: false,
    },
  },
})