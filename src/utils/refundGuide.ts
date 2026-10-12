export interface RefundChannel {
  id: string;
  name: string;
  rating: number; // 1 to 5
  rateText: string;
  badge: string;
  badgeColor: string;
  description: string;
  portalUrl?: string;
  portalText?: string;
  steps: string[];
  warning?: string;
}

export interface RefundFaq {
  question: string;
  answer: string;
  tag?: string;
}

export const OFFICIAL_REFUND_TEMPLATE = [
  'Subject: Refund Request for Pro Subscription on Suspended Account - [YOUR_CLAUDE_ACCOUNT_EMAIL]',
  '',
  'Dear Anthropic Billing & Support Team,',
  '',
  'I am writing to formally request a refund for my recent Claude Pro subscription payment associated with the account: [YOUR_CLAUDE_ACCOUNT_EMAIL].',
  '',
  'Transaction & Account Details:',
  '- Account Email: [YOUR_CLAUDE_ACCOUNT_EMAIL]',
  '- Transaction Date: [TRANSACTION_DATE, e.g., October 5, 2026]',
  '- Amount Charged: $20.00 USD (or relevant amount)',
  '- Stripe Invoice / Receipt ID: [INVOICE_ID, e.g., in_1xxxxxx or ch_xxxxxx from your receipt email]',
  '',
  'Circumstances of Request:',
  'On [SUSPENSION_DATE], my account was suspended/disabled by your automated compliance system shortly after the subscription fee was deducted. I have not been able to access or utilize the Claude Pro features that were billed in advance.',
  '',
  'According to standard consumer protection principles and fair merchant terms, when a prepaid digital service is prematurely terminated and unavailable, the customer is entitled to a prorated or full refund for the unfulfilled billing period.',
  '',
  'I respectfully request:',
  '1. Confirmation of cancellation of any future recurring billing cycles.',
  '2. A full or prorated refund credited back to my original payment method.',
  '',
  'If you need any additional transaction receipts or identity verification to process this request, please let me know immediately.',
  '',
  'Thank you for your assistance and understanding.',
  '',
  'Sincerely,',
  '[YOUR_NAME]',
  '[YOUR_CLAUDE_ACCOUNT_EMAIL]'
].join('\n');

export const BANK_DISPUTE_TEMPLATE = [
  '【发卡行信用卡交易争议 / 拒付申请陈述书 (Chargeback Dispute Statement)】',
  '',
  '1. 基本交易信息 (Transaction Summary):',
  '- 商户名称 (Merchant Name): ANTHROPIC, PBC / CLAUDE.AI',
  '- 交易币种与金额 (Amount): $20.00 USD (或对应币种金额)',
  '- 交易发生日期 (Transaction Date): [YYYY-MM-DD]',
  '- 扣款卡号后四位 (Card Last 4 Digits): [XXXX]',
  '- 争议原因代码 (Dispute Category): 服务未提供 / 商户违约 (Services Not Rendered / Cancelled Services)',
  '',
  '2. 事实陈述 (Statement of Facts - 中文版供国内发卡行审核):',
  '本人于 [交易日期] 使用名下信用卡向境外商户 Anthropic, PBC 预先支付了一个月的 Claude Pro 软件在线服务订阅费。',
  '扣款后不久（[停用日期]），该商户在未提供任何具体违规证据或事先预警的情况下，通过其自动化系统单方面终止了本人的账户访问权限，导致本人完全无法使用已付费购买的订阅服务。',
  '本人已于 [发送邮件日期] 依照卡组织争议处理规范，先行通过商户官方支持邮箱（billing@anthropic.com）主动发信协商要求退还未履约周期的费用，但商户逾期未予合理履约或解决。',
  '鉴于商户未能交付预付的数字化服务且拒绝履行合同义务，特依据国际卡组织（Visa/Mastercard）“未提供约定服务（Services Not Rendered）”规则申请交易争议拒付，恳请发卡行协助追回款项。',
  '',
  '3. Statement of Facts (English - For Visa / Mastercard Scheme Review):',
  'I am disputing the transaction of $20.00 USD charged by ANTHROPIC, PBC on [YYYY-MM-DD].',
  'I paid for a 1-month Claude Pro digital software subscription in advance. Shortly after payment on [SUSPENSION_DATE], the merchant unilaterally revoked my account access without cause or delivering the prepaid services.',
  'I have exercised due diligence by attempting to resolve this directly with the merchant via their official billing channel (billing@anthropic.com) on [DATE], but received no resolution or refund.',
  'As the merchant has breached the agreement by failing to provide the paid services, I am requesting a chargeback under the Visa/Mastercard \'Services Not Rendered\' dispute rights.',
  '',
  '4. 随附证明材料清单 (Enclosed Evidence Checklist):',
  '[√] 1. 银行扣费明细凭单及 Stripe 扣款通知邮件截图',
  '[√] 2. 尝试登录 Claude 官网显示“Account Disabled / Suspended”的错误提示截图（证明服务被切断）',
  '[√] 3. 曾向商户官方 billing@anthropic.com 发送的退款协商邮件记录与时间戳截图（证明已履行善意协商义务）'
].join('\n');

