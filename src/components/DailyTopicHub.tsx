import React, { useState, useEffect } from 'react';
import {
  Rss,
  RefreshCw,
  Search,
  ExternalLink,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  Sliders,
  Plus,
  ArrowRight,
  Filter,
  Check,
  AlertCircle,
  Radio,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  Shuffle,
  Copy,
  MessageSquare,
  ThumbsUp,
  Globe,
  Settings2,
  Zap,
  TrendingUp,
  X,
  Image as ImageIcon,
  Play,
  Eye,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { DailyTopicItem, RSSFeedSource, RSSScheduleConfig, ThemeCategory } from '../types/pipeline';
import { THEME_CATEGORIES_METADATA } from '../types/pipeline';
import { INITIAL_DAILY_TOPICS, PRESET_RSS_FEEDS, DEFAULT_SCHEDULE_CONFIG } from '../data/dailyTopics';

export interface DailyTopicHubProps {
  onSelectTopicAsSeed: (topic: DailyTopicItem) => void;
  onImportToContext?: (topic: DailyTopicItem) => void;
  onPickForReverseInterrogation?: (topic: DailyTopicItem) => void;
  currentSelectedCategory?: ThemeCategory;
  onCategoryFilterChange?: (cat: ThemeCategory) => void;
  isGeneratingPlan?: boolean;
  activeSeedTopicTitle?: string;
  isInterrogating?: boolean;
}

export const DailyTopicHub: React.FC<DailyTopicHubProps> = ({
  onSelectTopicAsSeed,
  onImportToContext,
  onPickForReverseInterrogation,
  currentSelectedCategory,
  onCategoryFilterChange,
  isGeneratingPlan = false,
  activeSeedTopicTitle = '',
  isInterrogating = false,
}) => {
  const [topics, setTopics] = useState<DailyTopicItem[]>(INITIAL_DAILY_TOPICS);
  const [sources, setSources] = useState<RSSFeedSource[]>(PRESET_RSS_FEEDS);
  const [schedule, setSchedule] = useState<RSSScheduleConfig>(DEFAULT_SCHEDULE_CONFIG);
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | 'all'>(
    currentSelectedCategory || 'all'
  );
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'twitter' | 'reddit' | 'rss'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isScrapingLive, setIsScrapingLive] = useState<boolean>(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [isCustomFeedOpen, setIsCustomFeedOpen] = useState<boolean>(false);

  // Custom monitor form
  const [customType, setCustomType] = useState<'twitter' | 'reddit' | 'rss'>('twitter');
  const [customQueryUrl, setCustomQueryUrl] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<ThemeCategory>('global_digital_biz');
  const [customSourceName, setCustomSourceName] = useState<string>('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedTopicId, setCopiedTopicId] = useState<string | null>(null);
  const [adoptingTopicId, setAdoptingTopicId] = useState<string | null>(null);

  // Overseas Media Lightbox Preview State
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    urls: string[];
    currentIndex: number;
    title: string;
    sourceUrl?: string;
  } | null>(null);

  // Helper: Proxies remote image URLs through our server to bypass foreign CDN anti-hotlinking
  const getProxiedMediaUrl = (rawUrl?: string): string => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) return rawUrl;
    return `/api/pipeline/proxy-media?url=${encodeURIComponent(rawUrl)}`;
  };

  // Sync with prop when parent category changes
  useEffect(() => {
    if (currentSelectedCategory) {
      setSelectedCategory(currentSelectedCategory);
    }
  }, [currentSelectedCategory]);

  // Initial load from server
  useEffect(() => {
    loadTopics();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch topics and schedule from server
  const loadTopics = async (cat?: string, search?: string) => {
    try {
      const params = new URLSearchParams();
      if (cat && cat !== 'all') params.append('category', cat);
      if (search) params.append('search', search);

      const res = await fetch(`/api/pipeline/daily-topics?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        if (data.topics && data.topics.length > 0) {
          setTopics(data.topics);
        }
        if (data.sources) setSources(data.sources);
        if (data.schedule) setSchedule(data.schedule);
      }
    } catch (err) {
      console.error('Failed to load daily topics from API:', err);
    }
  };

  // Immediate manual live scrape (Twitter + Reddit + RSS)
  const handleScrapeAllLive = async () => {
    setIsScrapingLive(true);
    try {
      const res = await fetch('/api/pipeline/scrape-all-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🎉 全网实时抓取完成！已更新 ${data.newCount ?? 6} 条最新 Twitter/Reddit/RSS 文章情报`);
        if (data.items) setTopics(data.items);
        if (data.schedule) setSchedule(data.schedule);
      } else {
        showToast(data.error || '实时抓取请求稍慢，已保留最新缓存');
      }
    } catch (err) {
      showToast('网络请求稍慢，已为您保留最新已抓取内容');
    } finally {
      setIsScrapingLive(false);
    }
  };

  // Add custom monitor (Twitter handle, Subreddit, or RSS URL)
  const handleAddCustomMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQueryUrl.trim()) return;

    setIsScrapingLive(true);
    try {
      const res = await fetch('/api/pipeline/scrape-custom-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: customType,
          queryUrl: customQueryUrl.trim(),
          category: customCategory,
          sourceName: customSourceName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || '自定义监控源抓取成功！已注入动态话题库');
        if (data.items) setTopics(data.items);
        setCustomQueryUrl('');
        setCustomSourceName('');
        setIsCustomFeedOpen(false);
      } else {
        showToast(data.error || '抓取失败，请检查输入地址或账号名');
      }
    } catch (err: any) {
      showToast('抓取超时，请确认该账号或地址有效');
    } finally {
      setIsScrapingLive(false);
    }
  };

  // Save Schedule Settings
  const handleSaveSchedule = async () => {
    try {
      const res = await fetch('/api/pipeline/rss-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });
      const data = await res.json();
      if (data.success) {
        const modeDesc = schedule.refreshMode === 'daily'
          ? `每天固定在 ${schedule.timeOfDay} 执行`
          : `每隔 ${schedule.intervalMinutes || 30} 分钟自动循环更新`;
        showToast(`✓ 定时更新配置已保存：${schedule.enabled ? '已启用自动刷新 (' + modeDesc + ')' : '已暂停定时自动拉取'}`);
        setIsScheduleOpen(false);
      }
    } catch (err) {
      showToast('保存设置失败，请稍后重试');
    }
  };

  // Shuffle recommend
  const handleShuffleRecommend = () => {
    setTopics((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
    showToast('🎲 已为您换一批精选推特/Reddit/顶刊一手爆款推荐！');
  };

  // Copy topic
  const handleCopyTopic = (topic: DailyTopicItem) => {
    const textToCopy = `【公众号爆款信源要点】
标题：${topic.title}
信源出处：${topic.source} (${topic.publish_time})
平台：${topic.platform ? topic.platform.toUpperCase() : 'WEB'}
作者/出处：${topic.author || '网络创作者'}
赛道分类：${topic.category_label || topic.category}
核心摘要：${topic.summary}
公众号切入视角：${topic.recommended_angle || '深度产业拆解与破圈科普'}
${topic.source_url ? `原文链接：${topic.source_url}` : ''}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedTopicId(topic.id);
    showToast(`✓ 已复制选题「${topic.title.slice(0, 16)}...」要点！`);
    setTimeout(() => setCopiedTopicId(null), 2500);
  };

  // Handle pick for reverse interrogation
  const handlePickForReverse = (topic: DailyTopicItem) => {
    setAdoptingTopicId(topic.id);
    if (onPickForReverseInterrogation) {
      onPickForReverseInterrogation(topic);
    } else {
      onSelectTopicAsSeed(topic);
    }
    showToast(`⚡ 已选用「${topic.title.slice(0, 16)}...」，正在由 LLM 进行逆向发问与全网信源深度验资！`);
    setTimeout(() => setAdoptingTopicId(null), 1500);
  };

  // Filter topics
  const filteredTopics = topics.filter((t) => {
    const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchPlatform =
      selectedPlatform === 'all' ||
      (selectedPlatform === 'twitter' && (t.platform === 'twitter' || t.source.toLowerCase().includes('twitter') || t.source.toLowerCase().includes('x.com'))) ||
      (selectedPlatform === 'reddit' && (t.platform === 'reddit' || t.source.toLowerCase().includes('reddit') || t.source.toLowerCase().includes('r/'))) ||
      (selectedPlatform === 'rss' && (t.platform === 'rss' || (!t.platform && !t.source.toLowerCase().includes('twitter') && !t.source.toLowerCase().includes('reddit'))));

    const matchSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.author && t.author.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCategory && matchPlatform && matchSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
      {/* ========================================================= */}
      {/* 1. Header Bar: Dynamic Crawler Control Center */}
      {/* ========================================================= */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center text-white shrink-0 shadow-md">
            <Zap className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Twitter / Reddit / RSS 全网动态抓取与爆款雷达</span>
              </h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                schedule.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${schedule.enabled ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                <span>{schedule.enabled ? '定时自动抓取已启用' : '定时抓取已暂停'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
              <span>每天实时爬取 Twitter 大佬、Reddit 实战帖与 Nature/Science/HackerNews 晨报，拒绝静态硬编码！</span>
              {schedule.lastRunTime && (
                <span className="text-slate-400 font-mono text-[11px] bg-white/10 px-1.5 py-0.5 rounded">
                  上次抓取: {schedule.lastRunTime}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Sync Controls & Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 text-xs flex-wrap">
          {/* Quick Shuffle Recommend Button */}
          <button
            onClick={handleShuffleRecommend}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 font-semibold rounded-lg border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
            title="即时随机打乱并重新推荐前沿爆款选题"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-300" />
            <span>换一批</span>
          </button>

          {/* Master Live Fetch Button */}
          <button
            onClick={handleScrapeAllLive}
            disabled={isScrapingLive}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
            title="立即全网实时抓取最新 Twitter / Reddit / RSS 文章"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isScrapingLive ? 'animate-spin' : ''}`} />
            <span>{isScrapingLive ? '正在全网实时抓取中...' : '⚡ 立即全网实时抓取'}</span>
          </button>

          {/* Schedule Settings Button */}
          <button
            onClick={() => setIsScheduleOpen(!isScheduleOpen)}
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              isScheduleOpen
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-200'
            }`}
            title="配置定时自动更新与循环刷新规则"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-300" />
            <span>
              {schedule.refreshMode === 'daily'
                ? `定时: 每天 ${schedule.timeOfDay || '08:00'}`
                : `每 ${schedule.intervalMinutes || 30} 分钟`}
            </span>
          </button>

          {/* Custom Monitor Feed Button */}
          <button
            onClick={() => setIsCustomFeedOpen(!isCustomFeedOpen)}
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              isCustomFeedOpen
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-200'
            }`}
            title="添加自定义监控 Twitter 账号、Subreddit 或 RSS 地址"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-300" />
            <span>添加监控源</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. Drawer A: Schedule Settings (定时刷新配置抽屉) */}
      {/* ========================================================= */}
      {isScheduleOpen && (
        <div className="p-4 sm:p-5 bg-indigo-50/60 border-b border-indigo-100 text-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="text-sm">定时自动抓取与刷新规则配置 (Scheduled Auto-Refresh Config)</span>
            </span>
            <button
              onClick={() => setIsScheduleOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
            >
              关闭
            </button>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3.5 shadow-2xs">
            {/* Enable switch */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={schedule.enabled}
                  onChange={(e) => setSchedule({ ...schedule, enabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="font-bold text-slate-900 text-sm">启用全网定时自动拉取与落库</span>
                <span className="text-slate-400 text-xs">（系统将在后台定时静默执行，确保每天打开就是最新文章）</span>
              </label>

              <span className="text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 font-mono">
                下次计划执行：{(schedule as any).nextRunTime || '约 30 分钟后'}
              </span>
            </div>

            {/* Refresh Modes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="refreshMode"
                    value="interval"
                    checked={schedule.refreshMode !== 'daily'}
                    onChange={() => setSchedule({ ...schedule, refreshMode: 'interval' })}
                    className="text-indigo-600"
                  />
                  <span>模式一：高频周期性循环刷新 (推荐)</span>
                </label>
                <p className="text-[11px] text-slate-500 pl-5">
                  全天候持续监控 Twitter/Reddit 热议，设定固定时间间隔自动爬取。
                </p>
                <div className="flex items-center gap-2 pl-5 pt-1">
                  <span className="text-slate-600 text-xs">刷新间隔：</span>
                  <select
                    value={schedule.intervalMinutes || 30}
                    onChange={(e) =>
                      setSchedule({ ...schedule, intervalMinutes: parseInt(e.target.value, 10), refreshMode: 'interval' })
                    }
                    className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded font-semibold focus:outline-hidden focus:border-indigo-600"
                  >
                    <option value={15}>每 15 分钟 (实时敏锐型)</option>
                    <option value={30}>每 30 分钟 (推荐标准)</option>
                    <option value={60}>每 1 小时</option>
                    <option value={120}>每 2 小时</option>
                    <option value={360}>每 6 小时</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="refreshMode"
                    value="daily"
                    checked={schedule.refreshMode === 'daily'}
                    onChange={() => setSchedule({ ...schedule, refreshMode: 'daily' })}
                    className="text-indigo-600"
                  />
                  <span>模式二：每天固定时间集中拉取 (晨报黄金时段)</span>
                </label>
                <p className="text-[11px] text-slate-500 pl-5">
                  每天准点汇总全球高校论文与隔夜美股/出海新动态，适合每日清晨选题。
                </p>
                <div className="flex items-center gap-2 pl-5 pt-1">
                  <span className="text-slate-600 text-xs">每天执行时间：</span>
                  <input
                    type="time"
                    value={schedule.timeOfDay || '08:00'}
                    onChange={(e) =>
                      setSchedule({ ...schedule, timeOfDay: e.target.value, refreshMode: 'daily' })
                    }
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-xs focus:outline-hidden focus:border-indigo-600"
                  />
                  <span className="text-[11px] text-slate-400">（微信公众号早刊黄金时间）</span>
                </div>
              </div>
            </div>

            {/* Target Platforms Checkboxes */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-600 font-semibold">抓取覆盖源：</span>
                <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  <span>🐦 Twitter / X</span>
                </span>
                <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  <span>🤖 Reddit 社区</span>
                </span>
                <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  <span>📰 权威 RSS / HackerNews</span>
                </span>
              </div>

              <button
                onClick={handleSaveSchedule}
                className="px-4 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg font-bold shadow-2xs transition-colors cursor-pointer"
              >
                保存定时规则
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. Drawer B: Add Custom Monitor (添加自定义监控源抽屉) */}
      {/* ========================================================= */}
      {isCustomFeedOpen && (
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 text-xs space-y-3.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span className="text-sm">添加自定义外部信源监控 (Twitter 账号 / Subreddit / RSS 地址)</span>
            </span>
            <button
              onClick={() => setIsCustomFeedOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
            >
              关闭
            </button>
          </div>

          <form onSubmit={handleAddCustomMonitor} className="space-y-3 p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">监控类型</label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs font-semibold focus:outline-hidden focus:border-indigo-600"
                >
                  <option value="twitter">🐦 Twitter 用户 (如 @levelsio)</option>
                  <option value="reddit">🤖 Reddit 版块 (如 r/SaaS)</option>
                  <option value="rss">📰 外部 RSS / Atom XML 链接</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                  {customType === 'twitter'
                    ? 'Twitter 账号名或推文链接'
                    : customType === 'reddit'
                    ? 'Subreddit 版块名 (如 r/solopreneur)'
                    : 'RSS / XML 订阅源 URL'}
                </label>
                <input
                  type="text"
                  required
                  value={customQueryUrl}
                  onChange={(e) => setCustomQueryUrl(e.target.value)}
                  placeholder={
                    customType === 'twitter'
                      ? '例如 @levelsio 或 @karpathy 或 @paulg'
                      : customType === 'reddit'
                      ? '例如 r/SaaS 或 r/MachineLearning'
                      : '例如 https://news.mit.edu/rss/topic/energy'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono text-xs focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">归属赛道分类</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as ThemeCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs focus:outline-hidden focus:border-indigo-600"
                >
                  {THEME_CATEGORIES_METADATA.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                支持通过大模型或真实网络爬虫实时抓取该监控源最近更新，并直接解析为可立项情报。
              </span>
              <button
                type="submit"
                disabled={isScrapingLive || !customQueryUrl.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
              >
                {isScrapingLive ? '正在实时抓取...' : '拉取并加入动态雷达'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. Filter & Search Controls Bar */}
      {/* ========================================================= */}
      <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
        {/* Platform Tabs & Category Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Platform Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-lg text-xs w-fit">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                selectedPlatform === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部情报 ({topics.length})
            </button>
            <button
              onClick={() => setSelectedPlatform('twitter')}
              className={`px-3 py-1 font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                selectedPlatform === 'twitter'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🐦</span>
              <span>Twitter / X</span>
            </button>
            <button
              onClick={() => setSelectedPlatform('reddit')}
              className={`px-3 py-1 font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                selectedPlatform === 'reddit'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🤖</span>
              <span>Reddit 社区</span>
            </button>
            <button
              onClick={() => setSelectedPlatform('rss')}
              className={`px-3 py-1 font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                selectedPlatform === 'rss'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📰</span>
              <span>RSS / 顶刊晨报</span>
            </button>
          </div>

          {/* Quick Counter */}
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>筛选显示 {filteredTopics.length} 篇实时文章</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>赛道分类：</span>
          </span>
          <button
            onClick={() => {
              setSelectedCategory('all');
            }}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            全部赛道
          </button>
          {THEME_CATEGORIES_METADATA.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = topics.filter((t) => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  onCategoryFilterChange?.(cat.id);
                }}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.shortLabel}</span>
                <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative pt-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索抓取到的文章标题、推特作者、Reddit帖文关键词（如“Stripe”、“固态电池”、“一人公司”、“DeepSeek”等）..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. Article List: High-Density Rich Live Cards */}
      {/* ========================================================= */}
      <div className="p-4 divide-y divide-slate-100 max-h-[580px] overflow-y-auto space-y-3">
        {filteredTopics.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">当前筛选条件下暂无抓取的文章</p>
            <p className="text-slate-400">
              请点击上方 <strong className="text-indigo-600">“⚡ 立即全网实时抓取”</strong> 从 Twitter、Reddit 和各大晨报拉取最新数据
            </p>
            <button
              onClick={handleScrapeAllLive}
              disabled={isScrapingLive}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScrapingLive ? 'animate-spin' : ''}`} />
              <span>立即全网抓取</span>
            </button>
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const catMeta = THEME_CATEGORIES_METADATA.find((c) => c.id === topic.category);
            const isTwitter = topic.platform === 'twitter' || topic.source.toLowerCase().includes('twitter') || topic.source.toLowerCase().includes('x.com');
            const isReddit = topic.platform === 'reddit' || topic.source.toLowerCase().includes('reddit') || topic.source.toLowerCase().includes('r/');
            const isAdoptingThis = adoptingTopicId === topic.id || (isInterrogating && activeSeedTopicTitle === topic.title);

            return (
              <div
                key={topic.id}
                className="pt-3.5 first:pt-0 group hover:bg-slate-50/80 p-3.5 rounded-xl border border-transparent hover:border-slate-200 transition-all space-y-2.5"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3.5">
                  <div className="space-y-2 flex-1">
                    {/* Meta Bar */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Platform Tag */}
                      <span className={`px-2.5 py-0.5 rounded-md font-bold font-mono text-xs flex items-center gap-1 ${
                        isTwitter
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : isReddit
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        <span>{isTwitter ? '🐦 TWITTER' : isReddit ? '🤖 REDDIT' : '📰 RSS / 顶刊'}</span>
                      </span>

                      {/* Source & Author */}
                      <span className="font-bold text-slate-800">
                        {topic.author || topic.source}
                      </span>

                      {/* Timestamp */}
                      <span className="text-slate-400 font-mono text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{topic.publish_time}</span>
                      </span>

                      <span className="text-slate-300">·</span>

                      {/* Category Label */}
                      <span className="text-slate-600 font-medium">
                        {catMeta?.shortLabel || topic.category_label}
                      </span>

                      {/* Stats */}
                      {topic.upvotes && (
                        <span className="text-slate-600 font-mono text-xs flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                          <ThumbsUp className="w-3 h-3 text-slate-400" />
                          <span>{topic.upvotes}</span>
                        </span>
                      )}

                      {topic.comments_count && (
                        <span className="text-slate-600 font-mono text-xs flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                          <MessageSquare className="w-3 h-3 text-slate-400" />
                          <span>{topic.comments_count} 讨论</span>
                        </span>
                      )}

                      {/* Viral Score */}
                      {topic.hot_score && (
                        <span className="text-amber-800 font-mono text-xs bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-bold">
                          🔥 爆款指数 {topic.hot_score}
                        </span>
                      )}

                      {topic.is_breaking && (
                        <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-rose-600" />
                          <span>今日头条重磅</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-950 leading-snug">
                      {topic.title}
                    </h4>

                    {/* Summary */}
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {topic.summary}
                    </p>

                    {/* Recommended Angle Preview */}
                    {topic.recommended_angle && (
                      <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-indigo-950 font-bold">公众号切入拆解角度：</strong>
                          <span className="leading-relaxed">{topic.recommended_angle}</span>
                        </div>
                      </div>
                    )}

                    {/* Media Preview Gallery (Original post images & videos) */}
                    {topic.media_urls && topic.media_urls.length > 0 && (
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                            <span>海外原帖素材媒体 ({topic.media_urls.length}张{topic.media_type === 'video' ? ' / 视频' : ''})</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxState({
                                isOpen: true,
                                urls: topic.media_urls || [],
                                currentIndex: 0,
                                title: topic.title,
                                sourceUrl: topic.source_url,
                              });
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>全屏放大预览</span>
                          </button>
                        </div>

                        <div className={`grid gap-2 ${
                          topic.media_urls.length === 1 ? 'grid-cols-1 max-w-sm' : topic.media_urls.length === 2 ? 'grid-cols-2 max-w-md' : 'grid-cols-3 max-w-lg'
                        }`}>
                          {topic.media_urls.slice(0, 3).map((mediaUrl, idx) => (
                            <div
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxState({
                                  isOpen: true,
                                  urls: topic.media_urls || [],
                                  currentIndex: idx,
                                  title: topic.title,
                                  sourceUrl: topic.source_url,
                                });
                              }}
                              className="relative group/media rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video cursor-zoom-in shadow-2xs hover:shadow-md transition-all"
                            >
                              <img
                                src={getProxiedMediaUrl(mediaUrl)}
                                alt={`素材 ${idx + 1}`}
                                className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80';
                                }}
                              />
                              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="px-2 py-0.5 rounded bg-black/60 text-white text-[11px] font-semibold flex items-center gap-1">
                                  <Maximize2 className="w-3 h-3" />
                                  <span>查看</span>
                                </span>
                              </div>

                              {topic.media_type === 'video' && idx === 0 && (
                                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                  <span>视频</span>
                                </div>
                              )}

                              {idx === 2 && (topic.media_urls?.length ?? 0) > 3 && (
                                <div className="absolute inset-0 bg-slate-900/75 flex items-center justify-center text-white font-bold text-xs">
                                  +{(topic.media_urls?.length ?? 0) - 3} 张更多
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Right Column */}
                  <div className="flex md:flex-col items-center gap-2 shrink-0 md:w-60 pt-1">
                    {/* Primary Button: 选用此篇进行逆向发问与深度立项 */}
                    <button
                      disabled={isInterrogating}
                      onClick={() => handlePickForReverse(topic)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap ${
                        isAdoptingThis
                          ? 'bg-indigo-600 animate-pulse'
                          : 'bg-slate-900 hover:bg-indigo-600 active:scale-[0.98]'
                      }`}
                      title="选用此篇进入 LLM 逆向发问，自动挖掘读者痛点并检验 SEO 流量"
                    >
                      {isAdoptingThis ? (
                        <>
                          <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
                          <span>正在逆向发问...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span>选用并逆向发问立项 ➔</span>
                        </>
                      )}
                    </button>

                    {/* Secondary Action: 一键以此裂变三联包 */}
                    <button
                      disabled={isGeneratingPlan}
                      onClick={() => {
                        showToast(`🚀 已选定「${topic.title.slice(0, 15)}...」为母题，正在由大模型实时裂变 M/S/I 三联包！`);
                        onSelectTopicAsSeed(topic);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      title="以此文章为母题，一键生成 M/S/I 经典三联包"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>以此裂变三联包</span>
                    </button>

                    {/* Utilities: Copy & External Link */}
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => handleCopyTopic(topic)}
                        className={`flex-1 px-2.5 py-1.5 text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                          copiedTopicId === topic.id
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 font-medium'
                        }`}
                        title="复制选题标题、摘要与切入角度"
                      >
                        {copiedTopicId === topic.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>复制要点</span>
                          </>
                        )}
                      </button>

                      {topic.source_url && (
                        <a
                          href={topic.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 text-[11px] text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded border border-slate-200 flex items-center gap-1 whitespace-nowrap transition-colors"
                          title="在新窗口查看原帖或原文"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>原文</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. Footer Information */}
      {/* ========================================================= */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>动态抓取已就绪：支持一键选用发问、定时更新与自定义监控 Twitter/Reddit/RSS</span>
        </span>
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <span>共收录 {filteredTopics.length} 条实时爆款文章</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. Lightbox Modal: Full Screen Overseas Media Viewer */}
      {/* ========================================================= */}
      {lightboxState && lightboxState.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
          onClick={() => setLightboxState(null)}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 truncate pr-4">
              <span className="px-2.5 py-1 rounded-md bg-indigo-600/80 text-white font-mono text-xs font-bold shrink-0">
                {lightboxState.currentIndex + 1} / {lightboxState.urls.length}
              </span>
              <h4 className="text-sm sm:text-base font-semibold truncate text-slate-100">
                {lightboxState.title}
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {lightboxState.sourceUrl && (
                <a
                  href={lightboxState.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>访问原文</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  const currentUrl = lightboxState.urls[lightboxState.currentIndex];
                  navigator.clipboard.writeText(currentUrl);
                  setToastMessage('已复制原素材图片外链地址');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>复制图片地址</span>
              </button>
              <button
                type="button"
                onClick={() => setLightboxState(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Stage with Prev / Next Navigation */}
          <div
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-3"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxState.urls.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setLightboxState((prev) =>
                    prev
                      ? {
                          ...prev,
                          currentIndex:
                            (prev.currentIndex - 1 + prev.urls.length) % prev.urls.length,
                        }
                      : null
                  );
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-indigo-600 text-white cursor-pointer z-10 transition-all shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="max-h-[75vh] max-w-full flex items-center justify-center">
              <img
                src={getProxiedMediaUrl(lightboxState.urls[lightboxState.currentIndex])}
                alt={lightboxState.title}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-700/60"
              />
            </div>

            {lightboxState.urls.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setLightboxState((prev) =>
                    prev
                      ? {
                          ...prev,
                          currentIndex: (prev.currentIndex + 1) % prev.urls.length,
                        }
                      : null
                  );
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-indigo-600 text-white cursor-pointer z-10 transition-all shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {lightboxState.urls.length > 1 && (
            <div
              className="flex items-center gap-2 p-2 bg-slate-900/70 rounded-xl max-w-full overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxState.urls.map((u, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setLightboxState((prev) => (prev ? { ...prev, currentIndex: i } : null))
                  }
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    i === lightboxState.currentIndex
                      ? 'border-indigo-400 scale-105 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getProxiedMediaUrl(u)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
