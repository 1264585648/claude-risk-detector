export interface KycTriggerItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  triggerMechanism: string;
  avoidanceStrategy: string;
}

export interface KycMitigationRule {
  num: string;
  title: string;
  badge: string;
  summary: string;
  details: string[];
}

export const KYC_LAYERS = [
  {
    layer: '第一层：Stripe Radar 支付网关风控',
    summary: '负责实时计算每笔交易的欺诈风险分 (0~99 分)。分值过高会直接拒绝交易 (Card Decline) 或强行要求 3DS / Stripe Identity 人脸核验。',
    triggers: '卡 BIN 发卡国与 IP 归属国矛盾、账单地址 (AVS) 不匹配、短时间多次试卡、机房代理 IP 扣款。'
  },
  {
    layer: '第二层：虚拟卡发卡平台金融合规 (AML / KYC 阶梯)',
    summary: '受所在国金融牌照监管（如立陶宛 EMI、香港 MSO、美国 MSB）。平台对单卡累计金额、交易频次有风控阶梯。',
    triggers: '单月累计消费触及无 KYC 额度上限 ($500~$1000)、充值来源为链上黑名单地址 (混币器/高危黑 U)、高频跨商户刷卡。'
  },
  {
    layer: '第三层：Anthropic / Claude 账号合规审计',
    summary: '针对账号本身的滥用防范。结合注册邮箱、绑定手机号、操作行为模型、会话频次进行批量关联识别。',
    triggers: '刚注册 0 活跃立刻绑定信用卡、同一张卡绑定多个 Claude 账号、使用公开接码平台虚拟号 (VOIP)、异地频繁跳跃。'
  }
];

