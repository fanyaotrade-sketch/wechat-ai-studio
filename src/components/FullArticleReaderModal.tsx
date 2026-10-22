import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Eye,
  BookOpen,
  Camera,
  Layers,
  Sparkles,
  ExternalLink,
  Tag,
  Clock,
  FileText,
  Sliders,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { ArticleArchiveItem, Archetype } from '../types/pipeline';

interface FullArticleReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  archive: ArticleArchiveItem | null;
  initialArchetype?: Archetype;
  onLoadToWorkspace?: (archive: ArticleArchiveItem) => void;
  onNavigateToPublisher?: (archetype: Archetype) => void;
}

export const FullArticleReaderModal: React.FC<FullArticleReaderModalProps> = ({
  isOpen,
  onClose,
  archive,
  initialArchetype = 'M',
  onLoadToWorkspace,
  onNavigateToPublisher,
}) => {
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype>(initialArchetype);
  const [copiedType, setCopiedType] = useState<'md' | 'wechat' | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'compact'>('normal');

  React.useEffect(() => {
    if (initialArchetype) {
      setSelectedArchetype(initialArchetype);
    }
  }, [initialArchetype, isOpen]);

  if (!isOpen || !archive) return null;

  const currentArticle = archive.articles.find((a) => a.archetype === selectedArchetype) || archive.articles[0];

  const handleCopyMarkdown = () => {
    if (!currentArticle) return;
    navigator.clipboard.writeText(currentArticle.markdown_content || '');
    setCopiedType('md');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyWeChatHTML = () => {
    if (!currentArticle) return;
    const lines = (currentArticle.markdown_content || '').split('\n');
    const digestText = currentArticle.digest_summary || '';
    const chineseNums: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
    let exportSlotIdx = 0;

    let html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.8; color: #222; letter-spacing: 0.5px; padding: 12px 6px;">`;
    html += `<h1 style="font-size: 22px; font-weight: bold; color: #111; line-height: 1.4; margin-bottom: 18px;">${currentArticle.wechat_title}</h1>`;
    if (digestText) {
      html += `<div style="background-color: #f8fafc; border-left: 4px solid #0f172a; padding: 14px 18px; margin-bottom: 24px; font-size: 14px; color: #334155; line-height: 1.75; border-radius: 4px;"><strong>导读：</strong>${digestText}</div>`;
    }

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }
      if (line.startsWith('> 导读：') || line.startsWith('> 导读:') || line.startsWith('> 🎯') || line.startsWith('> 🛡️') || line.startsWith('# ')) {
        continue;
      }

      if (line.startsWith('## ')) {
        html += `<h2 style="font-size: 17.5px; font-weight: bold; color: #0f172a; margin-top: 32px; margin-bottom: 16px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center;"><span style="display: inline-block; width: 4px; height: 18px; background-color: #0f172a; margin-right: 8px; border-radius: 2px;"></span>${line.replace('## ', '')}</h2>`;
      } else if (line.startsWith('### ')) {
        html += `<h3 style="font-size: 15px; font-weight: bold; color: #1e293b; margin-top: 24px; margin-bottom: 12px; padding-left: 8px; border-left: 3px solid #64748b;">${line.replace('### ', '')}</h3>`;
      } else if (line.match(/^\[(?:图\s*([0-9一二三四五六七八九十]+)|📸|建议配图)/)) {
        const simpleMatch = line.match(/^\[(?:图)\s*([0-9一二三四五六七八九十]+)\]/);
        let curSlotNum = exportSlotIdx + 1;
        if (simpleMatch) {
          const rawNum = simpleMatch[1];
          curSlotNum = chineseNums[rawNum] || parseInt(rawNum, 10) || curSlotNum;
        }
        exportSlotIdx++;

        const slotId = `slot_${curSlotNum}`;
        const slotImg = currentArticle.slot_images?.[slotId] || currentArticle.slot_images?.[String(curSlotNum)];

        if (slotImg) {
          html += `
            <div style="margin: 24px 0; text-align: center;">
              <img src="${slotImg}" alt="图 ${curSlotNum}" style="max-width: 100%; border-radius: 6px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); display: block; margin: 0 auto;" />
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
      } else if (line.startsWith('> ')) {
        html += `<div style="margin: 20px 0; padding: 14px 16px; background-color: #f8fafc; border-left: 4px solid #0f172a; border-radius: 4px; color: #334155; font-size: 14px; line-height: 1.7;">${line.replace('> ', '')}</div>`;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        html += `<div style="margin-bottom: 8px; padding-left: 14px; position: relative; font-size: 15px; color: #334155; line-height: 1.75;"><span style="position: absolute; left: 0; top: 8px; width: 5px; height: 5px; border-radius: 50%; background-color: #64748b;"></span>${line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a;">$1</strong>')}</div>`;
      } else {
        html += `<p style="margin-bottom: 16px; font-size: 15px; color: #334155; line-height: 1.8;">${line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a; font-weight: 600;">$1</strong>')}</p>`;
      }
    }
    html += `</div>`;

    try {
      const blob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([currentArticle.markdown_content || ''], { type: 'text/plain' });
      navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blob,
          'text/plain': textBlob,
        }),
      ]);
      setCopiedType('wechat');
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      navigator.clipboard.writeText(html);
      setCopiedType('wechat');
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const articleHeadings = useMemo(() => {
    if (!currentArticle?.markdown_content) return [];
    const lines = currentArticle.markdown_content.split('\n');
    const headings: Array<{ level: number; text: string; id: string }> = [];
    lines.forEach((l, idx) => {
      const trimmed = l.trim();
      if (trimmed.startsWith('## ')) {
        headings.push({ level: 2, text: trimmed.replace('## ', ''), id: `h-${idx}` });
      } else if (trimmed.startsWith('### ')) {
        headings.push({ level: 3, text: trimmed.replace('### ', ''), id: `h-${idx}` });
      }
    });
    return headings;
  }, [currentArticle?.markdown_content]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0">
              {selectedArchetype}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {archive.category_label || archive.theme_category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {archive.created_at || '归档文章'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xl">
                {currentArticle.wechat_title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Archetype switcher tabs */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              {(['M', 'S', 'I'] as Archetype[]).map((arc) => {
                const art = archive.articles.find((a) => a.archetype === arc);
                if (!art) return null;
                return (
                  <button
                    key={arc}
                    onClick={() => setSelectedArchetype(arc)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      selectedArchetype === arc
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {arc}型 ({art.word_count || 3000}字)
                  </button>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
              title="关闭 (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action & Meta Toolbar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              总字数: <strong className="text-slate-900">{currentArticle.word_count || 3200}</strong> 字
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              预计阅读: <strong>{Math.ceil((currentArticle.word_count || 3200) / 450)}</strong> 分钟
            </span>
            <span className="hidden md:flex items-center gap-1.5 font-medium">
              <Camera className="w-3.5 h-3.5 text-slate-500" />
              配图插槽: <strong>{currentArticle.image_slots?.length || 3}</strong> 处
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Font size control */}
            <div className="hidden sm:flex items-center border border-slate-200 rounded-md bg-white p-0.5 text-xs">
              <button
                onClick={() => setFontSize('compact')}
                className={`px-2 py-0.5 rounded ${fontSize === 'compact' ? 'bg-slate-200 font-bold text-slate-900' : 'text-slate-600'}`}
              >
                小
              </button>
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded ${fontSize === 'normal' ? 'bg-slate-200 font-bold text-slate-900' : 'text-slate-600'}`}
              >
                中
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded ${fontSize === 'large' ? 'bg-slate-200 font-bold text-slate-900' : 'text-slate-600'}`}
              >
                大
              </button>
            </div>

            {/* Copy Markdown */}
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              {copiedType === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'md' ? '已复制 MD' : '复制 Markdown'}</span>
            </button>

            {/* Copy WeChat HTML */}
            <button
              onClick={handleCopyWeChatHTML}
              className="px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copiedType === 'wechat' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'wechat' ? '已复制微信富文本' : '一键复制微信富文本'}</span>
            </button>

            {/* Load to Publisher */}
            <button
              onClick={() => {
                if (onLoadToWorkspace) onLoadToWorkspace(archive);
                if (onNavigateToPublisher) onNavigateToPublisher(selectedArchetype);
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>载入到排版工坊</span>
            </button>
          </div>
        </div>

        {/* Content Body Layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Outline / TOC Navigation */}
          <div className="hidden lg:block w-64 border-r border-slate-200 bg-slate-50/50 p-4 overflow-y-auto shrink-0 text-xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              文章段落导航
            </div>
            <div className="space-y-1">
              {articleHeadings.map((h, i) => (
                <div
                  key={i}
                  className={`py-1 px-2 rounded hover:bg-slate-200/60 transition-colors text-slate-700 line-clamp-1 ${
                    h.level === 3 ? 'pl-4 text-xs text-slate-500' : 'font-medium'
                  }`}
                >
                  {h.text}
                </div>
              ))}
            </div>

            {/* Visual slots summary */}
            {currentArticle.image_slots && currentArticle.image_slots.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" />
                  已规划插图 ({currentArticle.image_slots.length})
                </div>
                <div className="space-y-2">
                  {currentArticle.image_slots.map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-white border border-slate-200 text-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">{s.title}</div>
                      <div className="text-slate-400 font-mono text-xs mt-0.5">{(s as any).size || s.recommended_size}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Article Full Reading View */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100/50 flex justify-center">
            <div
              className={`bg-white rounded-xl shadow-xs border border-slate-200 p-8 sm:p-12 max-w-3xl w-full ${
                fontSize === 'compact'
                  ? 'text-sm leading-relaxed'
                  : fontSize === 'large'
                  ? 'text-lg leading-loose'
                  : 'text-base leading-relaxed'
              }`}
            >
              {/* Archetype banner */}
              <div className="mb-6 pb-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
                    {selectedArchetype}型 · {currentArticle.msi_role_label || '公众号重点文章'}
                  </span>
                  <span className="text-xs text-slate-500">
                    母题：{archive.seed_topic}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {archive.tags.map((t, i) => (
                    <span key={i} className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-4">
                {currentArticle.wechat_title}
              </h1>

              {/* Digest box */}
              <div className="mb-8 p-4 rounded-lg bg-slate-50 border-l-4 border-slate-800 text-slate-600 text-sm leading-relaxed">
                <strong className="text-slate-800">【导读摘要】：</strong>
                {currentArticle.digest_summary}
              </div>

              {/* Main Content Render */}
              <div className="prose max-w-none text-slate-800 space-y-4">
                {(currentArticle.markdown_content || '').split('\n\n').map((block, idx) => {
                  const trimmed = block.trim();
                  if (!trimmed) return null;

                  if (trimmed.startsWith('### ')) {
                    return (
                      <h3
                        key={idx}
                        className="text-base sm:text-lg font-bold text-slate-900 mt-6 mb-2 pl-3 border-l-3 border-blue-600"
                      >
                        {trimmed.replace('### ', '')}
                      </h3>
                    );
                  }

                  if (trimmed.startsWith('## ')) {
                    return (
                      <h2
                        key={idx}
                        className="text-lg sm:text-xl font-bold text-slate-900 mt-8 mb-3 bg-slate-100 px-3 py-1.5 rounded"
                      >
                        {trimmed.replace('## ', '')}
                      </h2>
                    );
                  }

                  if (trimmed.startsWith('# ')) {
                    return (
                      <h1 key={idx} className="text-xl font-bold text-slate-900 mt-8 mb-3">
                        {trimmed.replace('# ', '')}
                      </h1>
                    );
                  }

                  if (trimmed.startsWith('```mermaid')) {
                    const code = trimmed.replace(/^```mermaid\n?/, '').replace(/```$/, '').trim();
                    return (
                      <div
                        key={idx}
                        className="my-5 p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner"
                      >
                        <div className="text-[10px] text-slate-400 mb-2 uppercase tracking-wider font-sans font-bold flex items-center justify-between">
                          <span>Mermaid 流程逻辑图</span>
                          <span className="text-slate-500">可在排版中渲染</span>
                        </div>
                        <pre className="whitespace-pre">{code}</pre>
                      </div>
                    );
                  }

                  if (trimmed.startsWith('```')) {
                    const code = trimmed.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
                    return (
                      <div
                        key={idx}
                        className="my-4 p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto"
                      >
                        <pre className="whitespace-pre">{code}</pre>
                      </div>
                    );
                  }

                  const imgSlotMatch = trimmed.match(/^\[(?:图\s*([0-9一二三四五六七八九十]+)|📸|建议配图)/);
                  if (imgSlotMatch) {
                    const simpleMatch = trimmed.match(/^\[(?:图)\s*([0-9一二三四五六七八九十]+)\]/);
                    const rawNum = simpleMatch ? simpleMatch[1] : '1';
                    const chineseNums: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
                    const num = chineseNums[rawNum] || parseInt(rawNum, 10) || 1;
                    const slotImg = currentArticle.slot_images?.[`slot_${num}`] || currentArticle.slot_images?.[String(num)];

                    if (slotImg) {
                      return (
                        <div key={idx} className="my-6 text-center">
                          <img
                            src={slotImg}
                            alt={`图 ${num}`}
                            className="max-w-full mx-auto rounded-lg shadow-md border border-slate-200 aspect-video object-cover"
                          />
                          <div className="mt-2 text-xs text-slate-500 font-mono">[图{num}]</div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className="my-5 p-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/80 text-slate-600 text-xs flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4 text-slate-400" />
                        <span className="font-mono font-medium">[图{num}] 标准 16:9 横图位</span>
                      </div>
                    );
                  }

                  if (trimmed.startsWith('> ')) {
                    return (
                      <blockquote
                        key={idx}
                        className="my-4 pl-4 border-l-4 border-slate-400 bg-slate-50 py-2.5 pr-4 text-slate-600 italic text-sm rounded-r"
                      >
                        {trimmed.replace(/^>\s*/, '')}
                      </blockquote>
                    );
                  }

                  return (
                    <p key={idx} className="text-slate-700 leading-relaxed text-justify mb-3">
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
