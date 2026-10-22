import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  Check,
  Copy,
  Zap,
  Target,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
  Flame,
  Search,
  BookOpen,
  DollarSign,
  AlertOctagon,
} from 'lucide-react';
import type { HeadlineCandidateItem } from '../utils/headlineEngine';
import { generateFiveDimensionalHeadlines } from '../utils/headlineEngine';

interface AlternativeTitlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  seedTopic: string;
  coreAngle?: string;
  contentSummary?: string;
  onSelectTitle: (newTitle: string) => void;
  apiConfig?: any;
}

const DIMENSION_COLOR_MAP: Record<
  HeadlineCandidateItem['dimension'],
  {
    badgeBg: string;
    badgeText: string;
    border: string;
    icon: React.ReactNode;
    tagLabel: string;
  }
> = {
  contrast: {
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-400',
    border: 'border-rose-500/30 hover:border-rose-500/60',
    icon: <Flame className="w-4 h-4 text-rose-400" />,
    tagLabel: '认知反差 · 打脸逆袭',
  },
  finance: {
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
    tagLabel: '商业算账 · 利益链揭秘',
  },
  practical: {
    badgeBg: 'bg-indigo-500/15',
    badgeText: 'text-indigo-400',
    border: 'border-indigo-500/30 hover:border-indigo-500/60',
    icon: <BookOpen className="w-4 h-4 text-indigo-400" />,
    tagLabel: '颠覆门槛 · 保姆级SOP',
  },
  warning: {
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-400',
    border: 'border-amber-500/30 hover:border-amber-500/60',
    icon: <AlertOctagon className="w-4 h-4 text-amber-400" />,
    tagLabel: '窗口预警 · 生存底牌',
  },
  seo: {
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-400',
    border: 'border-cyan-500/30 hover:border-cyan-500/60',
    icon: <Search className="w-4 h-4 text-cyan-400" />,
    tagLabel: '搜一搜吸量 · SEO长尾',
  },
};

export const AlternativeTitlesModal: React.FC<AlternativeTitlesModalProps> = ({
  isOpen,
  onClose,
  currentTitle,
  seedTopic,
  coreAngle,
  contentSummary,
  onSelectTitle,
  apiConfig,
}) => {
  const [candidates, setCandidates] = useState<HeadlineCandidateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({});

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pipeline/generate-alternative-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTitle || seedTopic,
          coreAngle,
          contentSummary,
          apiConfig,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.candidates) && data.candidates.length > 0) {
        setCandidates(data.candidates);
      } else {
        setCandidates(generateFiveDimensionalHeadlines(currentTitle || seedTopic, coreAngle, contentSummary));
      }
    } catch (err) {
      console.warn('Alternative titles fetch error, falling back locally:', err);
      setCandidates(generateFiveDimensionalHeadlines(currentTitle || seedTopic, coreAngle, contentSummary));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCandidates();
      setEditingTitleId(null);
      setCustomTitles({});
    }
  }, [isOpen, currentTitle, seedTopic]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApply = (titleToApply: string) => {
    onSelectTitle(titleToApply);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">5 维爆款标题工坊 · 心理学抓手与长尾流量</h3>
                <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                  零 Emoji · 零机械序号
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                基于微信朋友圈高频打开模型与微信搜一搜长尾权重算法，提供 5 组击穿不同读者心理防线的深度爆款标题
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCandidates}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="重新生成 5 组标题"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              重新激发
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Title Bar */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-slate-500 shrink-0 font-medium">当前微信标题：</span>
            <span className="text-slate-300 font-semibold truncate">{currentTitle || '暂无标题'}</span>
            <span className="text-slate-500 shrink-0">({(currentTitle || '').length} 字)</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>选用即同步更新微信排版与 2.35:1 首图标题</span>
          </div>
        </div>

        {/* Candidate Cards List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && candidates.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-300">正在洞察受众心理学防线，调校 5 维爆款标题...</p>
              <p className="text-xs text-slate-500 mt-1">严格执行零 Emoji、无编号、18~28 字黄金字数原则</p>
            </div>
          ) : (
            candidates.map((cand, idx) => {
              const meta = DIMENSION_COLOR_MAP[cand.dimension] || DIMENSION_COLOR_MAP.contrast;
              const activeTitle = customTitles[cand.id] ?? cand.title;
              const charCount = activeTitle.length;
              const isIdealLength = charCount >= 18 && charCount <= 28;

              return (
                <div
                  key={cand.id || idx}
                  className={`group relative rounded-xl bg-slate-950/60 border ${meta.border} p-4 transition-all duration-200 hover:shadow-xl hover:bg-slate-950/90 flex flex-col gap-3`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${meta.badgeBg} ${meta.badgeText}`}>
                        {meta.icon}
                        {cand.dimensionLabel}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        钩子特征：<strong className="text-slate-300">{cand.hookType}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-medium ${
                          isIdealLength
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {charCount} 字 {isIdealLength ? '（黄金长度）' : '（建议18-28字）'}
                      </span>
                    </div>
                  </div>

                  {/* Title Content */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {editingTitleId === cand.id ? (
                        <input
                          type="text"
                          value={activeTitle}
                          onChange={(e) =>
                            setCustomTitles({
                              ...customTitles,
                              [cand.id]: e.target.value,
                            })
                          }
                          onBlur={() => setEditingTitleId(null)}
                          autoFocus
                          className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <h4
                          onClick={() => setEditingTitleId(cand.id)}
                          title="点击可直接微调标题文字"
                          className="text-base font-bold text-slate-100 hover:text-amber-300 cursor-pointer transition-colors leading-relaxed"
                        >
                          {activeTitle}
                        </h4>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(cand.id, activeTitle)}
                        className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                        title="复制标题"
                      >
                        {copiedId === cand.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleApply(activeTitle)}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                        采用此标题
                      </button>
                    </div>
                  </div>

                  {/* Psychological Analysis & Audience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-900">
                    <div className="flex items-start gap-1.5 text-slate-400">
                      <span className="text-slate-500 shrink-0 font-medium">心理抓手：</span>
                      <span>{cand.psychologicalTrigger}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-400">
                      <span className="text-slate-500 shrink-0 font-medium">传播场景：</span>
                      <span>{cand.targetAudience}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>点击任意标题文字即可进行在线微调，微调后点击“采用此标题”自动全流程生效</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
