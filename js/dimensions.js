/**
 * 成长之路 v2 · 维度定义 + Dreyfus等级 + 心智模型
 */

// Dreyfus技能等级（0-5）
const DREYFUS_LEVELS = [
  { score: 0, label: '未评估', desc: '尚未开始评估此技能', icon: '○' },
  { score: 1, label: '新手', desc: '需要明确的规则和指导', icon: '●' },
  { score: 2, label: '进阶', desc: '能在指导下独立工作', icon: '●●' },
  { score: 3, label: '胜任', desc: '能独立解决大部分问题', icon: '●●●' },
  { score: 4, label: '精通', desc: '能把握全局，指导他人', icon: '●●●●' },
  { score: 5, label: '专家', desc: '凭直觉行动，推动领域发展', icon: '●●●●●' }
];

// 6大维度 × 22子维度
const DIMENSIONS = {
  metacognition: {
    key: 'metacognition',
    name: '元认知',
    wuxia: '内功心法',
    icon: '🧠',
    color: '#a78bfa',
    description: '认识自己的思维过程，掌控学习方向',
    subs: {
      selfAwareness:   { key: 'selfAwareness',   name: '自我觉察',   desc: '了解自身优劣势、情绪模式和认知偏差' },
      learningStrategy:{ key: 'learningStrategy', name: '学习策略',   desc: '掌握高效学习方法，能选择适合的学习路径' },
      thinkingReflect: { key: 'thinkingReflect', name: '思维反思',   desc: '定期审视思考过程，识别并修正思维盲区' }
    }
  },
  thinking: {
    key: 'thinking',
    name: '思维方式',
    wuxia: '武学悟性',
    icon: '💡',
    color: '#f59e0b',
    description: '高阶思维能力，突破认知边界',
    subs: {
      firstPrinciples:  { key: 'firstPrinciples',  name: '第一性原理', desc: '从根本出发推导，不被类比和惯例束缚' },
      systemsThinking:  { key: 'systemsThinking',  name: '系统思维',   desc: '看到整体结构和反馈回路，理解复杂系统' },
      criticalThinking: { key: 'criticalThinking', name: '批判性思维', desc: '质疑假设，评估证据，形成独立判断' },
      creativeThinking: { key: 'creativeThinking', name: '创造性思维', desc: '跨领域联想，产生新颖有价值的想法' }
    }
  },
  domainExpertise: {
    key: 'domainExpertise',
    name: '领域能力',
    wuxia: '招式秘籍',
    icon: '📚',
    color: '#3b82f6',
    description: 'AI领域专业知识与技术深度',
    subs: {
      aiBasics:      { key: 'aiBasics',      name: 'AI基础',      desc: '机器学习基础、数学基础、数据处理' },
      deepLearning:  { key: 'deepLearning',  name: '深度学习',    desc: 'CNN/RNN/Transformer架构、训练技巧' },
      llmGenAI:      { key: 'llmGenAI',      name: 'LLM/GenAI',   desc: '大语言模型、生成式AI、Prompt Engineering' },
      mlops:         { key: 'mlops',         name: 'MLOps',       desc: '模型部署、监控、持续训练、基础设施' },
      aiSafety:      { key: 'aiSafety',      name: 'AI安全',      desc: '对齐、红队测试、偏差检测、负责任AI' }
    }
  },
  execution: {
    key: 'execution',
    name: '执行技能',
    wuxia: '外功拳脚',
    icon: '⚡',
    color: '#22c55e',
    description: '将想法变为现实的工程实践能力',
    subs: {
      programming:    { key: 'programming',    name: '编程能力',   desc: '代码质量、多语言能力、算法与数据结构' },
      systemDesign:   { key: 'systemDesign',   name: '系统设计',   desc: '架构设计、技术选型、扩展性考量' },
      engineering:    { key: 'engineering',    name: '工程实践',   desc: 'CI/CD、测试策略、代码审查、技术债管理' },
      projectDelivery:{ key: 'projectDelivery', name: '项目交付',   desc: '需求分析、进度管理、风险控制、质量保证' }
    }
  },
  methods: {
    key: 'methods',
    name: '做事方法',
    wuxia: '江湖行事',
    icon: '🤝',
    color: '#ec4899',
    description: '与人协作、影响团队的软技能',
    subs: {
      communication:    { key: 'communication',    name: '沟通协作',   desc: '清晰表达技术概念，跨团队高效协作' },
      techLeadership:   { key: 'techLeadership',   name: '技术领导力', desc: '技术决策、团队指导、架构治理' },
      knowledgeMgmt:    { key: 'knowledgeMgmt',    name: '知识管理',   desc: '文档化、知识体系构建、信息检索效率' },
      influence:        { key: 'influence',        name: '影响力',     desc: '技术布道、推动变革、建立技术品牌' }
    }
  },
  growth: {
    key: 'growth',
    name: '持续成长',
    wuxia: '修行之道',
    icon: '🌱',
    color: '#14b8a6',
    description: '保持学习输入与实践输出的平衡',
    subs: {
      learningInput:  { key: 'learningInput',  name: '学习输入',   desc: '论文阅读、课程学习、技术探索的广度和深度' },
      practiceOutput: { key: 'practiceOutput', name: '实践输出',   desc: '项目实战、代码贡献、原型验证' },
      publicSharing:  { key: 'publicSharing',  name: '公开分享',   desc: '技术博客、演讲、开源贡献、社区参与' },
      retrospective:  { key: 'retrospective',  name: '复盘总结',   desc: '定期回顾、经验提炼、持续改进' }
    }
  }
};

