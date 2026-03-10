/**
 * 成长之路 · 射雕英雄传
 * Personal Growth Tracker themed with Guo Jing's journey
 */

const STORAGE_KEY = 'growth-journey-data';

const MOOD_LABELS = {
  breakthrough: '顿悟 · 拨云见日',
  progress: '精进 · 稳步前行',
  struggle: '苦修 · 砥砺前行',
  reflect: '内省 · 温故知新'
};

const LEVEL_LABELS = {
  copper: '铜 · 初窥门径',
  silver: '银 · 小有所成',
  gold: '金 · 炉火纯青',
  legendary: '传说 · 登峰造极'
};

// ─── Data Management ───

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const data = saved ? JSON.parse(saved) : {
    currentRealm: 0,
    goals: [],
    achievements: [],
    log: []
  };

  // v2 data migration — add missing fields without removing existing data
  if (!data.dimensionScores) data.dimensionScores = createEmptyDimensionScores();
  if (!data.dimensionSnapshots) data.dimensionSnapshots = [];
  if (!data.reviews) data.reviews = [];

  return data;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let appData = loadData();

// Realm definitions (static)
const REALMS = [
  {
    id: 0,
    name: "蒙古草原 · 懵懂初心",
    alias: "牧羊少年",
    description: "郭靖幼年在蒙古草原长大，天资愚钝却心地善良。江南七怪千里赴约，教他基础武功。虽然学得慢，但从未放弃。",
    motto: "天下武功，唯勤不破",
    skills: ["基础拳脚", "骑射之术"],
    mentor: "江南七怪"
  },
  {
    id: 1,
    name: "全真心法 · 内功初成",
    alias: "入门弟子",
    description: "马钰道长暗中传授全真内功心法，郭靖从此打下坚实的内力根基。看似不起眼的基础功夫，却是日后一切高深武学的根本。",
    motto: "根基不牢，地动山摇",
    skills: ["全真内功", "呼吸吐纳"],
    mentor: "马钰道长"
  },
  {
    id: 2,
    name: "降龙十八掌 · 初露锋芒",
    alias: "丐帮传人",
    description: "洪七公传授降龙十八掌，郭靖第一次拥有了顶级武功。掌法刚猛无俦，每一掌都需深厚内力支撑，是真正踏入高手行列的开始。",
    motto: "厚积薄发，一鸣惊人",
    skills: ["降龙十八掌", "逍遥游掌法"],
    mentor: "洪七公"
  },
  {
    id: 3,
    name: "九阴真经 · 融会贯通",
    alias: "武学奇才",
    description: "周伯通传授左右互搏、空明拳，又习得九阴真经。多门武学在郭靖体内融会贯通，从单纯的力量型选手进化为全面型高手。",
    motto: "博采众长，自成一家",
    skills: ["九阴真经", "左右互搏", "空明拳"],
    mentor: "周伯通"
  },
  {
    id: 4,
    name: "华山论剑 · 名震天下",
    alias: "天下五绝",
    description: "第二次华山论剑，郭靖武功已臻化境，跻身天下顶尖高手之列。从当年那个笨拙的牧羊少年，到如今与各路宗师平起平坐。",
    motto: "宝剑锋从磨砺出",
    skills: ["武功大成", "内外兼修"],
    mentor: "实战磨砺"
  },
  {
    id: 5,
    name: "襄阳守城 · 侠之大者",
    alias: "北侠",
    description: "郭靖镇守襄阳，以一己之力扛起家国重担。武功已不再是目的，而是守护苍生的手段。侠之大者，为国为民——这是武侠精神的最高境界。",
    motto: "侠之大者，为国为民",
    skills: ["降龙廿八掌", "兵法韬略", "统帅之能"],
    mentor: "自我超越"
  }
];

// ─── Rendering ───

function render() {
  renderProgress();
  renderCurrentRealm();
  renderGoals();
  renderAchievements();
  renderLog();
  renderMap();
}

