// src/types/character.ts

/**
 * 定义技能类型
 * 使用联合类型 (Union Type) 来约束可接受的字符串值，提供比普通 `string` 更好的类型安全。
 * - red: 红球
 * - yellow: 黄球
 * - blue: 蓝球
 * - passive: 被动技能
 * - ultimate: 终解/大招
 * - qte: QTE技能
 */
export type SkillType = 'normal' | 'red' | 'yellow' | 'blue' | 'passive' | 'ultimate' | 'qte'

/**
 * 单个技能的数据结构接口
 */
export interface ISkill {
  /** 技能图标的URL或本地路径 */
  icon: string

  /** 技能名称 */
  name: string

  /** 技能的详细描述，支持换行符 */
  description: string

  /** 技能的类型 */
  type: SkillType

  /** 技能伤害倍率 */
  multiplier: number

  /** 伤害标签，用于区分伤害类型以应用不同增益 */
  damageTag: '普攻' | '核心被动' | '红球' | '黄球' | '蓝球' | '终解' | 'QTE'
}

/**
 * 推荐意识的数据结构接口
 * (我们先定义结构，具体意识列表后续会作为常量数据引入)
 */
export interface IConsciousness {
  /** 意识的唯一ID，用于在列表中进行精确查找和识别 */
  id: number

  /** 意识的名称，如：芭斯隆、列文虎克 */
  name: string

  /** 意识图标的URL或本地路径 */
  icon: string

  /** 意识效果的详细描述 */
  description: string

  /** 意识可出现的位置，如：[1, 2, 3, 4, 5, 6] */
  positions: number[]
}

/**
 * 新增：角色配置快照的数据结构接口
 */
export interface ICharacterSnapshot {
  /** 快照的唯一ID */
  id: string

  /** 快照的自定义名称 */
  name: string

  /** 创建快照时的时间戳 */
  createdAt: number

  /** 关联的角色ID */
  sourceCharacterId: string

  /** 用于对比的核心数值属性 */
  coreStats: {
    baseAttack: number
    critRate: number
    critDamage: number
  }

  /** 伤害计算结果 */
  damageResult: {
    totalDamage: number
    skills: {
      name: string
      damage: number
    }[]
  }
}

/**
 * 最终的角色核心数据结构接口
 * 这是我们整个应用中流动的数据的“总蓝图”
 */
export interface ICharacter {
  /** 角色的唯一标识符，可以使用英文名或特定ID，便于程序处理 */
  id: string

  /** 角色中文名称，如：露西亚·黎明 */
  name: string

  /** 角色型号/代号，如：B-029 */
  codename: string

  /** 角色头像的URL或本地路径 */
  avatar: string

  /** 初始品质，使用联合类型约束，防止输入错误 */
  quality: 'S' | 'A' | 'B'

  /** 职业/定位 */
  class: '进攻型' | '装甲型' | '辅助型' | '增幅型' | '先锋型' | '湮灭型' | '观测者'

  /**
   * 机体框架类型：泛用机体/独域机体/联动机体
   * 这个分类决定了角色的底层操作机制
   */
  frameType: '泛用' | '独域' | '联动'

  /** 傷害屬性類型 */
  damageType: '火' | '雷' | '暗' | '冰' | '物理' | '混合' | '空'

  /** 新增：基础攻击力 */
  baseAttack: number
  /** 新增：暴击率 (0-100的小数，70%) */
  critRate: number
  /** 新增：暴击伤害 */
  critDamage: number

  /** * 所有技能的集合
   * 是一个由 ISkill 对象组成的数组
   */
  skills: ISkill[]

  /** * 推荐的意识搭配组合
   * 是一个由 IConsciousness 对象组成的数组
   */
  recommendedConsciousness: IConsciousness[]

  /** 新增：该角色的所有快照集合 */
  snapshots: ICharacterSnapshot[]

  /** 新增：创建时间戳 */
  createdAt?: number

  /** 新增：最后更新时间戳 */
  updatedAt?: number

  /** 新增：操作日志 */
  log?: string[]
}
