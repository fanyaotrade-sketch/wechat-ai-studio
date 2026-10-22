import React, { useState } from 'react';
import { X, Check, BookOpen, AlertTriangle, Sparkles } from 'lucide-react';
import type { StylePersona } from '../types/pipeline';
import { STYLE_PERSONAS } from '../data/presets';

interface StyleClonerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersonaId: string;
  onSelectPersona: (id: string) => void;
  referenceSample: string;
  onUpdateReferenceSample: (sample: string) => void;
  customTonePrompt: string;
  onUpdateCustomTone: (prompt: string) => void;
}

export const StyleClonerModal: React.FC<StyleClonerModalProps> = ({
  isOpen,
  onClose,
  selectedPersonaId,
  onSelectPersona,
  referenceSample,
  onUpdateReferenceSample,
  customTonePrompt,
  onUpdateCustomTone,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">文风调优与参考范文克隆 (Few-Shot)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              消除一切 AI 八股腔调，塑造有血有肉的人类实战操盘手语调
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Persona selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
              1. 选择核心叙事口吻 (Tone Persona)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STYLE_PERSONAS.map((persona) => {
                const isSelected = selectedPersonaId === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => onSelectPersona(persona.id)}
                    className={`text-left p-3.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{persona.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className={`text-xs mt-1 font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {persona.tagline}
                    </div>
                    <div className={`text-xs mt-2 leading-relaxed ${isSelected ? 'text-slate-200' : 'text-slate-600'}`}>
                      {persona.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Few-Shot Sample Injection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
                2. 投喂真实人类参考范文（学习其口头禅、断句与节奏）
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {referenceSample.length} 字
              </span>
            </div>
            <textarea
              value={referenceSample}
              onChange={(e) => onUpdateReferenceSample(e.target.value)}
              placeholder="在此粘贴 1~2 篇您平时觉得读起来特别舒服、极其接地气的公众号文章片段（或您自己写的段落）。大模型撰稿时将直接提取其段落长度、反问句习惯与断句气口..."
              rows={5}
              className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-sans leading-relaxed"
            />
          </div>

          {/* Custom Tone Supplements */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
              3. 个性化追加写作指令 (Optional)
            </label>
            <input
              type="text"
              value={customTonePrompt}
              onChange={(e) => onUpdateCustomTone(e.target.value)}
              placeholder="例如：多加点自己的自嘲、多用短句、语气再口语化一点、每两屏必须有一个真实数字..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-slate-900"
            />
          </div>

          {/* Anti-AI Ban Notice */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">全局内置反 AI 黑名单词库已生效：</span>
              系统撰稿与质检时将全面封杀“毋庸置疑、如同一把双刃剑、赋能、闭环、底层逻辑、心智模型、打法、矩阵、综上所述”等 20+ 类机械套话。
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            保存并应用配置
          </button>
        </div>
      </div>
    </div>
  );
};
