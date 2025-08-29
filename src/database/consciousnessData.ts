// src/database/consciousnessData.ts

import type { IConsciousness } from '@/types/character'

/**
 * 游戏内所有意识的列表
 * 数据源：https://wiki.biligame.com/zspms/意识图鉴
 */
export const ALL_CONSCIOUSNESS: IConsciousness[] = [
  {
    id: 1,
    name: '芭斯隆',
    icon: '/consciousness_icons/baslon.png', // 假设的图标路径
    description:
      '2件套：攻击增加3%，伤害加成3%。\n4件套：每次消除色球，获得一层战争号令，最多叠加30层。释放必杀技时，根据层数获得必杀技能量，每层获得0.5点能量，清除所有层数。',
    positions: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 2,
    name: '达芬奇',
    icon: '/consciousness_icons/davinci.png',
    description:
      '2件套：攻击增加3%，生命增加3%。\n4件套：QTE出场时，触发另一个角色的QTE，冷却时间15秒。',
    positions: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 3,
    name: '爱因斯坦娜',
    icon: '/consciousness_icons/einstiena.png',
    description:
      '2件套：攻击增加3%，属性伤害增加3%。\n4件套：QTE出场时，降低目标15%的对应属性抗性，持续8秒。',
    positions: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 4,
    name: '汉娜',
    icon: '/consciousness_icons/hanna.png',
    description:
      '2件套：攻击增加3%，会心增加3%。\n4件套：进入超算空间时，获得2个随机信号球。3消后，下次3消伤害增加25%，持续5秒。',
    positions: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 5,
    name: '莎士比亚',
    icon: '/consciousness_icons/shakespeare.png',
    description:
      '2件套：攻击增加3%，火属性伤害增加3%。\n4件套：攻击目标时，有20%概率触发一次范围火属性伤害，并使其火属性抗性降低8%，持续5秒，有5秒冷却时间。',
    positions: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 6,
    name: '海森',
    icon: '/consciousness_icons/heisen.png',
    description:
      '2件套：攻击增加3%，雷属性伤害增加3%。\n4件套：攻击目标时，有20%概率触发一次范围雷属性伤害，并使其雷属性抗性降低8%，持续5秒，有5秒冷却时间。',
    positions: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 7,
    name: '达尔文',
    icon: '/consciousness_icons/darwin.png',
    description:
      '2件套：攻击增加3%，伤害加成3%。\n4件套：每次消除色球，伤害增加3%，持续4秒，最多叠加5层，重复触发刷新持续时间。',
    positions: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 8,
    name: '列文虎克',
    icon: '/consciousness_icons/leeuwenhoek.png',
    description:
      '2件套：攻击增加3%，火属性伤害增加3%。\n4件套：火属性伤害增加10%。攻击时，有50%概率使目标进入灼烧状态，每秒造成12%火属性伤害，持续3秒。',
    positions: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 9,
    name: '库莉珂',
    icon: '/consciousness_icons/kuhlicke.png',
    description:
      '2件套：攻击增加3%，生命增加3%。\n4件套：治疗效果增加10%。释放治疗技能时，受治疗单位伤害增加15%，持续5秒。',
    positions: [1, 2, 3, 4, 5, 6],
  },
  // 后续将继续补充更多意识数据...
]
