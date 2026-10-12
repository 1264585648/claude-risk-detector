import type { CuratedCard, VirtualCard } from '../types';
import rawVirtualCards from '../data/virtualCards.json';

export const ALL_VIRTUAL_CARDS: VirtualCard[] = rawVirtualCards as VirtualCard[];

export const CURATED_CARDS: CuratedCard[] = [
  {
    id: 'bybit-apac',
    name: 'Bybit Card (亚太/全球)',
    tagline: '顶级合规交易所背书，虚拟卡 0 开卡费，USDT 现货直充',
    issuer: 'Bybit',
    cardType: 'Mastercard 借记卡',
    kycLevel: 'Passport-KYC',
    kycBadgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    issueFeeText: '虚拟卡 0 元免开卡费（实体卡 5 USDT）',
    topupMethods: ['USDT', 'USDC', 'BTC/ETH 现货账户余额'],
    applePaySupport: true,
    claudeSuccessRate: '95% (建议绑定美区 Apple Pay 或直刷)',
    pros: [
      '官方大所背书，资金极度安全，无跑路断供风险',
      '直接扣除账户内加密现货，免去法币兑换摩擦',
      '支持 Apple Pay 与 Google Pay 实体/虚拟双通道'
    ],
    cons: [
      '需要境外身份证明或护照认证 (Level 2 需地址证明)',
      '中国大陆 IP 无法直接访问 Bybit'
    ],
    officialUrl: 'https://www.bybit.com/en/cards/',
    recommendedFor: '有护照或境外资料、持有加密资产的严肃开发者与长期主力用户'
  },
  {
    id: 'bitget-wallet',
    name: 'Bitget Wallet Card',
    tagline: 'Web3 去中心化钱包原生卡，多链免许可快速开通',
    issuer: 'Bitget Wallet',
    cardType: 'Visa / Mastercard',
    kycLevel: 'Lite-KYC',
    kycBadgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    issueFeeText: '约 $0~$5 USD (视当前活动级别)',
    topupMethods: ['Web3 链上代币直扣', 'USDT (Tron/Arbitrum/Solana)'],
    applePaySupport: true,
    claudeSuccessRate: '90% (走 Apple Pay 最佳)',
    pros: [
      '非托管 Web3 钱包发起，无须传统中心化长流程审核',
      '充值速度极快，多链确认即时入账',
      '支持绑定海外 Apple ID 钱包内购'
    ],
    cons: [
      '部分卡头受限于发行方 3DS 短信网关',
      '提现到链上存在网络矿工费'
    ],
    officialUrl: 'https://web3.bitget.com/card',
    recommendedFor: '熟悉 Web3、希望兼顾隐私与便捷的开发者'
  },
  {
    id: 'pokepay',
    name: 'PokePay 虚拟卡',
    tagline: '支持支付宝小额充值与 USDT，国内开发者友好型轻量卡',
    issuer: 'PokePay',
    cardType: 'Visa / Mastercard',
    kycLevel: 'Lite-KYC',
    kycBadgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    issueFeeText: '约 $5 USD 开卡费',
    topupMethods: ['支付宝', 'USDT (TRC20/ERC20)'],
    applePaySupport: false,
    claudeSuccessRate: '85% (Stripe 网页端直刷通过率良好)',
    pros: [
      '门槛极低，支持支付宝扫码快捷充值汇款',
      '支持小额月充，适合月付体验 Claude Pro',
      '中文客服响应较快，有明确的商户兼容列表'
    ],
    cons: [
      '存在充值手续费与提现门槛',
      '暂不支持绑定 Apple Pay，需网页端直填卡号'
    ],
    officialUrl: 'https://pokepay.cc/',
    recommendedFor: '无加密货币基础、手头仅有支付宝的轻量级测试用户'
  },
  {
    id: 'redotpay',
    name: 'RedotPay (红点卡)',
    tagline: '香港合规牌照，支持 Apple Pay / Google Pay，Binance 充值秒到',
    issuer: 'RedotPay (香港合规 MSO)',
    cardType: 'Visa 借记卡 (4111/4859等优质卡头)',
    kycLevel: 'Passport-KYC',
    kycBadgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    issueFeeText: '虚拟卡 10 USD (实体卡 100 USD)',
    topupMethods: ['Binance Pay', 'USDT/USDC', 'BTC/ETH'],
    applePaySupport: true,
    claudeSuccessRate: '96% (经 Apple Pay 支付几乎 100% 成功)',
    pros: [
      '卡头 BIN 质量极高，Stripe Radar 欺诈分低',
      '完美支持绑定美区/港区 Apple ID 钱包',
      'Binance 官方支付接口直连，免网络提现费'
    ],
    cons: [
      '开卡费相对小高 ($10)',
      '需完成身份验证（支持中国大陆护照快速过审）'
    ],
    officialUrl: 'https://www.redotpay.com/',
    recommendedFor: '追求长期稳定续费、有 Apple 设备的高频 Claude / Claude Code 核心用户'
  },
  {
    id: 'dupay',
    name: 'DuPay (原 Depay)',
    tagline: '运行多年的老牌 USDT 预付卡，多币种多等级卡段可选',
    issuer: 'DuPay',
    cardType: 'Mastercard / Visa',
    kycLevel: 'No-KYC',
    kycBadgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    issueFeeText: '免 KYC 级别约 10 USD，认证级别 0~5 USD',
    topupMethods: ['USDT (TRC20/Polygon/BEP20)'],
    applePaySupport: true,
    claudeSuccessRate: '80% (部分卡段需挑选)',
    pros: [
      '提供【免实名 No-KYC 匿名卡】选项（限额单笔/单月较低，但极度注重隐私）',
      '运营周期长，支持多张子卡切换',
      '支持 Polygon 充值降低矿工费'
    ],
    cons: [
      '免 KYC 卡的充值汇率加点较高 (约 1.5%~2%)',
      '部分卡头被 Stripe 风控标记，建议使用其英国/欧元 Mastercard 卡段'
    ],
    officialUrl: 'https://dupay.one/',
    recommendedFor: '极度重视个人隐私、不愿提交任何身份证件或护照的匿名用户'
  },
  {
    id: 'onekey-card',
    name: 'OneKey Card / Web3 生态卡',
    tagline: '老牌硬件钱包团队生态，合规美国/香港卡段',
    issuer: 'OneKey',
    cardType: 'Visa / Mastercard',
    kycLevel: 'Passport-KYC',
    kycBadgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    issueFeeText: '根据账户等级 0~10 USD',
    topupMethods: ['USDC / USDT (各主流公链)'],
    applePaySupport: true,
    claudeSuccessRate: '92%',
    pros: [
      '大厂硬件钱包背书，无跑路挤兑担忧',
      '支持美卡与港卡多币种卡段',
      '清晰透明的月结对账单'
    ],
    cons: [
      '公测名额限制，部分国家申请需排队',
      '需配合 OneKey App 集中管理'
    ],
    officialUrl: 'https://card.onekey.so/',
    recommendedFor: '硬件钱包极客、长期依赖海外 SaaS 订阅的工程师'
  }
];

