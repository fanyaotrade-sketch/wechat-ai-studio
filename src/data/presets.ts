import type { DailyClusterPlan, DraftArticleOutput, StylePersona, SourceHarvestItem, ArticleArchiveItem } from '../types/pipeline.ts';
import { SOLID_STATE_BATTERY_PLAN, SOLID_STATE_BATTERY_ARTICLES, INITIAL_ARCHIVES } from './additionalPresets.ts';
export { SOLID_STATE_BATTERY_PLAN, SOLID_STATE_BATTERY_ARTICLES, INITIAL_ARCHIVES };

export const HARVESTED_SOURCES: SourceHarvestItem[] = [
  {
    id: 'src_solopreneur_contract_saas',
    category: 'global_digital_biz',
    platform: 'twitter',
    author: '@Marc_IndieDev (Twitter 独立开发者社区)',
    institution: 'X (Twitter) & Reddit r/SaaS 独立开发者实战',
    title: '一人公司实战：27岁独立开发者做基于 AI 自动审查商业合同的微型 SaaS，6个月做到 $32,000 月经常性收入 (MRR)',
    url: 'https://x.com/Marc_IndieDev/status/1782390123912',
    tags: ['一人公司', '微型SaaS', 'AI合同审查', 'MRR $32k', '出海合规'],
    summary: '推特与 Reddit r/SaaS 爆款实录：27岁独立开发者利用 LLM 做面向中小企业的轻量级商业合同自动风险审查工具，6个月积累 340 家付费客户，MRR 突破 3.2 万美元。但原帖只晒了数据与架构，读者极度渴望了解一人公司如何设立、国内还是海外公司更好、Stripe跨境资金合规与风控避坑。',
    raw_text: `6 months ago I was laid off from a legal-tech startup. Today my solo Micro-SaaS passed $32,000 MRR.
Tech Stack: Next.js + Tailwind + Supabase + Claude 3.5 Sonnet / Gemini API.
Pricing: $49/mo for solo consultants, $149/mo for boutique agencies.
Conversion: 14-day free trial on 3 contract audits, then Stripe recurring billing.
Biggest hurdle: Stripe compliance and setting up a clean overseas entity while keeping overhead near zero.`,
    original_images: [
      {
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        caption: '原推文晒单：Stripe Dashboard $32,180 MRR 经常性收入实时面板',
        size: '16:9 横屏 (1280x720)',
      },
    ],
    weaknesses_in_original: [
      '只晒了光鲜的 MRR 数据与技术栈，对于读者最关心的“一人公司怎么注册、国内还是海外实体、Stripe 怎么开”避而不谈。',
      '没有深入分析其客户从哪里来（获客冷启动与留存），也没有讲 AI 给出错误法律意见时的免责与合规边界。',
    ],
    enhancement_strategy: [
      '逆向读者最渴望知道的三个实操发问：一人公司设立流程、Stripe防封与结汇、AI合规免责护城河。',
      '检索推特海外独立开发者 @levelsio 等实战派方案与 Reddit r/SaaS 避坑讨论。',
      '通过舆情与 SEO 双擎验资，锁定全网高搜索量与高讨论度长尾词。',
    ],
    msi_preset_angles: {
      m_angle: '一人公司实战：27岁独立开发者做基于 AI 审查合同的微型 SaaS，6个月做到月入3.2万美金',
      s_angle: '从零成立出海一人公司：国内公司 vs 美国特拉华/怀俄明 LLC 注册、报税与成本全算账',
      i_angle: 'Stripe频繁风控下，海外美金如何合法合规结汇到国内个人卡？一人公司跨境收款防封避坑指南',
    },
  },
  {
    id: 'src_mit_solid_state_battery',
    category: 'clean_energy_materials',
    platform: 'nature_science',
    author: 'MIT Department of Materials Science & Engineering 联合课题组',
    institution: 'MIT 麻省理工学院 & Science 正刊',
    title: 'Self-healing sulfide solid-state electrolytes suppress lithium dendrite penetration at 10C fast charging',
    url: 'https://science.org/doi/10.1126/science.mit.battery.2026',
    tags: ['全固态电池', 'MIT', '硫化物电解质', '千公里续航', '永不自燃'],
    summary: 'Science 正刊突破：MIT 团队发明纳米自愈合电解质涂层，彻底攻克全固态电池“锂枝晶刺穿短路”这一致命死穴，实验室 10C 极速快充 2000 次无容量衰减。但论文充斥晶格常数与电化学阻抗谱，大众难以理解。',
    raw_text: `ABSTRACT: Solid-state lithium-metal batteries promise 2x energy density (>500 Wh/kg) and intrinsic thermal safety. However, microscopic lithium dendrite propagation through polycrystalline solid electrolytes has remained an insurmountable barrier under high current densities (>5 mA/cm²).
Here, we report an ultra-thin (12 nm) self-healing disordered nanocomposite interlayer synthesized via chemical vapor infiltration. Under localized stress, the interlayer undergoes a reversible phase transition that redistributes mechanical strain and repels dendritic growth.
Full cells coupled with high-nickel NMC811 cathodes demonstrate 92.4% capacity retention after 2,200 cycles under 10C rapid charge at ambient temperature without external stack pressure.`,
    original_images: [
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        caption: '原论文实验室实拍：MIT 洁净实验室中的固态纽扣电池高倍充放电测试台',
        size: '16:9 横屏 (1280x720)',
      },
      {
        url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
        caption: '电镜微观图：纳米自愈合涂层阻断锂枝晶的微观界面剖面',
        size: '16:9 横屏 (1280x720)',
      },
    ],
    weaknesses_in_original: [
      '原文完全由物理化学学术术语构成（阻抗谱、晶格畸变、化学气相渗透），普通读者看不懂两行就划走。',
      '没有解释这项实验室成果离普通人买到“续航千公里、冬天不缩水、10分钟充满”的电动车到底还有多远。',
      '缺少全球产业界各大电池巨头（丰田、宁德时代、清陶、QuantumScape）的量产进度对比。',
    ],
    enhancement_strategy: [
      '通俗化降维隐喻：把“电解质被枝晶刺穿”比作“树根钻破水泥地导致短路”，把 MIT 的自愈合涂层比作“能自动愈合的橡胶防弹衣”。',
      '扩充至 3200+ 字饱满长文：从传统液态锂电为什么冬天缩水、为什么会起火，一步步讲透这场材料革命。',
      '三条定位彻底解耦：不再讲回款！三条 I 深度盘点全球各大电池厂商的专利卡位、良品率壁垒与量产时间表。',
      '配图规划：3 处 16:9 高清横图插槽，包括现代实验室工作台、微观结构图解与量产装配流水线。',
    ],
    msi_preset_angles: {
      m_angle: '刚刚，MIT攻克固态电池最大死穴：1000公里续航与永不自燃背后的材料革命',
      s_angle: '拆解 Science 正刊论文：纳米自愈合固态电解质到底是怎么做出来的？（附实验机理图解）',
      i_angle: '从实验室到量产线：全球前五大电池巨头专利卡位与商业化落地时间表（产业图谱与投资逻辑）',
    },
  },
  {
    id: 'src_stanford_bci_nature',
    category: 'frontier_science',
    platform: 'nature_science',
    author: 'Stanford Brain-Computer Interface Laboratory',
    institution: 'Stanford 斯坦福大学 & Nature 正刊',
    title: 'High-bandwidth intracortical neuroprosthesis enables 95 words-per-minute decoded text communication for paralyzed individuals',
    url: 'https://nature.com/articles/s41586-stanford-bci-2026',
    tags: ['脑机接口', '斯坦福', 'Nature', '侵入式电极', '意念打字'],
    summary: 'Nature 正刊重磅：斯坦福神经工程团队研发全新双阵列微电极，配合离线自监督解码算法，让患有渐冻症的高位截瘫患者仅凭大脑“意念构想”，实现每分钟 95 个单词的高速流畅打字，准确率达 99.1%。',
    raw_text: `Nature 2026: Intracortical brain-computer interfaces (BCIs) restore communication to people who have lost the ability to speak or move due to ALS or brainstem stroke.
Previous systems achieved 40-50 words per minute. Here we present a dual 128-electrode array implanted in the ventral premotor cortex and Broca's adjacent area.
Combining transformer-based spike trajectory decoding with language prior models, participant T12 achieved sustained 94.8 words per minute with 99.1% accuracy on a 125,000-word vocabulary, approaching conversational English typing speeds.`,
    original_images: [
      {
        url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80',
        caption: '原论文插图：患者佩戴非侵入式接收底座与屏幕上实时生成的意念词汇波形',
        size: '16:9 横屏 (1280x720)',
      },
      {
        url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        caption: '微电极阵列示意图：64微米硅基探针在运动前区皮层的神经电信号采集路径',
        size: '16:9 横屏 (1280x720)',
      },
    ],
    weaknesses_in_original: [
      '极度专业的神经医学与信号处理黑话（Spike sorting, Ventral premotor cortex, Cross-entropy loss），普通读者敬而远之。',
      '论文并未探讨侵入式与非侵入式的伦理安全隐患、长期排异反应以及商业化普及成本。',
    ],
    enhancement_strategy: [
      '人类视角共情叙事：从渐冻症患者重获与家人“说话”自由的动人细节切入，把电极解码比作“捕捉大脑海浪中的音符”。',
      '扩写至 3000 字深度长文，全面梳理从马斯克 Neuralink 到斯坦福学术派的技术路线大对决。',
      '三条 I 定位：整理全球开源脑机接口数据集、学术论文阅读指南以及神经工程自学入门武器库。',
    ],
    msi_preset_angles: {
      m_angle: '刚刚，斯坦福在 Nature 发表脑机接口重磅突破：意念打字每分钟95词，瘫痪者重获“声音”',
      s_angle: '拆解斯坦福实验方案：微电极阵列与神经信号解码模型到底如何捕捉“脑海杂念”？',
      i_angle: '独家整理：全球顶尖脑机接口实验室研究图谱、开源神经数据集与精选论文库',
    },
  },
  {
    id: 'src_deepmind_robot_hands',
    category: 'frontier_ai_robotics',
    platform: 'arxiv_univ',
    author: 'Google DeepMind & Stanford Robotics Lab',
    institution: 'Google DeepMind & Stanford 联合实验室',
    title: 'ALOHA-Vision3: End-to-end multi-modal visuomotor policy for millimeter-level dual-arm assembly',
    url: 'https://arxiv.org/abs/2603.robotics.aloha3',
    tags: ['具身智能', '双臂机器人', 'DeepMind', '端到端控制', '人形机器人'],
    summary: '开源界震撼突破：DeepMind 与斯坦福联合开源第三代低成本双臂具身智能系统，仅用 3 万美元硬件和 50 次人类演示，机械臂即可自主学会给微型螺丝穿孔拧紧、折叠柔软衣物等毫米级灵巧操作。',
    raw_text: `We introduce ALOHA-Vision3, an open-source bimanual teleoperation and autonomous manipulation framework.
By conditioning a diffusion-transformer policy on fused RGB-D streams, tactile fingertip sensors, and wrist proprioception, the system achieves 96.2% success rates on contact-rich assembly tasks including threaded fastener insertion and multi-layer fabric folding.
All hardware CAD files, 3D printing STLs, and pre-trained weights are released under Apache 2.0 license.`,
    original_images: [
      {
        url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        caption: '原开源仓库实拍：低成本 3D 打印双臂机械手精准穿针引线操作',
        size: '16:9 横屏 (1280x720)',
      },
    ],
    weaknesses_in_original: [
      'GitHub 仓库全是 ROS2、PyTorch 权重加载和 CAD 切片参数，对非机器人专业读者门槛极高。',
      '缺少具身智能在现实工业分拣、家政服务与仓储物流落地的真实商业化成本核算。',
    ],
    enhancement_strategy: [
      '通俗拆解：为什么“人手很容易做的事情，机器人学了 50 年才搞定”，讲透视触觉融合与莫拉维克悖论。',
      '三条 I 定位：开源硬件 BOM 清单核算、组装避坑指南与中小企业用具身机械臂降本提效的落地场景分析。',
    ],
    msi_preset_angles: {
      m_angle: '仅用3万美元成本！DeepMind联手斯坦福开源具身双臂系统：机器人终于长出了“人类的双手”',
      s_angle: '拆解 ALOHA-Vision3 源码与硬件：端到端视触觉模型到底怎么让机械臂学会毫米级拧螺丝？',
      i_angle: '从硬件打样到实操落地：普通团队复现低成本双臂机器人的 BOM 采购清单与开源工具箱',
    },
  },
  {
    id: 'src_scientist_garage_profile',
    category: 'pioneers_profiles',
    platform: 'substack',
    author: 'Quanta Magazine & Tech Pioneer Profiles',
    institution: '著名学者访谈 & 硅谷前沿观察',
    title: 'From Tenured MIT Professor to Garage Robotics Founder: Dr. Ethan Chen on High-Leverage Thinking',
    url: 'https://quantamagazine.org/ethan-chen-profile-2026',
    tags: ['科学家专访', 'MIT终身教职', '极客创业', '心智模型', '超级个体'],
    summary: '高赞人物深度访谈：34 岁辞去 MIT 终身教授职位的顶尖华人学者，在波士顿郊区车库创立具身智能机器人公司，3 年估值超 10 亿美元。访谈深度披露了他每周读完 50 篇论文的“漏斗研读法”与精力管理系统。',
    raw_text: `Ethan Chen was on track for academic immortality. At 31, he held an endowed chair at MIT's EECS department.
In 2023, he walked into the Dean's office and resigned. "Academia rewards publishing incremental delta-epsilons. The world needs machines that can physically lift the burden of repetitive human labor," he recalls.
He rented a corrugated iron garage in Waltham, hired three former PhD students, and spent 14 months sleeping on a cot beside 3D printers.
Today, his company Machina-X employs 80 engineers and has deployed 400 humanoid arms in aerospace factories.`,
    original_images: [
      {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
        caption: '学者人物特写：身着工装在车库白板前推演动力学公式的深思瞬间',
        size: '16:9 横屏 (1280x720)',
      },
    ],
    weaknesses_in_original: [
      '英文访谈分散在多段音频播客中，篇幅冗长且缺乏系统性的思维模型提炼。',
      '国内读者需要更有借鉴意义的“普通人如何学习顶级学者的学习与工作习惯”。',
    ],
    enhancement_strategy: [
      '用跌宕起伏的传记小说笔法还原关键抉择时刻，彻底激发读者敬畏与共鸣。',
      '次条 S 深入解剖其独创的“五步论文漏斗法”和“绝对不被打扰的上午 4 小时深度工作块”。',
      '三条 I 全面整理公开的学术笔记系统、常用软件工具链与推荐必读经典书目。',
    ],
    msi_preset_angles: {
      m_angle: '辞去常春藤名校终身教职，他在车库做出了估值10亿的机器人独角兽：一个硬核科学家的技术信仰',
      s_angle: '他是如何一人统管百人研发团队并每周精读50篇顶刊的？复盘顶级学者的高效心智模型与工作流',
      i_angle: '独家整理：这位科学家公开的科研工具清单、学术知识库与个人自读经典书单（大师武器库）',
    },
  },
  {
    id: 'src_twitter_novel_flow',
    category: 'global_digital_biz',
    platform: 'twitter',
    author: '@Alex_CreativeAI (X 实战创作者 · 12.8万粉丝)',
    institution: 'X (Twitter) 创作者社区 & ReelShort 官方生态',
    title: 'How I generate 60s viral storytelling TikToks in 15 mins (Made $4,200 last month)',
    url: 'https://x.com/Alex_CreativeAI/status/1789234891238',
    tags: ['AI短视频', '推文小说', '出海变现', '分润账单'],
    summary: '推特极高赞爆款：作者分享用 Gemini + 剪映做推文短视频单月获得 4200 刀收益的工作流，但原文篇幅极短仅 8 条推文，充满英文专业黑话，且完全没有提中国创作者如何提现。',
    raw_text: `1/8 I made $4,200 last month promoting mystery novels on TikTok without showing my face.
Here is the exact 15-minute workflow anyone can copy for free:
2/8 Step 1: Find high-conflict chapters.
Take the first 3 chapters of any dramatic novel on WebNovel or ReelShort. Ask Gemini: "Extract 5 high-tension dialogue moments where someone is confronted."
3/8 Step 2: The Character Anchor Prompt.
Pick ONE distinct feature: "25-year-old female, neon blue hair, white leather jacket". Keep this prefix in every scene prompt.
4/8 Step 3: Voiceover in 2 minutes via ElevenLabs / CapCut.
5/8 Step 4: Visual Pacing under 2.5s per cut.
6/8 Step 5: Monetization via ReelShort 50% affiliate split.
7/8 Payout: Last month affiliate dashboard shows $4,219.40 deposited to Mercury bank.`,
    original_images: [
      {
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        caption: '原推文晒单：ReelShort 分润结算后台 4219 美金入账面板截图',
        size: '16:9 横屏 (1280x720)',
      },
    ],
    weaknesses_in_original: [
      '推文太短仅有 500 字，关键步骤一笔带过，小白完全不知如何下手。',
      '原帖直接说打款到美国 Mercury 水星银行，中国大陆个人创作者无法照搬。',
    ],
    enhancement_strategy: [
      '通俗化降维：拆解为零门槛三句半填空题。',
      '扩充至 2800+ 字完整长文并提供 4 处手机排版配图指引。',
      '增补国内合规路径：万里汇/Wise 个人结汇回国的真实账本。',
    ],
    msi_preset_angles: {
      m_angle: '单月分润 4200 美金：深挖海外“推文短剧”闷声发财的真实商业闭环',
      s_angle: '15分钟搞定一条爆款推文：我的自用 Gemini 画面生成与分镜工作流（附实操填空卡）',
      i_angle: '普通人做海外内容怎么把美金安全装进钱包？跨境主流个人结汇通道实测全对比',
    },
  },
  {
    id: 'src_reddit_sideproject_assets',
    category: 'global_digital_biz',
    platform: 'reddit',
    author: 'u/IndieHustle2026 (r/SideProject 社区版主)',
    institution: 'Reddit r/SideProject & Gumroad',
    title: '$3,800/mo selling Notion templates & prompt bundles without paid ads',
    url: 'https://reddit.com/r/SideProject/comments/19284fa/digital_assets_breakdown',
    tags: ['独立开发', '数字资产', 'Gumroad', '零库存轻资产'],
    summary: 'Reddit 爆款实录：通过做极简轻量级数字模板，在 Gumroad 上零库存月入近 4000 刀的真实心得，但缺乏流量分发与跨平台防封号细节。',
    raw_text: `Posted by u/IndieHustle2026: I switched to super simple Notion budget templates and niche ChatGPT cheat sheets. Current MRR: $3,840 with 92% profit margin.`,
    original_images: [
      {
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
        caption: '原帖晒单：Gumroad 后台真实月度结算 $3,840 账单截图',
        size: '16:9 横屏 (1280x720)',
      },
    ],
    weaknesses_in_original: [
      'Reddit 原帖以心得感想为主，缺乏具体的中国创作者如何出海建站与 Stripe 避坑。',
      '没有给出具体的模板生产 SOP 与防白嫖机制。',
    ],
    enhancement_strategy: [
      '提炼其轻资产选品思维，重构为 M/S/I 三联包，重点算透 Gumroad 与独立站的抽成差距。',
      '增补真实操作界面配图与 1080px 收益阶梯对比卡。',
    ],
    msi_preset_angles: {
      m_angle: '做复杂的SaaS亏到底掉，改卖极简Notion小模板月入近4000刀：海外超级个体的轻资产变现课',
      s_angle: '零代码从零打造第一套数字模板资产：1080px视觉卡与Gumroad极简上架SOP',
      i_angle: '海外数字资产平台抽成横评：Gumroad vs LemonSqueezy 真实手续费与防封店指南',
    },
  },
  {
    id: 'src_reddit_crossborder_payout',
    category: 'global_digital_biz',
    platform: 'reddit',
    author: 'u/CrossBorderHustler (r/PassiveIncome 社区高赞答主)',
    title: 'The honest truth about getting paid from TikTok/Gumroad if you live outside the US',
    url: 'https://reddit.com/r/PassiveIncome/comments/18x94ab/overseas_payout_reality',
    summary: 'Reddit 商业干货：非美居民如何避开繁琐税表和高昂中介费，合法合规将海外美金收入结汇回国的真实避坑指南。',
    raw_text: `Stop paying $800 to shady agents for Delaware LLCs!
If you are doing TikTok affiliates, Gumroad, or freelance writing from abroad:
1. You can open a Wise or WorldFirst virtual US account using your domestic passport/ID.
2. Fill out form W-8BEN to claim 0% or 10% treaty tax withholding.
3. Wire funds to your domestic card with under 1% total friction.`,
    original_images: [
      {
        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
        caption: '原帖展示：Wise 虚拟银行账户路由号与电汇凭证截图',
        size: '16:9 横屏 (1280x720)',
      },
      {
        url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
        caption: '原帖展示：手机银行导出电子账单作为合规地址证明样本',
        size: '9:16 手机竖屏 (1080x1920)',
      },
    ],
    weaknesses_in_original: [
      '全英文说明，且欧美用户与中国大陆用户面对的银行外汇管制规则完全不同。',
      '没有给出国内各大银行（工行、招行、中行）接收结汇时具体的材料要求。',
    ],
    enhancement_strategy: [
      '完全针对国内个人创作者改写，详述大陆身份证 + 手机银行账单导出全流程。',
      '手把手教写 W-8BEN 减税表，规避 30% 预扣税。',
      '提供 3 处清晰配图插槽，包括手机银行操作长图与成本测算卡。',
    ],
  },
];

