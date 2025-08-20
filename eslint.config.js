// @ts-check

import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  // 基础规则
  ...tseslint.configs.recommended,

  // Vue 3 的推荐规则 (使用 recommended 替代 essential，规则更全面)
  ...pluginVue.configs['flat/recommended'],

  // Prettier 的配置，必须放在最后
  eslintConfigPrettier,

  // 针对 Vue + TypeScript 的特定解析配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        // 核心修复：指定 vue-eslint-parser 使用的脚本解析器
        parser: tseslint.parser,
        // ▼▼▼ 核心修复：将 project 指向包含应用源码的 tsconfig 文件 ▼▼▼
        project: 'tsconfig.app.json',
        // ▲▲▲ 核心修复 ▲▲▲
        tsconfigRootDir: import.meta.dirname,
        // 让 TypeScript 解析器也能识别 .vue 文件
        extraFileExtensions: ['.vue'],
      },
    },
  },

  // (可选) 自定义规则
  {
    rules: {
      // 'vue/no-unused-vars': 'error'
    },
  }
)