// 维度键列表（用于雷达图顺序）
const DIMENSION_KEYS = ['metacognition', 'thinking', 'domainExpertise', 'execution', 'methods', 'growth'];

// 获取维度雷达图标签
function getDimensionLabels() {
  return DIMENSION_KEYS.map(k => DIMENSIONS[k].name);
}

// 获取维度武侠标签
function getDimensionWuxiaLabels() {
  return DIMENSION_KEYS.map(k => DIMENSIONS[k].wuxia);
}

// 获取维度颜色
function getDimensionColors() {
  return DIMENSION_KEYS.map(k => DIMENSIONS[k].color);
}

// 计算某维度平均分
function getDimensionAvg(dimensionKey, scores) {
  const dim = DIMENSIONS[dimensionKey];
  if (!dim || !scores[dimensionKey]) return 0;
  const subKeys = Object.keys(dim.subs);
  const total = subKeys.reduce((sum, sk) => {
    const s = scores[dimensionKey]?.[sk];
    return sum + (s ? s.score : 0);
  }, 0);
  return total / subKeys.length;
}

// 获取6维度平均分数组
function getDimensionAverages(scores) {
  return DIMENSION_KEYS.map(k => getDimensionAvg(k, scores));
}

// 获取所有子维度总数
function getTotalSubDimensions() {
  return DIMENSION_KEYS.reduce((sum, k) => sum + Object.keys(DIMENSIONS[k].subs).length, 0);
}

// 计算总体平均分
function getOverallAverage(scores) {
  const avgs = getDimensionAverages(scores);
  return avgs.reduce((a, b) => a + b, 0) / avgs.length;
}

// 心智模型库（用于周复盘推荐）
const MENTAL_MODELS = [
  { name: '第一性原理', desc: '回归事物最基本的条件，从根本出发推导', category: 'thinking', source: 'Elon Musk' },
  { name: '费曼学习法', desc: '用简单语言教别人来验证自己是否真正理解', category: 'learning', source: 'Richard Feynman' },
  { name: '帕累托法则', desc: '80%的结果来自20%的努力，聚焦关键少数', category: 'efficiency', source: 'Vilfredo Pareto' },
  { name: '反脆弱', desc: '在不确定性中获益，拥抱适度压力', category: 'growth', source: 'Nassim Taleb' },
  { name: '能力圈', desc: '明确自己的能力边界，在圈内决策', category: 'metacognition', source: 'Warren Buffett' },
  { name: '地图不等于疆域', desc: '模型是对现实的简化，要意识到其局限性', category: 'thinking', source: 'Alfred Korzybski' },
  { name: '逆向思维', desc: '从想要避免的结果倒推，反过来想问题', category: 'thinking', source: 'Charlie Munger' },
  { name: '刻意练习', desc: '在舒适区边缘针对弱点进行有目的的练习', category: 'learning', source: 'Anders Ericsson' },
  { name: '复利效应', desc: '持续的小改进会产生巨大的累积效果', category: 'growth', source: 'Compound Effect' },
  { name: '奥卡姆剃刀', desc: '如无必要，勿增实体——选择最简单的解释', category: 'thinking', source: 'William of Ockham' },
  { name: '二阶思维', desc: '不只考虑直接后果，还要考虑后果的后果', category: 'thinking', source: 'Howard Marks' },
  { name: '系统思维', desc: '关注要素间的关系和反馈回路，而非孤立事件', category: 'thinking', source: 'Peter Senge' },
  { name: 'OODA循环', desc: '观察-判断-决策-行动，快速迭代决策', category: 'execution', source: 'John Boyd' },
  { name: '认知负荷理论', desc: '工作记忆有限，减少无关信息的干扰', category: 'learning', source: 'John Sweller' },
  { name: '沉没成本谬误', desc: '已投入的成本不应影响未来决策', category: 'metacognition', source: 'Behavioral Economics' },
  { name: '概率思维', desc: '用概率而非确定性来思考，拥抱不确定性', category: 'thinking', source: 'Bayesian Thinking' },
  { name: '杠杆点', desc: '找到系统中的高杠杆点，小投入大产出', category: 'efficiency', source: 'Donella Meadows' },
  { name: '学习金字塔', desc: '教授他人是最有效的学习方式', category: 'learning', source: 'Edgar Dale' },
  { name: '邓宁-克鲁格效应', desc: '能力不足者往往高估自己，要保持谦逊', category: 'metacognition', source: 'Dunning-Kruger' },
  { name: 'T型人才', desc: '在一个领域深耕同时保持广泛的知识面', category: 'growth', source: 'Tim Brown / IDEO' },
  { name: '决策日志', desc: '记录重要决策的理由和预期，事后复盘', category: 'metacognition', source: 'Daniel Kahneman' },
  { name: '技术债务', desc: '短期捷径的长期代价，需要主动管理', category: 'execution', source: 'Ward Cunningham' },
  { name: '认知偏差清单', desc: '了解常见认知偏差，在决策时主动检查', category: 'metacognition', source: 'Charlie Munger' },
  { name: '最小可行产品', desc: '用最少的功能验证核心假设', category: 'execution', source: 'Eric Ries' }
];

// 获取本周心智模型推荐（基于周数）
function getWeeklyMentalModel() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return MENTAL_MODELS[weekNum % MENTAL_MODELS.length];
}

// 初始化空的维度评分
function createEmptyDimensionScores() {
  const scores = {};
  for (const dimKey of DIMENSION_KEYS) {
    scores[dimKey] = {};
    for (const subKey of Object.keys(DIMENSIONS[dimKey].subs)) {
      scores[dimKey][subKey] = { score: 0, notes: '', lastUpdated: null };
    }
  }
  return scores;
}
