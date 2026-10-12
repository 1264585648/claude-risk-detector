import { useState, useMemo } from 'react';
import {
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  Search,
  Check,
  Copy,
  ExternalLink,
  MapPin,
  AlertTriangle,
  Info,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Star,
  CheckCircle2,
  Phone,
  Mail,
  Zap
} from 'lucide-react';
import {
  CURATED_CARDS,
  ALL_VIRTUAL_CARDS,
  PAYMENT_CHANNELS_COMPARISON
} from '../utils/cardGuide';
import {
  KYC_LAYERS,
  KYC_TRIGGERS,
  KYC_MITIGATION_RULES,
  KYC_EMERGENCY_SOP
} from '../utils/kycGuide';
import { TAX_FREE_ADDRESSES, BILLING_TIPS } from '../utils/taxFreeAddress';
import { EMAIL_GUIDE, SMS_GUIDE } from '../utils/accountPrep';
import type { CuratedCard } from '../types';

export function SubscriptionTab() {
  const [subTab, setSubTab] = useState<'matrix' | 'kyc' | 'taxfree' | 'account'>('matrix');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 全量 306 张卡搜索与筛选状态
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogKycFilter, setCatalogKycFilter] = useState<'all' | 'no' | 'yes' | 'unknown'>('all');
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const [catalogPage, setCatalogPage] = useState(1);
  const PAGE_SIZE = 12;

  // 紧急 SOP 展开索引
  const [expandedSopIndex, setExpandedSopIndex] = useState<number | null>(0);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 过滤全量虚拟卡数据
  const filteredCatalog = useMemo(() => {
    return ALL_VIRTUAL_CARDS.filter((card) => {
      const matchSearch =
        catalogSearch === '' ||
        card.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        card.issuer.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        (card.summary && card.summary.toLowerCase().includes(catalogSearch.toLowerCase()));

      let matchKyc = true;
      if (catalogKycFilter === 'no') {
        matchKyc = card.kyc_need === 'no';
      } else if (catalogKycFilter === 'yes') {
        matchKyc = card.kyc_need === 'yes';
      } else if (catalogKycFilter === 'unknown') {
        matchKyc = card.kyc_need === 'unknown' || card.kyc_need === 'maybe';
      }

      return matchSearch && matchKyc;
    });
  }, [catalogSearch, catalogKycFilter]);

  const paginatedCatalog = useMemo(() => {
    const start = (catalogPage - 1) * PAGE_SIZE;
    return filteredCatalog.slice(start, start + PAGE_SIZE);
  }, [filteredCatalog, catalogPage]);

  const totalPages = Math.ceil(filteredCatalog.length / PAGE_SIZE) || 1;

  return (
    <div className="space-y-6">
      {/* 头部横幅与核心概览 */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>海外支付与虚拟卡支持清单</span>
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                收录 306 款发卡机构与卡片
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Claude / Claude Code 支付渠道、虚拟卡实测与风控避坑指南
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              梳理主流支付渠道优劣势、306 款虚拟卡实测支持情况、Stripe 风控机制与免税州账单地址配置。
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 shrink-0 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-center">
            <div className="px-3 py-1">
              <div className="text-lg font-bold text-amber-400">306 款</div>
              <div className="text-[11px] text-slate-400">收录发卡机构</div>
            </div>
            <div className="px-3 py-1 border-x border-slate-800">
              <div className="text-lg font-bold text-emerald-400">94 款</div>
              <div className="text-[11px] text-slate-400">免 KYC / 极简卡</div>
            </div>
            <div className="px-3 py-1">
              <div className="text-lg font-bold text-sky-400">95%+</div>
              <div className="text-[11px] text-slate-400">Apple Pay 成功率</div>
            </div>
          </div>
        </div>

        {/* 订阅子导航 Tab */}
        <div className="flex flex-wrap items-center gap-2 pt-6 mt-6 border-t border-slate-800/80">
          <button
            onClick={() => setSubTab('matrix')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              subTab === 'matrix'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>支付渠道横评与常用卡</span>
          </button>

          <button
            onClick={() => setSubTab('kyc')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              subTab === 'kyc'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>风控机制与避坑指引</span>
          </button>

          <button
            onClick={() => setSubTab('taxfree')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              subTab === 'taxfree'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>免税州账单地址 (0% 消费税)</span>
          </button>

          <button
            onClick={() => setSubTab('account')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              subTab === 'account'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>注册邮箱与境外手机号参考</span>
          </button>
        </div>
      </div>

      {/* 子分栏 1：虚拟卡台与支付方式对比 */}
      {subTab === 'matrix' && (
        <div className="space-y-8">
          {/* 四大订阅途径全景横向评测 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>主流 Claude 订阅支付方式深度横评</span>
              </h3>
              <span className="text-xs text-slate-400">支付渠道与风控特点对照</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PAYMENT_CHANNELS_COMPARISON.map((ch, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${ch.badgeColor}`}>
                        {ch.tag}
                      </span>
                      <span className="text-xs font-bold text-slate-300">{ch.verdict}</span>
                    </div>

                    <h4 className="font-bold text-slate-200 text-sm">{ch.name}</h4>

                    <div className="space-y-1.5 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                      <div>
                        <span className="text-slate-500">风控拦截率：</span>
                        <span className="text-slate-300 font-medium">{ch.riskScore}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">身份认证：</span>
                        <span className="text-slate-300">{ch.kycRequirement}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">封号退款难度：</span>
                        <span className="text-slate-300">{ch.refundDifficulty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-amber-400 font-semibold block mb-0.5">实战策略：</strong>
                    {ch.bestPractice}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 常用虚拟卡榜单 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>常用虚拟卡实测与支持特性</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  根据开卡门槛、充值便利度、Apple Pay 兼容性与实测通过率汇总
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CURATED_CARDS.map((card: CuratedCard) => (
                <div
                  key={card.id}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-amber-500/40 transition flex flex-col justify-between space-y-4 shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-100 text-base">{card.name}</h4>
                        </div>
                        <p className="text-[11px] text-amber-400 font-medium mt-0.5">{card.tagline}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border shrink-0 ${card.kycBadgeColor}`}>
                        {card.kycLevel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block text-[10px]">发卡组织</span>
                        <span className="font-medium text-slate-300">{card.cardType}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">开卡费用</span>
                        <span className="font-medium text-slate-300">{card.issueFeeText}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Apple Pay 绑定</span>
                        <span className={`font-semibold ${card.applePaySupport ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {card.applePaySupport ? '✓ 完美支持 (首选)' : '✕ 暂不支持'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">通过成功率</span>
                        <span className="font-semibold text-emerald-400">{card.claudeSuccessRate}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[11px] shrink-0">充值通道:</span>
                        <span className="text-slate-300 truncate font-mono text-[11px]">
                          {card.topupMethods.join(' • ')}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-300 block">核心亮点：</span>
                        <ul className="space-y-0.5 text-[11px] text-slate-400">
                          {card.pros.map((p, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 shrink-0">✓</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-1 text-[11px] text-slate-500">
                        <span className="text-slate-400 font-medium">推荐画像：</span>
                        {card.recommendedFor}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <a
                      href={card.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      <span>访问官方开卡地址</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 全量 306 张卡库搜索与检索入口 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-100 text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>全量虚拟卡与发卡机构检索 (共收录 {ALL_VIRTUAL_CARDS.length} 款)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  支持按认证要求 (KYC)、卡片名称或发行机构快速检索开卡费用、支持网络及官方站点
                </p>
              </div>

              <button
                onClick={() => setShowFullCatalog(!showFullCatalog)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>{showFullCatalog ? '收起卡片目录' : '展开全部卡片检索'}</span>
                {showFullCatalog ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showFullCatalog && (
              <div className="space-y-4 pt-2">
                {/* 搜索与 KYC 过滤 */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="搜索卡片名称、发行商（如 Bybit, Bitget, Dupay, PokePay, Redot, Wise...）"
                      value={catalogSearch}
                      onChange={(e) => {
                        setCatalogSearch(e.target.value);
                        setCatalogPage(1);
                      }}
                      className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs shrink-0">
                    <button
                      onClick={() => {
                        setCatalogKycFilter('all');
                        setCatalogPage(1);
                      }}
                      className={`px-3 py-1 rounded text-xs transition ${
                        catalogKycFilter === 'all'
                          ? 'bg-slate-800 text-amber-400 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      全部 ({ALL_VIRTUAL_CARDS.length})
                    </button>
                    <button
                      onClick={() => {
                        setCatalogKycFilter('no');
                        setCatalogPage(1);
                      }}
                      className={`px-3 py-1 rounded text-xs transition ${
                        catalogKycFilter === 'no'
                          ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      无需KYC (94)
                    </button>
                    <button
                      onClick={() => {
                        setCatalogKycFilter('yes');
                        setCatalogPage(1);
                      }}
                      className={`px-3 py-1 rounded text-xs transition ${
                        catalogKycFilter === 'yes'
                          ? 'bg-sky-500/20 text-sky-400 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      需实名KYC (29)
                    </button>
                  </div>
                </div>

                {/* 卡片表格展示 */}
                <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">卡片名称与发行商</th>
                        <th className="py-2.5 px-3">地区属性</th>
                        <th className="py-2.5 px-3">开卡费与规则</th>
                        <th className="py-2.5 px-3">KYC 认证要求</th>
                        <th className="py-2.5 px-3 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {paginatedCatalog.map((card) => {
                        const feeStr =
                          card.issue_fee !== null && card.issue_fee !== undefined
                            ? `${card.issue_fee} ${card.issue_fee_unit || 'USD'}`
                            : card.fee_summary || '以官网为准';

                        const isNoKyc = card.kyc_need === 'no';
                        const isYesKyc = card.kyc_need === 'yes';

                        return (
                          <tr key={card.id} className="hover:bg-slate-900/40 transition">
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-200">{card.name}</div>
                              <div className="text-[11px] text-slate-500">{card.issuer} • {card.network || 'Visa/Mastercard'}</div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                              {card.region_label || '全球/多区'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">
                              <span className="font-mono text-amber-300/90">{feeStr}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              {isNoKyc ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <Unlock className="w-3 h-3" />
                                  <span>无需KYC</span>
                                </span>
                              ) : isYesKyc ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                  <Lock className="w-3 h-3" />
                                  <span>需身份认证</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                                  <span>视充值额度</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <a
                                href={card.official_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                              >
                                <span>官网</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}

                      {paginatedCatalog.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                            未找到符合条件的虚拟卡，请尝试更换关键词
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 分页控制 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                    <span>
                      显示第 {(catalogPage - 1) * PAGE_SIZE + 1} 至{' '}
                      {Math.min(catalogPage * PAGE_SIZE, filteredCatalog.length)} 条，共 {filteredCatalog.length} 条
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={catalogPage <= 1}
                        onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                      >
                        上一页
                      </button>
                      <span className="font-mono text-slate-300">
                        {catalogPage} / {totalPages}
                      </span>
                      <button
                        disabled={catalogPage >= totalPages}
                        onClick={() => setCatalogPage((p) => Math.min(totalPages, p + 1))}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 子分栏 2：风控触发机制与避坑操作指引 */}
      {subTab === 'kyc' && (
        <div className="space-y-6">
          {/* 三层风控机制解析 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>海外订阅三层风控机制拆解</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                风控拦截通常来自三个独立层面：支付网关 (Stripe)、发卡机构合规审查与 Anthropic 账号风控模型
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {KYC_LAYERS.map((layer, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-200 text-xs">{layer.layer}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{layer.summary}</p>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <strong className="text-rose-400/90 font-medium">典型风控诱因：</strong>
                    <span>{layer.triggers}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6 大高危触发行为 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>6 项常见高危触发行为与风控诱因 (Red Flags)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                支付网关通常不直接披露拒绝详情，以下为常见触发机制与应对建议
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {KYC_TRIGGERS.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-200 text-sm">{t.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        t.severity === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : t.severity === 'HIGH'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                      }`}
                    >
                      {t.severity === 'CRITICAL' ? '高风险·阻断' : t.severity === 'HIGH' ? '中高风险·拒付' : '提示·可能加权'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed space-y-1">
                    <div>
                      <strong className="text-amber-400 font-medium">底层风控机制：</strong>
                      <span>{t.triggerMechanism}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-800/60">
                      <strong className="text-emerald-400 font-medium">避坑对策：</strong>
                      <span>{t.avoidanceStrategy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6 项推荐操作规范 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>6 项推荐操作规范 (提高支付通过率与稳定性)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                遵循以下操作规范，可降低风控拦截概率并避免多账号关联风险
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {KYC_MITIGATION_RULES.map((rule) => (
                <div
                  key={rule.num}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-amber-500/40 font-mono">{rule.num}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {rule.badge}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm">{rule.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{rule.summary}</p>
                  </div>

                  <ul className="space-y-1 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                    {rule.details.map((d, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 触发 KYC 后的紧急自救 SOP */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>触发 KYC 或卡被拒时的紧急自救 SOP</span>
            </h3>

            <div className="space-y-3">
              {KYC_EMERGENCY_SOP.map((sop, idx) => {
                const isExp = expandedSopIndex === idx;
                return (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                    <div
                      onClick={() => setExpandedSopIndex(isExp ? null : idx)}
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition"
                    >
                      <span className="font-semibold text-slate-200 text-xs sm:text-sm">{sop.stage}</span>
                      {isExp ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                    {isExp && (
                      <div className="p-4 pt-1 border-t border-slate-800/60 bg-slate-900/20 space-y-2">
                        <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 leading-relaxed">
                          {sop.steps.map((st, sIdx) => (
                            <li key={sIdx}>{st}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 子分栏 3：免税州账单地址生成器 */}
      {subTab === 'taxfree' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-100">
                美国五大免税州合法账单地址库 (0% 消费税 • AVS 校验合规)
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              在绑定信用卡或开卡时，Stripe 会自动根据填写的账单地址（Billing Address）核算消费税。填写加州 (CA) 或纽约 (NY) 会多扣约 8%~10% 税款（即 $20 变成 $21.8+），且乱填假地址极易被 AVS 判定为高危欺诈拦截。以下为您整理真实合规的免税州模板，支持一键复制：
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TAX_FREE_ADDRESSES.map((addr) => {
              const fullAddressStr = `${addr.streetExample}, ${addr.city}, ${addr.stateCode} ${addr.zipCode}, United States`;
              return (
                <div
                  key={addr.stateCode}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-base">{addr.stateName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {addr.taxRate}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Street:</span>
                        <span className="text-slate-200 select-all">{addr.streetExample}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">City:</span>
                        <span className="text-slate-200 select-all">{addr.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">State:</span>
                        <span className="text-amber-400 font-bold select-all">{addr.stateCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ZIP Code:</span>
                        <span className="text-emerald-400 font-bold select-all">{addr.zipCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Area Code:</span>
                        <span className="text-slate-400">{addr.phoneAreaCode}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{addr.note}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => copyToClipboard(fullAddressStr, `addr-${addr.stateCode}`)}
                      className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      {copiedKey === `addr-${addr.stateCode}` ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>已复制完整免税地址</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>一键复制此州完整地址</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 账单避坑 Tips */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5 text-amber-400">
              <Info className="w-4 h-4" />
              <span>AVS 校验与账单填写避坑核心要领</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              {BILLING_TIPS.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-400 shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 子分栏 4：注册邮箱与境外手机号参考 */}
      {subTab === 'account' && (
        <div className="space-y-6">
          {/* 邮箱选择建议 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>注册邮箱服务商选型建议</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Claude 账号与注册邮箱强绑定。使用国内常规邮箱服务商极易在注册或绑卡阶段触发批量风控标记。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EMAIL_GUIDE.map((em, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${em.badgeColor}`}>
                      {em.category === 'RECOMMENDED' ? '强烈推荐' : em.category === 'ACCEPTABLE' ? '可选用' : '坚决禁止'}
                    </span>
                    <h4 className="font-bold text-slate-200 text-sm">{em.name}</h4>
                    <p className="text-xs text-slate-400">{em.description}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-slate-400 block mb-0.5">原因剖析：</strong>
                    {em.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 手机接码方案评测 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>境外手机号短信接码全景方案对比</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Anthropic 采用全球运营商数据库实时过滤 VOIP 虚拟号码，切勿使用免费网络虚拟电话
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SMS_GUIDE.map((sms, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${sms.badgeColor}`}>
                        {sms.badge}
                      </span>
                      <span className="text-xs font-bold text-slate-300">{sms.successRate}</span>
                    </div>
                    <h4 className="font-bold text-slate-200 text-sm">{sms.type}</h4>
                    <div className="text-xs text-slate-400">
                      <span className="text-slate-500">代表方案：</span>
                      <span className="text-slate-300 font-mono">{sms.examples}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-slate-400 block mb-0.5">实操建议：</strong>
                    {sms.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