export interface PaymentChannelComparison {
  name: string;
  tag: string;
  badgeColor: string;
  riskScore: string;
  kycRequirement: string;
  refundDifficulty: string;
  verdict: string;
  bestPractice: string;
}

export const PAYMENT_CHANNELS_COMPARISON: PaymentChannelComparison[] = [
  {
    name: 'Apple App Store (iOS 内购)',
    tag: '首选最稳 • 避开网页风控',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    riskScore: '极低 (5/100)',
    kycRequirement: '仅需美区 Apple ID (可绑虚拟卡或充值礼品卡，零身份验证)',
    refundDifficulty: '极易 (Apple 官方介入，封号后 90%+ 成功退款)',
    verdict: '五星推荐',
    bestPractice: '注册纯净美区 Apple ID，在官网买礼品卡或绑支持 Apple Pay 的红点卡/Bybit卡，在 Claude iOS 客户端内点击 Upgrade，完全绕开 Stripe 激进的风控雷达！'
  },
  {
    name: 'Google Play (Android 内购)',
    tag: '次选稳妥 • 安卓首选',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    riskScore: '较低 (20/100)',
    kycRequirement: '美区 Google 账号，绑定支持的虚拟卡',
    refundDifficulty: '中等 (需 48h 内转接 Live Chat 真人客服)',
    verdict: '四星推荐',
    bestPractice: '在 Android 设备或安卓模拟器中登录美区 Google Play，绑定虚拟卡后在 Claude App 客户端订阅。'
  },
  {
    name: 'Claude 官网网页端直刷 (Stripe Checkout)',
    tag: '高敏风险 • 容易连坐',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    riskScore: '极高 (75/100)',
    kycRequirement: '视卡头与 Stripe Radar 评分，频繁触发 3DS 或要求提交 ID',
    refundDifficulty: '极难 (Anthropic 官方基本已读不回，只能走银行 Chargeback 拒付)',
    verdict: '谨慎使用',
    bestPractice: '必须使用纯净住宅 IP、对齐美国时区、准确填写免税州账单地址与真实 Zip，卡内预留 $25+ 缓冲资金，且必须选用支持 3DS OTP 验证的优质卡头。'
  },
  {
    name: '官方企业级 API 中转 / 分发',
    tag: '开发专用 • 彻底免风控',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    riskScore: '零 (0/100)',
    kycRequirement: '无需任何海外身份，国内网络直接调用',
    refundDifficulty: '无需退款 (按实际调用的 Token 额度实时计费)',
    verdict: '开发首选',
    bestPractice: '在 Claude Code 终端或 Cursor 中直接配置 ANTHROPIC_BASE_URL 与第三方 API 密钥，用多少扣多少，无需任何海外卡。'
  }
];
