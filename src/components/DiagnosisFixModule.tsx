import { useState, useMemo } from 'react';
import {
  Wrench,
  Copy,
  Check,
  Terminal,
  FileText,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import type { DetectionItem, NetworkProfile, OverallResult } from '../types';
import {
  generatePowerShellFix,
  generateBashFix,
  generateOneLiner,
  generateMarkdownReport,
  getRecommendedTimezone
} from '../utils/fixGenerator';

interface DiagnosisFixModuleProps {
  overall: OverallResult | null;
  items: DetectionItem[];
  network: NetworkProfile;
  isScanning: boolean;
}

export function DiagnosisFixModule({
  overall,
  items,
  network,
  isScanning
}: DiagnosisFixModuleProps) {
  const [activeFixTab, setActiveFixTab] = useState<'powershell' | 'bash' | 'oneliner' | 'markdown'>('powershell');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const tzRecommendation = useMemo(() => getRecommendedTimezone(network), [network]);

  const powerShellScript = useMemo(() => {
    if (!overall) return '';
    return generatePowerShellFix(overall, items, network);
  }, [overall, items, network]);

  const bashScript = useMemo(() => {
    if (!overall) return '';
    return generateBashFix(overall, items, network);
  }, [overall, items, network]);

  const oneLinerPs = useMemo(() => generateOneLiner(network, 'windows'), [network]);
  const oneLinerBash = useMemo(() => generateOneLiner(network, 'mac'), [network]);

  const markdownReport = useMemo(() => {
    if (!overall) return '';
    return generateMarkdownReport(overall, items, network);
  }, [overall, items, network]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  if (!overall || isScanning) {
    return (
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 animate-pulse text-center">
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
          <Wrench className="w-4 h-4 animate-spin text-amber-400" />
          <span>正在生成专属修复方案与终端配置脚本...</span>
        </div>
      </div>
    );
  }

  const criticalIssuesCount = overall.criticalIssues.length;
  const hasMismatch = network.isTzMismatch;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 sm:p-7 backdrop-blur-xl shadow-2xl space-y-5">
      {/* 头部：标题与诊断概括 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>诊断结论与一键复制修复版</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                即拷即用
              </span>
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            根据您当前的出口属地（{network.country || '海外'}）、时区及各项指纹特征，动态合成针对性修复命令。
          </p>
        </div>

        {/* 修复状态摘要小标 */}
        <div className="flex items-center gap-2 shrink-0">
          {criticalIssuesCount > 0 || hasMismatch ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>发现 {criticalIssuesCount > 0 ? criticalIssuesCount : '1'} 项需排查风险</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>各项指标优良，可复制保活脚本</span>
            </div>
          )}
        </div>
      </div>

      {/* 智能匹配提示 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-200">智能对齐时区</div>
            <div className="text-slate-400 mt-0.5">
              已根据节点为您推荐 <code className="text-amber-300">{tzRecommendation.tzName}</code>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2">
          <Terminal className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-200">Claude Code 终端注资</div>
            <div className="text-slate-400 mt-0.5">注入海外 TZ、UTF-8 字符集与代理环境变量</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-200">纯本地安全保证</div>
            <div className="text-slate-400 mt-0.5">代码透明开源，仅调用原生命令刷新 DNS 与时区</div>
          </div>
        </div>
      </div>

      {/* 修复版本选项卡切换 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveFixTab('powershell')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeFixTab === 'powershell'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Windows (PowerShell)</span>
          </button>

          <button
            onClick={() => setActiveFixTab('bash')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeFixTab === 'bash'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>macOS / Linux (Bash)</span>
          </button>

          <button
            onClick={() => setActiveFixTab('oneliner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeFixTab === 'oneliner'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>单行极速版 (One-Liner)</span>
          </button>

          <button
            onClick={() => setActiveFixTab('markdown')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeFixTab === 'markdown'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>完整报告 (Markdown)</span>
          </button>
        </div>

        {/* 顶部主复制按钮 */}
        <button
          onClick={() => {
            const content =
              activeFixTab === 'powershell'
                ? powerShellScript
                : activeFixTab === 'bash'
                ? bashScript
                : activeFixTab === 'oneliner'
                ? `${oneLinerPs}\n\n# macOS / Linux:\n${oneLinerBash}`
                : markdownReport;
            copyToClipboard(content, `fix-main-${activeFixTab}`);
          }}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 shrink-0"
        >
          {copiedKey === `fix-main-${activeFixTab}` ? (
            <>
              <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>已复制到剪贴板！</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-950" />
              <span>
                {activeFixTab === 'markdown'
                  ? '一键复制 Markdown 诊断报告'
                  : activeFixTab === 'oneliner'
                  ? '一键复制单行修复命令'
                  : '一键复制完整修复脚本'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* 代码预览展示区 */}
      <div className="relative rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-inner">
        {activeFixTab === 'oneliner' ? (
          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold text-sky-400">Windows PowerShell 单行执行：</span>
                <button
                  onClick={() => copyToClipboard(oneLinerPs, 'ol-ps')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition"
                >
                  {copiedKey === 'ol-ps' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'ol-ps' ? '已复制' : '复制命令'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto whitespace-pre-wrap">
                <code>{oneLinerPs}</code>
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold text-emerald-400">macOS / Linux Bash 单行执行：</span>
                <button
                  onClick={() => copyToClipboard(oneLinerBash, 'ol-bash')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition"
                >
                  {copiedKey === 'ol-bash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'ol-bash' ? '已复制' : '复制命令'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                <code>{oneLinerBash}</code>
              </pre>
            </div>
          </div>
        ) : (
          <pre className="p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-72 leading-relaxed selection:bg-amber-500/20">
            <code>
              {activeFixTab === 'powershell' && powerShellScript}
              {activeFixTab === 'bash' && bashScript}
              {activeFixTab === 'markdown' && markdownReport}
            </code>
          </pre>
        )}
      </div>

      {/* 底部使用提示与安全说明 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 pt-1">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {activeFixTab === 'powershell' && '提示：按 Win+X 启动 PowerShell 粘贴执行即可；修改系统时区需管理员权限。'}
            {activeFixTab === 'bash' && '提示：在 Terminal 终端中粘贴执行；export 变量仅在当前终端窗口有效。'}
            {activeFixTab === 'oneliner' && '提示：极简单行已包含时区、编码与 DNS 清理，可秒速生效。'}
            {activeFixTab === 'markdown' && '提示：包含完整体检指标与分值，可直接粘贴至笔记或发给 AI 助手分析。'}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>无任何网络侵入</span>
          </span>
        </div>
      </div>
    </div>
  );
}
