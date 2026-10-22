export type Archetype = 'M' | 'S' | 'I' | 'F' | 'T';

export type ThemeCategory =
  | 'practical_tutorials_sop' // 🛠️ 保姆级教程与实战SOP (手把手指南/工具链配置/代码与避坑)
  | 'global_digital_biz'      // 💼 商业模式与变现算账 (一人公司/Micro-SaaS/Stripe/利润拆解)
  | 'clean_energy_materials'  // ⚡ 硬核产业与新能源新材料 (固态电池/钙钛矿/宽禁带半导体)
  | 'frontier_ai_robotics'    // 🤖 前沿 AI 与未来计算 (顶尖实验室/具身智能/机械臂)
  | 'frontier_science'        // 🏛️ 顶尖学术与科研前沿 (海外名校/Nature/Science/研发机构)
  | 'pioneers_profiles';      // 👤 科技先锋与大师人物 (科学家/极客创始人/思维模型)

export interface SubCategoryItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  msiRoles: {
    M: string;
    S: string;
    I: string;
  };
  sampleSeeds: Array<{
    title: string;
    tag: string;
    highlight: string;
  }>;
}

export interface ThemeCategoryMeta {
  id: ThemeCategory;
  name: string;
  icon: string;
  shortLabel: string;
  description: string;
  exampleInstitutions: string[];
  sampleTags: string[];
  msiRoles: {
    M: string; // 头条定位
    S: string; // 次条定位
    I: string; // 三条定位
  };
  subCategories: SubCategoryItem[];
}

