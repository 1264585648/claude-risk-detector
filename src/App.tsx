import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Terminal,
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
  Info
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
import { POWERSHELL_CLI_SCRIPT, BASH_CLI_SCRIPT, APPEAL_TEMPLATE } from './utils/cliGuide';
import { generateReportPoster } from './utils/poster';
import { DarioCompanion } from './components/DarioCompanion';

export default function App() {
  const [activeTab, setActiveTab] = useState<'web' | 'cli' | 'guide' | 'solution'>('web');
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

  // 海报弹窗
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

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
    const { ipItem, profile } = await detectIpAndCrossCheck(currentTz);
    setNetwork(profile);

    const allItems: DetectionItem[] = [
      tzItem,
      ipItem,
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
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">安全原生</span>;
      case 'LOW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">轻度可疑</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">中度风险</span>;
      case 'HIGH':
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">高危致命</span>;
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/20">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  Claude Shield
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  封号风险体检
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                专为国内用户打造的 Claude / Claude Code 纯本地环境防封诊断
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
              浏览器体检
            </button>
            <button
              onClick={() => setActiveTab('cli')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                activeTab === 'cli'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Claude Code</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'guide'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              避坑与申诉
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'solution'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              免梯方案
            </button>
          </nav>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeTab === 'web' && (
          <div className="space-y-8">
            {/* 核心仪表盘卡片 */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* 评分圆环与大字 */}
                <div className="flex items-center gap-6 sm:gap-8">
                  <div className="relative w-36 h-36 flex items-center justify-center">
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
                      <span className="text-4xl font-extrabold tracking-tight">
                        {isScanning ? '...' : overall ? overall.totalScore : 0}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/ 100 安全分</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold tracking-tight">
                        {isScanning
                          ? '正在逐项探测指纹...'
                          : overall
                          ? overall.verdict
                          : '环境体检就绪'}
                      </h2>
                    </div>
                    <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                      {overall
                        ? overall.description
                        : '基于公开逆向报告与指纹机制，100% 本地运算检测系统时区、中文字体与 WebRTC 等。'}
                    </p>
                  </div>
                </div>

                {/* 操作按键 */}
                <div className="flex flex-wrap sm:flex-col gap-3 w-full md:w-auto">
                  <button
                    onClick={runFullScan}
                    disabled={isScanning}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? '探测中...' : '重新检测'}</span>
                  </button>

                  <button
                    onClick={handleGeneratePoster}
                    disabled={isScanning || !overall}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGeneratingPoster ? '正在绘制海报...' : '生成体检报告长图'}</span>
                  </button>
                </div>
              </div>

              {/* 致命破绽高亮提醒 */}
              {network.isTzMismatch && (
                <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-rose-200">
                    <strong className="font-semibold text-rose-400 block mb-0.5">
                      检测到致命破绽：出口 IP 属地与系统时区严重脱节！
                    </strong>
                    你的出口 IP 位于海外（{network.country}），但当前浏览器上报的时区依然是东八区中国时区。
                    这是 Claude 风控系统识别“代理违规登录”最显眼的特征，请尽快修改电脑系统时区！
                  </div>
                </div>
              )}
            </div>

            {/* 达里奥 Q 版监考官 · 随分数实时变幻夸张动作与台词 */}
            <DarioCompanion
              score={overall?.totalScore ?? 0}
              riskLevel={overall?.riskLevel ?? 'SAFE'}
              isScanning={isScanning}
              verdict={overall?.verdict ?? '环境体检就绪'}
            />

            {/* 网络与出口信息概览 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>公网出口 IP</span>
                </div>
                <div className="font-mono text-base font-semibold text-slate-200 truncate">
                  {network.ip}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span>IP 归属地与服务商</span>
                </div>
                <div className="text-base font-semibold text-slate-200 truncate">
                  {network.country} {network.city ? `• ${network.city}` : ''}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>本地系统时区</span>
                </div>
                <div className="text-base font-semibold text-slate-200 truncate">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Type className="w-4 h-4 text-purple-400" />
                  <span>IP 线路属性</span>
                </div>
                <div className="text-base font-semibold text-slate-200 truncate">
                  {network.isDatacenter ? (
                    <span className="text-rose-400">IDC 机房段 (高风控)</span>
                  ) : (
                    <span className="text-emerald-400">家庭/企业原生宽带</span>
                  )}
                </div>
              </div>
            </div>

            {/* 详细指标清单 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <span>检测信号深度明细</span>
                  <span className="text-xs text-slate-400 font-normal">
                    (点击卡片展开风控机理与一键修复方案)
                  </span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">共 {items.length} 项关键指标</span>
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
                            <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                          )}
                          <div>
                            <div className="font-semibold text-slate-200 text-sm sm:text-base">
                              {item.title}
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              当前值: {item.value}
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
                              诊断结论
                            </span>
                            <p className="text-slate-300">{item.detail}</p>
                          </div>

                          <div>
                            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                              为什么 Claude 会查这个？
                            </span>
                            <p className="text-slate-400 leading-relaxed">{item.impactReason}</p>
                          </div>

                          <div>
                            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                              如何修复与防封建议
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
            </div>
          </div>
        )}

        {/* Tab 2: Claude Code 专属自检 */}
        {activeTab === 'cli' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                <span>Claude Code 终端环境一键自测</span>
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Claude Code 命令行在本地执行时，会直接读取您操作系统的终端环境变量、本地 Git 邮箱、时区等参数。
                复制下方自测命令在终端运行，即可 3 秒内识别终端级破绽。
              </p>
            </div>

            {/* Windows PowerShell 脚本 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-500"></span>
                  <span className="font-semibold text-slate-200 text-sm">
                    Windows 用户 (PowerShell 一键脚本)
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(POWERSHELL_CLI_SCRIPT, 'ps-script')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
                >
                  {copiedKey === 'ps-script' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'ps-script' ? '已复制完整脚本' : '复制代码'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-60">
                <code>{POWERSHELL_CLI_SCRIPT}</code>
              </pre>
            </div>

            {/* macOS / Linux Bash 脚本 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-slate-200 text-sm">
                    macOS / Linux 用户 (Bash 一键脚本)
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(BASH_CLI_SCRIPT, 'bash-script')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
                >
                  {copiedKey === 'bash-script' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'bash-script' ? '已复制完整脚本' : '复制代码'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-60">
                <code>{BASH_CLI_SCRIPT}</code>
              </pre>
            </div>

            {/* 核心风控原理揭秘 */}
            <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2 text-sm">
              <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>Claude Code 逆向曝光核心细节</span>
              </h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1 leading-relaxed text-xs sm:text-sm">
                <li>
                  <strong>时区隐写</strong>：Claude Code 会读取系统的时区（如 Asia/Shanghai），并作为系统元数据隐写进每次发给 API 的 Prompt 中。
                </li>
                <li>
                  <strong>Git 仓库元数据</strong>：若当前项目 Git 配置了 QQ/163/Foxmail 等国产邮箱，或提交日志包含大量敏感中文标签，会被作为关联依据。
                </li>
                <li>
                  <strong>中转 Hostname 嗅探</strong>：若中转代理的域名包含明显特征（如国内备案域名、特定免费二级域名），会直接触发异常打标。
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: 避坑与申诉 SOP */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Claude 封号类型速查与解封申诉</span>
              </h3>
              <p className="text-sm text-slate-400">
                很多用户以为遇到 403 就是账号废了，其实封号分很多种，对症下药才能挽回账号。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  类型 1：地区阻断 (403)
                </span>
                <h4 className="font-bold text-slate-200">App unavailable in your region</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>表现</strong>：登录页或对话框弹出不支持提示。
                  <br />
                  <strong>本质</strong>：仅为当前节点 IP 被 Cloudflare 识别为不支持国家或机房黑名单。账号本身完好！换一个冷门原生节点即可恢复。
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  类型 2：订阅强制退款
                </span>
                <h4 className="font-bold text-slate-200">Subscription Cancelled / Refunded</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>表现</strong>：Pro 状态失效，收到 Stripe 退款邮件。
                  <br />
                  <strong>本质</strong>：支付所用的虚拟信用卡（BIN 卡头）被批量标记。账号本身免费可用，重新绑定合规的海外实体卡即可续费。
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  类型 3：彻底封禁
                </span>
                <h4 className="font-bold text-slate-200">Account Disabled / Suspended</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>表现</strong>：无法登录，提示账户已被禁用。
                  <br />
                  <strong>本质</strong>：多次违规判定或触发严重风控。唯有通过官方申诉渠道提交英文申诉信，方有概率解封。
                </p>
              </div>
            </div>

            {/* 英文申诉信模版 */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">
                    官方高成功率英文申诉邮件模版 (Appeal Email)
                  </h4>
                  <p className="text-xs text-slate-400">
                    适用于通过 claude.ai 申诉入口或向 support@anthropic.com 发送
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(APPEAL_TEMPLATE, 'appeal')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  {copiedKey === 'appeal' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'appeal' ? '已复制模版' : '一键复制申诉信'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                {APPEAL_TEMPLATE}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 4: 国内免梯方案与商业化承接 */}
        {activeTab === 'solution' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>国内稳定使用 Claude 的长效方案</span>
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                如果您实在厌倦了随时改时区、找纯净住宅 IP、担心 Pro 账号被封，以下是国内开发者目前最主流的合规长效平替途径。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    推荐方案 1：企业级中转 API (Claude Code / Cursor 直连)
                  </span>
                  <h4 className="text-base font-bold text-slate-200 mt-2">
                    第三方免翻 API 转发平台
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    走官方企业合作渠道聚合下发的 API，无需挂梯子即可直连，直接支持配置在 Claude Code 的
                    <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded ml-1">
                      ANTHROPIC_BASE_URL
                    </code>
                    ，按量扣费，彻底消除封号恐惧。
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span>特点：低延迟 • 零风控 • 极速配置</span>
                  <span className="text-amber-400 font-medium">商业合作位预留</span>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                    推荐方案 2：纯净独享住宅代理 + 指纹浏览器
                  </span>
                  <h4 className="text-base font-bold text-slate-200 mt-2">
                    多账号专业防关联套件
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    采用海外真实原生住宅 IP，配合专业防关联指纹浏览器（自动隔离 Cookie、屏蔽字体泄露、锁定系统时区与语言），保证单账号高权重长期存活。
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span>适合：Claude Pro 深度订阅者 • 团队运营</span>
                  <span className="text-amber-400 font-medium">Affiliate 赞助位</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 底部版权 */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>Claude Shield © 2026 • 专注于 Claude 环境风险诊断与技术合规参考</p>
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
