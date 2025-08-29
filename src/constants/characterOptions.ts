/**
 * 定义下拉选择项的通用接口
 */
interface SelectOption {
  value: string
  label: string
}

/**
 * 角色品质选项
 */
export const QUALITY_OPTIONS: SelectOption[] = [
  { value: 'S', label: 'S级' },
  { value: 'A', label: 'A级' },
  { value: 'B', label: 'B级' },
]

/**
 * 角色职业/定位选项
 */
export const CLASS_OPTIONS: SelectOption[] = [
  { value: '进攻型', label: '进攻型' },
  { value: '装甲型', label: '装甲型' },
  { value: '辅助型', label: '辅助型' },
  { value: '增幅型', label: '增幅型' },
  { value: '先锋型', label: '先锋型' },
  { value: '湮灭型', label: '湮灭型' },
  { value: '观测者', label: '观测者' },
]

/**
 * 机体框架类型选项
 */
export const FRAME_TYPE_OPTIONS: SelectOption[] = [
  { value: '泛用', label: '泛用' },
  { value: '独域', label: '独域' },
  { value: '联动', label: '联动' },
]

/**
 * 伤害属性类型选项
 */
export const DAMAGE_TYPE_OPTIONS: SelectOption[] = [
  { value: '火', label: '火' },
  { value: '雷', label: '雷' },
  { value: '暗', label: '暗' },
  { value: '冰', label: '冰' },
  { value: '物理', label: '物理' },
  { value: '混合', label: '混合' },
  { value: '空', label: '空' },
]

/**
 * 新增：技能伤害标签选项
 * 这些值应该与 types/character.ts 中 ISkill['damageTag'] 的联合类型保持一致
 */
export const DAMAGE_TAG_OPTIONS: SelectOption[] = [
  { value: '普攻', label: '普攻' },
  { value: '核心被动', label: '核心被动' },
  { value: '红球', label: '红球' },
  { value: '黄球', label: '黄球' },
  { value: '蓝球', label: '蓝球' },
  { value: '终解', label: '终解' },
  { value: 'QTE', label: 'QTE' },
]
