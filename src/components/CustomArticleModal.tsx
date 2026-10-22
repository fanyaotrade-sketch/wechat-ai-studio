import React, { useState } from 'react';
import {
  X,
  FileText,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Compass,
} from 'lucide-react';
import type { Archetype } from '../types/pipeline';
import { SLOT_ARCHETYPE_METADATA } from '../types/pipeline';
import { generateUpgradedTitlesForInput } from '../utils/headlineEngine';

export interface CustomArticleImportPayload {
  targetArc: Archetype;
  title: string;
  content: string;
  sourceUrl?: string;
  sourcePlatform: 'twitter' | 'wechat' | 'other';
  expansionAngle: string;
  wordCount: number;
}

export interface CustomArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetArc?: Archetype;
  availableArcs?: Archetype[];
  onConfirmImport: (payload: CustomArticleImportPayload) => void;
}

export const CustomArticleModal: React.FC<CustomArticleModalProps> = ({
  isOpen,
  onClose,
  targetArc: initialArc,
  availableArcs = ['M', 'S', 'I', 'F', 'T'],
  onConfirmImport,
}) => {
  const [selectedArc, setSelectedArc] = useState<Archetype>(initialArc || 'M');
  const [inputTab, setInputTab] = useState<'paste' | 'url'>('paste');
  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState<'wechat' | 'twitter' | 'other'>('wechat');
  const [expansionAngle, setExpansionAngle] = useState('comprehensive');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showUpgradedOptions, setShowUpgradedOptions] = useState(false);
  const [upgradedOptions, setUpgradedOptions] = useState<Array<{ title: string; tag: string; reason: string }>>([]);

  React.useEffect(() => {
    if (initialArc) {
      setSelectedArc(initialArc);
    }
  }, [initialArc]);

  if (!isOpen) return null;

  const currentWordCount = contentInput.replace(/\s+/g, '').length;

  // Auto-detect title from first line if title is blank
  const handleAutoExtractTitle = () => {
    if (!titleInput.trim() && contentInput.trim()) {
      const firstLine = contentInput.trim().split('\n')[0].replace(/^[#\s*]+/, '').trim();
      if (firstLine && firstLine.length <= 40) {
        setTitleInput(firstLine);
      }
    }
  };

  const handleFetchUrlContent = async () => {
    if (!urlInput.trim()) return;
    setIsFetchingUrl(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/pipeline/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();
      if (data.success && data.content) {
        setContentInput(data.content);
        if (data.title && !titleInput.trim()) {
          setTitleInput(data.title);
        }
        if (urlInput.includes('mp.weixin.qq.com')) {
          setSourcePlatform('wechat');
        } else if (urlInput.includes('twitter.com') || urlInput.includes('x.com')) {
          setSourcePlatform('twitter');
        }
      } else {
        setFetchError(data.message || '该链接受防盗链或登录限制，建议直接在浏览器全选复制原文粘贴！');
      }
    } catch (e: any) {
      setFetchError('网络提取失败，建议直接在浏览器中全选复制原文粘贴到下方！');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentInput.trim()) return;

    let finalTitle = titleInput.trim();
    if (!finalTitle) {
      const firstLine = contentInput.trim().split('\n')[0].replace(/^[#\s*]+/, '').trim();
      finalTitle = firstLine.slice(0, 36) || '外部精选好文二创';
    }

    const angleMap: Record<string, string> = {
      comprehensive: '全面特稿化（补全背景+底层机理+实操避坑+趋势洗牌，扩至5000+字）',
      practical: '侧重实操落地与防坑清单（拆解工序、真实参数、踩坑SOP）',
      business: '侧重商业算账与利益穿透（拆解真实BOM、利益链分配与变现壁垒）',
      investigative: '侧重调查反差与事实穿透（撕开营销粉饰、呈现一手微观现场）',
    };

    onConfirmImport({
      targetArc: selectedArc,
      title: finalTitle,
      content: contentInput.trim(),
      sourceUrl: urlInput.trim() || undefined,
      sourcePlatform,
      expansionAngle: angleMap[expansionAngle] || angleMap.comprehensive,
      wordCount: currentWordCount,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                录入自选文章 · 准备深度二创
              </h3>
              <p className="text-xs text-slate-500">
                支持推特长文或公众号文章。原文 2000~3000 字即可，二创将自动纵深扩至 5000+ 字特稿
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Target Slot Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>目标投放排期栏位：</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {availableArcs.map((arc) => {
                const meta = SLOT_ARCHETYPE_METADATA[arc];
                const isSelected = selectedArc === arc;
                return (
                  <button
                    key={arc}
                    type="button"
                    onClick={() => setSelectedArc(arc)}
                    className={`py-2 px-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {meta?.slotName || arc}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {meta?.roleName || '深度长文'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setInputTab('paste')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                inputTab === 'paste'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>直接粘贴原文（推荐 · 零失败率）</span>
            </button>
            <button
              type="button"
              onClick={() => setInputTab('url')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                inputTab === 'url'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-sky-600" />
              <span>文章链接抓取（辅助）</span>
            </button>
          </div>

          {/* URL Input Row (Only shown when url tab is active) */}
          {inputTab === 'url' && (
            <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-xl space-y-2">
              <label className="text-xs font-bold text-sky-950">输入推特或微信文章网页链接：</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://mp.weixin.qq.com/... 或 https://x.com/..."
                  className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-sky-600"
                />
                <button
                  type="button"
                  onClick={handleFetchUrlContent}
                  disabled={isFetchingUrl || !urlInput.trim()}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingUrl ? 'animate-spin' : ''}`} />
                  <span>{isFetchingUrl ? '正在提取...' : '尝试抓取'}</span>
                </button>
              </div>
              {fetchError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fetchError}</span>
                </div>
              )}
            </div>
          )}

          {/* Article Title with Smart Upgrade */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>文章标题 / 主题方向（可选）：</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 font-semibold border border-amber-500/20">
                  可智能升阶
                </span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const opts = generateUpgradedTitlesForInput(titleInput, contentInput);
                  setUpgradedOptions(opts);
                  setShowUpgradedOptions(true);
                }}
                className="text-[11px] text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="将平淡原标题一键升阶为爆款特稿标题"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>⚡ 智能升阶爆款标题</span>
              </button>
            </div>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => {
                setTitleInput(e.target.value);
                if (showUpgradedOptions) {
                  setUpgradedOptions(generateUpgradedTitlesForInput(e.target.value, contentInput));
                }
              }}
              placeholder="例如：揭开某固态电池量产宣传背后的真实良率与算账..."
              className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-hidden"
            />

            {/* Smart Upgraded Title Pills */}
            {showUpgradedOptions && upgradedOptions.length > 0 && (
              <div className="p-2.5 bg-gradient-to-r from-amber-50/80 to-rose-50/80 border border-amber-200/90 rounded-xl space-y-2 mt-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>3 组高点击率升阶推荐（点击直接采纳）：</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowUpgradedOptions(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
                  >
                    收起
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {upgradedOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setTitleInput(opt.title);
                        setShowUpgradedOptions(false);
                      }}
                      className="text-left p-2 rounded-lg bg-white/95 hover:bg-amber-100/60 border border-amber-200/60 hover:border-amber-400 transition-all flex items-start justify-between gap-2 group cursor-pointer shadow-2xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            {opt.tag}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {opt.title.length}字
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-amber-900 leading-snug">
                          {opt.title}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {opt.reason}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-bold text-amber-700 bg-amber-50 group-hover:bg-amber-500 group-hover:text-white px-2 py-1 rounded transition-colors mt-1">
                        选用
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Source Platform Selector */}
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-slate-700">来源渠道：</span>
            {[
              { id: 'wechat', label: '微信公众号' },
              { id: 'twitter', label: 'Twitter / X 长推文' },
              { id: 'other', label: '行业网站 / 深度内参' },
            ].map((plat) => (
              <label key={plat.id} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="sourcePlatform"
                  checked={sourcePlatform === plat.id}
                  onChange={() => setSourcePlatform(plat.id as any)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700">{plat.label}</span>
              </label>
            ))}
          </div>

          {/* Main Article Content Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                原文正文内容（直接 Ctrl+V 粘贴）：
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  currentWordCount >= 1000
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : currentWordCount > 0
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  已输入约 {currentWordCount} 字
                  {currentWordCount >= 1000 ? ' (足以二创 5000+ 字特稿)' : ''}
                </span>
              </div>
            </div>
            <textarea
              rows={9}
              value={contentInput}
              onChange={(e) => {
                setContentInput(e.target.value);
                handleAutoExtractTitle();
              }}
              onBlur={handleAutoExtractTitle}
              placeholder="在此粘贴推特长帖、公众号全文或一手分析笔记（建议 1500~3500 字最佳）。二创大模型将以此为事实母本，纵深扩展为 5000+ 字深度长文..."
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Expansion Angle / Strategy */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>二创扩写纵深侧重（确保 5000+ 字叙事节奏不断档）：</span>
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'comprehensive', title: '全面特稿化 (推荐)', desc: '前因背景 + 底层机理 + 实操避坑 + 洗牌终局，层次极丰满' },
                { id: 'practical', title: '侧重实操与避坑', desc: '工序步骤 + 真实参数 + 踩坑备忘录，读者可直接拿来用' },
                { id: 'business', title: '侧重商业与利润', desc: '微观BOM + 真实毛利 + 渠道抽成 + 现金流防守图谱' },
                { id: 'investigative', title: '侧重反差与调查', desc: '撕开公关包装 + 海外现场实测 + 揭秘资本回避的暗礁' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setExpansionAngle(opt.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    expansionAngle === opt.id
                      ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs text-slate-900 font-bold">{opt.title}</div>
                  <div className="text-[10.5px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>载入后将生成：$\ge 5000$ 字纯净正文 · 零图标 · 无 01/02 编号</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!contentInput.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 disabled:opacity-40 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>确认载入排期并准备撰写</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