export const THEME_CATEGORIES_METADATA: ThemeCategoryMeta[] = [
  {
    id: 'practical_tutorials_sop',
    name: '🛠️ 保姆级教程与实战SOP',
    shortLabel: '实战教程',
    icon: 'Layers',
    description: '面向微信公众号高完读率、高收藏率的保姆级填空式实操教程，提供零基础可照着抄的工序、参数与配置代码',
    exampleInstitutions: ['GitHub Trending', 'Dev.to', 'Medium 极客专栏', 'Reddit r/LearnMachineLearning', 'Substack 独家实战'],
    sampleTags: ['保姆级教程', '手把手SOP', '零基础入门', '避坑参数', '代码实操', '配置清单'],
    msiRoles: {
      M: '小白破圈导读：用大白话讲清楚这个教程能帮你解决什么痛点、省下多少弯路',
      S: '显微级分步SOP：第一步点哪里、第二步改哪行配置，附带关键报错排查代码',
      I: '保姆级核对清单：可以直接照抄的配置文件、命令字典、避坑备忘录与工具箱',
    },
    subCategories: [
      {
        id: 'hands_on_workflow_sop',
        name: '自动化工作流与效率神器',
        badge: '生产力飞跃',
        description: 'Dify / Zapier / Make / n8n 自动化管道串联与无代码业务闭环搭建',
        msiRoles: {
          M: '普通人每天多睡两小时：用自动化工作流接管一切机械重复劳动',
          S: '7 个节点的自动化管道配置实操：从 Webhook 触发到大模型清洗的完整 SOP',
          I: '免费开源工作流模板下载包、常用 API 鉴权避坑与节点超时重试备忘表',
        },
        sampleSeeds: [
          {
            title: '手把手保姆级教程：用 n8n + DeepSeek 搭建全自动资讯监控与早报推送机器人（附导出版模板）',
            tag: '保姆级教程',
            highlight: '零代码30分钟跑通',
          },
          {
            title: '从 0 到 1 打造全自动邮件营销与客户线索清洗流水线：彻底解放双手的 5 个关键工序',
            tag: '实操SOP',
            highlight: '手把手填空式指南',
          },
        ],
      },
      {
        id: 'local_ai_tools_deploy',
        name: '本地大模型与AI私有化部署',
        badge: '数据零泄漏',
        description: 'Ollama、vLLM、ComfyUI、Open WebUI 本地部署、量化显存优化与私有知识库挂载',
        msiRoles: {
          M: '不用联网、不花一分钱算力费：如何在普通笔记本上拥有专属的私密大模型大脑',
          S: 'Ollama + OpenWebUI 极速配置指南：显存占用压制、量化版本选型与并发参数调优',
          I: '本地知识库向量切片避坑表：PDF解析乱码、Chunk重叠度设置与检索命中率翻倍技巧',
        },
        sampleSeeds: [
          {
            title: '保姆级教程：用单张 RTX 4060 显卡在本地运行满血 DeepSeek-R1 深度思考模型（含一键部署脚本）',
            tag: '极客教程',
            highlight: '普通电脑即可运行',
          },
          {
            title: '手把手教你搭建企业级私有知识库 (RAG)：从文档清洗到精确向量检索的完整避坑手册',
            tag: '企业落地',
            highlight: '零幻觉精准问答',
          },
        ],
      },
      {
        id: 'cross_border_stripe_sop',
        name: '出海建站与合规收款实操',
        badge: '出海第一步',
        description: 'Next.js 快速建站、LemonSqueezy/Stripe 接入、域名防封与离岸账户配置流程',
        msiRoles: {
          M: '给国内开发者的出海收美金第一课：避开 90% 新手必踩的封号冻卡雷区',
          S: 'Stripe 网站合规条款 7 大必填项实操：退款政策、物理地址与客服时效模版直接套用',
          I: '出海收款全渠道通道费率对比表、提现结汇防冻卡操作 SOP 与报税防双重征税指南',
        },
        sampleSeeds: [
          {
            title: '国内开发者手把手出海教程：从申请境外虚拟卡到成功收取第一笔美金的完整图文工序',
            tag: '保姆级指南',
            highlight: '真实账单与避坑截图',
          },
        ],
      },
    ],
  },
  {
    id: 'frontier_science',
    name: '🏛️ 科技研发与顶尖科研',
    shortLabel: '科技研发',
    icon: 'GraduationCap',
    description: '追踪海外顶尖高校 (MIT, Stanford, Oxford) 及顶刊 (Nature, Science) 重磅科研进展与基础科学突破',
    exampleInstitutions: ['MIT 麻省理工学院', 'Stanford 斯坦福', 'Oxford 牛津', 'Nature 正刊', 'Max Planck 马普所'],
    sampleTags: ['顶刊论文', '脑机接口', '量子纠缠', '常温超导', '合成生物', 'MIT突破'],
    msiRoles: {
      M: '破圈认知科普（通俗比喻消除门槛，讲透颠覆性原理）',
      S: '极客机理拆解（深入论文实验数据、控制变量与机理图）',
      I: '论文精读导航（正刊原文索引、核心作者背景与自学开源库）',
    },
    subCategories: [
      {
        id: 'quantum_superconductor',
        name: '量子计算与常温超导',
        badge: '物理极限突破',
        description: '量子比特相干时间、逻辑量子位纠错及常温/近常温超导实验机理验证',
        msiRoles: {
          M: '颠覆性原理通俗科普：用大白话讲透为何“微观纠缠”能掀翻传统超算',
          S: '极低温实验装置与超导能隙数据：拆解稀释制冷机工艺与电导跃迁曲线',
          I: '论文原文索引与开源仿真包：官方论文下载、核心作者实验室与开源Qiskit代码',
        },
        sampleSeeds: [
          {
            title: 'MIT 物理系宣布多层扭角石墨烯强关联态重大突破：超导临界温度提升 3 倍',
            tag: 'Nature 顶刊',
            highlight: '凝聚态物理新里程碑',
          },
          {
            title: '哈佛与 QuEra 联合实验室发布 1000 逻辑量子比特纠错新方案，保真度达 99.9%',
            tag: '量子计算',
            highlight: '容错量子计算曙光',
          },
          {
            title: 'Science 封面重磅复现：室温高压金属氢化物超导最新实测数据与争议终结',
            tag: 'Science封面',
            highlight: '基础物理百年悬案',
          },
        ],
      },
      {
        id: 'bci_neural',
        name: '脑机接口与神经工程',
        badge: '生命科技前沿',
        description: '高通量柔性电极、脊髓损伤神经桥接、侵入式与非侵入式意念解码技术',
        msiRoles: {
          M: '意念打字与生命重塑通俗前瞻：普通人如何看待脑机接口的伦理与现实能力',
          S: '1024通道超柔性微丝阵列与滤波机理：神经信号降噪算法与抗胶质细胞包裹',
          I: '全球人体试验审批进度与公开脑波集：FDA突破性医疗器械资质与开源分析套件',
        },
        sampleSeeds: [
          {
            title: '斯坦福神经工程实验室：瘫痪患者植入式脑机接口意念打字速度突破每分钟 90 词',
            tag: '临床实测',
            highlight: '接近正常人打字速度',
          },
          {
            title: 'Neuralink 柔性微丝抗排异涂层升级：180 天长期植入信号衰减率降至 5% 以下',
            tag: '工程工艺',
            highlight: '生物相容性突破',
          },
        ],
      },
      {
        id: 'synthetic_biology',
        name: '合成生物与分子机器',
        badge: '人工生命进化',
        description: 'AI设计人工酶、精准基因编辑剪刀、合成酵母人造染色体与生物制造',
        msiRoles: {
          M: '人造生命与绿色制造宏观视野：从石油化工到细胞工厂的万亿产业变革',
          S: '蛋白质从头设计晶体结构分析：AlphaFold与生成式扩散模型设计特异性结合蛋白',
          I: '专利授权池与合成生物试剂库：全球前沿专利持有人分布与生物催化剂选型表',
        },
        sampleSeeds: [
          {
            title: '华盛顿大学 Baker 实验室：完全由 AI 从头生成的超级催化酶实现工业级降解塑料',
            tag: 'Nature封面',
            highlight: '分子设计新纪元',
          },
          {
            title: 'CRISPR-Cas12f 极微型基因剪刀系统：通过单次腺相关病毒实现全身安全靶向递送',
            tag: '基因治疗',
            highlight: '体内递送瓶颈突破',
          },
        ],
      },
    ],
  },
  {
    id: 'clean_energy_materials',
    name: '⚡ 新能源与新材料',
    shortLabel: '新能源材料',
    icon: 'Zap',
    description: '聚焦全固态电池、钙钛矿光伏、宽禁带半导体、先进合金等从实验室走向产线的硬核材料革命',
    exampleInstitutions: ['Joule 顶刊', 'Materials Today', 'DOE 橡树岭实验室', '中科院物理所', 'QuantumScape'],
    sampleTags: ['全固态电池', '硫化物电解质', '钙钛矿叠层', '碳化硅半导体', '航天复合材料', '锂枝晶抑制'],
    msiRoles: {
      M: '产业风暴突围（直击里程碑突破，重塑大众对续航/安全的认知）',
      S: '工艺与量产拆解（深度透视纳米制备、良率壁垒与关键工序）',
      I: '产业图谱与专利卡位（全球龙头厂商布局对比、量产时间表与投资风向）',
    },
    subCategories: [
      {
        id: 'solid_state_battery',
        name: '全固态电池与界面自愈合',
        badge: '2026量产前夜',
        description: '硫化物/氧化物固态电解质、无负极锂金属电池及抗枝晶穿刺纳米缓冲层',
        msiRoles: {
          M: '彻底打破电池自燃与续航焦虑：用通俗大白话讲透为什么固态电池是终局方案',
          S: '12nm非晶层自愈合CVI工艺与阻抗谱测试：微观切片与大电流临界电流密度剖析',
          I: '全球五大电池巨头专利卡位与商业化时间表：丰田、宁德时代、清陶技术对比',
        },
        sampleSeeds: [
          {
            title: '全固态电池技术突破：MIT 纳米自愈合电解质突破 500 Wh/kg 与 10C 极速快充',
            tag: 'Science封面',
            highlight: '抗枝晶穿刺突破',
          },
          {
            title: '丰田汽车宣布硫化物固态电解质试装雷克萨斯旗舰轿车，2027 年小批量商业化',
            tag: '产业落地',
            highlight: '1300件专利壁垒',
          },
          {
            title: '宁德时代与清陶能源半固态向全固态过渡线良率突破 82%，降本路径明确',
            tag: '量产攻坚',
            highlight: 'GWh级产线验证',
          },
        ],
      },
      {
        id: 'perovskite_pv',
        name: '钙钛矿叠层高效光伏',
        badge: '光伏第三次革命',
        description: '钙钛矿/晶硅两端叠层、全钙钛矿四端叠层及真空刮涂大面积组件稳定性',
        msiRoles: {
          M: '屋顶电厂新纪元：光电转换效率突破 34% 背后的技术奇迹与度电成本断崖',
          S: '气相刮涂法与钝化分子层工艺拆解：如何让极度怕水的钙钛矿在户外撑过 25 年',
          I: '全球百兆瓦级中试线投资与量产甘特图：协鑫光电、极电光能与牛津光伏路线对比',
        },
        sampleSeeds: [
          {
            title: '中科院与牛津大学联合团队：全钙钛矿叠层电池实测稳态光电转换效率达 34.6%',
            tag: 'Joule顶刊',
            highlight: '打破晶硅理论极限',
          },
          {
            title: '百兆瓦级钙钛矿光伏组件量产线全线贯通，度电发电成本预计突破 0.1 元',
            tag: '产线实测',
            highlight: '平价上网新标杆',
          },
        ],
      },
      {
        id: 'wide_bandgap_semi',
        name: '碳化硅与宽禁带半导体',
        badge: '电力电子基石',
        description: '8英寸碳化硅 (SiC) 衬底晶圆、氮化镓 (GaN) 高频功率器件及超宽禁带氧化镓',
        msiRoles: {
          M: '800V高压快充背后的硬核英雄：为什么新能源车必须从硅基换成碳化硅',
          S: '物理气相传输法 (PVT) 晶体生长缺陷控制：微管与螺位错密度压制实操工艺',
          I: '全球第三代半导体产业链格局：意法半导体、Wolfspeed与国产 IDM 龙头矩阵',
        },
        sampleSeeds: [
          {
            title: '8英寸碳化硅晶圆综合良率攀升至 70%，国内新能源车主驱逆变器启动全面替换',
            tag: '产业链重构',
            highlight: '降本拐点来临',
          },
          {
            title: '第四代超宽禁带氧化镓 (Ga2O3) 功率器件突破 10kV 耐压极限，损耗降低 80%',
            tag: '前沿探索',
            highlight: '下一代高压电网',
          },
        ],
      },
    ],
  },
  {
    id: 'global_digital_biz',
    name: '💼 商业模式与全球出海',
    shortLabel: '商业模式',
    icon: 'Globe',
    description: '拆解海外独立软件 (Micro-SaaS)、自动化工作流与全球数字游民出海真实商业化案例',
    exampleInstitutions: ['Product Hunt', 'IndieHackers', 'HackerNews', 'Substack 科技专栏'],
    sampleTags: ['独立开发出海', 'Micro-SaaS', 'AI工作流变现', '数字游民', '自动化获客'],
    msiRoles: {
      M: '商业机会洞察（海外闷声发财的冷门赛道与真实盈利模式）',
      S: '从0到1执行SOP（完整的极简产品搭建、选型与获客推广路径）',
      I: '长效运营与合规防坑（用户留存策略、阶梯定价与风控避坑要点）',
    },
    subCategories: [
      {
        id: 'micro_saas_indie',
        name: '独立开发微型 SaaS',
        badge: '单人月入 $10k+',
        description: '面向海外细分垂直市场的单人 Micro-SaaS、Chrome 插件与工具型小软件',
        msiRoles: {
          M: '单人年入百万的冷门海外 SaaS 账本揭秘：摆脱内卷、赚美金的底层商业逻辑',
          S: 'Next.js + Supabase + Stripe 极简技术栈：一个人 7 天跑通从代码到收款全工序',
          I: 'Product Hunt 冲榜与 Reddit 冷启动获客实操：零广告费获取前 100 个付费客户指南',
        },
        sampleSeeds: [
          {
            title: '一人公司实战：基于 AI 自动生成合同审查的微型 SaaS，6 个月做到 $28,000 MRR',
            tag: 'IndieHackers',
            highlight: '高毛利轻量级业务',
          },
          {
            title: '海外独立开发者 3 年打造 5 款 Micro-SaaS 矩阵，月均被动收入稳定超 10 万元',
            tag: '矩阵出海',
            highlight: '抗风险多业务模型',
          },
        ],
      },
      {
        id: 'tiktok_content_workflow',
        name: '海外短剧推文与内容工作流',
        badge: '流量变现爆发',
        description: '利用大模型批量二创海外短剧与小说推文、TikTok/YouTube Shorts 流量分润',
        msiRoles: {
          M: '海外短剧推文单日佣金破千美金实操账单：普通人业余时间搞副业的算账逻辑',
          S: '15分钟搞定一条爆款推文视频的分镜全流程：Gemini 画面生成与剪映对齐 SOP',
          I: '大陆个人合规境外收汇实测通道全对比：免冻卡、规避 30% 预扣税与安全入账',
        },
        sampleSeeds: [
          {
            title: '出海短剧推文 CPS 暴利实操：普通人如何用 AI 批量跑出月佣 3000 美金',
            tag: '流量实操',
            highlight: '零代码视频工作流',
          },
          {
            title: 'TikTok 短视频自动化洗稿与多语言解说：单条视频爆破 50 万播放的选材心法',
            tag: '爆款逻辑',
            highlight: '海外算法推荐机制',
          },
        ],
      },
      {
        id: 'crossborder_ecommerce',
        name: '跨境出海与数字游民商业',
        badge: '全球地理套利',
        description: '海外客制化独立站、数字资产交易与全球数字游民轻资产商业化路径',
        msiRoles: {
          M: '全球地理套利：赚美金、在低成本城市生活，数字游民真实财务模型全透明公开',
          S: 'Shopify 极简独立站测款与 TikTok 原生带货视频脚本工序手册',
          I: '离岸银行账户开立指南、Stripe 账户合规防封技巧与海外退税避坑手册',
        },
        sampleSeeds: [
          {
            title: '客制化文创独立站出海：依靠国内柔性供应链与海外 Instagram 视觉营销年赚 200 万',
            tag: '高客单价',
            highlight: '文化与视觉溢价',
          },
          {
            title: '数字游民实测报告：清迈与巴厘岛旅居 1 年的真实开销、纳税申报与网络资产搭建',
            tag: '生活方式',
            highlight: '地理套利全复盘',
          },
        ],
      },
    ],
  },
  {
    id: 'frontier_ai_robotics',
    name: '🤖 前沿 AI 趋势与具身计算',
    shortLabel: '前沿AI趋势',
    icon: 'Bot',
    description: '跟踪 OpenAI, DeepMind, Anthropic 及波士顿动力等最新具身智能机械臂、多模态架构与未来计算',
    exampleInstitutions: ['OpenAI', 'Google DeepMind', 'Anthropic', 'Stanford HAI', 'Figure AI'],
    sampleTags: ['具身智能', '人形双臂', '多模态视触觉', '大模型推理自进化', 'AI for Science', '光子计算'],
    msiRoles: {
      M: '范式转移前瞻（具身机器人与下一代模型带来的震撼感官体验）',
      S: '底层架构揭秘（端到端对齐算法、强化学习细节与机械动力学）',
      I: '开发者实操工具（开源代码库上手、实测 Demo 与行业落地变现启发）',
    },
    subCategories: [
      {
        id: 'embodied_robotics',
        name: '具身智能与人形机器人',
        badge: '物理世界大模型',
        description: 'VLA (视觉-语言-动作) 统一模型、力控末端机械臂、双足行走控制与工厂搬运',
        msiRoles: {
          M: '具身机器人进厂打螺丝到底行不行：消除科幻滤镜，讲透人形机器人商用化的真假痛点',
          S: '端到端强化学习 (RL) 与动作分块算法 (ACT) 拆解：从摄像机像素到电机转角的全过程',
          I: '开源具身平台与机械臂选型指南：Isaac Sim 仿真器上手、开源训练集与极客自制方案',
        },
        sampleSeeds: [
          {
            title: 'Figure 02 人形双臂机器人进驻宝马斯帕坦堡工厂实机测试：端到端推理仅需 15ms',
            tag: '工厂实战',
            highlight: '工业级装配突破',
          },
          {
            title: '斯坦福 Mobile ALOHA 2.0：用开源代码与两万美元自制能洗碗炒菜的家务双臂',
            tag: '开源项目',
            highlight: '低成本极客复刻',
          },
          {
            title: '波士顿动力全电 Atlas 360 度关节超人体动作库实测与动力学控制算法揭秘',
            tag: '硬件极限',
            highlight: '纯电驱液压替代',
          },
        ],
      },
      {
        id: 'deep_reasoning_rl',
        name: '深度思考链与强化学习自进化',
        badge: 'o1/R1范式突围',
        description: '测试时推理算力扩展 (Test-time compute scaling)、过程奖励模型 (PRM) 与思维链',
        msiRoles: {
          M: '大模型长出“慢思考大脑”：彻底告别张嘴胡说，颠覆性推理范式如何改变一切工作',
          S: '纯强化学习自我博弈 (Self-Play) 代码实现剖析：模型如何自己跟自己下棋长出长思维链',
          I: '本地 DeepSeek-R1 / Qwen 推理引擎部署指南：Ollama、vLLM 并发优化与长思考调优参数',
        },
        sampleSeeds: [
          {
            title: 'DeepSeek-R1 纯强化学习训练全过程深度剖析：无需海量人类标注的自进化之路',
            tag: '开源突破',
            highlight: '推理成本降至几十分之一',
          },
          {
            title: 'OpenAI o1 架构与测试时推理扩展规律 (Test-Time Compute Scaling) 论文深度拆解',
            tag: '学术前沿',
            highlight: '大模型新摩尔定律',
          },
        ],
      },
      {
        id: 'ai_agent_swarms',
        name: 'AI Agent 智能体集群与自动化开发',
        badge: '软件工程颠覆',
        description: '自主软件工程师智能体、多 Agent 协同工作流及长上下文工具链调用 (MCP协议)',
        msiRoles: {
          M: '一人指挥十个 AI 员工的时代：软件开发模式与数字白领工作的不可逆重构',
          S: 'Claude Code 与 MCP 架构深度拆解：如何让智能体在百万行代码库中自主找 Bug 并提 PR',
          I: '企业与个人 Agent 框架选型全景图：LangGraph、AutoGen、CrewAI 对比及熔断防死循环实战',
        },
        sampleSeeds: [
          {
            title: '多 Agent 自主协同全栈开发实战：从一份简单需求说明书到全自动发布上线的 48 小时',
            tag: 'Agent实战',
            highlight: '零人工介入完成代码',
          },
          {
            title: 'MCP (Model Context Protocol) 开放协议生态爆发：如何让任何大模型安全操作你的本地终端',
            tag: '基础设施',
            highlight: 'AI 工具调用统一标准',
          },
        ],
      },
    ],
  },
  {
    id: 'pioneers_profiles',
    name: '👤 极客先锋与大师人物',
    shortLabel: '大师人物',
    icon: 'UserCheck',
    description: '深度刻画诺奖/图灵奖得主、顶尖实验室 PI、硬核极客创始人与超级个体的学术生涯、思维模型与工作哲学',
    exampleInstitutions: ['Quanta Magazine', 'Lex Fridman', 'YC 创始人专访', '图灵奖文献库'],
    sampleTags: ['科学家传奇', '极客创始人', '心智模型', '科研工作流', '超级个体', '反常识抉择'],
    msiRoles: {
      M: '人物传奇与关键抉择（跌宕学术/创业生涯、逆境突破与底层信仰）',
      S: '高产心智模型（大师的时间管理、极速文献研读与精力分配工作流）',
      I: '大师思想武器库（公开推荐书单、研究笔记、知识库与工具链清单）',
    },
    subCategories: [
      {
        id: 'scientist_legends',
        name: '诺奖科学家与学术巨匠',
        badge: '人类理性灯塔',
        description: '图灵奖得主、诺贝尔物理/化学/医学奖科学家跨越数十年的科研长跑与顿悟时刻',
        msiRoles: {
          M: '逆风坐穿四十年冷板凳的科学巨匠：用生命讲透什么是真正不可替代的热爱与执着',
          S: '科学大师的文献阅读与灵感捕捉工作流：如何从上万篇垃圾论文中一针见血抓出核心盲点',
          I: '大师学术生涯核心代表作精读清单、手稿研读指南与推荐研究生必读书目',
        },
        sampleSeeds: [
          {
            title: '对抗主流学界 30 年的 Geoffrey Hinton：从被嘲笑的连接主义异端到诺贝尔物理学奖得主',
            tag: '诺奖传奇',
            highlight: '深度学习教父的执念',
          },
          {
            title: 'AlphaFold 之父 Demis Hassabis：从国际象棋神童到用 AI 攻克蛋白质折叠的极客战略家',
            tag: '跨界大师',
            highlight: '科研与工程的完美结合',
          },
        ],
      },
      {
        id: 'indie_founders',
        name: '硬核创始人与超级个体',
        badge: '商业极客心法',
        description: '从车库走出的极客创始人、一人独当一面的超级个体与反共识商业领袖',
        msiRoles: {
          M: '反共识商业决策时刻：顶级极客创始人在至暗时刻如何凭第一性原理押注未来',
          S: '极致精简的创始人管理心法：扁平化架构、取消 PPT 汇报与直接面对一线代码',
          I: '极客创始人自用软件清单、终身学习知识管理系统与必读创业兵法',
        },
        sampleSeeds: [
          {
            title: '黄仁勋的非典型管理哲学：40位高管直接汇报、从不单独一对一开会的扁平化机制',
            tag: '组织哲学',
            highlight: '光速信息流通网络',
          },
          {
            title: '彼得·蒂尔从 0 到 1 的逆向思考心法：真正的商业秘密从来都藏在所有人都不相信的地方',
            tag: '投资心法',
            highlight: '反共识竞争策略',
          },
        ],
      },
    ],
  },
];