export const KYC_TRIGGERS: KycTriggerItem[] = [
  {
    id: 'bin_ip_mismatch',
    title: '卡头国家 (BIN) 与代理节点 IP 发生跨洲矛盾',
    severity: 'CRITICAL',
    description: '使用香港或欧洲卡段的虚拟卡，却挂着美国洛杉矶的数据中心 IP 发起扣款，或者反之。',
    triggerMechanism: 'Stripe Radar 会提取客户端真实出口 IP 的 GeoIP 数据库，与信用卡发卡行前 6 位 BIN 码的国家代码比对。若跨洲且非国际旅行漫游特征，欺诈分直接加权 +40 分以上，触发 3DS 甚至直接 Decline。',
    avoidanceStrategy: '严格执行【三位一体】法则：若是美卡，节点务必使用美国原生住宅 IP；若是欧卡或港卡，出口节点尽可能与卡片发行国一致。'
  },
  {
    id: 'zero_warmup_instant_pay',
    title: '新号“零冷启动”秒绑卡（典型机器人特征）',
    severity: 'CRITICAL',
    description: '刚用邮箱完成注册，未进行任何人类正常的日常问答，5 分钟内直奔 Upgrade 页面绑定信用卡。',
    triggerMechanism: 'Anthropic 与 Stripe 会捕获账号的会话生命周期数据。真实正常用户的行为路径通常是先尝试免费模型 1~3 天，产生一定问答量后再考虑升级。秒冲账号具有极高黑产批量洗卡、盗刷特征。',
    avoidanceStrategy: '新账号必须“先养后绑”：在免费版中连续 2~3 天进行代码问答、日常咨询，建立稳定的浏览器 Cookie 与信誉会话后，再开启 Pro 订阅。'
  },
  {
    id: 'multiple_declines_lockout',
    title: '卡内余额不足导致扣费失败（连续 Decline 连坐）',
    severity: 'HIGH',
    description: '很多虚拟卡内只充值了恰好 $20.00，因 Stripe 在绑卡时发起 $0 或 $1 临时预授权校验，导致随后的 $20 实际划扣余额不足被拒。',
    triggerMechanism: 'Stripe 对商户端设有 Chargeback 与 Decline 率监控阈值。用户端连续 2 次触发“Card Declined (Insufficient Funds)”，系统会将该卡 BIN、IP、浏览器指纹列入高风险标记，并可能立即要求上传官方身份证件核验。',
    avoidanceStrategy: '开卡与续费前，卡内至少保证有 $25~$30 充足余额。续费日前 3 天务必提前核对扣费日，切勿等到扣款失败才临时补充。'
  },
  {
    id: 'dirty_usdt_source',
    title: '充值加密资产时链上关联度被合规预警',
    severity: 'HIGH',
    description: '通过小交易所、场外 OTC 散户钱包或不明来源转账 USDT 充值进虚拟卡平台。',
    triggerMechanism: '主流合规卡台均接入了 Chainalysis KYT、TRM Labs 等链上反洗钱引擎。一旦发现入金地址曾经过混币器、涉赌或被标记的风险钱包，卡台会被迫冻结账户并强制要求用户提交护照及资金来源合法证明（KYC Level 3）。',
    avoidanceStrategy: '充值所用的 USDT / USDC，务必直接从一线合规交易所（Binance、OKX）主账户官方提现通道发起，避免任何个人之间二次倒手或场外杂币。'
  },
  {
    id: 'invalid_billing_address',
    title: '账单地址随便胡填或与 Zip 邮编区域冲突 (AVS 失败)',
    severity: 'MEDIUM',
    description: '在 Stripe 结账表单中随意乱敲地址，例如填了加州 California 的城市却填了纽约的邮编。',
    triggerMechanism: 'Visa / Mastercard 的 AVS (Address Verification Service) 机制会自动校验街道数字与 Zip 邮编的映射。虽然部分虚拟卡不校验 AVS，但 Stripe 会对地址乱填的行为标记为恶意灌水，触发人工复核。',
    avoidanceStrategy: '使用真实规范的五大免税州地址模板（俄勒冈、特拉华等），确保城市、州代码、Zip 邮编三者完全真实对应。'
  },
  {
    id: 'multi_account_card_reuse',
    title: '同一张虚拟卡在多个 Claude 账号间反复解绑换绑',
    severity: 'CRITICAL',
    description: '一个账号被限制后，把同一张卡解绑后绑定到新号，或者一张卡绑定两个账号。',
    triggerMechanism: 'Stripe 支付网关会在数据库中跨商户建立 Card Fingerprint（卡片唯一指纹哈希）。一旦某卡号关联的某个账号曾被封禁，后续所有新账号绑定该卡时都会被风控系统一秒识别并直接连坐封号。',
    avoidanceStrategy: '绝对奉行【一卡一号】原则。若旧账号已被禁用，该虚拟卡必须在卡台注销作废，绝对不能在新号上复用！'
  }
];

