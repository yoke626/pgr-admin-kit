// src/utils/damageCalculator.ts

import type { ICharacter } from '@/types/character'

/**
 * 定义伤害计算结果的返回类型
 */
interface DamageResult {
  totalDamage: number
  skills: {
    name: string
    damage: number
  }[]
}

/**
 * 一个独立的、可重用的伤害计算函数
 * @param character - 需要计算伤害的角色对象
 * @returns - 包含总伤害和各技能伤害的对象
 */
export function calculateDamage(character: ICharacter | null): DamageResult {
  if (!character || character.skills.length === 0) {
    return { totalDamage: 0, skills: [] }
  }

  const { baseAttack, critRate, critDamage, skills } = character
  let totalDamage = 0

  const skillsDamage = skills.map((skill) => {
    // 期望伤害 = 基础攻击力 * 技能倍率 * (1 + 暴击率 * 暴击伤害)
    const expectedDamage = baseAttack * skill.multiplier * (1 + critRate * critDamage)
    const roundedDamage = Math.round(expectedDamage)
    totalDamage += roundedDamage

    return {
      name: skill.name || '未命名技能',
      damage: roundedDamage,
    }
  })

  return {
    totalDamage: Math.round(totalDamage),
    skills: skillsDamage,
  }
}
