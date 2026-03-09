/**
 * 成长之路 v2 · 成就录(Brag Document)自动生成 + Markdown导出
 */

// 按季度聚合生成成就文档
function generateBragDocument(appData, quarter) {
  const q = parseQuarter(quarter);
  if (!q) return null;

  const { startDate, endDate, label } = q;

  // 筛选该季度的数据
  const achievements = (appData.achievements || []).filter(a => isInDateRange(a.date, startDate, endDate));
  const goals = (appData.goals || []).filter(g => g.completed && isInDateRange(g.completedDate || g.date, startDate, endDate));
  const logs = (appData.log || []).filter(l => isInDateRange(l.date, startDate, endDate));
  const reviews = (appData.reviews || []).filter(r => isInDateRange(r.date, startDate, endDate));
  const okrs = (appData.okrs || []).filter(o => o.quarter === quarter);

  // 维度快照对比
  const snapshots = (appData.dimensionSnapshots || []).filter(s => isInDateRange(s.date, startDate, endDate));

  return {
    quarter,
    label,
    generated: new Date().toLocaleDateString('zh-CN'),
    stats: {
      achievements: achievements.length,
      goalsCompleted: goals.length,
      logsWritten: logs.length,
      reviewsDone: reviews.length
    },
    achievements,
    goals,
    logs,
    reviews,
    okrs,
    snapshots
  };
}

