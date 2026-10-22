import type { AntiAILintResult, Archetype, ImageSlotDirective } from '../types/pipeline';
import { isAiClicheHeading, generateContextualJournalisticHeading } from './headlineEngine.ts';

export interface CustomBannedWord {
  id: string;
  word: string;
  category?: 'ad_law' | 'ai_cliche' | 'enterprise_sensitive' | 'custom';
  suggestedReplacement?: string;
  enabled: boolean;
}

export const BANNED_AI_WORDS: string[] = [
  '毋庸置疑',
  '双刃剑',
  '正如古人云',
  '综上所述',
  '不言而喻',
  '不可否认',
  '在当今数字化浪潮',
  '在当今快节奏的世界',
  '赋能',
  '闭环',
  '底层逻辑',
  '降维打击',
  '心智模型',
  '打法',
  '矩阵',
  '值得注意的是',
  '显而易见的是',
  '然而，事物总有两面性',
  '总而言之',
  '不仅如此，而且',
  '助力每一个',
  '探索无限可能',
  '画卷正在徐徐展开',
  '重塑行业格局',
  '🎯',
];

export const DEFAULT_BANNED_WORD_REPLACEMENTS: Record<string, string[]> = {
  '🎯': [''],
  '赋能': ['帮助', '提供实质支持', '助推业务', '带动'],
  '闭环': ['打通全流程', '完整跑通流程', '落定实操'],
  '双刃剑': ['利弊参半', '暗藏潜在代价', '是一体两面'],
  '毋庸置疑': ['很显然', '毫无疑问', '不用多说'],
  '不言而喻': ['不难看出', '一目了然', '大家心知肚明'],
  '不可否认': ['确实如此', '不得不承认', '实打实地说'],
  '底层逻辑': ['核心运转机制', '基本原理', '关键本质'],
  '降维打击': ['压倒性优势', '直接包抄', '大幅降维'],
  '心智模型': ['思考方式', '认知习惯', '心智判断'],
  '打法': ['具体做法', '实操路径', '实战打法'],
  '矩阵': ['多渠道布局', '组合拳', '产品系列'],
  '值得注意的是': ['这里有个细节', '特别留神的是', '关键提醒在于'],
  '显而易见的是': ['直白来看', '明摆着的事实是', '很明显'],
  '然而，事物总有两面性': ['不过，硬币总有另一面', '但凡事都有代价'],
  '总而言之': ['说到底', '归根结底', '一句话总结'],
  '综上所述': ['总的来看', '拉平来看', '整体审视下来'],
  '正如古人云': ['老话常说', '俗话说得好'],
  '在当今数字化浪潮': ['在当下这波新技术普及中', '在如今行业加速转型的关口'],
  '在当今快节奏的世界': ['在信息与概念飞速刷新的今天'],
  '不仅如此，而且': ['更关键的是', '甚至还', '除此以外'],
  '助力每一个': ['实实在在帮到每一个', '让每个用户都能'],
  '探索无限可能': ['挖掘更真实的增长机会', '寻找更多落地空间'],
  '画卷正在徐徐展开': ['真实面貌正逐渐浮现', '关键趋势开始落地'],
  '重塑行业格局': ['彻底改写了行业现状', '正在重构产业链规则'],
};

export const MECHANICAL_HEADER_PATTERNS = [
  /^#+\s*(一|二|三|四|五|六|七|八|九|十)[、.：:]\s*(背景|核心优势|落地实施|总结|展望)/m,
  /^#+\s*(第[一二三四五六七八九十]部分|第一章|引言|结语)/m,
  /^#+\s*(01|02|03|04)\s*[-_./]/m,
];

/**
 * Counts characters for Chinese + English text, excluding image markers like [图1], [图2], etc.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  // Exclude image slot markers like [图1], [图2], [📸 建议配图...], and markdown images
  const cleaned = text
    .replace(/\[(?:图\s*[0-9一二三四五六七八九十]+|📸|🖼️|配图建议|建议配图)[^\]]*?\]/g, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  // Match Chinese characters + non-whitespace words
  const cjk = (cleaned.match(/[\u4e00-\u9fa5]/g) || []).length;
  const latinWords = (cleaned.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z0-9_-]+/g) || []).length;
  return cjk + latinWords;
}

const CHINESE_NUM_MAP: Record<string, number> = {
  '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
  '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
};

/**
 * Extracts explicit image directives and image placeholders from markdown,
 * supporting clean [图1] markers as well as explicit directives.
 */
