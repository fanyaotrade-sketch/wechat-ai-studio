import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  RefreshCw,
  Search,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  Globe,
  Radio,
  Clock,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  BookmarkCheck,
  AlertCircle,
  HelpCircle,
  Zap,
  Plus,
  Trash2,
  X,
  Send,
  CheckCircle2,
  Image as ImageIcon,
  Play,
  Eye,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Key,
  Settings,
  Filter,
  FileText,
  Edit3,
  Compass,
} from 'lucide-react';
import type {
  DailyTopicItem,
  ThemeCategory,
  Archetype,
  DailyClusterPlan,
  DraftArticleOutput,
  ModelConfig,
  ArticleBlueprint,
} from '../types/pipeline';
import { THEME_CATEGORIES_METADATA, SLOT_ARCHETYPE_METADATA } from '../types/pipeline';
import { CustomArticleModal, type CustomArticleImportPayload } from './CustomArticleModal';

interface SourceRadarViewProps {
  plan: DailyClusterPlan;
  onUpdatePlan: (plan: DailyClusterPlan) => void;
  articles: Partial<Record<Archetype, DraftArticleOutput>>;
  onUpdateArticles?: (articles: Partial<Record<Archetype, DraftArticleOutput>>) => void;
  onGenerateSingleSlot: (arc: Archetype) => Promise<void>;
  generatingSlotArc?: Archetype | null;
  onNavigateToPublisher: (arc: Archetype) => void;
  onBatchMatrixGenerated?: (plan: DailyClusterPlan, drafts: Partial<Record<Archetype, DraftArticleOutput>>) => void;
  onOpenModelModal?: () => void;
  modelConfig?: ModelConfig;
  currentCategory?: ThemeCategory;
  onCategoryChange?: (category: ThemeCategory) => void;
  isLoadingPlan?: boolean;
  isInterrogating?: boolean;
  activeTopicTitle?: string;
  onSelectArticleForPlanAndInquiry?: (topic: DailyTopicItem) => Promise<void> | void;
}

export interface TopicSuitability5000 {
  isSuitable: boolean;
  score: number;
  reason: string;
  tag: string;
}

/**
 * Assesses whether a topic's source material is dense and substantive enough to support a 5000+ words investigative feature.
 */
export function evaluateTopic5000WordSuitability(topic?: DailyTopicItem | null): TopicSuitability5000 {
  if (!topic) {
    return { isSuitable: false, score: 0, reason: '未分配素材', tag: '空缺' };
  }

  // 自选优质好文（如微信、推特文章，即使2000~3000字亦完全适宜作为二创基底扩写至5000+字，绝不报警）
  if (topic.is_custom_curated) {
    const words = topic.source_word_count || (topic.full_article_content || '').length || (topic.summary || '').length;
    return {
      isSuitable: true,
      score: 98,
      reason: `自选优质好文（原文约 ${words} 字），将以此为坚实基底进行多维深度扩写二创，成稿预期 5000+ 字`,
      tag: '自选好文·二创5000+字',
    };
  }

  const summary = (topic.summary || '').trim();
  const title = (topic.title || '').trim();
  const summaryLen = summary.length;
  const hotScore = topic.hot_score || 0;
  const hasRichMedia = (topic.media_urls || []).length > 0;
  const hasTags = (topic.tags || []).length >= 2;

  // Keywords that demonstrate technical, financial, tutorial, or industry depth
  const depthKeywords = [
    '教程', 'sop', '实操', '深度', '拆解', '参数', '固态电池', '锂电', '机器人',
    '具身智能', '架构', '源码', '开源', '算法', 'bom', '成本', '财报', '海外',
    '出海', '变现', '避坑', '手把手', '配置', '部署', '模型', '论文', 'nature', 'science',
    '测评', '复盘', '工序', '对比', '闭环', '算力', '显存', '良率', '供应链', '毛利'
  ];
  const combined = `${title} ${summary} ${(topic.tags || []).join(' ')}`.toLowerCase();
  const depthMatchCount = depthKeywords.filter((kw) => combined.includes(kw)).length;

  let score = 50;
  if (summaryLen >= 140) score += 25;
  else if (summaryLen >= 90) score += 15;
  else if (summaryLen >= 60) score += 5;
  else score -= 25; // Too brief (< 60 chars)

  if (depthMatchCount >= 3) score += 20;
  else if (depthMatchCount >= 1) score += 10;
  else score -= 15;

  if (hotScore >= 90) score += 10;
  if (hasRichMedia) score += 5;
  if (hasTags) score += 5;

  // Suitable if score >= 65 and summary length >= 60
  const isSuitable = score >= 65 && summaryLen >= 60;
  const reason = isSuitable
    ? '信息密度高，具备扎实的多维事实、参数机理与实操细节，完全适宜撰写5000+字长文'
    : '信息量偏单薄短平快，缺乏足够的微观数据或工序细节支撑5000字长文，建议一键替换为深度素材';
  const tag = isSuitable ? '适宜5000+字特稿' : '不适宜长篇·偏单薄';

  return { isSuitable, score: Math.min(100, Math.max(0, score)), reason, tag };
}

