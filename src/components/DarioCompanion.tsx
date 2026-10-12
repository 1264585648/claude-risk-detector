import React, { useState, useEffect } from 'react';
import type { RiskLevel } from '../types';
import { HelpCircle, Coffee, ShieldCheck, Flame, Cpu, Lightbulb, RefreshCw } from 'lucide-react';

interface DarioCompanionProps {
  score: number;
  riskLevel: RiskLevel;
  isScanning: boolean;
  verdict: string;
}

type DarioStateKey = 'scanning' | 'safe' | 'good' | 'warning' | 'danger';

interface DarioMoodConfig {
  key: DarioStateKey;
  image: string;
  badge: string;
  badgeColor: string;
  glowColor: string;
  animClass: string;
  title: string;
  tips: string[];
}

const DARIO_CONFIGS: Record<DarioStateKey, DarioMoodConfig> = {
  scanning: {
    key: 'scanning',
    image: '/dario/dario-scanning.png',
    badge: '全面诊断中',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    glowColor: 'from-cyan-500/20 to-blue-500/5',
    animClass: 'animate-dario-scan',
    title: '安全顾问正在全面诊断您的环境特征...',
    tips: [
      '正在本地沙箱中逐项探测网络出口、系统时区、中文字体与 WebRTC 穿透特征，请稍候。',
      '所有检测逻辑 100% 在您本机浏览器完成，绝不会向任何第三方云端上传您的隐私指纹。'
    ]
  },
  safe: {
    key: 'safe',
    image: '/dario/dario-safe.png',
    badge: '极佳 · 原生海外环境',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    glowColor: 'from-emerald-500/20 to-amber-500/10',
    animClass: 'animate-dario-bounce',
    title: '检测完成，您的环境处于最佳安全状态',
    tips: [
      '您的出口 IP、系统时区与浏览器指纹高度匹配海外原生环境，未发现明显受限特征。',
      '可放心使用 Claude 网页端及 Claude Code 进行高强度编码工作，保持当前网络状态即可。',
      '建议固定使用当前优质节点，避免在短时间内频繁跨国切换线路。'
    ]
  },
  good: {
    key: 'good',
    image: '/dario/dario-good.png',
    badge: '良好 · 配置基本合规',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    glowColor: 'from-sky-500/20 to-indigo-500/5',
    animClass: 'animate-dario-chill',
    title: '网络基本合规，日常使用较为平稳',
    tips: [
      '核心网络出口与本地时区已基本对应，可正常进行日常对话与轻量开发。',
      '若后续准备订阅 Pro 计划，建议搭配可靠的海外支付方式，避免使用被批量标记的虚拟卡号。',
      '注意不要在多个设备或网络环境中同时频繁并发请求，以维持账号的高信誉度。'
    ]
  },
  warning: {
    key: 'warning',
    image: '/dario/dario-warning.png',
    badge: '中度风险 · 建议排查优化',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    glowColor: 'from-amber-500/20 to-orange-500/5',
    animClass: 'animate-dario-doubt',
    title: '发现部分环境痕迹，建议进行针对性优化',
    tips: [
      '当前节点虽能连通，但检测到浏览器首选语言为中文，建议调整为 English 以减少 Cloudflare 验证码弹窗。',
      '检测到当前使用的出口可能属于云厂商数据中心 IP，这类 IP 容易被风控系统提高关注权重。',
      '如需长时间进行自动化代码生成，建议考虑使用第三方 API 直连方案以获得更长效的稳定性。'
    ]
  },
  danger: {
    key: 'danger',
    image: '/dario/dario-danger.png',
    badge: '高风险 · 建议优先处理',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    glowColor: 'from-rose-500/25 to-red-600/10',
    animClass: 'animate-dario-panic',
    title: '检测到明显的环境冲突，存在触发风控拦截的隐患',
    tips: [
      '系统本地时区（东八区）与海外出口节点不匹配，这是 Claude 平台最容易识别的跨区代理特征，建议优先修改电脑时区。',
      '请先不要进行登录或高频操作，建议通过下方的一键修复命令将系统时区与节点同步后再使用。',
      '若使用 Claude Code 终端工具，请确认已在终端配置代理环境变量或开启代理工具的 TUN 虚拟网卡模式。'
    ]
  }
};

export const DarioCompanion: React.FC<DarioCompanionProps> = ({
  score,
  riskLevel,
  isScanning,
  verdict
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [showPokeBubble, setShowPokeBubble] = useState(false);

  // 决定当前生效的状态
  const currentStateKey: DarioStateKey = isScanning
    ? 'scanning'
    : score >= 90 && riskLevel === 'SAFE'
    ? 'safe'
    : score >= 70
    ? 'good'
    : score >= 45 && riskLevel !== 'CRITICAL'
    ? 'warning'
    : 'danger';

  const config = DARIO_CONFIGS[currentStateKey];

  // 状态改变时重置贴士索引
  useEffect(() => {
    setTipIndex(0);
  }, [currentStateKey]);

  // 点击互动彩蛋
  const handlePoke = () => {
    setTipIndex((prev) => (prev + 1) % config.tips.length);
    setShowPokeBubble(true);
    setTimeout(() => setShowPokeBubble(false), 2400);
  };

  const handleNextTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTipIndex((prev) => (prev + 1) % config.tips.length);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md shadow-xl transition-all">
      {/* 动态柔和光晕背景 */}
      <div
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none bg-gradient-to-br ${config.glowColor} transition-all duration-700`}
      />

      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 relative z-10">
        {/* 左侧：达里奥形象 */}
        <div
          onClick={handlePoke}
          className="group relative cursor-pointer select-none shrink-0"
          title="点击达里奥形象切换排查贴士"
        >
          {/* 头像光环底座 */}
          <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-lg group-hover:bg-amber-400/20 transition-all" />

          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner group-hover:scale-105 active:scale-95 transition-transform duration-200">
            {showPokeBubble && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-bold text-xs shadow-lg animate-bounce z-20 whitespace-nowrap">
                💡 贴士已切换！
              </span>
            )}
            <img
              src={config.image}
              alt={`达里奥顾问-${config.badge}`}
              className={`w-full h-full object-contain filter drop-shadow-md ${config.animClass}`}
            />
            <span className="absolute bottom-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-400 border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-opacity">
              点我互动
            </span>
          </div>
        </div>

        {/* 右侧：专业贴心的诊断建议卡片 */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1.5 ${config.badgeColor}`}
              >
                {currentStateKey === 'scanning' && <Cpu className="w-3.5 h-3.5 animate-spin" />}
                {currentStateKey === 'safe' && <ShieldCheck className="w-3.5 h-3.5" />}
                {currentStateKey === 'good' && <Coffee className="w-3.5 h-3.5" />}
                {currentStateKey === 'warning' && <HelpCircle className="w-3.5 h-3.5" />}
                {currentStateKey === 'danger' && <Flame className="w-3.5 h-3.5 text-rose-400" />}
                {config.badge}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                达里奥安全点评：{verdict}
              </span>
            </div>

            <button
              onClick={handleNextTip}
              className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition px-2 py-1 rounded-md hover:bg-slate-800/60"
            >
              <RefreshCw className="w-3 h-3" />
              <span>换一条建议 ({tipIndex + 1}/{config.tips.length})</span>
            </button>
          </div>

          {/* 顾问建议对话框 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 shadow-md">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5 text-amber-400">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-amber-300/90">
                  首席安全顾问 · 达里奥分析贴士
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {config.tips[tipIndex]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
