import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Flame,
  MessageSquare,
  ThumbsUp,
  Image as ImageIcon,
  ArrowRight,
  Layers,
  BookOpen,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Cpu,
  Info,
  ChevronDown,
  ChevronUp,
  Share2,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';
import type {
  LiveMaterialItem,
  DeepSeekRewriteResult,
  ModelConfig,
  DailyClusterPlan,
  Archetype,
  DraftArticleOutput,
} from '../types/pipeline';

interface FastKeywordRadarStudioProps {
  modelConfig: ModelConfig;
  onOpenModelModal?: () => void;
  onArticleGenerated?: (article: DraftArticleOutput, plan: DailyClusterPlan) => void;
  onNavigateToPublisher?: () => void;
}

const POPULAR_KEYWORDS = [
  'DeepSeek',
  'Sora 2',
  'Claude 3.7',
  '美国公司注册',
  '海外独立开发',
  '一人公司变现',
  'Stripe防封与出海',
  '固态电池突破',
  '具身智能机器人',
  'Ollama本地大模型',
];

// 默认精选素材（首屏展示，零消耗 Token）
const ARCHETYPE_OPTIONS = [
  { id: 'auto', label: '🤖 智能自适应', desc: '根据素材痛点自动研判匹配最佳叙事结构' },
  { id: 'commercial_ledger', label: '💰 商业账本流', desc: '刺破低门槛神话，深挖显隐账本与决策分水岭' },
  { id: 'postmortem', label: '💀 尸检复盘流', desc: '深挖翻车事故现场、致命死因与绝境止血SOP' },
  { id: 'geek_industrial', label: '⚙️ 极客拆解流', desc: '硬核测试数据开局，穿透机理与参数报错字典' },
  { id: 'paradigm_shift', label: '🚀 范式革命流', desc: '时代断裂点切入，新旧经济账重构与生态位卡位' },
];

const INITIAL_FEATURED_MATERIALS: LiveMaterialItem[] = [
  {
    id: 'featured_1',
    title: 'Twitter @levelsio：深度解析一人公司出海与极简架构落地实战',
    author: '@levelsio (海外独立开发操盘手)',
    platform: 'twitter',
    source_url: 'https://x.com/search?q=from:levelsio+SaaS&src=typed_query&f=live',
    publish_time: '推荐精选',
    summary: '针对独立出海的极简架构打法：“不要一开始就做复杂微服务！我们用最轻量的单体架构跑通了全球付费闭环，公开完整账本与技术选型。”',
    raw_text: '针对一人公司出海的实战复盘。很多开发者陷入了过度工程化陷阱，我们通过极简架构协同、精准提取核心工作流实现了业务的高效自造血。',
    upvotes: 3820,
    comments_count: 340,
    media_urls: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80'],
    media_type: 'image',
    tags: ['出海实战', '独立开发', '商业闭环'],
    badge_label: '推特精选',
  },
  {
    id: 'featured_2',
    title: 'r/LocalLLaMA 深度复盘：单卡部署离线大模型避坑指南与全流程实录',
    author: 'u/GeekHardware_Dev',
    platform: 'reddit',
    source_url: 'https://www.reddit.com/r/LocalLLaMA/search/?q=Local+LLM&restrict_sr=1&sort=hot',
    publish_time: '推荐精选',
    summary: '社区高赞实战指南：如何用单张消费级显卡完成前沿开源大模型的部署与 API 封装，避开量化精度损失与显存溢出陷阱。',
    raw_text: '从环境依赖到权重加载的全过程完整参数记录，详细对比了不同量化精度的速度与效果。',
    upvotes: 1850,
    comments_count: 164,
    media_urls: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1080&auto=format&fit=crop&q=80'],
    media_type: 'image',
    tags: ['开源模型', '本地部署', '实操避坑'],
    badge_label: 'r/LocalLLaMA',
  },
  {
    id: 'featured_3',
    title: 'TechCrunch / Wired 深度：从前沿 AI 商业化落地看一人公司变现与盈利账本',
    author: 'Tech Investigation Review',
    platform: 'article',
    source_url: 'https://techcrunch.com/search/AI+startup',
    publish_time: '推荐精选',
    summary: '全面拆解前沿技术在海外 SaaS 生态中的商业机会、API 调用成本核算与真实获客飞轮。',
    raw_text: '单月成本仅需几十美元，却能支撑数千活跃用户的核心业务逻辑与支付闭环构建。',
    upvotes: 1420,
    comments_count: 98,
    media_urls: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&auto=format&fit=crop&q=80'],
    media_type: 'image',
    tags: ['深度分析', '商业账本', '前沿生态'],
    badge_label: '深度特稿',
  },
];