export const STYLE_PERSONAS: StylePersona[] = [
  {
    id: 'veteran_candid',
    name: '实战老友·通俗小白手记',
    tagline: '极其通俗 / 拒绝高深术语 / 大白话算账 / 手把手带入',
    description: '彻底剥离任何工程师和程序员的专业架子，把复杂的 AI 工作流讲得像教父母用微信一样简单明了，字数饱满 (2000~4000字)。',
    tonePrompt: `你是一个特别热心、说话极其通俗接地气的实战老友。
写作最高铁律：
1. 【拒绝一切高深技术黑话】：绝对不要张口闭口 Diffusion、ControlNet、Negative Embedding、LoRA、API Token。如果必须提到某工具，必须用打比方的买菜大白话解释（例如：“这就像在美图秀秀里点一下自动美颜”、“就像给主角系上一根红丝带”）。
2. 【零基础普通人视角】：读者是完全没有计算机背景的普通人（上班族、宝妈、自由职业者）。你必须像坐在一张桌子前、拿手机手把手教他们操作一样亲切。
3. 【篇幅必须充实饱满】：正文字数严格保持在 4000 ~ 6000 字之间（不含 [图1]、[图2] 等简短标记）！不可过于简略，必须通过丰富的真实踩坑细节、具体每一步的操作指引和真实的收益/成本算账充分展开长篇特稿。
4. 【配图格式极其简洁】：正文中若有配图，一律只使用最简洁的格式单独成行标记：
   [图1]
   [图2]
   以此类推，严禁在正文中添加任何多余的长括号拍摄建议或尺寸说明。`,
    negativePrompt: `绝对禁用词：毋庸置疑、如同一把双刃剑、赋能、闭环、底层逻辑、心智模型、打法、矩阵、降维打击、正如古人云、数字化浪潮、综上所述、🎯。`,
  },
  {
    id: 'geek_minimalist',
    name: '极简实战·傻瓜工序流',
    tagline: '开局给成品 / 步骤不废话 / 填空式指令 / 避雷防封号',
    description: '开门见山直接展示做好的成品体感，专注 Step-by-Step 实操动作，给出可直接抄作业的指令与避雷按键。',
    tonePrompt: `你是一个追求极致效率的实战创作者。开门见山，给出可直接复制的提示词和保姆级操作工序，篇幅严格保持在 4000~6000 字纯净正文，配图一律用简洁的 [图1]、[图2] 独立成行标记，严禁出现 🎯 等图标或多余无关说明。`,
    negativePrompt: `绝对禁用词：毋庸置疑、不可否认、显而易见、助力每一个、探索无限可能、重塑行业格局、🎯。`,
  },
  {
    id: 'investigative_log',
    name: '商业解密·记账本',
    tagline: '撕开虚假神话 / 跨平台真实抽成横评 / 隐形损耗全透视',
    description: '从一张真实收入小票或读者翻车求助切入，算清每个平台的隐藏抽成、回款周期与沉没成本。',
    tonePrompt: `你是一个冷静硬核的商业调查员与跨境记账人，算清每一笔账，篇幅严格保持在 4000~6000 字之间，配图一律用简洁的 [图1]、[图2] 标记，无无关文字。`,
    negativePrompt: `绝对禁用词：双刃剑、综上所述、战略打法、赋能生态、总而言之、闭环、🎯。`,
  },
  {
    id: 'custom_clone',
    name: '自定义范文克隆 (Few-Shot)',
    tagline: '投喂你最喜欢的人类爆款范文 / 提取个性口头禅与呼吸感',
    description: '直接粘贴一段您自己或目标大号的真实样文，模型将提取其特有的句式起伏、断句习惯与标点特征。',
    tonePrompt: `请严格模仿用户提供的真实参考范文的行文口吻、断句节奏与词汇风格。保留范文中的口语感与真实情绪，正文字数严格控制在 4000~6000 字之间（不含 [图1] 等简短标记），无无关废话。`,
    negativePrompt: `严格遵守全局去 AI 味协议，禁止出现任何 AI 模板词及 🎯 等花哨图标。`,
  },
];

