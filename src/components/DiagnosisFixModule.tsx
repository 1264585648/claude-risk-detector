import { useState, useMemo } from 'react';
import {
  Wrench,
  Copy,
  Check,
  Terminal,
  FileText,
  AlertTriangle,
  ShieldCheck,
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
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
          <Wrench className="w-4 h-4 animate-spin text-amber-400" />
          <span>正在生成对应的环境配置与修复脚本...</span>
        </div>
      </div>
    );
  }

  const criticalIssuesCount = overall.criticalIssues.length;
  const hasMismatch = network.isTzMismatch;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md space-y-4">
      {/* 头部：标题与诊断概括 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              环境修复与终端配置脚本
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
              一键配置
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            根据探测到的出口节点（{network.country || '海外'}）与环境特征，生成匹配的系统时区调整与终端环境变量命令。
          </p>
        </div>

        {/* 修复状态摘要 */}
        <div className="flex items-center gap-2 shrink-0">
          {criticalIssuesCount > 0 || hasMismatch ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>检测到 {criticalIssuesCount > 0 ? criticalIssuesCount : '1'} 项需注意差异</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>环境基本匹配，可按需配置</span>
            </div>
          )}
        </div>
      </div>

      {/* 参数提要 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/90 flex items-start gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-slate-200">目标时区匹配</div>
            <div className="text-slate-400 mt-0.5 font-mono text-[11px]">
              {tzRecommendation.tzName}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/90 flex items-start gap-2">
          <Terminal className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-slate-200">终端环境变量</div>
            <div className="text-slate-400 mt-0.5 text-[11px]">
              设置 TZ、UTF-8 字符集与代理端口
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/90 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-slate-200">本地执行安全</div>
            <div className="text-slate-400 mt-0.5 text-[11px]">
              纯本地命令，仅刷新缓存与变量
            </div>
          </div>
        </div>
      </div>

      {/* 平台选项卡与复制按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveFixTab('powershell')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeFixTab === 'powershell'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>PowerShell (Windows)</span>
          </button>

          <button
            onClick={() => setActiveFixTab('bash')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeFixTab === 'bash'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Bash (macOS / Linux)</span>
          </button>

          <button
            onClick={() => setActiveFixTab('oneliner')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeFixTab === 'oneliner'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>单行命令</span>
          </button>

          <button
            onClick={() => setActiveFixTab('markdown')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
              activeFixTab === 'markdown'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>Markdown 报告</span>
          </button>
        </div>

        {/* 复制按钮 */}
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
          className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 shrink-0"
        >
          {copiedKey === `fix-main-${activeFixTab}` ? (
            <>
              <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
              <span>已复制</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-950" />
              <span>
                {activeFixTab === 'markdown'
                  ? '复制 Markdown 报告'
                  : activeFixTab === 'oneliner'
                  ? '复制单行命令'
                  : '复制修复脚本'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* 代码预览展示区 */}
      <div className="relative rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
        {activeFixTab === 'oneliner' ? (
          <div className="p-3.5 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-medium text-sky-400">Windows PowerShell 单行：</span>
                <button
                  onClick={() => copyToClipboard(oneLinerPs, 'ol-ps')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition"
                >
                  {copiedKey === 'ol-ps' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'ol-ps' ? '已复制' : '复制'}</span>
                </button>
              </div>
              <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto whitespace-pre-wrap">
                <code>{oneLinerPs}</code>
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-medium text-emerald-400">macOS / Linux Bash 单行：</span>
                <button
                  onClick={() => copyToClipboard(oneLinerBash, 'ol-bash')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition"
                >
                  {copiedKey === 'ol-bash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'ol-bash' ? '已复制' : '复制'}</span>
                </button>
              </div>
              <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                <code>{oneLinerBash}</code>
              </pre>
            </div>
          </div>
        ) : (
          <pre className="p-3.5 font-mono text-xs text-slate-300 overflow-x-auto max-h-72 leading-relaxed">
            <code>
              {activeFixTab === 'powershell' && powerShellScript}
              {activeFixTab === 'bash' && bashScript}
              {activeFixTab === 'markdown' && markdownReport}
            </code>
          </pre>
        )}
      </div>

      {/* 底部使用提示 */}
      <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          {activeFixTab === 'powershell' && '提示：修改系统全局时区需要管理员权限；环境变量仅对当前 PowerShell 窗口生效。'}
          {activeFixTab === 'bash' && '提示：export 变量仅在当前终端生效，如需常驻可写入 ~/.zshrc 或 ~/.bashrc。'}
          {activeFixTab === 'oneliner' && '提示：单行命令可直接粘贴至终端回车执行。'}
          {activeFixTab === 'markdown' && '提示：包含当前完整的指纹测试项、当前值与优化建议。'}
        </span>
      </div>
    </div>
  );
}
