import { defineStore } from 'pinia'
import type { ICharacter, ISkill, IConsciousness, ICharacterSnapshot } from '@/types/character'
import { v4 as uuidv4 } from 'uuid'
import { downloadJson } from '@/utils/fileDownloader'
import { calculateDamage } from '@/utils/damageCalculator'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from './authStore'
import { ElMessage } from 'element-plus'

const createDefaultCharacterState = (): ICharacter => ({
  id: uuidv4(),
  name: '新角色',
  codename: '代号',
  avatar: '',
  quality: 'A',
  class: '进攻型',
  frameType: '泛用',
  damageType: '物理',
  baseAttack: 1000,
  critRate: 0.5,
  critDamage: 1.5,
  skills: [],
  recommendedConsciousness: [],
  snapshots: [],
  createdAt: Date.now(), // 1. 新增：记录创建时间
  updatedAt: Date.now(), // 2. 新增：记录更新时间
  log: [`[${new Date().toLocaleString()}] 创建了新角色。`], // 1. 初始化日志
})

export const useCharacterStore = defineStore('character', {
  state: () => ({
    characters: [] as ICharacter[],
    activeCharacterId: null as string | null,
    isLoading: false,
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
     * 新增：统一的日志记录方法
     */
    _addLog(message: string) {
      if (this.activeCharacter) {
        if (!this.activeCharacter.log) {
          this.activeCharacter.log = []
        }
        const logEntry = `[${new Date().toLocaleString()}] ${message}`
        this.activeCharacter.log.unshift(logEntry) // unshift 将最新日志放在最前面

        // 可选：保持日志数组大小，防止无限增长
        if (this.activeCharacter.log.length > 50) {
          this.activeCharacter.log.pop()
        }
      }
    },

    /**
     * 从 Supabase 获取属于当前用户的角色列表
     */
    async fetchCharacters() {
      const authStore = useAuthStore()
      if (!authStore.user) return

      this.isLoading = true
      try {
        const { data, error } = await supabase
          .from('characters')
          .select('character_data')
          .eq('user_id', authStore.user.id)

        if (error) throw error

        // Supabase 返回的是 { character_data: ICharacter }[]
        // 我们需要解构并转换回 ICharacter[]
        this.characters = data.map((item: { character_data: ICharacter }) => item.character_data)

        // 如果列表不为空，但没有激活ID，则默认激活第一个
        if (this.characters.length > 0 && !this.activeCharacterId) {
          this.activeCharacterId = this.characters[0].id
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('获取角色数据失败:', error)
          ElMessage.error(`获取角色数据失败: ${error.message}`)
        } else {
          console.error('获取角色数据失败:', error)
          ElMessage.error('获取角色数据失败: 未知错误')
        }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 新增角色，并将其保存到 Supabase
     */
    async addCharacter() {
      const authStore = useAuthStore()
      if (!authStore.user) return

      this.isLoading = true
      // createDefaultCharacterState 已经包含了时间戳
      const newCharacter = createDefaultCharacterState()

      try {
        const { error } = await supabase.from('characters').insert({
          id: newCharacter.id,
          user_id: authStore.user.id,
          character_data: newCharacter,
        })
        if (error) throw error

        this.characters.push(newCharacter)
        this.activeCharacterId = newCharacter.id
      } catch (error) {
        if (error instanceof Error) {
          console.error('新增角色失败:', error)
          ElMessage.error(`新增角色失败: ${error.message}`)
        } else {
          console.error('新增角色失败:', error)
          ElMessage.error(`新增角色失败: 未知错误`)
        }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 删除角色，并从 Supabase 中删除 (采用乐观更新策略)
     */
    async deleteCharacter(characterId: string) {
      // 1. 找到要删除的角色和其索引
      const index = this.characters.findIndex((c) => c.id === characterId)
      if (index === -1) return
      const characterToDelete = { ...this.characters[index] }

      // 2. 立即从本地状态中删除该角色 (乐观更新UI)
      this.characters.splice(index, 1)

      // 3. 如果删除的是当前激活的角色，则切换到另一个角色
      if (this.activeCharacterId === characterId) {
        this.activeCharacterId =
          this.characters.length > 0
            ? this.characters[Math.max(0, index - 1)].id // 尝试激活上一个
            : null
      }

      try {
        // 4. 发送异步请求到数据库
        const { error } = await supabase.from('characters').delete().eq('id', characterId)
        if (error) {
          // 如果数据库操作失败，则抛出错误
          throw error
        }
        // 如果成功，则无需任何操作，UI已经更新
      } catch (error) {
        console.error('删除角色失败:', error)
        ElMessage.error('删除角色失败，已撤销操作')
        // 5. 如果请求失败，则将角色恢复到原来的位置
        this.characters.splice(index, 0, characterToDelete)
        // 恢复可能改变的 activeCharacterId
        this.activeCharacterId = characterId
      }
    },

    /**
     * 统一的更新方法，用于将当前激活角色的最新状态同步到 Supabase
     */
    async _updateActiveCharacterInDb() {
      if (!this.activeCharacter) return

      // 3. 核心修改：在更新前，设置最新的更新时间
      this.activeCharacter.updatedAt = Date.now()

      try {
        const { error } = await supabase
          .from('characters')
          .update({ character_data: this.activeCharacter })
          .eq('id', this.activeCharacter.id)
        if (error) throw error
      } catch (error) {
        console.error('更新角色失败:', error)
      }
    },

    setActiveCharacter(characterId: string) {
      this.isLoading = true
      this.activeCharacterId = characterId
      setTimeout(() => {
        this.isLoading = false
      }, 300)
    },

    // ... 其他 actions ...

    updateCharacterInfo<K extends keyof ICharacter>(field: K, value: ICharacter[K]) {
      if (this.activeCharacter) {
        this.activeCharacter[field] = value
        this._updateActiveCharacterInDb() // 调用更新
      }
    },

    resetCharacterState() {
      if (this.activeCharacter) {
        this._addLog('执行了重置表单操作。') // 2. 记录重置日志
        const index = this.characters.findIndex((c) => c.id === this.activeCharacterId)
        if (index !== -1) {
          const oldId = this.activeCharacterId
          const oldCreatedAt = this.activeCharacter.createdAt
          const oldLog = this.activeCharacter.log

          this.characters[index] = createDefaultCharacterState()
          this.characters[index].id = oldId!
          this.characters[index].createdAt = oldCreatedAt
          this.characters[index].log = oldLog // 保留历史日志
          this._updateActiveCharacterInDb()
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
        this._updateActiveCharacterInDb() // 调用更新
      }
    },

    removeSkill(index: number) {
      if (this.activeCharacter) {
        this.activeCharacter.skills.splice(index, 1)
        this._updateActiveCharacterInDb() // 调用更新
      }
    },

    updateSkillField<K extends keyof ISkill>(skillIndex: number, field: K, value: ISkill[K]) {
      if (this.activeCharacter && this.activeCharacter.skills[skillIndex]) {
        this.activeCharacter.skills[skillIndex][field] = value
        this._updateActiveCharacterInDb() // 调用更新
      }
    },

    updateRecommendedConsciousness(newSelection: IConsciousness[]) {
      if (this.activeCharacter) {
        this.activeCharacter.recommendedConsciousness = newSelection
        this._updateActiveCharacterInDb() // 调用更新
      }
    },

    // 快照相关功能也需要调用更新
    takeSnapshot() {
      if (this.activeCharacter) {
        const snapshotName = `快照 @ ${new Date().toLocaleString()}`
        this._addLog(`拍摄了新的配置快照：${snapshotName}`) // 3. 记录快照日志
        const damageResult = calculateDamage(this.activeCharacter)
        const newSnapshot: ICharacterSnapshot = {
          id: uuidv4(),
          name: snapshotName,
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
        this._updateActiveCharacterInDb()
      }
    },

    updateSnapshotName(snapshotId: string, newName: string) {
      if (this.activeCharacter) {
        const snapshot = this.activeCharacter.snapshots.find((s) => s.id === snapshotId)
        if (snapshot) {
          snapshot.name = newName
          this._updateActiveCharacterInDb() // 调用更新
        }
      }
    },

    deleteSnapshot(snapshotId: string) {
      if (this.activeCharacter) {
        const index = this.activeCharacter.snapshots.findIndex((s) => s.id === snapshotId)
        if (index !== -1) {
          this.activeCharacter.snapshots.splice(index, 1)
          this._updateActiveCharacterInDb() // 调用更新
        }
      }
    },

    // 导入导出功能暂不修改，它们仍作为本地文件操作
    exportActiveCharacter() {
      if (!this.activeCharacter) return
      const filename = `${this.activeCharacter.name || '未命名角色'}.json`
      downloadJson(this.activeCharacter, filename)
    },
    exportAllCharacters() {
      if (this.characters.length === 0) return
      downloadJson(this.characters, 'all_characters.json')
    },
    importCharacter(characterData: ICharacter) {
      this.addCharacter().then(() => {
        const newCharId = this.activeCharacterId
        const index = this.characters.findIndex((c) => c.id === newCharId)
        if (index !== -1) {
          const imported = {
            ...characterData,
            id: newCharId!,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            log: [`[${new Date().toLocaleString()}] 从JSON文件导入角色'${characterData.name}'。`], // 4. 记录导入日志
          }
          this.characters[index] = imported
          this._updateActiveCharacterInDb()
        }
      })
    },
  },
  // 移除 persist: true
})