export interface ScraperTask {
  engine: 'exa_search' | 'apify_rag_browser' | 'apify_reddit' | 'apify_twitter' | 'local_crawl4ai';
  query_or_url: string;
  extraction_focus: string;
}

export interface CrossLinkHook {
  target_archetype: Archetype;
  target_title: string;
  insert_after_section: string;
  hook_callout_markdown: string;
}

export interface ImageSlotDirective {
  slot_id: string;
  title: string;
  slot_type: 'screenshot' | 'satori_card' | 'workflow_diagram' | 'proof_photo' | 'ai_photo' | 'metric_card';
  recommended_size: string; // e.g. "16:9 横屏 (1280x720 推荐横图)", "2:1 宽幅长横图 (1200x600)", "4:3 紧凑横图", "9:16 手机界面实录"
  aspect_ratio?: '16:9' | '2:1' | '4:3' | '9:16' | '1:1';
  description: string; // 具体画面内容：实物、环境、构图
  source_suggestion: string; // 可抓取原推文配图，或手机截图，或AI生成
  caption: string;
  // Anti-AI Prompt Engineering Fields
  ai_prompt_en?: string; // 英文生图提示词 (适配 Midjourney v6 / FLUX.1 / SDXL，含镜头与真实光影)
  ai_prompt_zh?: string; // 中文意图描述与画面构思
  negative_prompt?: string; // 去AI味反向提示词 (过滤塑料光泽、荧光科幻、扭曲文字、畸变肢体)
  anti_ai_technique?: string; // 去AI感拍摄技巧 (如: 35mm自然漫射光、景深虚化、胶片颗粒感)
  mobile_readability_warning?: string; // 手机端避坑提醒 (如: 严禁在图内生成英文小字/数字，易模糊或生成乱码)
  revenue_substitute_strategy?: string; // 针对收益/后台数据的替代策略 (如: Satori矢量卡片替代、大厂脱敏公开数据重构、景深虚化笔电实拍)
  preview_image_url?: string; // 预览图 URL
  target_engine?: 'gemini' | 'midjourney_flux'; // 针对不同生图引擎优化
  raw_match?: string; // 正文中匹配到的原始标记字符串
  start_index?: number; // 在文章中的字符起始偏移量
  end_index?: number; // 在文章中的字符结束偏移量
  is_inserted?: boolean; // 是否已经在该位置插入了实际图片
  image_url?: string; // 插入的实际图片 URL 或 Base64 数据
}