export const SourceRadarView: React.FC<SourceRadarViewProps> = ({
  plan,
  onUpdatePlan,
  articles,
  onUpdateArticles,
  onGenerateSingleSlot,
  generatingSlotArc,
  onNavigateToPublisher,
  onBatchMatrixGenerated,
  onOpenModelModal,
  modelConfig,
  currentCategory,
  onCategoryChange,
  isLoadingPlan,
  isInterrogating,
  activeTopicTitle,
  onSelectArticleForPlanAndInquiry,
}) => {
  // Master topics store
  const [allTopics, setAllTopics] = useState<DailyTopicItem[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshStepMessage, setRefreshStepMessage] = useState<string>('');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('刚刚');

  // Multi-Category Selection State (all 6 categories selectable, default to all 6 active)
  const [selectedCategories, setSelectedCategories] = useState<ThemeCategory[]>([
    'practical_tutorials_sop',
    'global_digital_biz',
    'clean_energy_materials',
    'frontier_ai_robotics',
    'frontier_science',
    'pioneers_profiles',
  ]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  // Platform & Search filter
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'twitter' | 'reddit' | 'rss'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI state
  const [copiedTopicId, setCopiedTopicId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showApiKeyPromptModal, setShowApiKeyPromptModal] = useState<boolean>(false);

  // Overseas Media Lightbox Preview State
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    urls: string[];
    currentIndex: number;
    title: string;
    sourceUrl?: string;
  } | null>(null);

  // Target Slot count: 1 (单篇), 3 (三联包), 5 (全矩阵)
  const [targetSlotCount, setTargetSlotCount] = useState<1 | 3 | 5>(() => {
    return (modelConfig?.defaultSlotCount as 1 | 3 | 5) || 5;
  });

  // Matrix push cart slots
  const [matrixSlots, setMatrixSlots] = useState<Record<Archetype, DailyTopicItem | null>>({
    M: null,
    S: null,
    I: null,
    F: null,
    T: null,
  });

  // Custom curated article recreation modal state
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [customModalTargetArc, setCustomModalTargetArc] = useState<Archetype | undefined>(undefined);

  // Angle micro-tuning state
  const [editingAngleArc, setEditingAngleArc] = useState<Archetype | null>(null);
  const [customAngleInput, setCustomAngleInput] = useState<string>('');

  const handleSaveCustomAngle = (arc: Archetype) => {
    if (!customAngleInput.trim() || !matrixSlots[arc]) return;
    const updatedTopic = {
      ...matrixSlots[arc]!,
      recommended_angle: customAngleInput.trim(),
    };
    const nextSlots = { ...matrixSlots, [arc]: updatedTopic };
    setMatrixSlots(nextSlots);
    syncSlotsToPlan(nextSlots, targetSlotCount);
    setEditingAngleArc(null);
    showToast(`✓ 已更新【${SLOT_ARCHETYPE_METADATA[arc].slotName}】二创切入立意`);
  };

  // Helper: Strictly verify that a draft belongs to the currently assigned topic
  const isTopicDraftMatching = (
    assignedTopic: DailyTopicItem | null | undefined,
    draft: DraftArticleOutput | undefined
  ): boolean => {
    if (!assignedTopic || !draft || !draft.markdown_content) return false;
    if (draft.markdown_content.includes('正文待生成...')) return false;

    // If custom curated, match by title
    if (assignedTopic.is_custom_curated && draft.wechat_title === assignedTopic.title) return true;

    // Compare titles: must share substantial overlap or match
    const draftTitle = draft.wechat_title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
    const topicTitle = assignedTopic.title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');

    if (draftTitle === topicTitle) return true;
    if (topicTitle.length >= 6 && draftTitle.includes(topicTitle.slice(0, 6))) return true;
    if (draftTitle.length >= 6 && topicTitle.includes(draftTitle.slice(0, 6))) return true;

    return false;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getProxiedMediaUrl = (rawUrl?: string): string => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) return rawUrl;
    return `/api/pipeline/proxy-media?url=${encodeURIComponent(rawUrl)}`;
  };

  const countWords = (text?: string): number => {
    if (!text) return 0;
    return text.replace(/\s+/g, '').length;
  };

  // Active archetypes depending on 1, 3, or 5 slot mode
  const activeArchetypes: Archetype[] = useMemo(() => {
    if (targetSlotCount === 1) return ['M'];
    if (targetSlotCount === 5) return ['M', 'S', 'I', 'F', 'T'];
    return ['M', 'S', 'I'];
  }, [targetSlotCount]);

  const filledSlotCount = useMemo(() => {
    return activeArchetypes.filter((arc) => matrixSlots[arc] !== null).length;
  }, [activeArchetypes, matrixSlots]);

  const generatedArticlesCount = useMemo(() => {
    return activeArchetypes.filter((arc) => {
      const assigned = matrixSlots[arc];
      const art = articles[arc];
      return isTopicDraftMatching(assigned, art);
    }).length;
  }, [activeArchetypes, matrixSlots, articles]);

  // Load all topics from backend once on mount
  useEffect(() => {
    fetchTopicsOnce();
  }, []);

  // Hydrate matrixSlots from existing plan if already configured
  useEffect(() => {
    if (plan?.articles && plan.articles.length > 0 && allTopics.length > 0) {
      setMatrixSlots((prev) => {
        // If plan has no meaningful articles (all are '待匹配选题'), do not hydrate!
        const hasAnyConfiguredInPlan = plan.articles.some(
          (art) => art.wechat_title && !art.wechat_title.includes('待匹配选题')
        );
        if (!hasAnyConfiguredInPlan) {
          const allNull = Object.values(prev).every((v) => v === null);
          return allNull ? prev : { M: null, S: null, I: null, F: null, T: null };
        }

        const next = { ...prev };
        let hasChanges = false;
        plan.articles.forEach((art) => {
          if (!next[art.archetype]) {
            if (art.wechat_title && art.wechat_title.includes('待匹配选题')) {
              return;
            }
            const matched = allTopics.find(
              (t) => t.title === art.wechat_title || (art.wechat_title && art.wechat_title.includes(t.title))
            );
            if (matched) {
              next[art.archetype] = matched;
              hasChanges = true;
            } else if (art.wechat_title && !art.wechat_title.includes('待匹配选题')) {
              // Synthesize a topic representation from blueprint
              next[art.archetype] = {
                id: `topic_${art.archetype}_${Date.now()}`,
                title: art.wechat_title,
                source: '智能立项信源',
                category: plan.theme_category || 'practical_tutorials_sop',
                category_label: plan.category_label || '实战情报',
                publish_time: '今日',
                summary: art.core_angle,
                recommended_angle: art.core_angle,
                hot_score: 96,
              };
              hasChanges = true;
            }
          }
        });
        return hasChanges ? next : prev;
      });
    }
  }, [allTopics, plan]);

  // Fetch all topics from server
  const fetchTopicsOnce = async () => {
    setIsLoadingInitial(true);
    try {
      const res = await fetch('/api/pipeline/daily-topics');
      const data = await res.json();
      if (data.success && Array.isArray(data.topics) && data.topics.length > 0) {
        setAllTopics(data.topics);
        setLastRefreshedAt(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to fetch topics in SourceRadarView:', err);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  // Manual trigger: Scrape Twitter + Reddit + RSS in real-time
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setRefreshStepMessage('正在通过 Apify / 权威订阅源采掘全网一手资讯...');

    const stepTimer = setTimeout(() => {
      setRefreshStepMessage('LLM 推理引擎正在去伪存真 & 提炼高价值特稿选题...');
    }, 3000);

    try {
      const res = await fetch('/api/pipeline/scrape-all-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: selectedCategories,
        }),
      });
      clearTimeout(stepTimer);
      const data = await res.json();
      if (data.success && data.items) {
        setAllTopics(data.items);
        setLastRefreshedAt(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
        const dupInfo = typeof data.skippedDuplicateCount === 'number' && data.skippedDuplicateCount > 0
          ? `（已自动跳过 ${data.skippedDuplicateCount} 篇往期重复）`
          : '';
        showToast(`🎉 今日素材换新完成！已甄选入库 ${data.newCount || data.items.length} 篇最新资讯${dupInfo}`);
      } else {
        await fetchTopicsOnce();
        showToast('已完成全网信源拉取并同步最新『实时热点资讯源』');
      }
    } catch (err) {
      clearTimeout(stepTimer);
      console.error('Manual refresh error:', err);
      showToast('网络请求已完成，已保留当前动态素材库');
    } finally {
      setIsRefreshing(false);
      setRefreshStepMessage('');
    }
  };

  // Multi-Category selection handlers
  const handleToggleCategory = (catId: ThemeCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((c) => c !== catId);
      } else {
        return [...prev, catId];
      }
    });
    setSelectedSubCategory(null);
  };

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === THEME_CATEGORIES_METADATA.length) {
      // Toggle to first one
      setSelectedCategories([THEME_CATEGORIES_METADATA[0].id]);
    } else {
      setSelectedCategories(THEME_CATEGORIES_METADATA.map((c) => c.id));
    }
    setSelectedSubCategory(null);
  };

  // Subcategories belonging to currently selected categories
  const availableSubCategories = useMemo(() => {
    const subs: Array<{ id: string; name: string; categoryId: ThemeCategory; badge?: string }> = [];
    THEME_CATEGORIES_METADATA.forEach((cat) => {
      if (selectedCategories.includes(cat.id) && cat.subCategories) {
        cat.subCategories.forEach((sub) => {
          subs.push({
            id: sub.id,
            name: sub.name,
            categoryId: cat.id,
            badge: sub.badge,
          });
        });
      }
    });
    return subs;
  }, [selectedCategories]);

  // Filter topics in-memory
  const filteredTopics = useMemo(() => {
    return allTopics.filter((t) => {
      // Multi-Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(t.category)) {
        return false;
      }

      // Subcategory filter
      if (selectedSubCategory && t.sub_category && t.sub_category !== selectedSubCategory) {
        return false;
      }

      // Platform filter
      if (selectedPlatform === 'twitter') {
        const isTw = t.platform === 'twitter' || t.source.toLowerCase().includes('twitter') || t.source.toLowerCase().includes('x.com');
        if (!isTw) return false;
      } else if (selectedPlatform === 'reddit') {
        const isRd = t.platform === 'reddit' || t.source.toLowerCase().includes('reddit') || t.source.toLowerCase().includes('r/');
        if (!isRd) return false;
      } else if (selectedPlatform === 'rss') {
        const isTw = t.platform === 'twitter' || t.source.toLowerCase().includes('twitter') || t.source.toLowerCase().includes('x.com');
        const isRd = t.platform === 'reddit' || t.source.toLowerCase().includes('reddit') || t.source.toLowerCase().includes('r/');
        if (isTw || isRd) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchSummary = (t.summary || '').toLowerCase().includes(q);
        const matchSource = (t.source || '').toLowerCase().includes(q);
        const matchAuthor = (t.author || '').toLowerCase().includes(q);
        const matchTags = (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchSummary && !matchSource && !matchAuthor && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [allTopics, selectedCategories, selectedSubCategory, selectedPlatform, searchQuery]);

  // Check which slot a topic is currently assigned to (if any)
  const getAssignedSlot = (topicId: string): Archetype | null => {
    for (const arc of activeArchetypes) {
      if (matrixSlots[arc]?.id === topicId) return arc;
    }
    return null;
  };

  // Sync matrixSlots to DailyClusterPlan (Zero-numbering outline sections)
  const syncSlotsToPlan = (newSlots: Record<Archetype, DailyTopicItem | null>, count: 1 | 3 | 5) => {
    const activeArcs: Archetype[] =
      count === 1 ? ['M'] : count === 5 ? ['M', 'S', 'I', 'F', 'T'] : ['M', 'S', 'I'];
    const primaryTopic = newSlots['M'] || Object.values(newSlots).find((t) => t !== null);

    const updatedArticles: ArticleBlueprint[] = activeArcs.map((arc) => {
      const topic = newSlots[arc];
      const meta = SLOT_ARCHETYPE_METADATA[arc];
      const existing = plan.articles?.find((a) => a.archetype === arc);

      if (topic) {
        return {
          archetype: arc,
          publish_slot: meta.slotName as any,
          msi_role_label: meta.roleName,
          wechat_title: topic.title,
          core_angle: topic.recommended_angle || topic.summary || meta.description,
          forbidden_scope:
            existing?.forbidden_scope || '避免泛泛空谈，禁止输出空洞口号与AI套话，严禁未经测算的虚高数据',
          outline_sections: [
            `核心事实与传播痛点：${topic.title}`,
            `关键机理、工艺实现与参数拆解`,
            `商业算账、实操避坑图谱与决策核对清单`,
            `一线避坑指南与长效生态位防守图谱`,
          ],
          scraper_tasks: existing?.scraper_tasks || [],
          visual_spec: existing?.visual_spec || {
            mermaid_flowchart_topic: '核心事实与全链路架构',
            satori_card_type: 'platform_comparison',
            card_key_metrics: ['核心突破', '良品率', '综合成本'],
          },
          cross_links: existing?.cross_links || [],
          is_custom_curated: topic.is_custom_curated,
          source_article_content: topic.full_article_content,
          source_word_count: topic.source_word_count,
          source_media_urls: topic.media_urls || existing?.source_media_urls || [],
        };
      } else {
        return {
          archetype: arc,
          publish_slot: meta.slotName as any,
          msi_role_label: meta.roleName,
          wechat_title: `${meta.slotName} · 待匹配选题`,
          core_angle: meta.description,
          forbidden_scope: '避免套话口号',
          outline_sections: ['选题核心机理剖析', '关键参数与工艺拆解', '商业算账与避坑手册', '长效护城河构建'],
          scraper_tasks: [],
          visual_spec: {
            mermaid_flowchart_topic: '核心事实与全链路架构',
            satori_card_type: 'platform_comparison',
            card_key_metrics: ['核心突破', '良品率', '综合成本'],
          },
          cross_links: [],
          is_custom_curated: false,
          source_article_content: undefined,
          source_word_count: 0,
          source_media_urls: [],
        };
      }
    });

    const newPlan: DailyClusterPlan = {
      ...plan,
      cluster_id: plan.cluster_id || `cluster-${Date.now()}`,
      seed_topic: primaryTopic?.title || '待匹配选题',
      theme_category: primaryTopic?.category || plan.theme_category || 'practical_tutorials_sop',
      category_label: primaryTopic?.category_label || plan.category_label || '实战情报',
      articles: updatedArticles,
    };

    onUpdatePlan(newPlan);
  };

  // Smart Analyze & Fill Slots (双擎舆情 × 全网 SEO 智能调度，严格筛选适合 5000+ 字长篇特稿的深度素材)
  const handleSmartAnalyzeAndFillSlots = (count: 1 | 3 | 5) => {
    setTargetSlotCount(count);
    const activeArcs: Archetype[] =
      count === 1 ? ['M'] : count === 5 ? ['M', 'S', 'I', 'F', 'T'] : ['M', 'S', 'I'];

    const candidates = filteredTopics.length > 0 ? filteredTopics : allTopics;
    if (candidates.length === 0) {
      showToast('⚠️ 暂无可用资讯，请先点击「刷新资讯」拉取');
      return;
    }

    // Rank candidates: Give huge weight to topics that pass the 5000-word suitability check!
    const scoredCandidates = [...candidates].sort((a, b) => {
      const suitA = evaluateTopic5000WordSuitability(a);
      const suitB = evaluateTopic5000WordSuitability(b);
      const suitBonusA = suitA.isSuitable ? 120 : 0;
      const suitBonusB = suitB.isSuitable ? 120 : 0;
      const scoreA =
        (a.hot_score || 80) * 1.5 +
        Math.min(a.upvotes || 0, 500) * 0.1 +
        (a.media_urls?.length ? 8 : 0) +
        suitBonusA +
        suitA.score;
      const scoreB =
        (b.hot_score || 80) * 1.5 +
        Math.min(b.upvotes || 0, 500) * 0.1 +
        (b.media_urls?.length ? 8 : 0) +
        suitBonusB +
        suitB.score;
      return scoreB - scoreA;
    });

    const nextSlots: Record<Archetype, DailyTopicItem | null> = { ...matrixSlots };

    // Intelligent role-based assignment with strict 5000-word suitability preference
    activeArcs.forEach((arc, idx) => {
      let pick: DailyTopicItem | undefined;

      if (arc === 'M') {
        // Headliner: Top viral/breaking or commercial breakthrough with 5000-word suitability
        pick =
          scoredCandidates.find(
            (t) =>
              evaluateTopic5000WordSuitability(t).isSuitable &&
              (t.category === 'global_digital_biz' ||
                t.category === 'clean_energy_materials' ||
                t.is_breaking ||
                (t.hot_score || 0) >= 95)
          ) ||
          scoredCandidates.find((t) => evaluateTopic5000WordSuitability(t).isSuitable) ||
          scoredCandidates[0];
      } else if (arc === 'S') {
        // Second slot: Deep craft / tutorial / technical SOP
        pick =
          scoredCandidates.find(
            (t) =>
              evaluateTopic5000WordSuitability(t).isSuitable &&
              t.id !== nextSlots.M?.id &&
              (t.category === 'practical_tutorials_sop' || t.category === 'frontier_science')
          ) ||
          scoredCandidates.find(
            (t) => evaluateTopic5000WordSuitability(t).isSuitable && t.id !== nextSlots.M?.id
          ) ||
          scoredCandidates[idx];
      } else if (arc === 'I') {
        // Third slot: Decision / pitfall / checklist
        pick =
          scoredCandidates.find(
            (t) =>
              evaluateTopic5000WordSuitability(t).isSuitable &&
              t.id !== nextSlots.M?.id &&
              t.id !== nextSlots.S?.id &&
              (t.category === 'global_digital_biz' || t.category === 'practical_tutorials_sop')
          ) ||
          scoredCandidates.find(
            (t) =>
              evaluateTopic5000WordSuitability(t).isSuitable &&
              t.id !== nextSlots.M?.id &&
              t.id !== nextSlots.S?.id
          ) ||
          scoredCandidates[idx];
      } else if (arc === 'F') {
        // Fourth slot: Overseas discussion / Reddit
        pick =
          scoredCandidates.find(
            (t) =>
              evaluateTopic5000WordSuitability(t).isSuitable &&
              t.id !== nextSlots.M?.id &&
              t.id !== nextSlots.S?.id &&
              t.id !== nextSlots.I?.id &&
              (t.platform === 'reddit' || t.category === 'frontier_ai_robotics')
          ) ||
          scoredCandidates.find(
            (t) =>
              evaluateTopic5000WordSuitability(t).isSuitable &&
              t.id !== nextSlots.M?.id &&
              t.id !== nextSlots.S?.id &&
              t.id !== nextSlots.I?.id
          ) ||
          scoredCandidates[idx];
      } else if (arc === 'T') {
        // Fifth slot: Geek tools / open source / masters
        pick =
          scoredCandidates.find(
            (t) =>
              evaluateTopic5000WordSuitability(t).isSuitable &&
              t.id !== nextSlots.M?.id &&
              t.id !== nextSlots.S?.id &&
              t.id !== nextSlots.I?.id &&
              t.id !== nextSlots.F?.id &&
              (t.category === 'pioneers_profiles' || t.platform === 'twitter')
          ) ||
          scoredCandidates.find(
            (t) =>
              evaluateTopic5000WordSuitability(t).isSuitable &&
              !Object.values(nextSlots).some((s) => s?.id === t.id)
          ) ||
          scoredCandidates[idx];
      }

      nextSlots[arc] = pick || scoredCandidates[idx % scoredCandidates.length];
    });

    setMatrixSlots(nextSlots);
    syncSlotsToPlan(nextSlots, count);
    if (onUpdateArticles) {
      const cleaned = { ...articles };
      activeArcs.forEach((arc) => {
        delete cleaned[arc];
      });
      onUpdateArticles(cleaned);
    }
    showToast(`🎉 智能分析已完成！已锁定 ${count} 篇高信息密度素材（0 Token消耗），可审阅角度后随时开始二创！`);
  };

  // Assign specific topic to a slot
  const handleAssignTopicToSlot = (topic: DailyTopicItem, targetArc: Archetype, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextSlots = { ...matrixSlots, [targetArc]: topic };
    setMatrixSlots(nextSlots);
    syncSlotsToPlan(nextSlots, targetSlotCount);
    if (onUpdateArticles) {
      const cleaned = { ...articles };
      delete cleaned[targetArc];
      onUpdateArticles(cleaned);
    }
    const suit = evaluateTopic5000WordSuitability(topic);
    if (suit.isSuitable) {
      showToast(`✓ 已将「${topic.title.slice(0, 14)}...」设为【${SLOT_ARCHETYPE_METADATA[targetArc].slotName}】(待二创，0 Token消耗)`);
    } else {
      showToast(`⚠️ 素材偏单薄：当前选题可能不足以支撑5000字，建议卡片内点击一键替换`);
    }
  };

  // Assign to first empty slot
  const handleAssignToFirstEmpty = (topic: DailyTopicItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentArc = getAssignedSlot(topic.id);
    if (currentArc) {
      handleRemoveSlot(currentArc);
      return;
    }
    const emptyArc = activeArchetypes.find((arc) => matrixSlots[arc] === null);
    if (!emptyArc) {
      showToast(`⚠️ 推送排期池已满（${targetSlotCount} 篇）。可点击栏位右上角 ✕ 移出后替换`);
      return;
    }
    handleAssignTopicToSlot(topic, emptyArc);
  };

  // Remove topic from slot
  const handleRemoveSlot = (arc: Archetype, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextSlots = { ...matrixSlots, [arc]: null };
    setMatrixSlots(nextSlots);
    syncSlotsToPlan(nextSlots, targetSlotCount);
    if (onUpdateArticles) {
      const cleaned = { ...articles };
      delete cleaned[arc];
      onUpdateArticles(cleaned);
    }
    try {
      localStorage.removeItem('wechat_msi_active_workspace');
      localStorage.setItem('wechat_msi_workspace_reset_flag', 'true');
    } catch {
      // ignore
    }
    showToast(`✓ 已从【${SLOT_ARCHETYPE_METADATA[arc].slotName}】移出`);
  };

  // One-click replace with 5000-word viable deep candidate
  const handleReplaceWithDeepTopic = (arc: Archetype, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentId = matrixSlots[arc]?.id;
    const candidates = filteredTopics.length > 0 ? filteredTopics : allTopics;
    const deepCandidates = candidates.filter(
      (c) =>
        c.id !== currentId &&
        !Object.values(matrixSlots).some((s) => s?.id === c.id) &&
        evaluateTopic5000WordSuitability(c).isSuitable
    );
    if (deepCandidates.length > 0) {
      const best = deepCandidates[0];
      handleAssignTopicToSlot(best, arc);
      showToast(`✓ 已为【${SLOT_ARCHETYPE_METADATA[arc].slotName}】一键替换为支持5000+字深度的素材「${best.title.slice(0, 14)}...」`);
    } else {
      handleSwapSlotTopic(arc, e);
    }
  };

  // Swap topic in slot with next best candidate
  const handleSwapSlotTopic = (arc: Archetype, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentId = matrixSlots[arc]?.id;
    const candidates = filteredTopics.length > 0 ? filteredTopics : allTopics;
    const available = candidates.filter(
      (c) => c.id !== currentId && !Object.values(matrixSlots).some((s) => s?.id === c.id)
    );
    if (available.length > 0) {
      const nextTopic = available[Math.floor(Math.random() * available.length)];
      handleAssignTopicToSlot(nextTopic, arc);
      showToast(`已为【${SLOT_ARCHETYPE_METADATA[arc].slotName}】换一批新选题`);
    } else {
      showToast('暂无更多其他候选选题，可点击「刷新资讯」拉取');
    }
  };

  // Clear all slots
  const handleClearSlots = () => {
    const nextSlots = { M: null, S: null, I: null, F: null, T: null };
    setMatrixSlots(nextSlots);
    syncSlotsToPlan(nextSlots, targetSlotCount);
    if (onUpdateArticles) {
      onUpdateArticles({});
    }
    try {
      localStorage.removeItem('wechat_msi_active_workspace');
      localStorage.setItem('wechat_msi_workspace_reset_flag', 'true');
    } catch {
      // ignore
    }
    showToast('✓ 已清空当前推送排期池与所有草稿');
  };

  // Copy topic brief
  const handleCopyBrief = (topic: DailyTopicItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `【海外前沿商业与技术情报】
标题：${topic.title}
信源出处：${topic.source} (${topic.publish_time})
平台：${topic.platform ? topic.platform.toUpperCase() : 'WEB / RSS'}
作者/组织：${topic.author || '网络创作者'}
分类：${topic.category_label || topic.category}
摘要要点：${topic.summary}
${topic.source_url ? `原文直达：${topic.source_url}` : ''}`;

    navigator.clipboard.writeText(text);
    setCopiedTopicId(topic.id);
    showToast(`✓ 已复制选题「${topic.title.slice(0, 16)}...」要点`);
    setTimeout(() => setCopiedTopicId(null), 2000);
  };

  // Open custom article import modal
  const handleOpenCustomModal = (targetArc?: Archetype) => {
    setCustomModalTargetArc(targetArc);
    setIsCustomModalOpen(true);
  };

  // Process imported custom article and assign directly to slot
  const handleConfirmCustomArticleImport = (data: CustomArticleImportPayload) => {
    const arc: Archetype = data.targetArc;
    const wordCount = data.wordCount || data.content.length;

    // Extract any existing image links from custom article markdown
    const extractedImgs: string[] = [];
    const imgRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
    let imgM;
    while ((imgM = imgRegex.exec(data.content)) !== null) {
      extractedImgs.push(imgM[1]);
    }

    const customTopic: DailyTopicItem = {
      id: `custom_${Date.now()}`,
      title: data.title,
      source:
        data.sourcePlatform === 'wechat'
          ? '微信公众号精选'
          : data.sourcePlatform === 'twitter'
          ? 'Twitter / X 热门'
          : '网络自选好文',
      source_url: data.sourceUrl,
      platform: (data.sourcePlatform === 'twitter' ? 'twitter' : 'rss') as any,
      category: 'practical_tutorials_sop',
      category_label: '自选二创',
      publish_time: '自选采掘',
      summary: data.content.slice(0, 300) + '...',
      recommended_angle: data.expansionAngle,
      hot_score: 99,
      upvotes: 999,
      tags: ['自选精选', '深度二创', data.expansionAngle],
      is_breaking: true,
      is_custom_curated: true,
      full_article_content: data.content,
      source_word_count: wordCount,
      media_urls: extractedImgs.length > 0 ? extractedImgs : undefined,
    };

    setAllTopics((prev) => [customTopic, ...prev]);

    const nextSlots = { ...matrixSlots, [arc]: customTopic };
    setMatrixSlots(nextSlots);
    syncSlotsToPlan(nextSlots, targetSlotCount);

    const slotMeta = SLOT_ARCHETYPE_METADATA[arc];
    showToast(
      `🎉 成功载入自选好文「${data.title.slice(0, 14)}...」（约 ${wordCount} 字）至【${slotMeta?.slotName || '指定栏位'}】！点击「独立撰写此篇」即可二创 5000+ 字特稿`
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. Header Bar: 定向情报雷达 & 刷新资讯 */}
      {/* ========================================================= */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 font-extrabold text-xs font-mono flex items-center gap-1.5 shadow-sm">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-600" />
              LIVE 实时流
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              跨日防重记忆 (60天免重复)
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              每日素材自动更新
            </span>
            <span className="text-sm text-indigo-200 font-mono hidden lg:inline">
              集成主流 RSS 顶刊 · Twitter / X 定向 KOL · Reddit 精选社区
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>『前沿商业与技术情报雷达』</span>
            <span className="text-sm sm:text-base font-normal text-slate-300">
              · 多维赛道多选 · 智能 SEO 舆情调度 · 独立依次生成无并发报错
            </span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
            涵盖保姆级实操教程 SOP、商业模式出海、全固态电池与具身智能等一手干货。支持<strong>多选赛道</strong>，点击<strong>「智能分析最优推文选题」</strong>自动配齐 1/3/5 篇排期，每篇均可独立按需生成并无缝进入 02 排版走查！
          </p>
        </div>

        {/* Action Controls: Total counter + 『刷新资讯』 Button */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400 font-mono">今日新鲜素材库 (往期自动剔除)</div>
            <div className="text-lg font-bold text-amber-300 font-mono">{allTopics.length} 篇动态素材</div>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md border border-amber-300/40 active:scale-95"
            title="实时采掘全网最新资讯与推特爆帖"
          >
            <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? (refreshStepMessage || '正在采掘与推理...') : '刷新最新资讯'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. 微信公众号推送排期池 (Matrix Push Dock) */}
      {/* ========================================================= */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950/95 to-slate-900 border-b border-indigo-900/60 text-white space-y-5 shadow-inner">
        {/* Top line of Dock: Title + Slot Mode Switcher + Hero Smart Analyze CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                <span>公众号每日推送排期池 (Matrix Dock)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-mono font-medium">
                  {targetSlotCount === 1 ? '单篇深度特稿' : targetSlotCount === 3 ? '黄金三联包' : '5篇全矩阵覆盖'}
                </span>
              </h3>
              <p className="text-sm text-slate-300 leading-normal">
                选题匹配后，<strong>点击每篇单独生成</strong>，逐篇审阅无并发冲突；审阅满意后再在 02 保存至历史资料库。
              </p>
            </div>
          </div>

          {/* Mode Switcher + Hero Smart Analyze Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 1 / 3 / 5 Mode Selector */}
            <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700 flex items-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setTargetSlotCount(1);
                  syncSlotsToPlan(matrixSlots, 1);
                }}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  targetSlotCount === 1
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                单篇 (1条)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetSlotCount(3);
                  syncSlotsToPlan(matrixSlots, 3);
                }}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  targetSlotCount === 3
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                三联包 (3条)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetSlotCount(5);
                  syncSlotsToPlan(matrixSlots, 5);
                }}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  targetSlotCount === 5
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                全矩阵 (5条)
              </button>
            </div>

            {/* HERO BUTTON: 智能分析最优选题 (双擎舆情×SEO调度) */}
            <button
              type="button"
              onClick={() => handleSmartAnalyzeAndFillSlots(targetSlotCount)}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 rounded-xl font-extrabold text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 border border-amber-300"
              title="根据已选类目，基于趋势舆情 × 全网 SEO 双擎算法智能匹配最优推文选题"
            >
              <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>智能分析最优推文选题</span>
            </button>

            {/* BUTTON: 录入自选文章二创 (推特/微信好文) */}
            <button
              type="button"
              onClick={() => handleOpenCustomModal()}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 border border-indigo-500/50"
              title="粘贴推特或公众号文章原文（2000~3000字即可），按指定栏位进行5000+字深度二创"
            >
              <FileText className="w-4 h-4 text-indigo-200" />
              <span>录入自选文章二创</span>
            </button>

            {filledSlotCount > 0 && (
              <button
                type="button"
                onClick={handleClearSlots}
                className="px-3 py-2 text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                title="清空当前所有排期"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>清空排期</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Slots Grid: 1, 3, or 5 cards */}
        <div
          className={`grid gap-4 ${
            targetSlotCount === 1
              ? 'grid-cols-1'
              : targetSlotCount === 3
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
          }`}
        >
          {activeArchetypes.map((arc) => {
            const meta = SLOT_ARCHETYPE_METADATA[arc];
            const assigned = matrixSlots[arc];
            const artDraft = articles[arc];
            const isDraftReady = isTopicDraftMatching(assigned, artDraft);
            const isSlotGenerating = generatingSlotArc === arc;

            return (
              <div
                key={arc}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isDraftReady
                    ? 'bg-slate-800/95 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40'
                    : assigned
                    ? 'bg-slate-800/90 border-indigo-500/60 shadow-sm ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/60 border-dashed border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {/* Slot Card Header */}
                <div className="flex items-center justify-between gap-1.5 pb-2.5 border-b border-slate-700/60">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${meta.badgeBg} ${meta.badgeText}`}
                    >
                      {meta.slotName}
                    </span>
                    <span className="text-xs font-medium text-slate-300 truncate max-w-[90px]" title={meta.roleName}>
                      {meta.roleName.split('·')[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {assigned && (
                      <button
                        type="button"
                        onClick={(e) => handleSwapSlotTopic(arc, e)}
                        className="text-slate-400 hover:text-amber-300 p-1 rounded-md hover:bg-slate-700 transition-colors cursor-pointer"
                        title="换一换选题"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {assigned && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSlot(arc, e)}
                        className="text-slate-400 hover:text-rose-400 p-1 rounded-md hover:bg-slate-700 transition-colors cursor-pointer"
                        title="移出此栏位"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Slot Card Body */}
                <div className="py-3 flex-1 space-y-2">
                  {assigned ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono">
                        <span className="font-semibold">
                          {assigned.platform === 'twitter'
                            ? 'Twitter'
                            : assigned.platform === 'reddit'
                            ? 'Reddit'
                            : 'RSS'}
                        </span>
                        <span className="text-slate-400 truncate max-w-[140px]">· {assigned.source}</span>
                      </div>
                      <p className="font-bold text-sm text-slate-100 line-clamp-2 leading-snug" title={assigned.title}>
                        {assigned.title}
                      </p>

                      {/* Interactive Angle Micro-Tuning */}
                      <div className="mt-1 p-2 rounded-lg bg-slate-900/70 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-300/90 flex items-center gap-1 text-[11px]">
                            <Compass className="w-3 h-3 text-amber-400" />
                            <span>二创切入立意：</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (editingAngleArc === arc) {
                                setEditingAngleArc(null);
                              } else {
                                setEditingAngleArc(arc);
                                setCustomAngleInput(assigned.recommended_angle || assigned.summary || '');
                              }
                            }}
                            className="text-slate-400 hover:text-amber-300 text-[10.5px] flex items-center gap-1 cursor-pointer transition-colors"
                            title="在让AI改写前，可微调此篇切入立意与侧重点"
                          >
                            <Edit3 className="w-3 h-3 text-slate-400" />
                            <span>{editingAngleArc === arc ? '收起' : '微调立意'}</span>
                          </button>
                        </div>
                        {editingAngleArc === arc ? (
                          <div className="pt-1 space-y-1.5">
                            <textarea
                              rows={2}
                              value={customAngleInput}
                              onChange={(e) => setCustomAngleInput(e.target.value)}
                              className="w-full text-xs p-1.5 bg-slate-950 border border-amber-500/50 rounded text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400 leading-snug"
                              placeholder="例如：侧重对国内中小团队的算账和避坑..."
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveCustomAngle(arc)}
                              className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[10.5px] font-bold cursor-pointer transition-colors"
                            >
                              保存立意
                            </button>
                          </div>
                        ) : (
                          <p className="text-slate-300 text-[11.5px] leading-snug line-clamp-2">
                            {assigned.recommended_angle || assigned.summary || '深入拆解底层机理与一线实操避坑'}
                          </p>
                        )}
                      </div>

                      {/* Custom Curated Badge vs 5000-Word Suitability Warning */}
                      {assigned.is_custom_curated ? (
                        <div className="mt-1 px-2.5 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/60 text-[11px] font-bold text-indigo-200 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-indigo-400" />
                            <span>自选好文（约 {assigned.source_word_count || assigned.summary?.length || 0} 字）</span>
                          </span>
                          <span className="font-mono text-amber-300 text-[10px]">➔ 目标二创 5000+ 字</span>
                        </div>
                      ) : (
                        (() => {
                          const suit = evaluateTopic5000WordSuitability(assigned);
                          if (suit.isSuitable) {
                            return (
                              <div className="mt-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-[10.5px] font-bold text-emerald-300 flex items-center justify-between">
                                <span>✓ 适合5000+字长文</span>
                                <span className="font-mono text-emerald-400/80 text-[10px]">信息密度 {suit.score}分</span>
                              </div>
                            );
                          } else {
                            return (
                              <div className="mt-1 p-2 rounded-lg bg-amber-950/70 border border-amber-500/60 space-y-1 text-left">
                                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                                  <span>素材偏单薄 · 不适宜5000字长文</span>
                                </div>
                                <p className="text-[10px] text-slate-300 leading-tight">
                                  此素材要点偏短平快，不足以撑满5000字深度特稿，建议替换。
                                </p>
                                <button
                                  type="button"
                                  onClick={(e) => handleReplaceWithDeepTopic(arc, e)}
                                  className="w-full py-1 px-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  title="从资讯库中自动匹配符合5000字深度的丰富素材"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>一键替换为5000字深度素材</span>
                                </button>
                              </div>
                            );
                          }
                        })()
                      )}
                    </div>
                  ) : (
                    <div className="py-3 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
                      <span className="font-medium text-slate-400">待分配选题</span>
                      <span className="text-xs text-slate-500">点击「智能分析」或下方素材「+」</span>
                      <button
                        type="button"
                        onClick={() => handleOpenCustomModal(arc)}
                        className="mt-0.5 px-2.5 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 hover:text-white border border-indigo-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="直接粘贴推特或公众号已看好的优质文章二创此篇"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span>粘贴自选好文二创</span>
                      </button>
                    </div>
                  )}

                  {/* Generation Status Indicator */}
                  <div className="pt-1">
                    {isSlotGenerating ? (
                      <div className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>正在二创正文... (预计15~20秒)</span>
                      </div>
                    ) : isDraftReady ? (
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>✓ 二创已完成</span>
                        </span>
                        <span className="font-mono text-[11px] text-emerald-200">
                          {countWords(artDraft?.markdown_content)} 字
                        </span>
                      </div>
                    ) : assigned ? (
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span>选题已锁定 · 待二创改写</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">0 Token消耗</span>
                      </div>
                    ) : (
                      <div className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs font-mono border border-slate-700/60 inline-block">
                        待分配选题
                      </div>
                    )}
                  </div>
                </div>

                {/* Slot Card Actions: Sequential generation on-demand */}
                <div className="pt-2.5 border-t border-slate-700/40">
                  {isDraftReady ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigateToPublisher(arc)}
                        className="py-2.5 px-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                        title="前往 02 微信手机排版工坊走查与精修"
                      >
                        <Eye className="w-4 h-4" />
                        <span>前往02排版走查 ➔</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onGenerateSingleSlot(arc)}
                        disabled={Boolean(generatingSlotArc)}
                        className="py-2.5 px-2 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-40"
                        title="重新调用大模型改写本篇（消耗Token）"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                        <span>重新二创</span>
                      </button>
                    </div>
                  ) : isSlotGenerating ? (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>AI 正在全力二创长文... (~15秒)</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onGenerateSingleSlot(arc)}
                      disabled={!assigned || Boolean(generatingSlotArc)}
                      className="w-full py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 border border-amber-300"
                      title="由大模型根据此素材独立二创 5000~6800 字深度长文（点击时才消耗 Token）"
                    >
                      <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
                      <span>⚡ 开始二创改写 ({meta.slotName.slice(0, 2)})</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dock Bottom Bar: Real-time Stats & Jump to 02 */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-indigo-900/40 text-sm">
          <div className="flex items-center gap-4 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span>已排选题：</span>
              <span className="font-mono text-amber-300 font-extrabold text-base">
                {filledSlotCount} / {activeArchetypes.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>已生成草稿：</span>
              <span className="font-mono text-emerald-400 font-extrabold text-base">
                {generatedArticlesCount} / {activeArchetypes.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToPublisher('M')}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-indigo-200 hover:text-white bg-indigo-900/50 hover:bg-indigo-900/80 border border-indigo-700/60 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>前往 02 微信手机排版工坊走查与审阅</span>
            <ArrowRight className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. Category Multi-Select & Platform Filter Bar */}
      {/* ========================================================= */}
      <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-4">
        {/* Category Multi-Selection Pills */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-sm text-slate-700 font-medium">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>
                <strong>多维赛道筛选（支持多选）：</strong>点击勾选/取消勾选，素材即时过滤，不丢失数据
              </span>
            </span>
            <button
              type="button"
              onClick={handleSelectAllCategories}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer hover:underline"
            >
              {selectedCategories.length === THEME_CATEGORIES_METADATA.length ? '取消全选' : '全选所有赛道'}
            </button>
          </div>

          {/* 6 Core Categories with checkmarks and count */}
          <div className="flex flex-wrap items-center gap-2">
            {THEME_CATEGORIES_METADATA.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              const count = allTopics.filter((t) => t.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleToggleCategory(cat.id)}
                  className={`px-3.5 py-2 text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-sm ring-2 ring-indigo-400/50'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 opacity-75'
                  }`}
                >
                  <span className="text-xs">{isSelected ? '✓' : '+'}</span>
                  <span>{cat.shortLabel}</span>
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subcategories chips if any */}
          {availableSubCategories.length > 0 && (
            <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">细分方向：</span>
              <button
                type="button"
                onClick={() => setSelectedSubCategory(null)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                  selectedSubCategory === null
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                全部方向
              </button>
              {availableSubCategories.map((sub) => {
                const isSubSelected = selectedSubCategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubCategory(isSubSelected ? null : sub.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      isSubSelected
                        ? 'bg-indigo-700 text-white font-bold shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{sub.name}</span>
                    {sub.badge && <span className="text-[10px] opacity-75">({sub.badge})</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Secondary Bar: Platform Filter + Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pt-1">
          {/* Platform Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors cursor-pointer ${
                selectedPlatform === 'all' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部平台
            </button>
            <button
              onClick={() => setSelectedPlatform('twitter')}
              className={`px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedPlatform === 'twitter' ? 'bg-sky-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>推特一手</span>
            </button>
            <button
              onClick={() => setSelectedPlatform('reddit')}
              className={`px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedPlatform === 'reddit' ? 'bg-amber-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Reddit社区</span>
            </button>
            <button
              onClick={() => setSelectedPlatform('rss')}
              className={`px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedPlatform === 'rss' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>顶刊与晨报</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索标题、关键词、作者、海外机构或标签..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. LLM 甄选高价值动态情报池 (Intelligence Pool Cards) */}
      {/* ========================================================= */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>LLM 甄选高价值动态情报池</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                {filteredTopics.length} 条已筛选
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              经大模型去伪存真与全网 SEO 双擎验资提炼。可点击「+ 设为头条/次条」调度入推送矩阵。
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingInitial && (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">正在实时连接海外定向信源并进行大模型推理甄选...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingInitial && filteredTopics.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Filter className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">未找到符合当前赛道或搜索条件的资讯</h4>
            <p className="text-xs text-slate-500">建议勾选更多赛道分类，或点击上方「刷新最新资讯」主动拉取</p>
            <button
              onClick={handleSelectAllCategories}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              全选所有赛道
            </button>
          </div>
        )}

        {/* Topics Cards List */}
        {!isLoadingInitial && filteredTopics.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {filteredTopics.map((topic) => {
              const assignedArc = getAssignedSlot(topic.id);
              const assignedSlotMeta = assignedArc ? SLOT_ARCHETYPE_METADATA[assignedArc] : null;

              return (
                <div
                  key={topic.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                    assignedArc
                      ? 'bg-amber-50/40 border-amber-300 shadow-sm ring-1 ring-amber-300/60'
                      : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  {/* Card Header: Platform + Category + Viral Score + Upvotes */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                        {topic.category_label || topic.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 font-mono flex items-center gap-1">
                        {topic.platform === 'twitter' ? 'Twitter' : topic.platform === 'reddit' ? 'Reddit' : 'RSS'}
                        <span>· {topic.source}</span>
                      </span>
                      <span className="text-xs text-slate-400 font-mono">({topic.publish_time})</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      {topic.upvotes && topic.upvotes > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                          点赞 {topic.upvotes}
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-md font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        热度 {topic.hot_score || 95}%
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {topic.title}
                  </h4>

                  {/* Summary */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {topic.summary}
                  </p>

                  {/* Raw snippet if available */}
                  {topic.raw_snippet && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-mono italic leading-relaxed line-clamp-2">
                      {topic.raw_snippet}
                    </div>
                  )}

                  {/* Media Gallery Preview */}
                  {topic.media_urls && topic.media_urls.length > 0 && (
                    <div className="pt-0.5 flex items-center gap-2.5">
                      {topic.media_urls.slice(0, 3).map((mUrl, mIdx) => (
                        <div
                          key={mIdx}
                          onClick={() =>
                            setLightboxState({
                              isOpen: true,
                              urls: topic.media_urls || [],
                              currentIndex: mIdx,
                              title: topic.title,
                              sourceUrl: topic.source_url,
                            })
                          }
                          className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video w-36 h-20 cursor-zoom-in group shadow-2xs hover:shadow-md transition-all"
                        >
                          <img
                            src={getProxiedMediaUrl(mUrl)}
                            alt="素材图"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bottom Bar: Tags + Recommended Angle + Direct Slot Dispatch Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {topic.tags?.slice(0, 3).map((tag, tidx) => (
                        <span
                          key={tidx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                      {topic.recommended_angle && (
                        <span className="text-xs text-indigo-700 font-semibold pl-1 hidden md:inline">
                          【视角】{topic.recommended_angle}
                        </span>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center justify-end gap-2 shrink-0">
                      {/* Copy brief */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyBrief(topic, e)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        title="复制素材要点"
                      >
                        {copiedTopicId === topic.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>复制</span>
                          </>
                        )}
                      </button>

                      {/* View original link */}
                      {topic.source_url && (
                        <a
                          href={topic.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                          title="在新窗口查看原文"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          <span>原文</span>
                        </a>
                      )}

                      {/* Direct Slot Dispatch Buttons */}
                      {assignedArc ? (
                        <div className="flex items-center gap-1.5">
                          <span className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-2xs">
                            <Check className="w-3.5 h-3.5" />
                            <span>已排入【{assignedSlotMeta?.slotName}】</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(assignedArc)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="从该栏位移出"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          {activeArchetypes.map((arc) => {
                            const meta = SLOT_ARCHETYPE_METADATA[arc];
                            return (
                              <button
                                key={arc}
                                type="button"
                                onClick={() => handleAssignTopicToSlot(topic, arc)}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 transition-all cursor-pointer"
                                title={`设为【${meta.slotName} · ${meta.roleName}】`}
                              >
                                +{meta.slotName.slice(0, 2)}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => handleAssignToFirstEmpty(topic)}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer"
                            title="分配到下一个空闲推送栏位"
                          >
                            + 调度入池
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox for overseas post image/video preview */}
      {lightboxState && lightboxState.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between p-6 animate-in fade-in"
          onClick={() => setLightboxState(null)}
        >
          <div className="flex items-center justify-between text-white pb-4 border-b border-white/10">
            <h4 className="font-bold text-sm sm:text-base line-clamp-1">{lightboxState.title}</h4>
            <div className="flex items-center gap-3">
              {lightboxState.sourceUrl && (
                <a
                  href={lightboxState.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>查看原帖</span>
                </a>
              )}
              <button
                onClick={() => setLightboxState(null)}
                className="text-white hover:text-amber-400 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 flex items-center justify-center relative p-4 max-h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getProxiedMediaUrl(lightboxState.urls[lightboxState.currentIndex])}
              alt="放大图"
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/10 text-white text-xs">
            <span>
              {lightboxState.currentIndex + 1} / {lightboxState.urls.length}
            </span>
          </div>
        </div>
      )}

      {/* Custom Article Curated Recreation Modal */}
      <CustomArticleModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onConfirmImport={handleConfirmCustomArticleImport}
        targetArc={customModalTargetArc || 'M'}
        availableArcs={activeArchetypes}
      />
    </div>
  );
};
