/* ==========================================================================
   Complexidade de Algoritmos no Gerenciamento de Sistemas Operacionais
   script.js — navegação por abas + gráficos comparativos (Chart.js)
   ========================================================================== */

/* ---- 1. Definição das 5 classes de complexidade -------------------------- */
/* Cada classe carrega sua cor funcional e a função usada para gerar a curva. */
const CLASSES = {
  o1:     { label: 'O(1)',       color: '#2f9e44', f: (n) => 1 },
  ologn:  { label: 'O(log n)',   color: '#1c7ed6', f: (n) => Math.log2(n) },
  on:     { label: 'O(n)',       color: '#f08c00', f: (n) => n },
  onlogn: { label: 'O(n log n)', color: '#e8590c', f: (n) => n * Math.log2(n) },
  on2:    { label: 'O(n²)',      color: '#c92a2a', f: (n) => n * n },
};

/* intervalo de n usado em todos os gráficos (1 a 16) */
const N_RANGE = Array.from({ length: 16 }, (_, i) => i + 1);

/* ---- 2. Fábrica de gráficos ------------------------------------------------ */
/**
 * Desenha um gráfico de linhas comparando as 5 classes.
 * @param {string} canvasId   id do <canvas>
 * @param {string|null} highlight  chave da classe a destacar (null = todas iguais)
 */
function drawComplexityChart(canvasId, highlight) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || canvas.dataset.rendered === 'true') return; // evita redesenhar
  canvas.dataset.rendered = 'true';

  const datasets = Object.entries(CLASSES).map(([key, def]) => {
    const isHighlighted = !highlight || key === highlight;
    return {
      label: def.label,
      data: N_RANGE.map((n) => def.f(n)),
      borderColor: def.color,
      backgroundColor: def.color,
      borderWidth: highlight ? (isHighlighted ? 3 : 1.5) : 2,
      borderDash: highlight && !isHighlighted ? [4, 3] : [],
      pointRadius: 0,
      tension: key === 'o1' ? 0 : 0.15,
      order: isHighlighted ? 0 : 1,
      opacity: isHighlighted ? 1 : 0.35,
    };
  });

  // aplica opacidade reduzida às curvas não destacadas (via rgba)
  datasets.forEach((ds) => {
    if (ds.opacity !== 1) {
      ds.borderColor = hexToRgba(ds.borderColor, 0.35);
    }
  });

  new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: { labels: N_RANGE, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: { display: false }, // legenda própria em HTML (.chart-legend)
        tooltip: {
          callbacks: {
            title: (items) => `n = ${items[0].label}`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'tamanho da entrada (n)', font: { size: 11 } },
          grid: { color: '#eef1f4' },
        },
        y: {
          title: { display: true, text: 'passos / operações', font: { size: 11 } },
          grid: { color: '#eef1f4' },
          beginAtZero: true,
        },
      },
    },
  });
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ---- 3. Navegação por abas -------------------------------------------------- */
function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.panel');

  function activate(tabId) {
    buttons.forEach((b) => b.classList.toggle('is-active', b.dataset.tab === tabId));
    panels.forEach((p) => p.classList.toggle('is-active', p.id === `panel-${tabId}`));

    // renderiza o gráfico da aba somente quando ela é aberta pela primeira vez
    const chartMap = {
      intro: ['chart-intro', null],
      o1: ['chart-o1', 'o1'],
      ologn: ['chart-ologn', 'ologn'],
      on: ['chart-on', 'on'],
      onlogn: ['chart-onlogn', 'onlogn'],
      on2: ['chart-on2', 'on2'],
    };
    if (chartMap[tabId]) {
      const [canvasId, highlight] = chartMap[tabId];
      drawComplexityChart(canvasId, highlight);
    }

    window.location.hash = tabId;
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => activate(btn.dataset.tab));
  });

  // permite abrir uma aba diretamente pela URL (#o1, #on2, ...)
  const initial = window.location.hash.replace('#', '') || 'intro';
  activate(document.querySelector(`.tab-btn[data-tab="${initial}"]`) ? initial : 'intro');
}

document.addEventListener('DOMContentLoaded', initTabs);
