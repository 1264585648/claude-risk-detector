export interface EmailAdvice {
  category: 'RECOMMENDED' | 'ACCEPTABLE' | 'FORBIDDEN';
  badgeColor: string;
  name: string;
  description: string;
  reason: string;
}

export interface SmsAdvice {
  type: string;
  badge: string;
  badgeColor: string;
  successRate: string;
  recommendation: string;
  examples: string;
  details: string;
}

export const EMAIL_GUIDE: EmailAdvice[] = [
  {
    category: 'RECOMMENDED',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    name: 'ProtonMail / Gmail / 自建独立域名企业邮',
    description: '独立隐私邮箱、原生海外信誉度高。',
    reason: 'ProtonMail 零个人隐私绑定且在海外技术开发者中极其常见；干净无滥用历史的 Gmail 或企业域名邮箱具有最高权重。'
  },
  {
    category: 'ACCEPTABLE',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    name: 'Outlook / Hotmail / iCloud 隐藏邮件',
    description: '微软个人账号或 Apple 官方随机转发邮箱。',
    reason: '可通过，但需注意部分新注册未绑手机的 Outlook 容易被微软自身安全挑战锁定；iCloud+ 隐藏邮件通过率良好。'
  },
  {
    category: 'FORBIDDEN',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    name: '国内邮箱（QQ / 163 / 126 / 新浪 / 搜狐）及公开临时接码邮箱',
    description: '中国大陆主流公共邮箱及 10min 临时一次性邮箱。',
    reason: '直接向 Anthropic 暴露地理属性为非支持区用户，极易在注册时被直接屏蔽、或在绑卡时作为高危关联特征瞬间触发秒封。'
  }
];

export const SMS_GUIDE: SmsAdvice[] = [
  {
    type: '境外实体 SIM 物理电话卡 (Real Physical SIM)',
    badge: '最稳首选 (99%)',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    successRate: '99% 稳定秒过',
    recommendation: '强烈推荐',
    examples: '英国 Giffgaff、新西兰 Skinny、美国 Ultra Mobile PayGo、ClubSIM',
    details: '在淘宝或境外电商购买一张境外实体 SIM，插在备用手机中在中国大陆免费漫游接收验证码短信。属于真实物理号段，几乎终身无风控风险。'
  },
  {
    type: '合规在线接码平台（真实 SIM 号段筛选）',
    badge: '经济便捷 (85%)',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    successRate: '80%~90% 一次性成功',
    recommendation: '推荐',
    examples: 'SMS-Activate (选 Real SIM / 物理号段)、5SIM、Darksms',
    details: '按次付费（约 0.5~2 USD 一次）。务必勾选“物理实体号”而非“虚拟号”，选择英国、智利、马来西亚、印尼等低成本且宽松的合规国家号段。'
  },
  {
    type: 'VOIP 虚拟号码 / 网络电话',
    badge: '极度高危 (10%)',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    successRate: '小于 10% (必被拦截)',
    recommendation: '坚决禁止',
    examples: 'Google Voice, TextNow, Dingtone, Skype Number, Talkatone',
    details: 'Anthropic 与 Twilio / Telesign 等号码库实时对接。VOIP 号段具有明确的虚拟标记，提交时直接报错“We could not verify your phone number”，且该账号会被永久打上欺诈标记。'
  }
];