export interface VisualSpec {
  mermaid_flowchart_topic: string;
  satori_card_type: 'platform_comparison' | 'prompt_before_after' | 'entity_cost_matrix';
  card_key_metrics: string[];
  image_slots?: ImageSlotDirective[];
}

export interface ArticleBlueprint {
  archetype: Archetype;
  publish_slot: string;
  msi_role_label?: string;
  wechat_title: string;
  core_angle: string;
  forbidden_scope: string;
  outline_sections: string[];
  scraper_tasks: ScraperTask[];
  visual_spec: VisualSpec;
  cross_links: CrossLinkHook[];
  is_custom_curated?: boolean;
  source_article_content?: string;
  source_word_count?: number;
  source_media_urls?: string[];
}

export interface DailyClusterPlan {
  cluster_id: string;
  seed_topic: string;
  theme_category?: ThemeCategory;
  category_label?: string;
  sub_category?: string;
  sub_category_label?: string;
  tags?: string[];
  cluster_logic_summary: string;
  narrative_mode?: string;
  source_reference_id?: string;
  articles: ArticleBlueprint[];
}

export interface SatoriCardRow {
  item_name: string;
  metrics: Record<string, string>;
  highlight_tag?: string;
}

export interface SatoriCardPayload {
  card_title: string;
  card_subtitle: string;
  template_type: 'platform_comparison' | 'prompt_before_after' | 'entity_cost_matrix';
  columns: string[];
  rows: SatoriCardRow[];
  footer_note: string;
  theme_color?: 'slate' | 'amber' | 'emerald' | 'cyan';
}

