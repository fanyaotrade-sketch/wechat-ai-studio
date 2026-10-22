import React, { useState } from 'react';
import {
  Cloud,
  Search,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Check,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  Hash,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  Filter,
} from 'lucide-react';
import type {
  DailyClusterPlan,
  SEOAnalysisResult,
  SEOKeywordItem,
  SearchPlatform,
  ModelConfig,
  ThemeCategory,
} from '../types/pipeline';

interface SEOWordCloudStudioProps {
  seedTopic: string;
  themeCategory: ThemeCategory;
  subCategory?: string;
  plan: DailyClusterPlan;
  onUpdatePlan: (updated: DailyClusterPlan) => void;
  modelConfig?: ModelConfig;
}

export const SEOWordCloudStudio: React.FC<SEOWordCloudStudioProps> = ({
  seedTopic,
  themeCategory,
  subCategory,
  plan,
  onUpdatePlan,
  modelConfig,
}) => {
  const [analysis, setAnalysis] = useState<SEOAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activePlatformFilter, setActivePlatformFilter] = useState<SearchPlatform | 'all'>('all');
  const [hoveredKeyword, setHoveredKeyword] = useState<SEOKeywordItem | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isImplanted, setIsImplanted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Find M article in current plan
  const mArticle = plan.articles.find((a) => a.archetype === 'M') || plan.articles[0];
  const currentMIntro = mArticle?.outline_sections?.[0] || '01. 现场调查与痛点引入';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleFetchSEOAnalysis = async () => {
    if (!seedTopic.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/pipeline/seo-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seed: seedTopic,
          themeCategory,
          subCategory,
          currentMIntro,
          apiConfig: modelConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setAnalysis(data.result);
        setIsExpanded(true);
        // Check if M outline already has any of the suggested keywords
        const alreadyHas = data.result.suggestedLongTailKeywords.some((kw: string) =>
          currentMIntro.includes(kw)
        );
        setIsImplanted(alreadyHas);
        showToast('✅ 微信/知乎/百度 多平台 SEO 搜索热度与长尾词分析完成！');
      } else {
        showToast('⚠️ 未能获取 SEO 分析数据，请重试');
      }
    } catch (err: any) {
      console.error('SEO analysis failed:', err);
      showToast('❌ SEO 分析服务调用异常');
    } finally {
      setIsLoading(false);
    }
  };

  // Implant the suggested SEO keywords into M outline's introduction section
  const handleImplantIntoMOutline = () => {
    if (!analysis?.suggestedMIntroInjection) return;

    const enrichedIntro = analysis.suggestedMIntroInjection.enrichedIntroSection;

    const updatedArticles = plan.articles.map((art) => {
      if (art.archetype !== 'M') return art;

      const currentSections = [...(art.outline_sections || [])];
      if (currentSections.length > 0) {
        currentSections[0] = enrichedIntro;
      } else {
        currentSections.push(enrichedIntro);
      }

      return {
        ...art,
        outline_sections: currentSections,
      };
    });

    onUpdatePlan({
      ...plan,
      articles: updatedArticles,
    });

    setIsImplanted(true);
    showToast('🚀 已成功将 3~5 个高权重 SEO 词组自然植入 M 层引子大纲！');
  };

  // Filter keywords by platform
  const filteredKeywords = analysis?.keywords.filter((kw) => {
    if (activePlatformFilter === 'all') return true;
    return kw.platform === activePlatformFilter;
  }) || [];

  return (
    <div className="rounded-xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/40 via-white to-sky-50/30 p-5 shadow-xs transition-all relative">
      {/* Toast */}
      {toastMessage && (
        <div className="absolute top-3 right-4 z-20 px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-1.5 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                SEO 热度词云图 (微信 · 知乎 · 百度)
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                <Search className="w-3 h-3 text-emerald-600" />
                多平台长尾流量捕获
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              监控微信搜一搜、知乎高频问答与百度指数长尾下拉词，自动建议 3~5 个高权重词组并植入 M 层引子大纲
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            onClick={handleFetchSEOAnalysis}
            disabled={isLoading || !seedTopic.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>分析搜索趋势词云中...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>{analysis ? '重新分析多平台 SEO' : '分析全网 SEO 搜索趋势'}</span>
              </>
            )}
          </button>

          {analysis && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
              title={isExpanded ? '折叠面板' : '展开面板'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-6 px-4 my-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-center space-y-2 animate-pulse">
          <div className="flex items-center justify-center gap-2 text-emerald-950 font-bold text-xs">
            <RotateCcw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>正在挖掘【微信搜一搜】、【知乎搜索】与【百度指数】长尾热搜词与需求图谱...</span>
          </div>
          <p className="text-[11px] text-emerald-700">
            目标母题：{seedTopic} · 正在计算词组搜索权重与竞争度分布
          </p>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !isLoading && (
        <div className="py-6 text-center space-y-2 text-slate-500">
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Cloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-700">
            当前母题：【<strong className="text-emerald-900">{seedTopic || '未指定母题'}</strong>】
          </p>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
            点击上方按钮，系统将检索微信、知乎及百度等平台的真实搜索长尾词，生成热度词云图，并智能推荐 3~5 个高权重词组无缝植入 M 型大纲首段引子中。
          </p>
        </div>
      )}

      {/* Results Section */}
      {analysis && !isLoading && isExpanded && (
        <div className="pt-4 space-y-5">
          {/* Top Metric Bar & Platform Shares */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-slate-400 font-medium">全网搜索指数估算:</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {analysis.overallSearchIndex.toLocaleString()}
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="text-[11px] font-semibold text-slate-500">平台热度占比:</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                  微信 {analysis.platformShares.wechat}%
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 text-[10px] font-bold">
                  知乎 {analysis.platformShares.zhihu}%
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px] font-bold">
                  百度 {analysis.platformShares.baidu}%
                </span>
              </div>
            </div>

            {/* Platform Filter Buttons */}
            <div className="flex items-center gap-1 self-start sm:self-auto">
              <span className="text-[10px] text-slate-400 mr-1 flex items-center gap-0.5">
                <Filter className="w-3 h-3" />
                筛选平台:
              </span>
              <button
                onClick={() => setActivePlatformFilter('all')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  activePlatformFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                全部 ({analysis.keywords.length})
              </button>
              <button
                onClick={() => setActivePlatformFilter('wechat')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  activePlatformFilter === 'wechat'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                }`}
              >
                微信搜一搜
              </button>
              <button
                onClick={() => setActivePlatformFilter('zhihu')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  activePlatformFilter === 'zhihu'
                    ? 'bg-sky-600 text-white'
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-800'
                }`}
              >
                知乎搜索
              </button>
              <button
                onClick={() => setActivePlatformFilter('baidu')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  activePlatformFilter === 'baidu'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800'
                }`}
              >
                百度指数
              </button>
            </div>
          </div>

          {/* Interactive Word Cloud Visual Container */}
          <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 rounded-xl shadow-xs text-white relative overflow-hidden">
            {/* Background decorative dots */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 pb-3 border-b border-white/10">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>SEO 热度词云图谱（字体越大，全网搜索权重越高）</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                悬停查看搜索指数与竞争度 · 共 {filteredKeywords.length} 个词
              </span>
            </div>

            {/* Cloud Tags Layout */}
            <div className="relative z-10 py-6 px-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 select-none min-h-[170px]">
              {filteredKeywords.map((kw) => {
                const isSuggested = analysis.suggestedLongTailKeywords.includes(kw.keyword);

                // Determine font size & visual style based on weight
                const fontSizeClass =
                  kw.weight >= 95
                    ? 'text-lg sm:text-xl font-black'
                    : kw.weight >= 90
                    ? 'text-base sm:text-lg font-extrabold'
                    : kw.weight >= 85
                    ? 'text-sm sm:text-base font-bold'
                    : kw.weight >= 80
                    ? 'text-xs sm:text-sm font-semibold'
                    : 'text-xs font-normal';

                // Color accent by platform
                const platformBadgeBg =
                  kw.platform === 'wechat'
                    ? 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30 hover:border-emerald-400'
                    : kw.platform === 'zhihu'
                    ? 'text-sky-300 bg-sky-500/20 border-sky-400/30 hover:border-sky-400'
                    : 'text-rose-300 bg-rose-500/20 border-rose-400/30 hover:border-rose-400';

                return (
                  <div
                    key={kw.id}
                    onMouseEnter={() => setHoveredKeyword(kw)}
                    onMouseLeave={() => setHoveredKeyword(null)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer backdrop-blur-xs relative group ${platformBadgeBg} ${
                      isSuggested ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 shadow-md' : 'hover:scale-105'
                    }`}
                  >
                    {isSuggested && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
                    )}
                    <span className="text-[10px] font-mono opacity-60">
                      {kw.platform === 'wechat' ? '微' : kw.platform === 'zhihu' ? '知' : '百'}
                    </span>
                    <span className={`${fontSizeClass} tracking-wide`}>
                      {kw.keyword}
                    </span>
                    <span className="text-[10px] font-mono text-amber-300/90 font-bold">
                      {kw.growthRate}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Hover Tooltip / Detail Banner */}
            <div className="relative z-10 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              {hoveredKeyword ? (
                <div className="flex flex-wrap items-center gap-3 text-slate-200">
                  <span className="font-bold text-amber-300">【{hoveredKeyword.keyword}】</span>
                  <span className="font-mono text-[11px] text-slate-300">
                    预估月搜索: <strong>{hoveredKeyword.searchVolume.toLocaleString()}</strong>
                  </span>
                  <span className="text-[11px]">
                    意图: <span className="text-sky-300 font-semibold">{hoveredKeyword.intent}</span>
                  </span>
                  <span className="text-[11px]">
                    竞争度: <span className={hoveredKeyword.competition === 'low' ? 'text-emerald-400' : 'text-amber-300'}>{hoveredKeyword.competition}</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono">
                    平台: {hoveredKeyword.platform === 'wechat' ? '微信搜一搜' : hoveredKeyword.platform === 'zhihu' ? '知乎搜索' : '百度指数'}
                  </span>
                </div>
              ) : (
                <span className="text-slate-400 text-[11px] italic">
                  💡 将鼠标悬停在上方任意热词上，可查看月搜索指数、搜索意图与竞争度指标
                </span>
              )}

              <div className="flex items-center gap-3 text-[10px] text-slate-400 shrink-0 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  微信搜一搜
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  知乎搜索
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  百度指数
                </span>
              </div>
            </div>
          </div>

          {/* Suggested 3-5 High-Weight SEO Keywords */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>自动建议的 3~5 个高权重 SEO 核心长尾词组（黄金搜索词）</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold font-mono">
                高搜索量 · 低竞争度 · 强意图
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {analysis.suggestedLongTailKeywords.map((kw, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50/50 rounded-lg border border-slate-200 hover:border-emerald-300 text-xs transition-colors flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center font-mono text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-900 truncate" title={kw}>
                    {kw}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* M Archetype Introduction Implant Workbench ("大纲 M 层引子植入工作台") */}
          <div className="p-4 bg-gradient-to-r from-amber-50/70 via-white to-emerald-50/70 rounded-xl border border-amber-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center font-mono text-[11px]">
                  M
                </span>
                <span className="font-bold text-slate-900">
                  大纲 M 层（头条破圈篇）引子植入工作台
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-100 text-amber-800 font-semibold">
                  微信搜一搜长尾引流
                </span>
              </div>

              {/* Implant Action Button */}
              <button
                onClick={handleImplantIntoMOutline}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer ${
                  isImplanted
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-900 hover:bg-emerald-700 text-white'
                }`}
              >
                {isImplanted ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>已植入 M 大纲引子 (点击重新覆盖)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>一键植入 M 型引子大纲 (长尾SEO赋能)</span>
                  </>
                )}
              </button>
            </div>

            {/* Comparison view: Before vs After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              {/* Original Intro in M article */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-600">当前 M 篇大纲原引子：</span>
                  <span className="font-mono text-[10px]">原始大纲</span>
                </div>
                <p className="text-slate-600 text-[11.5px] leading-relaxed line-clamp-3">
                  {currentMIntro}
                </p>
              </div>

              {/* Enriched Intro with Implanted SEO Keywords */}
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-300 space-y-1.5 relative">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    SEO 词组无痕植入后的引子方案：
                  </span>
                  <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[9px] font-bold">
                    推荐
                  </span>
                </div>
                <p className="text-slate-900 text-[11.5px] font-medium leading-relaxed">
                  {analysis.suggestedMIntroInjection.enrichedIntroSection}
                </p>
                <div className="pt-1 text-[10px] text-emerald-800 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{analysis.suggestedMIntroInjection.explanation}</span>
                </div>
              </div>
            </div>

            {/* Injected notice */}
            {isImplanted && (
              <div className="p-2 rounded-lg bg-emerald-100/70 border border-emerald-300 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>
                    已成功将高权重搜索词植入到规划蓝图的 <strong>【{mArticle.wechat_title}】</strong> 第一段结构大纲中！
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono">
                  撰写文章时将自动引导 LLM 命中长尾搜索
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
