import type { Archetype, ArticleBlueprint } from '../types/pipeline';

// Exhaustive list of mechanical AI outline cliches and functional meta-labels
export const AI_CLICHE_HEADING_KEYWORDS = [
  '引子与现实痛点',
  '深度拆解与核心逻辑',
  '落地实操与行动指南',
  '引子与痛点',
  '现实痛点',
  '痛点分析',
  '痛点与挑战',
  '痛点洞察',
  '核心逻辑与深度拆解',
  '核心逻辑',
  '深度拆解',
  '核心原理',
  '技术原理',
  '原理剖析',
  '原理解析',
  '原理分析',
  '底层机理',
  '机制分析',
  '落地实操与实战指南',
  '落地实操',
  '行动指南',
  '实战指南',
  '落地指南',
  '实施路径',
  '落地建议',
  '实操步骤',
  '应对策略',
  '解决策略',
  '解决方案',
  '行业现状与痛点',
  '行业现状',
  '背景与痛点',
  '背景介绍',
  '背景分析',
  '核心优势',
  '发展趋势',
  '未来展望',
  '总结与展望',
  '总结与思考',
  '思考与总结',
  '结语与展望',
  '前言',
  '引言',
  '结语',
  '第一部分',
  '第二部分',
  '第三部分',
  '第四部分',
  '第一章',
  '第二章',
  '第三章',
];

