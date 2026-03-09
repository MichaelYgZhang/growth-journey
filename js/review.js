/**
 * 成长之路 v2 · 复盘系统
 * 周复盘(Start/Stop/Continue) + 月复盘(4Ls) + 季度复盘
 */

const REVIEW_TYPES = {
  weekly: {
    label: '周复盘',
    icon: '📅',
    template: 'Start / Stop / Continue',
    fields: [
      { key: 'start', label: '开始做 (Start)', placeholder: '下周要开始做的事情...' },
      { key: 'stop', label: '停止做 (Stop)', placeholder: '应该停止或减少的习惯...' },
      { key: 'continue_', label: '继续做 (Continue)', placeholder: '本周有效应该继续的事情...' }
    ]
  },
  monthly: {
    label: '月复盘',
    icon: '📆',
    template: '4Ls 模型',
    fields: [
      { key: 'liked', label: '喜欢 (Liked)', placeholder: '这个月喜欢的事情...' },
      { key: 'learned', label: '学到 (Learned)', placeholder: '学到了什么...' },
      { key: 'lacked', label: '缺少 (Lacked)', placeholder: '缺少了什么，阻碍了进步...' },
      { key: 'longedFor', label: '期望 (Longed For)', placeholder: '希望拥有的资源或能力...' }
    ]
  },
  quarterly: {
    label: '季度复盘',
    icon: '📊',
    template: 'OKR总结 + 雷达快照',
    fields: [
      { key: 'okrSummary', label: 'OKR总结', placeholder: '本季度OKR完成情况...' },
      { key: 'highlights', label: '核心亮点', placeholder: '最有价值的成果...' },
      { key: 'improvements', label: '待改进', placeholder: '需要改进的地方...' },
      { key: 'nextPlan', label: '下季度计划', placeholder: '下个季度的重点方向...' }
    ]
  }
};

// 生成复盘表单HTML
function renderReviewForm(type) {
  const config = REVIEW_TYPES[type];
  if (!config) return '';

  const model = getWeeklyMentalModel();
  const modelHtml = type === 'weekly' ? `
    <div class="review-mental-model">
      <div class="mental-model-header">本周心智模型推荐</div>
      <div class="mental-model-name">${escapeHtml(model.name)}</div>
      <div class="mental-model-desc">${escapeHtml(model.desc)}</div>
      <div class="mental-model-source">—— ${escapeHtml(model.source)}</div>
    </div>
  ` : '';

  const periodHtml = type === 'weekly'
    ? `<input type="week" id="reviewPeriod" class="review-period-input" value="${getCurrentWeek()}">`
    : type === 'monthly'
    ? `<input type="month" id="reviewPeriod" class="review-period-input" value="${getCurrentMonth()}">`
    : `<select id="reviewPeriod" class="review-period-input">
        ${getQuarterOptions()}
      </select>`;

  const fieldsHtml = config.fields.map(f => `
    <div class="review-field">
      <label class="review-field-label">${escapeHtml(f.label)}</label>
      <textarea id="review_${f.key}" class="review-textarea" placeholder="${escapeHtml(f.placeholder)}"></textarea>
    </div>
  `).join('');

  return `
    <div class="review-form-container">
      <div class="review-form-header">
        <span class="review-type-icon">${config.icon}</span>
        <span class="review-type-label">${escapeHtml(config.label)} · ${escapeHtml(config.template)}</span>
      </div>
      ${modelHtml}
      <div class="review-period">
        <label>复盘周期：</label>
        ${periodHtml}
      </div>
      ${fieldsHtml}
      <div class="review-field">
        <label class="review-field-label">总结感悟</label>
        <textarea id="review_summary" class="review-textarea" placeholder="整体感悟和心得..."></textarea>
      </div>
      <div class="review-form-actions">
        <button class="btn btn-primary" onclick="saveReview('${type}')">保存复盘</button>
      </div>
    </div>
  `;
}

// 渲染历史复盘记录
function renderReviewHistory(reviews, type) {
  const filtered = reviews.filter(r => !type || r.type === type);
  if (filtered.length === 0) {
    return '<div class="empty-state"><div class="icon">📝</div><p>暂无复盘记录</p></div>';
  }

  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map(r => {
    const config = REVIEW_TYPES[r.type];
    const fieldsHtml = config.fields.map(f => {
      const val = r[f.key];
      if (!val) return '';
      return `<div class="review-record-field">
        <span class="review-record-label">${escapeHtml(f.label)}：</span>
        <span class="review-record-value">${escapeHtml(val)}</span>
      </div>`;
    }).join('');

    return `
      <div class="review-record-card">
        <div class="review-record-header">
          <span>${config.icon} ${escapeHtml(config.label)}</span>
          <span class="review-record-period">${escapeHtml(r.period || r.date)}</span>
        </div>
        ${fieldsHtml}
        ${r.summary ? `<div class="review-record-summary">${escapeHtml(r.summary)}</div>` : ''}
        <div class="review-record-date">${escapeHtml(r.date)}</div>
        <div class="review-record-actions">
          <button class="btn btn-sm btn-danger" onclick="deleteReview('${r.id}')">删除</button>
        </div>
      </div>
    `;
  }).join('');
}

// 辅助：获取当前周
function getCurrentWeek() {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now - startOfYear) / 86400000);
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

// 辅助：获取当前月
function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// 辅助：获取季度选项
function getQuarterOptions() {
  const now = new Date();
  const year = now.getFullYear();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  const options = [];
  for (let y = year; y >= year - 1; y--) {
    for (let qi = 4; qi >= 1; qi--) {
      const selected = (y === year && qi === q) ? 'selected' : '';
      options.push(`<option value="${y}-Q${qi}" ${selected}>${y}年 Q${qi}</option>`);
    }
  }
  return options.join('');
}

// 获取当前季度字符串
function getCurrentQuarter() {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `${now.getFullYear()}-Q${q}`;
}

// 计算下次复盘提醒
function getNextReviewReminder(reviews, settings) {
  const weekDay = settings?.weeklyReviewDay || 0; // 0=Sunday
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const now = new Date();
  const daysUntil = (weekDay - now.getDay() + 7) % 7 || 7;
  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + daysUntil);

  const lastWeekly = reviews.filter(r => r.type === 'weekly').sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const daysSinceLast = lastWeekly ? Math.floor((now - new Date(lastWeekly.date)) / 86400000) : null;

  return {
    nextDay: dayNames[weekDay],
    daysUntil,
    nextDateStr: nextDate.toLocaleDateString('zh-CN'),
    daysSinceLast,
    overdue: daysSinceLast !== null && daysSinceLast > 7
  };
}
