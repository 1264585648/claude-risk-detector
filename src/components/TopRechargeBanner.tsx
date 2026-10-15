import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, X } from 'lucide-react';

const STORAGE_KEY = 'hide_ai_card_banner_claude';
const HIDE_DURATION_MS = 24 * 60 * 60 * 1000; // 24小时不再提示

export const TopRechargeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      if (!dismissedAt) {
        setIsVisible(true);
      } else {
        const timeElapsed = Date.now() - parseInt(dismissedAt, 10);
        if (timeElapsed > HIDE_DURATION_MS) {
          setIsVisible(true);
        }
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // ignore
    }
  };

  if (!isVisible) return null;

  return (
    <div className="relative z-50 bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-slate-900/90 border-b border-amber-500/30 px-3 py-2 text-xs sm:text-sm text-amber-200 shadow-sm backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* 左侧及文案区域 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 text-[11px]">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>特惠通道</span>
          </span>
          <p className="truncate text-slate-200">
            <strong className="text-amber-300 font-medium">各种 AI 代充 · 价格优惠：</strong>
            <span className="text-slate-300">支持 ChatGPT Plus / Claude Pro / Cursor / Gemini 优惠代充，秒级发货</span>
          </p>
        </div>

        {/* 右侧行动按钮与关闭按钮 */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="http://aieli.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-sm shadow-amber-900/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>前往 ai小店</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={handleDismiss}
            aria-label="关闭提示"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
