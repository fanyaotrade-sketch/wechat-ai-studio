import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  Key,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Flame,
  Check,
  Plus,
  Trash2,
  RotateCcw,
  Search,
  Radio,
  FileText,
  Layers,
  ShieldCheck,
  Settings,
  HelpCircle,
  Tag,
} from 'lucide-react';
import type { ModelConfig, LLMProvider, ThemeCategory } from '../types/pipeline';
import {
  DEFAULT_MODEL_CONFIG,
  SILICONFLOW_CONFIG_PRESET,
  PROVIDER_METADATA,
  THEME_CATEGORIES_METADATA,
  SLOT_ARCHETYPE_METADATA,
} from '../types/pipeline';
import { STYLE_PERSONAS } from '../data/presets';
import { PRESET_RSS_FEEDS } from '../data/dailyTopics';

interface ModelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ModelConfig;
  onSave: (newConfig: ModelConfig) => void;
}

export const ModelConfigModal: React.FC<ModelConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'llm' | 'image' | 'sources' | 'wechat'>('llm');
  const [formData, setFormData] = useState<ModelConfig>({ ...config });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showImageApiKey, setShowImageApiKey] = useState(false);

  // Test Connection States (LLM)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [testWithSearch, setTestWithSearch] = useState<boolean>(false);

  // Apify Connection States
  const [apifyTestStatus, setApifyTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [apifyTestMessage, setApifyTestMessage] = useState<string>('');
  const [apifyTestLatency, setApifyTestLatency] = useState<number | null>(null);
  const [showApifyToken, setShowApifyToken] = useState(false);

  // Custom Tag Inputs
  const [newSubreddit, setNewSubreddit] = useState('');
  const [newTwitterKeyword, setNewTwitterKeyword] = useState('');
  const [newTwitterKol, setNewTwitterKol] = useState('');
  const [newRssName, setNewRssName] = useState('');
  const [newRssUrl, setNewRssUrl] = useState('');
  const [newRssCategory, setNewRssCategory] = useState<ThemeCategory>('global_digital_biz');

  // Save status
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormData({ ...config });
    setTestStatus('idle');
    setTestMessage('');
    setTestLatency(null);
    setApifyTestStatus('idle');
    setApifyTestMessage('');
    setApifyTestLatency(null);
    setSaveSuccessMessage(null);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const currentProviderMeta =
    PROVIDER_METADATA.find((p) => p.provider === formData.provider) || PROVIDER_METADATA[0];

  const handleProviderSelect = (provider: LLMProvider) => {
    if (provider === 'siliconflow') {
      setFormData({
        ...formData,
        provider: 'siliconflow',
        baseUrl: 'https://api.siliconflow.cn/v1',
        model: 'deepseek-ai/DeepSeek-V3',
        imageProvider: 'siliconflow',
        imageModel: 'black-forest-labs/FLUX.1-schnell',
      });
    } else if (provider === 'gemini') {
      setFormData({
        ...formData,
        provider: 'gemini',
        baseUrl: 'https://generativelanguage.googleapis.com',
        model: 'gemini-3.8-flash',
        googleSearchEnabled: true,
        imageProvider: 'gemini',
        imageModel: 'imagen-3.0-generate-002',
      });
    } else {
      setFormData({
        ...formData,
        provider: 'openai_compatible',
        baseUrl: formData.baseUrl.includes('siliconflow') || formData.baseUrl.includes('generativelanguage')
          ? 'https://api.openai.com/v1'
          : formData.baseUrl,
        model: formData.model || 'gpt-4o',
      });
    }
  };

  const handleTestConnection = async (testGoogleSearch = false) => {
    setTestStatus('testing');
    setTestMessage('');
    setTestLatency(null);
    setTestWithSearch(testGoogleSearch);

    try {
      const res = await fetch('/api/config/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: formData.provider,
          apiKey: formData.apiKey,
          baseUrl: formData.baseUrl,
          model: formData.model,
          testGoogleSearch,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus('success');
        setTestLatency(data.latencyMs);
        setTestMessage(
          testGoogleSearch
            ? `Google AI 搜索连通成功！模型回复: “${data.reply}” (具备实时 Grounding 联网能力)`
            : `API 接口连通正常！模型回复: “${data.reply}”`
        );
      } else {
        setTestStatus('error');
        setTestLatency(data.latencyMs || null);
        setTestMessage(data.error || '连通性测试未通过，请检查 API Key 与网络连接');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || '网络请求错误，无法连接后端服务');
    }
  };

  // Test Apify Connectivity
  const handleTestApify = async () => {
    if (!formData.apifyToken?.trim()) {
      setApifyTestStatus('error');
      setApifyTestMessage('请先填入有效的 Apify API Token');
      return;
    }
    setApifyTestStatus('testing');
    setApifyTestMessage('正在连接 Apify 官方 API 网关...');
    setApifyTestLatency(null);

    try {
      const res = await fetch('/api/config/test-apify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: formData.apifyToken.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setApifyTestStatus('success');
        setApifyTestLatency(data.latencyMs);
        setApifyTestMessage(data.message || `Apify 授权有效，响应延迟 ${data.latencyMs}ms`);
      } else {
        setApifyTestStatus('error');
        setApifyTestLatency(data.latencyMs || null);
        setApifyTestMessage(data.error || 'Apify Token 验证失败，请核对是否正确');
      }
    } catch (err: any) {
      setApifyTestStatus('error');
      setApifyTestMessage(err.message || '网络请求错误，无法连接后端服务');
    }
  };

  // Add & Remove Twitter Search Keyword
  const handleAddTwitterKeyword = () => {
    if (!newTwitterKeyword.trim()) return;
    const clean = newTwitterKeyword.trim();
    const current = formData.twitterSearchKeywords || [];
    if (!current.includes(clean)) {
      setFormData({ ...formData, twitterSearchKeywords: [...current, clean] });
    }
    setNewTwitterKeyword('');
  };

  const handleRemoveTwitterKeyword = (kw: string) => {
    setFormData({
      ...formData,
      twitterSearchKeywords: (formData.twitterSearchKeywords || []).filter((k) => k !== kw),
    });
  };

  // Add & Remove Subreddit Tag
  const handleAddSubreddit = () => {
    if (!newSubreddit.trim()) return;
    const clean = newSubreddit.trim().replace(/^r\//, '');
    const current = formData.customSubreddits || [];
    if (!current.includes(clean)) {
      setFormData({ ...formData, customSubreddits: [...current, clean] });
    }
    setNewSubreddit('');
  };

  const handleRemoveSubreddit = (sub: string) => {
    setFormData({
      ...formData,
      customSubreddits: (formData.customSubreddits || []).filter((s) => s !== sub),
    });
  };

  // Add & Remove Twitter KOL
  const handleAddTwitterKol = () => {
    if (!newTwitterKol.trim()) return;
    const clean = newTwitterKol.trim().replace(/^@/, '');
    const current = formData.customTwitterKols || [];
    if (!current.includes(clean)) {
      setFormData({ ...formData, customTwitterKols: [...current, clean] });
    }
    setNewTwitterKol('');
  };

  const handleRemoveTwitterKol = (kol: string) => {
    setFormData({
      ...formData,
      customTwitterKols: (formData.customTwitterKols || []).filter((k) => k !== kol),
    });
  };

  // Add & Remove RSS URL
  const handleAddRssUrl = () => {
    if (!newRssUrl.trim() || !newRssName.trim()) return;
    const current = formData.customRssUrls || [];
    setFormData({
      ...formData,
      customRssUrls: [
        ...current,
        { name: newRssName.trim(), url: newRssUrl.trim(), category: newRssCategory },
      ],
    });
    setNewRssName('');
    setNewRssUrl('');
  };

  const handleRemoveRssUrl = (idx: number) => {
    setFormData({
      ...formData,
      customRssUrls: (formData.customRssUrls || []).filter((_, i) => i !== idx),
    });
  };

  // Submit and Persist to Backend & LocalStorage
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMessage(null);

    try {
      // 1. Post to backend persistent storage
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessMessage('配置已成功持久化至服务端与本地！全流程即刻生效。');
      }
    } catch (err) {
      console.warn('Failed to sync config to backend:', err);
    } finally {
      setIsSaving(false);
      onSave(formData);
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('确定要恢复默认推荐配置吗？已输入的 API Key 将被清空。')) {
      setFormData({ ...DEFAULT_MODEL_CONFIG });
      setTestStatus('idle');
      setTestMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Settings className="w-5 h-5 animate-spin-reverse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">全局设置与 API 配置中心</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  自动持久化存储
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                在此集中配置大模型、Google AI 搜索、AI 生图与海外订阅源，全流程无需触碰代码或 .env
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-white flex gap-3 pt-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('llm')}
            className={`pb-2.5 px-3 text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'llm'
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>01. 大模型与 Google AI 搜索</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`pb-2.5 px-3 text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'image'
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>02. AI 生图与配图引擎</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sources')}
            className={`pb-2.5 px-3 text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'sources'
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>03. 海外定向信源监控</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wechat')}
            className={`pb-2.5 px-3 text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'wechat'
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>04. 微信发布矩阵偏好</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/30">
          {/* TAB 1: LLM & Google Search */}
          {activeTab === 'llm' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2.5">选择大模型服务商：</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PROVIDER_METADATA.map((p) => {
                    const isSelected = formData.provider === p.provider;
                    return (
                      <button
                        key={p.provider}
                        type="button"
                        onClick={() => handleProviderSelect(p.provider)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            {p.provider === 'gemini' && <Sparkles className="w-4 h-4 text-amber-500" />}
                            {p.provider === 'siliconflow' && <Zap className="w-4 h-4 text-indigo-500" />}
                            {p.provider === 'openai_compatible' && <Cpu className="w-4 h-4 text-slate-600" />}
                            <span>{p.name.split('(')[0]}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* API Key & Base URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-slate-400" />
                      <span>{currentProviderMeta.name.split('(')[0]} API Key</span>
                    </label>
                    <a
                      href={currentProviderMeta.apiDocsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <span>获取 Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder={currentProviderMeta.apiKeyPlaceholder}
                      className="w-full px-3.5 py-2.5 pr-10 text-sm font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    API Base URL (接口基地址)
                  </label>
                  <input
                    type="text"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                    placeholder={currentProviderMeta.defaultBaseUrl}
                    className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Model Selection */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800">
                    主调用模型 (Primary Model)：
                  </label>
                  <span className="text-xs text-slate-400">点击下方推荐模型快速填充</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentProviderMeta.recommendedModels.map((m) => {
                    const isSelected = formData.model === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, model: m.id })}
                        className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-mono transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{m.id}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-white text-slate-500'
                          }`}
                        >
                          {m.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="自定义模型名称，例如 gemini-3.8-flash 或 deepseek-ai/DeepSeek-V3"
                  className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Google AI Search Grounding Card */}
              <div className="p-4 bg-linear-to-r from-amber-50/60 to-amber-100/40 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-amber-950 flex items-center gap-2">
                        <span>Google AI 搜索与联网检索 (Google Search Grounding)</span>
                        <span className="text-xs px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold">
                          官方原生
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-amber-800/80 mt-0.5 leading-relaxed">
                        启用后，在抓取 Reddit 热门贴、Twitter KOL 发帖与行业突发情报时，Gemini 实时调用 Google 全网索引，杜绝 AI 凭空捏造。
                      </p>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={formData.googleSearchEnabled !== false}
                      onChange={(e) =>
                        setFormData({ ...formData, googleSearchEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {formData.googleSearchEnabled !== false && (
                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-sm">
                    <span className="text-amber-900 font-semibold text-xs sm:text-sm">搜索时间新鲜度范围：</span>
                    <div className="flex gap-2">
                      {(['day', 'week', 'month'] as const).map((recency) => (
                        <button
                          key={recency}
                          type="button"
                          onClick={() => setFormData({ ...formData, googleSearchRecency: recency })}
                          className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-all ${
                            (formData.googleSearchRecency || 'week') === recency
                              ? 'bg-amber-600 text-white font-bold shadow-2xs'
                              : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          {recency === 'day' ? '过去 24 小时' : recency === 'week' ? '过去 7 天 (推荐)' : '过去 1 个月'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stage-Specific Models Accordion */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span>分工序专精模型覆盖（选填，留空则默认统一使用主模型）：</span>
                  <span className="text-xs text-slate-400">大模型矩阵打法</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-700 block">01. 选题策划与逆向发问</span>
                    <input
                      type="text"
                      value={formData.stageModels?.plannerModel || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stageModels: { ...formData.stageModels, plannerModel: e.target.value },
                        })
                      }
                      placeholder="跟随主模型"
                      className="w-full px-2.5 py-2 text-xs sm:text-sm font-mono border border-slate-200 rounded-md bg-white"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-700 block">02. 深度特稿长文撰写</span>
                    <input
                      type="text"
                      value={formData.stageModels?.writerModel || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stageModels: { ...formData.stageModels, writerModel: e.target.value },
                        })
                      }
                      placeholder="跟随主模型"
                      className="w-full px-2.5 py-2 text-xs sm:text-sm font-mono border border-slate-200 rounded-md bg-white"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-700 block">03. 去AI味润色与人设</span>
                    <input
                      type="text"
                      value={formData.stageModels?.humanizerModel || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stageModels: { ...formData.stageModels, humanizerModel: e.target.value },
                        })
                      }
                      placeholder="跟随主模型"
                      className="w-full px-2.5 py-2 text-xs sm:text-sm font-mono border border-slate-200 rounded-md bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Image Generation */}
          {activeTab === 'image' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2.5">选择视觉配图与封面生成引擎：</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'gemini',
                      name: 'Google Imagen 3',
                      desc: '官方旗舰写实无AI塑料味，光影与质感顶级',
                      model: 'imagen-3.0-generate-002',
                    },
                    {
                      id: 'siliconflow_flux',
                      name: 'SiliconFlow FLUX.1',
                      desc: '开源生图最强王者，结构细节精准，速度极快',
                      model: 'black-forest-labs/FLUX.1-schnell',
                    },
                    {
                      id: 'prompt_only',
                      name: '仅生成专业提示词',
                      desc: '不调用外部生图 API，仅为正文配图生成中英双语提示词',
                      model: 'prompt_generator',
                    },
                  ].map((imgProv) => {
                    const isSelected =
                      formData.imageProvider === imgProv.id ||
                      (imgProv.id === 'siliconflow_flux' && formData.imageProvider === 'siliconflow');
                    return (
                      <button
                        key={imgProv.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            imageProvider: imgProv.id as any,
                            imageModel: imgProv.model,
                          })
                        }
                        className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-slate-900">{imgProv.name}</div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{imgProv.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.imageProvider !== 'prompt_only' && (
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        生图模型标识 (Image Model)
                      </label>
                      <input
                        type="text"
                        value={formData.imageModel}
                        onChange={(e) => setFormData({ ...formData, imageModel: e.target.value })}
                        placeholder="例如 imagen-3.0-generate-002 或 black-forest-labs/FLUX.1-schnell"
                        className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-bold text-slate-800">生图专用 API Key（选填）</label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageApiKey: formData.apiKey })}
                          className="text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          同大模型 Key
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showImageApiKey ? 'text' : 'password'}
                          value={formData.imageApiKey || ''}
                          onChange={(e) => setFormData({ ...formData, imageApiKey: e.target.value })}
                          placeholder="留空则自动复用大模型配置的 API Key"
                          className="w-full px-3.5 py-2.5 pr-10 text-sm font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowImageApiKey(!showImageApiKey)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showImageApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Overseas Sourcing & Subscriptions */}
          {activeTab === 'sources' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Section 1: Apify Social Scraper Engine Config */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border border-indigo-200/80 rounded-xl space-y-3.5 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      <span>Apify 全球社媒自动化采掘引擎 (Twitter & Reddit 增强)</span>
                      <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                        全网免登录采掘
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      通过 Apify 官方云端 Actor 检索 Twitter 全球长推与高赞 Reddit 实操讨论，每月赠送 $5 免费额度（可抓取上万条一手干货）。
                    </p>
                  </div>
                  <a
                    href="https://console.apify.com/account/integrations"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline shrink-0"
                  >
                    <span>获取免费 Token</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">
                    Apify API Token (可在 Apify Console 免费获取)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApifyToken ? 'text' : 'password'}
                        value={formData.apifyToken || ''}
                        onChange={(e) => setFormData({ ...formData, apifyToken: e.target.value })}
                        placeholder="apify_api_..."
                        className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApifyToken(!showApifyToken)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showApifyToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleTestApify}
                      disabled={apifyTestStatus === 'testing'}
                      className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shrink-0 shadow-2xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${apifyTestStatus === 'testing' ? 'animate-spin' : ''}`} />
                      <span>{apifyTestStatus === 'testing' ? '正在连接...' : '测试 Apify 连通性'}</span>
                    </button>
                  </div>
                </div>

                {/* Apify Test Feedback Banner */}
                {apifyTestStatus !== 'idle' && (
                  <div
                    className={`p-3 rounded-lg text-xs sm:text-sm flex items-start gap-2 border ${
                      apifyTestStatus === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : apifyTestStatus === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                    }`}
                  >
                    {apifyTestStatus === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : apifyTestStatus === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{apifyTestMessage}</div>
                      {apifyTestLatency && (
                        <div className="text-xs opacity-80 mt-0.5">响应耗时: {apifyTestLatency}ms</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Twitter / X Keyword & Trend Search */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-sky-500" />
                      <span>Twitter / X 全网趋势与关键词采掘 (按主题检索，不限固定博主)</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      系统将使用这些关键词对推特全网进行深潜挖掘，精准捕获带有真实 MRR、Stripe 账本或配置命令的爆款长推
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        twitterSearchKeywords: DEFAULT_MODEL_CONFIG.twitterSearchKeywords,
                      })
                    }
                    className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>恢复推荐关键词</span>
                  </button>
                </div>

                {/* Twitter Keyword Tags */}
                <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[48px]">
                  {(formData.twitterSearchKeywords || DEFAULT_MODEL_CONFIG.twitterSearchKeywords || []).map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-mono bg-white border border-sky-200 text-sky-900 shadow-2xs"
                    >
                      <Search className="w-3 h-3 text-sky-500" />
                      <span className="font-semibold">{kw}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTwitterKeyword(kw)}
                        className="text-slate-400 hover:text-rose-500 ml-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Twitter Keyword Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-sm font-mono text-slate-400">#</span>
                    <input
                      type="text"
                      value={newTwitterKeyword}
                      onChange={(e) => setNewTwitterKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTwitterKeyword())}
                      placeholder="输入推特全网搜索词，如 #buildinpublic MRR、LocalLLaMA tutorial、solid state battery"
                      className="w-full pl-7 pr-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTwitterKeyword}
                    className="px-4 py-2 text-sm font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>添加关键词</span>
                  </button>
                </div>
              </div>

              {/* Section 3: Reddit Subreddits Manager */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>Reddit 重点监控社区板块 (Subreddits)</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      直连 Reddit 实时高赞 API，监控海外极客与出海社群的一手实战避坑与营收复盘
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        customSubreddits: DEFAULT_MODEL_CONFIG.customSubreddits,
                      })
                    }
                    className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>恢复推荐列表</span>
                  </button>
                </div>

                {/* Subreddit Tags */}
                <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[48px]">
                  {(formData.customSubreddits || DEFAULT_MODEL_CONFIG.customSubreddits || []).map((sub) => (
                    <span
                      key={sub}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-mono bg-white border border-orange-200 text-orange-950 shadow-2xs"
                    >
                      <span className="text-orange-600 font-bold">r/</span>
                      <span className="font-semibold">{sub.replace(/^r\//, '')}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubreddit(sub)}
                        className="text-slate-400 hover:text-rose-500 ml-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Subreddit Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-sm font-mono text-slate-400">r/</span>
                    <input
                      type="text"
                      value={newSubreddit}
                      onChange={(e) => setNewSubreddit(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubreddit())}
                      placeholder="输入 Subreddit 英文名，如 SaaS、solopreneur、LearnMachineLearning"
                      className="w-full pl-7 pr-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSubreddit}
                    className="px-4 py-2 text-sm font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>添加板块</span>
                  </button>
                </div>
              </div>

              {/* Section 4: Curated Free Global RSS Feeds */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <span>精选全球高质量 RSS 免费订阅源 (10大精选源 · 免 API Key 完全免费)</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      无需配置任何 Token 或付费账号，系统每次刷新自动并发拉取并由大模型推理筛选
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    10 个订阅源活跃
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {PRESET_RSS_FEEDS.map((feed) => (
                    <div
                      key={feed.id}
                      className="p-3 bg-slate-50/70 border border-slate-200/90 rounded-lg flex items-start gap-3 hover:border-slate-300 transition-all"
                    >
                      <span className="text-xl p-1 bg-white rounded-md border border-slate-200/80 shadow-2xs shrink-0">
                        {feed.icon || '📰'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {feed.name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            免Key直连
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {feed.description}
                        </p>
                        <div className="text-[11px] font-mono text-slate-400 truncate mt-1">
                          {feed.url}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WeChat Publishing Preferences */}
          {activeTab === 'wechat' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Default Slot Count (1, 3, or 5 articles) */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5">
                  默认公众号推送栏位规模 (Matrix Push Scale)：
                </label>
                <p className="text-xs sm:text-sm text-slate-500 mb-3">
                  设定每天批量生成的文章数量与生态位分配，支持单篇深打或多篇组合矩阵打法。
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      count: 1,
                      title: '单篇深度特稿 (1篇)',
                      badge: '专注单点破圈',
                      badgeColor: 'bg-amber-100 text-amber-900',
                      desc: '仅生成一篇 4000~6000 字头条爆款，集中火力算透利益反差与全网关注点。',
                    },
                    {
                      count: 3,
                      title: '三联包矩阵 (3篇·推荐)',
                      badge: '黄金标准组合',
                      badgeColor: 'bg-indigo-100 text-indigo-900',
                      desc: '头条 (破圈算账) + 次条 (极客SOP) + 三条 (避坑备忘清单)，覆盖全圈层读者。',
                    },
                    {
                      count: 5,
                      title: '全天候大矩阵 (5篇·高阶)',
                      badge: '大厂矩阵打法',
                      badgeColor: 'bg-purple-100 text-purple-900',
                      desc: '头条 + 次条 + 三条 + 四条 (海外速评) + 五条 (开源效率神器)，全方位霸榜。',
                    },
                  ].map((slot) => {
                    const isSelected = (formData.defaultSlotCount || 3) === slot.count;
                    return (
                      <button
                        key={slot.count}
                        type="button"
                        onClick={() => setFormData({ ...formData, defaultSlotCount: slot.count as any })}
                        className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm sm:text-base font-bold text-slate-900">{slot.title}</span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${slot.badgeColor} inline-block mb-1.5`}>
                            {slot.badge}
                          </span>
                          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{slot.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Default Persona */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <label className="block text-sm font-bold text-slate-800">
                  默认写作人设 (Default Persona)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {STYLE_PERSONAS.map((persona) => {
                    const isSelected = (formData.personaId || STYLE_PERSONAS[0].id) === persona.id;
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, personaId: persona.id })}
                        className={`p-3.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 font-bold'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-sm font-bold text-slate-900">{persona.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{persona.tagline}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Temperature & Token Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <label className="font-bold text-slate-700">创意发散度 (Temperature): {formData.temperature}</label>
                    <span className="text-slate-400 text-xs">长文特稿建议 0.35</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <label className="font-bold text-slate-700">单次最大 Token 限制</label>
                    <span className="text-slate-400 text-xs">4000~6000字建议 8192 或以上</span>
                  </div>
                  <input
                    type="number"
                    min="2048"
                    max="32768"
                    step="1024"
                    value={formData.maxTokens || 8192}
                    onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Connection Test Result Box */}
          {testStatus !== 'idle' && (
            <div
              className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
                testStatus === 'testing'
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : testStatus === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testStatus === 'testing' && <RefreshCw className="w-5 h-5 animate-spin text-slate-500 shrink-0 mt-0.5" />}
              {testStatus === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              {testStatus === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
              <div className="flex-1">
                <div className="font-bold mb-1">
                  {testStatus === 'testing' && (testWithSearch ? '正在测试 Google AI 搜索联网检索...' : '正在测试 API 连通性...')}
                  {testStatus === 'success' && `连接测试成功！耗时: ${testLatency}ms`}
                  {testStatus === 'error' && '连接测试未通过'}
                </div>
                <div className="text-xs sm:text-sm leading-relaxed">{testMessage}</div>
              </div>
            </div>
          )}

          {/* Success Save Notice */}
          {saveSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{saveSuccessMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTestConnection(false)}
              disabled={testStatus === 'testing'}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${testStatus === 'testing' && !testWithSearch ? 'animate-spin' : ''}`} />
              <span>测试 API 连通</span>
            </button>

            {formData.provider === 'gemini' && (
              <button
                type="button"
                onClick={() => handleTestConnection(true)}
                disabled={testStatus === 'testing'}
                className="px-4 py-2 text-sm font-semibold text-amber-800 bg-amber-50 border border-amber-300 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Search className={`w-4 h-4 ${testStatus === 'testing' && testWithSearch ? 'animate-spin' : ''}`} />
                <span>测试 Google 搜索</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1 font-medium"
            >
              恢复默认
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSaving}
              className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-md shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isSaving ? '正在保存...' : '保存全局配置'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