export const KYC_MITIGATION_RULES: KycMitigationRule[] = [
  {
    num: '01',
    title: '三位一体环境对齐法则',
    badge: '底层基石',
    summary: '确保“代理出口 IP 归属地”、“信用卡发卡行 BIN 码国家”、“Stripe 账单地址”三者严格吻合。',
    details: [
      '使用美国卡段时，固定使用美国纯净静态住宅 IP，时区同步至美国对应时区（如 EST 或 PST）。',
      '账单地址切勿使用中国地址或乱码拼音，直接选用美国五大免税州（如俄勒冈 OR）的真实商业街道与合法 Zip Code。',
      '避免在操作中途开启全局节点切换，保持同一会话期间 IP 与指纹环境稳定。'
    ]
  },
  {
    num: '02',
    title: '借道 Apple Pay 硬件安全区“降维避险”',
    badge: '终极秘籍',
    summary: '避开网页端 Stripe 的激进 JavaScript 指纹探针，利用 Apple 原生 Secure Enclave 签名支付。',
    details: [
      '将虚拟卡绑定至美区 Apple ID（如 RedotPay、Bybit Card、Bitget Wallet Card 等优质卡段均支持）。',
      '在 iOS / iPadOS 系统的 Claude 官方客户端内点击 Upgrade 进行内购订阅。',
      'Apple Pay 具有国际最高标准的硬件级 token 化认证，Stripe 对 Apple Pay 的欺诈拦截率极低，成功率达 95% 以上。',
      '即便后续账号被封，款项也可直接在 reportaproblem.apple.com 快速全额追回，免受官方已读不回之苦。'
    ]
  },
  {
    num: '03',
    title: '新号“阶梯式温和冷启动”',
    badge: '行为信誉',
    summary: '消除新号被判定为黑产批量机器人的高危特征。',
    details: [
      '注册新号后，先在当前节点环境下正常对话 48~72 小时，进行多轮真实技术问答。',
      '检查浏览器体检得分是否维持在 75 分以上（无 WebRTC 泄露、无系统中文字体枚举暴露）。',
      '第三天再平稳点击订阅，绑定符合标准的虚拟卡。'
    ]
  },
  {
    num: '04',
    title: '卡内恒定预留 $25+ 缓冲资金',
    badge: '资金风控',
    summary: '消灭任何因预授权验证扣款失败而导致的“Decline 连坐”。',
    details: [
      'Stripe 首次绑卡通常发起 $0.00 或 $1.00 的有效性预授权（Pre-auth），随后才正式发起 $20.00 扣款。',
      '若卡内只有刚好 $20.00，部分平台会因锁定保证金而导致第二笔划扣失败。',
      '在订阅前，卡内至少预备 $25~$30 USD 余额；每月续费日前 3 天确保余额充足。'
    ]
  },
  {
    num: '05',
    title: '分级选卡：按需选择免 KYC 或护照合规卡',
    badge: '卡种选择',
    summary: '根据个人隐私接受度和资金规模，理性选择开卡层级。',
    details: [
      '轻度体验 / 极度注重隐私：选用 DuPay 免实名匿名卡段或支持支付宝的轻量卡，单卡消费控制在 $100 以内。',
      '长期主力 / 重度 Claude Code：选用 Bybit、RedotPay 等合规大所借记卡，使用护照完成 Level 1/2 认证，稳定性最强，额度高且卡段干净。'
    ]
  },
  {
    num: '06',
    title: '绝对的一卡一号与废卡止损',
    badge: '防关联',
    summary: '切断跨账号污染链条。',
    details: [
      '一张虚拟卡坚决只绑定一个 Claude 账号，严禁一卡多绑。',
      '若旧账号遭遇封禁，第一时间在虚拟卡后台注销该卡，将余额转回钱包或新开一张新卡号。',
      '永远不要在新号中重新输入已被封禁账号使用过的旧卡号。'
    ]
  }
];

export const KYC_EMERGENCY_SOP = [
  {
    stage: '场景 A：虚拟卡平台提示需要补充身份认证 (Tier Level Upgrade)',
    steps: [
      '判定卡内余额：若卡内仅剩几美元，可直接放弃该卡并在卡台注销，重新开一张免 KYC 卡。',
      '若卡内有大额资金：准备中国大陆护照（比身份证更易被海外合规机构系统 OCR 识别并快速过审）。',
      '地址证明：如需 Proof of Address，提供国内招行/工行信用卡的英文/双语电子对账单（含姓名与真实地址），通常 24 小时内过审。'
    ]
  },
  {
    stage: '场景 B：Stripe 页面绑卡时提示“Card was declined / Unable to authorize”',
    steps: [
      '切勿立即疯狂连续点击“Try Again”（3 次以上直接拉黑该 IP 和卡号！）。',
      '立即检查卡台后台明细，看是否有 3DS 授权请求或预授权扣费记录；若显示“余额不足”，立刻补足 $5~$10 后再试。',
      '若卡后台无任何请求：说明卡头 BIN 直接被 Stripe 拒收。果断放弃网页绑卡，转向 iPhone/iPad 绑定美区 Apple ID 使用 Apple Pay 订阅。'
    ]
  },
  {
    stage: '场景 C：Claude 网页端提示“Verify your identity / Phone verification needed”',
    steps: [
      '严禁使用 Google Voice、TextNow、Dingtone 等 VOIP 虚拟号码，Anthropic 数据库直接拉黑此类号段。',
      '使用国外实体 SIM 电话卡（如英国 Giffgaff、新西兰 Skinny、美国 Ultra Mobile PayGo）。',
      '或选用 SMS-Activate / 5SIM 等平台上的“真实物理 SIM (Real SIM / Physical)”号段进行单次激活。'
    ]
  }
];