export const STORE_CHAT_TEMPLATE = [
  '【Apple App Store / Google Play 在线客服申诉说明】',
  '',
  '适用情境：用于苹果 Report a Problem 详细说明，或 Google Play 帮助中心 Live Chat 在线真人客服聊天框',
  '',
  '英文申诉说明 (推荐，审核极快):',
  '"Hello Support Team,',
  'I am requesting a refund for my Claude subscription purchase (Order ID: [ORDER_OR_GPA_ID]) made on [DATE].',
  'Shortly after my subscription was billed, the third-party developer (Anthropic) unexpectedly and unilaterally terminated my account access without any policy violation on my part, rendering the in-app subscription completely unusable.',
  'Because the developer has failed to render the paid services and their support has been unresponsive, I kindly ask the platform to intervene and grant a refund for this unfulfilled digital purchase under your consumer protection policy.',
  'Thank you very much for your understanding and help."',
  '',
  '中文说明对照:',
  '"客服专员您好，我在此申请退还于 [日期] 购买的 Claude 应用内订阅款项（订单号: [填写订单号]）。',
  '在扣款后不久，第三方开发者 Anthropic 在我无任何违规行为的情况下单方面终止了我的账号登录权限，导致我所购买的订阅服务完全无法使用。',
  '鉴于开发者未履行已付费的服务且客服无法有效联络，特请求平台介入，根据消费者权益保障政策为这笔未履约的数字商品办理退款。非常感谢！"'
].join('\n');

export const REFUND_CHANNELS: RefundChannel[] = [
  {
    id: 'apple',
    name: 'Apple App Store (iOS 内购)',
    rating: 5,
    rateText: '成功率极高 (90%+)',
    badge: '首选最稳',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: '通过 iPhone/iPad 在 Claude App 内开通。款项由 Apple 官方托管结算，Anthropic 无法干预，苹果消费者权益保护力度最大。',
    portalUrl: 'https://reportaproblem.apple.com',
    portalText: '访问 Apple 官方退款中心',
    steps: [
      '访问 reportaproblem.apple.com，使用当时订阅的 Apple ID 登录。',
      '在购买记录中找到 Claude Pro / Max 订阅扣款项，点击【报告问题】。',
      '选择【请求退款】，理由选择【App 无法正常使用 / 经常崩溃 / 无法登录】或【并非有意订阅】。',
      '提交后通常 24~48 小时出结果，款项原路返还（Apple 账户余额或绑定的银行卡/支付宝）。',
      '若系统初审被拒，直接致电 Apple 官方客服或在线联系高级顾问（Senior Advisor）申请人工特批。'
    ],
    warning: '切记：千万不要绕过 Apple 直接向银行投诉拒付 Apple 的扣款，否则会导致整个 Apple ID 被锁死并产生负余额。'
  },
  {
    id: 'google',
    name: 'Google Play (安卓内购)',
    rating: 3,
    rateText: '成功率中等 (60%~70%)',
    badge: '需切人工',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    description: '通过 Android 客户端走 Google Play 支付。近期 48 小时内的系统自助退款拒审率增高，建议在帮助中心转接 Google 在线真人客服。',
    portalUrl: 'https://support.google.com/googleplay',
    portalText: '访问 Google Play 帮助中心',
    steps: [
      '48 小时内优先在 Google Play 订单历史中尝试提交自助退款申请。',
      '若遭遇系统自动秒拒，不要放弃，立刻进入 Google Play 帮助中心点击【联系我们】。',
      '选择【在线聊天 Live Chat】或【电子邮件】，转接 Google 真人客服专员。',
      '向专员提供 GPA 订单号，说明“第三方服务商在无违规理由下单方面切断服务，属于服务未交付且客服失联”。',
      '真人客服在核实情况后有较高权限手动批复全额或按比例退款。'
    ],
    warning: '沟通时聚焦“开发者单方面违约且服务未交付”，由 Google 履行平台监管责任。'
  },
  {
    id: 'stripe',
    name: '官网 Stripe 直刷 / 国际外币卡',
    rating: 4,
    rateText: '银行拒付高 (80%+) / 官方退款低 (10%)',
    badge: '维权底牌',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description: '在 Claude 官网网页端直接绑定 Visa / Mastercard / 双币信用卡。官方极少主动退款，但可向发卡行发起“交易争议拒付 (Chargeback)”。',
    portalUrl: 'mailto:billing@anthropic.com',
    portalText: '发送官方退款邮件',
    steps: [
      '【第一步·留证】：先向 billing@anthropic.com 和 support@anthropic.com 发送正式退款邮件。',
      '无论官方是否回复，保留 48 小时发信时间戳与邮件记录，作为“持卡人已履行善意协商义务”的法定证据。',
      '【第二步·拒付】：致电发卡行信用卡中心（招行/工行/中行国际部等）或在海外银行 App 内发起交易争议。',
      '争议理由选择【服务未提供 / 商户违约 (Services Not Rendered)】，提交账单凭证、封号截图及沟通邮件。',
      '国际卡组织规则偏向保护已付款未获服务的消费者，通常 14~45 天完成退款裁定。'
    ],
    warning: '【高危反噬警示】对 Stripe 账单发起 Chargeback 会导致该卡号及持卡人信息进入 Stripe Radar 全球风控黑名单，后续在任何接入 Stripe 的海外平台（OpenAI、Cursor 等）消费均可能被拒！仅建议作为挽回大额损失的终极手段。'
  },
  {
    id: 'virtual',
    name: '第三方虚拟信用卡 (WildCard/Dupay 等)',
    rating: 1,
    rateText: '成功率极低 (10%~20%)',
    badge: '注意止损',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    description: '虚拟卡多为资金池转接模式，平台通常不支持个人发起银行争议拒付，或每笔争议收取 $10~$30 昂贵手续费。',
    steps: [
      '向 Anthropic 官方发信争取按未消费天数折算退款（若官方同意退款，通常 5~10 个工作日原路退回虚拟卡余额）。',
      '被封后第一时间登录虚拟卡后台，将卡内未消费的剩余美元余额提现或转出，防止同批次卡 Bin 发生挤兑风控。',
      '切勿使用已被封号的虚拟卡卡号去开新号或绑定新账号，否则必定触发跨账号连坐秒封。'
    ],
    warning: '由于虚拟卡风控频发，不建议在此类卡内留存大额闲置资金。'
  }
];

