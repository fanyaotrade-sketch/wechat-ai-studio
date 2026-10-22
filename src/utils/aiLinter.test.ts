import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scanForBannedWords,
  calculateBurstiness,
  detectStructuralCliches,
  lintArticleText,
  assembleCrossLinkHooks,
  countWords,
  extractImageSlots,
  cleanAllBannedWords,
} from './aiLinter.ts';

test('countWords accurately calculates Chinese and English words', () => {
  const sample = '这是一个中文测试，包含了 English words 和 123 数字。';
  const count = countWords(sample);
  assert.ok(count > 10, 'Should count characters properly');
});

test('extractImageSlots extracts explicit visual guidance directives', () => {
  const text = `
一段正文。
[📸 建议配图 #1: 剪映时间轴字幕对齐实操截图 | 建议尺寸: 16:9 横屏 | 拍摄建议: 手机横屏截取时间轴并红框圈出音频波形]
另一段正文。
![1080px卡片预览](./assets/card.png)
`;
  const slots = extractImageSlots(text);
  assert.equal(slots.length, 2);
  assert.equal(slots[0].recommended_size, '16:9 横屏');
  assert.ok(slots[0].title.includes('剪映时间轴'));
});

test('scanForBannedWords correctly flags AI buzzwords', () => {
  const sample = '毋庸置疑，这个新工具如同一把双刃剑，赋能了我们整个业务闭环，综上所述值得关注。';
  const detected = scanForBannedWords(sample);
  assert.ok(detected.length >= 4);
});

test('lintArticleText evaluates word count and image directives', () => {
  const shortText = '一段简短的文字。';
  const report = lintArticleText(shortText);
  assert.equal(report.wordCountStatus, 'too_short');

  // Generate ~4500 characters of natural text (target 4000-6000)
  const longNatural = '上周我自己实测折腾了三天，把真实的账本贴给大家看，每一分钱的去向都算得清清楚楚。'.repeat(120) +
    '\n[图1]\n' +
    '![卡片](./assets/test.png)';
  const reportLong = lintArticleText(longNatural);
  assert.equal(reportLong.wordCountStatus, 'perfect');
  assert.ok(reportLong.score >= 80);
});

test('extractImageSlots parses clean [图1], [图2] markers', () => {
  const text = '这是开头。\n[图1]\n这是第二段。\n[图2]\n[图3]';
  const slots = extractImageSlots(text);
  assert.equal(slots.length, 3);
  assert.equal(slots[0].slot_id, 'slot_1');
  assert.equal(slots[1].slot_id, 'slot_2');
  assert.equal(slots[2].slot_id, 'slot_3');
});

test('extractImageSlots includes anti-AI prompts, aspect ratio and mobile warning fields', () => {
  const text = '[📸 建议配图 #1: 平台分润结算面板截图 | 建议尺寸: 16:9 横屏 (1280x720) | 拍摄建议: 截取推特原帖收益面板，用红圈标出实际到账金额]';
  const slots = extractImageSlots(text);
  assert.equal(slots.length, 1);
  assert.equal(slots[0].aspect_ratio, '16:9');
  assert.ok(slots[0].ai_prompt_en?.includes('--ar 16:9'), 'Prompt should specify 16:9 aspect ratio');
  assert.ok(slots[0].negative_prompt?.includes('text'), 'Negative prompt should exclude garbled text');
  assert.ok(slots[0].mobile_readability_warning?.includes('手机端避坑'), 'Must provide mobile reading advice');
  assert.ok(slots[0].revenue_substitute_strategy?.includes('替代'), 'Must provide revenue substitute strategy');
});

test('detectClicheHeadings flags mechanical template headings and provides suggested replacements', () => {
  const sample = `
# 固态电池产业突破

## 01 引子与现实痛点
很多人被铺天盖地的宣传刷了屏。

## 02 深度拆解与核心逻辑
技术和商业的迷人之处，永远藏在深水区。

## 03 落地实操与行动指南
喧嚣过后，最关键的问题只有一个。
`;
  const report = lintArticleText(sample, 'M', '全固态电池突破');
  assert.ok(report.clicheHeadingsFound && report.clicheHeadingsFound.length >= 3, 'Should find all 3 cliche headings');
  assert.equal(report.clicheHeadingsFound[0].rawHeading, '01 引子与现实痛点');
  assert.ok(report.clicheHeadingsFound[0].suggestedReplacement.includes('实测翻车数据'), 'Should suggest narrative heading');
});

test('cleanAllBannedWords replaces default and custom banned words in one click', () => {
  const text = '我们必须赋能这个闭环，利用降维打击的打法，毋庸置疑这是全网首发的绝密技巧。';
  const customWords = [
    { id: '1', word: '全网首发', category: 'ad_law' as const, suggestedReplacement: '独家实测', enabled: true },
    { id: '2', word: '绝密技巧', category: 'ad_law' as const, suggestedReplacement: '实操经验', enabled: true },
  ];

  const { cleanedText, replacedCount, replacedDetails } = cleanAllBannedWords(text, customWords);
  assert.ok(replacedCount >= 5, 'Should replace at least 5 banned words');
  assert.ok(!cleanedText.includes('赋能'), 'Should no longer contain 赋能');
  assert.ok(!cleanedText.includes('闭环'), 'Should no longer contain 闭环');
  assert.ok(!cleanedText.includes('全网首发'), 'Should no longer contain 全网首发');
  assert.ok(cleanedText.includes('独家实测'), 'Should contain suggested replacement');
  assert.ok(replacedDetails.length >= 5);
});
