import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
  Minimize2,
  Maximize2,
  FileText,
  Shield,
  Layers,
  Camera,
  Check,
} from 'lucide-react';
import type { Archetype } from '../types/pipeline';

export interface GenerationStep {
  id: number;
  title: string;
  subtext: string;
  estimatedDurationSeconds: number;
}

export const DRAFT_GENERATION_STEPS: GenerationStep[] = [
  {
    id: 1,
    title: '人设心智与留白禁区装载',
    subtext: '加载专业口吻与各篇目互斥禁区，封杀跨篇目同质化套话',
    estimatedDurationSeconds: 4,
  },
  {
    id: 2,
    title: '选题反差引子与 SEO 搜索词植入',
    subtext: '提取事实矛盾与长尾检索关键词，构建特稿现场感抓手',
    estimatedDurationSeconds: 5,
  },
  {
    id: 3,
    title: '2000~4000 字长文逐段深度撰写',
    subtext: '融入真实算账与一线实操踩坑细节，确保深度信息密度',
    estimatedDurationSeconds: 15,
  },
  {
    id: 4,
    title: '16:9 实景插槽与手机防裂图装配',
    subtext: '按真实摄影光学规划视觉插槽，封杀画面内部小字与乱码',
    estimatedDurationSeconds: 4,
  },
  {
    id: 5,
    title: '去 AI 八股质检与特稿口语化重塑',
    subtext: '计算句式起伏度 (Burstiness)，自检违禁词并特稿重铸',
    estimatedDurationSeconds: 3,
  },
];

interface StepProgressModalProps {
  isOpen: boolean;
  isAllDrafts?: boolean;
  currentArchetype: Archetype;
  activeBatchArchetype?: Archetype;
  articleTitle?: string;
  onCancel?: () => void;
}

export const StepProgressModal: React.FC<StepProgressModalProps> = ({
  isOpen,
  isAllDrafts = false,
  currentArchetype,
  activeBatchArchetype = 'M',
  articleTitle = '公众号特稿长文',
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setElapsedSeconds(0);
      setIsMinimized(false);
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate simulated stage based on elapsed time
  // Total estimated time: ~30 seconds for single draft
  const targetArchetype = isAllDrafts ? activeBatchArchetype : currentArchetype;
  const arcLabel =
    targetArchetype === 'M'
      ? '第 1 篇 (头条深度特稿)'
      : targetArchetype === 'S'
      ? '第 2 篇 (次条深度拆解)'
      : '第 3 篇 (三条前沿观察)';

  // Determine current active step (1 to 5)
  let currentStepId = 1;
  if (elapsedSeconds < 4) currentStepId = 1;
  else if (elapsedSeconds < 9) currentStepId = 2;
  else if (elapsedSeconds < 24) currentStepId = 3;
  else if (elapsedSeconds < 28) currentStepId = 4;
  else currentStepId = 5;

  const progressPercent = Math.min(96, Math.round((elapsedSeconds / 30) * 94) + 6);

  // If minimized, render a sleek floating banner
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 bg-slate-900/95 text-white border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-sm w-full flex items-center justify-between gap-3 animate-slideUp">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
              <span>正在撰写：{arcLabel}</span>
              <span className="text-[10px] font-mono text-amber-300 font-bold">{progressPercent}%</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              第 {currentStepId}/5 步：{DRAFT_GENERATION_STEPS[currentStepId - 1].title} (已耗时 {elapsedSeconds}s)
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title="展开全屏查看阶段详情"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-sky-500 to-indigo-500" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>AI 大模型正在撰写深度长文</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {arcLabel}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-sm">
                《{articleTitle}》
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="最小化到底部悬浮窗，继续浏览工作区"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Batch indicator if generating all 3 drafts */}
        {isAllDrafts && (
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
            <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span>三联包批量撰写流水线：</span>
              <span className="text-[10px] font-mono text-amber-400">自动化流水线</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              {(['M', 'S', 'I'] as Archetype[]).map((arc) => {
                const isCurrent = targetArchetype === arc;
                const isPassed =
                  (arc === 'M' && targetArchetype !== 'M') ||
                  (arc === 'S' && targetArchetype === 'I');
                return (
                  <div
                    key={arc}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold ring-1 ring-amber-500/30'
                        : isPassed
                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="font-mono text-[10px]">
                      {arc === 'M' ? '第 1 篇·头条' : arc === 'S' ? '第 2 篇·次条' : '第 3 篇·三条'}
                    </div>
                    <div className="text-[10px] mt-0.5">
                      {isCurrent ? '⚡ 正在撰写' : isPassed ? '✓ 已就绪' : '⏳ 排队中'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Progress Bar & Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>
                正在执行第 <strong>{currentStepId}</strong> / 5 步：
                <span className="text-amber-300 font-bold ml-1">
                  {DRAFT_GENERATION_STEPS[currentStepId - 1].title}
                </span>
              </span>
            </span>
            <span className="font-mono font-bold text-amber-400 text-sm">{progressPercent}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>已耗时: <strong className="text-slate-200">{elapsedSeconds}</strong> 秒</span>
            </span>
            <span>目标篇幅: <strong className="text-emerald-400">2000~4000 字</strong></span>
          </div>
        </div>

        {/* 5 Sequential Step Milestones */}
        <div className="space-y-2.5 pt-1">
          {DRAFT_GENERATION_STEPS.map((step) => {
            const isFinished = step.id < currentStepId;
            const isActive = step.id === currentStepId;
            const isPending = step.id > currentStepId;

            return (
              <div
                key={step.id}
                className={`p-2.5 rounded-xl border transition-all flex items-start gap-3 ${
                  isActive
                    ? 'bg-slate-800/90 border-amber-500/60 shadow-lg ring-1 ring-amber-500/20'
                    : isFinished
                    ? 'bg-slate-950/60 border-emerald-900/40 text-slate-300'
                    : 'bg-slate-950/30 border-slate-800/40 opacity-40 text-slate-500'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isFinished ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-[10px]">
                      <Check className="w-3 h-3" />
                    </div>
                  ) : isActive ? (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] animate-pulse">
                      {step.id}
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 font-mono flex items-center justify-center text-[10px]">
                      {step.id}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isActive ? 'text-amber-300' : isFinished ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20 animate-pulse">
                        进行中...
                      </span>
                    )}
                    {isFinished && (
                      <span className="text-[10px] font-mono text-emerald-400">已就绪 ✓</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    {step.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>💡 生成耗时约 20~35 秒，可随时点击右上角最小化</span>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-[11px] text-sky-400 hover:text-sky-300 underline cursor-pointer"
          >
            最小化悬浮
          </button>
        </div>
      </div>
    </div>
  );
};
