import { defineStore } from 'pinia'
import type { ICharacter } from '@/types/character'

// 为了方便重置状态，我们可以在 store 外部定义一个初始状态生成函数
const createDefaultCharacterState = (): ICharacter => ({
  id: `character_${new Date().getTime()}`, // 临时生成一个唯一ID
  name: '露西亚·黎明',
  codename: '破晓',
  avatar: '',
  quality: 'S',
  class: '进攻型',
  frameType: '泛用',
  damageType: '物理',
  skills: [],
  recommendedConsciousness: [],
})

export const useCharacterStore = defineStore('character', {
  /**
   * State: 定义状态的地方。
   * 这里我们返回一个函数，函数返回一个对象，确保每个实例的状态都是独立的。
   * 我们使用 JSON.parse(JSON.stringify(...)) 来创建一个深拷贝，防止对象引用问题。
   */
  state: () => ({
    character: createDefaultCharacterState(),
  }),

  /**
   * Getters: 类似于组件的 computed 属性。
   * 用于从 state 派生出一些新的状态，例如对数据进行筛选、计算等。
   */
  getters: {
    // 示例：一个简单的 getter，返回角色的名字和型号
    fullName: (state) => `${state.character.name} - ${state.character.codename}`,
  },

  /**
   * Actions: 修改 state 的方法。
   * 这里的函数可以是异步的，你可以在这里编写复杂的业务逻辑。
   * 严禁在 action 之外直接修改 state。
   */
  actions: {
    /**
     * 更新角色基础信息
     * @param field - ICharacter 中的一个键
     * @param value - 对应键的新值
     */
    updateCharacterInfo<K extends keyof ICharacter>(field: K, value: ICharacter[K]) {
      this.character[field] = value
    },

    /**
     * 重置整个角色的状态为初始默认值
     */
    resetCharacterState() {
      this.character = createDefaultCharacterState()
    },

    // 后续我们还会在这里添加更多 action，比如 addSkill, removeSkill 等
  },
})
