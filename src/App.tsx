import React, { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Header } from './components/Header';
import { PlannerView } from './components/PlannerView';
import { WeChatPublisherView } from './components/WeChatPublisherView';
import { ArchiveView } from './components/ArchiveView';
import { StyleClonerModal } from './components/StyleClonerModal';
import { ModelConfigModal } from './components/ModelConfigModal';
import { StepProgressModal } from './components/StepProgressModal';
import { FastKeywordRadarStudio } from './components/FastKeywordRadarStudio';
import { PRESET_CASE_STUDIES, STYLE_PERSONAS, SOLID_STATE_BATTERY_PLAN, SOLID_STATE_BATTERY_ARTICLES } from './data/presets';
import type { DailyClusterPlan, DraftArticleOutput, Archetype, SatoriCardPayload, ThemeCategory, ArticleArchiveItem, ModelConfig } from './types/pipeline';
import { DEFAULT_MODEL_CONFIG, SLOT_ARCHETYPE_METADATA } from './types/pipeline';
import { buildDynamicArticleMarkdown } from './utils/headlineEngine';

export default function App() {
  const initialPreset = PRESET_CASE_STUDIES.solid_state_battery || PRESET_CASE_STUDIES.ai_novel;

  const [activeTab, setActiveTab] = useState<'planner' | 'publisher' | 'archive'>('planner');
  const [currentArchetype, setCurrentArchetype] = useState<Archetype>(() => {
    try {
      const saved = localStorage.getItem('wechat_msi_active_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentArchetype) return parsed.currentArchetype;
      }
    } catch (e) {
      // ignore
    }
    return 'M';
  });
  const [activeBatchArchetype, setActiveBatchArchetype] = useState<Archetype>('M');

  const [plan, setPlan] = useState<DailyClusterPlan>(() => {
    try {
      const saved = localStorage.getItem('wechat_msi_active_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.plan && parsed.plan.articles && parsed.plan.articles.length > 0) {
          return parsed.plan;
        }
      }
    } catch (e) {
      // ignore
    }
    return initialPreset.plan;
  });

  const [articles, setArticles] = useState<Partial<Record<Archetype, DraftArticleOutput>>>(() => {
    try {
      const saved = localStorage.getItem('wechat_msi_active_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.articles && Object.keys(parsed.articles).length > 0) {
          return parsed.articles;
        }
      }
    } catch (e) {
      // ignore
    }
    return initialPreset.articles;
  });

  const [scrapedMaterials, setScrapedMaterials] = useState<Partial<Record<Archetype, string>>>({
    M: `## 【信源素材 #1】国际顶刊 Science 2026 封面论文
- MIT 材料科学与工程系联合实验室：发明 12 纳米自愈合硫化物复合电解质，彻底阻断锂枝晶穿刺。
- 极限测试：室温无外压条件下，10C 极速快充 2200 次循环容量保持率达 92.4%，能量密度预计突破 500 Wh/kg。`,
    S: `## 【信源素材 #2】微观界面表征与工艺数据
- 采用化学气相渗透（CVI）在负极界面原位生长非晶态缓冲层，具有外力诱导弹性可逆相变特性。
- 界面阻抗谱测试：相比传统固态界面阻抗降低 78%，大电流析锂临界电流密度突破 10 mA/cm²。`,
    I: `## 【信源素材 #3】全球产业链量产时间表与专利卡位
- 丰田（Toyota）：持有硫化物固态电解质核心专利超 1300 件，计划 2027 年小批量试装雷克萨斯旗舰车型。
- 宁德时代与清陶能源：分别推进半固态到全固态过渡线，预计 2028-2030 年实现百吉瓦时级规模化商业化。`,
  });

  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('veteran_candid');
  const [referenceSample, setReferenceSample] = useState<string>('');
  const [customTonePrompt, setCustomTonePrompt] = useState<string>('');
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Model & 3rd party API configuration state (synced with /api/config and localStorage)
  const [modelConfig, setModelConfig] = useState<ModelConfig>(() => {
    try {
      const saved = localStorage.getItem('wechat_msi_model_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return DEFAULT_MODEL_CONFIG;
  });
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  // Sync with server persisted configuration on mount & auto-hydrate workspace with latest generated archive
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setModelConfig((prev) => ({
            ...prev,
            ...data.config,
            apiKey: data.config.apiKey || prev.apiKey,
          }));
        }
      })
      .catch((err) => console.warn('Could not load server config:', err));

    // Auto-load latest generated cluster if current workspace is uninitialized or initial preset
    const hydrateLatestWorkspace = async () => {
      try {
        const isExplicitlyReset = localStorage.getItem('wechat_msi_workspace_reset_flag');
        if (isExplicitlyReset === 'true') {
          return; // User explicitly cleared workspace, respect clean slate!
        }
        const res = await fetch('/api/pipeline/archives');
        const data = await res.json();
        if (data.success && Array.isArray(data.archives) && data.archives.length > 0) {
          const latestArchive: ArticleArchiveItem = data.archives[0];
          const savedWs = localStorage.getItem('wechat_msi_active_workspace');
          if (!savedWs) {
            handleLoadArchiveToWorkspace(latestArchive);
          } else {
            const parsed = JSON.parse(savedWs);
            if (
              !parsed.plan?.cluster_id ||
              parsed.plan.cluster_id === 'cluster-solid-state-battery-2026' ||
              parsed.plan.cluster_id === initialPreset.plan.cluster_id
            ) {
              handleLoadArchiveToWorkspace(latestArchive);
            }
          }
        }
      } catch (err) {
        console.warn('Workspace auto-hydration skipped:', err);
      }
    };
    hydrateLatestWorkspace();
  }, []);

  const handleSaveModelConfig = async (newConfig: ModelConfig) => {
    setModelConfig(newConfig);
    try {
      localStorage.setItem('wechat_msi_model_config', JSON.stringify(newConfig));
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
    } catch (e) {
      console.error('Failed to save model config', e);
    }
  };

  const currentPersona = STYLE_PERSONAS.find((p) => p.id === selectedPersonaId) || STYLE_PERSONAS[0];

  const [isGeneratingAllDrafts, setIsGeneratingAllDrafts] = useState(false);
  const [generatingSlotArc, setGeneratingSlotArc] = useState<Archetype | null>(null);

  // API Call: Generate / Regenerate Plan
  const handleGeneratePlan = async (seed: string, themeCategory?: ThemeCategory, subCategory?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pipeline/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seed,
          themeCategory,
          subCategory,
          personaId: selectedPersonaId,
          referenceSample,
          customTonePrompt,
          apiConfig: modelConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);

        // 1. 同步更新素材工坊信源（与母题动态契合）
        setScrapedMaterials({
          M: `## 【信源素材 #1】关于「${seed}」的一手事实与颠覆性突破\n-- 核心突破：针对 ${seed}，最新产业与学术测试表明关键指标实现跃升。\n-- 传播痛点：破圈科普消除认知门槛，揭开大众最关心的体验与成本差异。`,
          S: `## 【信源素材 #2】关于「${seed}」的核心工艺细节与技术机理\n-- 关键机理：核心技术瓶颈解决路径、显微界面测试与工艺实现路线图。\n-- 实操数据：能耗/阻抗大幅降低，关键临界阈值成倍提升。`,
          I: `## 【信源素材 #3】关于「${seed}」的产业链量产与商业落地路线图\n-- 落地时间表：头部机构验证与产业链配套进展。\n-- 知识图谱：海内外专利与核心商业生态位卡位。`,
        });

        // 2. 动态重置并同步初稿结构（与新大纲、禁区、标题对齐，彻底清除旧预设残留）
        const updatedArticles: Partial<Record<Archetype, DraftArticleOutput>> = { ...articles };
        data.plan.articles.forEach((art: any) => {
          const arc = art.archetype as Archetype;
          updatedArticles[arc] = {
            archetype: arc,
            wechat_title: art.wechat_title,
            digest_summary: art.core_angle,
            markdown_content: buildDynamicArticleMarkdown(art, seed),
            satori_card_data: {
              card_title: art.wechat_title,
              card_subtitle: art.msi_role_label || art.core_angle,
              template_type: 'platform_comparison',
              columns: ['维度', '传统方案', '本次突破'],
              rows: [
                { item_name: '核心指标', metrics: { col1: '常规基准', col2: '突破提升 3~5 倍' }, highlight_tag: '核心突破' },
                { item_name: '落地成本', metrics: { col1: '高昂', col2: '降本 60%+' }, highlight_tag: '产业可行' }
              ],
              footer_note: '数据来源：前沿科学情报与产业验证'
            }
          };
        });
        setArticles(updatedArticles);
      }
    } catch (err) {
      console.error('Plan generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const [autoSaveToast, setAutoSaveToast] = useState<string | null>(null);

  // Helper: Automatically persist current cluster articles to Archives
  const autoSaveToArchives = async (planToSave: DailyClusterPlan, articlesToSave: Partial<Record<Archetype, DraftArticleOutput>>) => {
    try {
      const archetypes: Archetype[] = planToSave.articles?.map((a) => a.archetype) || ['M', 'S', 'I'];
      const archiveItem: ArticleArchiveItem = {
        id: planToSave.cluster_id || `archive_${Date.now()}`,
        created_at: new Date().toISOString(),
        theme_category: planToSave.theme_category || 'clean_energy_materials',
        category_label: planToSave.category_label || '前沿情报',
        seed_topic: planToSave.seed_topic || '前沿技术重构',
        tags: planToSave.tags || ['矩阵发布包', '实战排版', '全套图文'],
        articles: archetypes.map((arc) => {
          const a: Partial<DraftArticleOutput> = articlesToSave[arc] || {};
          const meta = planToSave.articles?.find(art => art.archetype === arc);
          return {
            archetype: arc,
            publish_slot: meta?.publish_slot || (arc === 'M' ? '头条 (1st)' : arc === 'S' ? '次条 (2nd)' : '三条 (3rd)'),
            msi_role_label: meta?.msi_role_label || (arc === 'M' ? '破圈商业算账' : arc === 'S' ? '微观工艺拆解' : '决策避坑图谱'),
            wechat_title: a.wechat_title || meta?.wechat_title || '未命名标题',
            digest_summary: a.digest_summary || meta?.core_angle || '',
            markdown_content: a.markdown_content || '',
            word_count: a.markdown_content ? a.markdown_content.replace(/\s+/g, '').length : 2500,
            image_slots: a.image_slots,
            cover_image_url: a.cover_image_url,
            slot_images: a.slot_images,
            slot_prompts: a.slot_prompts,
          };
        }),
        total_word_count: archetypes.reduce((sum, arc) => {
          const len = articlesToSave[arc]?.markdown_content?.replace(/\s+/g, '').length || 2500;
          return sum + len;
        }, 0),
        status: 'ready_to_publish',
      };

      await fetch('/api/pipeline/archives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(archiveItem),
      });

      try {
        const cached = localStorage.getItem('wechat_msi_local_archives');
        let list: ArticleArchiveItem[] = cached ? JSON.parse(cached) : [];
        const existIdx = list.findIndex((x) => x.id === archiveItem.id);
        if (existIdx >= 0) list[existIdx] = archiveItem;
        else list.unshift(archiveItem);
        localStorage.setItem('wechat_msi_local_archives', JSON.stringify(list));
      } catch (e) {
        // ignore
      }

      setAutoSaveToast('✓ 文章已实时自动沉淀至「历史资料库」，随时支持查看全文与一键复制！');
      setTimeout(() => setAutoSaveToast(null), 4000);
    } catch (archiveErr) {
      console.warn('Auto archiving failed:', archiveErr);
    }
  };

  // 一键由 AI 并行/依次批量生成 M/S/I 全部 3 篇 3000 字去 AI 味长文 + 全套封面与配图 (方案 A) + 自动归档历史资料库
  const handleGenerateAllDrafts = async (targetPlan?: DailyClusterPlan) => {
    const planToUse = targetPlan || plan;
    if (!planToUse || !planToUse.articles || planToUse.articles.length === 0) return;
    setIsGeneratingAllDrafts(true);
    try {
      const updatedArticles: Partial<Record<Archetype, DraftArticleOutput>> = { ...articles };
      for (const art of planToUse.articles) {
        setActiveBatchArchetype(art.archetype);
        try {
          const clusterArticles = planToUse.articles.map((a) => ({
            archetype: a.archetype,
            wechat_title: a.wechat_title,
          }));

          let effectiveContext = scrapedMaterials[art.archetype] || '';
          if (art.is_custom_curated && art.source_article_content) {
            effectiveContext = `【用户自选高价值原文（二创基底）】
原文长度：约 ${art.source_word_count || art.source_article_content.length} 字
原文完整文本：
${art.source_article_content}

【二创深化指令】：
1. 深度消化并吃透上述原文的核心事实、逻辑论据与独家细节。
2. 严禁死板原样抄袭或单纯堆砌，必须以此为素材基底，沿着「前因背景洞察 ➔ 核心机理穿透 ➔ 商业算账/实操避坑SOP ➔ 终局洗牌推演」四大支柱展开全方位深度扩写。
3. 严格遵循节奏推进，通篇深度充实、论据扎实，字数不低于5000字，行文一气呵成绝无断档！`;
          }

          const res = await fetch('/api/pipeline/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              blueprint: art,
              clusterArticles,
              personaId: selectedPersonaId,
              referenceSample,
              scrapedContext: effectiveContext,
              apiConfig: modelConfig,
            }),
          });
          const data = await res.json();
          if (data.success && data.draft) {
            updatedArticles[art.archetype] = data.draft;
            setArticles((prev) => ({
              ...prev,
              [art.archetype]: data.draft,
            }));
          } else {
            if (data.needApiKey) {
              setIsModelModalOpen(true);
            }
            setAutoSaveToast(`⚠️ 批量生成已暂停：${data.error || data.message || '大模型调用失败，请检查 API Key'}`);
            setTimeout(() => setAutoSaveToast(null), 5000);
            setIsGeneratingAllDrafts(false);
            return;
          }
        } catch (draftErr: any) {
          console.error(`Failed to draft ${art.archetype}:`, draftErr);
          setAutoSaveToast(`❌ 撰写异常：${draftErr.message || '网络连接超时'}`);
          setTimeout(() => setAutoSaveToast(null), 5000);
        }
      }

      // 方案 A 自动化：文本生成后，自动调用 Google AI Studio 生图模块批量生成三篇封面与插图
      try {
        const imgRes = await fetch('/api/pipeline/batch-generate-all-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: planToUse,
            articles: updatedArticles,
            apiConfig: modelConfig,
          }),
        });
        const imgData = await imgRes.json();
        if (imgData.success && imgData.articles) {
          setArticles(imgData.articles);
          setAutoSaveToast('✓ 三联包 3 篇长文、2.35:1 摄影封面及正文插图已全部自动生成，并已沉淀至历史资料库！');
          setActiveTab('publisher');
          setCurrentArchetype('M');
          setTimeout(() => setAutoSaveToast(null), 5000);
          return;
        }
      } catch (imgBatchErr) {
        console.warn('Batch image generation encountered issue, proceeding to fallback auto-archive:', imgBatchErr);
      }

      // 兜底自动归档
      await autoSaveToArchives(planToUse, updatedArticles);
      setActiveTab('publisher');
      setCurrentArchetype('M');
    } finally {
      setIsGeneratingAllDrafts(false);
    }
  };

  // API Call: Generate Draft for Archetype
  const handleGenerateDraft = async (arc: Archetype) => {
    setGeneratingSlotArc(arc);
    setIsLoading(true);
    try {
      const blueprint = plan.articles.find((a) => a.archetype === arc) || plan.articles[0];
      const clusterArticles = plan.articles.map((a) => ({
        archetype: a.archetype,
        wechat_title: articles[a.archetype]?.wechat_title || a.wechat_title,
      }));

      let effectiveContext = scrapedMaterials[arc] || '';
      if (blueprint.is_custom_curated && blueprint.source_article_content) {
        effectiveContext = `【用户自选高价值原文（二创基底）】
原文长度：约 ${blueprint.source_word_count || blueprint.source_article_content.length} 字
原文完整文本：
${blueprint.source_article_content}

【二创深化指令】：
1. 深度消化并吃透上述原文的核心事实、逻辑论据与独家细节。
2. 严禁死板原样抄袭或单纯堆砌，必须以此为素材基底，沿着「前因背景洞察 ➔ 核心机理穿透 ➔ 商业算账/实操避坑SOP ➔ 终局洗牌推演」四大支柱展开全方位深度扩写。
3. 严格遵循节奏推进，通篇深度充实、论据扎实，字数不低于5000字，行文一气呵成绝无断档！`;
      } else if (blueprint.wechat_title) {
        effectiveContext = `【选题情报素材与二创立意】
- 原文选题标题：${blueprint.wechat_title}
- 指定切入立意：${blueprint.core_angle || '深入剖析核心机理、商业算账与避坑实操'}
- 栏位定位：${blueprint.msi_role_label || '深度特稿'}
- 推荐大纲支柱：
${blueprint.outline_sections?.map((s) => `  * ${s}`).join('\n') || ''}

【二创深化指令】：
1. 严格围绕上述指定切入立意展开深度二创特稿。
2. 结合行业一线实战与真实成本账本，严禁浮夸空洞套话，正文字数不低于5000字！
${scrapedMaterials[arc] && !scrapedMaterials[arc].includes('固态') ? `\n参考素材补充：\n${scrapedMaterials[arc]}` : ''}`;
      }

      const res = await fetch('/api/pipeline/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprint,
          clusterArticles,
          personaId: selectedPersonaId,
          referenceSample,
          scrapedContext: effectiveContext,
          apiConfig: modelConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.draft) {
        let updatedDraft = data.draft;
        // 同步文章草稿中随文生成的封面规范
        if (updatedDraft.cover_spec) {
          updatedDraft.cover_prompt_en = updatedDraft.cover_spec.prompt_en;
          updatedDraft.cover_prompt_zh = updatedDraft.cover_spec.prompt_zh;
        }

        const newArticles = {
          ...articles,
          [arc]: updatedDraft,
        };
        setArticles(newArticles);

        // 仅本地缓存工作空间状态（防止页面刷新丢失进度），不写入正式历史文库，待用户在02审阅完毕后主动归档
        try {
          localStorage.setItem(
            'wechat_msi_active_workspace',
            JSON.stringify({ plan, articles: newArticles, currentArchetype: arc })
          );
        } catch (e) {
          console.warn('Workspace cache update skipped:', e);
        }

        const meta = SLOT_ARCHETYPE_METADATA[arc];
        const slotTitle = meta ? meta.slotName : `${arc}型`;
        setAutoSaveToast(`✓ 【${slotTitle}】「${updatedDraft.wechat_title.slice(0, 18)}...」撰写完成！已同步至 02 排版工坊。`);
        setTimeout(() => setAutoSaveToast(null), 4000);
      } else {
        if (data.needApiKey) {
          setIsModelModalOpen(true);
        }
        setAutoSaveToast(`⚠️ 生成失败：${data.error || data.message || '大模型调用异常，请检查 API Key 配置'}`);
        setTimeout(() => setAutoSaveToast(null), 5000);
      }
    } catch (err: any) {
      console.error('Draft generation failed:', err);
      setAutoSaveToast(`❌ 撰写请求失败：${err.message || '网络连接超时'}`);
      setTimeout(() => setAutoSaveToast(null), 5000);
    } finally {
      setIsLoading(false);
      setGeneratingSlotArc(null);
    }
  };

  // API Call: Humanize Text (Anti-AI Cliché rewriter)
  const handleHumanizeText = async (arc: Archetype, rawText: string): Promise<string> => {
    try {
      const res = await fetch('/api/pipeline/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawText,
          personaId: selectedPersonaId,
          apiConfig: modelConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        return data.text;
      }
    } catch (err) {
      console.error('Humanize failed:', err);
    }
    return rawText;
  };

  // Update specific article
  const handleUpdateArticle = (arc: Archetype, updated: DraftArticleOutput) => {
    setArticles((prev) => {
      const next = {
        ...prev,
        [arc]: updated,
      };
      try {
        localStorage.setItem(
          'wechat_msi_active_workspace',
          JSON.stringify({ plan, articles: next, currentArchetype })
        );
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const handleSelectArchetype = (arc: Archetype) => {
    setCurrentArchetype(arc);
    try {
      const saved = localStorage.getItem('wechat_msi_active_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.currentArchetype = arc;
        localStorage.setItem('wechat_msi_active_workspace', JSON.stringify(parsed));
      }
    } catch (e) {
      // ignore
    }
  };

  // Update card data for current archetype
  const handleUpdateCardData = (newCardData: SatoriCardPayload) => {
    if (articles[currentArchetype]) {
      setArticles((prev) => ({
        ...prev,
        [currentArchetype]: {
          ...prev[currentArchetype],
          satori_card_data: newCardData,
        },
      }));
    }
  };

  const handleApplyHarvestedSource = (source: any) => {
    setPlan((prev) => ({
      ...prev,
      seed_topic: `基于 [${source.platform === 'twitter' ? 'Twitter' : 'Reddit'}] 爆款二创：${source.title}`,
      source_reference_id: source.id,
    }));
    setScrapedMaterials((prev) => ({
      ...prev,
      M: `## 【信源素材】来自 ${source.author} (${source.platform})\n- 原文标题: ${source.title}\n- 原帖链接: ${source.url}\n\n${source.raw_text}\n\n` + prev.M,
      S: `## 【信源素材】来自 ${source.author} (${source.platform})\n- 原文标题: ${source.title}\n\n${source.raw_text}\n\n` + prev.S,
    }));
    setActiveTab('planner');
  };

  const [useLegacyPlanner, setUseLegacyPlanner] = useState(false);

  const handleFastStudioArticleGenerated = (generatedDraft: DraftArticleOutput, generatedPlan: DailyClusterPlan) => {
    setPlan(generatedPlan);
    setArticles((prev) => ({
      ...prev,
      M: generatedDraft,
    }));
    setCurrentArchetype('M');
    try {
      localStorage.setItem(
        'wechat_msi_active_workspace',
        JSON.stringify({ plan: generatedPlan, articles: { ...articles, M: generatedDraft }, currentArchetype: 'M' })
      );
    } catch {
      // ignore
    }
    setAutoSaveToast('✓ DeepSeek 二创长文已生成！原配图已排版嵌入，可一键复制到公众号后台！');
    setTimeout(() => setAutoSaveToast(null), 4000);
  };

  const handleLoadArchiveToWorkspace = (archive: ArticleArchiveItem) => {
    const newArticles: Partial<Record<Archetype, DraftArticleOutput>> = {};
    archive.articles.forEach((art) => {
      newArticles[art.archetype] = {
        archetype: art.archetype,
        wechat_title: art.wechat_title,
        digest_summary: art.digest_summary,
        markdown_content: art.markdown_content,
        word_count: art.word_count,
        image_slots: art.image_slots,
        satori_card_data: articles[art.archetype]?.satori_card_data || {
          card_title: art.wechat_title,
          card_subtitle: art.digest_summary,
          template_type: 'platform_comparison',
          columns: ['核心指标', '关键结论'],
          rows: [{ item_name: '重点', metrics: { '关键结论': '详见正文' } }],
          footer_note: '历史归档文章数据',
        },
      };
    });
    setArticles(newArticles);

    const newPlan: DailyClusterPlan = {
      cluster_id: archive.id,
      seed_topic: archive.seed_topic,
      theme_category: archive.theme_category,
      category_label: archive.category_label,
      tags: archive.tags,
      cluster_logic_summary: `历史归档长文矩阵：涵盖 ${archive.articles.length} 篇微信深度特稿与实战拆解。`,
      articles: archive.articles.map((art) => {
        const meta = SLOT_ARCHETYPE_METADATA[art.archetype];
        return {
          archetype: art.archetype,
          publish_slot: (art.publish_slot || meta?.slotName || '头条 (1st)') as any,
          msi_role_label: art.msi_role_label || meta?.roleName || '深度特稿',
          wechat_title: art.wechat_title,
          core_angle: art.digest_summary,
          forbidden_scope: meta?.writingGuidance || '严禁空洞与违禁词',
          outline_sections: [
            '01. 真实痛点与反差打脸',
            '02. 深度算账与底层拆解',
            '03. 全网社群避坑实操',
            '04. 终极决策与行动手册',
          ],
          scraper_tasks: [],
          visual_spec: {
            mermaid_flowchart_topic: art.wechat_title,
            satori_card_type: 'platform_comparison',
            card_key_metrics: ['核心指标', '关键结论'],
          },
          cross_links: [],
        };
      }),
    };
    setPlan(newPlan);

    const firstArc = archive.articles[0]?.archetype || 'M';
    setCurrentArchetype(firstArc);
    setActiveTab('publisher');

    try {
      localStorage.setItem(
        'wechat_msi_active_workspace',
        JSON.stringify({ plan: newPlan, articles: newArticles, currentArchetype: firstArc })
      );
    } catch (e) {
      console.warn('Workspace cache failed:', e);
    }
  };

  const handleInquiryAdopted = (newPlan: DailyClusterPlan, newDraft: DraftArticleOutput, archetype: Archetype) => {
    setPlan(newPlan);
    const updated = {
      ...articles,
      [archetype]: newDraft,
    };
    setArticles(updated);
    setCurrentArchetype(archetype);
    setActiveTab('publisher');

    try {
      localStorage.setItem(
        'wechat_msi_active_workspace',
        JSON.stringify({ plan: newPlan, articles: updated, currentArchetype: archetype })
      );
    } catch (e) {
      console.warn('Workspace cache failed:', e);
    }

    setAutoSaveToast(`✓ 已立项「${newDraft.wechat_title}」并生成 4000~6000 字特稿，已自动同步至排版工坊与历史资料库！`);
    setTimeout(() => setAutoSaveToast(null), 5000);
  };

  const handleBatchMatrixGenerated = (newPlan: DailyClusterPlan, newDrafts: Partial<Record<Archetype, DraftArticleOutput>>) => {
    setPlan(newPlan);
    const mergedArticles: Partial<Record<Archetype, DraftArticleOutput>> = {
      ...newDrafts,
    };
    setArticles(mergedArticles);
    const firstArc = newPlan.articles?.[0]?.archetype || 'M';
    setCurrentArchetype(firstArc);
    setActiveTab('publisher');

    try {
      localStorage.setItem(
        'wechat_msi_active_workspace',
        JSON.stringify({ plan: newPlan, articles: mergedArticles, currentArchetype: firstArc })
      );
    } catch (e) {
      console.warn('Workspace cache failed:', e);
    }

    autoSaveToArchives(newPlan, mergedArticles);
    setAutoSaveToast(`🎉 成功批量生成微信公众号推送矩阵（${newPlan.articles?.length || 3} 篇深度长文），已自动载入排版工坊！`);
    setTimeout(() => setAutoSaveToast(null), 5000);
  };

  const handleResetWorkspace = () => {
    if (!window.confirm('确定要彻底重置工作台吗？\n将清空排期池、已撰写草稿与本地活动缓存，恢复空白初始状态。')) {
      return;
    }
    const emptyPlan: DailyClusterPlan = {
      cluster_id: `cluster-${Date.now()}`,
      seed_topic: '待匹配选题',
      theme_category: 'practical_tutorials_sop',
      category_label: '实战拆解',
      cluster_logic_summary: '待匹配全新微信推文选题矩阵',
      articles: [
        {
          archetype: 'M',
          publish_slot: '头条 (1st)',
          msi_role_label: '深度特稿',
          wechat_title: '头条 · 待匹配选题',
          core_angle: '从下方候选选题中点击加入或录入自选文章',
          forbidden_scope: '避免套话口号',
          outline_sections: ['选题核心机理剖析', '关键参数与工艺拆解', '商业算账与避坑手册', '长效护城河构建'],
          scraper_tasks: [],
          visual_spec: {
            mermaid_flowchart_topic: '核心事实与全链路架构',
            satori_card_type: 'platform_comparison',
            card_key_metrics: ['核心突破', '良品率', '综合成本'],
          },
          cross_links: [],
        },
        {
          archetype: 'S',
          publish_slot: '次条 (2nd)',
          msi_role_label: '实战拆解',
          wechat_title: '次条 · 待匹配选题',
          core_angle: '从下方候选选题中点击加入或录入自选文章',
          forbidden_scope: '避免套话口号',
          outline_sections: ['选题核心机理剖析', '关键参数与工艺拆解', '商业算账与避坑手册', '长效护城河构建'],
          scraper_tasks: [],
          visual_spec: {
            mermaid_flowchart_topic: '核心事实与全链路架构',
            satori_card_type: 'platform_comparison',
            card_key_metrics: ['核心突破', '良品率', '综合成本'],
          },
          cross_links: [],
        },
        {
          archetype: 'I',
          publish_slot: '三条 (3rd)',
          msi_role_label: '产业算账',
          wechat_title: '三条 · 待匹配选题',
          core_angle: '从下方候选选题中点击加入或录入自选文章',
          forbidden_scope: '避免套话口号',
          outline_sections: ['选题核心机理剖析', '关键参数与工艺拆解', '商业算账与避坑手册', '长效护城河构建'],
          scraper_tasks: [],
          visual_spec: {
            mermaid_flowchart_topic: '核心事实与全链路架构',
            satori_card_type: 'platform_comparison',
            card_key_metrics: ['核心突破', '良品率', '综合成本'],
          },
          cross_links: [],
        },
      ],
    };
    setPlan(emptyPlan);
    setArticles({});
    try {
      localStorage.removeItem('wechat_msi_active_workspace');
      localStorage.setItem('wechat_msi_workspace_reset_flag', 'true');
    } catch {
      // ignore
    }
    setAutoSaveToast('✓ 工作台已彻底清空重置，排期池已归零，可从零开始挑选今日最新素材！');
    setTimeout(() => setAutoSaveToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenStyleModal={() => setIsStyleModalOpen(true)}
        currentPersonaName={currentPersona.name}
        onOpenModelModal={() => setIsModelModalOpen(true)}
        activeProvider={modelConfig.provider}
        activeModel={modelConfig.model}
        onResetWorkspace={handleResetWorkspace}
      />

      {/* Main View Area (Full-Width Flat Ergonomic Workspace) */}
      <main className="flex-1 w-full px-3 sm:px-5 lg:px-6 py-4 max-w-none">
        {activeTab === 'planner' && (
          useLegacyPlanner ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium">当前处于旧版全矩阵排期池视图 (含 15 个分类与 3 槽矩阵)</span>
                <button
                  type="button"
                  onClick={() => setUseLegacyPlanner(false)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer transition-colors"
                >
                  ← 返回极简一手信源雷达 & DeepSeek 二创工坊
                </button>
              </div>
              <PlannerView
                plan={plan}
                onUpdatePlan={setPlan}
                articles={articles}
                onUpdateArticles={setArticles}
                onGenerateSingleSlot={handleGenerateDraft}
                generatingSlotArc={generatingSlotArc}
                onGeneratePlan={handleGeneratePlan}
                isLoading={isLoading}
                onNavigateToPublisher={(arc) => {
                  handleSelectArchetype(arc);
                  setActiveTab('publisher');
                }}
                onOpenModelModal={() => setIsModelModalOpen(true)}
                activeProvider={modelConfig.provider}
                activeModel={modelConfig.model}
                modelConfig={modelConfig}
                onBatchMatrixGenerated={handleBatchMatrixGenerated}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setUseLegacyPlanner(true)}
                  className="text-xs text-slate-400 hover:text-slate-700 font-medium px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                  title="切换至旧版 3 篇矩阵排期调度器"
                >
                  切换至旧版全矩阵排期池 (高级模式) →
                </button>
              </div>
              <FastKeywordRadarStudio
                modelConfig={modelConfig}
                onOpenModelModal={() => setIsModelModalOpen(true)}
                onArticleGenerated={handleFastStudioArticleGenerated}
                onNavigateToPublisher={() => {
                  handleSelectArchetype('M');
                  setActiveTab('publisher');
                }}
              />
            </div>
          )
        )}

        {activeTab === 'publisher' && (
          <WeChatPublisherView
            plan={plan}
            currentArchetype={currentArchetype}
            onSelectArchetype={handleSelectArchetype}
            articles={articles}
            onUpdateArticle={handleUpdateArticle}
            onNavigateToPlanner={() => setActiveTab('planner')}
            onNavigateToArchive={() => setActiveTab('archive')}
            modelConfig={modelConfig}
            onGenerateDraft={handleGenerateDraft}
            isLoadingDraft={generatingSlotArc === currentArchetype || isLoading}
          />
        )}

        {activeTab === 'archive' && (
          <ArchiveView
            onLoadArchiveToWorkspace={handleLoadArchiveToWorkspace}
            onNavigateToPublisher={(arc) => {
              handleSelectArchetype(arc);
              setActiveTab('publisher');
            }}
            onNavigateToPlanner={() => setActiveTab('planner')}
          />
        )}
      </main>

      {/* Style & Tone Modal */}
      <StyleClonerModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        selectedPersonaId={selectedPersonaId}
        onSelectPersona={setSelectedPersonaId}
        referenceSample={referenceSample}
        onUpdateReferenceSample={setReferenceSample}
        customTonePrompt={customTonePrompt}
        onUpdateCustomTone={setCustomTonePrompt}
      />

      {/* Model & 3rd Party API Config Modal (SiliconFlow, Gemini, OpenAI-compatible) */}
      <ModelConfigModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        config={modelConfig}
        onSave={handleSaveModelConfig}
      />

      {/* Long Article Step-by-Step Generation Progress Indicator Modal */}
      <StepProgressModal
        isOpen={isLoading || isGeneratingAllDrafts}
        isAllDrafts={isGeneratingAllDrafts}
        currentArchetype={currentArchetype}
        activeBatchArchetype={activeBatchArchetype}
        articleTitle={
          isGeneratingAllDrafts
            ? plan.articles.find((a) => a.archetype === activeBatchArchetype)?.wechat_title || plan.seed_topic
            : plan.articles.find((a) => a.archetype === currentArchetype)?.wechat_title || plan.seed_topic
        }
      />

      {/* Auto-Save & Generation Floating Toast Notification */}
      {autoSaveToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-slideUp border border-slate-700 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="leading-snug">{autoSaveToast}</span>
          <button
            onClick={() => setAutoSaveToast(null)}
            className="ml-2 text-slate-400 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-400">
        <span>微信公众号 M/S/I 黄金三联包全流程生产与排版工作台 · 内置去 AI 味特稿引擎与 16:9 横图规范 (4000~6000字)</span>
      </footer>
    </div>
  );
}
