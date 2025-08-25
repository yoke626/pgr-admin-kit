import { defineStore } from 'pinia'
import type { ICharacter, ISkill, IConsciousness, ICharacterSnapshot } from '@/types/character'
import { v4 as uuidv4 } from 'uuid'
import { downloadJson } from '@/utils/fileDownloader'
import { calculateDamage } from '@/utils/damageCalculator'

// 初始状态生成函数
const createDefaultCharacterState = (): ICharacter => ({
  id: uuidv4(),
  name: '新角色',
  codename: '代号',
  avatar: '',
  quality: 'A',
  class: '进攻型',
  frameType: '泛用',
  damageType: '物理',
  //新增属性默认值
  baseAttack: 1000,
  critRate: 0.5,
  critDamage: 1.5,
  skills: [],
  recommendedConsciousness: [],
  snapshots: [],
})

export const useCharacterStore = defineStore('character', {
  state: () => ({
    characters: [] as ICharacter[],
    activeCharacterId: null as string | null,
    isLoading: false, //新增一个加载状态
    activeEditorTab: '基础信息' as string,
  }),

  getters: {
    activeCharacter(state): ICharacter | null {
      if (!state.activeCharacterId) return null
      return state.characters.find((c) => c.id === state.activeCharacterId) || null
    },
    characterList(state): ICharacter[] {
      return state.characters
    },
  },

  actions: {
    /**
     * FIX: 新增一个初始化和数据校验的 action
     */
    initializeStore() {
      // 1. 检查持久化后的数据是否是旧格式 (characters 不是数组)
      if (!Array.isArray(this.characters)) {
        console.warn('检测到旧版本状态，将重置角色仓库。')
        this.characters = []
        this.activeCharacterId = null
      }

      // 2. 遍历所有从 localStorage 加载的角色，确保它们符合最新数据结构
      this.characters.forEach((character) => {
        // 如果某个旧角色对象上没有 snapshots 属性，则为其添加一个空数组
        if (!Array.isArray(character.snapshots)) {
          console.warn(`为角色 "${character.name}" 迁移数据：添加 snapshots 属性。`)
          character.snapshots = []
        }
      })
      // --- FIX END ---

      // 3. 如果角色列表不为空，但没有激活的ID，则默认激活第一个
      if (this.characters.length > 0 && !this.activeCharacterId) {
        this.activeCharacterId = this.characters[0].id
      }

      // 4. 如果角色列表为空，则创建一个新角色
      if (this.characters.length === 0) {
        this.addCharacter()
      }
    },

    addCharacter() {
      const newCharacter = createDefaultCharacterState()
      this.characters.push(newCharacter)
      this.activeCharacterId = newCharacter.id
    },

    importCharacter(characterData: ICharacter) {
      this.isLoading = true
      //避免导入重复id
      if (this.characters.some((c) => c.id === characterData.id)) {
        characterData.id = uuidv4()
      }
      this.characters.push(characterData)
      this.activeCharacterId = characterData.id
      this.isLoading = false
    },

    setActiveCharacter(characterId: string) {
      this.isLoading = true
      this.activeCharacterId = characterId
      setTimeout(() => {
        this.isLoading = false
      }, 300)
    },

    deleteCharacter(characterId: string) {
      this.isLoading = true
      const index = this.characters.findIndex((c) => c.id === characterId)
      if (index !== -1) {
        this.characters.splice(index, 1)
        if (this.activeCharacterId === characterId) {
          this.activeCharacterId = this.characters.length > 0 ? this.characters[0].id : null
        }
      }
      this.isLoading = false
    },

    // 新增：导出当前角色配置
    exportActiveCharacter() {
      if (!this.activeCharacter) return
      const filename = `${this.activeCharacter.name || '未命名角色'}.json`
      downloadJson(this.activeCharacter, filename)
    },

    // 新增：导出所有角色配置
    exportAllCharacters() {
      if (this.characters.length === 0) return
      downloadJson(this.characters, 'all_characters.json')
    },
    updateCharacterInfo<K extends keyof ICharacter>(field: K, value: ICharacter[K]) {
      if (this.activeCharacter) {
        this.activeCharacter[field] = value
      }
    },

    resetCharacterState() {
      if (this.activeCharacter) {
        const index = this.characters.findIndex((c) => c.id === this.activeCharacterId)
        if (index !== -1) {
          const oldId = this.activeCharacterId
          this.characters[index] = createDefaultCharacterState()
          this.characters[index].id = oldId!
        }
      }
    },

    addSkill() {
      if (this.activeCharacter) {
        this.activeCharacter.skills.push({
          icon: '',
          name: '新技能',
          description: '',
          type: 'red',
          multiplier: 1,
          damageTag: '普攻',
        })
      }
    },

    removeSkill(index: number) {
      if (this.activeCharacter) {
        this.activeCharacter.skills.splice(index, 1)
      }
    },

    updateSkillField<K extends keyof ISkill>(skillIndex: number, field: K, value: ISkill[K]) {
      if (this.activeCharacter && this.activeCharacter.skills[skillIndex]) {
        this.activeCharacter.skills[skillIndex][field] = value
      }
    },

    updateRecommendedConsciousness(newSelection: IConsciousness[]) {
      if (this.activeCharacter) {
        this.activeCharacter.recommendedConsciousness = newSelection
      }
    },

    /**
     * 新增：为当前角色拍摄一张配置快照
     */
    takeSnapshot() {
      if (this.activeCharacter) {
        const damageResult = calculateDamage(this.activeCharacter)
        const newSnapshot: ICharacterSnapshot = {
          id: uuidv4(),
          name: `快照 @ ${new Date().toLocaleString()}`,
          createdAt: Date.now(),
          sourceCharacterId: this.activeCharacter.id,
          coreStats: {
            baseAttack: this.activeCharacter.baseAttack,
            critRate: this.activeCharacter.critRate,
            critDamage: this.activeCharacter.critDamage,
          },
          damageResult,
        }
        this.activeCharacter.snapshots.push(newSnapshot)
      }
    },

    /**
     * 新增：更新指定快照的名称
     * @param snapshotId - 快照的ID
     * @param newName - 新的名称
     */
    updateSnapshotName(snapshotId: string, newName: string) {
      if (this.activeCharacter) {
        const snapshot = this.activeCharacter.snapshots.find((s) => s.id === snapshotId)
        if (snapshot) {
          snapshot.name = newName
        }
      }
    },

    /**
     * 新增：删除指定快照
     * @param snapshotId - 快照的ID
     */
    deleteSnapshot(snapshotId: string) {
      if (this.activeCharacter) {
        const index = this.activeCharacter.snapshots.findIndex((s) => s.id === snapshotId)
        if (index !== -1) {
          this.activeCharacter.snapshots.splice(index, 1)
        }
      }
    },
  },
  persist: true,
})
