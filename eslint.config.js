// @ts-check

import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default tseslint.config(
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      parserOptions: {
        // 指定项目的 tsconfig.json 文件路径
        project: [join(__dirname, 'tsconfig.eslint.json')],
        tsconfigRootDir: __dirname,
      },
    },
  },
  eslintConfigPrettier,
  {
    ignores: ['eslint.config.js'], // 排除本文件自身被 TypeScript 检查
  }
)