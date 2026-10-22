import React, { useState, useEffect } from 'react';
import {
  Archive,
  Search,
  Filter,
  Calendar,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Eye,
  FileText,
  Tag,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react';
import type { ArticleArchiveItem, ThemeCategory, Archetype, DailyClusterPlan, DraftArticleOutput } from '../types/pipeline';
import { THEME_CATEGORIES_METADATA } from '../types/pipeline';
import { INITIAL_ARCHIVES } from '../data/presets';
import { FullArticleReaderModal } from './FullArticleReaderModal';

interface ArchiveViewProps {
  onLoadArchiveToWorkspace: (archive: ArticleArchiveItem) => void;
  onNavigateToPublisher: (archetype: Archetype) => void;
  onNavigateToPlanner: () => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  onLoadArchiveToWorkspace,
  onNavigateToPublisher,
  onNavigateToPlanner,
}) => {
  const [archives, setArchives] = useState<ArticleArchiveItem[]>(() => {
    try {
      const cached = localStorage.getItem('wechat_msi_local_archives');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_ARCHIVES;
  });
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArchiveId, setActiveArchiveId] = useState<string>(INITIAL_ARCHIVES[0]?.id || '');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPersisted, setIsPersisted] = useState(true);

  // Full Article Reader Modal state
  const [readerModalOpen, setReaderModalOpen] = useState(false);
  const [readerModalArchive, setReaderModalArchive] = useState<ArticleArchiveItem | null>(null);
  const [readerInitialArchetype, setReaderInitialArchetype] = useState<Archetype>('M');

  const handleOpenFullReader = (archiveItem: ArticleArchiveItem, archetype: Archetype = 'M', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReaderModalArchive(archiveItem);
    setReaderInitialArchetype(archetype);
    setReaderModalOpen(true);
  };

  // Fetch archives from server and sync with localStorage
  useEffect(() => {
    const fetchArchives = async () => {
      try {
        const res = await fetch('/api/pipeline/archives');
        const data = await res.json();
        if (data.success && Array.isArray(data.archives) && data.archives.length > 0) {
          setArchives(data.archives);
          try {
            localStorage.setItem('wechat_msi_local_archives', JSON.stringify(data.archives));
          } catch (e) {
            console.warn('localStorage quota warning:', e);
          }
          if (!activeArchiveId) {
            setActiveArchiveId(data.archives[0].id);
          }
          setIsPersisted(true);
        }
      } catch (err) {
        console.warn('Backend fetch failed, falling back to localStorage mirror:', err);
        try {
          const cached = localStorage.getItem('wechat_msi_local_archives');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setArchives(parsed);
            }
          }
        } catch {
          // ignore
        }
      }
    };
    fetchArchives();
  }, []);

  const handleDeleteArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('确定要删除这套历史三联包吗？此操作不可逆。')) return;
    try {
      await fetch(`/api/pipeline/archives/${id}`, { method: 'DELETE' });
      setArchives((prev) => {
        const updated = prev.filter((a) => a.id !== id);
        try {
          localStorage.setItem('wechat_msi_local_archives', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      if (activeArchiveId === id) {
        const remaining = archives.filter((a) => a.id !== id);
        if (remaining.length > 0) setActiveArchiveId(remaining[0].id);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Filter archives
  const filteredArchives = archives.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.theme_category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.seed_topic.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q)) ||
      item.articles.some((a) => a.wechat_title.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const activeArchive = archives.find((a) => a.id === activeArchiveId) || filteredArchives[0] || archives[0];

  // Real rich-text clipboard copy for WeChat official accounts editor: strictly Title -> Digest -> Body
  const handleCopyWeChatHtml = (article: ArticleArchiveItem['articles'][0]) => {
    const lines = article.markdown_content.split('\n');
    const digestText = article.digest_summary || '';
    const chineseNums: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
    let exportSlotIdx = 0;

    let htmlLines = `
      <div style="font-family: -apple-system-font,BlinkMacSystemFont,'Helvetica Neue','PingFang SC','Hiragino Sans GB','Microsoft YaHei UI','Microsoft YaHei',Arial,sans-serif; font-size: 15px; color: #333333; line-height: 1.8; letter-spacing: 0.5px; padding: 10px 0;">
        <h1 style="font-size: 22px; font-weight: bold; color: #111827; line-height: 1.4; margin-bottom: 18px; letter-spacing: -0.5px;">${article.wechat_title}</h1>
        ${digestText ? `
          <div style="margin: 18px 0 24px 0; padding: 14px 18px; background-color: #f8fafc; border-left: 4px solid #0f172a; border-radius: 4px; color: #334155; font-size: 14px; line-height: 1.75;">
            <strong style="color: #0f172a;">导读：</strong>${digestText}
          </div>
        ` : ''}
    `;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith('> 导读：') || line.startsWith('> 导读:') || line.startsWith('> 🎯') || line.startsWith('> 🛡️') || line.startsWith('# ')) {
        continue;
      }

      if (line.startsWith('## ')) {
        htmlLines += `
          <h2 style="font-size: 17.5px; font-weight: 700; color: #0f172a; margin-top: 32px; margin-bottom: 16px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center;">
            <span style="display: inline-block; width: 4px; height: 18px; background-color: #0f172a; margin-right: 8px; border-radius: 2px;"></span>
            ${line.replace('## ', '')}
          </h2>
        `;
      } else if (line.startsWith('### ')) {
        htmlLines += `
          <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-top: 24px; margin-bottom: 12px; padding-left: 8px; border-left: 3px solid #64748b;">
            ${line.replace('### ', '')}
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
        const slotImg = article.slot_images?.[slotId] || article.slot_images?.[String(curSlotNum)];

        if (slotImg) {
          htmlLines += `
            <div style="margin: 24px 0; text-align: center;">
              <img src="${slotImg}" alt="图 ${curSlotNum}" style="max-width: 100%; border-radius: 6px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); display: block; margin: 0 auto;" />
              <div style="font-size: 12px; color: #64748b; margin-top: 8px; text-align: center;">[图${curSlotNum}]</div>
            </div>
          `;
        } else {
          htmlLines += `
            <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 6px; text-align: center; color: #64748b; font-size: 13px;">
              [图${curSlotNum}]
            </div>
          `;
        }
      } else if (line.startsWith('> ')) {
        htmlLines += `
          <div style="margin: 20px 0; padding: 14px 16px; background-color: #f8fafc; border-left: 4px solid #0f172a; border-radius: 4px; color: #334155; font-size: 14px; line-height: 1.7;">
            ${line.replace(/^>\s*/, '')}
          </div>
        `;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const listText = line.replace(/^[-*]\s+/, '');
        htmlLines += `
          <div style="margin-bottom: 8px; padding-left: 14px; position: relative; font-size: 15px; color: #334155; line-height: 1.75;">
            <span style="position: absolute; left: 0; top: 8px; width: 5px; height: 5px; border-radius: 50%; background-color: #64748b;"></span>
            ${listText.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a;">$1</strong>')}
          </div>
        `;
      } else {
        htmlLines += `<p style="margin-bottom: 16px; line-height: 1.8; color: #334155;">${line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a; font-weight: 600;">$1</strong>')}</p>`;
      }
    }

    htmlLines += '</div>';

    try {
      const blob = new Blob([htmlLines], { type: 'text/html' });
      const textBlob = new Blob([article.markdown_content], { type: 'text/plain' });
      const clipboardItem = new ClipboardItem({
        'text/html': blob,
        'text/plain': textBlob,
      });
      navigator.clipboard.write([clipboardItem]).then(() => {
        setCopiedKey(`${article.archetype}_html`);
        setTimeout(() => setCopiedKey(null), 2500);
      }).catch(() => {
        navigator.clipboard.writeText(article.markdown_content);
        setCopiedKey(`${article.archetype}_html`);
        setTimeout(() => setCopiedKey(null), 2500);
      });
    } catch {
      navigator.clipboard.writeText(article.markdown_content);
      setCopiedKey(`${article.archetype}_html`);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleCopyMarkdown = (article: ArticleArchiveItem['articles'][0]) => {
    navigator.clipboard.writeText(article.markdown_content);
    setCopiedKey(`${article.archetype}_md`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleExportArchives = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(archives, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `wechat_msi_archives_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-indigo-500/10 text-indigo-700 border border-indigo-500/20">
                知识资产沉淀
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>双重持久化就绪（文件系统 + 浏览器双重镜像）</span>
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                06. 历史文章库与内容档案资产 (Article Knowledge Base & Archive)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              自动沉淀历次生成的 M/S/I 黄金三联包长文（2000~4000字）与 16:9 抗 AI 配图指令。支持按 5 大核心题材分类检索、一键载入工作台复用、以及免凭证一键直达微信公众号后台发布
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportArchives}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              title="导出当前全部归档文章为 JSON 备份文件"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>备份归档 (JSON)</span>
            </button>
            <button
              onClick={onNavigateToPlanner}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>创建新母题三联包</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部题材 ({archives.length})
            </button>
            {THEME_CATEGORIES_METADATA.map((cat) => {
              const count = archives.filter((a) => a.theme_category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.shortLabel}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索历史标题、标签或母题..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Main 2-column layout: Left List & Right Detail Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Archive Card List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between px-1">
            <span>已归档三联包记录 ({filteredArchives.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">点击查看正文与一键复制</span>
          </div>

          {filteredArchives.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs space-y-2">
              <Archive className="w-8 h-8 mx-auto text-slate-300" />
              <p>暂无符合筛选条件的历史文章档案</p>
            </div>
          ) : (
            filteredArchives.map((item) => {
              const isSelected = item.id === activeArchive?.id;
              const catMeta = THEME_CATEGORIES_METADATA.find((c) => c.id === item.theme_category);

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveArchiveId(item.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-900'
                  }`}
                >
                  {/* Category & Date */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        isSelected
                          ? 'bg-slate-800 text-amber-300'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {catMeta?.shortLabel || item.category_label || '前沿题材'}
                    </span>
                    <span className={`font-mono text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                      {item.created_at}
                    </span>
                  </div>

                  {/* Seed Topic */}
                  <h3 className="text-xs font-bold mt-2 leading-snug line-clamp-2">
                    {item.seed_topic}
                  </h3>

                  {/* Articles preview */}
                  <div className="mt-2.5 space-y-1 text-[11px]">
                    {item.articles.map((art) => (
                      <div
                        key={art.archetype}
                        className={`truncate flex items-center gap-1.5 ${
                          isSelected ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        <span
                          className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                            art.archetype === 'M'
                              ? isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
                              : art.archetype === 'S'
                              ? isSelected ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-100 text-sky-800'
                              : isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {art.archetype}
                        </span>
                        <span className="truncate">{art.wechat_title}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tags & Total Words Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100/10 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.tags.slice(0, 3).map((t, tidx) => (
                        <span
                          key={tidx}
                          className={`px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleOpenFullReader(item, 'M', e)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title="打开完整长文阅读器"
                      >
                        <BookOpen className="w-2.5 h-2.5" />
                        <span>看全文</span>
                      </button>
                      <span className={`font-mono font-medium ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {item.total_word_count.toLocaleString()} 字
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detailed Archive Reader & Fast Publish Zone (7 cols) */}
        {activeArchive && (
          <div className="lg:col-span-7 space-y-5">
            {/* Active Record Card Top Action Bar */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500">当前归档档案</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{activeArchive.seed_topic}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    onClick={(e) => handleOpenFullReader(activeArchive, 'M', e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                    title="打开沉浸式全文阅读器浏览本套三联包完整长文"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>打开三联包看全文</span>
                  </button>
                  <button
                    onClick={() => onLoadArchiveToWorkspace(activeArchive)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs"
                    title="将本套文章载入排版工坊与撰稿器进行二次编辑"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-950" />
                    <span>载入排版工坊</span>
                  </button>
                  <button
                    onClick={(e) => handleDeleteArchive(activeArchive.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="删除归档记录"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Three Article Sub-cards */}
              <div className="space-y-4">
                {activeArchive.articles.map((art) => {
                  const isCopied = copiedKey === `${art.archetype}_html`;
                  return (
                    <div
                      key={art.archetype}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                art.archetype === 'M'
                                  ? 'bg-amber-500/20 text-amber-800 border border-amber-500/30'
                                  : art.archetype === 'S'
                                  ? 'bg-sky-500/20 text-sky-800 border border-sky-500/30'
                                  : 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/30'
                              }`}
                            >
                              {art.publish_slot} · {art.msi_role_label || '黄金单篇'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 font-semibold">
                              {art.word_count} 字 · 完读约 {Math.round(art.word_count / 400)} 分钟
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-950">{art.wechat_title}</h4>
                        </div>

                        {/* Fast Publish Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={(e) => handleOpenFullReader(activeArchive, art.archetype, e)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-800 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors shadow-xs cursor-pointer"
                            title="打开全屏弹窗阅读器查看完整长文正文与目录"
                          >
                            <BookOpen className="w-3 h-3 text-slate-950" />
                            <span>打开看全文</span>
                          </button>
                          <button
                            onClick={() => handleCopyWeChatHtml(art)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs cursor-pointer"
                            title="复制微信富文本格式，直接 Ctrl+V 粘贴进公众号后台"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3 text-emerald-100" />}
                            <span>{isCopied ? '已复制排版' : '复制微信排版'}</span>
                          </button>
                          <button
                            onClick={() => handleCopyMarkdown(art)}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                            title="复制纯 Markdown 格式长文正文"
                          >
                            {copiedKey === `${art.archetype}_md` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                            <span>{copiedKey === `${art.archetype}_md` ? '已复制' : '复制MD'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                        {art.digest_summary}
                      </p>

                      {/* Image slots indicator */}
                      {art.image_slots && art.image_slots.length > 0 && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
                          <span className="font-semibold text-sky-700">📸 规划配图插槽 ({art.image_slots.length}处):</span>
                          <span className="truncate">
                            {art.image_slots.map((s) => s.title).join(' / ')}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Article Reader Modal */}
      <FullArticleReaderModal
        isOpen={readerModalOpen}
        onClose={() => setReaderModalOpen(false)}
        archive={readerModalArchive}
        initialArchetype={readerInitialArchetype}
        onLoadToWorkspace={(arch) => {
          onLoadArchiveToWorkspace(arch);
        }}
        onNavigateToPublisher={(arc) => {
          onNavigateToPublisher(arc);
        }}
      />
    </div>
  );
};

