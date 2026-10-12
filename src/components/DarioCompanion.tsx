import React, { useState, useEffect } from 'react';
import type { RiskLevel } from '../types';
import { Sparkles, HelpCircle, Coffee, ShieldCheck, Flame, Cpu } from 'lucide-react';

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
  headline: string;
  quotes: string[];
  actionDesc: string;
}

const DARIO_CONFIGS: Record<DarioStateKey, DarioMoodConfig> = {
  scanning: {
    key: 'scanning',
    image: '/dario/dario-scanning.png',
    badge: '六手黑客 · 狂暴排查',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    glowColor: 'from-cyan-500/20 to-blue-500/5',
    animClass: 'animate-dario-scan',
    headline: '六手残影狂敲键盘！正在底层渗透你的网络特征……',
    actionDesc: '六臂全息极速渗透，激光眼死锁 WebRTC 泄漏！',
    quotes: [
      '“别动！我的六只手正在以 1200 WPM 狂敲代码核查你的时区底牌！”',
      '“机械瞄准镜全开！中文字体、系统编码、WebRTC 破绽一个都跑不掉！”',
      '“正在向 Anthropic 风控核心实时比对指纹，深呼吸，马上出判决！”'
    ]
  },
  safe: {
    key: 'safe',
    image: '/dario/dario-safe.png',
    badge: '星星眼狂喜 · 纯度 100%',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    glowColor: 'from-emerald-500/20 to-amber-500/10',
    animClass: 'animate-dario-bounce',
    headline: '达里奥喜极而泣！高举 100 分黄金盾牌大奖杯！',
    actionDesc: '眼冒金星喜极而泣，彩虹漫天，颁发 Anthropic 免死金牌！',
    quotes: [
      '“太牛啦！！眼里全是金星星！这纯度比我在旧金山总部的电脑还要原生！”',
      '“达里奥亲自给你颁发免死金牌！Claude 3.5 Sonnet / Opus 尽管全速输出！”',
      '“我宣布：你就是 Anthropic 驻国内荣誉首席极客！免封认证已盖章！”'
    ]
  },
  good: {
    key: 'good',
    image: '/dario/dario-good.png',
    badge: '单手推墨镜 · 牙齿闪光',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    glowColor: 'from-sky-500/20 to-indigo-500/5',
    animClass: 'animate-dario-chill',
    headline: '帅气推下墨镜，叮~ 一声牙齿闪光，咖啡走起！',
    actionDesc: '单手扶黑超抛媚眼，手比爱心手枪，悠闲啜饮热拿铁！',
    quotes: [
      '“推下墨镜~ (✨叮！) 兄弟这环境调得相当可以，喝杯咖啡淡定写代码！”',
      '“大体骨骼惊奇，封号概率极低！平时别多台设备同时乱跳就行~”',
      '“稳如老狗！Anthropic 典藏版咖啡分你一半，放手去 Coding 吧！”'
    ]
  },
  warning: {
    key: 'warning',
    image: '/dario/dario-warning.png',
    badge: '柯南推镜 · 巨眼狐疑',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    glowColor: 'from-amber-500/20 to-orange-500/5',
    animClass: 'animate-dario-doubt',
    headline: '放大镜把眼珠放大十倍！镜片反光一闪：真相只有一个！',
    actionDesc: '巨大凸透镜死死凝视，镜片反光闪瞎，摸下巴审视中文字体！',
    quotes: [
      '“（推眼镜白光一闪）等等……这超大放大镜可不是摆设，我嗅到了国内字体的气息！”',
      '“你的 IP 虽然挂在美西，但系统字体和语言直接把你的定位给出卖了！”',
      '“普通摸鱼可能还没事，要是高强度跑 Claude Code，风控分分钟给你挂黄牌！”'
    ]
  },
  danger: {
    key: 'danger',
    image: '/dario/dario-danger.png',
    badge: '《呐喊》炸毛 · 踩警报尖叫',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    glowColor: 'from-rose-500/25 to-red-600/10',
    animClass: 'animate-dario-panic',
    headline: '抱头触电炸毛！泪流成河！脚踩红灯大喊“ACK! STOP!”',
    actionDesc: '卷发触电冒火花，眼泪狂飙，头顶猩红 BAN 封号大印章！',
    quotes: [
      '“快停手啊啊啊！！ACK! STOP! 卷发都给我吓炸毛了！你的 IP 和系统时区完全对不上！！”',
      '“风控警报已经在办公室响破天了！再敢点一次发送，立刻喜提永久封禁！！”',
      '“救命！快看下方红色急救指南！赶紧改系统时区和语言，晚一秒号就没了！！”'
    ]
  }
};