export const PRESET_CASE_STUDIES: Record<
  string,
  {
    title: string;
    seed: string;
    sourceId: string;
    plan: DailyClusterPlan;
    articles: Record<'M' | 'S' | 'I', DraftArticleOutput>;
  }
> = {
  ai_novel: {
    title: '海外 TikTok 小说推文二创变现全景拆解',
    seed: '海外推特/Reddit 爆火的 15分钟小说推文视频工作流二创改进与国内合规闭环',
    sourceId: 'src_twitter_novel_flow',
    plan: {
      cluster_id: '2026-10-15-ai-novel',
      seed_topic: '海外推特/Reddit 爆火的 15分钟小说推文视频工作流二创改进与国内合规闭环',
      cluster_logic_summary:
        '基于海外 Twitter 爆款推文真实案例二创：头条（M）算透海内外平台抽成与冷启动账本，次条（S）通俗化降维交付普通人一学就会的做视频全套工序与配图指南，三条（I）解决国内个人无海外卡如何稳妥合规结汇。',
      narrative_mode: '实战老友·通俗小白手记',
      source_reference_id: 'src_twitter_novel_flow',
      articles: [
        {
          archetype: 'M',
          publish_slot: '头条 (1st)',
          wechat_title: '一条视频分走 400 刀？拆解海外 TikTok 小说推文的真实佣金与起号门槛',
          core_angle: '通俗算账：拒绝营销号虚假吹捧，用买菜大白话算清短剧分润与长尾小说的真实收入差距、扣除平台抽成后到底能拿多少，以及新手冷启动前 3 步。',
          forbidden_scope: '只点出推文用到的工具名字，严禁在文内展开具体软件操作步骤与 Prompt 细节（留给次条 S 篇）；严禁展开海外虚拟银行卡开户（留给三条 I 篇）。',
          outline_sections: [
            '别看推特截图动辄几千刀，先把后台扣费账单看明白',
            '普通人最适合切入的两个渠道：短剧充值分佣 vs 电子书长尾订阅',
            '前 7 天冷启动最大死穴：为什么新手发到第 3 条视频就没播放了？',
            '不需要辞职，普通人今晚就能迈出的 3 个摸底动作',
          ],
          scraper_tasks: [
            {
              engine: 'exa_search',
              query_or_url: 'site:tiktok.com/creator-rewards-program official payout rpm rules',
              extraction_focus: '千次播放有效单价 RPM、分成比例与提现周期',
            },
            {
              engine: 'apify_reddit',
              query_or_url: 'r/Tiktokhelp novel promotion affiliate payout proof 2026',
              extraction_focus: '真实推文分成收益晒单与被判搬运的降权原因',
            },
          ],
          visual_spec: {
            mermaid_flowchart_topic: 'TikTok 小说推文流量转化与分佣链路',
            satori_card_type: 'platform_comparison',
            card_key_metrics: ['起号门槛', '千播RPM预估', '分成比例', '提现周期'],
          },
          cross_links: [
            {
              target_archetype: 'S',
              target_title: '零基础小白也能做：我把推特火爆的 15 分钟推文视频工序拆成了填空题',
              insert_after_section: '前 7 天冷启动最大死穴',
              hook_callout_markdown: '> 🛠️ **具体软件怎么点？提示词怎么填空？** 建议直接收藏今天次条推送的保姆级实操手记：**《零基础小白也能做：我把推特火爆的 15 分钟推文视频工序拆成了填空题》**。',
            },
            {
              target_archetype: 'I',
              target_title: '赚到美金怎么提出来？没有海外卡申请 Wise 与万里汇合规结汇实操',
              insert_after_section: '别看推特截图动辄几千刀',
              hook_callout_markdown: '> 🏛️ **赚到的佣金怎么收进国内银行卡？** 如果还没有搞定收款通道，先看三条这篇踩坑指南：**《赚到美金怎么提出来？没有海外卡申请 Wise 与万里汇合规结汇实操》**。',
            },
          ],
        },
        {
          archetype: 'S',
          publish_slot: '次条 (2nd)',
          wechat_title: '零基础小白也能做：我把推特火爆的 15 分钟推文视频工序拆成了填空题',
          core_angle: '彻底通俗化改造推特原帖的高门槛英文流：用最普通的手机软件，把选冲突情节、画面防走样提示词和剪辑对齐拆成零门槛操作，附详尽配图尺寸与截屏指南。',
          forbidden_scope: '专注文案分镜与视频生产，不重复分析平台商业模式与分成算法，不展开海外银行提现与合规主体。',
          outline_sections: [
            '先看最终成品长啥样：普通人花 15 分钟做出来的视频体感',
            '第一步：挑剧本千万别从头看，教你一键抓出最抓人的“冲突戏”',
            '第二步：生图最怕人脸变来变去，教你一个笨办法牢牢锁住主角长相',
            '第三步：音频与字幕一键对齐，普通手机也能搞定的剪辑全工序',
            '新手最容易犯的 3 个低级小失误（附防被平台限流的避雷按键）',
          ],
          scraper_tasks: [
            {
              engine: 'exa_search',
              query_or_url: 'high converting tiktok video script prompt structure gemini',
              extraction_focus: '前 3 秒悬念钩子文案模板与多镜头连贯性提示词',
            },
          ],
          visual_spec: {
            mermaid_flowchart_topic: '推文视频 15 分钟极速生产工序',
            satori_card_type: 'prompt_before_after',
            card_key_metrics: ['废话 Prompt vs 工业级 Prompt', '画面连贯度', '渲染成功率'],
          },
          cross_links: [
            {
              target_archetype: 'M',
              target_title: '一条视频分走 400 刀？拆解海外 TikTok 小说推文的真实佣金与起号门槛',
              insert_after_section: '先看最终成品长啥样',
              hook_callout_markdown: '> 👉 **想了解哪个平台给的分成最高、什么时候提现？** 建议顺手阅读今日头条的商业算账篇：**《一条视频分走 400 刀？拆解海外 TikTok 小说推文的真实佣金与起号门槛》**。',
            },
            {
              target_archetype: 'I',
              target_title: '赚到美金怎么提出来？没有海外卡申请 Wise 与万里汇合规结汇实操',
              insert_after_section: '新手最容易犯的 3 个低级小失误',
              hook_callout_markdown: '> 🏛️ **视频发出去了，收益到账后如何合规拿回国内？** 欢迎参考今日三条的收款实操教程：**《赚到美金怎么提出来？没有海外卡申请 Wise 与万里汇合规结汇实操》**。',
            },
          ],
        },
        {
          archetype: 'I',
          publish_slot: '三条 (3rd)',
          wechat_title: '赚到美金怎么提出来？没有海外卡申请 Wise 与万里汇合规结汇实操',
          core_angle: '算透每一分钱：专为国内个人创作者设计，手把手拆解无海外银行卡时，如何仅用身份证在合规持牌机构开设虚拟美金账户，把辛苦钱结汇到国内银行卡。',
          forbidden_scope: '专注商业主体与收款合规，严禁展开前端视频制作与文案撰写。',
          outline_sections: [
            '很多人第一笔收益到账就傻眼了：为什么个人国内储蓄卡直接被外汇拒收？',
            '三大主流收款通道横向排查：万里汇 vs Wise vs Payoneer',
            '用中国大陆身份证开通虚拟账户的 4 个必备凭证（避开封号红线）',
            '每一分钱都要算清：从平台结算到打回微信零钱的真实手续费清单',
            '关于美国 W-8BEN 税表填写的保姆级指南（合法避免被扣 30% 重税）',
          ],
          scraper_tasks: [
            {
              engine: 'exa_search',
              query_or_url: 'site:wise.com mainland china identity proof requirements receiving usd',
              extraction_focus: '非美居民认证证件清单与手续费标准',
            },
          ],
          visual_spec: {
            mermaid_flowchart_topic: '海外平台美金打款至国内个人账户链路',
            satori_card_type: 'entity_cost_matrix',
            card_key_metrics: ['开户成本', '货币转换费率', '提现到账时效', '合规风险'],
          },
          cross_links: [
            {
              target_archetype: 'M',
              target_title: '一条视频分走 400 刀？拆解海外 TikTok 小说推文的真实佣金与起号门槛',
              insert_after_section: '很多人第一笔收益到账就傻眼了',
              hook_callout_markdown: '> 🚀 **还没找准高转化推文题材？** 在处理账户之前，不妨先看看今天头条的详细收益测算：**《一条视频分走 400 刀？拆解海外 TikTok 小说推文的真实佣金与起号门槛》**。',
            },
            {
              target_archetype: 'S',
              target_title: '零基础小白也能做：我把推特火爆的 15 分钟推文视频工序拆成了填空题',
              insert_after_section: '每一分钱都要算清',
              hook_callout_markdown: '> 🛠️ **想立刻做条视频测试账户连通？** 欢迎直接参考今日次条的提示词模板：**《零基础小白也能做：我把推特火爆的 15 分钟推文视频工序拆成了填空题》**。',
            },
          ],
        },
      ],
    },
    articles: {
      M: {
        archetype: 'M',
        wechat_title: '一条视频分走 400 刀？拆解海外 TikTok 小说推文的真实佣金与起号门槛',
        digest_summary: '别看网上截图动辄几千刀。把真实账本摊开：各大平台的抽成比例、千次播放收益和新手最容易踩的封号坑到底是什么。',
        markdown_content: `聊聊最近在推特和 Reddit 上被讨论得非常火爆的海外推文短视频。

前几天我在推特上看到一位叫 Alex 的博主晒后台，说自己靠几段用手机做的小说推文，单月从短剧平台分走了 4200 多美金。评论区里一堆人在求教程，觉得这简直是天上掉馅饼的暴利项目。

说句大实话：**钱确实是真实的，但绝不像网上那些推文博主吹得那么玄乎。**

上个月我和两个小伙伴一起，拿了 4 个新注册的账号亲自下场跑了一整轮。前前后后剪了 80 多条视频，踩了两次被平台判定为搬运降权的暗坑，也结出了第一批美金。今天我不讲任何花哨的行话，直接把实打实的后台账本、分成规则和避坑经验给大家摊开说透。

---

### 一、 别看推特截图动辄几千刀，先把后台扣费账单看明白

很多人以为做海外推文，就是靠播放量来赚平台的广告补贴（也就是常说的创作者基金）。

如果你这么想，那可就大错特错了。

现在的播放量补贴早就不是两年前的红利期了。千次有效播放（行业里叫 RPM）通常在 0.4 到 0.8 美金之间徘徊。也就是说，哪怕你一条视频爆了 10 万播放，纯播放量收益也就只有 40 到 80 美金，折合人民币三五百块钱。要是中途网络环境稍微不稳定，被系统误判为批量搬运，连这一笔钱都可能被扣下。

**真正的大头，其实是短剧和电子书的“充值分佣（CPS）”。**

什么是充值分佣？说白了就跟超市门口的代销一样：你在视频最精彩、最扣人心弦的地方戛然而止，然后引导观众点击主页的专属链接。海外观众想看大结局，就会去下载专门的短剧或者小说 App 充值买金币。

只要观众充了钱，平台就会按照预先约定的比例给你分账：
- 比如观众充了 9.99 美金，平台直接把其中的 45% 到 60%（也就是 4.5 到 6 美金）返还到你的账户里。
- 如果一条视频有三四十个观众充值追剧，这一条视频就能轻松带来两三百美金的收益。

[图1]

这就是为什么推特上那些厉害的作者能一个月赚几千刀的根本原因——他们赚的根本不是平台那点可怜的播放补贴，而是精准抓住了海外读者的充值冲动。

我们实测下来，只要视频选的情节足够抓人，哪怕只有两三万播放，也经常能带出三四百刀的充值。相反，如果你只是水了一条没有情绪钩子的十几万播放视频，可能最后一分钱充值都没有。

{{HOOK_TO_I_TYPE}}

---

### 二、 普通人最适合切入的两个渠道：短剧充值分佣 vs 电子书长尾订阅

目前海外主流的变现渠道大致可以分为两类，适合不同精力的人：

\`\`\`mermaid
flowchart LR
    A[海外推文短视频流量] --> B{两大变现阵营}
    B -->|高爆发·短剧分销| C[ReelShort / DramaBox]
    B -->|细水长流·电子书| D[WebNovel / GoodNovel]
    C --> E[单客充值返佣 45%-60%]
    D --> F[按章节长期订阅分成]
\`\`\`

#### 1. 短剧分销（如 ReelShort、DramaBox）
- **特点**：爆发力极强，单笔分润高。现在的海外短剧节奏比国内还要狗血，豪门恩怨、狼人虐恋、复仇逆袭，老外看得欲罢不能。只要观众充值，单笔佣金基本在 4 美金到 15 美金之间。
- **缺点**：审核相对较严，新账号如果不通过正规官方代理或者达人通道，主页很容易挂不上带追踪参数的落地点链接。

#### 2. 网文小说分销（如 WebNovel 阅文海外版、GoodNovel）
- **特点**：长尾效应非常稳。可能你半个月前发的一条视频，因为小说本身情节过硬，依然陆陆续续有读者在熬夜追更，每天都能跑出十几美金的零花钱。
- **缺点**：单客客单价不如短剧高，读者每次只花几毛美金解锁一两个章节，需要靠批量的内容基数来撑起大盘。

[图2]

很多刚入行的新手总纠结到底选哪一个。我的实操建议非常明确：**前两周先用网文小说练手摸清流程，等账号权重稳定、有了基础播放量之后，再切入短剧分销吃高额分润。**

---

### 三、 前 7 天冷启动最大死穴：为什么新手发到第 3 条视频就没播放了？

在我们实测的过程中，发现很多从国内抖音快手转战海外的新手，最容易犯的一个致命毛病：

**直接从国内剪一段现成的悬疑剧，用软件自动翻译成英文配音，然后就兴高采烈地传到 TikTok 上。**

结果会发生什么？
- 第 1 条视频，系统可能给个两三百的初始流量；
- 第 2 条视频，播放量直接掉到五六十；
- 到了第 3 条视频，播放量直接变成刺眼的 0，点进后台一看，赫然显示着一行灰色小字：“Unoriginal Content（非原创内容，不予推荐）”。

很多人以为海外平台的去重审核很松，其实完全相反。海外平台的画面哈希比对和音轨抽检极其灵敏，任何在国内平台上出现过几百次的画面，一旦被识别，就会直接给整个账号打上“低质营销号”的标签。

真正能够长治久安的解法，必须是**“彻底重做属于自己的分镜画面”**：
从情节大纲中提炼出几个冲突最激烈的瞬间，让绘图工具生成属于你自己的独家写实画面，配上全新的解说音频。这样无论平台怎么抽检，你的素材在全网数据库里都是 100% 唯一的全新内容。

而且更重要的是，完全不需要你去学多么复杂的绘图技术。今天次条的实操手记里，我会把整套做图工序拆成傻瓜填空题，普通人照着填就能搞定。

{{HOOK_TO_S_TYPE}}

---

### 四、 不需要辞职，普通人今晚就能迈出的 3 个摸底动作

如果你看完觉得这件事值得一试，我强烈建议你不要冲动地去买各种高价培训班，更不需要一上来就辞职全职干。

今天晚上回到家，花上一个小时，把下面这 3 步先走完：

1. **第一步：先用手机或者电脑，去海外平台刷一小时同行动向**。搜索关键词 “Novel recommendation” 或 “Romance story time”，看看那些点赞过万的视频，第一秒钟屏幕上打出来的英文大标题到底是怎么刺激观众好奇心的。
2. **第二步：挑一部剧情冲突极度激烈的短篇网文**（比如开头就是假千金被赶出家门、或者被无情背叛）。挑出前三章情节，按照次条教程里的方法，试着用免费工具跑出一组 6 张连贯的人物画面。
3. **第三步：提前弄清收款通道**。先不用花大几千块找中介去办什么美国公司或香港公司，先用自己的大陆身份证把合规的跨境收款账户开好备用。

[图3]

任何看起来赚钱的项目，水面之下都有必须亲手趟过的泥坑。但只要你把账算得比别人清楚、避开无脑搬运的雷区，这件事普通人完全能够利用晚上的业余时间稳稳跑通。`,
        satori_card_data: {
          card_title: '海外主流推文平台收益与门槛横评',
          card_subtitle: '实测数据归纳 · 拒绝虚标',
          template_type: 'platform_comparison',
          columns: ['平台类别', '分成机制', '真实千播/CPS单价', '新手起号门槛', '回款周期'],
          rows: [
            {
              item_name: 'ReelShort / 短剧分润',
              metrics: {
                '分成机制': '45% - 60% 充值分成',
                '真实千播/CPS单价': '单客充值 $3.5 ~ $12',
                '新手起号门槛': '需挂专属引流链接',
                '回款周期': '次月 15 日',
              },
              highlight_tag: '佣金最高',
            },
            {
              item_name: 'WebNovel / 电子书推文',
              metrics: {
                '分成机制': '25% - 35% 订阅分成',
                '真实千播/CPS单价': '单客消费 $1.2 ~ $4',
                '新手起号门槛': '无粉丝门槛，可直接申请',
                '回款周期': '满 $100 自动结算',
              },
              highlight_tag: '长尾稳定',
            },
            {
              item_name: 'TikTok 播放量补贴',
              metrics: {
                '分成机制': '按播放量直接计费',
                '真实千播/CPS单价': 'RPM 约 $0.4 ~ $0.8',
                '新手起号门槛': '万粉 + 10万单月播放',
                '回款周期': '每月 1 次',
              },
              highlight_tag: '门槛较高',
            },
          ],
          footer_note: '注：海外平台分成政策变动频繁，建议优先布局 CPS 独立分账链接降低平台政策风险。',
          theme_color: 'amber',
        },
      },
      S: {
        archetype: 'S',
        wechat_title: '零基础小白也能做：我把推特火爆的 15 分钟推文视频工序拆成了填空题',
        digest_summary: '不讲晦涩的专业名词。把选情节、画连贯分镜、配音对齐这套推特百万播放的工作流，彻底拆解成普通人照着填空就能做的傻瓜工序。',
        markdown_content: `很多朋友一听到“AI 做视频”，脑子里跳出来的第一个念头就是：

“这肯定得懂英语吧？得懂提示词代码吧？电脑显卡得大几万吧？”

其实完全不是那么回事。

推特上那些动辄单条播放几十万的海外创作者，很多人根本不懂什么高深的技术。他们之所以能 15 分钟批量做完一条高质量推文视频，核心就在于他们把整个工序变成了一套极其标准化的“填空题”。

今天我就把这套在海外创作者圈子里被翻来覆去使用的实操流程彻底通俗化，用最接地气的大白话拆开给你看。不扯什么模型参数，也不讲高深理论，拿你手里的普通手机照着做就行。

---

### 一、 先看最终成品长啥样：普通人花 15 分钟做出来的视频体感

在动手之前，我们先明确一下最终做出来的推文视频到底是怎样的体裁：

一段大概 50 到 60 秒的竖屏短视频。
- **前 3 秒**：画面猛地推开一扇豪宅大门，一个年轻人满脸震惊地看着手中的文件，配音第一句话就是：“直到母亲临终前，他才知道那个身价百亿的首富竟然是自己的亲生父亲。”
- **第 15 到 40 秒**：随着快节奏的悬念配音，镜头不断切换——有在暴雨中对峙的特写、有冷酷签字的近景。
- **第 50 秒**：当两人的矛盾激化到顶点、马上要揭晓真相的瞬间，画面猛然定格，字幕弹出一行大字：“想看完整剧情？点击左下方链接继续观看”。

整个视频不需要真人露脸，画面全部由 AI 自动生成，配音由软件直接朗读，但情绪张力拉得极满。

[图1]

只要你掌握了下面这 3 步，哪怕你从没剪过视频，跟着做也能在半小时内搞定你的第一条成品。

{{HOOK_TO_M_TYPE}}

---

### 二、 第一步：挑剧本千万别从头看，教你一键抓出最抓人的“冲突戏”

很多人做小说推文，最头疼的就是看小说太费时间。一本长篇小说几百万字，要是自己一章一章慢慢翻，黄花菜都凉了。

**聪明的做法是让 AI 当你的“剧情筛子”。**

你随便在海外的阅读网站（比如 WebNovel 或 GoodNovel）上找一部悬疑或者言情类小说，直接把前 3 章的大概文本复制下来，然后打开任意一个大模型对话框（比如免费的 Gemini 或者 DeepSeek），把下面这段中文提示词直接复制进去：

\`\`\`markdown
你是一个悬疑短剧编剧。请帮我分析下面这段小说前3章内容，挑出【矛盾冲突最剧烈、能在前3秒抓住观众好奇心】的 5 个关键动作场景。
要求：每个场景用一句话描述画面里有谁、在什么环境、正在做什么有冲突的动作。不要讲心理活动，只描述眼睛能看到的真实画面。
\`\`\`

回车一敲，几十秒钟之内，AI 就会给你吐出 5 个现成的情节分镜：
- 场景 1：暴雨中的废弃停车场，一个穿黑风衣的男人手里拿着一份湿透的亲子鉴定报告；
- 场景 2：豪华会议室里，女主角把辞职信狠狠甩在桌上，四周的高管面面相觑；
- 场景 3：昏暗的书房里，一个人正在慌张地撬开保险柜锁孔……

你瞧，你根本不需要去通读整本小说，AI 已经帮你把最刺激眼球的电影级分镜全部挑出来了。

---

### 三、 第二步：生图最怕人脸变来变去，教你一个笨办法牢牢锁住主角长相

接下来到了很多新手最容易崩溃的环节：**生图**。

普通人试着用绘图工具画图时，最常见的笑话就是：
- 镜头 1 里的男主角是个二十来岁、白净帅气的青年；
- 镜头 2 突然变成了四十多岁、满脸络腮胡的大叔；
- 镜头 3 头发甚至直接从黑色变成了金黄色！

这种人脸漂移的问题怎么解决？网上很多教程教人装复杂的插件、调几十个晦涩的技术参数，普通人一看就头大直接放弃。

其实根本不用那么麻烦！我们只要记住一个极其好用的笨办法——**给角色绑定 2 个独一无二的“随身视觉锚点”**。

什么叫视觉锚点？就是给主角安排一个非常显眼的特征，就像上学时在书包上系一根红丝带一样：
- 特征 A：**“左眼下方有一道浅浅的小伤疤 (small scar under left eye)”**；
- 特征 B：**“身上穿着一件洗得发白的深棕色旧皮夹克 (vintage worn brown leather jacket)”**。

[图2]

每次你在生成分镜画面时，不管背景是白天还是黑夜、是室内还是室外，你只要把这段特征词作为固定的开头复制在最前面：

> 💡 **直接抄作业的写实分镜指令模板：**  
> 电影质感写实照片，一个25岁的东亚年轻人，留着干净短黑发，左眼下方有一道小伤疤，身上穿着深棕色旧皮夹克。此时他正站在[在这里填入具体场景，比如：雨夜的豪华写字楼门前]，神情凝重，冷色调光影，8k写实，高清细节。

只要你把特征词死死钉在提示词的前面，大模型就会把这道伤疤和这件旧皮夹克当成绝对核心，生成出来的所有分镜里，主角的长相和辨识度就能稳定在 90% 以上！

[图3]

---

### 四、 第三步：音频与字幕一键对齐，普通手机也能搞定的剪辑全工序

画面有了，接下来就是把声音和画面拼成视频。这一步完全不需要你买上万元的剪辑设备，用你平时手机上的剪映（海外版叫 CapCut）就能轻松搞定。

整个流程大概就 3 步：

\`\`\`mermaid
flowchart TD
    Step1[把小说提炼好的 5 段台词复制出来] --> Step2[在配音软件里挑一个略带沙哑的磁性英文音色]
    Step2 --> Step3[导出 MP3 音频并导入剪映]
    Step3 --> Step4[点击智能字幕一键识别英文字幕]
    Step4 --> Step5[把做好的 5 张 AI 竖版图片拖入轨道对齐音频]
\`\`\`

1. **配音**：把前面准备好的 5 段冲突文案，丢进免费的配音软件（比如剪映自带的文本朗读，或者 ElevenLabs）。音色尽量选稍微低沉、有磁性的成熟男声或女声，语速调到 1.1 倍速，制造一种迫切的紧张感。
2. **字幕一键生成**：把导出的音频导入剪映轨道，点击底部的【文本】➔【智能字幕】。软件大概 10 秒钟就会自动把每个单词的出现时间和发音卡点对齐得整整齐齐。
3. **加一点点镜头微动**：千万不要让画面直愣愣地停在屏幕上！在剪映里给每张图片加上一个【缓慢向中心放大 (Slow Zoom In)】的动画效果，每张图片停留 2.5 到 3 秒钟。观众的眼睛就会感觉画面一直在动，完播率瞬间翻倍。

[图4]

---

### 五、 新手最容易犯的 3 个低级小失误

最后，我把新手在第一次制作时最常踩翻车的 3 个小细节列出来，大家动手时务必对照避坑：

- **第一坑：字幕贴得太靠底**。很多人习惯把字幕放在屏幕最下方，但 TikTok 和海外短视频 App 的底部有发布者昵称、文案和旋转的音乐光盘图标。字幕一定要往上抬高至少 15% 的距离（大约在屏幕下方三分之一处），保证文字不被任何图标遮挡。
- **第二坑：背景音乐声音太大**。背景音乐一定要调小，音量建议调到 -20dB 左右。背景音乐只是烘托气氛的，如果背景音乐把英文配音的单词咬字盖住了，老外听不清楚台词，不到 2 秒就会直接划走。
- **第三坑：前 2 秒画面出现静止的大头照**。短视频前 2 秒是留存的关键期。第一张图绝对不能是安安静静坐着的人脸，一定要是具有动态趋势的动作——比如“正在猛踩刹车”、“手里拿着枪瞄准”、“被雨水淋透的背影”，用视觉冲击力瞬间把人留在页面上。

{{HOOK_TO_I_TYPE}}

看完这套流程，你就会发现：**海外推文短视频根本没有什么不可逾越的技术壁垒**。它拼的不是谁的技术更深奥，而是谁能把这套 15 分钟的简单动作日复一日地执行下去。今晚不妨就打开软件试着做一条，体验一下亲手做出属于自己的爆款视频的成就感！`,
        satori_card_data: {
          card_title: '推文视频提示词前后对比实测',
          card_subtitle: '普通新手指令 vs 角色锚点工业级指令',
          template_type: 'prompt_before_after',
          columns: ['提示词类型', '指令设计', '画面连贯度', '完播率体感'],
          rows: [
            {
              item_name: '普通新手指令',
              metrics: {
                '指令设计': '画一个帅气的年轻人站在大楼前面，很有电影感',
                '画面连贯度': '极差，换镜头直接换脸',
                '完播率体感': '前3秒滑走率高达 78%',
              },
              highlight_tag: '容易翻车',
            },
            {
              item_name: '角色锚点工业级指令',
              metrics: {
                '指令设计': '固定特征词（短黑发+左眼伤疤+棕色旧风衣）+ 9:16电影构图',
                '画面连贯度': '跨镜头人物辨识度 > 90%',
                '完播率体感': '平均完播率达 34.2%',
              },
              highlight_tag: '推荐使用',
            },
          ],
          footer_note: '核心原则：用具体的服饰与生理细节作为锚点，比一长串泛滥的赞美词好用得多。',
          theme_color: 'cyan',
        },
      },
      I: {
        archetype: 'I',
        wechat_title: '赚到美金怎么提出来？没有海外卡申请 Wise 与万里汇合规结汇实操',
        digest_summary: '算透每一分钱：大陆个人身份证如何搞定跨境收款虚拟账号，手续费到底有多少，避开封号的必备材料清单。',
        markdown_content: `很多刚做海外变现的朋友，往往是在看到后台数字涨到好几百刀时，才突然慌了神：

这笔美金到底怎么拿回国内？直接填国内工行或招行储蓄卡行不行？

直接说结论：**不行。** 个人账户直接接收海外公司商业电汇，大概率会被银行直接退回，甚至要求你提供纸质合同和完税凭证，折腾半个月也拿不到钱，还可能白白搭进去几十美金的电汇退回手续费。

今天我就把这套针对国内个人创作者的合规结汇全链路彻彻底底讲透。不用花大几千块找中介办离岸公司，凭你手里的一张普通中国大陆身份证，就能稳稳当当地把赚到的每一分美金结汇到国内银行卡或支付宝里。

{{HOOK_TO_M_TYPE}}

---

### 一、 很多人第一笔收益到账就傻眼了：钱卡在半路怎么解？

正规的打款流程其实并不神秘。海外平台把钱打入你在合规持牌机构开设的“海外虚拟银行账户”，再由持牌机构按实时外汇牌价帮你结汇打入国内支付宝或微信零钱。

整个过程不需要你亲自跑到香港或美国办实体卡。

\`\`\`mermaid
flowchart TD
    A[海外推文/短剧平台结算] -->|美金 USD 电汇| B[Wise / 万里汇虚拟账户]
    B -->|合规服务贸易结汇| C[境内银行卡 / 支付宝 / 微信]
    B -->|资金留存| D[海外消费或工具订阅]
\`\`\`

[图1]

为什么不能直接用国内银行卡收款？
因为国内个人外汇管理有非常明确的规定：个人储蓄账户原则上只接收直系亲属汇款或薪酬结汇，而海外短剧、推文分销属于“跨境技术与数字版权分润（也就是经常项目下的服务贸易）”。国内普通网点柜员根本无法直接审核海外平台的技术协议，因此遇到此类公对私电汇，几乎是一律原路退回。

而合规的跨境收款持牌机构（如蚂蚁集团旗下的万里汇 WorldFirst），本身就持有中国外汇管理局的跨境支付牌照与欧美多国的银行牌照。它们充当了合规申报的桥梁，帮你自动申报数字内容出海收入，钱才能光明正大地结汇回国。

---

### 二、 三大主流收款渠道横向排查：哪一个最适合新手？

目前市面上适合个人创作者的工具主要有 3 个，我们逐一拆解各自的优缺点：

#### 1. 万里汇 (WorldFirst - 蚂蚁集团旗下)
- **开户门槛**：极低。只要有中国大陆二代身份证 + 手机号，手机上就能完成实名认证。
- **核心优势**：针对国内个人极其友好，支持一键结汇打入国内支付宝或境内银行卡。
- **费用费率**：综合结汇手续费封顶在 0.3%（提现 1000 刀只扣 3 刀左右），没有任何账户管理月费。
- **新手建议**：如果你只是单纯想把推文分销佣金稳稳当当提回国内当零花钱，**首选万里汇**。

#### 2. Wise (前 TransferWise)
- **开户门槛**：中等。需要护照或身份证，以及一份规范的真实个人英文地址证明。
- **核心优势**：能为你开通一个完全以你个人名字开头的美国真实本地银行账户（ACH 路由号），兼容性极高。如果你赚了美金还打算用来订阅海外的 Midjourney、ChatGPT 等生产力工具，Wise 是最顺畅的蓄水池。
- **费用费率**：货币转换按国际中间汇率计算，电汇接收费通常在 $0.5 ~ $4 之间。

#### 3. Payoneer (派安盈)
- **开户门槛**：低，老牌机构。
- **核心缺点**：提现到国内银行卡的手续费偏高（普遍在 1.2% 左右），而且长期不活跃可能会扣小额账户管理年费。
- **新手建议**：只在海外平台仅支持派安盈收款时，作为备用渠道使用。

[图2]

---

### 三、 用中国大陆身份证开通的 4 个必备凭证（避开封号红线）

很多人在注册虚拟账户时，审核老是被驳回，反反复复折腾好几天。其实只要在动手前把下面这 4 样材料备齐，基本当天就能通过审核：

1. **身份证正反面超清扫描件**：拍照时四只角必须全部露出来，绝对不能被手指遮挡，更不能有大面积灯光反光。
2. **合规的个人地址证明（最容易踩坑！）**：
   - 很多新手拿居委会开的纸质证明、或者物业手写的收据去上传，系统 100% 驳回。
   - **最正规、最快的做法**：打开手机上的招商银行、工商银行或建设银行 App，找到你名下的任意一张信用卡，点击【导出最近一个月电子账单 PDF】。
   - 账单上必须清晰印有你的中文姓名、以及你居住的详细家庭地址（必须精确到门牌号）。由于银行电子账单自带公章水印，上传后风控系统通常一秒通过。
3. **推文平台分润后台全屏截图**：
   - 截取 ReelShort、WebNovel 或 TikTok 联盟后台的收入面板，上面能清晰看到你的创作者昵称与累计待结算美金。这证明你开设账户是为了接收合法的数字劳动报酬。
4. **一个稳定的个人独立邮箱**：
   - 建议使用 Outlook 或 Gmail，避免使用单位内网邮箱，防止重要风控验证邮件被误拦截。

[图3]

---

### 四、 避开 30% 预扣税：美国 W-8BEN 税表填写的保姆级要诀

很多创作者第一次在海外平台绑定收款时，系统会弹出一份全英文的税务调查表（通常是 Form W-8BEN）。

很多不懂英文的朋友直接一路乱点“Next”，结果到了月底结算时，惊恐地发现原本 1000 刀的佣金，直接被美国税务局（IRS）扣掉了 300 刀（扣税比例高达 30%）！

**这是因为你没有正确声明你的非美居民身份！**

作为生活在中国的个人创作者，中美两国之间有着非常完善的避免双重征税协定（Tax Treaty）。只要你花 2 分钟在后台如实填写 W-8BEN：
- 在身份一栏选择【Individual（个人）】；
- 永久居住地选择【China（中国）】；
- 在税收协定条款处勾选适用中美税收协定；
- 在个人纳税人识别号（Foreign Tax Identifying Number）一栏，直接填写你的中国大陆 18 位身份证号码！

只要这几步填对，平台就会判定你为合规非美创作者，数字分润的预扣税率就会直接从惩罚性的 30% 降为 0% 或极低协定税率，白白帮你省下几百美金的血汗钱。

{{HOOK_TO_S_TYPE}}

---

### 五、 每一分钱都要算清：从平台打款到微信零钱的真实手续费清单

最后，我们来算一笔明明白白的明细账，看看辛苦赚来的 1000 美金，最终落进自己的银行卡到底还剩多少：

- **第一道损耗：平台出金电汇费**。部分短剧或推文平台每次放款时，平台自身或其中转银行可能会扣除固定 5 到 15 美金的出金手续费（建议攒到 500 美金以上再统一提现）。
- **第二道损耗：虚拟账户接收费**。万里汇接收美金通常为 0 费用入账；Wise 接收本地 ACH 免费，电汇接收单笔约 4 美金。
- **第三道损耗：结汇人民币手续费**。万里汇提现结汇回国内银行卡，费率仅千分之三（按 1000 美金计算仅扣除 3 美金）。
- **第四道损耗：实时汇率点差**。持牌机构均按照中国外汇交易中心公布的实时在岸汇率结算，透明无隐藏暗扣。

**最终算下来：赚到的 1000 美金，实际到手约 982 到 988 美金等值人民币，综合磨损率被牢牢压在 1.5% 到 1.8% 以内。**

只要你走的是正规持牌结汇通道，完全不用担心资金来源合规问题，更不会遇到私人换汇被莫名冻结银行卡的绝望局面。赚海外美金，把基础链路铺得稳稳当当，后方无后顾之忧，前方才能全力以赴做好内容！`,
        satori_card_data: {
          card_title: '个人出海变现常用收款渠道对比',
          card_subtitle: '综合费率 · 门槛与开户实测',
          template_type: 'entity_cost_matrix',
          columns: ['收款通道', '开户门槛', '综合费率损耗', '到账时效', '合规安全性'],
          rows: [
            {
              item_name: '万里汇 (WorldFirst)',
              metrics: {
                '开户门槛': '大陆身份证 + 收益截图',
                '综合费率损耗': '结汇约 0.3% 封顶',
                '到账时效': '通常 2~4 小时',
                '合规安全性': '蚂蚁集团旗下，国内合规结汇',
              },
              highlight_tag: '新手首选',
            },
            {
              item_name: 'Wise 个人虚拟账户',
              metrics: {
                '开户门槛': '护照 + 规范地址账单',
                '综合费率损耗': '汇率按中间价，电汇约 $0.5',
                '到账时效': '1~2 个工作日',
                '合规安全性': '国际持牌，适合日常订阅与消费',
              },
              highlight_tag: '工具订阅必备',
            },
            {
              item_name: 'Payoneer (派安盈)',
              metrics: {
                '开户门槛': '身份证即可注册',
                '综合费率损耗': '提现费率约 1.2%',
                '到账时效': '1 个工作日',
                '合规安全性': '老牌跨国机构，平台兼容性好',
              },
              highlight_tag: '备用通道',
            },
          ],
          footer_note: '避坑建议：绝对不要使用非实名卡或私人中介过桥账户，避免资金被反洗钱系统无故冻结。',
          theme_color: 'emerald',
        },
      },
    },
  },
  solid_state_battery: {
    title: '全固态电池革命：MIT自愈合电解质突破与全球专利产业图谱',
    seed: SOLID_STATE_BATTERY_PLAN.seed_topic,
    sourceId: 'seed_battery_2026',
    plan: SOLID_STATE_BATTERY_PLAN,
    articles: SOLID_STATE_BATTERY_ARTICLES,
  },
};


