/**
 * 成长之路 v2 · Chart.js 雷达图渲染 + 快照对比
 */

if (typeof Chart === 'undefined') {
  console.warn('Chart.js not loaded — radar charts will be unavailable');
}

let radarChartInstance = null;
let miniRadarChartInstance = null;

// 雷达图默认配置
function getRadarConfig(labels, datasets, opts = {}) {
  const { maxTick = 5, showLegend = false, fontSize = 12 } = opts;
  return {
    type: 'radar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          max: maxTick,
          ticks: {
            stepSize: 1,
            display: true,
            backdropColor: 'transparent',
            color: '#6b7280',
            font: { size: 10 }
          },
          grid: {
            color: 'rgba(212, 168, 83, 0.12)'
          },
          angleLines: {
            color: 'rgba(212, 168, 83, 0.12)'
          },
          pointLabels: {
            color: '#e8dcc8',
            font: { size: fontSize, family: '"PingFang SC", "Microsoft YaHei", serif' }
          }
        }
      },
      plugins: {
        legend: {
          display: showLegend,
          labels: {
            color: '#e8dcc8',
            font: { size: 11 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              const level = DREYFUS_LEVELS[Math.round(ctx.raw)] || DREYFUS_LEVELS[0];
              return `${ctx.dataset.label}: ${ctx.raw.toFixed(1)} (${level.label})`;
            }
          }
        }
      },
      elements: {
        line: { borderWidth: 2 },
        point: { radius: 4, hoverRadius: 6 }
      }
    }
  };
}

// 创建主雷达图（能力图谱页）
function createMainRadarChart(canvasId, scores, snapshotScores) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (radarChartInstance) {
    radarChartInstance.destroy();
    radarChartInstance = null;
  }

  const labels = DIMENSION_KEYS.map(k => `${DIMENSIONS[k].icon} ${DIMENSIONS[k].name}`);
  const currentAvgs = getDimensionAverages(scores);

  const datasets = [{
    label: '当前能力',
    data: currentAvgs,
    backgroundColor: 'rgba(212, 168, 83, 0.2)',
    borderColor: '#d4a853',
    pointBackgroundColor: '#d4a853',
    pointBorderColor: '#d4a853'
  }];

  if (snapshotScores) {
    const snapshotAvgs = snapshotScores.map(s => s || 0);
    datasets.push({
      label: '历史快照',
      data: snapshotAvgs,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6',
      borderDash: [5, 5],
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#3b82f6'
    });
  }

  const config = getRadarConfig(labels, datasets, { showLegend: !!snapshotScores, fontSize: 13 });
  radarChartInstance = new Chart(canvas, config);
}

// 创建迷你雷达图（Dashboard页）
function createMiniRadarChart(canvasId, scores) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (miniRadarChartInstance) {
    miniRadarChartInstance.destroy();
    miniRadarChartInstance = null;
  }

  const labels = DIMENSION_KEYS.map(k => DIMENSIONS[k].wuxia);
  const currentAvgs = getDimensionAverages(scores);

  const datasets = [{
    label: '能力概览',
    data: currentAvgs,
    backgroundColor: 'rgba(212, 168, 83, 0.2)',
    borderColor: '#d4a853',
    pointBackgroundColor: '#d4a853',
    pointBorderColor: '#d4a853',
    borderWidth: 2,
    pointRadius: 3
  }];

  const config = getRadarConfig(labels, datasets, { fontSize: 11 });
  radarChartInstance = null; // don't track mini
  miniRadarChartInstance = new Chart(canvas, config);
}

// 更新雷达图数据
function updateRadarChart(chart, scores, snapshotScores) {
  if (!chart) return;

  const currentAvgs = getDimensionAverages(scores);
  chart.data.datasets[0].data = currentAvgs;

  if (snapshotScores && chart.data.datasets.length > 1) {
    chart.data.datasets[1].data = snapshotScores;
  }

  chart.update();
}

// 创建快照
function createDimensionSnapshot(scores, trigger) {
  return {
    date: new Date().toISOString().split('T')[0],
    scores: getDimensionAverages(scores),
    trigger: trigger || 'manual'
  };
}
