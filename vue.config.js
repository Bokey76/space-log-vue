const { defineConfig } = require("@vue/cli-service");
const Components = require("unplugin-vue-components/webpack");
const AutoImport = require("unplugin-auto-import/webpack");
const { AntDesignVueResolver } = require("unplugin-vue-components/resolvers");

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      // 自动按需引入 Ant Design Vue 组件
      Components({
        resolvers: [AntDesignVueResolver({ importStyle: false })],
      }),
      // 自动按需引入 message / notification 等 API
      AutoImport({
        resolvers: [AntDesignVueResolver()],
      }),
    ],
  },
  // 关闭控制台警告
  chainWebpack: (config) => {
    config.plugin("define").tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: "true",
        __VUE_PROD_DEVTOOLS__: "false",
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
      });
      return definitions;
    });
  },
  css: {
    // 添加css配置，全局引入Sass全局变量和Sass全局函数
    loaderOptions: {
      // sass-loader
      scss: {
        additionalData: `
        @import '@/assets/sass/variable.scss';
        @import '@/assets/sass/mixin.scss';
        `,
      },
    },
  },
  // 关闭全屏报错覆盖
  devServer: {
    port: process.env.VUE_APP_PROD_PORT || 8080,
    client: {
      overlay: false,
    },
  },
});