export function extractImageSlots(markdown: string): ImageSlotDirective[] {
  if (!markdown) return [];
  const slots: ImageSlotDirective[] = [];

  // 1. First priority: match clean [图1], [图2], [图 3], [图一] markers
  const simpleSlotRegex = /\[(?:图)\s*([0-9一二三四五六七八九十]+)\]/g;
  let sMatch: RegExpExecArray | null;

  while ((sMatch = simpleSlotRegex.exec(markdown)) !== null) {
    const rawIndex = sMatch[1]?.trim();
    const numericIndex = CHINESE_NUM_MAP[rawIndex] || parseInt(rawIndex, 10) || (slots.length + 1);
    const slotId = `slot_${numericIndex}`;

    slots.push({
      slot_id: slotId,
      title: `正文配图 ${numericIndex}`,
      slot_type: 'ai_photo',
      recommended_size: '16:9 横屏 (1280x720 推荐横图)',
      aspect_ratio: '16:9',
      description: `正文第 ${numericIndex} 处深度纪实插图，建议使用徕卡35mm定焦自然光实拍风格`,
      source_suggestion: 'Google AI Studio Imagen 3 依据旁侧提示词自动生成，或右侧微调重绘',
      caption: `[图${numericIndex}]`,
      ai_prompt_en: `A wide-angle 16:9 editorial documentary photograph, natural morning window daylight, 35mm lens, f/2.8, realistic texture, shallow depth of field, authentic environment, high contrast, clean composition, no text, no letters, no watermarks --ar 16:9 --style raw`,
      ai_prompt_zh: `写实摄影插图，16:9横屏，自然柔和窗光，35mm定焦景深虚化，高对比度真实质感，无任何文字乱码。`,
      negative_prompt: 'text, letters, words, watermarks, distorted digits, messy typography, plastic skin, 3D render, glowing cyberpunk neon, oversaturated colors, cartoon, blurry hands',
      anti_ai_technique: '使用35mm大光圈实焦镜头、自然漫射光，杜绝过度锐化与赛博荧光塑料感',
      mobile_readability_warning: '避免画面内部生成英文小字与杂乱背景，确保手机端缩放后视觉干净清晰',
      raw_match: sMatch[0],
      start_index: sMatch.index,
      end_index: sMatch.index + sMatch[0].length,
      is_inserted: false,
    });
  }

  // 2. Also match verbose pattern if present: [📸 建议配图 #1: 标题 | 建议尺寸: 16:9 | 拍摄建议: ...]
  const directiveRegex = /\[(?:📸|🖼️|配图建议|建议配图)[^\]]*?#?([0-9A-Za-z_-]+)?[^\]]*?[:：]\s*([^|\]]+)(?:\|\s*建议尺寸[:：]\s*([^|\]]+))?(?:\|\s*(?:拍摄建议|来源建议|说明)[:：]\s*([^|\]]+))?(?:\|\s*(?:AI提示词|生图Prompt|Prompt)[:：]\s*([^\]]+))?\]/g;
  let match: RegExpExecArray | null;

  while ((match = directiveRegex.exec(markdown)) !== null) {
    const title = match[2]?.trim() || '实操配图插槽';
    const rawSize = match[3]?.trim() || '16:9 横屏 (1280x720)';
    const description = match[4]?.trim() || '建议在此插入实操界面截图或对比图';
    const customPrompt = match[5]?.trim();

    let aspectRatio: '16:9' | '2:1' | '4:3' | '9:16' | '1:1' = '16:9';
    if (rawSize.includes('9:16')) aspectRatio = '9:16';
    else if (rawSize.includes('2:1') || rawSize.includes('2.35:1')) aspectRatio = '2:1';
    else if (rawSize.includes('4:3')) aspectRatio = '4:3';
    else if (rawSize.includes('1:1')) aspectRatio = '1:1';

    // Avoid duplicate if already extracted by simple regex
    const derivedSlotId = match[1] || `slot_${slots.length + 1}`;
    if (!slots.some((s) => s.slot_id === derivedSlotId)) {
      slots.push({
        slot_id: derivedSlotId,
        title,
        slot_type: rawSize.includes('9:16') ? 'screenshot' : title.includes('收益') || title.includes('账单') ? 'proof_photo' : 'ai_photo',
        recommended_size: rawSize,
        aspect_ratio: aspectRatio,
        description,
        source_suggestion: '可直接抓取原帖素材，或手机直接截图，或根据提示词AI生成',
        caption: title,
        ai_prompt_en: customPrompt || `cinematic documentary photo of ${title}, warm natural window daylight, 35mm lens, f/2.8, realistic texture, shallow depth of field, authentic environment, no synthetic CGI glow --ar ${aspectRatio === '9:16' ? '9:16' : '16:9'} --style raw --v 6.1`,
        ai_prompt_zh: `${title}写实摄影，自然窗光，35mm微焦镜头，避免AI塑料感与文字乱码`,
        negative_prompt: 'text, letters, words, watermarks, distorted digits, messy typography, plastic skin, 3D render, glowing cyberpunk neon, oversaturated colors, cartoon, blurry hands, uncanny artificial lighting',
        anti_ai_technique: '使用35mm大光圈实焦镜头、自然晨光漫射、景深虚化界面，彻底摆脱AI生成的油腻塑料质感与科幻荧光色',
        mobile_readability_warning: '⚠️ 手机端避坑：绝对禁止让AI在画面内部生成密集英文表格或小数字，手机屏宽缩小后全是乱码。数据应通过下方正文或Satori矢量卡片呈现！',
        revenue_substitute_strategy:
          title.includes('收益') || title.includes('佣金') || title.includes('账单') || title.includes('分润') || title.includes('结算') || title.includes('流水') || title.includes('后台')
            ? '💡 收益/数据替代方案：采用【景深微焦实拍】，展示笔电上模糊的趋势折线与咖啡杯，重在营造真实干活氛围，关键数据在正文高亮列出；或使用本站【卡片工坊】一键生成高对比度Satori结算卡。'
            : '💡 实景代入替代方案：避免使用泛滥的AI科幻蓝紫背景，改用真实的木质桌面、手机操作实拍或干净的高对比度矢量信息卡片。',
        raw_match: match[0],
        start_index: match.index,
        end_index: match.index + match[0].length,
        is_inserted: false,
      });
    }
  }

  // 3. Also match standard markdown images: ![title](./assets/xxx.png)
  const mdImgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  while ((match = mdImgRegex.exec(markdown)) !== null) {
    const derivedId = `img_${slots.length + 1}`;
    if (!slots.some((s) => s.slot_id === derivedId)) {
      slots.push({
        slot_id: derivedId,
        title: match[1] || '文章配图',
        slot_type: 'satori_card',
        recommended_size: '1080x1440 竖版',
        aspect_ratio: '4:3',
        description: `已插入配图: ${match[2]}`,
        source_suggestion: '下方卡片工坊导出或微信图床素材',
        caption: match[1] || '信息卡片',
        negative_prompt: 'distorted text, blurry graphics, low resolution',
      mobile_readability_warning: '矢量卡片排版已经过 375px 窄屏字号测试，大字号保证手机端清晰易读。',
      raw_match: match[0],
      start_index: match.index,
      end_index: match.index + match[0].length,
      is_inserted: true,
      image_url: match[2],
      preview_image_url: match[2],
    });
    }
  }

  return slots;
}