export interface CoverSpec {
  headline_text: string;
  prominent_figure?: string;
  visual_focus: string;
  prompt_en: string;
  prompt_zh: string;
  aspect_ratio: string;
  negative_prompt?: string;
}

export interface DraftArticleOutput {
  archetype: Archetype;
  wechat_title: string;
  digest_summary: string;
  markdown_content: string;
  word_count?: number;
  image_slots?: ImageSlotDirective[];
  satori_card_data?: SatoriCardPayload;
  created_at?: string;
  slot_images?: Record<string, string>; // Maps slot_id or slot index -> uploaded/imported image base64 data URL or external URL
  slot_prompts?: Record<string, { promptEn: string; promptZh: string; negativePrompt?: string }>; // Maps slot_id -> current prompt
  cover_image_url?: string;
  cover_prompt_en?: string;
  cover_prompt_zh?: string;
  cover_spec?: CoverSpec;
  source_media_urls?: string[];
}

export interface StylePersona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tonePrompt: string;
  negativePrompt: string;
}

export interface AntiAILintResult {
  score: number; // 0-100 (100 is completely authentic human, 0 is full AI slop)
  wordCount: number;
  wordCountStatus: 'too_short' | 'perfect' | 'too_long';
  bannedWordsFound: Array<{
    word: string;
    count: number;
    context: string;
    suggestedReplacements?: string[];
    isCustom?: boolean;
    category?: string;
  }>;
  structuralClichés: string[];
  clicheHeadingsFound?: Array<{ rawHeading: string; suggestedReplacement: string; reason: string }>;
  burstinessScore: number;
  imageSlotsCount: number;
  suggestions: string[];
}

export interface ReverseInquiryCard {
  id: string;
  archetype: Archetype;
  questionTitle: string; // LLM 逆向发问标题（普通人关心的真实痛点）
  subHeadline?: string; // 痛点副标题
  coreDoubt: string; // 核心质疑/深层痛点阐述
  audiencePainPoint: {
    point: string;
    userQuote: string; // 读者大白话真实吐槽/发问
    category: string;
  };
  communityHarvest: {
    platform: 'twitter' | 'reddit' | 'x' | 'github' | 'community' | 'nature_science';
    sourceLabel: string; // e.g. "Twitter @levelsio 实战经验帖" or "Reddit r/SaaS 深度避坑实录"
    author: string;
    url?: string;
    keyPoints: string[]; // 检索聚合的 3~4 条一手实操干货与工艺细节
    quoteSnippet: string; // 原汁原味社区引用
  };
  verification: {
    viralScore: number; // 吸睛指数 (85-99)
    trendSignal: string; // 热搜风向标
    seoVolumeMonthly: string; // 月均搜索量 e.g. "320,000+ 次/月"
    seoKeywords: string[]; // 高权重长尾词
    searchIntentLabel: string; // 搜索意图强弱标签
    competitionLevel: 'low' | 'medium' | 'high';
  };
  suggestedWeChatTitle: string; // 爆款公众号拟定标题
  recommendedAngle: string; // 深度特稿核心切入角度
  status: 'active' | 'eliminated' | 'approved';
}

