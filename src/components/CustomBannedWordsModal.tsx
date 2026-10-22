import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Shield,
  AlertTriangle,
  Sparkles,
  Check,
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import type { CustomBannedWord } from '../utils/aiLinter';
import { BANNED_AI_WORDS, DEFAULT_BANNED_WORD_REPLACEMENTS } from '../utils/aiLinter';

interface CustomBannedWordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customWords: CustomBannedWord[];
  onSaveCustomWords: (words: CustomBannedWord[]) => Promise<void> | void;
}

export const CustomBannedWordsModal: React.FC<CustomBannedWordsModalProps> = ({
  isOpen,
  onClose,
  customWords,
  onSaveCustomWords,
}) => {
  const [activeTab, setActiveTab] = useState<'custom' | 'builtin' | 'quick_add'>('custom');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for adding new word
  const [newWord, setNewWord] = useState('');
  const [newCategory, setNewCategory] = useState<'ad_law' | 'ai_cliche' | 'enterprise_sensitive' | 'custom'>('ad_law');
  const [newReplacement, setNewReplacement] = useState('');
  const [addFeedback, setAddFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleEnable = (id: string) => {
    const updated = customWords.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w));
    onSaveCustomWords(updated);
  };

  const handleDelete = (id: string) => {
    const updated = customWords.filter((w) => w.id !== id);
    onSaveCustomWords(updated);
  };

  const handleAddWord = () => {
    const trimmed = newWord.trim();
    if (!trimmed) return;

    if (
      BANNED_AI_WORDS.includes(trimmed) ||
      customWords.some((cw) => cw.word.toLowerCase() === trimmed.toLowerCase())
    ) {
      setAddFeedback('⚠️ 该词已在词库或默认八股列表中存在！');
      setTimeout(() => setAddFeedback(null), 3000);
      return;
    }

    const newItem: CustomBannedWord = {
      id: `cw_${Date.now()}`,
      word: trimmed,
      category: newCategory,
      suggestedReplacement: newReplacement.trim() || undefined,
      enabled: true,
    };

    const updated = [newItem, ...customWords];
    onSaveCustomWords(updated);
    setNewWord('');
    setNewReplacement('');
    setAddFeedback(`✓ 成功添加「${trimmed}」到自定义违禁词库！`);
    setTimeout(() => setAddFeedback(null), 3000);
  };

  const handleBatchImportPreset = (category: 'ad_law' | 'wechat_marketing') => {
    const presets: CustomBannedWord[] =
      category === 'ad_law'
        ? [
            { id: `cw_p_${Date.now()}_1`, word: '全网首发', category: 'ad_law', suggestedReplacement: '独家实测', enabled: true },
            { id: `cw_p_${Date.now()}_2`, word: '顶级', category: 'ad_law', suggestedReplacement: '高规格, 行业前列', enabled: true },
            { id: `cw_p_${Date.now()}_3`, word: '第一', category: 'ad_law', suggestedReplacement: '领先梯队, 主流', enabled: true },
            { id: `cw_p_${Date.now()}_4`, word: '绝无仅有', category: 'ad_law', suggestedReplacement: '业内少见', enabled: true },
            { id: `cw_p_${Date.now()}_5`, word: '万能', category: 'ad_law', suggestedReplacement: '通用, 多场景适用', enabled: true },
            { id: `cw_p_${Date.now()}_6`, word: '绝对保证', category: 'ad_law', suggestedReplacement: '力求保障', enabled: true },
          ]
        : [
            { id: `cw_p_${Date.now()}_7`, word: '保姆级教程', category: 'ai_cliche', suggestedReplacement: '一步一步实操教学', enabled: true },
            { id: `cw_p_${Date.now()}_8`, word: '颠覆式创新', category: 'ai_cliche', suggestedReplacement: '打破常规的做法', enabled: true },
            { id: `cw_p_${Date.now()}_9`, word: '全生命周期', category: 'enterprise_sensitive', suggestedReplacement: '全流程', enabled: true },
            { id: `cw_p_${Date.now()}_10`, word: '颗粒度', category: 'enterprise_sensitive', suggestedReplacement: '细致程度, 具体细节', enabled: true },
            { id: `cw_p_${Date.now()}_11`, word: '抓手', category: 'enterprise_sensitive', suggestedReplacement: '切入点, 具体抓手', enabled: true },
          ];

    const existingWords = new Set(customWords.map((w) => w.word));
    const toAdd = presets.filter((p) => !existingWords.has(p.word));
    if (toAdd.length === 0) {
      setAddFeedback('预设词均已在您的词库中存在');
      setTimeout(() => setAddFeedback(null), 3000);
      return;
    }
    const updated = [...toAdd, ...customWords];
    onSaveCustomWords(updated);
    setAddFeedback(`✓ 成功快速导入 ${toAdd.length} 个推荐合规违禁词！`);
    setTimeout(() => setAddFeedback(null), 3500);
  };

  const filteredCustom = customWords.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.word.toLowerCase().includes(q) ||
        (item.suggestedReplacement && item.suggestedReplacement.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>公众号内容合规与自定义违禁词库</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-amber-400 text-slate-950 font-mono font-bold rounded">
                  {customWords.length + BANNED_AI_WORDS.length} 词在库
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                支持新广告法极限词拦截、AI 机械八股词替换及企业敏感词库，持久化同步
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-white text-indigo-700 border-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>自定义词库 ({customWords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('builtin')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'builtin'
                ? 'bg-white text-indigo-700 border-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>默认 AI 八股词表 ({BANNED_AI_WORDS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('quick_add')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quick_add'
                ? 'bg-white text-indigo-700 border-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加新违禁词</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {addFeedback && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between animate-fadeIn">
              <span className="font-medium">{addFeedback}</span>
              <button onClick={() => setAddFeedback(null)} className="text-emerald-700 hover:text-emerald-950 text-xs">✕</button>
            </div>
          )}

          {/* TAB 1: Custom Words Management */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索词条或替换词建议..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                  >
                    <option value="all">全部分类</option>
                    <option value="ad_law">新广告法极限词</option>
                    <option value="ai_cliche">AI 机械套话</option>
                    <option value="enterprise_sensitive">行业/敏感词</option>
                    <option value="custom">普通自定义</option>
                  </select>
                </div>
              </div>

              {/* Quick Preset Import Chips */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-indigo-950 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>快捷预设模板：</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBatchImportPreset('ad_law')}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold rounded border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    + 导入新广告法极限词包
                  </button>
                  <button
                    onClick={() => handleBatchImportPreset('wechat_marketing')}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold rounded border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    + 导入空洞黑话包
                  </button>
                </div>
              </div>

              {/* List */}
              {filteredCustom.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                  <Shield className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">暂无匹配的自定义违禁词</div>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    可点击上方预设快速导入，或切换至【添加新违禁词】输入您关心的行业禁忌词。
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-[380px] overflow-y-auto">
                  {filteredCustom.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors ${
                        item.enabled ? 'hover:bg-slate-50' : 'bg-slate-50/70 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => handleToggleEnable(item.id)}
                          className="rounded text-indigo-600 cursor-pointer"
                          title={item.enabled ? '已启用拦截' : '已暂停拦截'}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 font-mono text-xs">
                              {item.word}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                item.category === 'ad_law'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : item.category === 'enterprise_sensitive'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {item.category === 'ad_law'
                                ? '新广告法'
                                : item.category === 'enterprise_sensitive'
                                ? '行业敏感'
                                : '自定义'}
                            </span>
                          </div>
                          {item.suggestedReplacement && (
                            <div className="text-[11px] text-emerald-700 mt-0.5 flex items-center gap-1">
                              <ArrowRight className="w-2.5 h-2.5" />
                              <span>建议平白替换为：<strong>{item.suggestedReplacement}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                        title="删除此词条"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Built-in Words Table with Smart Replacements */}
          {activeTab === 'builtin' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  系统出厂内置 24 类典型大模型高频套话。每当质检引擎在文章中捕捉到这些词汇时，均支持<strong>一键智能清洗替换</strong>为地道人味口语！
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                {BANNED_AI_WORDS.map((w, idx) => {
                  const repls = DEFAULT_BANNED_WORD_REPLACEMENTS[w] || ['（平白大白话）'];
                  return (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs bg-white hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 text-[10px] w-6">#{idx + 1}</span>
                        <span className="font-bold text-rose-700 font-mono text-xs">{w}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">推荐替换：</span>
                        <div className="flex flex-wrap gap-1">
                          {repls.map((r, rIdx) => (
                            <span key={rIdx} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Quick Add */}
          {activeTab === 'quick_add' && (
            <div className="space-y-4 max-w-lg mx-auto py-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">违禁词条：</label>
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="例如：顶级、全网独家、闭环矩阵、包赚不赔"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">所属分类：</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'ad_law', label: '新广告法极限词', desc: '如“第一、顶级、绝无仅有”' },
                    { id: 'ai_cliche', label: 'AI 机械八股词', desc: '如“赋能、闭环、底层逻辑”' },
                    { id: 'enterprise_sensitive', label: '行业/敏感词', desc: '公司风控或特定业务禁忌' },
                    { id: 'custom', label: '通用过滤词', desc: '其他需拦截的不当表述' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewCategory(cat.id as any)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        newCategory === cat.id
                          ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-xs">{cat.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>推荐大白话替换词（选填）：</span>
                  <span className="text-[10px] text-slate-400 font-normal">多个替换词可用逗号分隔</span>
                </label>
                <input
                  type="text"
                  value={newReplacement}
                  onChange={(e) => setNewReplacement(e.target.value)}
                  placeholder="例如：高规格, 行业前列（一键清洗时将自动采用第一项）"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <button
                type="button"
                onClick={handleAddWord}
                disabled={!newWord.trim()}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>立即添加到违禁词库</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 text-[11px]">
            💾 词库已启用客户端与服务器端双通道持久存储
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            完成并返回
          </button>
        </div>
      </div>
    </div>
  );
};
