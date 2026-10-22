import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import {
  Copy,
  Check,
  Smartphone,
  Share2,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  Sparkles,
  Eye,
  Sliders,
  ExternalLink,
  Wand2,
  Camera,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Monitor,
  Maximize2,
  ChevronRight,
  SlidersHorizontal,
  Archive,
  BookmarkPlus,
  Compass,
  Target,
  Upload,
  Trash2,
  Link,
  ZoomIn,
  X,
  Package,
  MapPin,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import type { DraftArticleOutput, Archetype, DailyClusterPlan, ImageSlotDirective, ArticleArchiveItem, ModelConfig } from '../types/pipeline';
import { SLOT_ARCHETYPE_METADATA } from '../types/pipeline';
import { assembleCrossLinkHooks, countWords, extractImageSlots, cleanAllBannedWords } from '../utils/aiLinter';
import { stripAllEmojis } from '../utils/headlineEngine';
import { DAILY_TOPICS } from '../data/dailyTopics';
import { WeChatCoverStudio } from './WeChatCoverStudio';
import { AlternativeTitlesModal } from './AlternativeTitlesModal';

interface WeChatPublisherViewProps {
  plan: DailyClusterPlan;
  currentArchetype: Archetype;
  onSelectArchetype: (arc: Archetype) => void;
  articles: Partial<Record<Archetype, DraftArticleOutput>>;
  onUpdateArticle?: (arc: Archetype, updated: DraftArticleOutput) => void;
  onNavigateToPlanner?: () => void;
  onNavigateToArchive?: () => void;
  modelConfig?: ModelConfig;
  onGenerateDraft?: (arc: Archetype) => Promise<void>;
  isLoadingDraft?: boolean;
}

export const WeChatPublisherView: React.FC<WeChatPublisherViewProps> = ({
  plan,
  currentArchetype,
  onSelectArchetype,
  articles,
  onUpdateArticle,
  onNavigateToPlanner,
  onNavigateToArchive,
  modelConfig,
  onGenerateDraft,
  isLoadingDraft = false,
}) => {
  // Navigation & View Mode
  const [activeViewTab, setActiveViewTab] = useState<'walkthrough' | 'prompt_studio' | 'split' | 'cover_studio' | 'editor'>('split');
  const [cleanFeedback, setCleanFeedback] = useState<string | null>(null);
  const [targetEngine, setTargetEngine] = useState<'gemini' | 'midjourney_flux'>('gemini');
  const [customSlotPrompts, setCustomSlotPrompts] = useState<Record<string, string>>({});
  const [isRegeneratingSlot, setIsRegeneratingSlot] = useState<string | null>(null);

  // Cover image prompt & regeneration state
  const [isRegeneratingCover, setIsRegeneratingCover] = useState(false);
  const [customCoverPrompt, setCustomCoverPrompt] = useState<string>('');
  const [copiedCoverPrompt, setCopiedCoverPrompt] = useState(false);

  // Clipboard States
  const [copiedRich, setCopiedRich] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedNegativeId, setCopiedNegativeId] = useState<string | null>(null);
  const [copiedGeminiPromptId, setCopiedGeminiPromptId] = useState<string | null>(null);

  // Bidirectional Jump & Highlight States
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [highlightedSlotId, setHighlightedSlotId] = useState<string | null>(null);

  // Archive State
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveSuccess, setArchiveSuccess] = useState(false);

  // Asset Packaging (ZIP) & Anti-Broken Image States
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);
  const [hotlinkToast, setHotlinkToast] = useState<string | null>(null);

  // Uploaded/Imported Material Images State (persisted to draft.slot_images)
  const [activeUploadSlotKey, setActiveUploadSlotKey] = useState<string | null>(null);
  const [urlInputModalSlotKey, setUrlInputModalSlotKey] = useState<string | null>(null);
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const slotFileInputRef = React.useRef<HTMLInputElement>(null);

  // ESC key listener for lightbox modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxImage) {
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage]);

  // AI Prompt Studio States
  const [customStyle, setCustomStyle] = useState<'documentary' | 'desk' | 'cinematic' | 'minimalist'>('documentary');
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [customSlots, setCustomSlots] = useState<Partial<Record<Archetype, ImageSlotDirective[] | null>>>({
    M: null,
    S: null,
    I: null,
  });
  const [generationSummary, setGenerationSummary] = useState<string | null>(null);

  const blueprint = plan.articles.find((a) => a.archetype === currentArchetype) || plan.articles[0];
  const fallbackDraft: DraftArticleOutput = {
    archetype: currentArchetype,
    wechat_title: blueprint?.wechat_title || '未命名标题',
    digest_summary: blueprint?.core_angle || '',
    markdown_content: `# ${blueprint?.wechat_title || '未命名标题'}\n\n> 导读：本篇 5000+ 字深度特稿尚未生成，请点击上方「AI 立即撰写此篇」或在首页挑选深度素材一键撰写。\n\n## 核心切入点与全局透视\n\n> 核心提要：本章节待撰写生成，生成后将包含一手实地调研机理、多维度技术参数与算账推演。\n\n正文待生成...`,
    satori_card_data: {
      card_title: blueprint?.wechat_title || '标题',
      card_subtitle: blueprint?.core_angle || '要点',
      template_type: 'platform_comparison',
      columns: ['维度', '常规', '突破'],
      rows: [{ item_name: '重点', metrics: { '常规': '基准', '突破': '提升' } }],
      footer_note: '微信公众号全流程排版',
    },
  };
  const draft: DraftArticleOutput = articles[currentArchetype] || fallbackDraft;
  const isDraftReady = Boolean(
    articles[currentArchetype]?.markdown_content &&
      !articles[currentArchetype]?.markdown_content.includes('正文待生成...')
  );
  const slotImages: Record<string, string> = draft?.slot_images || {};

  // Tracks which slots have explicitly activated AI Recreation mode (overriding default source image view)
  const [recreationActiveSlots, setRecreationActiveSlots] = useState<Record<string, boolean>>({});

  // Auto-inherit authentic source media URLs from blueprint, draft, or matching topic in DAILY_TOPICS
  const sourceMediaUrls: string[] = React.useMemo(() => {
    if (blueprint?.source_media_urls && blueprint.source_media_urls.length > 0) {
      return blueprint.source_media_urls;
    }
    if (draft?.source_media_urls && draft.source_media_urls.length > 0) {
      return draft.source_media_urls;
    }
    const matched = DAILY_TOPICS.find(
      (t: any) =>
        t.title === blueprint?.wechat_title ||
        (blueprint?.wechat_title && t.title.includes(blueprint.wechat_title)) ||
        (blueprint?.wechat_title && blueprint.wechat_title.includes(t.title)) ||
        t.title === plan.seed_topic ||
        (plan.seed_topic && plan.seed_topic.includes(t.title))
    );
    if (matched?.media_urls && matched.media_urls.length > 0) {
      return matched.media_urls;
    }
    return [];
  }, [blueprint, draft, plan.seed_topic]);

  const handleUpdateSlotImage = (slotKey: string, imageUrl: string | null) => {
    const updated = { ...slotImages };
    if (imageUrl) {
      updated[slotKey] = imageUrl;
    } else {
      delete updated[slotKey];
    }
    if (onUpdateArticle && draft) {
      onUpdateArticle(currentArchetype, {
        ...draft,
        slot_images: updated,
      });
    }
  };

  const [isAlternativeTitlesModalOpen, setIsAlternativeTitlesModalOpen] = useState(false);

  const handleSelectAlternativeTitle = (newTitle: string) => {
    if (!draft || !onUpdateArticle) return;
    const oldTitle = draft.wechat_title;
    const cleanNewTitle = stripAllEmojis(newTitle.trim());

    let updatedMarkdown = draft.markdown_content || '';
    if (oldTitle && updatedMarkdown.includes(`# ${oldTitle}`)) {
      updatedMarkdown = updatedMarkdown.replace(`# ${oldTitle}`, `# ${cleanNewTitle}`);
    } else if (updatedMarkdown.startsWith('# ')) {
      updatedMarkdown = updatedMarkdown.replace(/^#\s+[^\n]+/, `# ${cleanNewTitle}`);
    }

    onUpdateArticle(currentArchetype, {
      ...draft,
      wechat_title: cleanNewTitle,
      markdown_content: updatedMarkdown,
    });
  };

  const handleClearCurrentDraft = () => {
    if (!window.confirm(`确定要清空【${blueprint?.publish_slot || currentArchetype}】当前草稿并重新撰写吗？`)) {
      return;
    }
    if (onUpdateArticle) {
      onUpdateArticle(currentArchetype, {
        archetype: currentArchetype,
        wechat_title: blueprint?.wechat_title || '未命名选题',
        digest_summary: blueprint?.core_angle || '',
        markdown_content: `# ${blueprint?.wechat_title || '未命名标题'}\n\n> 导读：本篇 5000+ 字深度特稿尚未生成，请点击上方「AI 立即撰写此篇」或在首页挑选深度素材一键撰写。\n\n## 核心切入点与全局透视\n\n> 核心提要：本章节待撰写生成，生成后将包含一手实地调研机理、多维度技术参数与算账推演。\n\n正文待生成...`,
        satori_card_data: {
          card_title: blueprint?.wechat_title || '标题',
          card_subtitle: blueprint?.core_angle || '要点',
          template_type: 'platform_comparison',
          columns: ['维度', '常规', '突破'],
          rows: [{ item_name: '重点', metrics: { '常规': '基准', '突破': '提升' } }],
          footer_note: '微信公众号全流程排版',
        },
      });
    }
  };

  const handleRegenerateSlotImage = async (slot: ImageSlotDirective, slotKey: string, customPrompt?: string) => {
    setIsRegeneratingSlot(slotKey);
    try {
      const promptToUse =
        customPrompt && customPrompt.trim()
          ? customPrompt.trim()
          : customSlotPrompts[slotKey] || slot.ai_prompt_en || `documentary photo of ${slot.title}, 35mm lens, natural daylight, high contrast, zero cgi glow, zero plastic sheen --ar 16:9 --style raw`;

      const res = await fetch('/api/pipeline/generate-slot-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slotKey,
          slotTitle: slot.title,
          promptEn: promptToUse,
          promptZh: slot.ai_prompt_zh || slot.description,
          negativePrompt: slot.negative_prompt,
          aspectRatio: slot.aspect_ratio || '16:9',
          themeCategory: plan.theme_category,
          apiConfig: modelConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        handleUpdateSlotImage(slotKey, data.imageUrl);
        setCustomSlotPrompts((prev) => ({ ...prev, [slotKey]: promptToUse }));
      }
    } catch (err) {
      console.error('Failed to regenerate slot image in publisher view:', err);
    } finally {
      setIsRegeneratingSlot(null);
    }
  };

  const handleRegenerateCover = async () => {
    setIsRegeneratingCover(true);
    try {
      const promptToUse = customCoverPrompt.trim() || draft?.cover_prompt_en || `An ultra-wide panoramic 2.35:1 aspect ratio documentary editorial photograph of ${draft?.wechat_title || blueprint.wechat_title}, cinematic framing, natural ambient lighting, 35mm Leica lens, high contrast chiaroscuro, clean dark minimalist composition. Crucial composition rule: The image contains absolutely zero text, zero letters, zero numbers, and no typography whatsoever.`;
      const res = await fetch('/api/pipeline/generate-cover-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: draft?.wechat_title || blueprint.wechat_title,
          summary: draft?.digest_summary || blueprint.core_angle,
          archetype: currentArchetype,
          themeCategory: plan.theme_category,
          apiConfig: modelConfig,
          customPrompt: promptToUse,
          customPromptEn: promptToUse,
        }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl && onUpdateArticle && draft) {
        onUpdateArticle(currentArchetype, {
          ...draft,
          cover_image_url: data.imageUrl,
          cover_prompt_en: promptToUse,
        });
      }
    } catch (err) {
      console.error('Failed to regenerate cover:', err);
    } finally {
      setIsRegeneratingCover(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadSlotKey) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        handleUpdateSlotImage(activeUploadSlotKey, dataUrl);
        setActiveUploadSlotKey(null);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const clusterSummary = plan.articles.map((a) => ({
    archetype: a.archetype,
    wechat_title: articles[a.archetype]?.wechat_title || a.wechat_title,
  }));

  const fullMarkdown = assembleCrossLinkHooks(
    draft?.markdown_content || '',
    clusterSummary,
    currentArchetype
  );

  const wordCount = countWords(fullMarkdown);
  const readMinutes = Math.max(3, Math.round(wordCount / 400));

  const handleCleanBannedWords = () => {
    if (!draft || !onUpdateArticle) return;
    const raw = draft.markdown_content || '';
    const res = cleanAllBannedWords(raw, []);
    onUpdateArticle(currentArchetype, {
      ...draft,
      markdown_content: res.cleanedText,
    });
    setCleanFeedback(`✓ 已自动清洗 ${res.replacedCount} 处 AI 八股与违禁词！`);
    setTimeout(() => setCleanFeedback(null), 4000);
  };

  // Extract or fetch slots
  const baseSlots = extractImageSlots(fullMarkdown);
  const activeSlots = customSlots[currentArchetype] || baseSlots;

  // Detect external non-dataUrl hotlink images in markdown content and slot images
  const externalHotlinkImages = React.useMemo(() => {
    const list: { alt: string; url: string; source: 'markdown' | 'slot' }[] = [];
    
    // 1. Scan markdown content for images
    const mdImgRegex = /!\[(.*?)\]\((https?:\/\/[^)]+)\)/g;
    let match;
    while ((match = mdImgRegex.exec(fullMarkdown)) !== null) {
      if (!match[2].startsWith('data:')) {
        list.push({ alt: match[1] || '正文插图', url: match[2], source: 'markdown' });
      }
    }

    // 2. Scan uploaded slot images for remote urls
    Object.entries(slotImages).forEach(([key, url]) => {
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        const slot = activeSlots.find((s) => s.slot_id === key);
        list.push({ alt: slot?.title || '插槽配图', url, source: 'slot' });
      }
    });

    return list;
  }, [fullMarkdown, slotImages, activeSlots]);

  // Jump from right panel prompt card or quick jump bar to left phone screen slot with precise container scrolling
  const handleScrollToSlotInPhone = (slotId: string, slotIdx?: number) => {
    setSelectedSlotId(slotId);
    if (activeViewTab === 'prompt_studio') {
      setActiveViewTab('split');
    }
    setTimeout(() => {
      // Find element by slot ID, slot number, or slot index
      const numFromId = slotId.replace(/[^0-9]/g, '');
      const element =
        document.getElementById(`mobile_slot_${slotId}`) ||
        (numFromId ? document.getElementById(`mobile_slot_slot_${numFromId}`) : null) ||
        (numFromId ? document.getElementById(`mobile_slot_${numFromId}`) : null) ||
        (numFromId ? (document.querySelector(`[data-slot-num="${numFromId}"]`) as HTMLElement) : null) ||
        (slotIdx !== undefined ? (document.querySelector(`[data-slot-idx="${slotIdx}"]`) as HTMLElement) : null);

      const container = document.getElementById('wechat_phone_scroll_container');
      if (element && container) {
        const containerRect = container.getBoundingClientRect();
        const elemRect = element.getBoundingClientRect();
        const targetScrollTop = elemRect.top - containerRect.top + container.scrollTop - 60;
        container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
        setHighlightedSlotId(slotId);
        setTimeout(() => setHighlightedSlotId(null), 3500);
      } else if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedSlotId(slotId);
        setTimeout(() => setHighlightedSlotId(null), 3500);
      }
    }, 60);
  };

  // Jump from left phone screen image placeholder to right panel prompt card
  const handleSelectSlotFromPhone = (slotId: string, activateRecreation: boolean = false) => {
    setSelectedSlotId(slotId);
    if (activateRecreation) {
      setRecreationActiveSlots((prev) => ({ ...prev, [slotId]: true }));
    }
    if (activeViewTab === 'walkthrough') {
      setActiveViewTab('split');
    }
    setTimeout(() => {
      const element = document.getElementById(`studio_slot_${slotId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  // Save current cluster (1, 3, or 5 articles) into archives
  const handleSaveToArchive = async () => {
    setIsArchiving(true);
    try {
      const activeArcs: Archetype[] =
        plan.articles && plan.articles.length > 0
          ? plan.articles.map((a) => a.archetype)
          : Object.keys(articles).length > 0
          ? (Object.keys(articles) as Archetype[])
          : (['M', 'S', 'I'] as Archetype[]);

      const allArticles = activeArcs.map((arc) => {
        const bp = plan.articles.find((a) => a.archetype === arc) || plan.articles[0];
        const art = articles[arc];
        const md = art?.markdown_content || '';
        const meta = SLOT_ARCHETYPE_METADATA[arc];
        return {
          archetype: arc,
          publish_slot: bp?.publish_slot || (meta?.slotName as any) || '头条 (1st)',
          msi_role_label: bp?.msi_role_label || meta?.roleName || '深度特稿',
          wechat_title: art?.wechat_title || bp?.wechat_title || '未命名标题',
          digest_summary: art?.digest_summary || bp?.core_angle || '',
          markdown_content: md,
          word_count: countWords(md),
          image_slots: activeSlots,
        };
      });

      const totalWords = allArticles.reduce((acc, curr) => acc + curr.word_count, 0);

      const archiveItem: ArticleArchiveItem = {
        id: `arch-${Date.now()}`,
        created_at: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        theme_category: plan.theme_category || 'global_digital_biz',
        category_label: plan.category_label || '前沿题材',
        seed_topic: plan.seed_topic,
        tags: plan.tags || ['前沿选题', 'MSI黄金三角'],
        total_word_count: totalWords,
        status: 'ready_to_publish',
        articles: allArticles,
      };

      const res = await fetch('/api/pipeline/archives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(archiveItem),
      });
      const data = await res.json();
      if (data.success) {
        setArchiveSuccess(true);
        try {
          const cached = localStorage.getItem('wechat_msi_local_archives');
          const existing = cached ? JSON.parse(cached) : [];
          const updated = [archiveItem, ...existing.filter((a: any) => a.id !== archiveItem.id)];
          localStorage.setItem('wechat_msi_local_archives', JSON.stringify(updated));
        } catch {
          // ignore
        }
        setTimeout(() => setArchiveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save archive:', err);
    } finally {
      setIsArchiving(false);
    }
  };

  // Handler: Batch Package All Visual Assets into ZIP for WeChat Safe Publishing
  const handleDownloadAssetZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const title = draft?.wechat_title || blueprint.wechat_title || '微信长文';
      const cleanTitle = title.replace(/[\\/:*?"<>|]/g, '_').slice(0, 20);
      const categoryName = plan.category_label || '前沿题材';

      // 1. Cover SVG (2.35:1)
      const coverSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="460" viewBox="0 0 1080 460">
  <defs>
    <linearGradient id="coverBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="50%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>
    <radialGradient id="beam" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="460" fill="url(#coverBg)"/>
  <rect width="1080" height="460" fill="url(#beam)"/>
  <line x1="40" y1="40" x2="60" y2="40" stroke="#38bdf8" stroke-width="1.5" opacity="0.5"/>
  <line x1="50" y1="30" x2="50" y2="50" stroke="#38bdf8" stroke-width="1.5" opacity="0.5"/>
  <line x1="1020" y1="40" x2="1040" y2="40" stroke="#38bdf8" stroke-width="1.5" opacity="0.5"/>
  <line x1="1030" y1="30" x2="1030" y2="50" stroke="#38bdf8" stroke-width="1.5" opacity="0.5"/>
  <line x1="50" y1="410" x2="1030" y2="410" stroke="#ffffff" stroke-width="1" opacity="0.15"/>
  <text x="50" y="70" font-family="-apple-system, sans-serif" font-size="14" font-weight="bold" fill="#38bdf8">● ${categoryName} · ${currentArchetype}型破圈重构</text>
  <text x="1030" y="70" text-anchor="end" font-family="monospace" font-size="12" fill="#94a3b8">[ 2.35:1 WECHAT COVER // 1080x460 ]</text>
  <text x="50" y="210" font-family="-apple-system, 'PingFang SC', sans-serif" font-size="38" font-weight="900" fill="#ffffff">${title.replace(/&/g, '&amp;').slice(0, 24)}</text>
  <text x="50" y="260" font-family="-apple-system, 'PingFang SC', sans-serif" font-size="20" font-weight="500" fill="#94a3b8">${(draft?.digest_summary || blueprint.core_angle).replace(/&/g, '&amp;').slice(0, 42)}</text>
  <text x="50" y="432" font-family="monospace" font-size="11" fill="#64748b">— 实战极客手记 · 深度特稿出品 —</text>
  <text x="1030" y="432" text-anchor="end" font-family="monospace" font-size="11" fill="#10b981">1:1 正方形安全裁切保护生效 ✓</text>
</svg>`;
      zip.file(`00_微信2.35x1封面_${currentArchetype}型.svg`, coverSvg);

      // 2. 1080px Satori Card SVG
      const cardData = draft?.satori_card_data;
      const cardTitle = (cardData?.card_title || title).replace(/&/g, '&amp;');
      const cardSubtitle = (cardData?.card_subtitle || `${currentArchetype}型特稿核心拆解`).replace(/&/g, '&amp;');
      const columns = cardData?.columns || ['维度', '常规认知', '深度突破'];
      const rows = cardData?.rows || [
        { item_name: '核心指标', metrics: { col1: '传统基准', col2: '突破提升 3~5 倍' }, highlight_tag: '核心突破' },
        { item_name: '落地成本', metrics: { col1: '高昂', col2: '降本 60%+' }, highlight_tag: '产业可行' }
      ];
      const footer = (cardData?.footer_note || '数据来源：前沿科学情报与产业实测').replace(/&/g, '&amp;');

      let rowY = 320;
      let rowsSvg = '';
      rows.forEach((r: any, idx: number) => {
        const bgFill = idx % 2 === 0 ? '#1f2937' : '#111827';
        const tagSvg = r.highlight_tag ? `<rect x="840" y="${rowY + 18}" width="140" height="28" rx="6" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-width="1"/><text x="910" y="${rowY + 37}" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="13" font-weight="bold" fill="#fcd34d">${r.highlight_tag}</text>` : '';
        rowsSvg += `
          <rect x="60" y="${rowY}" width="960" height="64" rx="8" fill="${bgFill}"/>
          <text x="90" y="${rowY + 38}" font-family="-apple-system, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">${(r.item_name || '维度').replace(/&/g, '&amp;')}</text>
          <text x="360" y="${rowY + 38}" font-family="-apple-system, sans-serif" font-size="15" fill="#9ca3af">${String(r.metrics?.col1 || r.metrics?.['常规基准'] || '-').replace(/&/g, '&amp;')}</text>
          <text x="640" y="${rowY + 38}" font-family="-apple-system, sans-serif" font-size="15" font-weight="bold" fill="#38bdf8">${String(r.metrics?.col2 || r.metrics?.['突破提升 3~5 倍'] || '-').replace(/&/g, '&amp;')}</text>
          ${tagSvg}
        `;
        rowY += 76;
      });

      const cardSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440">
  <rect width="1080" height="1440" fill="#0f172a"/>
  <rect x="40" y="40" width="1000" height="1360" rx="20" fill="#18181b" stroke="#27272a" stroke-width="2"/>
  <text x="80" y="100" font-family="monospace" font-size="13" fill="#f59e0b" font-weight="bold" letter-spacing="2">M/S/I MASTER ARCHETYPE · ${currentArchetype}型专属配图</text>
  <rect x="880" y="78" width="120" height="30" rx="6" fill="#f59e0b" fill-opacity="0.1" stroke="#f59e0b" stroke-width="1"/>
  <text x="940" y="98" text-anchor="middle" font-family="monospace" font-size="13" font-weight="bold" fill="#fcd34d">1080PX 竖版高清</text>
  <line x1="80" y1="130" x2="1000" y2="130" stroke="#27272a" stroke-width="1.5"/>
  <text x="80" y="185" font-family="-apple-system, sans-serif" font-size="32" font-weight="900" fill="#ffffff">${cardTitle.slice(0, 22)}</text>
  <text x="80" y="225" font-family="-apple-system, sans-serif" font-size="16" fill="#a1a1aa">${cardSubtitle.slice(0, 36)}</text>
  <rect x="60" y="260" width="960" height="44" rx="6" fill="#27272a"/>
  <text x="90" y="288" font-family="-apple-system, sans-serif" font-size="14" font-weight="bold" fill="#e4e4e7">${columns[0] || '项目'}</text>
  <text x="360" y="288" font-family="-apple-system, sans-serif" font-size="14" font-weight="bold" fill="#e4e4e7">${columns[1] || '传统方案'}</text>
  <text x="640" y="288" font-family="-apple-system, sans-serif" font-size="14" font-weight="bold" fill="#e4e4e7">${columns[2] || '本次突破'}</text>
  <text x="890" y="288" font-family="-apple-system, sans-serif" font-size="14" font-weight="bold" fill="#e4e4e7">评定标签</text>
  ${rowsSvg}
  <line x1="80" y1="1330" x2="1000" y2="1330" stroke="#27272a" stroke-width="1.5"/>
  <text x="80" y="1365" font-family="-apple-system, sans-serif" font-size="13" fill="#71717a">${footer}</text>
  <text x="1000" y="1365" text-anchor="end" font-family="monospace" font-size="12" fill="#f59e0b">实战极客手记 · Satori Studio</text>
</svg>`;
      zip.file(`01_1080px高密度数据卡片_${currentArchetype}型.svg`, cardSvg);

      // 3. Process each image slot
      for (let i = 0; i < activeSlots.length; i++) {
        const slot = activeSlots[i];
        const slotKey = slot.slot_id;
        const uploadedImg = slotImages[slotKey] || sourceMediaUrls[i];
        const slotFileNamePrefix = `0${i + 2}_配图插槽_${i + 1}_${(slot.title || '插图').replace(/[\\/:*?"<>|]/g, '_').slice(0, 15)}`;

        if (uploadedImg) {
          if (uploadedImg.startsWith('data:image/png;base64,')) {
            const b64 = uploadedImg.replace(/^data:image\/png;base64,/, '');
            zip.file(`${slotFileNamePrefix}.png`, b64, { base64: true });
          } else if (uploadedImg.startsWith('data:image/jpeg;base64,') || uploadedImg.startsWith('data:image/jpg;base64,')) {
            const b64 = uploadedImg.replace(/^data:image\/jpeg;base64,/, '').replace(/^data:image\/jpg;base64,/, '');
            zip.file(`${slotFileNamePrefix}.jpg`, b64, { base64: true });
          } else if (uploadedImg.startsWith('data:image/svg+xml')) {
            const svgContent = decodeURIComponent(uploadedImg.replace(/^data:image\/svg\+xml(?:;utf8)?,/, ''));
            zip.file(`${slotFileNamePrefix}.svg`, svgContent);
          } else {
            zip.file(`${slotFileNamePrefix}_外链说明.txt`, `配图外链地址：\n${uploadedImg}\n\n微信公众号后台有严格防盗链，直接引用会导致裂图。请在浏览器中右键另存此图片后，手动拖入微信后台图文素材库。`);
          }
        } else {
          // Placeholder guidance card
          const directiveSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="1280" height="720" fill="#0f172a"/>
  <rect x="40" y="40" width="1200" height="640" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2" stroke-dasharray="8 8"/>
  <text x="640" y="140" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="32" font-weight="bold" fill="#ffffff">📸 配图插槽 #${i + 1}：${(slot.title || '实操插图').replace(/&/g, '&amp;')}</text>
  <text x="640" y="190" text-anchor="middle" font-family="monospace" font-size="18" fill="#38bdf8">[ 建议规格: ${slot.recommended_size || '16:9 横屏 (1280x720)'} ]</text>
  <rect x="100" y="240" width="1080" height="320" rx="12" fill="#090d16" stroke="#334155" stroke-width="1"/>
  <text x="140" y="290" font-family="-apple-system, sans-serif" font-size="18" font-weight="bold" fill="#fcd34d">🎬 构图拍摄指引：</text>
  <text x="140" y="330" font-family="-apple-system, sans-serif" font-size="15" fill="#cbd5e1">${(slot.description || '真实办公与实操纪实抓拍').slice(0, 60)}</text>
  <text x="140" y="380" font-family="monospace" font-size="15" font-weight="bold" fill="#38bdf8">🤖 AI 提示词 (Midjourney / FLUX / Gemini)：</text>
  <text x="140" y="420" font-family="monospace" font-size="13" fill="#94a3b8">${(slot.ai_prompt_en || slot.ai_prompt_zh || 'cinematic documentary photo').slice(0, 110)}</text>
  <text x="640" y="620" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="14" fill="#64748b">微信公众号专用配图插槽 · 建议生成后在微信后台上传替换</text>
</svg>`;
          zip.file(`${slotFileNamePrefix}_提示卡.svg`, directiveSvg);
        }
      }

      // 4. Instructions README
      const readme = `=========================================================
微信公众号 M/S/I 黄金三联包 - 【${currentArchetype}型】全套视觉物料包
=========================================================
文章标题：《${title}》
所属赛道：${categoryName}
文章篇幅：${wordCount} 字 (符合公众号深度长文标准)
包含物料：微信 2.35:1 宽幅封面 + 1080px Satori 数据卡片 + ${activeSlots.length} 处正文配图
生成时间：${new Date().toLocaleString('zh-CN')}

---------------------------------------------------------
【微信公众号后台极速发布防裂图三步法】
---------------------------------------------------------

第一步：排版一键粘贴
1. 在工作台点击【一键复制到微信后台 (带样式与配图指示)】；
2. 登录微信公众平台 (mp.weixin.qq.com)，进入「新建图文消息」；
3. 直接 Ctrl+V (Mac: Cmd+V) 粘贴进正文。标题层级、重点加粗、引用块、留白均已完美排版。

第二步：避免外部防盗链裂图
1. 为什么不能直接粘贴网络外部图片？
   - 微信公众平台对外部图片有严格的“防盗链”拦截机制，直接粘贴外部链接将导致文章显示“此图片未授权无法引用”或空白裂图！
2. 正确做法：
   - 将本压缩包中的「00_微信2.35x1封面」上传为文章主封面；并在微信后台封面裁切时确认 1:1 正方形居中；
   - 将「01_1080px高密度数据卡片」直接拖入微信编辑器的对应插槽位置；
   - 将后续「02、03...」配图逐一替换正文中的【📸 建议配图】占位块。

第三步：群发前走查
1. 在微信后台点击右侧「预览」，发送给个人微信走查手机端真实阅读流；
2. 确认文字排版与配图完整无误后，即可放心群发！

祝持续产出高完读率深度爆款！
— 实战极客手记 M/S/I 黄金三联包全流程工作台
`;
      zip.file(`README_微信公众号后台极速发布必读.txt`, readme);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cleanTitle}_${currentArchetype}型_微信配图与卡片物料包.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to generate zip asset package:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Handler: Generate / Regenerate Anti-AI Prompts via Gemini
  const handleGeneratePrompts = async () => {
    setIsGeneratingPrompts(true);
    try {
      const res = await fetch('/api/pipeline/generate-image-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: draft?.wechat_title || blueprint.wechat_title,
          archetype: currentArchetype,
          articleContent: fullMarkdown,
          targetEngine,
          visualStyle:
            customStyle === 'documentary'
              ? '真实生活与办公纪实 (Documentary Realism, 35mm lens, natural daylight, zero AI plastic texture)'
              : customStyle === 'desk'
              ? '极简工作台/桌面景深 (MacBook open, clean blurred dashboard, ceramic mug, soft ambient light)'
              : customStyle === 'cinematic'
              ? '电影叙事分镜 (Cinematic 16:9, dramatic lighting, authentic character anchors)'
              : '极简矢量现代数据卡片 (Clean vector data card, high contrast typography)',
        }),
      });
      const data = await res.json();
      if (data.success && data.result?.slots) {
        setCustomSlots((prev) => ({
          ...prev,
          [currentArchetype]: data.result.slots,
        }));
        setGenerationSummary(data.result.visual_summary || '已根据所选风格更新配图方案');
      }
    } catch (err) {
      console.error('Failed to generate prompts:', err);
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  // Convert markdown to clean WeChat Inline HTML: Strictly Title -> Digest -> Body (no extraneous content)
  const generateWeChatHtml = (content: string, title: string) => {
    const lines = content.split('\n');
    const digestText = draft?.digest_summary || blueprint.core_angle || '';

    let html = `
      <div style="font-family: -apple-system-font,BlinkMacSystemFont,'Helvetica Neue','PingFang SC','Hiragino Sans GB','Microsoft YaHei UI','Microsoft YaHei',Arial,sans-serif; font-size: 15px; color: #333333; line-height: 1.8; letter-spacing: 0.5px; padding: 10px 0;">
        <h1 style="font-size: 22px; font-weight: bold; color: #111827; line-height: 1.4; margin-bottom: 18px; letter-spacing: -0.5px;">
          ${title}
        </h1>
        ${digestText ? `
          <div style="margin: 18px 0 24px 0; padding: 14px 18px; background-color: #f8fafc; border-left: 4px solid #0f172a; border-radius: 4px; color: #334155; font-size: 14px; line-height: 1.75;">
            <strong style="color: #0f172a;">导读：</strong>${digestText}
          </div>
        ` : ''}
    `;

    let inQuote = false;
    let quoteBuffer: string[] = [];
    let exportSlotIdx = 0;

    const flushQuote = () => {
      if (inQuote && quoteBuffer.length > 0) {
        const text = quoteBuffer.join('<br/>');
        const isTeaser = text.includes('核心提要') || text.includes('提要');
        const borderColor = isTeaser ? '#d97706' : '#0f172a';
        const bgColor = isTeaser ? '#fffbeb' : '#f8fafc';
        const textColor = isTeaser ? '#78350f' : '#334155';
        html += `
          <div style="margin: 18px 0; padding: 12px 16px; background-color: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 4px; color: ${textColor}; font-size: 14px; line-height: 1.75; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;">
            ${text}
          </div>
        `;
        inQuote = false;
        quoteBuffer = [];
      }
    };

    const chineseNums: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // Skip lines that duplicate the digest or contain forbidden meta notes
      if (line.startsWith('> 导读：') || line.startsWith('> 导读:') || line.startsWith('> 🎯') || line.startsWith('> 🛡️')) {
        continue;
      }

      if (line.startsWith('> ')) {
        inQuote = true;
        quoteBuffer.push(line.replace('> ', ''));
        continue;
      } else {
        flushQuote();
      }

      if (!line) {
        continue;
      }

      if (line.startsWith('# ')) {
        continue;
      } else if (line.startsWith('## ')) {
        const rawH2 = line.replace('## ', '');
        const h2Text = rawH2.replace(/^(?:0?[1-9]|[1-9][0-9])[\.、\s\-_]+/, '').replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '').trim();
        html += `
          <h2 style="font-size: 17.5px; font-weight: 700; color: #0f172a; margin-top: 32px; margin-bottom: 16px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center;">
            <span style="display: inline-block; width: 4px; height: 18px; background-color: #0f172a; margin-right: 8px; border-radius: 2px;"></span>
            ${h2Text}
          </h2>
        `;
      } else if (line.startsWith('### ')) {
        const rawH3 = line.replace('### ', '');
        const h3Text = rawH3.replace(/^(?:0?[1-9]|[1-9][0-9])[\.、\s\-_]+/, '').replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '').trim();
        html += `
          <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 24px; margin-bottom: 12px; padding-left: 8px; border-left: 3px solid #64748b;">
            ${h3Text}
          </h3>
        `;
      } else if (line.match(/^\[(?:图\s*([0-9一二三四五六七八九十]+)|📸|建议配图)/)) {
        const simpleMatch = line.match(/^\[(?:图)\s*([0-9一二三四五六七八九十]+)\]/);
        let curSlotNum = exportSlotIdx + 1;
        if (simpleMatch) {
          const rawNum = simpleMatch[1];
          curSlotNum = chineseNums[rawNum] || parseInt(rawNum, 10) || curSlotNum;
        }
        exportSlotIdx++;

        const slotId = `slot_${curSlotNum}`;
        const uploadedImg = slotImages[slotId] || slotImages[String(curSlotNum)] || slotImages[`slot_${exportSlotIdx}`] || sourceMediaUrls[curSlotNum - 1];

        if (uploadedImg) {
          html += `
            <div style="margin: 24px 0; text-align: center;">
              <img src="${uploadedImg}" alt="图 ${curSlotNum}" style="max-width: 100%; border-radius: 6px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); display: block; margin: 0 auto;" />
              <div style="font-size: 12px; color: #64748b; margin-top: 8px; text-align: center;">[图${curSlotNum}]</div>
            </div>
          `;
        } else {
          html += `
            <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 6px; text-align: center; color: #64748b; font-size: 13px;">
              [图${curSlotNum}]
            </div>
          `;
        }
      } else if (line.startsWith('![') && line.includes('](')) {
        const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (imgMatch) {
          const alt = imgMatch[1] || '文章配图';
          const src = imgMatch[2];
          html += `
            <div style="margin: 24px 0; text-align: center;">
              <img src="${src}" alt="${alt}" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); display: block; margin: 0 auto;" />
              <div style="font-size: 12px; color: #64748b; margin-top: 8px; text-align: center; font-style: italic;">▲ 图：${alt}</div>
            </div>
          `;
        }
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const listText = line.replace(/^[-*]\s+/, '');
        html += `
          <div style="margin-bottom: 8px; padding-left: 14px; position: relative; font-size: 15px; color: #334155; line-height: 1.75;">
            <span style="position: absolute; left: 0; top: 8px; width: 5px; height: 5px; border-radius: 50%; background-color: #64748b;"></span>
            ${listText.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a;">$1</strong>')}
          </div>
        `;
      } else {
        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a; font-weight: 600;">$1</strong>');
        html += `<p style="margin-bottom: 16px; line-height: 1.8; color: #334155;">${formattedLine}</p>`;
      }
    }

    flushQuote();
    html += '</div>';
    return html.replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '');
  };

  const handleCopyWeChatRichText = () => {
    const richHtml = generateWeChatHtml(fullMarkdown, draft?.wechat_title || blueprint.wechat_title);
    const blob = new Blob([richHtml], { type: 'text/html' });
    const textBlob = new Blob([fullMarkdown], { type: 'text/plain' });

    const clipboardItem = new ClipboardItem({
      'text/html': blob,
      'text/plain': textBlob,
    });

    navigator.clipboard.write([clipboardItem]).then(() => {
      setCopiedRich(true);
      if (externalHotlinkImages.length > 0) {
        setHotlinkToast(
          `已成功复制富文本！⚠️ 防裂图提醒：检测到含 ${externalHotlinkImages.length} 处外部网络图片。微信公众号后台有防盗链限制，直接发布可能导致读者端裂图。强烈建议使用下方【一键打包下载配图包 (ZIP)】将原图直接拖入微信后台图文素材库！`
        );
        setTimeout(() => setHotlinkToast(null), 7000);
      }
      setTimeout(() => setCopiedRich(false), 2500);
    });
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(fullMarkdown);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2500);
  };

  const handleCopyPrompt = (prompt: string, slotId: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptId(slotId);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  const handleCopyNegative = (neg: string, slotId: string) => {
    navigator.clipboard.writeText(neg);
    setCopiedNegativeId(slotId);
    setTimeout(() => setCopiedNegativeId(null), 2500);
  };

  const handleCopyGeminiPrompt = (prompt: string, slotId: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedGeminiPromptId(slotId);
    setTimeout(() => setCopiedGeminiPromptId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Archetype Switcher */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              {onNavigateToPlanner && (
                <button
                  type="button"
                  onClick={onNavigateToPlanner}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer mr-1"
                  title="返回 01 选题策划与矩阵调度工作台"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                  <span>← 返回01选题工作台</span>
                </button>
              )}
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                02. 微信手机排版 & AI 配图工坊
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1.5">
              微信手机排版 & AI 配图工坊 (WeChat Publisher Studio)
            </h2>
            <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
              真机走查 5000+ 字深度长文呼吸感排版，定制 <strong>16:9 横图提示词</strong> 与 <strong>2.35:1 摄影封面</strong>。每篇逐一走查审阅无误后，点击右上方<strong>「全部审阅完毕 · 保存至历史资料库」</strong>完成永久归档。
            </p>
          </div>

          {/* Archetype & View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* AI Generate Single Draft Button */}
            {onGenerateDraft && (
              <button
                onClick={() => onGenerateDraft(currentArchetype)}
                disabled={isLoadingDraft}
                className="px-4 py-2 text-sm font-bold rounded-xl bg-slate-900 hover:bg-indigo-600 text-white flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                title="由大模型撰写或重写本篇 5000~6800 字深度长文与配图插槽"
              >
                {isLoadingDraft ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
                    <span>正在撰写正文...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{isDraftReady ? 'AI 重新撰写此篇' : 'AI 立即撰写此篇'}</span>
                  </>
                )}
              </button>
            )}

            {isDraftReady && (
              <button
                type="button"
                onClick={handleClearCurrentDraft}
                className="px-3 py-2 text-sm font-semibold rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="清空当前篇目生成的草稿正文，恢复待撰写状态"
              >
                <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
                <span>清空此篇草稿</span>
              </button>
            )}

            {/* Prominent Explicit Archive button */}
            <button
              onClick={handleSaveToArchive}
              disabled={isArchiving}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              title="审阅全部文章满意后，点击一键保存至历史资料库与发布包"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>{archiveSuccess ? '✓ 已保存到历史文库！' : isArchiving ? '正在归档中...' : '审阅完毕 · 保存至历史资料库'}</span>
            </button>

            {/* Slot Archetype Switcher (Dynamic 1, 3, or 5 articles) */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl">
              {((plan.articles && plan.articles.length > 0)
                ? plan.articles.map((a) => a.archetype)
                : Object.keys(articles).length > 0
                ? (Object.keys(articles) as Archetype[])
                : (['M', 'S', 'I'] as Archetype[])
              ).map((arc) => {
                const meta = SLOT_ARCHETYPE_METADATA[arc];
                const art = articles[arc];
                const slotReady = Boolean(
                  art?.markdown_content && !art.markdown_content.includes('正文待生成...')
                );
                const isSelected = currentArchetype === arc;

                return (
                  <button
                    key={arc}
                    onClick={() => onSelectArchetype(arc)}
                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-sm font-bold ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        slotReady ? 'bg-emerald-500 shadow-2xs' : 'bg-slate-300'
                      }`}
                      title={slotReady ? '已生成就绪' : '待生成'}
                    />
                    <span>{meta ? meta.slotName : `${arc}型`}</span>
                  </button>
                );
              })}
            </div>

            {/* Layout View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-sm">
              <button
                onClick={() => setActiveViewTab('split')}
                className={`px-3 py-1.5 font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeViewTab === 'split' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="左右双栏对比：左侧手机预览，右侧生图工坊"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>双栏联动</span>
              </button>
              <button
                onClick={() => setActiveViewTab('editor')}
                className={`px-3 py-1.5 font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeViewTab === 'editor' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-indigo-600'
                }`}
                title="直接微调编辑 4000~6000 字正文 Markdown、小标题与插槽"
              >
                <FileText className="w-3.5 h-3.5 text-current" />
                <span>正文精修</span>
              </button>
              <button
                onClick={() => setActiveViewTab('cover_studio')}
                className={`px-3 py-1.5 font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeViewTab === 'cover_studio'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
                title="微信公众号专属封面图工坊 (2.35:1 & 1:1 双视界防裁切)"
              >
                <ImageIcon className="w-3.5 h-3.5 text-current" />
                <span>封面图工坊</span>
              </button>
              <button
                onClick={() => setActiveViewTab('prompt_studio')}
                className={`px-3 py-1.5 font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeViewTab === 'prompt_studio' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="聚焦配图设计与提示词复制"
              >
                <Wand2 className="w-3.5 h-3.5 text-sky-600" />
                <span>生图提示词</span>
              </button>
              <button
                onClick={() => setActiveViewTab('walkthrough')}
                className={`px-3 py-1.5 font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeViewTab === 'walkthrough' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="聚焦真机屏幕滚动走查"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>手机屏幕</span>
              </button>
            </div>
          </div>
        </div>

        {/* If this slot is NOT yet generated, show clear actionable notice card */}
        {!isDraftReady && activeViewTab !== 'cover_studio' && (
          <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl shadow-md border border-indigo-900/60 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-amber-400 text-slate-950">
                  {SLOT_ARCHETYPE_METADATA[currentArchetype]?.slotName || currentArchetype} · {SLOT_ARCHETYPE_METADATA[currentArchetype]?.roleName || ''}
                </span>
                <span className="text-xs text-amber-300 font-medium">当前栏位长文待独立生成</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                选题：{blueprint.wechat_title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-1">
                【核心切入角度】{blueprint.core_angle}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {onGenerateDraft && (
                <button
                  type="button"
                  onClick={() => onGenerateDraft(currentArchetype)}
                  disabled={isLoadingDraft}
                  className="px-5 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 hover:from-amber-300 hover:to-orange-400 text-slate-950 rounded-xl font-extrabold text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoadingDraft ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>正在独立撰写本篇... (预计 10~15 秒)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
                      <span>立即生成本篇长文 ({SLOT_ARCHETYPE_METADATA[currentArchetype]?.slotName.slice(0, 2)})</span>
                    </>
                  )}
                </button>
              )}

              {onNavigateToPlanner && (
                <button
                  type="button"
                  onClick={onNavigateToPlanner}
                  className="px-3.5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-white/10"
                >
                  更换选题
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid or Dedicated Cover Studio based on active view tab */}
      {activeViewTab === 'cover_studio' ? (
        <WeChatCoverStudio
          currentArchetype={currentArchetype}
          article={draft}
          blueprint={blueprint}
          themeCategory={plan.theme_category}
          categoryLabel={plan.category_label}
          modelConfig={modelConfig}
          onUpdateArticle={onUpdateArticle}
        />
      ) : (
        <div
          className={`grid gap-8 items-start ${
            activeViewTab === 'split' || activeViewTab === 'editor'
              ? 'grid-cols-1 xl:grid-cols-12'
              : activeViewTab === 'walkthrough'
              ? 'grid-cols-1 lg:grid-cols-12'
              : 'grid-cols-1'
          }`}
        >
        {/* ================= EDITOR VIEW (Left: Markdown Editor, Right: Phone Preview) ================= */}
        {activeViewTab === 'editor' && (
          <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {SLOT_ARCHETYPE_METADATA[currentArchetype]?.slotName || currentArchetype} · {SLOT_ARCHETYPE_METADATA[currentArchetype]?.roleName || ''}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  5000~6800字 深度特稿精修
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  countWords(draft?.markdown_content || '') >= 5000 && countWords(draft?.markdown_content || '') <= 6800
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {countWords(draft?.markdown_content || '')} 字
                  {countWords(draft?.markdown_content || '') >= 5000 ? ' (达标 5000+字长文)' : ' (不足5000字，需增补细节)'}
                </span>
                <button
                  onClick={handleCleanBannedWords}
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 flex items-center gap-1 cursor-pointer transition-colors"
                  title="一键将正文中的 AI 八股、企业黑话与违禁词清洗转译为通俗特稿"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>一键清洗AI味</span>
                </button>
              </div>
            </div>

            {cleanFeedback && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                <span>{cleanFeedback}</span>
                <button onClick={() => setCleanFeedback(null)} className="text-emerald-500 hover:text-emerald-800 font-bold">✕</button>
              </div>
            )}

            {/* Title edit */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">微信标题：</label>
                <button
                  type="button"
                  onClick={() => setIsAlternativeTitlesModalOpen(true)}
                  className="text-[11px] text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  title="打开 5 维爆款标题工坊"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>⚡ 换一换爆款标题</span>
                </button>
              </div>
              <input
                type="text"
                value={draft?.wechat_title || ''}
                onChange={(e) => {
                  if (onUpdateArticle && draft) {
                    onUpdateArticle(currentArchetype, { ...draft, wechat_title: e.target.value });
                  }
                }}
                className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                placeholder="输入微信公众号标题..."
              />
            </div>

            {/* Digest edit */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">导读摘要 (Digest)：</label>
              <textarea
                rows={2}
                value={draft?.digest_summary || ''}
                onChange={(e) => {
                  if (onUpdateArticle && draft) {
                    onUpdateArticle(currentArchetype, { ...draft, digest_summary: e.target.value });
                  }
                }}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-hidden leading-relaxed"
                placeholder="输入导读要点..."
              />
            </div>

            {/* Quick insert image tags */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">快速插入配图插槽：</span>
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    const tag = `\n\n[图${num}]\n\n`;
                    const updatedMd = (draft?.markdown_content || '') + tag;
                    if (onUpdateArticle && draft) {
                      onUpdateArticle(currentArchetype, { ...draft, markdown_content: updatedMd });
                    }
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10.5px] rounded border border-slate-200 cursor-pointer"
                >
                  +[图{num}]
                </button>
              ))}
            </div>

            {/* Markdown Textarea */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">正文 Markdown (纯正文排版，严格遵循 标题-导读-正文)：</label>
              <textarea
                rows={22}
                value={draft?.markdown_content || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (onUpdateArticle && draft) {
                    onUpdateArticle(currentArchetype, { ...draft, markdown_content: val });
                  }
                }}
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-hidden leading-relaxed"
                placeholder="正文 Markdown 内容..."
              />
            </div>
          </div>
        )}

        {/* ================= MOBILE VIEW (Left in split/walkthrough, Right in editor) ================= */}
        {(activeViewTab === 'split' || activeViewTab === 'walkthrough' || activeViewTab === 'editor') && (
          <div
            className={`${
              activeViewTab === 'editor'
                ? 'xl:col-span-5 flex justify-center'
                : activeViewTab === 'split'
                ? 'xl:col-span-5 flex justify-center'
                : 'lg:col-span-7 flex justify-center'
            }`}
          >
            <div className="w-full max-w-[420px] bg-slate-950 rounded-[50px] p-4 shadow-2xl border-4 border-slate-800 relative">
              {/* Dynamic Island */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-20 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2"></span>
                <span className="w-2 h-2 rounded-full bg-slate-950"></span>
              </div>

              {/* Screen Inner */}
              <div className="w-full bg-white rounded-[40px] overflow-hidden flex flex-col h-[780px] text-slate-900 font-sans relative">
                {/* iOS Status Bar */}
                <div className="h-11 px-7 flex items-center justify-between text-xs font-semibold text-slate-900 pt-2 shrink-0 bg-white">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5 text-slate-900">
                    <span className="text-[10px]">5G</span>
                    <div className="w-5 h-2.5 border border-slate-800 rounded-xs p-0.5 flex items-center">
                      <div className="h-full w-full bg-slate-800 rounded-xs"></div>
                    </div>
                  </div>
                </div>

                {/* WeChat Header Bar */}
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600 shrink-0 bg-white">
                  <span className="font-medium text-slate-900">实战手记 · 微信预览</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded font-mono">16:9横图标准</span>
                    <span className="text-slate-400">···</span>
                  </div>
                </div>

                {/* Permanent Quick Jump Bar for [图1], [图2], etc. */}
                {activeSlots && activeSlots.length > 0 && (
                  <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-1.5 shrink-0 text-xs">
                    <div className="flex items-center gap-1 font-bold text-slate-700 shrink-0">
                      <Target className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[11px]">插图速达:</span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      {activeSlots.map((slot, sIdx) => {
                        const sNum = sIdx + 1;
                        const sId = slot.slot_id || `slot_${sNum}`;
                        const hasImg = Boolean(slotImages[sId] || slotImages[String(sNum)] || slotImages[`slot_${sNum}`]);
                        const isHigh =
                          highlightedSlotId === sId ||
                          highlightedSlotId === String(sNum) ||
                          highlightedSlotId === `slot_${sNum}` ||
                          (highlightedSlotId && highlightedSlotId.replace(/[^0-9]/g, '') === String(sNum));

                        return (
                          <button
                            key={sId || sIdx}
                            type="button"
                            onClick={() => handleScrollToSlotInPhone(sId, sIdx)}
                            className={`px-2.5 py-1 text-xs font-mono font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                              isHigh
                                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500 shadow-xs scale-105 font-black'
                                : hasImg
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 shadow-2xs'
                            }`}
                            title={`点击快速跳转至正文 [图${sNum}] 的位置并居中高亮`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${hasImg ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>[图{sNum}]</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Article Scrollable Body: Strictly Title -> Digest -> Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm leading-relaxed" id="wechat_phone_scroll_container">
                  {/* 1. 标题 (Title) */}
                  <div className="flex items-start justify-between gap-3 group">
                    <h1 className="text-lg font-bold text-slate-950 leading-snug tracking-tight flex-1">
                      {stripAllEmojis(draft?.wechat_title || blueprint.wechat_title)}
                    </h1>
                    <button
                      type="button"
                      onClick={() => setIsAlternativeTitlesModalOpen(true)}
                      className="shrink-0 px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 hover:text-amber-800 border border-amber-500/30 rounded-md text-xs font-bold flex items-center gap-1 transition-all shadow-xs hover:scale-105"
                      title="打开 5 维爆款标题工坊，按反差打脸/商业算账/实操SOP/生存预警/搜一搜SEO一键换标题"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>换爆款标题</span>
                    </button>
                  </div>

                  {/* 2. 导读 (Digest) */}
                  <div className="p-3.5 bg-slate-50 rounded-lg border-l-4 border-slate-900 text-sm text-slate-700 leading-relaxed mb-4">
                    <span className="font-bold text-slate-900">导读：</span>
                    <span>{stripAllEmojis(draft?.digest_summary || blueprint.core_angle)}</span>
                  </div>

                  {/* 3. 正文 (Body) */}
                  <div className="text-slate-800 text-sm leading-relaxed space-y-3.5">
                    {(() => {
                      let slotCounter = 0;
                      return fullMarkdown
                        .split('\n\n')
                        .filter((p) => !p.startsWith('---') && !p.startsWith('title:') && !p.startsWith('cover:'))
                        .map((para, pIdx) => {
                          if (para.startsWith('### ')) {
                            const cleanHeading = stripAllEmojis(
                              para.replace('### ', '').replace(/^(?:0?[1-9]|[1-9][0-9]|[一二三四五六七八九十]+)[\.、\s\-_：:]+/, '').trim()
                            );
                            return (
                              <h3 key={pIdx} className="text-sm font-bold text-slate-950 pt-3 border-l-3 border-slate-900 pl-2.5">
                                {cleanHeading}
                              </h3>
                            );
                          }
                          if (para.startsWith('## ')) {
                            const cleanHeading = stripAllEmojis(
                              para.replace('## ', '').replace(/^(?:0?[1-9]|[1-9][0-9]|[一二三四五六七八九十]+)[\.、\s\-_：:]+/, '').trim()
                            );
                            return (
                              <h2 key={pIdx} className="text-base font-bold text-slate-950 pt-4 pb-1.5 border-b border-slate-100 flex items-center">
                                <span className="inline-block w-1 h-4 bg-slate-900 mr-2 rounded-xs"></span>
                                {cleanHeading}
                              </h2>
                            );
                          }
                          if (para.startsWith('> ') || para.startsWith('>')) {
                            const overviewText = stripAllEmojis(para.replace(/^>\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1').trim());
                            const isTeaser = overviewText.includes('核心提要') || overviewText.includes('提要');
                            return (
                              <div
                                key={pIdx}
                                className={`p-3 rounded-lg border-l-3 text-xs leading-relaxed font-sans ${
                                  isTeaser
                                    ? 'bg-amber-50/90 border-amber-500 text-amber-950'
                                    : 'bg-slate-50 border-slate-800 text-slate-700'
                                }`}
                              >
                                <span className="font-bold mr-1.5">{isTeaser ? '【核心提要】' : '【段落提要】'}</span>
                                <span>{overviewText.replace(/^(?:核心提要|段落提要)[:：]\s*/, '')}</span>
                              </div>
                            );
                          }

                          // Image Slot Rendering for [图1], [图2], etc., or explicit directives
                          if (para.match(/^\[(?:图\s*([0-9一二三四五六七八九十]+)|📸|建议配图)/)) {
                            const simpleMatch = para.match(/^\[(?:图)\s*([0-9一二三四五六七八九十]+)\]/);
                            const chineseNums: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
                            const curNum = simpleMatch ? (chineseNums[simpleMatch[1]] || parseInt(simpleMatch[1], 10) || (slotCounter + 1)) : (slotCounter + 1);
                            const curSlotIdx = curNum - 1;
                            slotCounter = Math.max(slotCounter, curNum);

                            const cleanText = para.replace(/^\[(?:📸|建议配图|图)[^:]*?[:：]?/, '').replace(/\]$/, '');
                            const parts = cleanText.split('|').map((s) => s.trim());
                            const title = parts[0] && !parts[0].startsWith('16:9') && !parts[0].includes('建议尺寸') ? parts[0] : `正文配图 ${curNum}`;
                            const sizePart = parts.find((p) => p.includes('建议尺寸') || p.includes('16:9') || p.includes('9:16') || p.includes('1080')) || '建议尺寸: 16:9 横屏';

                            const slotObj = activeSlots[curSlotIdx] || activeSlots.find((s) => s.slot_id === `slot_${curNum}`) || activeSlots[0] || { slot_id: `slot_${curNum}`, title: `正文配图 ${curNum}` };
                            const slotId = slotObj.slot_id || `slot_${curNum}`;
                            const isHighlighted =
                              highlightedSlotId === slotId ||
                              highlightedSlotId === String(curNum) ||
                              highlightedSlotId === `slot_${curNum}` ||
                              (highlightedSlotId && highlightedSlotId.replace(/[^0-9]/g, '') === String(curNum));

                            const curSourceImg = sourceMediaUrls[curSlotIdx] || null;
                            const uploadedImg = slotImages[slotId] || slotImages[String(curNum)] || slotImages[`slot_${curNum}`] || null;
                            const effectiveImg = uploadedImg || curSourceImg;
                            const isSourceDefault = !uploadedImg && Boolean(curSourceImg);

                            return (
                              <div
                                key={pIdx}
                                id={`mobile_slot_${slotId}`}
                                data-slot-num={curNum}
                                data-slot-idx={curSlotIdx}
                                className={`transition-all duration-300 rounded-xl ${
                                  isHighlighted
                                    ? 'ring-4 ring-amber-400 bg-amber-100/70 shadow-2xl scale-[1.02] p-1.5'
                                    : ''
                                }`}
                              >
                                {effectiveImg ? (
                                  /* Real Photo (Source Image or Custom/AI generated) */
                                  <div className="my-3.5 text-center relative group/img">
                                    <img
                                      src={effectiveImg}
                                      alt={`图${curNum}`}
                                      onClick={() => setLightboxImage({ url: effectiveImg, title: `[图${curNum}] ${title}` })}
                                      className="w-full rounded-lg shadow-xs max-h-[300px] object-cover mx-auto cursor-zoom-in hover:brightness-95 transition-all"
                                      title="点击放大查看高清大图"
                                    />
                                    <div className="text-xs text-slate-500 mt-1.5 font-mono text-center flex items-center justify-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-indigo-700">[图{curNum}]</span>
                                      {isSourceDefault ? (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-sans font-bold">
                                          一手信源原图
                                        </span>
                                      ) : (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-sans font-bold">
                                          AI 二创插图
                                        </span>
                                      )}
                                      {title && title !== String(curNum) && <span>{title}</span>}
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 bg-black/80 backdrop-blur-xs p-1 rounded-lg">
                                      {isSourceDefault && (
                                        <button
                                          type="button"
                                          onClick={() => handleSelectSlotFromPhone(slotId, true)}
                                          className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold rounded cursor-pointer"
                                          title="原图不满意？在右侧开启 AI 二创生成"
                                        >
                                          ⚡ AI二创
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveUploadSlotKey(slotId);
                                          slotFileInputRef.current?.click();
                                        }}
                                        className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-bold rounded cursor-pointer"
                                        title="更换图片"
                                      >
                                        更换
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setLightboxImage({ url: effectiveImg, title: `[图${curNum}] ${title}` })}
                                        className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-900 text-[11px] font-bold rounded cursor-pointer"
                                        title="放大查看"
                                      >
                                        大图
                                      </button>
                                      {uploadedImg && curSourceImg && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleUpdateSlotImage(slotId, null);
                                            setRecreationActiveSlots((prev) => ({ ...prev, [slotId]: false }));
                                          }}
                                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded cursor-pointer"
                                          title="恢复使用信源原图"
                                        >
                                          恢复原图
                                        </button>
                                      )}
                                      {uploadedImg && !curSourceImg && (
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateSlotImage(slotId, null)}
                                          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded cursor-pointer"
                                          title="移除图片"
                                        >
                                          移除
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  /* Clean, Compact, WeChat-Style [图N] Placeholder */
                                  <div
                                    onClick={() => handleSelectSlotFromPhone(slotId)}
                                    className={`my-3 py-3 px-3.5 rounded-xl border-1.5 border-dashed transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                                      isHighlighted
                                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/60 shadow-md text-amber-950'
                                        : 'border-slate-300 bg-slate-50/90 hover:bg-indigo-50/70 hover:border-indigo-400 text-slate-700'
                                    }`}
                                    title="点击在右侧打开此配图的提示词与生图工具"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span
                                        className={`w-6 h-6 rounded-md font-mono font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                                          isHighlighted
                                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                                            : 'bg-slate-200 group-hover:bg-indigo-600 group-hover:text-white text-slate-700'
                                        }`}
                                      >
                                        #{curNum}
                                      </span>
                                      <div className="flex items-center gap-1.5 truncate">
                                        <span className="font-mono text-indigo-700 font-extrabold text-sm shrink-0">
                                          [图{curNum}]
                                        </span>
                                        {title && title !== String(curNum) && (
                                          <span className="text-slate-700 text-xs sm:text-sm font-medium truncate">
                                            {title}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {isHighlighted && (
                                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200 text-amber-900 animate-pulse">
                                          已定位
                                        </span>
                                      )}
                                      <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 font-medium hidden sm:inline">
                                        查看提示词 &gt;
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveUploadSlotKey(slotId);
                                          slotFileInputRef.current?.click();
                                        }}
                                        className="p-1.5 text-xs text-slate-400 hover:text-amber-600 hover:bg-amber-100/60 rounded-md transition-colors"
                                        title="本地直接上传图片"
                                      >
                                        <Upload className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          if (para.startsWith('![') && para.includes('](')) {
                            const m = para.match(/!\[(.*?)\]\((.*?)\)/);
                            if (m) {
                              const alt = m[1] || '配图';
                              const src = m[2];
                              return (
                                <div key={pIdx} className="my-4 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-950">
                                  <img src={src} alt={alt} className="w-full object-cover max-h-[300px]" />
                                  <div className="p-2 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-100 font-medium">
                                    ▲ 图：{alt}
                                  </div>
                                </div>
                              );
                            }
                          }

                          // Regular paragraph
                          return (
                            <p key={pIdx} className="leading-relaxed">
                              {stripAllEmojis(para.replace(/\*\*(.*?)\*\*/g, '$1'))}
                            </p>
                          );
                        });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= RIGHT / AI PROMPT STUDIO & ACTION PANEL ================= */}
        {(activeViewTab === 'split' || activeViewTab === 'prompt_studio') && (
          <div className={`${activeViewTab === 'split' ? 'xl:col-span-7' : 'w-full'} space-y-6`}>
            {/* Quick Export & Compliance Status Box */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-slate-800" />
                  <h3 className="text-sm font-bold text-slate-900">
                    微信公众号免凭证一键排版导出与字数验收
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded font-bold border ${
                    wordCount >= 5000
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {wordCount >= 5000 ? '✓' : '⚠️'} 纯正文 {wordCount} 字 ({wordCount >= 5000 ? '达标 5000+ 字深度长文' : '待达标 · 需补至 5000+ 字'} · 提示词不计入)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-bold border border-sky-200">
                    ✓ {activeSlots.length} 处 16:9 横图
                  </span>
                </div>
              </div>

              {/* Anti-Broken Image Inspector Status Banner */}
              {externalHotlinkImages.length > 0 ? (
                <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">
                        ⚠️ 微信防裂图预警：正文检测到 {externalHotlinkImages.length} 处外部网络图片！
                      </span>
                      <span className="text-[10px] bg-amber-200/70 text-amber-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                        易触发微信防盗链
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      微信公众平台对非腾讯域名的图片有极严格的反爬与防盗链限制，直接在微信编辑器引用外链图片会导致读者端显示“未授权”或整张裂图。
                      <strong>建议点击下方【一键打包配图包 (ZIP)】</strong>，直接将原图批量拖入微信后台素材库。
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-amber-200/60">
                      <span className="text-[10px] text-amber-700 font-medium">涉及配图：</span>
                      {externalHotlinkImages.map((img, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-amber-100/90 text-amber-800 font-mono text-[10px] border border-amber-200">
                          {img.alt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50/90 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">
                      微信防裂图检测通过：正文全部为本地插槽或矢量卡片，无跨域防盗链裂图风险，可直接复制排版！
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                    100% 安全
                  </span>
                </div>
              )}

              {/* Hotlink Warning Notification Toast */}
              {hotlinkToast && (
                <div className="p-3 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs leading-relaxed flex items-start gap-2 shadow-xs animate-fade-in">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{hotlinkToast}</div>
                  <button onClick={() => setHotlinkToast(null)} className="text-amber-700 hover:text-amber-950 text-xs font-bold">✕</button>
                </div>
              )}

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={handleCopyWeChatRichText}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  title="生成包含内联 CSS 的富文本 HTML，在微信公众号后台直接粘贴"
                >
                  {copiedRich ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedRich ? '已复制微信富文本！' : '一键复制到微信后台'}</span>
                </button>

                <button
                  onClick={handleDownloadAssetZip}
                  disabled={isZipping}
                  className={`py-3 px-4 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                    zipSuccess
                      ? 'bg-indigo-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white'
                  }`}
                  title="一键将 2.35:1 宽版封面、1080px 卡片与正文插槽图片全量打包为 ZIP 下载"
                >
                  {zipSuccess ? (
                    <Check className="w-4 h-4 text-emerald-300" />
                  ) : isZipping ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Package className="w-4 h-4 text-indigo-200" />
                  )}
                  <span>
                    {zipSuccess
                      ? '✓ 素材包已生成下载！'
                      : isZipping
                      ? '正在打包全套配图...'
                      : '打包下载配图包 (ZIP)'}
                  </span>
                </button>

                <button
                  onClick={handleCopyMarkdown}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  {copiedMd ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedMd ? '已复制 Markdown' : '复制纯文本 Markdown'}</span>
                </button>
              </div>
            </div>

            {/* Clean, Streamlined Image Prompt Workshop */}
            <div className="space-y-4">
              {/* Hidden file input for slot image uploads */}
              <input
                type="file"
                ref={slotFileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {/* Sleek Control Bar */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      二创生图提示词工坊 ({activeSlots.length} 处插槽)
                    </h3>
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md flex items-center gap-1">
                      Midjourney / 即梦 / FLUX.1 专用
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    一键复制专业级 16:9 构图提示词至外部平台生图；将生成满意的图片直接回传，手机正文与排版即时更新。
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {/* Redesign All Prompts Button */}
                  <button
                    type="button"
                    onClick={handleGeneratePrompts}
                    disabled={isGeneratingPrompts}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="让 AI 重新分析正文并设计全套抗AI感生图提示词"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPrompts ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingPrompts ? '重新设计中...' : '重算全套提示词'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Jump Bar for Slots */}
              {activeSlots && activeSlots.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-700">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>点击定位手机插槽：</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeSlots.map((slot, sIdx) => {
                      const sNum = sIdx + 1;
                      const sId = slot.slot_id || `slot_${sNum}`;
                      const hasCustom = Boolean(slotImages[sId] || slotImages[String(sNum)] || slotImages[`slot_${sNum}`]);
                      const hasSource = Boolean(sourceMediaUrls[sIdx]);
                      const isHigh =
                        highlightedSlotId === sId ||
                        highlightedSlotId === String(sNum) ||
                        highlightedSlotId === `slot_${sNum}`;

                      return (
                        <button
                          key={sId || sIdx}
                          type="button"
                          onClick={() => handleScrollToSlotInPhone(sId, sIdx)}
                          className={`px-3 py-1.5 font-mono font-bold text-xs rounded-lg border shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                            isHigh
                              ? 'bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-300'
                              : hasCustom
                              ? 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100'
                              : hasSource
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300'
                          }`}
                          title={`点击让左侧手机屏幕立即滚动定位到文章中的 [图${sNum}]`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              hasCustom ? 'bg-sky-500' : hasSource ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          <span>[图{sNum}]</span>
                          {hasCustom ? (
                            <span className="text-[10px] font-sans font-normal opacity-80">已生图</span>
                          ) : hasSource ? (
                            <span className="text-[10px] font-sans font-normal opacity-80">原图</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Individual Slot Cards List */}
              <div className="space-y-4">
                {activeSlots.map((slot, idx) => {
                  const sNum = idx + 1;
                  const slotId = slot.slot_id || `slot_${sNum}`;
                  const isSelected = selectedSlotId === slotId;
                  const sourceImg = sourceMediaUrls[idx] || null;
                  const customImg = slotImages[slotId] || slotImages[String(sNum)] || slotImages[`slot_${sNum}`] || null;
                  const currentDisplayedImg = customImg || sourceImg;

                  const enPrompt =
                    customSlotPrompts[slotId] ||
                    slot.ai_prompt_en ||
                    `A wide-angle 16:9 documentary editorial photo of ${slot.title}, natural morning window daylight, 35mm lens, f/2.8, shallow depth of field, authentic environment, high resolution, no synthetic CGI glow, clean background, no text --ar 16:9 --style raw --v 6.1`;

                  const aspectRatio = slot.aspect_ratio || (slot.recommended_size?.includes('9:16') ? '9:16' : '16:9');

                  return (
                    <div
                      key={slotId}
                      id={`studio_slot_${slotId}`}
                      className={`p-5 bg-white rounded-xl border transition-all ${
                        isSelected
                          ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      {/* Slot Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            #{sNum}
                          </span>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                [图{sNum}] {slot.title}
                              </h5>
                              {customImg ? (
                                <span className="px-2 py-0.5 text-[10.5px] font-bold rounded-md bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                                  ✓ 已应用生图
                                </span>
                              ) : sourceImg ? (
                                <span className="px-2 py-0.5 text-[10.5px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                  信源原图
                                </span>
                              ) : null}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 truncate">
                              {slot.description || '建议根据上下文提示词生成配图'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Target in Phone Button */}
                          <button
                            type="button"
                            onClick={() => handleScrollToSlotInPhone(slotId, idx)}
                            className="px-3 py-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 rounded-lg border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                            title="在左侧手机预览中平滑滚动并金色高亮该插图具体位置"
                          >
                            <Target className="w-3.5 h-3.5 text-amber-600" />
                            <span>🎯 定位手机正文</span>
                          </button>

                          <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                            {aspectRatio === '16:9' ? '16:9 横屏' : slot.recommended_size || '16:9'}
                          </span>
                        </div>
                      </div>

                      {/* Image Preview Strip if an image is loaded */}
                      {currentDisplayedImg && (
                        <div className="mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3.5">
                          <div className="relative w-full sm:w-44 h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-900 group">
                            <img
                              src={currentDisplayedImg}
                              alt={slot.title}
                              onClick={() => setLightboxImage({ url: currentDisplayedImg, title: `[图${sNum}] ${slot.title}` })}
                              className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform"
                              title="点击放大查看"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setLightboxImage({ url: currentDisplayedImg, title: `[图${sNum}] ${slot.title}` })}
                                className="p-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-md text-xs font-bold cursor-pointer"
                                title="放大查看"
                              >
                                <ZoomIn className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 space-y-1 text-left w-full">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {customImg ? '当前生效：用户上传的二创生成图' : '当前生效：信源原始自带插图'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              已实时同步至左侧手机模拟排版与最终富文本中。
                            </p>

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveUploadSlotKey(slotId);
                                  slotFileInputRef.current?.click();
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Upload className="w-3 h-3 text-slate-500" />
                                <span>更换图片</span>
                              </button>
                              {customImg && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSlotImage(slotId, null)}
                                  className="px-2.5 py-1 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="移除此图，恢复插槽状态"
                                >
                                  <RotateCcw className="w-3 h-3 text-rose-500" />
                                  <span>{sourceImg ? '还原信源原图' : '移除图片'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dedicated Prompt & External Generation Block */}
                      <div className="mt-3.5 space-y-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              二创专业提示词 (可直接复制去 Midjourney / 即梦 / FLUX.1)
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 font-semibold">
                            --ar 16:9 --style raw
                          </span>
                        </div>

                        {/* Prompt Display Box */}
                        <div className="p-3.5 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl leading-relaxed select-all border border-slate-800 shadow-inner">
                          {enPrompt}
                        </div>

                        {/* Two Main Action Buttons: Copy Prompt & Upload Locally Generated Image */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => handleCopyPrompt(enPrompt, slotId)}
                            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                            title="一键将生图提示词复制到剪贴板，去外部生图工具粘贴生成"
                          >
                            {copiedPromptId === slotId ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-300" />
                                <span className="text-emerald-100">已复制！可粘贴去生图</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>📋 一键复制生图提示词</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveUploadSlotKey(slotId);
                              slotFileInputRef.current?.click();
                            }}
                            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                            title="选择在外部平台生成好的图片文件，即刻存入本地并嵌入微信正文"
                          >
                            <Upload className="w-4 h-4 text-amber-400" />
                            <span>📤 上传我生成好的图片</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* 5-Dimensional Alternative Viral Headline Modal */}
      <AlternativeTitlesModal
        isOpen={isAlternativeTitlesModalOpen}
        onClose={() => setIsAlternativeTitlesModalOpen(false)}
        currentTitle={draft?.wechat_title || blueprint.wechat_title}
        seedTopic={blueprint?.wechat_title || plan.seed_topic}
        coreAngle={draft?.digest_summary || blueprint?.core_angle}
        contentSummary={draft?.markdown_content?.slice(0, 500)}
        onSelectTitle={handleSelectAlternativeTitle}
        apiConfig={modelConfig}
      />

      {/* Lightbox / 大图放大查看浮层 */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="px-2.5 py-1 rounded bg-indigo-600/80 text-white font-mono text-xs font-bold shrink-0">
                高清大图预览
              </span>
              <h4 className="font-bold text-sm sm:text-base text-slate-100 truncate">
                {lightboxImage.title || '文章配图原图'}
              </h4>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <a
                href={lightboxImage.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                title="在新标签页中打开原始图片链接"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">新标签页打开</span>
              </a>
              <a
                href={lightboxImage.url}
                download="wechat_article_image.png"
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="下载保存到本地"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">下载图片</span>
              </a>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="关闭 (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Center Image Container */}
          <div
            className="flex-1 flex items-center justify-center relative p-2 sm:p-4 min-h-0 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title || '大图查看'}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
            />
          </div>

          {/* Bottom Bar / Shortcuts Hint */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-slate-400 text-xs shrink-0 px-2">
            <span>💡 提示：可右键图片复制或「另存为」，或点击背景任意空白处退出查看</span>
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded text-xs transition-colors cursor-pointer"
            >
              关闭预览 (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