export interface ReverseInterrogationResult {
  sourceTitle: string;
  sourceSummary: string;
  sourceUrl?: string;
  category: ThemeCategory;
  inquiries: ReverseInquiryCard[];
  eliminatedCount: number;
  generatedAt?: string;
}

export interface SourceHarvestItem {
  id: string;
  category: ThemeCategory;
  platform: 'twitter' | 'reddit' | 'wechat' | 'substack' | 'nature_science' | 'arxiv_univ';
  author: string;
  institution?: string; // 知名院校/实验室，如 MIT, Stanford, Oxford, DeepMind, Max Planck
  title: string;
  url: string;
  summary: string;
  raw_text: string;
  tags?: string[];
  original_images?: Array<{ url: string; caption: string; size: string }>;
  weaknesses_in_original: string[]; // 原帖不足：如太专业、只讲理论不讲操作、缺乏国内落地渠道
  enhancement_strategy: string[]; // 二创改进方案：通俗小白化、展开至2000-4000字、增补配图指令
  msi_preset_angles?: {
    m_angle: string;
    s_angle: string;
    i_angle: string;
  };
}

export interface ArticleArchiveItem {
  id: string;
  created_at: string;
  theme_category: ThemeCategory;
  category_label: string;
  seed_topic: string;
  tags: string[];
  articles: Array<{
    archetype: Archetype;
    publish_slot: string;
    msi_role_label?: string;
    wechat_title: string;
    digest_summary: string;
    markdown_content: string;
    word_count: number;
    image_slots?: ImageSlotDirective[];
    cover_image_url?: string;
    slot_images?: Record<string, string>;
    slot_prompts?: Record<string, any>;
  }>;
  total_word_count: number;
  status: 'draft' | 'ready_to_publish' | 'published';
}

// ==========================================
// 微信公众号矩阵发布栏位元数据 (1~5 篇栏位生态位定义)
// ==========================================
export interface SlotArchetypeMeta {
  archetype: Archetype;
  slotNumber: number;
  slotName: string;
  roleName: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  writingGuidance: string;
}

export const SLOT_ARCHETYPE_METADATA: Record<Archetype, SlotArchetypeMeta> = {
  M: {
    archetype: 'M',
    slotNumber: 1,
    slotName: '第 1 篇 (头条)',
    roleName: '头条深度特稿',
    badgeBg: 'bg-amber-100 border-amber-300',
    badgeText: 'text-amber-900',
    description: '面向大众与深度读者，撕开表象，从一手现场与微观事实展开，冲刺全网高阅读量与完读率。',
    writingGuidance: '严禁堆砌晦涩公式与空洞口号，必须用具体账目、真金白银、一手数据与事实说话。',
  },
  S: {
    archetype: 'S',
    slotNumber: 2,
    slotName: '第 2 篇 (次条)',
    roleName: '次条深度拆解',
    badgeBg: 'bg-sky-100 border-sky-300',
    badgeText: 'text-sky-900',
    description: '面向专业从业者与硬核读者，解剖微观机理，提供填空式参数、配置代码与实操步骤。',
    writingGuidance: '聚焦在具体工序、底层机理、真实参数与避坑实操，层层抽丝剥茧。',
  },
  I: {
    archetype: 'I',
    slotNumber: 3,
    slotName: '第 3 篇 (三条)',
    roleName: '三条前沿观察',
    badgeBg: 'bg-emerald-100 border-emerald-300',
    badgeText: 'text-emerald-900',
    description: '梳理一手避坑经验、高频翻车雷区、行业洗牌终局与行动核对表。',
    writingGuidance: '给出条目化、可核对、可落地的防坑行动清单与商业生态位防守策略。',
  },
  F: {
    archetype: 'F',
    slotNumber: 4,
    slotName: '第 4 篇 (四条)',
    roleName: '四条独家透视',
    badgeBg: 'bg-indigo-100 border-indigo-300',
    badgeText: 'text-indigo-900',
    description: '对海外大厂动态、硅谷争论或权威报告进行一针见血的深度点评与趋势分析。',
    writingGuidance: '观点犀利、直击商业与技术本质，结合国内读者生态给出独立判断。',
  },
  T: {
    archetype: 'T',
    slotNumber: 5,
    slotName: '第 5 篇 (五条)',
    roleName: '五条实战指南',
    badgeBg: 'bg-purple-100 border-purple-300',
    badgeText: 'text-purple-900',
    description: '开箱海外高赞项目、前沿工具与极速上手指南，强调即开即用、省时省力。',
    writingGuidance: '强调即开即用、零基础跑通，附带一键克隆安装与配置避坑建议。',
  },
};

// ==========================================
// 模型与第三方 API 服务配置 (Model & Provider API Config)
// ==========================================
export type LLMProvider = 'gemini' | 'siliconflow' | 'openai_compatible';

export interface StageModelMapping {
  plannerModel?: string;      // 01. 选题策划与裂变蓝图 (默认跟随主模型)
  writerModel?: string;       // 02. 深度长文撰稿工坊 (默认跟随主模型)
  humanizerModel?: string;    // 03. 去AI味与人设润色 (如 DeepSeek-R1 / DeepSeek-V3)
  imageModel?: string;        // 04. 微信视觉配图生图 (如 FLUX.1-schnell / Imagen 3)
}

export interface ModelConfig {
  provider: LLMProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  stageModels?: StageModelMapping;

  // Google AI 搜索与联网 Grounding
  googleSearchEnabled: boolean;
  googleSearchRecency?: 'day' | 'week' | 'month';

  // AI 生图与封面服务
  imageProvider: 'gemini' | 'siliconflow_flux' | 'siliconflow' | 'openai_compatible' | 'prompt_only';
  imageModel: string;
  imageApiKey?: string;
  imageBaseUrl?: string;

  // Apify 自动化抓取配置 (Twitter / X 全球搜索与 Reddit 热门采掘)
  apifyToken?: string;
  twitterSearchKeywords?: string[];

  // 海外定向订阅源配置 (用户可界面自定义，无需改代码)
  customSubreddits?: string[];
  customTwitterKols?: string[];
  customRssUrls?: Array<{ name: string; url: string; category: ThemeCategory }>;

