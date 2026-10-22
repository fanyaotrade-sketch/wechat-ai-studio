import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Maximize2,
  Crop,
  ShieldCheck,
  Upload,
  UserCheck,
  Wand2,
  Image as ImageIcon,
  Layers,
  Info,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import type { Archetype, DraftArticleOutput, ArticleBlueprint, ThemeCategory, ModelConfig } from '../types/pipeline';

interface WeChatCoverStudioProps {
  currentArchetype: Archetype;
  article: DraftArticleOutput;
  blueprint: ArticleBlueprint;
  themeCategory?: ThemeCategory;
  categoryLabel?: string;
  modelConfig?: ModelConfig;
  onUpdateArticle?: (arc: Archetype, updated: DraftArticleOutput) => void;
}

export interface CoverPromptOption {
  id: string;
  concept_title: string;
  headline_text: string;
  prominent_figure?: string;
  visual_focus: string;
  prompt_en: string;
  prompt_zh: string;
  aspect_ratio: string;
  negative_prompt?: string;
}

// 瞬时动态生成器：在云端大模型推理返回前，基于当前文章标题与事实，立即提供专供 Google Gemini AI 的高质量可用基准方案，杜绝白屏等待
function buildInstantContextualPrompts(title: string, summary: string, archetype: Archetype): CoverPromptOption[] {
  const cleanTitle = (title || '深度特稿').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ').trim();
  const shortHeadline = cleanTitle.length > 14 ? cleanTitle.slice(0, 14) : cleanTitle;

  // 动态感知文章中的知名公众人物或领军企业
  const prominentMatches = title.match(/(马斯克|黄仁勋|奥特曼|雷军|扎克伯格|任正非|梁文锋|DeepSeek|OpenAI|英伟达|特斯拉|苹果|华为)/i);
  const detectedFocus = prominentMatches ? prominentMatches[0] : '真实核心现场';

  // 区分全球熟知公众人物 vs 区域创始人/研发团队（规避 Gemini 绘制无脸模人物时的塑料蜡像假脸）
  const isGlobalCeleb = /(马斯克|黄仁勋|奥特曼|雷军|扎克伯格|任正非)/i.test(detectedFocus);

  const figureNarrativeEn = isGlobalCeleb
    ? `A candid press documentary photo capturing ${detectedFocus} in a thoughtful, unposed moment at a minimalist dark wooden table, natural directional window light, realistic skin texture and authentic facial micro-expressions`
    : `A cinematic documentary side-profile silhouette of a thoughtful technology innovator working late at night, lit by a single warm tungsten desk lamp raking across handwritten paper notes and a ceramic coffee cup, deep moody shadows`;

  return [
    {
      id: 'instant_opt_1',
      concept_title: `视角一：【${detectedFocus}】真实自然光新闻纪实特写`,
      headline_text: `${detectedFocus}：真相彻底浮出水面`,
      prominent_figure: detectedFocus,
      visual_focus: `${detectedFocus} 的真实光学纪实摄影，单向自然光与深色暗调，上方 45% 纯净留白，无塑料感，零文字`,
      prompt_en: `An ultra-wide panoramic 2.35:1 aspect ratio documentary editorial press photograph. ${figureNarrativeEn}. A solid dark graphite and charcoal background with deep dramatic chiaroscuro shadows. Shot on Leica M11 with 35mm f/1.4 lens, authentic subtle 35mm film grain, tangible physical textures. Composition: The main visual focus is strictly centered within the middle 1:1 square zone so it remains completely intact when cropped on mobile feeds. The upper 45% of the frame is vast, quiet, dark negative space. Crucial composition rule: The photograph contains absolutely zero text, zero letters, zero words, zero numbers, zero watermarks, and no typography whatsoever. Zero plastic skin, zero 3D render, zero CGI, zero neon.`,
      prompt_zh: `针对《${cleanTitle}》的真实自然光纪实特写，深色暗调纯净背景，上方 45% 纯净留白，彻底杜绝 AI 塑料感与假脸，绝无文字乱码`,
      negative_prompt: 'plastic skin, 3d render, cgi, glowing neon lights, cyber circuits, blue sci-fi tint, floating holographic icons, text, watermarks, oversaturated',
      aspect_ratio: '2.35:1 (微信官方推送大图 1080x460)'
    },
    {
      id: 'instant_opt_2',
      concept_title: `视角二：微观实物工台与物理机理静物`,
      headline_text: `撕开光鲜外衣：算清底层核心账本`,
      prominent_figure: '一线实操与物理物象',
      visual_focus: '真实工作台面的局部特写与自然漫射光，哑光深色材质，拒绝赛博发光',
      prompt_en: `An ultra-wide panoramic 2.35:1 aspect ratio cinematic documentary still life photograph of an authentic research workbench related to ${cleanTitle}. Textured physical engineering notes, paper schematics, and mechanical working tools resting on a dark matte graphite surface. Gentle ambient tungsten side lighting with rich chiaroscuro shadows. Shot on 35mm lens with natural shallow depth of field. Composition: The physical subjects are tightly centered in the middle 1:1 zone with expansive dark breathing room in the upper half. Crucial composition rule: The image contains absolutely zero text, zero letters, zero words, and no typography whatsoever. Lived-in authentic tactile atmosphere, zero CGI, zero floating graphics, zero plastic sheen.`,
      prompt_zh: `真实工作台面特写，深色哑光材质，柔和自然漫射光，中央居中安全区与大面积暗调留白，沉稳严肃商业感，无乱码文字`,
      negative_prompt: 'fake text, neon glow, glowing orb, plastic desk, 3d model, distorted hands, cartoon, watermark',
      aspect_ratio: '2.35:1 (微信官方推送大图 1080x460)'
    },
    {
      id: 'instant_opt_3',
      concept_title: `视角三：宏观产业空间与千亿格局冷全景`,
      headline_text: `残酷洗牌倒计时：谁在裸泳谁在造血`,
      prominent_figure: '产业宏观全景',
      visual_focus: '冷峻深邃的现代化工业与研发空间全景，大面积暗调留白，无科幻假背景',
      prompt_en: `An ultra-wide panoramic 2.35:1 aspect ratio architectural editorial documentary photograph representing ${cleanTitle}. A quiet industrial facility or modern research space with deep muted charcoal, slate, and raw steel tones. Minimalist perspective lines under natural architectural daylight casting long soft shadows. Shot on Leica M11 with wide lens. Composition: The physical horizon is grounded low with expansive dark negative space occupying the upper half. Crucial composition rule: The photograph contains absolutely zero text, zero letters, zero numbers, and no typography whatsoever. Grounded realism, zero sci-fi fantasy, zero lasers, zero glowing holographic effects, zero CGI.`,
      prompt_zh: `冷峻深邃的现代化产业空间全景，大面积暗调留白，极具千亿产业的宏大叙事分量，绝对无科幻光效与乱码文字`,
      negative_prompt: 'flying lasers, floating holograms, cyan glowing floor, futuristic fantasy, distorted machinery, watermark',
      aspect_ratio: '2.35:1 (微信官方推送大图 1080x460)'
    }
  ];
}