function renderProgress() {
  const total = REALMS.length - 1;
  const pct = (appData.currentRealm / total) * 100;
  document.getElementById('progressFill').style.width = pct + '%';

  const markers = document.getElementById('realmMarkers');
  markers.innerHTML = REALMS.map((r, i) => {
    let cls = '';
    if (i < appData.currentRealm) cls = 'completed';
    else if (i === appData.currentRealm) cls = 'active';
    const shortName = r.name.split('·')[0].trim();
    return `<div class="realm-marker ${cls}" onclick="viewRealm(${i})">
      <div class="dot"></div>
      <span class="label">${shortName}</span>
    </div>`;
  }).join('');
}

function renderCurrentRealm() {
  const realm = REALMS[appData.currentRealm];
  const container = document.getElementById('currentRealm');
  const completedGoals = appData.goals.filter(g => g.realm === appData.currentRealm && g.completed).length;
  const totalGoals = appData.goals.filter(g => g.realm === appData.currentRealm).length;

  container.innerHTML = `
    <div class="realm-header">
      <div class="realm-name">${realm.name}</div>
      <span class="realm-alias">${realm.alias}</span>
    </div>
    <div class="realm-desc">${realm.description}</div>
    <div class="realm-meta">
      <span class="meta-tag">师承：${realm.mentor}</span>
      <span class="meta-tag">目标进度：${completedGoals}/${totalGoals}</span>
      ${realm.skills.map(s => `<span class="meta-tag">${s}</span>`).join('')}
    </div>
    <div class="realm-motto">${realm.motto}</div>
    <div class="realm-actions">
      ${appData.currentRealm > 0 ? `<button class="btn btn-sm" onclick="changeRealm(-1)">← 回顾前境</button>` : ''}
      ${appData.currentRealm < REALMS.length - 1 ? `<button class="btn btn-primary btn-sm" onclick="changeRealm(1)">突破境界 →</button>` : '<span class="realm-alias">已达至高境界</span>'}
    </div>
  `;
}

function renderGoals() {
  const list = document.getElementById('goalList');
  const realmGoals = appData.goals.filter(g => g.realm === appData.currentRealm);

  if (realmGoals.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <div class="icon">🎯</div>
      <p>尚无修炼目标</p>
      <p style="font-size:0.85em">点击「新增目标」开始当前境界的修炼</p>
    </div>`;
    return;
  }

  // Show uncompleted first, then completed
  const sorted = [...realmGoals].sort((a, b) => a.completed - b.completed);

  list.innerHTML = sorted.map(g => `
    <div class="goal-card ${g.completed ? 'completed' : ''}" data-id="${g.id}">
      <div class="goal-top">
        <div class="goal-title">
          <div class="check" onclick="toggleGoal('${g.id}')"></div>
          <span>${g.title}</span>
        </div>
        <span class="goal-category">${g.category}</span>
      </div>
      ${g.desc ? `<div class="goal-desc">${g.desc}</div>` : ''}
      <div class="goal-date">${g.date}${g.completedDate ? ' → 完成于 ' + g.completedDate : ''}</div>
      <div class="goal-actions">
        <button class="btn btn-sm btn-danger" onclick="deleteGoal('${g.id}')">删除</button>
      </div>
    </div>
  `).join('');
}

function renderAchievements() {
  const list = document.getElementById('achievementList');

  if (appData.achievements.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <div class="icon">🏆</div>
      <p>尚无成就记录</p>
      <p style="font-size:0.85em">完成目标、突破境界时记录你的成就</p>
    </div>`;
    return;
  }

  list.innerHTML = appData.achievements.map(a => `
    <div class="achievement-card ${a.level}">
      <span class="ach-level ${a.level}">${LEVEL_LABELS[a.level]}</span>
      <div class="ach-title">${a.title}</div>
      ${a.desc ? `<div class="ach-desc">${a.desc}</div>` : ''}
      <div class="ach-date">${a.date} · ${REALMS[a.realm]?.name.split('·')[0].trim() || ''}</div>
    </div>
  `).join('');
}