export const REFUND_FAQS: RefundFaq[] = [
  {
    question: 'Claude 封号后，官方会自动按剩余天数退款吗？',
    answer: '绝大多数情况下不会。虽然根据 Stripe 机制，极少数被系统误解绑或因支付争议解散组织（Organization Disabled）的账号会触发系统自动 Prorated（按天折算）退款，但绝大多数被风控标记为“违反条款（Violated Terms of Service）”的账号，Anthropic 默认直接冻结并不主动退还预付费。因此必须主动核对账单并采取维权措施。',
    tag: '自动退款机制'
  },
  {
    question: '账号解封申诉（Appeal）与申请退款（Refund）能同时进行吗？',
    answer: '不建议同时进行，二者在法律与服务逻辑上存在冲突。申诉解封代表“我是合法合规用户，请恢复我的服务访问权”；而申请退款或银行拒付代表“商户违约未交付，要求彻底终止合同并退钱”。一旦商户或发卡行介入退款流程，系统会立即永久注销该账户，账号将无任何解封希望。建议策略：先提交解封申诉信，等待 3~5 天若确认无望或急需追回资金，再启动退款维权。',
    tag: '申诉冲突'
  },
  {
    question: '走银行信用卡争议拒付 (Chargeback) 会影响个人征信吗？',
    answer: '完全不会影响国内央行个人征信。信用卡争议拒付是 Visa / Mastercard / American Express 国际卡组织为保障持卡人合法权益设立的法定仲裁程序（针对服务未提供、未经授权交易等）。但是必须注意：Stripe 自身的全球反欺诈风控引擎（Stripe Radar）会将该卡号与持卡人信息记录为“高争议/拒付”，可能导致该卡未来无法在其他使用 Stripe 结算的海外服务平台（如 ChatGPT、Cursor 等）正常付款。',
    tag: '银行征信与风控'
  },
  {
    question: '成功退款或被封后，如何在同一台电脑安全注册新账号？',
    answer: '必须进行严格的环境与指纹隔离：① 彻底清除当前浏览器的所有 Cookie、Local Storage 与 IndexedDB，或新建完全干净的浏览器用户配置（Profile）；② 切换新的独立优质节点，切忌使用被封当天的同机房 IP；③ 绝对不要使用曾经被封账号绑定过的旧信用卡或同一虚拟卡卡号；④ 优先推荐使用美区 Apple ID 内购方式订阅新号，避开高风险虚拟卡头。',
    tag: '防二次连坐'
  }
];
