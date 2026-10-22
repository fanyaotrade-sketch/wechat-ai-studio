import React, { useState } from 'react';
import {
  Flame,
  Search,
  Sparkles,
  Zap,
  TrendingUp,
  Cloud,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  Target,
  ShieldAlert,
  Globe,
  Layers,
  BarChart2,
  Tag,
  Hash,
} from 'lucide-react';
import type {
  DailyClusterPlan,
  TrendSEOFusionResult,
  ThemeCategory,
  ModelConfig,
  Archetype,
  SearchPlatform,
  SEOKeywordItem,
} from '../types/pipeline';
import { ContentTrendPredictor } from './ContentTrendPredictor';
import { SEOWordCloudStudio } from './SEOWordCloudStudio';

interface TrendSEOFusionHubProps {
  seedTopic: string;
  themeCategory: ThemeCategory;
  subCategory?: string;
  plan: DailyClusterPlan;
  onUpdatePlan: (updated: DailyClusterPlan) => void;
  modelConfig?: ModelConfig;
}

export const TrendSEOFusionHub: React.FC<TrendSEOFusionHubProps> = ({
  seedTopic,
  themeCategory,
  subCategory,
  plan,
  onUpdatePlan,
  modelConfig,
}) => {
  const [fusionResult, setFusionResult] = useState<TrendSEOFusionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'seo_cloud' | 'trend_detail'>('matrix');
  const [isExpanded, setIsExpanded] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFullyInjected, setIsFullyInjected] = useState(false);

  // M article in plan
  const mArticle = plan.articles.find((a) => a.archetype === 'M') || plan.articles[0];
  const currentMIntro = mArticle?.outline_sections?.[0] || '01. 现场调查与痛点引入';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Run unified fusion API
  const handleRunFusion = async () => {
    if (!seedTopic.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/pipeline/trend-seo-fusion', {
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
      if (data.success && data.fusionResult) {
        setFusionResult(data.fusionResult);
        setActiveTab('matrix');
        setIsExpanded(true);
        showToast('🚀 趋势舆情与全网 SEO 双擎智能融合分析完成！');
      } else {
        showToast('⚠️ 未能获取融合分析数据，请重试');
      }
    } catch (err: any) {
      console.error('Trend & SEO Fusion failed:', err);
      showToast('❌ 双擎融合服务调用异常');
    } finally {
      setIsLoading(false);
    }
  };

  // One-Click Inject all fused angles & SEO keywords into M, S, I outlines
  const handleApplyFusionToAllOutlines = () => {
    if (!fusionResult?.fusedArchetypeInjections) return;

    const { M, S, I } = fusionResult.fusedArchetypeInjections;

    const updatedArticles = plan.articles.map((art) => {
      if (art.archetype === 'M' && M) {
        return {
          ...art,
          core_angle: M.angleTitle,
          outline_sections: [...M.recommendedInjections],
        };
      }
      if (art.archetype === 'S' && S) {
        return {
          ...art,
          core_angle: S.angleTitle,
          outline_sections: [...S.recommendedInjections],
        };
      }
      if (art.archetype === 'I' && I) {
        return {
          ...art,
          core_angle: I.angleTitle,
          outline_sections: [...I.recommendedInjections],
        };
      }
      return art;
    });

    onUpdatePlan({
      ...plan,
      articles: updatedArticles,
    });

    setIsFullyInjected(true);
    showToast('🎉 已成功将高权重 SEO 长尾词与争议痛点全量融合注入 M/S/I 三篇大纲！');
  };

  return (
    <div className="rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white shadow-xl overflow-hidden transition-all relative">
      {/* Top Banner Accent */}
      <div className="h-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-400" />

      {/* Main Header Controller */}
      <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>趋势舆情 × 全网 SEO 双擎智能融合中枢</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-2xs">
                第三阶段 · 爆款赋能
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            一键联动 <strong>Google Search 实时争议舆情</strong> 与 <strong>微信·知乎·百度</strong> 多平台搜索热词，自动将 3~5 个高权重 SEO 词组植入 M 引子，同时将全网争议痛点注入三篇大纲，打通公域长尾截流与私域深度信任。
          </p>
        </div>

        {/* Master Action Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunFusion}
            disabled={isLoading || !seedTopic.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 disabled:from-slate-700 disabled:to-slate-800 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-orange-500/25 cursor-pointer disabled:text-slate-400"
            title="由大模型与搜索引擎同时抓取热度预测与SEO关键词，自动生成协同矩阵"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-slate-950" />
                <span>双擎正在智能融合...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>⚡ 一键双擎智能融合分析</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title={isExpanded ? '折叠面板' : '展开面板'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mx-6 mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-300 hover:text-white text-xs font-bold">✕</button>
        </div>
      )}

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-5">
          {/* Sub-tab Navigation */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'matrix'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>双擎融合矩阵 (Matrix)</span>
              </button>

              <button
                onClick={() => setActiveTab('seo_cloud')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'seo_cloud'
                    ? 'bg-slate-800 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cloud className="w-3.5 h-3.5 text-sky-400" />
                <span>SEO 热度词云图</span>
              </button>

              <button
                onClick={() => setActiveTab('trend_detail')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'trend_detail'
                    ? 'bg-slate-800 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>争议舆情与痛点预测</span>
              </button>
            </div>

            {/* Quick stats indicator */}
            {fusionResult && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">引流综合指数：</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono font-bold text-xs">
                  {fusionResult.fusionScore.combinedViralIndex} / 100
                </span>
              </div>
            )}
          </div>

          {/* TAB 1: Fusion Matrix */}
          {activeTab === 'matrix' && (
            <div className="space-y-5">
              {!fusionResult ? (
                <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-dashed border-slate-800 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="text-sm font-bold text-white">尚未生成双擎融合矩阵</div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    点击右上角【⚡ 一键双擎智能融合分析】，系统将自动把多平台 SEO 词群与实时舆情痛点交叉融合，为您生成协同大纲。
                  </p>
                  <button
                    onClick={handleRunFusion}
                    disabled={isLoading}
                    className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>立即开始双擎融合</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Scores and Cross-Synergy Summary Banner */}
                  <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-bold text-white">
                          双擎流量协同研判 · 搜索截流与深度信任模型
                        </span>
                      </div>

                      {/* Three Score Cards */}
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <div className="px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300">
                          SEO 搜索指数: <strong>{fusionResult.fusionScore.seoTrafficScore}</strong>
                        </div>
                        <div className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">
                          争议热度爆发力: <strong>{fusionResult.fusionScore.controversyMomentumScore}</strong>
                        </div>
                        <div className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                          综合指数: <strong>{fusionResult.fusionScore.combinedViralIndex}</strong>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      💡 <strong>战略协同推演</strong>：{fusionResult.crossSynergySummary}
                    </p>

                    {/* One-Click Apply Action Bar */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>已预置包含 3~5 个高权重 SEO 词组的 M 层引子，以及 S/I 层机理与实操大纲</span>
                      </div>

                      <button
                        onClick={handleApplyFusionToAllOutlines}
                        className={`px-4 py-2 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                          isFullyInjected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
                        }`}
                      >
                        {isFullyInjected ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
                        <span>{isFullyInjected ? '✓ 融合结果已全量同步到全部大纲！' : '🚀 一键将融合方案同步到全部大纲'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Fused Tri-article Blueprint Preview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                    {/* M-Article Card */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                          第 1 篇 (头条) · 深度特稿
                        </span>
                        <span className="text-[10px] text-amber-300 font-medium">植入 3~5 个 SEO 词组</span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-2">
                        {fusionResult.fusedArchetypeInjections.M.angleTitle}
                      </h4>
                      <p className="text-[11px] text-amber-200/80 italic line-clamp-2 bg-black/30 p-2 rounded border border-amber-500/20">
                        {fusionResult.fusedArchetypeInjections.M.viralHook}
                      </p>
                      <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                        <div className="font-semibold text-slate-300">植入的高权重 SEO 词组：</div>
                        <div className="flex flex-wrap gap-1">
                          {fusionResult.fusedArchetypeInjections.M.topKeywordsUsed.map((kw, kIdx) => (
                            <span key={kIdx} className="px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 font-mono">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* S-Article Card */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-sky-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                          第 2 篇 (次条) · 深度拆解
                        </span>
                        <span className="text-[10px] text-sky-300 font-medium">第一性原理与工艺</span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-2">
                        {fusionResult.fusedArchetypeInjections.S.angleTitle}
                      </h4>
                      <p className="text-[11px] text-sky-200/80 italic line-clamp-2 bg-black/30 p-2 rounded border border-sky-500/20">
                        {fusionResult.fusedArchetypeInjections.S.viralHook}
                      </p>
                      <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                        <div className="font-semibold text-slate-300">核心工艺深潜点：</div>
                        <div className="space-y-0.5">
                          {fusionResult.fusedArchetypeInjections.S.deepDiveOutline.slice(0, 2).map((sec, sIdx) => (
                            <div key={sIdx} className="truncate text-slate-300">• {sec}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* I-Article Card */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                          第 3 篇 (三条) · 前沿观察
                        </span>
                        <span className="text-[10px] text-emerald-300 font-medium">避坑清单与ROI</span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-2">
                        {fusionResult.fusedArchetypeInjections.I.angleTitle}
                      </h4>
                      <p className="text-[11px] text-emerald-200/80 italic line-clamp-2 bg-black/30 p-2 rounded border border-emerald-500/20">
                        {fusionResult.fusedArchetypeInjections.I.viralHook}
                      </p>
                      <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                        <div className="font-semibold text-slate-300">实战决策对照表：</div>
                        <div className="space-y-0.5">
                          {fusionResult.fusedArchetypeInjections.I.commercialChecklist.slice(0, 2).map((sec, iIdx) => (
                            <div key={iIdx} className="truncate text-slate-300">• {sec}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Embedded SEO Word Cloud Studio */}
          {activeTab === 'seo_cloud' && (
            <div className="bg-slate-900 rounded-xl p-1 border border-slate-800">
              <SEOWordCloudStudio
                seedTopic={seedTopic}
                themeCategory={themeCategory}
                subCategory={subCategory}
                plan={plan}
                onUpdatePlan={onUpdatePlan}
                modelConfig={modelConfig}
              />
            </div>
          )}

          {/* TAB 3: Embedded Trend Controversy Predictor */}
          {activeTab === 'trend_detail' && (
            <div className="bg-slate-900 rounded-xl p-1 border border-slate-800">
              <ContentTrendPredictor
                seedTopic={seedTopic}
                themeCategory={themeCategory}
                subCategory={subCategory}
                plan={plan}
                onUpdatePlan={onUpdatePlan}
                modelConfig={modelConfig}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