  // 公众号矩阵偏好
  defaultSlotCount?: 1 | 3 | 5;
  personaId?: string;
  customTonePrompt?: string;

  temperature: number;
  maxTokens: number;
}

export interface ProviderPreset {
  provider: LLMProvider;
  name: string;
  description: string;
  defaultBaseUrl: string;
  recommendedModels: Array<{ id: string; name: string; tag: string }>;
  recommendedImageModels?: Array<{ id: string; name: string; tag: string }>;
  apiKeyPlaceholder: string;
  apiDocsUrl: string;
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    provider: 'gemini',
    name: 'Google Gemini (官方推荐·Google AI 搜索与深度撰稿)',
    description: '使用 Google 官方 Gemini 3.8 / 2.5 Flash / Pro 大模型，原生集成 Google Search 联网检索',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    recommendedModels: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (官方推荐·极速与深度分析)', tag: '推荐默认' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (超长上下文深度推演)', tag: '旗舰深度' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (稳定百万上下文长文)', tag: '经典稳定' },
    ],
    recommendedImageModels: [
      { id: 'imagen-3.0-generate-002', name: 'Imagen 3 (高画质写实无AI塑料味)', tag: '官方生图' },
    ],
    apiKeyPlaceholder: 'AIzaSy... (在 Google AI Studio 自动注入或手动配置)',
    apiDocsUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    provider: 'siliconflow',
    name: '硅基流动 SiliconFlow (国内高性价比·DeepSeek & FLUX)',
    description: '国内超高性价比与低延时推理服务商，原生支持 DeepSeek-V3 / R1 与 FLUX.1 生图',
    defaultBaseUrl: 'https://api.siliconflow.cn/v1',
    recommendedModels: [
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3 (推荐·去AI味爆款写作首选)', tag: '最强爆款' },
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek-R1 (深度思维链·硬核科研拆解)', tag: '推理深度' },
      { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B (通义千问指令增强)', tag: '通用强大' },
      { id: 'THUDM/glm-4-9b-chat', name: 'GLM-4 9B (智谱清华轻量高性价比)', tag: '经济高速' },
      { id: 'Pro/deepseek-ai/DeepSeek-V3', name: 'Pro/DeepSeek-V3 (企业级专线保障)', tag: '高并发稳定' },
    ],
    recommendedImageModels: [
      { id: 'black-forest-labs/FLUX.1-schnell', name: 'FLUX.1-schnell (超快横屏写实渲染)', tag: '生图推荐' },
      { id: 'black-forest-labs/FLUX.1-dev', name: 'FLUX.1-dev (摄影师胶片质感高保真)', tag: '极高画质' },
      { id: 'stabilityai/stable-diffusion-3-5-large', name: 'SD 3.5 Large (结构精准光影)', tag: '光影写实' },
    ],
    apiKeyPlaceholder: 'sk-xxxx... (从 siliconflow.cn 控制台获取)',
    apiDocsUrl: 'https://cloud.siliconflow.cn/account/ak',
  },
  {
    provider: 'openai_compatible',
    name: 'OpenAI 兼容协议 / 自定义中转 API',
    description: '支持任何标准 OpenAI API 格式的服务（如 OpenAI、Moonshot Kimi、智谱 GLM、零一万物、OneAPI 等）',
    defaultBaseUrl: 'https://api.openai.com/v1',
    recommendedModels: [
      { id: 'gpt-4o', name: 'GPT-4o (全能旗舰)', tag: '国际标杆' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (经济快速)', tag: '快速经济' },
      { id: 'deepseek-chat', name: 'DeepSeek 官方 API (deepseek-chat)', tag: '官方直连' },
      { id: 'moonshot-v1-32k', name: 'Moonshot Kimi (超长文本中文写作)', tag: '中文长文' },
      { id: 'glm-4-plus', name: 'GLM-4 Plus (智谱开放平台旗舰)', tag: '国产旗舰' },
    ],
    recommendedImageModels: [
      { id: 'dall-e-3', name: 'DALL-E 3 (OpenAI 经典生图)', tag: '精准遵从' },
    ],
    apiKeyPlaceholder: 'sk-xxxx... (服务商 API Key)',
    apiDocsUrl: 'https://platform.openai.com/api-keys',
  },
];

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  provider: 'gemini',
  apiKey: '',
  baseUrl: 'https://generativelanguage.googleapis.com',
  model: 'gemini-2.5-flash',
  googleSearchEnabled: true,
  googleSearchRecency: 'week',
  imageProvider: 'gemini',
  imageModel: 'imagen-3.0-generate-002',
  defaultSlotCount: 3,
  apifyToken: '',
  twitterSearchKeywords: [
    '#buildinpublic MRR',
    'solo founder Stripe',
    'LocalLLaMA tutorial',
    'Ollama deepseek',
    'solid state battery',
    'n8n AI workflow',
  ],
  customSubreddits: ['SaaS', 'solopreneur', 'LearnMachineLearning', 'ChatGPTCoding', 'LocalLLaMA', 'SideProject', 'electricvehicles'],
  customTwitterKols: ['levelsio', 'Marc_IndieDev', 'karpathy', 'sama', 'svpino', 'shl'],
  temperature: 0.35,
  maxTokens: 8192,
};

export const SILICONFLOW_CONFIG_PRESET: ModelConfig = {
  provider: 'siliconflow',
  apiKey: '',
  baseUrl: 'https://api.siliconflow.cn/v1',
  model: 'deepseek-ai/DeepSeek-V3',
  googleSearchEnabled: true,
  googleSearchRecency: 'week',
  imageProvider: 'siliconflow',
  imageModel: 'black-forest-labs/FLUX.1-schnell',
  defaultSlotCount: 3,
  apifyToken: '',
  twitterSearchKeywords: [
    '#buildinpublic MRR',
    'solo founder Stripe',
    'LocalLLaMA tutorial',
    'Ollama deepseek',
    'solid state battery',
    'n8n AI workflow',
  ],
  customSubreddits: ['SaaS', 'solopreneur', 'LearnMachineLearning', 'ChatGPTCoding', 'LocalLLaMA', 'SideProject', 'electricvehicles'],
  customTwitterKols: ['levelsio', 'Marc_IndieDev', 'karpathy', 'sama', 'svpino', 'shl'],
  temperature: 0.35,
  maxTokens: 8192,
};

export const PROVIDER_METADATA = PROVIDER_PRESETS;