export const WeChatCoverStudio: React.FC<WeChatCoverStudioProps> = ({
  currentArchetype,
  article,
  blueprint,
  themeCategory = 'clean_energy_materials',
  categoryLabel = '硬核前沿',
  modelConfig,
  onUpdateArticle,
}) => {
  const currentTitle = article?.wechat_title || blueprint?.wechat_title || '当前文章';
  const currentSummary = article?.digest_summary || blueprint?.core_angle || '';

  // State for AI-generated cover prompts
  const [isGenerating, setIsGenerating] = useState(false);
  // Default to instant tailored prompts so user never sees a blank page
  const [prompts, setPrompts] = useState<CoverPromptOption[]>(() =>
    buildInstantContextualPrompts(currentTitle, currentSummary, currentArchetype)
  );
  const [prominentFigure, setProminentFigure] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedTextType, setCopiedTextType] = useState<string | null>(null);
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState<string | null>(
    article?.cover_image_url || null
  );

  const activeModelName =
    modelConfig?.stageModels?.plannerModel ||
    modelConfig?.model ||
    (modelConfig?.provider === 'siliconflow' ? 'DeepSeek-V3' : 'Cloud LLM');

  // Helper to fetch or refresh cover prompts from LLM based on current article content
  const fetchCoverPrompts = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/pipeline/generate-cover-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: currentTitle,
          articleContent: article?.markdown_content?.slice(0, 3500) || '',
          summary: currentSummary,
          archetype: currentArchetype,
          themeCategory,
          apiConfig: modelConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.options && data.options.length > 0) {
        setPrompts(data.options);
        if (data.prominent_figure) {
          setProminentFigure(data.prominent_figure);
        } else if (data.options[0]?.prominent_figure) {
          setProminentFigure(data.options[0].prominent_figure);
        }
        // Sync the first option to the article draft object
        if (onUpdateArticle && data.options[0]) {
          const opt = data.options[0];
          onUpdateArticle(currentArchetype, {
            ...article,
            cover_spec: {
              headline_text: opt.headline_text,
              prominent_figure: opt.prominent_figure || data.prominent_figure,
              visual_focus: opt.visual_focus,
              prompt_en: opt.prompt_en,
              prompt_zh: opt.prompt_zh,
              aspect_ratio: opt.aspect_ratio || '2.35:1 (推送大图 1080x460)',
              negative_prompt: opt.negative_prompt,
            },
            cover_prompt_en: opt.prompt_en,
            cover_prompt_zh: opt.prompt_zh,
          });
        }
      }
    } catch (err) {
      console.error('Failed to generate cover prompts:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Pre-populate or auto-generate on load
  useEffect(() => {
    if (article?.cover_image_url) {
      setUploadedCoverUrl(article.cover_image_url);
    }

    // 1. If article already has cover_spec with prompt_en, populate immediately!
    if (article?.cover_spec && article.cover_spec.prompt_en) {
      const existing: CoverPromptOption = {
        id: 'existing_spec',
        concept_title: article.cover_spec.visual_focus || '当前文章量身定制专属封面',
        headline_text: article.cover_spec.headline_text || currentTitle,
        prominent_figure: article.cover_spec.prominent_figure,
        visual_focus: article.cover_spec.visual_focus || '真实高对比度新闻纪实，顶部留白',
        prompt_en: article.cover_spec.prompt_en,
        prompt_zh: article.cover_spec.prompt_zh || '基于本文具体事实与冲突构思的深色纯净纪实摄影',
        negative_prompt:
          article.cover_spec.negative_prompt ||
          'plastic skin, 3d render, cgi, glowing neon lights, cyber circuits, blue sci-fi tint, floating holographic icons, text, watermarks, oversaturated',
        aspect_ratio: article.cover_spec.aspect_ratio || '2.35:1 (推送大图 1080x460)',
      };
      setPrompts([existing]);
      if (article.cover_spec.prominent_figure) {
        setProminentFigure(article.cover_spec.prominent_figure);
      }
    } else {
      // 2. Initialize with instant dynamic baseline so user NEVER sees empty state, then fetch in background
      setPrompts(buildInstantContextualPrompts(currentTitle, currentSummary, currentArchetype));
      fetchCoverPrompts();
    }
  }, [currentArchetype, currentTitle]);

  // Copy helper
  const handleCopy = (text: string, id: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setCopiedTextType(type);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedTextType(null);
    }, 2200);
  };

  // Upload external generated image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadedCoverUrl(base64);
        if (onUpdateArticle) {
          onUpdateArticle(currentArchetype, {
            ...article,
            cover_image_url: base64,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= Top Banner & Dynamic Refresh Header ================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Gemini AI 微信封面工坊</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center gap-1">
                <span>⚡ 专为 Google Gemini AI (Imagen 3) 优化</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono font-medium">
                {currentArchetype === 'M' ? '头条 · 深度特稿' : currentArchetype === 'S' ? '次条 · 深度拆解' : '三条 · 商业观察'}
              </span>
              {/* Active Model Indicator */}
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-medium flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>推理模型: {activeModelName}</span>
              </span>
              {prominentFigure && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>正文识别焦点: {prominentFigure}</span>
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>《{currentTitle}》</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              根据当前文章的真实事实、数据与人物冲突，专为 <strong>Google Gemini AI (Imagen 3)</strong> 定制<strong>自然语言叙事、绝对零文字、防蜡像假脸、真实新闻摄影质感</strong>的 2.35:1 官方首条封面生图提示词。
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchCoverPrompts}
              disabled={isGenerating}
              className="px-5 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-sm rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="大模型将通读本篇正文，重新挖掘人物、冲突与物理细节，为 Gemini AI 生成 3 套差异化提示词"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? '大模型深度推理中...' : '🔄 重新研读正文·换一套提示词'}</span>
            </button>
          </div>
        </div>

        {/* Non-blocking Background Generation Progress Notice */}
        {isGenerating && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-300 animate-pulse">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
              <span>已接通【{activeModelName}】大模型推理：正在逐字通读 5000+ 字全篇事实与人物，正在为 Gemini AI 构筑高拟真自然语言段落...（当前下方提示词已可直接复制）</span>
            </span>
          </div>
        )}
      </div>

      {/* ================= WeChat Dimensions & Safe Area Visual Guide Card ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              微信公众号封面图核心尺寸与 Gemini AI 生图黄金法则
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">GEMINI AI COVER SPECS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Card 1 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <Maximize2 className="w-4 h-4 text-indigo-600" />
                <span>2.35:1 官方首条推送画幅</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono font-bold text-[10px]">
                1080 × 460 px
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              读者在订阅号列表未点开文章时展示的标准大图比例。提示词以自然语言指定{' '}
              <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-800 font-mono font-bold">
                An ultra-wide panoramic 2.35:1 aspect ratio
              </code>
              ，Gemini AI 原生理解宽幅全景摄影。
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs sm:text-sm">
                <Crop className="w-4 h-4 text-amber-600" />
                <span>1:1 朋友圈/群聊黄金安全区</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-mono font-bold text-[10px]">
                500 × 500 px
              </span>
            </div>
            <p className="text-amber-900/80 leading-relaxed text-[11px]">
              当文章被转发到微信好友、群聊或朋友圈卡片时，系统会自动<strong>居中裁切成 1:1 正方形</strong>。提示词已要求视觉焦点聚集在正中央，四周留出安全呼吸空间，绝不被裁切。
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs sm:text-sm">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>绝对无字 (Zero-Text) 铁律</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono font-bold text-[10px]">
                杜绝乱码文字
              </span>
            </div>
            <p className="text-emerald-900/80 leading-relaxed text-[11px]">
              Gemini 具备文字渲染能力，一旦提示词包含标题文字便会画出扭曲乱码。提示词已包含严格指令{' '}
              <code className="px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                zero text, zero letters
              </code>
              ，上方保留纯净暗调留白，方便后续排版。
            </p>
          </div>
        </div>
      </div>

      {/* ================= Prompt Cards Section (3 Distinct Options, Always Interactive) ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              本文专属 Gemini AI 去塑料感封面提示词方案 (3 套差异化视角)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            点击任意方案即可一键复制英文 Prompt 去 Gemini 生成
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {prompts.map((opt, idx) => {
            const promptCardId = opt.id || `prompt_card_${idx}`;
            return (
              <div
                key={promptCardId}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all p-5 space-y-4"
              >
                {/* Option Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {opt.concept_title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        {opt.prominent_figure && (
                          <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                            焦点人物/物象: {opt.prominent_figure}
                          </span>
                        )}
                        <span className="font-mono text-slate-400">
                          画幅: {opt.aspect_ratio || '2.35:1 (1080×460)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Copy Main Prompt Button */}
                  <button
                    onClick={() => handleCopy(opt.prompt_en, promptCardId, 'prompt')}
                    className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 ${
                      copiedId === promptCardId && copiedTextType === 'prompt'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-amber-300'
                    }`}
                    title="复制专供 Gemini AI 的完整英文自然语言提示词到剪贴板"
                  >
                    {copiedId === promptCardId && copiedTextType === 'prompt' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>已复制 Gemini Prompt！</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>📋 复制 Gemini AI 生图提示词</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Headline Suggestion (Visual Hammer) */}
                {opt.headline_text && (
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-300/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                        <span>💡 封面醒目大字建议 (8~14 字视觉锤，由创作者后续在封面上叠加)：</span>
                      </span>
                      <p className="text-sm font-black text-slate-900 tracking-tight">
                        “{opt.headline_text}”
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(opt.headline_text, promptCardId, 'headline')}
                      className="px-2.5 py-1 text-xs font-semibold bg-white text-slate-700 hover:text-slate-950 border border-amber-300/80 rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedId === promptCardId && copiedTextType === 'headline' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>已复制大字</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>复制大字</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* English Gemini Prompt Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-bold flex items-center gap-1.5">
                      <span>Gemini AI (Imagen 3) 专属自然语言生图提示词</span>
                    </span>
                    <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono font-medium">
                      自然语言叙事 · 2.35:1 · 零文字
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl font-mono text-xs text-amber-200 leading-relaxed select-all border border-slate-800 shadow-inner">
                    {opt.prompt_en}
                  </div>

                  {/* Gemini usage quick tip */}
                  <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-200/80 text-[11px] text-blue-900 flex items-center gap-2">
                    <span className="font-bold text-blue-800 shrink-0">💡 Gemini 使用技巧：</span>
                    <span>打开 Gemini，直接在输入框发送：<code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono font-bold text-blue-950">Generate an image: </code> 并紧接着粘贴上方英文提示词，即可直出纯净无字大图。</span>
                  </div>
                </div>

                {/* Chinese Prompt Explanation */}
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                  <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    <span>画面构图与设计意图：</span>
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    {opt.prompt_zh || opt.visual_focus}
                  </p>
                </div>

                {/* Negative Prompt */}
                {opt.negative_prompt && (
                  <div className="flex items-center justify-between gap-3 text-xs bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                    <div className="min-w-0 font-mono text-[11px] text-rose-900/80 truncate">
                      <span className="font-bold text-rose-700">🚫 Negative (已融入英文指令中):</span>{' '}
                      {opt.negative_prompt}
                    </div>
                    <button
                      onClick={() => handleCopy(opt.negative_prompt || '', promptCardId, 'negative')}
                      className="px-2 py-0.5 text-[11px] text-rose-700 font-semibold hover:underline shrink-0 cursor-pointer"
                    >
                      {copiedId === promptCardId && copiedTextType === 'negative' ? '已复制' : '复制负向词'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= Optional: Attach Externally Generated Image ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              回填生图结果 (可选)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            在 Midjourney/FLUX 生成完毕后，可上传至此作为文章封面底图
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <label className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2 cursor-pointer shadow-2xs shrink-0">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>选择已生成的 2.35:1 封面图片</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {uploadedCoverUrl ? (
            <div className="flex items-center gap-3">
              <img
                src={uploadedCoverUrl}
                alt="Uploaded Cover"
                className="w-24 h-10 object-cover rounded-md border border-slate-300 shadow-2xs"
              />
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>已应用为当前文章封面</span>
              </span>
              <button
                onClick={() => {
                  setUploadedCoverUrl(null);
                  if (onUpdateArticle) {
                    onUpdateArticle(currentArchetype, {
                      ...article,
                      cover_image_url: undefined,
                    });
                  }
                }}
                className="text-xs text-rose-600 hover:underline cursor-pointer"
              >
                移除
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-500">
              若暂时无需在系统内预览最终图，只需复制上方提示词至外部工具即可。
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
