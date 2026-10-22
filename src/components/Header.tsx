import React from 'react';
import { Sparkles, BookOpen, Layers, Sliders, CheckCircle2, Cpu, RotateCcw } from 'lucide-react';
import type { LLMProvider } from '../types/pipeline';

interface HeaderProps {
  activeTab: 'planner' | 'publisher' | 'archive';
  setActiveTab: (tab: 'planner' | 'publisher' | 'archive') => void;
  onOpenStyleModal: () => void;
  currentPersonaName: string;
  onOpenModelModal?: () => void;
  activeProvider?: LLMProvider;
  activeModel?: string;
  onResetWorkspace?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenStyleModal,
  currentPersonaName,
  onOpenModelModal,
  activeProvider = 'gemini',
  activeModel = 'gemini-3.8-flash',
  onResetWorkspace,
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-6 px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
      {/* Zone 1: Brand Wordmark (Single element) */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
          微信公众号全流程工作台
        </a>
        <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-medium border border-indigo-200">
          v3.5 · 海外情报矩阵
        </span>
      </div>

      {/* Zone 2: Navigation Links (Single-line, whitespace-nowrap) */}
      <nav className="hidden md:flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setActiveTab('planner')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'planner'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          01. 关键词信源雷达 & DeepSeek 二创工坊
        </button>
        <button
          onClick={() => setActiveTab('publisher')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'publisher'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          02. 微信手机排版 & AI配图工坊
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'archive'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          03. 历史文章库
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {onResetWorkspace && (
          <button
            type="button"
            onClick={onResetWorkspace}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-700 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
            title="清空当前排期池与所有未归档草稿，恢复纯净空白状态"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
            <span className="hidden sm:inline">重置工作台</span>
          </button>
        )}

        <button
          onClick={onOpenModelModal}
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
          title="配置大模型与海外信源 API"
        >
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">
            {activeProvider === 'siliconflow'
              ? '硅基: ' + (activeModel?.split('/')?.pop() || 'DeepSeek')
              : activeProvider === 'openai_compatible'
              ? '自定义: ' + (activeModel || 'Custom')
              : '模型: Gemini'}
          </span>
          <span className="sm:hidden">模型</span>
        </button>

        <button
          onClick={onOpenStyleModal}
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="调整人设口吻与喂入参考范文"
        >
          <Sliders className="w-4 h-4 text-slate-500" />
          <span>文风: {currentPersonaName}</span>
        </button>
      </div>
    </header>
  );
};
