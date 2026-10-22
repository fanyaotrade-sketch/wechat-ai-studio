import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Sliders,
  Bookmark,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  RotateCcw,
} from 'lucide-react';
import type {
  DailyClusterPlan,
  Archetype,
  ThemeCategory,
  ModelConfig,
  DraftArticleOutput,
  DailyTopicItem,
} from '../types/pipeline';
import { SourceRadarView } from './SourceRadarView';
import { DailyTopicHub } from './DailyTopicHub';
import { HARVESTED_SOURCES } from '../data/presets';
import {
  generateContextualJournalisticHeading,
  HEADLINE_STYLES_METADATA,
  HeadlineStyle,
} from '../utils/headlineEngine';

interface PlannerViewProps {
  plan: DailyClusterPlan;
  onUpdatePlan: (updated: DailyClusterPlan) => void;
  articles: Partial<Record<Archetype, DraftArticleOutput>>;
  onUpdateArticles?: (articles: Partial<Record<Archetype, DraftArticleOutput>>) => void;
  onGenerateSingleSlot: (archetype: Archetype) => Promise<void>;
  generatingSlotArc?: Archetype | null;
  onGeneratePlan?: (seed: string, category?: ThemeCategory, subCategory?: string) => Promise<void>;
  isLoading: boolean;
  onNavigateToPublisher: (archetype: Archetype) => void;
  onOpenModelModal?: () => void;
  activeProvider?: string;
  activeModel?: string;
  onGenerateAllDrafts?: () => Promise<void>;
  isGeneratingAllDrafts?: boolean;
  modelConfig?: ModelConfig;
  onInquiryAdopted?: (plan: DailyClusterPlan, article: DraftArticleOutput, archetype: Archetype) => void;
  onBatchMatrixGenerated?: (plan: DailyClusterPlan, drafts: Partial<Record<Archetype, DraftArticleOutput>>) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  plan,
  onUpdatePlan,
  articles,
  onUpdateArticles,
  onGenerateSingleSlot,
  generatingSlotArc,
  onGeneratePlan,
  isLoading,
  onNavigateToPublisher,
  onOpenModelModal,
  activeProvider,
  activeModel,
  modelConfig,
  onBatchMatrixGenerated,
}) => {
  const [showFullBlueprintDetails, setShowFullBlueprintDetails] = useState(false);

  // Subheading style cycler for outlines
  const handleCycleHeadlineStyle = (archetype: Archetype) => {
    const updated = plan.articles.map((art) => {
      if (art.archetype === archetype) {
        const styles: HeadlineStyle[] = ['contrast_investigative', 'geek_engineering', 'ruthless_finance', 'practical_playbook'];
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        const newSections = art.outline_sections.map((sec, idx) =>
          generateContextualJournalisticHeading(sec, idx, art.archetype, plan.seed_topic, randomStyle, art.core_angle)
        );
        return {
          ...art,
          outline_sections: newSections,
        };
      }
      return art;
    });

    onUpdatePlan({
      ...plan,
      articles: updated,
    });
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. 主视觉：前沿商业与技术情报雷达 & 微信公众号排期矩阵调度 */}
      {/* ============================================================== */}
      <SourceRadarView
        plan={plan}
        onUpdatePlan={onUpdatePlan}
        articles={articles}
        onUpdateArticles={onUpdateArticles}
        onGenerateSingleSlot={onGenerateSingleSlot}
        generatingSlotArc={generatingSlotArc}
        onNavigateToPublisher={onNavigateToPublisher}
        onBatchMatrixGenerated={onBatchMatrixGenerated}
        onOpenModelModal={onOpenModelModal}
        modelConfig={modelConfig}
        isLoadingPlan={isLoading}
      />

      {/* ============================================================== */}
      {/* 2. 折叠区：公众号推送蓝图与协同大纲看板 */}
      {/* ============================================================== */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                推送矩阵施工蓝图（{plan.articles?.length || 3} 篇深度长文协同互推架构）
              </h3>
              <p className="text-xs text-slate-500">
                母题：【{plan.seed_topic}】· ID: {plan.cluster_id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFullBlueprintDetails(!showFullBlueprintDetails)}
            className="text-xs sm:text-sm text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>{showFullBlueprintDetails ? '收起大纲细节' : '展开推送大纲细节'}</span>
            {showFullBlueprintDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Full Details Grid */}
        {showFullBlueprintDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-3 border-t border-slate-100">
            {plan.articles.map((art) => {
              const isReady = Boolean(
                articles[art.archetype]?.markdown_content &&
                  !articles[art.archetype]?.markdown_content.includes('正文待生成...')
              );

              return (
                <div
                  key={art.archetype}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {art.publish_slot} · {art.archetype}型
                      </span>
                      {isReady ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ 已生成
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          待生成
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                      {art.wechat_title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 italic">
                      🎯 {art.core_angle}
                    </p>

                    <div className="pt-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600">章节大纲：</span>
                        <button
                          type="button"
                          onClick={() => handleCycleHeadlineStyle(art.archetype)}
                          className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                        >
                          切换小标题风格
                        </button>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {art.outline_sections.map((sec, sidx) => (
                          <li key={sidx} className="flex items-start gap-1 line-clamp-1">
                            <span className="text-slate-400 font-mono">•</span>
                            <span className="text-[11px]">{sec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateToPublisher(art.archetype)}
                    className="w-full py-1.5 text-center text-xs font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors shadow-2xs mt-2"
                  >
                    在排版工坊中预览与走查 ➔
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. 可折叠：高级全网监控源设置与 RSS 自动定时抓取计划 */}
      {/* ============================================================== */}
      <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
        <details className="text-sm group">
          <summary className="font-bold text-slate-800 flex items-center justify-between select-none py-1 cursor-pointer">
            <span className="flex items-center gap-2 text-sm font-bold">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>高级配置：自定义监控源 (推特博主 / Subreddit / RSS) 与定时自动刷新设置</span>
            </span>
            <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="pt-3">
            <DailyTopicHub
              onSelectTopicAsSeed={(topic) => {
                onUpdatePlan({ ...plan, seed_topic: topic.title });
              }}
              currentSelectedCategory={plan.theme_category || 'practical_tutorials_sop'}
              isGeneratingPlan={isLoading}
              activeSeedTopicTitle={plan.seed_topic}
            />
          </div>
        </details>
      </div>

      {/* ============================================================== */}
      {/* 4. 可折叠：高公信力标杆实战库 */}
      {/* ============================================================== */}
      <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
        <details className="text-sm group cursor-pointer">
          <summary className="font-bold text-slate-800 flex items-center justify-between select-none py-1">
            <span className="flex items-center gap-2 text-sm font-bold">
              <Bookmark className="w-4 h-4 text-indigo-600" />
              <span>高公信力标杆实战案例库（MIT 固态电池、出海 SaaS、具身智能、微型工作流）</span>
            </span>
            <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-3">
            {HARVESTED_SOURCES.map((src) => {
              return (
                <div
                  key={src.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white text-left transition-all space-y-2 hover:border-indigo-300 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 font-mono">
                      {src.platform.toUpperCase()} · {src.author}
                    </span>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <span>原文链接</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{src.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{src.summary}</p>
                </div>
              );
            })}
          </div>
        </details>
      </div>
    </div>
  );
};