export interface DailyTopicItem {
  id: string;
  title: string;
  source: string;
  source_url?: string;
  platform?: 'twitter' | 'reddit' | 'rss' | 'other';
  author?: string;
  category: ThemeCategory;
  category_label: string;
  sub_category?: string;
  publish_time: string;
  summary: string;
  raw_snippet?: string;
  hot_score?: number; // 0 - 100
  upvotes?: number;
  comments_count?: number;
  is_breaking?: boolean;
  recommended_angle?: string;
  tags?: string[];
  original_title?: string;
  reasoning_summary?: string;
  // Overseas Media Assets (Images / Charts / Videos)
  media_urls?: string[]; // 原始图片/图表/架构图/高清截图直链
  media_type?: 'none' | 'image' | 'video' | 'gallery';
  video_preview_url?: string; // 视频播放或视频封面 URL
  // Custom curated article / 2nd creation fields
  is_custom_curated?: boolean;
  full_article_content?: string;
  source_word_count?: number;
  // Freshness & Deduplication Lifecycle
  scraped_date?: string; // YYYY-MM-DD
  is_today_fresh?: boolean;
}

export interface LiveMaterialItem {
  id: string;
  title: string;
  author: string;
  platform: 'twitter' | 'reddit' | 'article' | 'web';
  source_url: string;
  publish_time: string;
  summary: string;
  raw_text?: string;
  upvotes?: number;
  comments_count?: number;
  media_urls?: string[];
  media_type?: 'none' | 'image' | 'video' | 'gallery';
  tags?: string[];
  badge_label?: string;
}

export interface DeepSeekRewriteResult {
  wechat_title: string;
  digest_summary: string;
  markdown_content: string;
  word_count: number;
  cover_spec: {
    badge_tag: string;
    headline_text: string;
    sub_hook: string;
    visual_focus: string;
    prompt_en: string;
    prompt_zh: string;
    aspect_ratio: string;
    negative_prompt: string;
  };
  embedded_images: Array<{
    url: string;
    caption: string;
  }>;
  original_material: LiveMaterialItem;
  referenced_materials?: LiveMaterialItem[];
  is_multi_source?: boolean;
  selected_archetype?: string;
  archetype_tag?: string;
}


export interface RSSFeedSource {
  id: string;
  name: string;
  category: ThemeCategory;
  url: string;
  icon: string;
  description: string;
  siteName: string;
  platform?: 'twitter' | 'reddit' | 'rss' | 'other';
}

export interface RSSScheduleConfig {
  enabled: boolean;
  timeOfDay: string; // e.g. "08:00"
  intervalMinutes?: number; // e.g. 30, 60, 120, 240, 360
  refreshMode?: 'daily' | 'interval';
  selectedCategories: ThemeCategory[];
  platforms?: ('twitter' | 'reddit' | 'rss')[];
  lastRunTime?: string;
  autoAdoptTopStory?: boolean;
  totalScrapedCount?: number;
}

export interface GroundingSource {
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
}

export interface TrendPainPoint {
  point: string;
  userQuote: string;
  intensity: 'critical' | 'high' | 'medium';
  category: string;
}

export interface DifferentiatedAngle {
  archetype: Archetype;
  angleTitle: string;
  counterIntuitiveInsight: string;
  viralHook: string;
  recommendedInjections: string[];
}

export interface ContentTrendPrediction {
  topic: string;
  heatScore: number; // 0-100
  trendMomentum: string; // e.g. "持续攀升 · 争论加剧"
  sentimentBreakdown: {
    curious: number;
    skeptical: number;
    fomo: number;
    pragmatic: number;
  };
  summary: string;
  hotKeywords: string[];
  painPoints: TrendPainPoint[];
  differentiatedAngles: Partial<Record<Archetype, DifferentiatedAngle>>;
  searchSources: GroundingSource[];
  searchQueries?: string[];
  generatedAt: string;
}

export type SearchPlatform = 'wechat' | 'zhihu' | 'baidu';

export interface SEOKeywordItem {
  id: string;
  keyword: string;
  weight: number; // 30 - 100
  searchVolume: number;
  platform: SearchPlatform;
  growthRate: string; // e.g. "+152%"
  intent: 'comparison' | 'informational' | 'transactional' | 'troubleshooting';
  competition: 'low' | 'medium' | 'high';
}

export interface SEOAnalysisResult {
  topic: string;
  overallSearchIndex: number; // e.g. 88500
  platformShares: {
    wechat: number;
    zhihu: number;
    baidu: number;
  };
  keywords: SEOKeywordItem[];
  suggestedLongTailKeywords: string[]; // 3-5 high weight phrases
  suggestedMIntroInjection: {
    originalHook?: string;
    enrichedIntroSection: string;
    implantedKeywords: string[];
    explanation: string;
  };
  analyzedAt: string;
}

export interface TrendSEOFusionResult {
  topic: string;
  trendPrediction: ContentTrendPrediction;
  seoAnalysis: SEOAnalysisResult;
  fusionScore: {
    seoTrafficScore: number; // 0-100
    controversyMomentumScore: number; // 0-100
    combinedViralIndex: number; // 0-100
  };
  crossSynergySummary: string;
  fusedArchetypeInjections: {
    M: {
      angleTitle: string;
      viralHook: string;
      enrichedIntroSection: string;
      topKeywordsUsed: string[];
      recommendedInjections: string[];
    };
    S: {
      angleTitle: string;
      viralHook: string;
      deepDiveOutline: string[];
      techKeywordsUsed: string[];
      recommendedInjections: string[];
    };
    I: {
      angleTitle: string;
      viralHook: string;
      commercialChecklist: string[];
      actionKeywordsUsed: string[];
      recommendedInjections: string[];
    };
  };
  fusedAt: string;
}

export interface DeepInquiryItem {
  id: string;
  inquiry_title: string;
  core_angle: string;
  target_audience: string;
  inquiry_type: 'practical_guide' | 'money_compliance' | 'hardcore_mechanism' | 'moat_strategy';
  retrieved_signals: {
    platform: 'twitter' | 'reddit' | 'web';
    source_author?: string;
    key_findings: string[];
    concrete_data_points?: string[];
  };
  trend_metrics: {
    score: number;
    status_label: string;
    discussion_volume: string;
  };
  seo_metrics: {
    intent_score: number;
    primary_keyword: string;
    long_tail_keywords: string[];
    monthly_search_est: string;
  };
  recommendation: 'strongly_recommended' | 'recommended' | 'low_interest_prune';
  prune_reason?: string;
  is_pruned?: boolean;
}

export interface BaseArticleInspiration {
  id: string;
  title: string;
  summary: string;
  source_platform: string;
  author?: string;
  url?: string;
  tags: string[];
  raw_text?: string;
  themeCategory?: ThemeCategory;
}