/**
 * Helper to retrieve suggested replacements for a banned word
 */
export function getSuggestedReplacements(word: string, customWords: CustomBannedWord[] = []): string[] {
  // Check custom words first
  const custom = customWords.find((cw) => cw.word === word && cw.enabled);
  if (custom && custom.suggestedReplacement) {
    const list = custom.suggestedReplacement.split(/[,，、/|]/).map((s) => s.trim()).filter(Boolean);
    if (list.length > 0) return list;
  }
  // Check default replacements
  if (DEFAULT_BANNED_WORD_REPLACEMENTS[word]) {
    return DEFAULT_BANNED_WORD_REPLACEMENTS[word];
  }
  return ['（已删除/平白叙述）'];
}

/**
 * Pure function to scan text for banned AI cliches and custom prohibited words
 */
export function scanForBannedWords(
  text: string,
  customWords: (string | CustomBannedWord)[] = []
): Array<{
  word: string;
  count: number;
  context: string;
  suggestedReplacements?: string[];
  isCustom?: boolean;
  category?: string;
}> {
  if (!text) return [];
  const results: Array<{
    word: string;
    count: number;
    context: string;
    suggestedReplacements?: string[];
    isCustom?: boolean;
    category?: string;
  }> = [];

  // 1. Scan default built-in AI cliches
  for (const word of BANNED_AI_WORDS) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      const firstIndex = text.indexOf(word);
      const start = Math.max(0, firstIndex - 16);
      const end = Math.min(text.length, firstIndex + word.length + 16);
      const snippet = '...' + text.slice(start, end).replace(/\n/g, ' ') + '...';
      results.push({
        word,
        count: matches.length,
        context: snippet,
        suggestedReplacements: DEFAULT_BANNED_WORD_REPLACEMENTS[word] || ['（已删除）'],
        isCustom: false,
        category: 'AI机械八股词',
      });
    }
  }

  // 2. Scan custom user-defined banned words
  const parsedCustomWords: CustomBannedWord[] = customWords.map((item) => {
    if (typeof item === 'string') {
      return { id: item, word: item, enabled: true, category: 'custom' };
    }
    return item;
  });

  for (const cw of parsedCustomWords) {
    if (!cw.enabled || !cw.word.trim()) continue;
    // Prevent duplicate if already in default words
    if (BANNED_AI_WORDS.includes(cw.word)) continue;

    const escaped = cw.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      const firstIndex = text.indexOf(cw.word);
      const start = Math.max(0, firstIndex - 16);
      const end = Math.min(text.length, firstIndex + cw.word.length + 16);
      const snippet = '...' + text.slice(start, end).replace(/\n/g, ' ') + '...';
      const repls = cw.suggestedReplacement
        ? cw.suggestedReplacement.split(/[,，、/|]/).map((s) => s.trim()).filter(Boolean)
        : ['（建议删除或换用大白话）'];
      results.push({
        word: cw.word,
        count: matches.length,
        context: snippet,
        suggestedReplacements: repls,
        isCustom: true,
        category:
          cw.category === 'ad_law'
            ? '新广告法极限词'
            : cw.category === 'enterprise_sensitive'
            ? '企业/行业敏感词'
            : '自定义过滤词',
      });
    }
  }

  return results;
}