// 渲染成就录HTML
function renderBragDocument(brag) {
  if (!brag) return '<div class="empty-state"><div class="icon">📄</div><p>暂无数据</p></div>';

  const statsHtml = `
    <div class="brag-stats">
      <div class="brag-stat"><span class="brag-stat-num">${brag.stats.achievements}</span><span class="brag-stat-label">成就</span></div>
      <div class="brag-stat"><span class="brag-stat-num">${brag.stats.goalsCompleted}</span><span class="brag-stat-label">目标完成</span></div>
      <div class="brag-stat"><span class="brag-stat-num">${brag.stats.logsWritten}</span><span class="brag-stat-label">日志</span></div>
      <div class="brag-stat"><span class="brag-stat-num">${brag.stats.reviewsDone}</span><span class="brag-stat-label">复盘</span></div>
    </div>
  `;

  let achHtml = '';
  if (brag.achievements.length > 0) {
    achHtml = `<div class="brag-section">
      <h4>成就记录</h4>
      ${brag.achievements.map(a => `
        <div class="brag-item">
          <span class="brag-item-level ${a.level}">${LEVEL_LABELS[a.level] || a.level}</span>
          <strong>${escapeHtml(a.title)}</strong>
          ${a.desc ? `<p>${escapeHtml(a.desc)}</p>` : ''}
          ${a.sourceUrl ? `<a href="${escapeHtml(a.sourceUrl)}" target="_blank" class="source-link">${escapeHtml(a.sourceTitle || a.sourceUrl)}</a>` : ''}
        </div>
      `).join('')}
    </div>`;
  }

  let goalsHtml = '';
  if (brag.goals.length > 0) {
    goalsHtml = `<div class="brag-section">
      <h4>完成的目标</h4>
      ${brag.goals.map(g => `
        <div class="brag-item">
          <strong>${escapeHtml(g.title)}</strong>
          ${g.desc ? `<p>${escapeHtml(g.desc)}</p>` : ''}
          ${g.dimension ? `<span class="dimension-tag">${escapeHtml(DIMENSIONS[g.dimension]?.name || g.dimension)}</span>` : ''}
        </div>
      `).join('')}
    </div>`;
  }

  let okrHtml = '';
  if (brag.okrs.length > 0) {
    okrHtml = `<div class="brag-section">
      <h4>OKR进度</h4>
      ${brag.okrs.map(o => `
        <div class="brag-item">
          <strong>O: ${escapeHtml(o.objective)}</strong>
          <div class="okr-kr-list">
            ${o.keyResults.map(kr => {
              const pct = kr.target ? Math.round((kr.current / kr.target) * 100) : 0;
              return `<div class="okr-kr-item">
                <span>${escapeHtml(kr.text)}</span>
                <span class="okr-kr-progress">${kr.current}/${kr.target}${kr.unit || ''} (${pct}%)</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>`;
  }

  return `
    <div class="brag-document">
      <div class="brag-header">
        <h3>${escapeHtml(brag.label)} 成就录</h3>
        <span class="brag-generated">生成于 ${escapeHtml(brag.generated)}</span>
      </div>
      ${statsHtml}
      ${achHtml}
      ${goalsHtml}
      ${okrHtml}
    </div>
  `;
}

// 导出为Markdown
function exportBragMarkdown(brag) {
  if (!brag) return '';

  let md = `# ${brag.label} 成就录\n\n`;
  md += `> 生成于 ${brag.generated}\n\n`;

  md += `## 概览\n\n`;
  md += `| 指标 | 数量 |\n|------|------|\n`;
  md += `| 成就 | ${brag.stats.achievements} |\n`;
  md += `| 目标完成 | ${brag.stats.goalsCompleted} |\n`;
  md += `| 日志 | ${brag.stats.logsWritten} |\n`;
  md += `| 复盘 | ${brag.stats.reviewsDone} |\n\n`;

  if (brag.achievements.length > 0) {
    md += `## 成就记录\n\n`;
    brag.achievements.forEach(a => {
      md += `### ${a.title}\n\n`;
      md += `- 等级: ${LEVEL_LABELS[a.level] || a.level}\n`;
      if (a.desc) md += `- ${a.desc}\n`;
      if (a.sourceUrl) md += `- 来源: [${a.sourceTitle || a.sourceUrl}](${a.sourceUrl})\n`;
      md += `- 日期: ${a.date}\n\n`;
    });
  }

  if (brag.goals.length > 0) {
    md += `## 完成的目标\n\n`;
    brag.goals.forEach(g => {
      md += `- **${g.title}**`;
      if (g.desc) md += `: ${g.desc}`;
      md += `\n`;
    });
    md += `\n`;
  }

  if (brag.okrs.length > 0) {
    md += `## OKR进度\n\n`;
    brag.okrs.forEach(o => {
      md += `### O: ${o.objective}\n\n`;
      o.keyResults.forEach(kr => {
        const pct = kr.target ? Math.round((kr.current / kr.target) * 100) : 0;
        md += `- ${kr.text}: ${kr.current}/${kr.target}${kr.unit || ''} (${pct}%)\n`;
      });
      md += `\n`;
    });
  }

  if (brag.logs.length > 0) {
    md += `## 成长日志摘要\n\n`;
    brag.logs.forEach(l => {
      md += `- **${l.date}** ${l.title}`;
      if (l.mood) md += ` [${MOOD_LABELS[l.mood] || l.mood}]`;
      md += `\n`;
    });
    md += `\n`;
  }

  md += `---\n\n_由「成长之路」自动生成_\n`;
  return md;
}

// 下载Markdown文件
function downloadMarkdown(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 辅助：解析季度字符串
function parseQuarter(q) {
  const match = q.match(/^(\d{4})-Q([1-4])$/);
  if (!match) return null;
  const year = parseInt(match[1]);
  const qn = parseInt(match[2]);
  const startMonth = (qn - 1) * 3;
  return {
    label: `${year}年 Q${qn}`,
    startDate: new Date(year, startMonth, 1),
    endDate: new Date(year, startMonth + 3, 0, 23, 59, 59)
  };
}

// 辅助：判断日期是否在范围内
function isInDateRange(dateStr, start, end) {
  if (!dateStr) return false;
  // Handle both "2024/1/15" and "2024-01-15" formats
  const d = new Date(dateStr.replace(/\//g, '-'));
  return d >= start && d <= end;
}
