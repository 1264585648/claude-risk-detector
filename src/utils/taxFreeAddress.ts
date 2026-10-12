import type { TaxFreeAddressTemplate } from '../types';

export const TAX_FREE_ADDRESSES: TaxFreeAddressTemplate[] = [
  {
    stateName: 'Oregon (俄勒冈州)',
    stateCode: 'OR',
    city: 'Portland',
    zipCode: '97201',
    streetExample: '1211 SW 5th Ave, Suite 1900',
    phoneAreaCode: '+1 (503)',
    taxRate: '0% 消费税',
    note: '全美最受欢迎的免税州，商业写字楼密集，AVS 地址匹配通过率极高，时区为太平洋时间 (PST/PDT)。'
  },
  {
    stateName: 'Delaware (特拉华州)',
    stateCode: 'DE',
    city: 'Wilmington',
    zipCode: '19801',
    streetExample: '1201 N Market St, Suite 111',
    phoneAreaCode: '+1 (302)',
    taxRate: '0% 消费税',
    note: '美国众多科技公司与金融机构注册地，Stripe 对特拉华地址极其信任，时区为东部时间 (EST/EDT)。'
  },
  {
    stateName: 'Montana (蒙大拿州)',
    stateCode: 'MT',
    city: 'Bozeman',
    zipCode: '59715',
    streetExample: '1001 E Main St',
    phoneAreaCode: '+1 (406)',
    taxRate: '0% 消费税',
    note: '山地时间 (MST)，无一般销售税，适合匹配美西/中部节点。'
  },
  {
    stateName: 'New Hampshire (新罕布什尔州)',
    stateCode: 'NH',
    city: 'Manchester',
    zipCode: '03101',
    streetExample: '1000 Elm St',
    phoneAreaCode: '+1 (603)',
    taxRate: '0% 消费税',
    note: '美东免税州，东部时间 (EST)，适合使用美东纽约/波士顿代理出口的账号。'
  },
  {
    stateName: 'Alaska (阿拉斯加州)',
    stateCode: 'AK',
    city: 'Anchorage',
    zipCode: '99501',
    streetExample: '500 W 5th Ave',
    phoneAreaCode: '+1 (907)',
    taxRate: '0% 州消费税',
    note: '阿拉斯加时间 (AKST)，无州消费税（部分自治市有微量市政税，首府/大城市通常免税）。'
  }
];

export const BILLING_TIPS = [
  '【省钱原则】：美国各州消费税率在 0%~10% 不等。若填写加州 (CA) 或纽约州 (NY)，每月 $20 订阅可能被额外征收 $1.8~$2.0 的销售税；使用五大免税州地址可确保实付整整 $20.00。',
  '【AVS 校验要领】：Address Verification System 主要校验账单街道的第一串门牌数字（例如 1201）以及 5 位 Zip 邮编（如 19801）。邮编与城市、州代码必须真实一致，切忌随意拼凑。',
  '【时区对应】：若选择了特拉华 (DE) 或新罕布什尔 (NH)，建议系统时区调整为 America/New_York (EST)；若选择俄勒冈 (OR)，建议系统时区调整为 America/Los_Angeles (PST)。'
];