/**
 * Replace a specific banned word in text with the replacement string
 */
export function replaceBannedWord(text: string, targetWord: string, replacement: string): string {
  if (!text || !targetWord) return text;
  const escaped = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'g');
  return text.replace(regex, replacement);
}

/**
 * Clean all detected banned words in text in one click
 */
export function cleanAllBannedWords(
  text: string,
  customWords: CustomBannedWord[] = [],
  preferredReplacements: Record<string, string> = {}
): {
  cleanedText: string;
  replacedCount: number;
  replacedDetails: Array<{ original: string; replacedWith: string; count: number }>;
} {
  if (!text) return { cleanedText: '', replacedCount: 0, replacedDetails: [] };

  let current = text;
  let totalReplaced = 0;
  const details: Array<{ original: string; replacedWith: string; count: number }> = [];

  const found = scanForBannedWords(current, customWords);
  for (const item of found) {
    const customPreferred = preferredReplacements[item.word];
    const defaultSuggestion =
      item.suggestedReplacements && item.suggestedReplacements.length > 0
        ? item.suggestedReplacements[0]
        : '';
    const replacement = customPreferred || defaultSuggestion;

    if (replacement !== undefined) {
      const escaped = item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      const matches = current.match(regex);
      const count = matches ? matches.length : 0;
      if (count > 0) {
        current = current.replace(regex, replacement);
        totalReplaced += count;
        details.push({
          original: item.word,
          replacedWith: replacement,
          count,
        });
      }
    }
  }

  // Also strip all emojis and heading numbers
  const beforeEmojiClean = current;
  current = current
    .replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/^(#{2,3})\s*(?:0?[1-9]|[1-9][0-9])[\.、\s\-_]+(.*)$/gm, '$1 $2');
  if (beforeEmojiClean !== current) {
    totalReplaced += 1;
  }

  return {
    cleanedText: current,
    replacedCount: totalReplaced,
    replacedDetails: details,
  };
}

/**
 * Calculates sentence length variation (Burstiness).
 */
export function calculateBurstiness(text: string): { score: number; averageLength: number; stdDev: number } {
  if (!text || text.trim().length === 0) {
    return { score: 100, averageLength: 0, stdDev: 0 };
  }

  const sentences = text
    .split(/[。！？!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  if (sentences.length < 3) {
    return { score: 85, averageLength: text.length, stdDev: 5 };
  }

  const lengths = sentences.map((s) => s.length);
  const sum = lengths.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / lengths.length;

  const variance = lengths.reduce((acc, curr) => acc + Math.pow(curr - avg, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  const cv = avg > 0 ? stdDev / avg : 0;
  const normalizedScore = Math.min(100, Math.round(cv * 110));

  return {
    score: normalizedScore,
    averageLength: Math.round(avg),
    stdDev: Math.round(stdDev),
  };
}

/**
 * Detect mechanical syllabus-like headers
 */
export function detectStructuralCliches(text: string): string[] {
  const cliches: string[] = [];
  for (const pattern of MECHANICAL_HEADER_PATTERNS) {
    if (pattern.test(text)) {
      cliches.push('检出汇报式/说明书式工整序号小标题（如“一、背景 / 结语”），破坏了口语叙事的流动感。');
      break;
    }
  }

  if ((text.match(/^[-*]\s+/gm) || []).length > 15) {
    cliches.push('检测到过多的无序列表清单（>15处），容易使文章沦为干瘪的知识点罗列。');
  }

  return cliches;
}

/**
 * Specifically detects functional meta-labels as headings (e.g. 引子与现实痛点, 深度拆解与核心逻辑, 落地实操与行动指南)
 */
export function detectClicheHeadings(
  text: string,
  archetype: Archetype = 'M',
  seedTopic = '行业前沿突破'
): Array<{ rawHeading: string; suggestedReplacement: string; reason: string }> {
  if (!text) return [];
  const results: Array<{ rawHeading: string; suggestedReplacement: string; reason: string }> = [];
  const headingRegex = /^(#{2,3})\s*(.+)$/gm;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = headingRegex.exec(text)) !== null) {
    const raw = match[2].trim();
    if (isAiClicheHeading(raw)) {
      const suggested = generateContextualJournalisticHeading(raw, idx, archetype, seedTopic);
      results.push({
        rawHeading: raw,
        suggestedReplacement: suggested,
        reason: '属于机械说明书/元功能套话（如“引子与现实痛点/深度拆解/落地实操”），严重缺乏特稿现场感与反差冲突。',
      });
    }
    idx++;
  }
  return results;
}

/**
 * Comprehensive Linter evaluation with 2000-4000 word requirement & image slot checks
 */
export function lintArticleText(
  text: string,
  archetype: Archetype = 'M',
  seedTopic = '行业前沿突破',
  customWords: CustomBannedWord[] = []
): AntiAILintResult {
  const wordCount = countWords(text);
  const banned = scanForBannedWords(text, customWords);
  const burstiness = calculateBurstiness(text);
  const structural = detectStructuralCliches(text);
  const imageSlots = extractImageSlots(text);
  const clicheHeadings = detectClicheHeadings(text, archetype, seedTopic);

  let score = 100;

  // Word count evaluation: target 5000 - 6800 words (strictly enforced, never below 5000)
  let wordCountStatus: 'too_short' | 'perfect' | 'too_long' = 'perfect';
  if (wordCount < 5000) {
    wordCountStatus = 'too_short';
    const missing = 5000 - wordCount;
    // Deduct points proportionally if under 5000 words
    score -= Math.min(35, Math.round((missing / 5000) * 35));
  } else if (wordCount > 6800) {
    wordCountStatus = 'too_long';
    score -= 10;
  }

  // Penalize banned words
  const bannedDeductions = banned.reduce((sum, item) => sum + item.count * 8, 0);
  score -= Math.min(40, bannedDeductions);

  // Penalize cliche headings heavily (e.g. -15 per cliche heading)
  if (clicheHeadings.length > 0) {
    score -= Math.min(30, clicheHeadings.length * 15);
  }

  // Penalize low burstiness
  if (burstiness.score < 40) {
    score -= 15;
  } else if (burstiness.score < 60) {
    score -= 8;
  }

  // Penalize missing image directives: an article should have at least 2~3 visual guides
  if (imageSlots.length < 2) {
    score -= 10;
  }

  score -= structural.length * 10;
  score = Math.max(10, Math.min(100, score));

  const suggestions: string[] = [];
  if (clicheHeadings.length > 0) {
    suggestions.push(`检出 ${clicheHeadings.length} 处典型 AI 八股结构小标题（如「${clicheHeadings[0].rawHeading}」）。建议使用上方「去八股小标题重铸引擎」一键替换为现场反差/显微机理特稿标题！`);
  }

  if (wordCountStatus === 'too_short') {
    suggestions.push(`当前篇幅为 ${wordCount} 字（严格要求不得低于 5000 字，目标 5000~6800 字）。请补充具体一线案例、微观拆解账本、各方博弈细节或详尽SOP工序。`);
  } else if (wordCountStatus === 'too_long') {
    suggestions.push(`当前篇幅为 ${wordCount} 字，稍长于 6800 字上限，可适当精简冗长句式。`);
  }

  if (imageSlots.length === 0) {
    suggestions.push('文中缺少具体的配图标记（建议补充 [图1]、[图2] 等位置标记）。');
  }

  if (banned.length > 0) {
    suggestions.push(`发现了 ${banned.length} 类高频 AI 套话或禁用图标（如“${banned[0].word}”），建议替换为大白话或直白事实。`);
  }
  if (burstiness.score < 50) {
    suggestions.push('句式长度过于均等，建议穿插 4~8 字短句、反问句或单句成段，增加呼吸感。');
  }
  if (structural.length > 0) {
    suggestions.push(...structural);
  }
  if (suggestions.length === 0) {
    suggestions.push('篇幅饱满 (5000~6800字)，小标题具象生动无AI八股，配图标记简洁，行文极具人味，完全符合爆款特稿发布标准。');
  }

  return {
    score,
    wordCount,
    wordCountStatus,
    bannedWordsFound: banned,
    structuralClichés: structural,
    clicheHeadingsFound: clicheHeadings,
    burstinessScore: burstiness.score,
    imageSlotsCount: imageSlots.length,
    suggestions,
  };
}

/**
 * Dynamic Cross-Link Hook Assembler
 * Zero icons/emojis discipline: uses pure narrative labels without emojis
 */
export function assembleCrossLinkHooks(
  markdown: string,
  clusterArticles: Array<{ archetype: Archetype; wechat_title: string }>,
  currentArchetype: Archetype
): string {
  if (!markdown) return '';
  let result = markdown;

  const targetMap = new Map<Archetype, string>();
  for (const art of clusterArticles) {
    targetMap.set(art.archetype, art.wechat_title);
  }

  const archetypes: Archetype[] = ['M', 'S', 'I'];
  for (const arc of archetypes) {
    const placeholder = new RegExp(`\\{\\{HOOK_TO_${arc}_TYPE\\}\\}`, 'g');
    const targetTitle = targetMap.get(arc) || '相关拆解';
    let hookDescription = '';
    if (arc === 'M') {
      hookDescription = '【深度联动·商业全景】还没搞懂各平台的真实分账与冷启动门槛？建议顺手阅读今日头条：';
    } else if (arc === 'S') {
      hookDescription = '【配套实操·保姆级工序】具体小白怎么照着做出一模一样的效果？建议收藏今日次条实操手记：';
    } else {
      hookDescription = '【合规风控·资金安全】第一笔美金到账后怎么合规拿回国内？建议参考今日三条实操避坑指南：';
    }

    const calloutBox = `\n\n> ${hookDescription}**《${targetTitle}》**\n\n`;
    result = result.replace(placeholder, calloutBox);
  }

  return result;
}