export const FastKeywordRadarStudio: React.FC<FastKeywordRadarStudioProps> = ({
  modelConfig,
  onOpenModelModal,
  onArticleGenerated,
  onNavigateToPublisher,
}) => {
  // Search state (with local cache restoration to avoid redundant API token consumption)
  const [keyword, setKeyword] = useState<string>(() => {
    try {
      const cached = sessionStorage.getItem('fast_radar_last_search');
      if (cached) {
        const p = JSON.parse(cached);
        return p.keyword || '美国公司注册';
      }
    } catch (e) {}
    return '美国公司注册';
  });
  const [platform, setPlatform] = useState<'all' | 'twitter' | 'reddit' | 'article'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [materials, setMaterials] = useState<LiveMaterialItem[]>(() => {
    try {
      const cached = sessionStorage.getItem('fast_radar_last_search');
      if (cached) {
        const p = JSON.parse(cached);
        if (Array.isArray(p.materials) && p.materials.length > 0) {
          return p.materials;
        }
      }
    } catch (e) {}
    return INITIAL_FEATURED_MATERIALS;
  });
  const [hasSearched, setHasSearched] = useState<boolean>(() => {
    try {
      const cached = sessionStorage.getItem('fast_radar_last_search');
      if (cached) {
        const p = JSON.parse(cached);
        return Boolean(p.hasSearched);
      }
    } catch (e) {}
    return false;
  });
  const [isFromCache, setIsFromCache] = useState<boolean>(() => {
    try {
      const cached = sessionStorage.getItem('fast_radar_last_search');
      return Boolean(cached);
    } catch (e) {}
    return false;
  });
  const [searchError, setSearchError] = useState<string | null>(null);

  // Selection & Rewriting state
  const [selectedMaterial, setSelectedMaterial] = useState<LiveMaterialItem | null>(null);
  const [isMultiSourceMode, setIsMultiSourceMode] = useState<boolean>(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteStep, setRewriteStep] = useState<number>(1);
  const [customAngle, setCustomAngle] = useState<string>('');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('auto');
  const [rewriteResult, setRewriteResult] = useState<DeepSeekRewriteResult | null>(null);

  // Copy status
  const [copyWeChatSuccess, setCopyWeChatSuccess] = useState(false);
  const [copyMarkdownSuccess, setCopyMarkdownSuccess] = useState(false);
  const [copyPromptSuccess, setCopyPromptSuccess] = useState(false);

  // Helper: Resolve reliable direct click URL to tweet / post source
  const getDirectSourceUrl = (item: LiveMaterialItem): string => {
    let url = (item.source_url || (item as any).sourceUrl || '').trim();
    const isGeneric = !url ||
      url === 'https://x.com' ||
      url === 'https://x.com/' ||
      url === 'https://twitter.com' ||
      url === 'https://twitter.com/' ||
      url === 'https://reddit.com' ||
      url === 'https://reddit.com/' ||
      url === 'https://www.reddit.com' ||
      url === 'https://www.reddit.com/' ||
      url === 'https://medium.com' ||
      url === 'https://medium.com/';

    if (isGeneric) {
      const cleanAuthor = (item.author || '')
        .replace(/^Twitter\s*/i, '')
        .replace(/^u\//i, '')
        .replace(/^@/, '')
        .trim()
        .split(/[\s(（]/)[0];

      if (item.platform === 'twitter') {
        if (cleanAuthor && !cleanAuthor.includes('用户') && cleanAuthor !== 'TwitterUser' && cleanAuthor !== '推特用户') {
          url = `https://x.com/search?q=${encodeURIComponent('from:' + cleanAuthor + ' ' + keyword)}&src=typed_query&f=live`;
        } else {
          url = `https://x.com/search?q=${encodeURIComponent(keyword)}&src=typed_query&f=live`;
        }
      } else if (item.platform === 'reddit') {
        const subMatch = (item.badge_label || item.author || '').match(/r\/([a-zA-Z0-9_]+)/);
        if (subMatch && subMatch[1]) {
          url = `https://www.reddit.com/r/${subMatch[1]}/search/?q=${encodeURIComponent(keyword)}&restrict_sr=1&sort=hot`;
        } else {
          url = `https://www.reddit.com/search/?q=${encodeURIComponent(keyword)}&sort=hot`;
        }
      } else {
        url = `https://techcrunch.com/search/${encodeURIComponent(keyword)}`;
      }
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url;
  };

  // Do NOT auto-call handleSearch on mount to save tokens!
  // Initial state uses INITIAL_FEATURED_MATERIALS or sessionStorage cache directly.

  // Handle Search with smart sessionStorage caching to save API tokens
  const handleSearch = async (kwToSearch?: string, forceRefresh = false) => {
    const targetKw = (kwToSearch !== undefined ? kwToSearch : keyword).trim();
    if (!targetKw) return;

    setKeyword(targetKw);
    setSearchError(null);

    // 1. Check local session cache if not force refreshing
    if (!forceRefresh) {
      try {
        const cacheKey = `fast_radar_cache_${targetKw.toLowerCase()}_${platform}`;
        const cachedRaw = sessionStorage.getItem(cacheKey);
        if (cachedRaw) {
          const cachedMaterials = JSON.parse(cachedRaw);
          if (Array.isArray(cachedMaterials) && cachedMaterials.length > 0) {
            setMaterials(cachedMaterials);
            setHasSearched(true);
            setIsFromCache(true);
            sessionStorage.setItem('fast_radar_last_search', JSON.stringify({
              keyword: targetKw,
              materials: cachedMaterials,
              hasSearched: true,
            }));
            return;
          }
        }
      } catch (e) {}
    }

    // 2. Fetch from LLM/Backend API
    setIsSearching(true);
    setHasSearched(true);
    setIsFromCache(false);

    try {
      const res = await fetch('/api/pipeline/search-live-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: targetKw,
          platform,
          limit: 12,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.materials)) {
        setMaterials(data.materials);
        setIsFromCache(false);
        try {
          const cacheKey = `fast_radar_cache_${targetKw.toLowerCase()}_${platform}`;
          sessionStorage.setItem(cacheKey, JSON.stringify(data.materials));
          sessionStorage.setItem('fast_radar_last_search', JSON.stringify({
            keyword: targetKw,
            materials: data.materials,
            hasSearched: true,
          }));
        } catch (e) {}
      } else {
        setSearchError(data.error || '检索素材失败，请稍后重试');
      }
    } catch (err: any) {
      setSearchError(err.message || '网络连接失败');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle DeepSeek Creative Rewrite
  const handleStartRewrite = async (material: LiveMaterialItem) => {
    setIsMultiSourceMode(false);
    setSelectedMaterial(material);
    setIsRewriting(true);
    setRewriteStep(1);
    setRewriteResult(null);

    // Step animation timer
    const stepTimer1 = setTimeout(() => setRewriteStep(2), 2500);
    const stepTimer2 = setTimeout(() => setRewriteStep(3), 5500);
    const stepTimer3 = setTimeout(() => setRewriteStep(4), 8500);

    try {
      const res = await fetch('/api/pipeline/deepseek-creative-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material,
          apiConfig: modelConfig,
          customAngle: customAngle.trim() || undefined,
          targetArchetype: selectedArchetype,
        }),
      });

      const data = await res.json();
      const art = data.result || data.article;
      if (data.success && art) {
        // Extract embedded images from markdown or reused_images
        const embeddedImgs: Array<{ url: string; caption: string }> = [];
        const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
        let match;
        while ((match = imgRegex.exec(art.markdown_content || '')) !== null) {
          embeddedImgs.push({
            caption: match[1] || '原素材实战配图',
            url: match[2],
          });
        }
        if (embeddedImgs.length === 0 && Array.isArray(art.embedded_images)) {
          art.embedded_images.forEach((img: any) => embeddedImgs.push(img));
        } else if (embeddedImgs.length === 0 && Array.isArray(art.reused_images)) {
          art.reused_images.forEach((u: string, idx: number) => {
            embeddedImgs.push({ caption: `原图 #${idx + 1}`, url: u });
          });
        }

        const normalizedResult: DeepSeekRewriteResult = {
          wechat_title: art.wechat_title || material.title,
          digest_summary: art.digest_summary || material.summary,
          markdown_content: art.markdown_content || '',
          word_count: art.word_count || (art.markdown_content ? art.markdown_content.replace(/\s+/g, '').length : 4200),
          cover_spec: art.cover_spec || {
            badge_tag: '[深度特稿]',
            headline_text: art.wechat_title?.slice(0, 12) || '重磅深度特稿',
            sub_hook: '一线实战拆解与避坑指南',
            visual_focus: '硬核实战技术焦点',
            prompt_en: 'Cinematic documentary photograph, 50mm lens, high contrast, authentic texture, right aligned subject, wide dark negative space on left 55%, zero text, no words, raw photo --ar 2.35:1',
            prompt_zh: '纪实摄影，高对比度侧光，右侧主体，左侧55%纯净深色留白，无文字',
            aspect_ratio: '2.35:1 (推送大图 1080x460)',
            negative_prompt: 'text, letters, words, watermark, blurry, cartoon',
          },
          embedded_images: embeddedImgs,
          original_material: material,
        };
        setRewriteResult(normalizedResult);

        // Convert to workspace DraftArticleOutput and sync with App state
        const generatedDraft: DraftArticleOutput = {
          archetype: 'M',
          wechat_title: normalizedResult.wechat_title,
          digest_summary: normalizedResult.digest_summary,
          markdown_content: normalizedResult.markdown_content,
          word_count: normalizedResult.word_count,
          cover_spec: normalizedResult.cover_spec,
          cover_prompt_en: normalizedResult.cover_spec.prompt_en,
          cover_prompt_zh: normalizedResult.cover_spec.prompt_zh,
          image_slots: embeddedImgs.map((img: any, i: number) => ({
            slot_id: `slot_${i + 1}`,
            title: `实战插图 #${i + 1}`,
            slot_type: 'proof_photo' as const,
            recommended_size: '16:9 横屏 (1280x720 推荐横图)',
            description: img.caption || '实战资料佐证图',
            source_suggestion: '原帖真实实操截图',
            caption: img.caption || `实战佐证图 #${i + 1}`,
            preview_image_url: img.url,
          })),
        };

        const generatedPlan: DailyClusterPlan = {
          cluster_id: `fast_cluster_${Date.now()}`,
          seed_topic: data.result.wechat_title,
          theme_category: 'frontier_ai_robotics',
          category_label: material.badge_label || '深度情报',
          tags: material.tags || ['海外情报', keyword],
          cluster_logic_summary: `基于 ${material.platform} 一手高赞素材深度二创`,
          articles: [
            {
              archetype: 'M',
              publish_slot: '头条 (1st)',
              msi_role_label: '深度特稿',
              wechat_title: data.result.wechat_title,
              core_angle: data.result.digest_summary,
              forbidden_scope: '避免口号套话，严禁AI味陈词滥调',
              outline_sections: ['核心反差与调查破题', '底层技术与机理穿透', '实操避坑与账本测算', '洗牌终局与长效壁垒'],
              scraper_tasks: [],
              visual_spec: {
                mermaid_flowchart_topic: data.result.wechat_title,
                satori_card_type: 'platform_comparison',
                card_key_metrics: ['核心突破', '良率', '成本'],
              },
              cross_links: [],
            },
          ],
        };

        if (onArticleGenerated) {
          onArticleGenerated(generatedDraft, generatedPlan);
        }
      } else {
        alert(data.error || '二创生成失败，请检查模型 API 配置');
      }
    } catch (err: any) {
      alert(`请求异常: ${err.message}`);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsRewriting(false);
    }
  };

  // Handle Multi-Source Collective Rewrite (通读全部信源大通义综合二创)
  const handleStartMultiSourceRewrite = async (targetMaterials: LiveMaterialItem[]) => {
    if (!targetMaterials || targetMaterials.length === 0) return;
    setIsMultiSourceMode(true);
    setSelectedMaterial(null);
    setIsRewriting(true);
    setRewriteStep(1);
    setRewriteResult(null);

    // Step animation timer
    const stepTimer1 = setTimeout(() => setRewriteStep(2), 2800);
    const stepTimer2 = setTimeout(() => setRewriteStep(3), 6000);
    const stepTimer3 = setTimeout(() => setRewriteStep(4), 9500);

    try {
      const res = await fetch('/api/pipeline/deepseek-creative-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials: targetMaterials,
          apiConfig: modelConfig,
          customAngle: customAngle.trim() || undefined,
          targetArchetype: selectedArchetype,
        }),
      });

      const data = await res.json();
      const art = data.result || data.article;
      if (data.success && art) {
        // Extract embedded images from markdown or embedded_images
        const embeddedImgs: Array<{ url: string; caption: string }> = [];
        const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
        let match;
        while ((match = imgRegex.exec(art.markdown_content || '')) !== null) {
          embeddedImgs.push({
            caption: match[1] || '原素材实战配图',
            url: match[2],
          });
        }
        if (embeddedImgs.length === 0 && Array.isArray(art.embedded_images)) {
          art.embedded_images.forEach((img: any) => embeddedImgs.push(img));
        }

        const normalizedResult: DeepSeekRewriteResult = {
          wechat_title: art.wechat_title || `${keyword} 全网深度调查与实战避坑备忘录`,
          digest_summary: art.digest_summary || '统揽全网多微信一手信源，深度穿透核心事实与避坑要点。',
          markdown_content: art.markdown_content || '',
          word_count: art.word_count || (art.markdown_content ? art.markdown_content.replace(/\s+/g, '').length : 5200),
          cover_spec: art.cover_spec || {
            badge_tag: '[全景特稿]',
            headline_text: art.wechat_title?.slice(0, 12) || '全网重磅特稿',
            sub_hook: '多源交叉实战拆解与避坑指南',
            visual_focus: '硬核实战技术焦点',
            prompt_en: 'Cinematic documentary photograph, 50mm lens, high contrast, authentic texture, right aligned subject, wide dark negative space on left 55%, zero text, no words, raw photo --ar 2.35:1',
            prompt_zh: '纪实摄影，高对比度侧光，右侧主体，左侧55%纯净深色留白，无文字',
            aspect_ratio: '2.35:1 (推送大图 1080x460)',
            negative_prompt: 'text, letters, words, watermark, blurry, cartoon',
          },
          embedded_images: embeddedImgs,
          original_material: targetMaterials[0],
          referenced_materials: targetMaterials,
          is_multi_source: true,
        };
        setRewriteResult(normalizedResult);

        // Convert to workspace DraftArticleOutput and sync with App state
        const generatedDraft: DraftArticleOutput = {
          archetype: 'M',
          wechat_title: normalizedResult.wechat_title,
          digest_summary: normalizedResult.digest_summary,
          markdown_content: normalizedResult.markdown_content,
          word_count: normalizedResult.word_count,
          cover_spec: normalizedResult.cover_spec,
          cover_prompt_en: normalizedResult.cover_spec.prompt_en,
          cover_prompt_zh: normalizedResult.cover_spec.prompt_zh,
          image_slots: embeddedImgs.map((img: any, i: number) => ({
            slot_id: `slot_${i + 1}`,
            title: `实战插图 #${i + 1}`,
            slot_type: 'proof_photo' as const,
            recommended_size: '16:9 横屏 (1280x720 推荐横图)',
            description: img.caption || '实战资料佐证图',
            source_suggestion: '原帖真实实操截图',
            caption: img.caption || `实战佐证图 #${i + 1}`,
            preview_image_url: img.url,
          })),
        };

        const generatedPlan: DailyClusterPlan = {
          cluster_id: `fast_cluster_${Date.now()}`,
          seed_topic: normalizedResult.wechat_title,
          theme_category: 'frontier_ai_robotics',
          category_label: '全网综合特稿',
          tags: [keyword, '全景特稿', '海外信源'],
          cluster_logic_summary: `统揽全网 ${targetMaterials.length} 篇推文/Reddit/资讯多源深度二创`,
          articles: [
            {
              archetype: 'M',
              publish_slot: '头条 (1st)',
              msi_role_label: '全景特稿',
              wechat_title: normalizedResult.wechat_title,
              core_angle: normalizedResult.digest_summary,
              forbidden_scope: '避免口号套话，严禁AI味陈词滥调',
              outline_sections: ['核心反差与多方碰撞', '底层技术与机理穿透', '实操避坑与账本测算', '洗牌终局与长效壁垒'],
              scraper_tasks: [],
              visual_spec: {
                mermaid_flowchart_topic: normalizedResult.wechat_title,
                satori_card_type: 'platform_comparison',
                card_key_metrics: ['核心突破', '实测数据', '避坑指南'],
              },
              cross_links: [],
            },
          ],
        };

        if (onArticleGenerated) {
          onArticleGenerated(generatedDraft, generatedPlan);
        }
      } else {
        alert(data.error || '多源二创生成失败，请检查模型 API 配置');
      }
    } catch (err: any) {
      alert(`请求异常: ${err.message}`);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsRewriting(false);
    }
  };

  // Convert Markdown to WeChat Rich-Text HTML with embedded images and inline styles
  const copyWeChatRichText = async () => {
    if (!rewriteResult) return;

    try {
      const { wechat_title, digest_summary, markdown_content } = rewriteResult;

      // Transform Markdown to inline-styled WeChat HTML
      const htmlLines: string[] = [];

      // Main Title
      htmlLines.push(
        `<h1 style="font-size: 22px; font-weight: 800; color: #111827; line-height: 1.4; margin-bottom: 12px; letter-spacing: -0.3px;">${escapeHtml(
          wechat_title
        )}</h1>`
      );

      // Meta header
      htmlLines.push(
        `<p style="font-size: 13px; color: #888888; margin-bottom: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">原创 · 微信特稿工坊 · 深度观察</p>`
      );

      // Digest Card (Callout Box)
      if (digest_summary) {
        htmlLines.push(
          `<div style="background-color: #f3f4f6; border-left: 4px solid #07c160; padding: 14px 16px; border-radius: 6px; margin-bottom: 24px;">` +
            `<p style="font-size: 14px; color: #374151; line-height: 1.7; margin: 0; font-weight: 500;"><strong>导读：</strong>${escapeHtml(
              digest_summary
            )}</p>` +
            `</div>`
        );
      }

      // Parse markdown content line by line
      const rawLines = markdown_content.split('\n');
      let inList = false;

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i].trim();

        // Native Markdown Table parsing -> Inline-styled WeChat HTML table
        if (line.startsWith('|') && line.endsWith('|')) {
          const tableLines: string[] = [line];
          while (i + 1 < rawLines.length && rawLines[i + 1].trim().startsWith('|') && rawLines[i + 1].trim().endsWith('|')) {
            i++;
            tableLines.push(rawLines[i].trim());
          }

          if (tableLines.length >= 2) {
            const parseCells = (rowStr: string) =>
              rowStr
                .replace(/^\|/, '')
                .replace(/\|$/, '')
                .split('|')
                .map((c) => c.trim());

            const headerCells = parseCells(tableLines[0]);
            const isDelimiter = /^\|?[\s-:]+\|?/.test(tableLines[1]);
            const bodyRows = tableLines.slice(isDelimiter ? 2 : 1).map(parseCells);

            let tableHtml = `<div style="overflow-x: auto; margin: 24px 0;"><table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.6; text-align: left; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">`;
            tableHtml += `<thead><tr style="background-color: #f3f4f6;">`;
            headerCells.forEach((h) => {
              tableHtml += `<th style="padding: 10px 12px; font-weight: 700; color: #111827; border-bottom: 2px solid #e5e7eb;">${renderMarkdownInline(h)}</th>`;
            });
            tableHtml += `</tr></thead><tbody>`;
            bodyRows.forEach((row, rowIdx) => {
              const bg = rowIdx % 2 === 1 ? 'background-color: #f9fafb;' : 'background-color: #ffffff;';
              tableHtml += `<tr style="${bg}">`;
              row.forEach((c) => {
                tableHtml += `<td style="padding: 9px 12px; border-bottom: 1px solid #f3f4f6; color: #374151;">${renderMarkdownInline(c)}</td>`;
              });
              tableHtml += `</tr>`;
            });
            tableHtml += `</tbody></table></div>`;
            htmlLines.push(tableHtml);
            continue;
          }
        }

        // Skip document-level h1 as we already added title
        if (line.startsWith('# ') && !line.startsWith('## ') && !line.startsWith('### ')) {
          continue;
        }

        // H2 Subheading
        if (line.startsWith('## ')) {
          const h2Text = line.replace(/^##\s+/, '');
          htmlLines.push(
            `<h2 style="font-size: 18px; font-weight: 700; color: #111827; margin-top: 32px; margin-bottom: 14px; border-left: 4px solid #07c160; padding-left: 10px; line-height: 1.45;">${escapeHtml(
              h2Text
            )}</h2>`
          );
          continue;
        }

        // H3 Subheading
        if (line.startsWith('### ')) {
          const h3Text = line.replace(/^###\s+/, '');
          htmlLines.push(
            `<h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin-top: 24px; margin-bottom: 10px;">${escapeHtml(
              h3Text
            )}</h3>`
          );
          continue;
        }

        // Embedded Image: ![alt](url)
        const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
          const caption = imgMatch[1] || '';
          const url = imgMatch[2];
          htmlLines.push(
            `<div style="margin: 24px 0; text-align: center;">` +
              `<img src="${url}" alt="${escapeHtml(
                caption
              )}" style="max-width: 100%; border-radius: 8px; display: block; margin: 0 auto; box-shadow: 0 4px 16px rgba(0,0,0,0.08);" />` +
              (caption
                ? `<p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 8px; margin-bottom: 0; line-height: 1.4;">${escapeHtml(
                    caption
                  )}</p>`
                : '') +
              `</div>`
          );
          continue;
        }

        // Blockquote / Key Takeaway: > ...
        if (line.startsWith('>')) {
          const quoteText = line.replace(/^>\s*/, '');
          htmlLines.push(
            `<blockquote style="background-color: #f9fafb; border-left: 3px solid #10b981; padding: 10px 14px; color: #4b5563; font-size: 14px; line-height: 1.6; border-radius: 4px; margin: 16px 0;">${renderMarkdownInline(
              quoteText
            )}</blockquote>`
          );
          continue;
        }

        // Unordered List item
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const itemText = line.replace(/^[-*]\s+/, '');
          htmlLines.push(
            `<li style="font-size: 15px; color: #2b2b2b; line-height: 1.75; margin-bottom: 8px; margin-left: 20px;">${renderMarkdownInline(
              itemText
            )}</li>`
          );
          continue;
        }

        // Divider
        if (line === '---' || line === '***') {
          htmlLines.push(`<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />`);
          continue;
        }

        // Standard Paragraph
        if (line.length > 0) {
          htmlLines.push(
            `<p style="font-size: 15px; color: #2b2b2b; line-height: 1.8; letter-spacing: 0.4px; margin-bottom: 16px; text-align: justify;">${renderMarkdownInline(
              line
            )}</p>`
          );
        }
      }

      const fullHtml = `<div style="max-width: 677px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${htmlLines.join(
        ''
      )}</div>`;

      // Copy both text/html and text/plain to system clipboard
      const blobHtml = new Blob([fullHtml], { type: 'text/html' });
      const blobText = new Blob([markdown_content], { type: 'text/plain' });
      const clipboardItem = new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      });

      await navigator.clipboard.write([clipboardItem]);
      setCopyWeChatSuccess(true);
      setTimeout(() => setCopyWeChatSuccess(false), 3500);
    } catch (err: any) {
      // Fallback to plain text copy if ClipboardItem is not permitted
      await navigator.clipboard.writeText(rewriteResult.markdown_content);
      setCopyWeChatSuccess(true);
      setTimeout(() => setCopyWeChatSuccess(false), 3500);
    }
  };

  const copyMarkdownOnly = async () => {
    if (!rewriteResult) return;
    await navigator.clipboard.writeText(rewriteResult.markdown_content);
    setCopyMarkdownSuccess(true);
    setTimeout(() => setCopyMarkdownSuccess(false), 2500);
  };

  const copyCoverPrompt = async () => {
    if (!rewriteResult?.cover_spec?.prompt_en) return;
    await navigator.clipboard.writeText(rewriteResult.cover_spec.prompt_en);
    setCopyPromptSuccess(true);
    setTimeout(() => setCopyPromptSuccess(false), 2500);
  };

  // Helper: HTML escaping
  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Helper: Basic inline markdown parser (bold, italic, code)
  const renderMarkdownInline = (text: string) => {
    let out = escapeHtml(text);
    // Bold: **text**
    out = out.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #111827; font-weight: 700;">$1</strong>');
    // Inline code: `code`
    out = out.replace(/`(.*?)`/g, '<code style="background-color: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #0f172a;">$1</code>');
    return out;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* ============================================================== */}
      {/* SECTION 1: Clean Minimalist Keyword Search Hero */}
      {/* ============================================================== */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>极简一手信源雷达 · DeepSeek 二创工坊</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            输入关键词，全网捕获推特/Reddit爆款并一键深度二创
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            无需繁杂设置。系统自动为您检索最新高赞推文与讨论帖；选中素材后由 DeepSeek-V3 沿用原图自动排版二创，一键复制微信公众号富文本。
          </p>
        </div>

        {/* Large Clean Search Bar */}
        <div className="max-w-3xl mx-auto space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2 p-1.5 bg-slate-50 border-2 border-indigo-200 hover:border-indigo-400 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100 rounded-2xl transition-all shadow-inner"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5 text-indigo-500" />
            </div>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="输入任意技术、商业或热点关键词（例如：DeepSeek、Sora 2、海外独立开发、Claude 3.7...）"
              className="w-full bg-transparent border-none text-slate-800 placeholder-slate-400 text-base font-medium focus:outline-none px-2"
            />
            <div className="flex items-center gap-2 shrink-0">
              {hasSearched && (
                <button
                  type="button"
                  onClick={() => handleSearch(keyword, true)}
                  disabled={isSearching}
                  className="flex items-center gap-1.5 px-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  title="向大模型重新实时检索新素材（跳过本地缓存）"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">强制重搜</span>
                </button>
              )}
              <button
                type="submit"
                disabled={isSearching}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>检索中...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>检索一手素材</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Platform Filter Tabs & Hot Keywords */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            {/* Platform Filter Chips */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPlatform('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  platform === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部信源
              </button>
              <button
                type="button"
                onClick={() => setPlatform('twitter')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  platform === 'twitter' ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                推特 X 爆款
              </button>
              <button
                type="button"
                onClick={() => setPlatform('reddit')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  platform === 'reddit' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reddit 社区热帖
              </button>
              <button
                type="button"
                onClick={() => setPlatform('article')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  platform === 'article' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                深度科技资讯
              </button>
            </div>

            {/* Quick Hot Keyword Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium">热门检索:</span>
              {POPULAR_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => handleSearch(kw)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-medium transition-colors cursor-pointer"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Narrative Archetype Selector */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>特稿叙事流派:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {ARCHETYPE_OPTIONS.map((arch) => {
                const isSelected = selectedArchetype === arch.id;
                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => setSelectedArchetype(arch.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title={arch.desc}
                  >
                    <span>{arch.label}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-400 hidden lg:inline pl-1">
              ({ARCHETYPE_OPTIONS.find((a) => a.id === selectedArchetype)?.desc})
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: Material Selection Grid */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {hasSearched ? `关于 “${keyword}” 的高赞一手素材` : '精选爆款素材（首屏零消耗 Token）'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
              {materials.length} 篇
            </span>
            {hasSearched && isFromCache && (
              <span className="text-2xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1 shadow-2xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                本地缓存秒开 · 0 Token 消耗
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">支持单篇二创，或点击下方紫色横幅一键统揽多源深度总结</span>
        </div>

        {/* Master Multi-Source Collective Rewrite Banner */}
        {materials.length > 1 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 p-5 text-white shadow-xl border border-indigo-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-indigo-950 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 fill-indigo-950" /> 全网信源大通义 · 智能二创
                </span>
                <span className="text-xs text-indigo-200">
                  已聚合推特 {materials.filter(m => m.platform === 'twitter').length} 篇 + Reddit {materials.filter(m => m.platform === 'reddit').length} 篇 + 权威资讯 {materials.filter(m => m.platform === 'article' || (m.platform as any) === 'rss').length} 篇
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                统揽全网全部 {materials.length} 篇一手信源 · 深度总结提炼与万字级微信二创
              </h3>
              <p className="text-xs text-indigo-200/90 leading-relaxed">
                让 DeepSeek 一键通读本轮检索出的所有素材，穿透各方观点交锋反差（大V营销叙事 vs 社群真实踩坑账本），汇聚实战数字与避坑备忘录，并自动将所有原图合理嵌入！
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleStartMultiSourceRewrite(materials)}
              disabled={isRewriting}
              className="shrink-0 w-full md:w-auto px-5 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-98 text-indigo-950 font-black rounded-xl text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-indigo-950 text-indigo-950" />
              <span>通读全部信源 · 综合二创成文</span>
            </button>
          </div>
        )}

        {searchError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-16 bg-slate-100 rounded w-full" />
                <div className="h-10 bg-slate-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((item) => {
              const isSelected = selectedMaterial?.id === item.id;
              const hasImages = (item.media_urls || []).length > 0;
              const directUrl = getDirectSourceUrl(item);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl p-5 border transition-all flex flex-col justify-between hover:shadow-md ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Platform Badge & Engagement Header */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            item.platform === 'twitter'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : item.platform === 'reddit'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {item.platform === 'twitter' ? '推特 X' : item.platform === 'reddit' ? 'Reddit' : '深度资讯'}
                        </span>
                        <a
                          href={directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-slate-700 hover:text-indigo-600 truncate max-w-[130px] transition-colors inline-block"
                          title="在浏览器新窗口直接打开该作者/原帖来源"
                        >
                          {item.author}
                        </a>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-rose-400" />
                          {item.upvotes || 350}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-indigo-400" />
                          {item.comments_count || 42}
                        </span>
                      </div>
                    </div>

                    {/* Title with Direct Link */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 hover:text-indigo-600 transition-colors">
                      <a
                        href={directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline inline-flex items-baseline gap-1"
                        title="直达一手推文/原文（新标签页打开）"
                      >
                        <span>{item.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-40 hover:opacity-100 text-indigo-500 inline ml-0.5" />
                      </a>
                    </h3>

                    {/* Summary Snippet */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {item.summary}
                    </p>

                    {/* Original Media Preview (Key Feature: Visual Confirmation) */}
                    {hasImages && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>原素材附带 {item.media_urls!.length} 张原配图 (二创将自动融入正文)</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {item.media_urls!.slice(0, 3).map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt="原素材图"
                              className="h-16 w-24 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartRewrite(item)}
                      disabled={isRewriting}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-indigo-600 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>选用此素材 · DeepSeek 深度二创</span>
                    </button>
                    <a
                      href={directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all shrink-0 cursor-pointer shadow-2xs"
                      title="在浏览器新窗口直达推文/原帖来源页面"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{item.platform === 'twitter' ? '直达原推' : item.platform === 'reddit' ? '直达原帖' : '直达原文'}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: DeepSeek Generating Progress Overlay Modal */}
      {/* ============================================================== */}
      {isRewriting && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 text-center animate-slideUp">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-inner">
              <Cpu className="w-8 h-8 animate-pulse text-indigo-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                {isMultiSourceMode
                  ? `DeepSeek 正在统揽全网 ${materials.length} 篇信源综合二创...`
                  : 'DeepSeek-V3 正在深度二创...'}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 max-w-md mx-auto">
                {isMultiSourceMode
                  ? '已通读推特推文、Reddit 讨论与行业资讯，全景交叉印证提炼'
                  : `素材：${selectedMaterial?.title}`}
              </p>
            </div>

            {/* Stepper Display */}
            <div className="space-y-3 text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-3">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    rewriteStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  1
                </span>
                <span className={rewriteStep >= 1 ? 'font-bold text-slate-900' : 'text-slate-400'}>
                  {isMultiSourceMode
                    ? `通读全网 ${materials.length} 篇一手信源，全面合规脱敏并内化为第一视角调查论据`
                    : '去外网化合规脱敏，深度提炼一手核心事实与反差悬念'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    rewriteStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  2
                </span>
                <span className={rewriteStep >= 2 ? 'font-bold text-slate-900' : 'text-slate-400'}>
                  {isMultiSourceMode
                    ? '全面剖析“如何做、注意什么、坑有哪些、如何规避”，起草万字级高密度硬核特稿'
                    : '撰写 4000+ 字硬核实操特稿（废除段落摘要，深挖工序细节与避坑SOP）'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    rewriteStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  3
                </span>
                <span className={rewriteStep >= 3 ? 'font-bold text-emerald-700' : 'text-slate-400'}>
                  {isMultiSourceMode
                    ? '构建微信原生数据对比表格，杜绝外网死链，最大化拉长读者停留时长'
                    : '生成微信原生精美对比表格，替代生硬外网截图与死链'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    rewriteStep >= 4 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  4
                </span>
                <span className={rewriteStep >= 4 ? 'font-bold text-slate-900' : 'text-slate-400'}>
                  规划 2.35:1 官方首条推送大图（55%深色留白+45%特写）与三层视觉锤提示词
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              采用长文深度推理链路，耗时约 10~25 秒，请耐心等待成稿...
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 4: Rewritten Article & 1-Click Copy Workspace */}
      {/* ============================================================== */}
      {rewriteResult && (
        <section className="bg-white rounded-2xl border-2 border-indigo-200 p-6 sm:p-8 space-y-6 shadow-xl animate-fadeIn">
          {/* Top Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {rewriteResult.is_multi_source ? 'DeepSeek 跨信源全景二创成稿' : 'DeepSeek 二创成稿'}
                </span>
                {rewriteResult.selected_archetype && (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 flex items-center gap-1 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    {rewriteResult.selected_archetype}
                  </span>
                )}
                <span className="text-xs text-slate-400 font-mono">
                  正文字数: {rewriteResult.word_count} 字 · 配图已嵌入: {rewriteResult.embedded_images.length} 张
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {rewriteResult.wechat_title}
              </h2>
              {rewriteResult.is_multi_source && rewriteResult.referenced_materials && rewriteResult.referenced_materials.length > 0 ? (
                <div className="space-y-1.5 pt-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>已融汇全网 {rewriteResult.referenced_materials.length} 篇一手信源（点击直达各信源原文）：</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {rewriteResult.referenced_materials.map((m, idx) => (
                      <a
                        key={m.id || idx}
                        href={getDirectSourceUrl(m)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-2xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all max-w-[260px] truncate shadow-2xs"
                        title={`${m.platform}: ${m.title}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          m.platform === 'twitter' ? 'bg-sky-500' : m.platform === 'reddit' ? 'bg-amber-500' : 'bg-purple-500'
                        }`} />
                        <span className="font-bold shrink-0">{m.platform === 'twitter' ? '推特' : m.platform === 'reddit' ? 'Reddit' : '资讯'}</span>
                        <span className="truncate">{m.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-50" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : selectedMaterial ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <span>一手素材依据：</span>
                  <a
                    href={getDirectSourceUrl(selectedMaterial)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
                    title="在浏览器新窗口直达原推文/原帖来源页面"
                  >
                    <span>
                      {selectedMaterial.platform === 'twitter' ? '推特 X' : selectedMaterial.platform === 'reddit' ? 'Reddit' : '深度资讯'} · {selectedMaterial.author}
                    </span>
                    <ExternalLink className="w-3 h-3 text-indigo-500" />
                  </a>
                </div>
              ) : null}
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* PRIMARY ACTION: 1-Click Copy to WeChat MP */}
              <button
                type="button"
                onClick={copyWeChatRichText}
                className="flex items-center gap-2 px-5 py-3 bg-[#07c160] hover:bg-[#06ad56] active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                title="已包含富文本样式、引用块与原配图，直接去微信公众号后台粘贴即可"
              >
                {copyWeChatSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>✓ 已复制！去微信后台 Ctrl+V</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>📋 一键复制到公众号 (带格式与配图)</span>
                  </>
                )}
              </button>

              {/* Copy Markdown */}
              <button
                type="button"
                onClick={copyMarkdownOnly}
                className="flex items-center gap-1.5 px-3.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                title="复制纯 Markdown 源码"
              >
                {copyMarkdownSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4" />}
                <span>复制 Markdown</span>
              </button>

              {/* Jump to Full Publisher Workshop */}
              {onNavigateToPublisher && (
                <button
                  type="button"
                  onClick={onNavigateToPublisher}
                  className="flex items-center gap-1.5 px-4 py-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  title="在手机预览工坊中继续精修或生成高级卡片"
                >
                  <Eye className="w-4 h-4" />
                  <span>手机端全屏精修</span>
                </button>
              )}
            </div>
          </div>

          {/* Gemini AI Cover Studio Showcase (2.35:1 & Typographic Visual Hammer) */}
          {rewriteResult.cover_spec && (
            <div className="bg-slate-950 text-white rounded-2xl p-6 border border-slate-800 space-y-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold text-xs">
                    Gemini AI 封面设计专区
                  </span>
                  <span className="text-xs text-slate-400">微信 2.35:1 官方首条推送大图 (1080x460)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">左侧55%深色留白</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">右侧45%主体特写</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">
                    画面无任何文字
                  </span>
                </div>
              </div>

              {/* 2.35:1 Cover Visual Simulation Card */}
              <div className="relative aspect-[21/9] w-full max-w-4xl mx-auto rounded-xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 flex items-center p-6 sm:p-10 shadow-2xl">
                {/* Left 55% Typographic Visual Hammer */}
                <div className="w-[58%] z-10 space-y-3">
                  <div className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    {rewriteResult.cover_spec.badge_tag || '[深度特稿]'}
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                    {rewriteResult.cover_spec.headline_text || rewriteResult.wechat_title.slice(0, 12)}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium line-clamp-2 max-w-md">
                    {rewriteResult.cover_spec.sub_hook || rewriteResult.digest_summary}
                  </p>
                </div>

                {/* Right 45% Visual Focus Hint */}
                <div className="absolute right-0 top-0 bottom-0 w-[46%] bg-gradient-to-l from-indigo-950/80 via-slate-900/60 to-transparent flex items-center justify-center p-4">
                  <div className="text-center space-y-1 bg-black/40 backdrop-blur-xs p-3 rounded-xl border border-white/10 max-w-xs">
                    <p className="text-[11px] text-slate-300 font-semibold">【画面右侧主体焦点】</p>
                    <p className="text-xs text-indigo-300 font-medium line-clamp-3">
                      {rewriteResult.cover_spec.visual_focus}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gemini AI Prompt Box with One-Click Copy */}
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1 text-xs max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">Gemini AI 英文生图提示词 (Prompt):</span>
                    <span className="text-[11px] text-slate-500">已自动规避塑料感与文字水印</span>
                  </div>
                  <p className="text-slate-300 font-mono text-[12px] leading-relaxed break-all">
                    {rewriteResult.cover_spec.prompt_en}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    中文释义：{rewriteResult.cover_spec.prompt_zh}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyCoverPrompt}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-sm"
                >
                  {copyPromptSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>已复制提示词</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制 Gemini 提示词</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* WeChat Mobile Reading View (Authentic Layout Preview) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Phone Frame Article Preview (Col 8) */}
            <div className="lg:col-span-8 bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200">
              <div className="max-w-[680px] mx-auto bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
                {/* Title */}
                <h1 className="text-2xl font-extrabold text-slate-900 leading-snug">
                  {rewriteResult.wechat_title}
                </h1>

                {/* Author & Source */}
                <div className="flex items-center gap-2 text-xs text-slate-400 border-b border-slate-100 pb-4">
                  <span className="text-indigo-600 font-bold">微信特稿工坊</span>
                  <span>·</span>
                  <span>今日原创发布</span>
                  <span>·</span>
                  <span>原信源：{rewriteResult.original_material?.author} ({rewriteResult.original_material?.platform})</span>
                </div>

                {/* Digest Callout */}
                {rewriteResult.digest_summary && (
                  <div className="p-4 bg-slate-50 border-l-4 border-emerald-500 rounded-r-lg text-slate-700 text-sm leading-relaxed">
                    <strong className="text-slate-900">导读：</strong>
                    {rewriteResult.digest_summary}
                  </div>
                )}

                {/* Embedded Images Gallery Notice */}
                {rewriteResult.embedded_images.length > 0 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                    <span className="font-semibold">
                      ✓ 原素材中的 {rewriteResult.embedded_images.length} 张图片已全部无缝排版嵌入正文！
                    </span>
                    <span className="text-[11px] text-emerald-600">复制后图片随正文一并带入</span>
                  </div>
                )}

                {/* Article Content Render */}
                <div className="prose prose-slate max-w-none text-slate-800 space-y-4 text-sm leading-relaxed">
                  {rewriteResult.markdown_content.split('\n\n').map((para, idx) => {
                    const trimmed = para.trim();
                    if (!trimmed) return null;

                    // Skip doc-level h1
                    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
                      return null;
                    }

                    // H2
                    if (trimmed.startsWith('## ')) {
                      return (
                        <h2
                          key={idx}
                          className="text-lg font-bold text-slate-900 border-l-4 border-emerald-500 pl-3 pt-4 pb-1 mt-6"
                        >
                          {trimmed.replace(/^##\s+/, '')}
                        </h2>
                      );
                    }

                    // H3
                    if (trimmed.startsWith('### ')) {
                      return (
                        <h3 key={idx} className="text-base font-bold text-slate-800 mt-4">
                          {trimmed.replace(/^###\s+/, '')}
                        </h3>
                      );
                    }

                    // Embedded Image
                    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
                    if (imgMatch) {
                      return (
                        <div key={idx} className="my-5 text-center">
                          <img
                            src={imgMatch[2]}
                            alt={imgMatch[1]}
                            className="max-w-full rounded-xl mx-auto shadow-md border border-slate-200"
                          />
                          {imgMatch[1] && (
                            <p className="text-xs text-slate-500 text-center mt-2 font-medium">
                              {imgMatch[1]}
                            </p>
                          )}
                        </div>
                      );
                    }

                    // Markdown Table rendering in preview
                    if (trimmed.startsWith('|') && trimmed.includes('|')) {
                      const tableRows = trimmed.split('\n').filter((r) => r.trim().startsWith('|'));
                      if (tableRows.length >= 2) {
                        const parseCells = (rowStr: string) =>
                          rowStr
                            .replace(/^\|/, '')
                            .replace(/\|$/, '')
                            .split('|')
                            .map((c) => c.trim());
                        const headerCells = parseCells(tableRows[0]);
                        const isDelimiter = /^\|?[\s-:]+\|?/.test(tableRows[1]);
                        const bodyRows = tableRows.slice(isDelimiter ? 2 : 1).map(parseCells);
                        return (
                          <div key={idx} className="my-5 overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-200 text-xs rounded-xl overflow-hidden shadow-2xs">
                              <thead>
                                <tr className="bg-slate-100 text-slate-800 font-bold text-left">
                                  {headerCells.map((h, hIdx) => (
                                    <th key={hIdx} className="p-2.5 border-b border-slate-200">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {bodyRows.map((row, rIdx) => (
                                  <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="p-2.5 border-b border-slate-100 text-slate-700 leading-normal">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                    }

                    // Blockquote
                    if (trimmed.startsWith('>')) {
                      return (
                        <blockquote
                          key={idx}
                          className="p-3.5 bg-slate-50 border-l-4 border-indigo-400 rounded-r-lg text-slate-600 text-xs my-3 italic"
                        >
                          {trimmed.replace(/^>\s*/, '')}
                        </blockquote>
                      );
                    }

                    // Regular Paragraph
                    return (
                      <p key={idx} className="text-slate-700 leading-relaxed text-justify">
                        {trimmed}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Original Material Contrast Drawer (Col 4) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>原素材信息对照</span>
                  </h3>
                  <a
                    href={rewriteResult.original_material?.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>原文链接</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400">原标题：</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{rewriteResult.original_material?.title}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">作者与信源：</span>
                    <p className="text-slate-700 font-mono">
                      {rewriteResult.original_material?.author} ({rewriteResult.original_material?.platform})
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">原帖核心事实摘录：</span>
                    <p className="text-slate-600 leading-relaxed mt-1 max-h-48 overflow-y-auto bg-white p-3 rounded-lg border border-slate-200">
                      {rewriteResult.original_material?.raw_text || rewriteResult.original_material?.summary}
                    </p>
                  </div>

                  {rewriteResult.embedded_images.length > 0 && (
                    <div className="pt-2">
                      <span className="text-slate-400 block mb-1">沿用的原图素材：</span>
                      <div className="grid grid-cols-2 gap-2">
                        {rewriteResult.embedded_images.map((img, i) => (
                          <div key={i} className="group relative rounded-lg overflow-hidden border border-slate-200">
                            <img src={img.url} alt={img.caption} className="h-16 w-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-1 flex items-end">
                              <span className="text-[10px] text-white line-clamp-1">{img.caption}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom One-Click Copy Repeat */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={copyWeChatRichText}
                    className="w-full py-2.5 bg-[#07c160] hover:bg-[#06ad56] text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copyWeChatSuccess ? '✓ 已复制到剪贴板！' : '一键复制微信公众号富文本'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