export const DarioCompanion: React.FC<DarioCompanionProps> = ({
  score,
  riskLevel,
  isScanning,
  verdict
}) => {
  // 支持手动体验各档位夸张表情的预览模式
  const [previewState, setPreviewState] = useState<DarioStateKey | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [pokeCount, setPokeCount] = useState(0);
  const [showPokeBubble, setShowPokeBubble] = useState(false);

  // 决定当前生效的状态
  const currentStateKey: DarioStateKey = previewState
    ? previewState
    : isScanning
    ? 'scanning'
    : score >= 90 && riskLevel === 'SAFE'
    ? 'safe'
    : score >= 70
    ? 'good'
    : score >= 40 && riskLevel !== 'CRITICAL'
    ? 'warning'
    : 'danger';

  const config = DARIO_CONFIGS[currentStateKey];

  // 状态改变时重置台词索引
  useEffect(() => {
    setQuoteIndex(0);
  }, [currentStateKey]);

  // 点击达里奥触发互动彩蛋
  const handlePokeDario = () => {
    setPokeCount((c) => c + 1);
    setQuoteIndex((prev) => (prev + 1) % config.quotes.length);
    setShowPokeBubble(true);
    setTimeout(() => setShowPokeBubble(false), 2600);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900/95 via-slate-950/90 to-slate-900/90 p-5 sm:p-6 backdrop-blur-xl shadow-2xl transition-all">
      {/* 动态光晕背景 */}
      <div
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none bg-gradient-to-br ${config.glowColor} transition-all duration-700`}
      />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        {/* 左侧：夸张 Q 版达里奥全身立绘与动作展示 */}
        <div className="flex flex-col items-center sm:flex-row gap-5 text-center sm:text-left">
          <div
            onClick={handlePokeDario}
            className="group relative cursor-pointer select-none"
            title="戳一戳达里奥，听听他想说什么！"
          >
            {/* 角色底座光环 */}
            <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl group-hover:bg-amber-400/20 transition-all" />

            {/* 形象图片主体 */}
            <div
              className={`relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center p-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-inner group-hover:scale-105 active:scale-95 transition-transform duration-200`}
            >
              {showPokeBubble && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-bold text-xs shadow-lg animate-bounce z-20 whitespace-nowrap">
                  💥 哎呀别戳我！
                </span>
              )}
              <img
                src={config.image}
                alt={`Q版达里奥-${config.badge}`}
                className={`w-full h-full object-contain filter drop-shadow-xl ${config.animClass}`}
              />

              {/* 互动提示角标 */}
              <span className="absolute bottom-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-400 border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-opacity">
                戳我互动 👆
              </span>
            </div>
          </div>

          {/* 角色状态与气泡台词 */}
          <div className="flex-1 max-w-lg space-y-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold border flex items-center gap-1.5 shadow-sm ${config.badgeColor}`}
              >
                {currentStateKey === 'scanning' && <Cpu className="w-3.5 h-3.5 animate-spin" />}
                {currentStateKey === 'safe' && <ShieldCheck className="w-3.5 h-3.5" />}
                {currentStateKey === 'good' && <Coffee className="w-3.5 h-3.5" />}
                {currentStateKey === 'warning' && <HelpCircle className="w-3.5 h-3.5" />}
                {currentStateKey === 'danger' && <Flame className="w-3.5 h-3.5 text-rose-400" />}
                {config.badge}
              </span>

              <span className="text-xs text-slate-400 font-mono">
                判定：{verdict || '环境体检中'}
              </span>

              {pokeCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">
                  已互动 {pokeCount} 次
                </span>
              )}
            </div>

            {/* 夸张台词对话气泡 */}
            <div
              key={`${currentStateKey}-${quoteIndex}`}
              className="relative p-3.5 sm:p-4 rounded-xl bg-slate-800/90 border border-slate-700/70 text-slate-100 shadow-lg animate-speech-pop"
            >
              {/* 小三角气泡尾巴 */}
              <div className="hidden sm:block absolute -left-2 top-6 w-3 h-3 bg-slate-800 border-l border-b border-slate-700/70 transform rotate-45" />

              <div className="flex items-start gap-2">
                <span className="text-amber-400 text-lg leading-none">💬</span>
                <div>
                  <p className="text-xs text-amber-400/90 font-bold mb-1">
                    达里奥 · 实时心声（点击角色切换台词）：
                  </p>
                  <p className="text-sm font-medium text-slate-200 leading-snug">
                    {config.quotes[quoteIndex]}
                  </p>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                <span>动作：{config.actionDesc}</span>
                <button
                  onClick={handlePokeDario}
                  className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition"
                >
                  换句骚话 ↻
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：体验各档位夸张反应的快捷试演面板 */}
        <div className="w-full lg:w-auto flex flex-col gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              达里奥动作试演台
            </span>
            {previewState && (
              <button
                onClick={() => setPreviewState(null)}
                className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition"
              >
                切回真实体检 ↺
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5 text-xs">
            <button
              onClick={() => setPreviewState('safe')}
              className={`px-3 py-1.5 rounded-lg font-medium text-left transition flex items-center justify-between gap-2 ${
                currentStateKey === 'safe'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <span>🌟 满分 100 分</span>
              <span className="text-[10px] text-emerald-400 font-mono">星星眼狂喜</span>
            </button>

            <button
              onClick={() => setPreviewState('good')}
              className={`px-3 py-1.5 rounded-lg font-medium text-left transition flex items-center justify-between gap-2 ${
                currentStateKey === 'good'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <span>☕ 80 分稳健</span>
              <span className="text-[10px] text-sky-400 font-mono">推墨镜闪牙</span>
            </button>

            <button
              onClick={() => setPreviewState('warning')}
              className={`px-3 py-1.5 rounded-lg font-medium text-left transition flex items-center justify-between gap-2 ${
                currentStateKey === 'warning'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <span>🧐 55 分疑似</span>
              <span className="text-[10px] text-amber-400 font-mono">巨眼放大镜</span>
            </button>

            <button
              onClick={() => setPreviewState('danger')}
              className={`px-3 py-1.5 rounded-lg font-medium text-left transition flex items-center justify-between gap-2 ${
                currentStateKey === 'danger'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <span>🚨 20 分高危</span>
              <span className="text-[10px] text-rose-400 font-mono">抱头触电尖叫</span>
            </button>

            <button
              onClick={() => setPreviewState('scanning')}
              className={`px-3 py-1.5 rounded-lg font-medium text-left transition flex items-center justify-between gap-2 col-span-2 sm:col-span-1 ${
                currentStateKey === 'scanning'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <span>⚡ 实时探测</span>
              <span className="text-[10px] text-cyan-400 font-mono">六手狂暴敲键</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
