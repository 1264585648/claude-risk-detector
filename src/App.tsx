import { useState, useEffect, lazy, Suspense } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Globe,
  Clock,
  Type,
  Wifi,
  ChevronDown,
  ChevronUp,
  FileText,
  Zap,
  DollarSign,
  CreditCard,
  ExternalLink,
  Scale,
  HelpCircle,
  Star
} from 'lucide-react';
import {
  detectTimezone,
  detectLanguages,
  detectFonts,
  detectWebRTC,
  detectBrowser,
  detectIntlAndEmoji,
  detectIpAndCrossCheck,
  calculateOverall
} from './utils/detector';
import type { DetectionItem, NetworkProfile, OverallResult } from './types';
import { APPEAL_TEMPLATE } from './utils/cliGuide';
import {
  OFFICIAL_REFUND_TEMPLATE,
  BANK_DISPUTE_TEMPLATE,
  STORE_CHAT_TEMPLATE,
  REFUND_CHANNELS,
  REFUND_FAQS
} from './utils/refundGuide';
import { generateReportPoster } from './utils/poster';
import { DarioCompanion } from './components/DarioCompanion';
import { DiagnosisFixModule } from './components/DiagnosisFixModule';

const SubscriptionTab = lazy(() =>
  import('./components/SubscriptionTab').then((m) => ({ default: m.SubscriptionTab }))
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'web' | 'subscription' | 'guide' | 'solution'>('web');
  const [isScanning, setIsScanning] = useState(false);
  const [items, setItems] = useState<DetectionItem[]>([]);
  const [network, setNetwork] = useState<NetworkProfile>({
    ip: '加载中...',
    country: '探测中...',
    countryCode: '',
    city: '',
    timezone: '',
    isp: '',
    isDatacenter: false,
    isTzMismatch: false,
    status: 'loading'
  });
  const [overall, setOverall] = useState<OverallResult | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

  // 避坑与申诉子分栏
  const [guideSubTab, setGuideSubTab] = useState<'appeal' | 'refund'>('appeal');
  const [refundTemplateTab, setRefundTemplateTab] = useState<'official' | 'bank' | 'store'>('official');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // 执行全套体检
  const runFullScan = async () => {
    setIsScanning(true);

    // 1. 同步探测浏览器核心指纹
    const tzItem = detectTimezone();
    const langItem = detectLanguages();
    const fontItem = detectFonts();
    const browserItem = detectBrowser();
    const intlItem = detectIntlAndEmoji();

    // 2. 异步探测 WebRTC
    const webrtcItem = await detectWebRTC();

    // 3. 异步探测出口 IP 并与时区做交叉比对
    const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { ipCrossItem, ipLineItem, profile } = await detectIpAndCrossCheck(currentTz);
    setNetwork(profile);

    const allItems: DetectionItem[] = [
      tzItem,
      ipCrossItem,
      ipLineItem,
      langItem,
      fontItem,
      webrtcItem,
      browserItem,
      intlItem
    ];

    setItems(allItems);
    const result = calculateOverall(allItems);
    setOverall(result);

    setIsScanning(false);
  };

  useEffect(() => {
    runFullScan();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGeneratePoster = async () => {
    if (!overall || items.length === 0) return;
    setIsGeneratingPoster(true);
    const dataUrl = await generateReportPoster(overall, items, network);
    setPosterUrl(dataUrl);
    setIsGeneratingPoster(false);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'SAFE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">安全正常</span>;
      case 'LOW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">良好偏好</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">建议优化</span>;
      case 'HIGH':
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">优先排查</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 顶部通栏导航 */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/20">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  Claude 从入门到维权
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  自测 · 避坑 · 维权
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Claude 环境防封自测、虚拟卡开通与封禁申诉 / 交易争议退款指南
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('web')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'web'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              环境诊断与修复
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                activeTab === 'subscription'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>支付渠道与选卡</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>申诉与退款维权</span>
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                activeTab === 'solution'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>长效稳定方案</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeTab === 'web' && (
          <div className="space-y-6">
            {/* 核心控制台：总体评分与网络出口画像 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* 左侧：健康安全评分与总体结论 */}
              <div className="lg:col-span-6 relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-5 sm:gap-6">
                  {/* 评分圆环 */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        className="stroke-slate-800"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        className={`transition-all duration-1000 ease-out ${
                          !overall
                            ? 'stroke-slate-700'
                            : overall.totalScore >= 75
                            ? 'stroke-emerald-500'
                            : overall.totalScore >= 45
                            ? 'stroke-amber-500'
                            : 'stroke-rose-500'
                        }`}
                        strokeWidth="10"
                        strokeDasharray={314.159}
                        strokeDashoffset={
                          overall ? 314.159 - (314.159 * overall.totalScore) / 100 : 314.159
                        }
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold tracking-tight">
                        {isScanning ? '...' : overall ? overall.totalScore : 0}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">/ 100 安全分</span>
                    </div>
                  </div>

                  {/* 诊断结论文本 */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-medium border ${
                        !overall || isScanning
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : overall.riskLevel === 'SAFE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : overall.riskLevel === 'LOW'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          : overall.riskLevel === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {isScanning
                          ? '检测中'
                          : overall?.riskLevel === 'SAFE'
                          ? '极佳'
                          : overall?.riskLevel === 'LOW'
                          ? '低风险'
                          : overall?.riskLevel === 'MEDIUM'
                          ? '中风险'
                          : overall
                          ? '高风险'
                          : 'READY'}
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 truncate">
                        {isScanning
                          ? '正在分析指纹与网络特征...'
                          : overall
                          ? overall.verdict
                          : '环境体检就绪'}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {overall
                        ? overall.description
                        : '本地沙箱环境安全探测，覆盖系统时区、公网出口、字体指纹与 WebRTC 穿透等核心风控要素。'}
                    </p>
                  </div>
                </div>

                {/* 控制台操作按钮 */}
                <div className="flex items-center gap-3 pt-5 mt-5 border-t border-slate-800/80">
                  <button
                    onClick={runFullScan}
                    disabled={isScanning}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? '正在探测...' : '重新检测环境'}</span>
                  </button>

                  <button
                    onClick={handleGeneratePoster}
                    disabled={isScanning || !overall}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isGeneratingPoster ? '正在绘制...' : '生成体检长图'}</span>
                  </button>
                </div>
              </div>

              {/* 右侧：4 项网络出口关键画像 (2x2 网格) */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <span>公网出口 IP</span>
                  </div>
                  <div className="font-mono text-base font-semibold text-slate-200 truncate py-1">
                    {network.status === 'failed' ? (
                      <span className="text-amber-400 text-xs font-normal">未能探测 (检查网络/代理)</span>
                    ) : (
                      network.ip
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {network.isp ? network.isp : '正在查询运营商...'}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Wifi className="w-4 h-4 text-emerald-400" />
                      <span>出口地区与节点</span>
                    </div>
                    {network.isTzMismatch && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                        时区未对齐
                      </span>
                    )}
                  </div>
                  <div className="text-base font-semibold text-slate-200 truncate py-1">
                    {network.country || '探测中...'} {network.city ? `• ${network.city}` : ''}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    出口时区: {network.timezone || '未知'}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>本地系统时区</span>
                    </div>
                    {network.isTzMismatch ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">
                        需调整
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                        匹配良好
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-base font-semibold text-slate-200 truncate py-1">
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {network.isTzMismatch ? '与出口地理时区存在差异' : '时区与出口节点对齐'}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Type className="w-4 h-4 text-purple-400" />
                    <span>IP 线路属性</span>
                  </div>
                  <div className="text-base font-semibold text-slate-200 truncate py-1">
                    {network.status === 'failed' ? (
                      <span className="text-slate-500 text-xs">无法判定</span>
                    ) : network.isDatacenter ? (
                      <span className="text-amber-400">数据中心机房段</span>
                    ) : (
                      <span className="text-emerald-400">家庭/商业宽带 (原生)</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {network.isDatacenter ? '机房段易被标记为代理' : '优质原生出口'}
                  </div>
                </div>
              </div>
            </div>

            {/* 达里奥安全诊断顾问 */}
            <DarioCompanion
              score={overall?.totalScore ?? 0}
              riskLevel={overall?.riskLevel ?? 'SAFE'}
              isScanning={isScanning}
              verdict={overall?.verdict ?? '环境体检就绪'}
            />

            {/* 诊断结论与一键复制修复版 */}
            <DiagnosisFixModule
              overall={overall}
              items={items}
              network={network}
              isScanning={isScanning}
            />

            {/* 详细指标清单 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <span>环境指纹逐项检测清单</span>
                  <span className="text-xs text-slate-400 font-normal">
                    (点击卡片查看风控判定原理与逐步排查指引)
                  </span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">共 {items.length} 项关键检测</span>
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const isExpanded = expandedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-800/80 bg-slate-900/50 hover:border-slate-700 transition overflow-hidden"
                    >
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="p-4 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          {item.risk === 'SAFE' && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                          {item.risk === 'LOW' && <ShieldCheck className="w-5 h-5 text-sky-400" />}
                          {item.risk === 'MEDIUM' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                          {(item.risk === 'HIGH' || item.risk === 'CRITICAL') && (
                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                          )}
                          <div>
                            <div className="font-semibold text-slate-200 text-sm sm:text-base">
                              {item.title}
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              当前状态: {item.value}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {getRiskBadge(item.risk)}
                          <div className="text-right hidden sm:block">
                            <span className="text-sm font-bold text-slate-300">{item.score}</span>
                            <span className="text-xs text-slate-500"> / 100</span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* 展开内容 */}
                      {isExpanded && (
                        <div className="p-4 pt-2 border-t border-slate-800/60 bg-slate-950/40 text-sm space-y-3">
                          <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                              诊断分析
                            </span>
                            <p className="text-slate-300 leading-relaxed">{item.detail}</p>
                          </div>

                          <div>
                            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                              为什么平台会关注此项？
                            </span>
                            <p className="text-slate-400 leading-relaxed">{item.impactReason}</p>
                          </div>

                          <div>
                            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                              优化与排查建议
                            </span>
                            <p className="text-slate-300 leading-relaxed mb-2">{item.fixGuide}</p>
                            {item.quickFixCmd && (
                              <div className="mt-2 flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300">
                                <code>{item.quickFixCmd}</code>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(item.quickFixCmd!, item.id);
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                                >
                                  {copiedKey === item.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                  <span>{copiedKey === item.id ? '已复制' : '复制命令'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 引导至支付渠道与选卡指南 */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span>环境自测就绪？下一步：海外支付渠道与开卡指南</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        收录 306 款卡片
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      提供主流支付渠道评测、虚拟卡检索、免税州账单地址生成与 Stripe 风控防范建议。
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <span>查看支付与选卡指南</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 入门订阅方式、虚拟卡台与 KYC 避坑全景 */}
        {activeTab === 'subscription' && (
          <Suspense
            fallback={
              <div className="p-12 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">正在加载 306 款虚拟卡与发卡机构检索数据...</p>
              </div>
            }
          >
            <SubscriptionTab />
          </Suspense>
        )}

        {/* Tab 3: 避坑与申诉维权 SOP */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            {/* 顶部分区切换器 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <div>
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  {guideSubTab === 'appeal' ? (
                    <>
                      <FileText className="w-5 h-5 text-amber-400" />
                      <span>Claude 异常类型与解封申诉指南</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      <span>Claude 订阅退款与维权申请全指南</span>
                    </>
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  {guideSubTab === 'appeal'
                    ? '区分“节点受限”与“真正封号”，提供官方人工复核高过率中英文申诉邮件模版。'
                    : '汇总技术社区实战经验：拆解 Apple、Google、Stripe 官网直刷与银行争议拒付 (Chargeback) 申诉与维权策略。'}
                </p>
              </div>

              {/* 子 Tab 切换 Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setGuideSubTab('appeal')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    guideSubTab === 'appeal'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>解封申诉 (Appeal)</span>
                </button>
                <button
                  onClick={() => setGuideSubTab('refund')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    guideSubTab === 'refund'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>退款维权 (Refund)</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-medium">
                    争议仲裁 / 拒付
                  </span>
                </button>
              </div>
            </div>

            {/* 子视图 1：账号解封申诉 */}
            {guideSubTab === 'appeal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      类型 1：地区访问限制 (403)
                    </span>
                    <h4 className="font-bold text-slate-200">App unavailable in your region</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong>现象</strong>：网页弹出地区不支持提示。<br />
                      <strong>本质</strong>：仅为当前出口节点 IP 被判定为未开放地区或机房黑名单。<strong>账号本身完好无损</strong>，切换到原生合规节点即可立即恢复。
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      类型 2：订阅支付被撤销
                    </span>
                    <h4 className="font-bold text-slate-200">Subscription Cancelled / Refunded</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong>现象</strong>：Pro 状态失效，收到 Stripe 退款邮件。<br />
                      <strong>本质</strong>：绑定的虚拟信用卡卡头被批量风控拒付。账号本身仍可免费使用，重新绑定合规的海外真实卡或借记卡即可续费。
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      类型 3：账号暂停使用
                    </span>
                    <h4 className="font-bold text-slate-200">Account Disabled / Suspended</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong>现象</strong>：登录时提示账号已被禁用。<br />
                      <strong>本质</strong>：触发了严重跨区风控或批量关联限制。可通过官方申诉通道提交诚恳规范的英文申诉信申请人工复核。
                    </p>
                  </div>
                </div>

                {/* 英文申诉信模版 */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">
                        官方解封申诉邮件参考模板 (Appeal Email)
                      </h4>
                      <p className="text-xs text-slate-400">
                        可向 support@anthropic.com 发送，或在官网被封申诉表单中提交
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(APPEAL_TEMPLATE, 'appeal')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                    >
                      {copiedKey === 'appeal' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'appeal' ? '已复制模板' : '一键复制申诉信'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                    <code>{APPEAL_TEMPLATE}</code>
                  </pre>
                </div>

                {/* 引导至退款维权的快捷横幅 */}
                <div className="p-4 rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-200">
                        刚付费订阅就被封号，官方申诉未获回复或被拒绝？
                      </div>
                      <div className="text-xs text-slate-400">
                        若官方客服驳回或未及时回复，可通过发卡行交易争议（Chargeback）或移动应用商店申请介入退款。
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setGuideSubTab('refund')}
                    className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition shrink-0 flex items-center gap-1"
                  >
                    <span>切换至退款维权指南</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* 子视图 2：退款与维权申请 (Refund) */}
            {guideSubTab === 'refund' && (
              <div className="space-y-6">
                {/* 核心思路总览提示条 */}
                <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Scale className="w-4 h-4" />
                    <span>核心考量：退款成功率主要取决于所采用的支付渠道与结算规则</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Anthropic 官方对受限账号的退款请求多采用自动化模板回复。当商户沟通受阻时，可依托支付渠道的上级消费者保障规则（Apple、Google 或国际卡组织交易争议仲裁）申请退款。
                  </p>
                </div>

                {/* 四大支付渠道退款维权对比 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {REFUND_CHANNELS.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-slate-400" />
                            <span className="font-bold text-slate-100 text-base">{ch.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${ch.badgeColor}`}>
                              {ch.badge}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400 text-xs">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < ch.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-slate-400 text-[11px] ml-1">{ch.rateText}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {ch.description}
                        </p>

                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                            实操维权步骤：
                          </span>
                          <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 leading-relaxed">
                            {ch.steps.map((st, sIdx) => (
                              <li key={sIdx}>{st}</li>
                            ))}
                          </ol>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        {ch.warning && (
                          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 leading-relaxed flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span>{ch.warning}</span>
                          </div>
                        )}

                        {ch.portalUrl && (
                          <a
                            href={ch.portalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium pt-1"
                          >
                            <span>{ch.portalText}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 申诉说明书与争议拒付证据模板库 */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-100 text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>申诉说明书与争议拒付证据模板库 (Dispute Templates)</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        根据当前申诉阶段选用对应模板，支持一键复制并按实际情况替换方括号字段
                      </p>
                    </div>

                    {/* 模板选择 Tab */}
                    <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto">
                      <button
                        onClick={() => setRefundTemplateTab('official')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                          refundTemplateTab === 'official'
                            ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        1. 官方退款申请信
                      </button>
                      <button
                        onClick={() => setRefundTemplateTab('bank')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                          refundTemplateTab === 'bank'
                            ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        2. 银行争议拒付 (双语)
                      </button>
                      <button
                        onClick={() => setRefundTemplateTab('store')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                          refundTemplateTab === 'store'
                            ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        3. 苹果/谷歌客服会话
                      </button>
                    </div>
                  </div>

                  {/* 模板内容与复制按钮 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {refundTemplateTab === 'official' && '发送至：billing@anthropic.com 与 support@anthropic.com（同时固定后续向银行举证的沟通凭据）'}
                        {refundTemplateTab === 'bank' && '适用：国内银行信用卡国际部或境外银行 App 的 Dispute 陈述栏（中英双语）'}
                        {refundTemplateTab === 'store' && '适用：苹果 Report a Problem 理由栏或 Google Play 帮助中心 Live Chat 聊天窗口'}
                      </span>
                      <button
                        onClick={() => {
                          const text =
                            refundTemplateTab === 'official'
                              ? OFFICIAL_REFUND_TEMPLATE
                              : refundTemplateTab === 'bank'
                              ? BANK_DISPUTE_TEMPLATE
                              : STORE_CHAT_TEMPLATE;
                          copyToClipboard(text, `refund-${refundTemplateTab}`);
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shrink-0"
                      >
                        {copiedKey === `refund-${refundTemplateTab}` ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey === `refund-${refundTemplateTab}` ? '已复制' : '复制当前模板'}</span>
                      </button>
                    </div>

                    <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-72">
                      <code>
                        {refundTemplateTab === 'official' && OFFICIAL_REFUND_TEMPLATE}
                        {refundTemplateTab === 'bank' && BANK_DISPUTE_TEMPLATE}
                        {refundTemplateTab === 'store' && STORE_CHAT_TEMPLATE}
                      </code>
                    </pre>
                  </div>
                </div>

                {/* 社区高频问答 (FAQ) */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
                  <h4 className="font-bold text-slate-100 text-base flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>高频问答与退款避坑要点 (FAQ)</span>
                  </h4>

                  <div className="space-y-3">
                    {REFUND_FAQS.map((faq, fIdx) => {
                      const isExp = expandedFaqIndex === fIdx;
                      return (
                        <div
                          key={fIdx}
                          className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden"
                        >
                          <div
                            onClick={() => setExpandedFaqIndex(isExp ? null : fIdx)}
                            className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-900/50 transition"
                          >
                            <div className="flex items-center gap-2.5">
                              {faq.tag && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                  {faq.tag}
                                </span>
                              )}
                              <span className="text-xs sm:text-sm font-semibold text-slate-200">
                                {faq.question}
                              </span>
                            </div>
                            {isExp ? (
                              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </div>
                          {isExp && (
                            <div className="p-3.5 pt-0 text-xs text-slate-400 border-t border-slate-800/40 bg-slate-900/20 leading-relaxed">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: 长效稳定方案 */}
        {activeTab === 'solution' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>长期稳定使用 Claude 的推荐途径</span>
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                如果您希望彻底摆脱频繁调整时区、寻找原生住宅 IP 以及担心账号变动的困扰，以下是目前主流且稳定的使用方案对比。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    方案 1：企业级中转 API 直连
                  </span>
                  <h4 className="text-base font-bold text-slate-200 mt-2">
                    第三方 API 聚合分发
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    走官方企业渠道聚合下发的 API，无需复杂代理即可直连，直接支持在 Claude Code 或 Cursor 中配置
                    <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded ml-1">
                      ANTHROPIC_BASE_URL
                    </code>
                    ，按实际 Token 计费，无账号封禁隐患。
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span>特点：低延迟 • 免梯直连</span>
                  <span className="text-emerald-400 font-medium">推荐：开发首选</span>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                    方案 2：纯净独享住宅 IP + 指纹浏览器
                  </span>
                  <h4 className="text-base font-bold text-slate-200 mt-2">
                    环境隔离防关联套件
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    采用真实海外住宅 IP，配合专业防关联指纹浏览器（自动隔离 Cookie、屏蔽字体枚举、同步海外时区与语言），保障单账号高信誉度长期使用。
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span>特点：原生度高 • 适合网页端</span>
                  <span className="text-sky-400 font-medium">推荐：Pro 深度用户</span>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                    方案 3：云端远程 Linux 开发环境
                  </span>
                  <h4 className="text-base font-bold text-slate-200 mt-2">
                    海外 VPS / GitHub Codespaces
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    在海外云服务器或 GitHub Codespaces 云端容器中直接运行 Claude Code，物理 IP 与系统环境纯天然属于海外，无需本地配置任何代理与指纹防护。
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span>特点：全原生 • 零配置门槛</span>
                  <span className="text-purple-400 font-medium">推荐：远程协作</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 底部版权 */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>Claude 从入门到维权 © 2026 • 专注于 Claude & Claude Code 环境安全自测、开通避坑与退款维权全流程指南</p>
        <p>所有测试均在本地浏览器沙箱内完成，绝不向任何第三方服务器收集或上传您的私有指纹信息。</p>
      </footer>

      {/* 海报预览与下载弹窗 */}
      {posterUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-4 flex flex-col items-center space-y-4 shadow-2xl">
            <div className="w-full flex items-center justify-between text-sm font-semibold text-slate-200">
              <span>体检报告长图已生成</span>
              <button
                onClick={() => setPosterUrl(null)}
                className="text-slate-400 hover:text-slate-100 text-base"
              >
                ✕
              </button>
            </div>
            <div className="w-full max-h-[60vh] overflow-y-auto rounded-lg border border-slate-800 shadow-inner">
              <img src={posterUrl} alt="Claude 风险体检单" className="w-full h-auto object-contain" />
            </div>
            <p className="text-xs text-slate-400 text-center">
              手机端长按可直接保存，电脑端请点击下方下载或右键复制
            </p>
            <div className="flex gap-2 w-full">
              <a
                href={posterUrl}
                download="Claude_Security_Report.png"
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>保存高清图片</span>
              </a>
              <button
                onClick={() => setPosterUrl(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