function renderLog() {
  const list = document.getElementById('logList');

  if (appData.log.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <div class="icon">📜</div>
      <p>修行日志为空</p>
      <p style="font-size:0.85em">记录每日所学、所悟、所感</p>
    </div>`;
    return;
  }

  list.innerHTML = appData.log.map(l => `
    <div class="log-card">
      <div class="log-header">
        <div class="log-title">${l.title}</div>
        <span class="log-mood ${l.mood}">${MOOD_LABELS[l.mood]}</span>
      </div>
      <div class="log-body">${l.content}</div>
      <div class="log-date">${l.date} · ${REALMS[l.realm]?.name.split('·')[0].trim() || ''}</div>
    </div>
  `).join('');
}

function renderMap() {
  const map = document.getElementById('realmMap');
  map.innerHTML = REALMS.map((r, i) => {
    let cls = '';
    if (i < appData.currentRealm) cls = 'completed';
    else if (i === appData.currentRealm) cls = 'active';
    else cls = 'locked';

    const goalsInRealm = appData.goals.filter(g => g.realm === i);
    const completed = goalsInRealm.filter(g => g.completed).length;

    return `
      <div class="map-card ${cls}" onclick="viewRealm(${i})">
        <div class="map-number">${i < appData.currentRealm ? '✓' : i + 1}</div>
        <div class="map-info">
          <h4>${r.name}</h4>
          <p>${r.description.slice(0, 60)}...</p>
          <div class="map-mentor">师承：${r.mentor}${goalsInRealm.length > 0 ? ` · 目标 ${completed}/${goalsInRealm.length}` : ''}</div>
          <div class="map-skills">
            ${r.skills.map(s => `<span class="map-skill">${s}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Actions ───

function changeRealm(delta) {
  const newRealm = appData.currentRealm + delta;
  if (newRealm < 0 || newRealm >= REALMS.length) return;

  if (delta > 0) {
    // Level up
    appData.currentRealm = newRealm;
    saveData(appData);
    render();
    showLevelUp(newRealm);
  } else {
    appData.currentRealm = newRealm;
    saveData(appData);
    render();
  }
}

function showLevelUp(realmIndex) {
  const realm = REALMS[realmIndex];
  document.getElementById('levelUpText').textContent =
    `恭喜突破至「${realm.name}」`;
  document.getElementById('levelUpDetail').innerHTML = `
    <p style="color: var(--accent-gold); margin-top: 12px; letter-spacing: 3px">${realm.motto}</p>
    <p style="color: var(--text-secondary); margin-top: 8px; font-size: 0.9em">称号：${realm.alias}</p>
  `;
  document.getElementById('levelUpModal').classList.add('show');
}

function viewRealm(index) {
  if (index <= appData.currentRealm) {
    appData.currentRealm = index;
    saveData(appData);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function toggleGoal(id) {
  const goal = appData.goals.find(g => g.id === id);
  if (!goal) return;
  goal.completed = !goal.completed;
  goal.completedDate = goal.completed ? new Date().toLocaleDateString('zh-CN') : null;
  saveData(appData);
  render();
}

function deleteGoal(id) {
  appData.goals = appData.goals.filter(g => g.id !== id);
  saveData(appData);
  render();
}

function showAddGoal() { document.getElementById('goalModal').classList.add('show'); }
function showAddAchievement() { document.getElementById('achievementModal').classList.add('show'); }
function showAddLog() { document.getElementById('logModal').classList.add('show'); }

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

function addGoal() {
  const title = document.getElementById('goalTitle').value.trim();
  const desc = document.getElementById('goalDesc').value.trim();
  const category = document.getElementById('goalCategory').value;
  if (!title) return;

  appData.goals.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title, desc, category,
    realm: appData.currentRealm,
    completed: false,
    date: new Date().toLocaleDateString('zh-CN'),
    completedDate: null
  });

  saveData(appData);
  document.getElementById('goalTitle').value = '';
  document.getElementById('goalDesc').value = '';
  closeModal('goalModal');
  render();
}

function addAchievement() {
  const title = document.getElementById('achTitle').value.trim();
  const desc = document.getElementById('achDesc').value.trim();
  const level = document.getElementById('achLevel').value;
  if (!title) return;

  appData.achievements.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title, desc, level,
    realm: appData.currentRealm,
    date: new Date().toLocaleDateString('zh-CN')
  });

  saveData(appData);
  document.getElementById('achTitle').value = '';
  document.getElementById('achDesc').value = '';
  closeModal('achievementModal');
  render();
}

function addLog() {
  const title = document.getElementById('logTitle').value.trim();
  const content = document.getElementById('logContent').value.trim();
  const mood = document.getElementById('logMood').value;
  if (!title) return;

  appData.log.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title, content, mood,
    realm: appData.currentRealm,
    date: new Date().toLocaleDateString('zh-CN')
  });

  saveData(appData);
  document.getElementById('logTitle').value = '';
  document.getElementById('logContent').value = '';
  closeModal('logModal');
  render();
}

// ─── Tab Switching (v2: lazy-load new panels) ───

function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      document.getElementById('panel-' + tabName).classList.add('active');

      // v2 lazy rendering hooks
      if (tabName === 'dimensions') renderDimensions();
      if (tabName === 'review') renderReviewTab();
      if (tabName === 'brag') renderBragTab();
    });
  });
}

// ─── v2: Dimension Assessment (能力图谱) ───

function renderDimensions() {
  renderDimensionOverall();
  renderDimensionScoringUI();

  // Radar chart
  const latestSnapshot = appData.dimensionSnapshots.length > 0
    ? appData.dimensionSnapshots[appData.dimensionSnapshots.length - 1].scores
    : null;

  if (typeof Chart !== 'undefined') {
    createMainRadarChart('dimensionRadar', appData.dimensionScores, latestSnapshot);
  }
}

function renderDimensionOverall() {
  const container = document.getElementById('dimensionOverall');
  if (!container) return;
  const avg = getOverallAverage(appData.dimensionScores);
  const level = DREYFUS_LEVELS[Math.round(avg)] || DREYFUS_LEVELS[0];
  const snapshotCount = appData.dimensionSnapshots.length;

  container.innerHTML = `
    <div class="dimension-overall-score">
      <div class="score-num">${avg.toFixed(1)}</div>
      <div class="score-label">${level.label}</div>
    </div>
    <div style="text-align:center">
      <div style="font-size:0.85em;color:var(--text-secondary);margin-bottom:6px">快照数: ${snapshotCount}</div>
      <button class="btn btn-sm btn-primary dimension-snapshot-btn" onclick="takeDimensionSnapshot()">保存快照</button>
    </div>
  `;
}

function renderDimensionScoringUI() {
  const container = document.getElementById('dimensionScoringUI');
  if (!container) return;

  container.innerHTML = DIMENSION_KEYS.map(dimKey => {
    const dim = DIMENSIONS[dimKey];
    const avg = getDimensionAvg(dimKey, appData.dimensionScores);
    const subsHtml = Object.keys(dim.subs).map(subKey => {
      const sub = dim.subs[subKey];
      const current = appData.dimensionScores[dimKey]?.[subKey] || { score: 0, lastUpdated: null };
      const btns = DREYFUS_LEVELS.map(l =>
        `<button class="dreyfus-btn ${current.score === l.score ? 'active' : ''}"
          title="${l.label}: ${l.desc}"
          onclick="setDimensionScore('${dimKey}','${subKey}',${l.score})">${l.score}</button>`
      ).join('');
      const updated = current.lastUpdated ? current.lastUpdated : '';
      return `
        <div class="sub-dimension-row">
          <span class="sub-dim-name">${sub.name}</span>
          <span class="sub-dim-desc">${sub.desc}</span>
          <div class="dreyfus-btns">${btns}</div>
          <span class="sub-dim-updated">${updated}</span>
        </div>`;
    }).join('');

    return `
      <div class="dimension-group">
        <div class="dimension-group-header">
          <span class="dim-icon">${dim.icon}</span>
          <span class="dim-name">${dim.name}</span>
          <span class="dim-wuxia">${dim.wuxia}</span>
          <span class="dim-avg">${avg.toFixed(1)}</span>
        </div>
        ${subsHtml}
      </div>`;
  }).join('');
}

function setDimensionScore(dimKey, subKey, score) {
  if (!appData.dimensionScores[dimKey]) appData.dimensionScores[dimKey] = {};
  appData.dimensionScores[dimKey][subKey] = {
    score,
    notes: appData.dimensionScores[dimKey][subKey]?.notes || '',
    lastUpdated: new Date().toLocaleDateString('zh-CN')
  };
  saveData(appData);
  renderDimensions();
}

function takeDimensionSnapshot() {
  const snapshot = createDimensionSnapshot(appData.dimensionScores, 'manual');
  appData.dimensionSnapshots.push(snapshot);
  saveData(appData);
  renderDimensions();
}

// ─── v2: Review System (复盘系统) ───

let currentReviewType = 'weekly';

function renderReviewTab() {
  const formArea = document.getElementById('reviewFormArea');
  const historyArea = document.getElementById('reviewHistory');
  if (!formArea || !historyArea) return;

  // Highlight active sub-tab
  document.querySelectorAll('.review-sub-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === currentReviewType);
  });

  formArea.innerHTML = renderReviewForm(currentReviewType);
  historyArea.innerHTML = renderReviewHistory(appData.reviews, currentReviewType);
}

function switchReviewType(type) {
  currentReviewType = type;
  renderReviewTab();
}

function saveReview(type) {
  const config = REVIEW_TYPES[type];
  if (!config) return;

  const periodEl = document.getElementById('reviewPeriod');
  const summaryEl = document.getElementById('review_summary');
  const period = periodEl ? periodEl.value : '';
  const summary = summaryEl ? summaryEl.value.trim() : '';

  const review = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    type,
    period,
    date: new Date().toLocaleDateString('zh-CN'),
    summary
  };

  config.fields.forEach(f => {
    const el = document.getElementById('review_' + f.key);
    review[f.key] = el ? el.value.trim() : '';
  });

  // Check at least one field is filled
  const hasContent = config.fields.some(f => review[f.key]) || summary;
  if (!hasContent) return;

  appData.reviews.unshift(review);

  // Auto-snapshot on quarterly review
  if (type === 'quarterly') {
    takeDimensionSnapshot();
  }

  saveData(appData);
  renderReviewTab();
}

function deleteReview(id) {
  appData.reviews = appData.reviews.filter(r => r.id !== id);
  saveData(appData);
  renderReviewTab();
}

// ─── v2: Brag Document (成就录) ───

function renderBragTab() {
  populateBragQuarterSelect();
  const select = document.getElementById('bragQuarterSelect');
  if (!select) return;
  const quarter = select.value;
  const brag = generateBragDocument(appData, quarter);
  document.getElementById('bragContent').innerHTML = renderBragDocument(brag);
}

function populateBragQuarterSelect() {
  const select = document.getElementById('bragQuarterSelect');
  if (!select || select.options.length > 0) return;
  select.innerHTML = getQuarterOptions();
}

function exportCurrentBrag() {
  const select = document.getElementById('bragQuarterSelect');
  if (!select) return;
  const quarter = select.value;
  const brag = generateBragDocument(appData, quarter);
  if (!brag) return;
  const md = exportBragMarkdown(brag);
  downloadMarkdown(md, `brag-${quarter}.md`);
}

// Close modal on background click
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });
});

// ─── Init ───
initTabs();
render();
renderDimensions();
