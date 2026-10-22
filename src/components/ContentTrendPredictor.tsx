import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Flame,
  Zap,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Globe,
  ExternalLink,
  RotateCcw,
  Layers,
  Check,
  MessageSquareQuote,
  Target,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Sliders,
  Compass,
  ArrowDownCircle,
  Lightbulb,
} from 'lucide-react';
import type {
  DailyClusterPlan,
  ContentTrendPrediction,
  Archetype,
  ModelConfig,
  ThemeCategory,
} from '../types/pipeline';

interface ContentTrendPredictorProps {
  seedTopic: string;
  themeCategory: ThemeCategory;
  subCategory?: string;
  plan: DailyClusterPlan;
  onUpdatePlan: (updated: DailyClusterPlan) => void;
  modelConfig?: ModelConfig;
}

export const ContentTrendPredictor: React.FC<ContentTrendPredictorProps> = ({
  seedTopic,
  themeCategory,
  subCategory,
  plan,
  onUpdatePlan,
  modelConfig,
}) => {
  const [prediction, setPrediction] = useState<ContentTrendPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGrounded, setIsGrounded] = useState<boolean | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [injectedArchetypes, setInjectedArchetypes] = useState<Partial<Record<Archetype, boolean>>>({
    M: false,
    S: false,
    I: false,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleFetchTrendPrediction = async () => {
    if (!seedTopic.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/pipeline/trend-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seed: seedTopic,
          themeCategory,
          subCategory,
          apiConfig: modelConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.prediction) {
        setPrediction(data.prediction);
        setIsGrounded(!!data.grounded);
        setIsExpanded(true);
        setInjectedArchetypes({ M: false, S: false, I: false });
        showToast('✅ Google Search 互联网讨论热度与用户痛点分析已完成！');
      } else {
        showToast('⚠️ 分析未能返回有效数据，请重试');
      }
    } catch (err: any) {
      console.error('Trend prediction failed:', err);
      showToast('❌ 请求趋势预测服务失败');
    } finally {
      setIsLoading(false);
    }
  };

  // Inject differentiated points into specific archetype outline
  const handleInjectSingleArchetype = (arc: Archetype) => {
    if (!prediction?.differentiatedAngles?.[arc]) return;
    const diff = prediction.differentiatedAngles[arc];

    const updatedArticles = plan.articles.map((art) => {
      if (art.archetype !== arc) return art;

      // Keep introductory & concluding anchors if present, replace or inject into the core body
      const newSections = [
        ...diff.recommendedInjections,
      ];

      return {
        ...art,
        core_angle: `${diff.angleTitle} · ${diff.counterIntuitiveInsight}`,
        outline_sections: newSections,
      };
    });

    onUpdatePlan({
      ...plan,
      articles: updatedArticles,
    });

    setInjectedArchetypes((prev) => ({ ...prev, [arc]: true }));
    showToast(`✅ 已将【${arc}型】差异化爆款观点成功注入该篇大纲！`);
  };

  // Inject all 3 differentiated angles into M, S, I outlines
  const handleInjectAllArchetypes = () => {
    if (!prediction?.differentiatedAngles) return;

    const updatedArticles = plan.articles.map((art) => {
      const diff = prediction.differentiatedAngles[art.archetype];
      if (!diff) return art;

      return {
        ...art,
        core_angle: `${diff.angleTitle} · ${diff.counterIntuitiveInsight}`,
        outline_sections: [...diff.recommendedInjections],
      };
    });

    onUpdatePlan({
      ...plan,
      articles: updatedArticles,
    });

    setInjectedArchetypes({ M: true, S: true, I: true });
    showToast('🚀 已将 M/S/I 全部 3 组真实趋势洞察与差异化观点一键注入大纲！');
  };

  return (
    <div className="rounded-xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/40 via-white to-amber-50/30 p-5 shadow-xs transition-all relative">
      {/* Toast notification */}
      {toastMessage && (
        <div className="absolute top-3 right-4 z-20 px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-1.5 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                互联网内容趋势预测与用户痛点洞察
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono">
                <Globe className="w-3 h-3 text-indigo-600" />
                Google Search Grounding
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              利用实时搜索引擎穿透营销公关话术，提炼知乎/B站/社交平台真实槽点，自动为三联包大纲注入爆款差异角
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            onClick={handleFetchTrendPrediction}
            disabled={isLoading || !seedTopic.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>实时检索舆情分析中...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>{prediction ? '重新联网预测趋势' : '一键预测趋势与痛点'}</span>
              </>
            )}
          </button>

          {prediction && (
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

      {/* Loading state indicator */}
      {isLoading && (
        <div className="py-6 px-4 my-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-center space-y-2 animate-pulse">
          <div className="flex items-center justify-center gap-2 text-indigo-900 font-bold text-xs">
            <RotateCcw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>正在通过 Google Search 联网抓取全网讨论焦点、知乎测评争议与真实用户痛点...</span>
          </div>
          <p className="text-[11px] text-indigo-600">
            检索关键词：{seedTopic} 痛点、争议、真实评测、落地时序
          </p>
        </div>
      )}

      {/* Empty prompt state */}
      {!prediction && !isLoading && (
        <div className="py-6 text-center space-y-2 text-slate-500">
          <div className="w-10 h-10 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-700">
            当前选定母题：【<strong className="text-indigo-900">{seedTopic || '未指定母题'}</strong>】
          </p>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
            点击上方按钮，AI 将调用 Google Search Grounding 实时检索该主题在全网的热议指数、受众情绪光谱、三大人性痛点，并生成可一键注入大纲的 M/S/I 差异化论点。
          </p>
        </div>
      )}

      {/* Results View */}
      {prediction && !isLoading && isExpanded && (
        <div className="pt-4 space-y-5">
          {/* 1. Heat Score & Sentiment Spectrum */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Heat Score Card */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  全网讨论热度指数
                </span>
                <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                  <span>{prediction.heatScore}</span>
                  <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </div>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  {prediction.trendMomentum}
                </div>
              </div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center p-1 text-white shadow-xs">
                <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center text-slate-900">
                  <span className="text-[9px] text-slate-400 font-mono">HEAT</span>
                  <span className="text-xs font-black text-rose-600">{prediction.heatScore}°</span>
                </div>
              </div>
            </div>

            {/* Sentiment Spectrum Bar */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs md:col-span-2 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
                  受众情绪光谱 (Public Sentiment Spectrum)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  更新时间: {prediction.generatedAt}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
                <div
                  style={{ width: `${prediction.sentimentBreakdown.curious}%` }}
                  className="bg-sky-500 transition-all"
                  title={`好奇探索: ${prediction.sentimentBreakdown.curious}%`}
                />
                <div
                  style={{ width: `${prediction.sentimentBreakdown.skeptical}%` }}
                  className="bg-rose-500 transition-all"
                  title={`质疑打假: ${prediction.sentimentBreakdown.skeptical}%`}
                />
                <div
                  style={{ width: `${prediction.sentimentBreakdown.fomo}%` }}
                  className="bg-amber-400 transition-all"
                  title={`焦虑观望: ${prediction.sentimentBreakdown.fomo}%`}
                />
                <div
                  style={{ width: `${prediction.sentimentBreakdown.pragmatic}%` }}
                  className="bg-emerald-500 transition-all"
                  title={`理性实操: ${prediction.sentimentBreakdown.pragmatic}%`}
                />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>好奇探索 {prediction.sentimentBreakdown.curious}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-semibold text-rose-700">质疑打假 {prediction.sentimentBreakdown.skeptical}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>焦虑观望 {prediction.sentimentBreakdown.fomo}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>理性实操 {prediction.sentimentBreakdown.pragmatic}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trend Summary & Trending Keyword Chips */}
          <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="font-bold text-indigo-950">全网讨论态势白描：</span>
                <p className="text-slate-700 leading-relaxed text-[11.5px]">
                  {prediction.summary}
                </p>
              </div>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                高频讨论标签:
              </span>
              {prediction.hotKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-white text-indigo-800 rounded-md border border-indigo-200 text-[11px] font-medium shadow-2xs"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          {/* 2. Real Netizen Pain Points ("全网真实痛点与典型心声") */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>直击痛点：全网受众真正争执的 3 大认知盲区与心声</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                数据源自真实社交平台与评测社区
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {prediction.painPoints.map((pp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">
                        痛点 #{idx + 1}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          pp.intensity === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : pp.intensity === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {pp.intensity === 'critical' ? '致命质疑' : pp.intensity === 'high' ? '核心槽点' : '决策顾虑'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      {pp.point}
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-start gap-1.5 italic">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{pp.userQuote}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Differentiated Angles for M, S, I */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>三联包爆款差异化切入方案 (针对上述痛点精准打击)</span>
              </div>

              {/* Master Global Inject Button */}
              <button
                onClick={handleInjectAllArchetypes}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                title="将 M/S/I 3 组差异化观点全量注入三篇大纲，替换泛化套话"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>一键将差异化观点注入全部 3 篇大纲</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* M Card */}
              {prediction.differentiatedAngles?.M && (
                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded text-[10px] font-mono">
                        第 1 篇 · 头条
                      </span>
                      <span className="text-[10px] font-bold text-amber-800">打破常识认知</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {prediction.differentiatedAngles.M.angleTitle}
                    </h4>

                    <div className="p-2 bg-white/80 rounded-lg border border-amber-200/60 text-[11px] space-y-1">
                      <span className="font-bold text-amber-900 text-[10px] block">
                        ⚡ 反直觉核心洞察：
                      </span>
                      <p className="text-slate-700 leading-relaxed">
                        {prediction.differentiatedAngles.M.counterIntuitiveInsight}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <span className="font-bold text-slate-700 text-[10px] block">
                        📌 建议注入大纲的论点：
                      </span>
                      <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-600">
                        {prediction.differentiatedAngles.M.recommendedInjections?.map((inj, i) => (
                          <li key={i} className="line-clamp-2">{inj}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-amber-200/60">
                    <button
                      onClick={() => handleInjectSingleArchetype('M')}
                      className={`w-full py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        injectedArchetypes.M
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {injectedArchetypes.M ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>已成功注入头条大纲</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownCircle className="w-3.5 h-3.5" />
                          <span>仅注入头条大纲</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* S Card */}
              {prediction.differentiatedAngles?.S && (
                <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-sky-500 text-white font-black rounded text-[10px] font-mono">
                        第 2 篇 · 次条
                      </span>
                      <span className="text-[10px] font-bold text-sky-800">击穿修辞真相</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {prediction.differentiatedAngles.S.angleTitle}
                    </h4>

                    <div className="p-2 bg-white/80 rounded-lg border border-sky-200/60 text-[11px] space-y-1">
                      <span className="font-bold text-sky-900 text-[10px] block">
                        ⚡ 实验室与量产鸿沟：
                      </span>
                      <p className="text-slate-700 leading-relaxed">
                        {prediction.differentiatedAngles.S.counterIntuitiveInsight}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <span className="font-bold text-slate-700 text-[10px] block">
                        📌 建议注入大纲的论点：
                      </span>
                      <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-600">
                        {prediction.differentiatedAngles.S.recommendedInjections?.map((inj, i) => (
                          <li key={i} className="line-clamp-2">{inj}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-sky-200/60">
                    <button
                      onClick={() => handleInjectSingleArchetype('S')}
                      className={`w-full py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        injectedArchetypes.S
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-white hover:bg-sky-100 text-sky-900 border border-sky-300'
                      }`}
                    >
                      {injectedArchetypes.S ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>已成功注入次条大纲</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownCircle className="w-3.5 h-3.5" />
                          <span>仅注入次条大纲</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* I Card */}
              {prediction.differentiatedAngles?.I && (
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-emerald-600 text-white font-black rounded text-[10px] font-mono">
                        第 3 篇 · 三条
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800">真实排期与避坑</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {prediction.differentiatedAngles.I.angleTitle}
                    </h4>

                    <div className="p-2 bg-white/80 rounded-lg border border-emerald-200/60 text-[11px] space-y-1">
                      <span className="font-bold text-emerald-900 text-[10px] block">
                        ⚡ 商业博弈与买家底线：
                      </span>
                      <p className="text-slate-700 leading-relaxed">
                        {prediction.differentiatedAngles.I.counterIntuitiveInsight}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <span className="font-bold text-slate-700 text-[10px] block">
                        📌 建议注入大纲的论点：
                      </span>
                      <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-600">
                        {prediction.differentiatedAngles.I.recommendedInjections?.map((inj, i) => (
                          <li key={i} className="line-clamp-2">{inj}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-emerald-200/60">
                    <button
                      onClick={() => handleInjectSingleArchetype('I')}
                      className={`w-full py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        injectedArchetypes.I
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {injectedArchetypes.I ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>已成功注入三条大纲</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownCircle className="w-3.5 h-3.5" />
                          <span>仅注入三条大纲</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Google Search Grounding Sources Footnote */}
          {prediction.searchSources && prediction.searchSources.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-slate-400">Google 联网检索信源:</span>
                {prediction.searchSources.slice(0, 4).map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-0.5 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                  >
                    <span>{src.domain || src.title.slice(0, 15)}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                  </a>
                ))}
              </div>

              {prediction.searchQueries && prediction.searchQueries.length > 0 && (
                <div className="text-slate-400 font-mono text-[9px]">
                  Query: {prediction.searchQueries[0]}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