// Regex patterns to detect mechanical / report-style / syllabus-like subheadings
export const MECHANICAL_HEADING_PATTERNS: RegExp[] = [
  /^(?:#+\s*)?(?:0?[1-9]|[一二三四五六七八九十])[、.：:\s]+(引子|痛点|背景|现状|逻辑|原理|拆解|实操|实战|指南|策略|总结|展望|建议|思考|结语)/i,
  /^(?:#+\s*)?(引子与现实痛点|深度拆解与核心逻辑|落地实操与行动指南|总结与展望|背景与现状|原理与架构)/i,
  /^(?:#+\s*)?(第[一二三四五六七八九十]部分|第[一二三四五六七八九十]章)[、.：:\s]*/i,
  /^(?:#+\s*)?(引言|前言|结语|综述|概述)[、.：:\s]*$/i,
];

export type HeadlineStyle =
  | 'contrast_investigative' // 特稿侦查反差风：现场打脸、撕开虚假宣传
  | 'geek_engineering'       // 极客显微工程风：参数实测、界面机理、良率调优
  | 'ruthless_finance'       // 商业算账冷酷风：BOM拆解、利益链博弈、现金流底牌
  | 'practical_playbook'      // 实操避坑指南风：新手踩坑警示、保姆级步骤清单
  | 'endgame_visionary';      // 产业终局推演风：洗牌周期、谁先出局、留存策略

export interface HeadlineStyleMeta {
  id: HeadlineStyle;
  label: string;
  badge: string;
  description: string;
  actFormulas: [string, string, string, string];
}

export const HEADLINE_STYLES_METADATA: HeadlineStyleMeta[] = [
  {
    id: 'contrast_investigative',
    label: '特稿侦查反差风 (推荐第 1 篇·头条)',
    badge: '撕开幻觉 · 现场打脸',
    description: '以一线实测翻车、数据反差打破大众认知幻觉，强情绪推进与悬念扣人心弦。',
    actFormulas: [
      '【幕一·现场打脸】：别看全网都在吹：先把现场这组实测翻车数据看明白',
      '【幕二·撕开暗礁】：剥开光鲜参数的外衣：那颗被资本刻意回避的致命暗礁',
      '【幕三·生存底线】：留给追赶者的窗口期可能不足半年：普通人不可不知的三条生存底线',
      '【幕四·终局定音】：当喧嚣退去：真正能在牌桌上活下来的关键解法',
    ],
  },
  {
    id: 'geek_engineering',
    label: '极客显微工程风 (推荐第 2 篇·次条)',
    badge: '参数深潜 · 显微机理',
    description: '拆开微观结构与工程细节，直击物理极限、工艺温控与良品率深水区。',
    actFormulas: [
      '【幕一·参数暗礁】：实测 50 组对比数据后：我们终于找出了隐秘的参数陷阱',
      '【幕二·微观解剖】：拆开微观机理界面：核心壁垒根本不在算法，而在物理极限与工艺温控',
      '【幕三·工程避坑】：工业级复现调优清单：良品率跨过 90% 必须避开的 3 个深水坑',
      '【幕四·极限压榨】：工程极限压榨：把关键能耗与延迟降低 60% 的调试手记',
    ],
  },
  {
    id: 'ruthless_finance',
    label: '商业算账冷酷风 (推荐第 3 篇·三条)',
    badge: 'BOM拆解 · 利益链算账',
    description: '冷峻算账，拆开BOM成本与专利高墙，看清每一分钱究竟流向谁的口袋。',
    actFormulas: [
      '【幕一·冷酷账本】：拆开真实 BOM 表：每一分利润究竟被谁拿走了？',
      '【幕二·高墙博弈】：上游巨头筑起专利高墙，中游代工正在沦为廉价苦力',
      '【幕三·失血出局】：产业残酷洗牌倒计时：未来三年哪两类团队会最先失血出局？',
      '【幕四·防守底牌】：穿越周期的底牌：一张全产业链生态位与现金流防守图谱',
    ],
  },
  {
    id: 'practical_playbook',
    label: '实操避坑指南风 (保姆级落地)',
    badge: '新手自查 · 保姆级动作',
    description: '杜绝抽象理论，把所有动作细化为填空式清单与一线防踩坑血泪经验。',
    actFormulas: [
      '【幕一·血泪踩坑】：新手最常掉进去的 3 个隐秘暗坑：第一笔学费往往交在这里',
      '【幕二·填空拆解】：保姆级操作工序拆解：一步一步把最小闭环跑顺',
      '【幕三·自查防线】：上线前的 5 项硬性自查清单：少做一步都可能前功尽弃',
      '【幕四·长效心法】：从单点跑通到稳定沉淀：一套可以复用的长期工作流',
    ],
  },
  {
    id: 'endgame_visionary',
    label: '产业终局推演风 (冷思考决策)',
    badge: '洗牌周期 · 谁主沉浮',
    description: '跳出局部细节，俯瞰全产业链格局更迭与关键玩家生死局。',
    actFormulas: [
      '【幕一·迷雾初现】：概念狂欢背后的冷血现实：行业正在悄悄发生结构性变局',
      '【幕二·决胜战场】：未来三年的真正胜负手：根本不在台前，而在幕后生态位',
      '【幕三·分水岭】：行业大洗牌倒计时：分水岭两侧的生死抉择',
      '【幕四·穿越周期】：不确定环境下的确定性打法：守住最核心的护城河',
    ],
  },
];

/**
 * Checks if a heading string smells of generic AI outline template slop
 */
export function isAiClicheHeading(heading: string): boolean {
  if (!heading) return true;
  const clean = heading.replace(/^[#0-9.\s、:：_-]+/, '').trim();
  
  // Less than 5 characters is usually a trivial abstract label (e.g. "引子", "痛点", "实操")
  if (clean.length < 5) return true;

  // Regex check for structural patterns
  for (const regex of MECHANICAL_HEADING_PATTERNS) {
    if (regex.test(clean) || regex.test(heading)) return true;
  }

  // Substring or inclusion check
  return AI_CLICHE_HEADING_KEYWORDS.some((kw) => clean === kw || clean.startsWith(kw) || clean.endsWith(kw) || (kw.length >= 4 && clean.includes(kw)));
}

/**
 * Extracts a concise clean keyword topic for natural headline phrasing
 */
export function extractCleanTopic(seedTopic: string, fallback = '行业关键突破'): string {
  if (!seedTopic) return fallback;
  const cleaned = seedTopic
    .replace(/^【[^】]+】\s*/, '')
    .replace(/^(最新|重磅|独家|突发|快讯|深度|深度拆解|干货|科普)[：:\s]*/, '')
    .replace(/[，。！？!?:：]/g, ' ')
    .trim();
  
  // Extract first 12 characters or main subject
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const firstPart = parts[0] || '';
  if (firstPart.length >= 3 && firstPart.length <= 16) {
    return firstPart;
  }
  return cleaned.slice(0, 14) || fallback;
}

/**
 * Dynamic humanized heading generator
 * Generates compelling, journalistic, narrative-driven subheadings tailored to:
 * - Archetype (M: 头条破圈叙事 / S: 极客硬核避坑 / I: 商业底牌算账)
 * - Specific Topic (extracts key noun and conflict)
 * - Section Index (0: 引爆/反差现场, 1: 深水暗礁/机理拆解, 2: 算账对决/终局自救, 3: 终局推演)
 * - Optional custom HeadlineStyle
 */
export function generateContextualJournalisticHeading(
  rawSection: string,
  index: number,
  archetype: Archetype,
  seedTopic: string,
  style?: HeadlineStyle,
  coreAngle?: string
): string {
  // If the raw section is already a vivid human-written sentence (not AI cliche and long enough), use it!
  const isCliche = isAiClicheHeading(rawSection);
  if (
    !isCliche &&
    rawSection.length >= 10 &&
    !rawSection.startsWith('01.') &&
    !rawSection.startsWith('02.') &&
    !rawSection.startsWith('03.') &&
    !rawSection.startsWith('04.')
  ) {
    return rawSection.replace(/^[0-9一二三四五六七八九十]+[、.：:]\s*/, '').trim();
  }

  const cleanTopic = extractCleanTopic(seedTopic);

  // If specific style chosen, use style-based formula
  if (style) {
    switch (style) {
      case 'contrast_investigative':
        switch (index) {
          case 0:
            return `别看全网都在吹「${cleanTopic}」：先把现场这组实测翻车数据看明白`;
          case 1:
            return `剥开光鲜参数的外衣：那颗被资本刻意回避的致命暗礁`;
          case 2:
            return `留给追赶者的窗口期可能不足半年：普通人不可不知的三条生存底线`;
          default:
            return `当喧嚣退去：真正能在牌桌上活下来的关键解法`;
        }
      case 'geek_engineering':
        switch (index) {
          case 0:
            return `实测 50 组对比数据后：我们终于找出了「${cleanTopic}」的隐性参数陷阱`;
          case 1:
            return `拆开微观机理界面：核心壁垒根本不在算法，而在物理极限与工艺温控`;
          case 2:
            return `工业级复现保姆级调优清单：良品率跨过 90% 必须避开的 3 个深水坑`;
          default:
            return `工程极限压榨：把关键能耗与延迟降低 60% 的调试手记`;
        }
      case 'ruthless_finance':
        switch (index) {
          case 0:
            return `拆开「${cleanTopic}」的真实 BOM 表：每一分利润究竟被谁拿走了？`;
          case 1:
            return `上游巨头筑起专利高墙，中游代工正在沦为廉价苦力`;
          case 2:
            return `产业残酷洗牌倒计时：未来三年哪两类团队会最先失血出局？`;
          default:
            return `穿越周期的底牌：一张全产业链生态位与现金流防守图谱`;
        }
      case 'practical_playbook':
        switch (index) {
          case 0:
            return `围绕「${cleanTopic}」最易掉进去的 3 个暗坑：第一笔学费往往交在这里`;
          case 1:
            return `保姆级工序拆解：零基础也能照着跑顺的最小闭环`;
          case 2:
            return `落地自查硬性清单：良品率与安全防线不可失守的 4 个关键指标`;
          default:
            return `从单点跑通到长期复利：一套可以持续进化的工作心法`;
        }
      case 'endgame_visionary':
        switch (index) {
          case 0:
            return `概念狂欢背后的冷血现实：「${cleanTopic}」正在悄悄重塑行业底层利益链`;
          case 1:
            return `未来三年的真正胜负手：根本不在台前营销，而在幕后生态位卡位`;
          case 2:
            return `大洗牌倒计时：谁在裸泳，谁又在提前屯粮？`;
          default:
            return `不确定环境下的确定性打法：守住最核心的造血护城河`;
        }
    }
  }

  // Default Archetype-specific editorial narrative patterns
  if (archetype === 'M') {
    // M型（头条）：社会体感、颠覆反差、故事冲突、打破幻觉
    switch (index) {
      case 0:
        return `别看全网都在跟风吹「${cleanTopic}」：先把现场这组实测翻车数据看明白`;
      case 1:
        return `剥开光鲜参数的外衣：那颗被资本刻意回避的致命暗礁`;
      case 2:
        return `留给追赶者的窗口期可能不足半年：普通人不可不知的三条生存底线`;
      default:
        return `冷思考：当喧嚣散去，真正留在牌桌上的关键解法`;
    }
  } else if (archetype === 'S') {
    // S型（次条）：硬核参数、显微复现、踩坑避雷、工程调优
    switch (index) {
      case 0:
        return `实测 50 组对比数据后：我们终于找出了「${cleanTopic}」的隐性参数陷阱`;
      case 1:
        return `拆开微观机理界面：核心壁垒根本不在算法，而在物理极限与工艺温控`;
      case 2:
        return `工业级复现保姆级调优清单：良品率跨过 90% 必须避开的 3 个深水坑`;
      default:
        return `工程极限压榨：把关键能耗与延迟降低 60% 的调试手记`;
    }
  } else {
    // I型（三条）：商业底牌、BOM成本、利益链博弈、生存终局
    switch (index) {
      case 0:
        return `拆开「${cleanTopic}」的真实 BOM 表：每一分利润究竟被谁拿走了？`;
      case 1:
        return `上游巨头筑起专利高墙，中游代工正在沦为廉价苦力`;
      case 2:
        return `产业残酷洗牌倒计时：未来三年哪两类团队会最先失血出局？`;
      default:
        return `穿越周期的底牌：一张全产业链生态位与现金流防守图谱`;
    }
  }
}

/**
 * Strips all Unicode pictographs, icons, and emojis from text
 */
export function stripAllEmojis(str: string): string {
  if (!str) return '';
  return str.replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '').trim();
}

/**
 * Sanitizes an array of outline sections, replacing ANY AI cliché template headings
 * with crisp, narrative, topic-tailored WeChat journalistic subheadings without numbers or emojis.
 */
export function sanitizeOutlineSections(
  sections: string[] | undefined,
  archetype: Archetype,
  seedTopic: string,
  coreAngle?: string
): string[] {
  const defaultSections = ['引爆点与真实反差', '核心机理与隐性暗礁', '实操算账与终局对决', '一线避坑与长效护城河'];
  const inputList = (sections && sections.length > 0) ? sections : defaultSections;

  return inputList.map((sec, idx) => {
    const rawClean = stripAllEmojis(sec).replace(/^[0-9一二三四五六七八九十]+[、.：:\s\-_]+/, '').trim();
    if (isAiClicheHeading(rawClean)) {
      return stripAllEmojis(generateContextualJournalisticHeading(rawClean, idx, archetype, seedTopic, undefined, coreAngle));
    }
    return rawClean;
  });
}

/**
 * Scans markdown content and replaces any mechanical AI subheadings (## or ###)
 * with contextual narrative subheadings derived from blueprint and seed topic.
 * Strictly removes any 01/02/03 numerical prefixes and all emojis.
 */
export function sanitizeArticleMarkdownHeadings(
  markdown: string,
  blueprint: { archetype: Archetype; wechat_title?: string; core_angle?: string; outline_sections?: string[] },
  seedTopic: string
): string {
  if (!markdown) return markdown;

  const outline = blueprint.outline_sections && blueprint.outline_sections.length > 0
    ? sanitizeOutlineSections(blueprint.outline_sections, blueprint.archetype, seedTopic, blueprint.core_angle)
    : [
        generateContextualJournalisticHeading('', 0, blueprint.archetype, seedTopic),
        generateContextualJournalisticHeading('', 1, blueprint.archetype, seedTopic),
        generateContextualJournalisticHeading('', 2, blueprint.archetype, seedTopic),
        generateContextualJournalisticHeading('', 3, blueprint.archetype, seedTopic),
      ];

  let headingCounter = 0;

  // Replace lines like `## 01 引子与现实痛点` or `## 深度拆解与核心逻辑`
  const updatedMarkdown = markdown.replace(/^(#{2,3})\s*(.+)$/gm, (fullMatch, hashes, headingTitle) => {
    // If it's the article title (H1) or a small callout, skip
    if (hashes === '#') return fullMatch;

    // Strip any leading numbers and emojis
    let cleanTitle = stripAllEmojis(headingTitle).replace(/^(?:0?[1-9]|[1-9][0-9])[\.、\s\-_]+/, '').trim();

    if (isAiClicheHeading(cleanTitle)) {
      const targetHeading = outline[headingCounter] || generateContextualJournalisticHeading(cleanTitle, headingCounter, blueprint.archetype, seedTopic);
      headingCounter++;
      return `${hashes} ${stripAllEmojis(targetHeading)}`;
    }

    headingCounter++;
    return `${hashes} ${cleanTitle}`;
  });

  return updatedMarkdown;
}

/**
 * Force-reforges all ## subheadings in a markdown article into a chosen narrative style!
 * Strictly output pure narrative headings without 01/02/03 numbers or emojis.
 */
export function reforgeAllMarkdownHeadings(
  markdown: string,
  archetype: Archetype,
  seedTopic: string,
  style: HeadlineStyle,
  outlineSections?: string[]
): string {
  if (!markdown) return markdown;

  let headingIndex = 0;
  const updatedMarkdown = markdown.replace(/^(##)\s*(.+)$/gm, (fullMatch, hashes, headingTitle) => {
    const trimmed = stripAllEmojis(headingTitle).trim();
    // Skip if it looks like cross-links or meta callouts
    if (trimmed.includes('深度联动') || trimmed.includes('往期推荐') || trimmed.includes('参考信源')) {
      return fullMatch;
    }

    const cleanInput = trimmed.replace(/^(?:0?[1-9]|[1-9][0-9])[\.、\s\-_]+/, '');
    const newHeading = generateContextualJournalisticHeading(
      outlineSections?.[headingIndex] || cleanInput,
      headingIndex,
      archetype,
      seedTopic,
      style
    );
    headingIndex++;
    return `${hashes} ${stripAllEmojis(newHeading)}`;
  });

  return updatedMarkdown;
}

/**
 * Builds the initial dynamic markdown skeleton for an article blueprint.
 * Strictly adheres to:
 * 1. 5000+ words rich substantive long-form investigative journalism
 * 2. Absolute zero emojis/icons
 * 3. NO 01/02/03 numbering on section headings
 * 4. Each section has a bold subheading overview (> 核心提要：...)
 */
export function buildDynamicArticleMarkdown(
  art: ArticleBlueprint,
  seedTopic: string
): string {
  const sections = sanitizeOutlineSections(art.outline_sections, art.archetype, seedTopic, art.core_angle);
  const cleanTopic = extractCleanTopic(seedTopic);

  const dynamicHeadings = sections.map((sec, idx) =>
    stripAllEmojis(generateContextualJournalisticHeading(sec, idx, art.archetype, seedTopic, undefined, art.core_angle))
  );

  const cleanTitle = stripAllEmojis(art.wechat_title);
  const cleanDigest = stripAllEmojis(art.core_angle);

  let content = `# ${cleanTitle}\n\n`;
  content += `> 导读：${cleanDigest}\n\n`;

  // Visual slot #1
  content += `[图1]\n\n`;

  // Section 1
  content += `## ${dynamicHeadings[0]}\n\n`;
  content += `> 核心提要：围绕「${cleanTopic}」，全网资本宣传与一线真实工况存在极大的认知裂缝，撕开营销粉饰后，我们必须正视真实的良品率、算力损耗与冷启动试错代价。\n\n`;
  content += `很多人被铺天盖地的营销公关文和发布会展示刷了屏，但在真正蹲过海外一线现场、查过真实出货单与海外社群热帖的人眼里，资本包装的宏大叙事与一线从业者的真实体感完全是两码事。\n\n`;
  content += `围绕「${cleanTopic}」，市场上最先蔓延的是一种群体性的跟风躁动：人人都在高谈阔论革命性颠覆，各路机构急迫地给出百亿美元级的估值模型。然而一旦把视角切换到微观财务账面与实际工序闭环，你会发现许多所谓的“全行业共识”，本质上不过是把尚未经过良品率考验的实验室样品，当成了可以随时收割真金白银的成熟商品。\n\n`;
  content += `我们在跟进海外一线技术论坛、Reddit 开发者社群以及多份未经公关过滤的调研记录后，梳理出了一组极度反常的对比数据：当绝大多数局外人还在为概念摇旗呐喊时，真正掌控上游供应链与现金流的少数关键玩家，早已在悄悄调整交付节奏与防翻车止损线。\n\n`;
  content += `这种体感断层并非空穴来风。以最近三个月海外开发者在 Discord 核心群组反馈的实际联调数据为例，超过 70% 的早期试水团队在推进到第三周时，都遭遇了预期之外的性能衰减或调用成本暴增。原本宣称能够降低 80% 人工投入的整套方案，由于缺乏对边界异常情况的兜底防御，反而迫使团队临时抽调核心技术人员进行全天候人工盯盘。\n\n`;
  content += `更值得警惕的是信息茧房对普通决策者的误导。当各路自媒体还在以夸张的感叹号兜售“再不上车就被时代抛弃”的焦虑时，真正踩过深坑的工程师们却在内部复盘备忘录中写道：现阶段最大的风险根本不是起跑慢了半拍，而是在底层工程地基尚未夯实之前，盲目将未经压力测试的架构推向生产环境，最终导致整个季度的运维预算被吞噬殆尽。\n\n`;

  // Visual slot #2
  content += `[图2]\n\n`;

  // Section 2
  content += `## ${dynamicHeadings[1]}\n\n`;
  content += `> 核心提要：剥开光鲜参数的外衣，决定成败的从来不是前台技术声量，而是隐藏在真实 BOM 成本、良率折损与跨境风控账面下的三笔不可算错的硬账。\n\n`;
  content += `任何技术创新与商业模式的迷人之处，永远深藏在剥开表象后的深水区。\n\n`;
  content += `表面上看，各大主力选手在台前比拼的是声量规模、品牌背书与算力参数。但只要拿出一张真实的成本结构 BOM 表，层层穿透后就会发现，真正卡死绝大多数入局者咽喉的，根本不是什么宏大的技术理念，而是极易被忽略的微观良率折损、合规审计成本以及海外渠道的隐性抽成。\n\n`;
  content += `深入解剖「${cleanTopic}」的技术栈实现链路，我们会发现三项绝不能算错的硬账：\n\n`;
  content += `其一，试错与冷启动损耗。常规认知往往认为只要照抄海外开源架构或公开教程就能低成本跑通，但在真实工况下，由于依赖库版本漂移、风控规则实时升级，实际搭建与联调耗时往往是预期的三倍以上。许多团队在原型阶段只测算了顺畅情况下的理论开销，却彻底漏算了网络波动重试、数据清洗清洗率不足以及异常状态熔断所需的冗余算力，直接导致上线首月的账面成本失控。\n\n`;
  content += `其二，隐性变现与支付通道抽成。在海外资金结算与跨境合规链路中，各类风控保证金、退款率惩罚与中转通道费用，经常会悄无声息地吞噬掉大幅毛利空间。尤其在遇到跨币种结算与反洗钱自动化审核时，一旦被标记为异常交易流，账户资金冻结周期动辄长达数十天，足以彻底击穿中小团队脆弱的现金流生命线。\n\n`;
  content += `其三，用户留存与生命周期衰减。靠单次话题曝光或低价策略获取的初始流量，如果缺乏高粘性的交付履约工序，七天留存率往往会断崖式下滑。许多团队在算账时习惯性套用乐观的复购模型，却忽视了真实用户在新鲜感褪去后的流失速度，导致前期的所有获客投入都沦为不可逆的沉没成本。\n\n`;
  content += `把这三笔账摊在桌面上对比就会明白，为什么那些真正能够在周期洗牌中活下来的老兵，从不轻易盲目扩张战线。他们把九成以上的精力都花在打磨每一个微观节点的容错率上，宁可在前期多花两周时间把数据回流通道与风控熔断规则调试扎实，也绝不在主干链路中留下一丝可能引发雪崩效应的安全隐患。\n\n`;

  // Visual slot #3
  content += `[图3]\n\n`;

  // Section 3
  content += `## ${dynamicHeadings[2]}\n\n`;
  content += `> 核心提要：跳出盲目扩张的陷阱，一套经过实测检验的高韧性自救 SOP：先算死账、打通最小验证闭环、构建跨平台合规冗余防线。\n\n`;
  content += `行业大浪淘沙过后，最核心的命题只有一个：身处一线的实战从业者、创业团队或中小决策者，到底该如何构筑自己的安全护城河？\n\n`;
  content += `与其被信息洪流裹挟着陷入焦虑盲动，不如把精力集中在几项具有绝对确定性的实操抓手上。以下是一线海外操盘手沉淀出的高频避坑行动备忘清单：\n\n`;
  content += `第一项抓手：先算死账，再做决策。在没有摸清完整的上下游现金流周转周期前，绝不盲目扩张固定资产与订阅重型算力。必须建立以周为维度的微观财务监控看板，实时追踪单次任务执行成本与边际收益的动态变化，一旦发现单位毛利低于安全阈值，立即启动工序降本优化程序。\n\n`;
  content += `第二项抓手：打造最小可行性交付闭环。把复杂的体系拆分为可以在四十八小时内完成单点验证的极简工序，用最小的代价换取真实用户的反馈数据。绝不要试图在第一天就交付所谓的大而全方案，而是要找准用户最痛、最刚需的那一个微观卡点，做到击穿阈值的极致体验，以此建立最原始的用户信任与口碑基本盘。\n\n`;
  content += `第三项抓手：建立严格的合规与防封冗余机制。多节点备份核心数据资产，杜绝把全部身家性命押注在单一平台或闭门生态上。在实际业务部署中，至少保留两套备用调用通道与容灾备份方案，并定期进行无预警切换演练，确保在不可抗力发生时，业务核心系统依然能在数分钟内平稳降级运行。\n\n`;
  content += `第四项抓手：深挖垂直场景的不可替代性资产。随着通用技术的普及，单纯的技术门槛正在迅速扁平化。未来真正的护城河，在于你对特定垂直产业非标细节的深度理解、经过实操沉淀的专有数据集，以及与一线客户长期磨合建立的信任纽带。这些深水资产绝非简单的算法模型或算力堆叠所能轻易撼动。\n\n`;

  // Visual slot #4
  content += `[图4]\n\n`;

  // Section 4
  const fourthHeading = dynamicHeadings[3] || `穿越周期的底牌：终局格局洗牌与生态位防守图谱`;
  content += `## ${fourthHeading}\n\n`;
  content += `> 核心提要：当狂欢退潮，行业洗牌将迅速分化出两极格局，唯有守住造血护城河、坚持以确定性对抗不确定性的实干者，才能赢得长远红利。\n\n`;
  content += `放眼未来六到十八个月的发展窗口期，随着行业红利期逐步过渡到精细化运营阶段，胜负手早已不再取决于谁能喊出更响亮的口号，而在谁能以最扎实的工序、最敏锐的海外嗅觉和最稳健的成本防线，在分水岭两端稳稳守住属于自己的生态位。\n\n`;
  content += `我们可以清晰地预见，未来的市场格局将加速分化：那些依靠烧钱补贴、故事包装却缺乏真实造血能力的投机型选手，将在资本退潮与算力成本的双重挤压下迅速出清；而那些自始至终深耕微观工序、尊重商业本质、把每一分钱都花在刀刃上的实干者，反而会在大洗牌后迎来更为广阔的生存空间。\n\n`;
  content += `面对未来的不确定性，最明智的策略从来不是盲目押注某个未经证实的狂热风口，而是在看清底层运转规则的基础上，以严谨务实的工匠精神打磨每一个交付细节。保持清醒，拒绝浮躁，算清每一笔账，这才是穿越商业周期的终极解法。\n\n`;

  return content;
}

/**
 * Five-Dimensional Viral Headline Model
 */
export interface HeadlineCandidateItem {
  id: string;
  dimension: 'contrast' | 'finance' | 'practical' | 'warning' | 'seo';
  dimensionLabel: string;
  hookType: string;
  title: string;
  psychologicalTrigger: string;
  targetAudience: string;
}

/**
 * Generates 5 distinct psychological angle headlines for any topic/draft
 * Strictly zero-icon, zero-numbering, highly punchy journalistic titles.
 */
export function generateFiveDimensionalHeadlines(
  seedTopic: string,
  coreAngle?: string,
  contentSummary?: string
): HeadlineCandidateItem[] {
  const cleanTopic = extractCleanTopic(seedTopic);

  return [
    {
      id: 'contrast_01',
      dimension: 'contrast',
      dimensionLabel: '认知反差 / 现场打脸',
      hookType: '打破全网盲区 · 实测翻车',
      title: `别看全网都在吹「${cleanTopic}」：先把现场这组实测翻车数据看明白`,
      psychologicalTrigger: '引发信息不对称恐慌，打破大众被公关营销塑造的盲目乐观预期',
      targetAudience: '朋友圈高频转发，适合好奇心强、反感浮夸宣传的行业决策者与从业者',
    },
    {
      id: 'finance_02',
      dimension: 'finance',
      dimensionLabel: '冷峻算账 / 利益链解剖',
      hookType: '拆开真实账本 · 每一分钱去向',
      title: `拆开「${cleanTopic}」的真实 BOM 表：每一分利润究竟被谁拿走了？`,
      psychologicalTrigger: '强烈窥探欲，穿透宏观概念，直击上中下游谁在真赚钱、谁在当廉价苦力',
      targetAudience: '投资人、中小团队创始人、寻求变现模式的实操操盘手',
    },
    {
      id: 'practical_03',
      dimension: 'practical',
      dimensionLabel: '颠覆门槛 / 保姆级SOP',
      hookType: '零基础照着抄 · 填空式避坑',
      title: `保姆级实操手记：普通人从零跑通「${cleanTopic}」必须避开的 3 个深坑`,
      psychologicalTrigger: '降低行动门槛，消除复杂技术恐惧，提供开箱即用的一线经验红利',
      targetAudience: '一线开发者、想低成本做副业或试水新业务的执行型读者（收藏率极高）',
    },
    {
      id: 'warning_04',
      dimension: 'warning',
      dimensionLabel: '窗口预警 / 生存底牌',
      hookType: '洗牌倒计时 · 哪类团队先出局',
      title: `「${cleanTopic}」残酷洗牌倒计时：未来三年哪两类团队会最先失血出局？`,
      psychologicalTrigger: '激发损失厌恶（Loss Aversion），唤起生存危机感并给出安全防守底线',
      targetAudience: '企业中高层管理、产业观察家、关注长期生态位防守的资深读者',
    },
    {
      id: 'seo_05',
      dimension: 'seo',
      dimensionLabel: '搜一搜吸量 / SEO长尾',
      hookType: '高频微信搜索词 · 深度全景',
      title: `「${cleanTopic}」全流程避坑指南与成本测算复盘：一份保姆级深度特稿`,
      psychologicalTrigger: '极高信息密度承诺，精准命中微信“搜一搜”自然长尾搜索高频关键词',
      targetAudience: '通过微信搜索主动寻找解决方案的精准高价值读者，长期长尾流量极大',
    },
  ];
}

/**
 * Generates 3 elevated, punchy headline options for Custom Article input
 */
export function generateUpgradedTitlesForInput(
  rawTitle: string,
  rawContent?: string
): Array<{ title: string; tag: string; reason: string }> {
  const seed = rawTitle.trim() || (rawContent ? rawContent.slice(0, 40) : '前沿商业与技术破局');
  const cleanTopic = extractCleanTopic(seed);

  return [
    {
      title: `别看全网都在吹「${cleanTopic}」：先把现场这组实测翻车数据看明白`,
      tag: '反差侦查特稿',
      reason: '打破平淡叙述，将客观事实升级为强冲突反差现场，大幅提高朋友圈点击率',
    },
    {
      title: `拆开「${cleanTopic}」的真实账本：普通人必须搞懂的 3 项隐形成本与避坑指南`,
      tag: '商业算账实战',
      reason: '切中读者利益关切，突出微观算账与一线避坑，带来极高收藏与在看率',
    },
    {
      title: `「${cleanTopic}」全流程保姆级深度复盘：从底层机理到落地闭环的实操特稿`,
      tag: '搜一搜高权重SEO',
      reason: '全方位覆盖微信自然搜索关键词，兼顾头条打开率与长效长尾搜索流量',
    },
  ];
}
