import { ELEMENTS, CATEGORIES } from '../data/elements.js';
import { store } from '../state/store.js';
import { syncStateToURL } from '../utils/url-state.js';

export function initComparatorDropdowns() {
  const selA = document.getElementById('compSelectA');
  const selB = document.getElementById('compSelectB');
  const optionsHtml = ELEMENTS.map(e => `<option value="${e.z}">${e.z} - ${e.name} (${e.symbol})</option>`).join('');
  selA.innerHTML = optionsHtml;
  selB.innerHTML = optionsHtml;
  selA.value = String(store.compareA);
  selB.value = String(store.compareB);

  selA.addEventListener('change', () => {
    store.compareA = parseInt(selA.value, 10);
    updateComparison();
    syncStateToURL();
  });

  selB.addEventListener('change', () => {
    store.compareB = parseInt(selB.value, 10);
    updateComparison();
    syncStateToURL();
  });

  updateComparison();
}

export function updateComparison() {
  const elA = ELEMENTS.find(e => e.z === store.compareA) || ELEMENTS[25];
  const elB = ELEMENTS.find(e => e.z === store.compareB) || ELEMENTS[78];

  const renderTable = (el) => `
    <tr><td>Kategori</td><td>${CATEGORIES[el.category].name}</td></tr>
    <tr><td>Massa Atom</td><td>${el.mass} g/mol</td></tr>
    <tr><td>Elektronegativitas</td><td>${el.en ?? 'N/A'}</td></tr>
    <tr><td>Titik Leleh</td><td>${el.melt ? el.melt + ' K' : 'N/A'}</td></tr>
    <tr><td>Titik Didih</td><td>${el.boil ? el.boil + ' K' : 'N/A'}</td></tr>
    <tr><td>Bilangan Oksidasi</td><td>${el.ox.map(v => (v > 0 ? '+' + v : v)).join(', ')}</td></tr>
    <tr><td>Konfigurasi</td><td>${el.config}</td></tr>
  `;
  document.getElementById('compTableA').innerHTML = renderTable(elA);
  document.getElementById('compTableB').innerHTML = renderTable(elB);

  drawRadarComparison(elA, elB);
}

function drawRadarComparison(elA, elB) {
  const svg = document.getElementById('radarSvg');
  const cx = 120, cy = 105, rMax = 72;
  const axes = [
    { label: "Massa", getVal: e => e.mass / 294 },
    { label: "EN", getVal: e => (e.en || 0) / 3.98 },
    { label: "T.Leleh", getVal: e => Math.min((e.melt || 0) / 3800, 1) },
    { label: "T.Didih", getVal: e => Math.min((e.boil || 0) / 6200, 1) },
    { label: "Kulit", getVal: e => e.shells.length / 7 }
  ];

  let html = '';
  [0.33, 0.66, 1.0].forEach(level => {
    const pts = axes.map((_, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
      return `${cx + rMax * level * Math.cos(ang)},${cy + rMax * level * Math.sin(ang)}`;
    }).join(' ');
    html += `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;
  });

  axes.forEach((ax, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
    const x2 = cx + rMax * Math.cos(ang);
    const y2 = cy + rMax * Math.sin(ang);
    const lx = cx + (rMax + 20) * Math.cos(ang);
    const ly = cy + (rMax + 14) * Math.sin(ang);
    html += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
    html += `<text x="${lx}" y="${ly}" fill="#a1a1aa" font-size="9" font-family="JetBrains Mono" text-anchor="middle" dominant-baseline="middle">${ax.label}</text>`;
  });

  const buildPoly = (el, strokeCol, fillCol) => {
    const pts = axes.map((ax, i) => {
      const val = Math.max(ax.getVal(el), 0.08);
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
      return `${cx + rMax * val * Math.cos(ang)},${cy + rMax * val * Math.sin(ang)}`;
    }).join(' ');
    return `<polygon points="${pts}" fill="${fillCol}" stroke="${strokeCol}" stroke-width="1.8"/>`;
  };

  html += buildPoly(elA, "#3b82f6", "rgba(59, 130, 246, 0.22)");
  html += buildPoly(elB, "#10b981", "rgba(16, 185, 129, 0.22)");
  svg.innerHTML = html;
}
