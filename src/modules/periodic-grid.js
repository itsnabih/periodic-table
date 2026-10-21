import { ELEMENTS, CATEGORIES } from '../data/elements.js';
import { store } from '../state/store.js';
import { getPhaseAtTemp, getPhaseLabel } from './thermodynamics.js';
import { drawSpectrumCanvas, generateAufbauSpinHTML, getNuclearStabilityInfo, startBohrAnimation, stopBohrAnimation } from './quantum-canvas.js';
import { assignElementToLab } from './synthesis-lab.js';
import { isCoarsePointer } from '../utils/dom.js';
import { syncStateToURL } from '../utils/url-state.js';

// DOM Reference Caching Map (Menghindari DOM Query Thrashing pada saat slider digeser)
const cellRefs = new Map();

export function renderCategoryLegend() {
  const container = document.getElementById('categoryLegend');
  container.innerHTML = '';
  Object.keys(CATEGORIES).forEach(key => {
    const cat = CATEGORIES[key];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cat-btn';
    btn.dataset.category = key;
    btn.innerHTML = `<span class="cat-swatch" style="background:${cat.color}"></span>${cat.name}`;
    btn.addEventListener('click', () => {
      if (store.activeCategory === key) {
        store.activeCategory = null;
        btn.classList.remove('active');
      } else {
        container.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        store.activeCategory = key;
        btn.classList.add('active');
      }
      updateVisualState();
    });
    container.appendChild(btn);
  });
}

export function renderPeriodicGrid() {
  const grid = document.getElementById('periodicGrid');
  const fragment = document.createDocumentFragment();

  const lanLabel = document.createElement('div');
  lanLabel.className = 'series-label';
  lanLabel.style.gridRow = '9';
  lanLabel.textContent = '57–71 Lantanida';
  fragment.appendChild(lanLabel);

  const actLabel = document.createElement('div');
  actLabel.className = 'series-label';
  actLabel.style.gridRow = '10';
  actLabel.textContent = '89–103 Aktinida';
  fragment.appendChild(actLabel);

  ELEMENTS.forEach(el => {
    const cell = document.createElement('div');
    cell.className = 'el-cell';
    cell.id = `el-${el.z}`;
    cell.dataset.z = String(el.z);
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', `${el.name} (${el.symbol}), Nomor Atom ${el.z}, Massa ${el.mass}`);
    cell.style.gridColumn = el.x;
    cell.style.gridRow = el.y;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'cell-actions';
    const labBtn = document.createElement('button');
    labBtn.type = 'button';
    labBtn.className = 'cell-act-btn';
    labBtn.dataset.action = 'lab';
    labBtn.title = 'Masukkan ke Lab Sintesis';
    labBtn.textContent = 'Lab';
    actionsDiv.appendChild(labBtn);

    const topDiv = document.createElement('div');
    topDiv.className = 'el-cell-top';
    const zSpan = document.createElement('span');
    zSpan.textContent = el.z;
    const phaseDot = document.createElement('span');
    phaseDot.className = 'el-phase-dot';
    topDiv.append(zSpan, phaseDot);

    const symDiv = document.createElement('div');
    symDiv.className = 'el-cell-sym';
    symDiv.textContent = el.symbol;

    const botDiv = document.createElement('div');
    botDiv.className = 'el-cell-bottom';
    botDiv.innerHTML = `<div class="el-cell-name">${el.name}</div><div class="el-cell-mass">${el.mass}</div>`;

    cell.append(actionsDiv, topDiv, symDiv, botDiv);
    fragment.appendChild(cell);

    cellRefs.set(el.z, { cell, phaseDot });
  });

  grid.appendChild(fragment);

  // Single Event Delegation untuk seluruh 118 sel unsur
  grid.addEventListener('mouseover', (e) => {
    if (isCoarsePointer()) return;
    const cell = e.target.closest('.el-cell');
    if (!cell) return;
    const z = parseInt(cell.dataset.z, 10);
    if (store.selectedElement.z !== z) {
      const el = ELEMENTS.find(item => item.z === z);
      if (el) updateSpotlight(el);
    }
  });

  grid.addEventListener('click', (e) => {
    const labBtn = e.target.closest('[data-action="lab"]');
    const cell = e.target.closest('.el-cell');
    if (!cell) return;

    const z = parseInt(cell.dataset.z, 10);
    const el = ELEMENTS.find(item => item.z === z);
    if (!el) return;

    if (labBtn) {
      e.stopPropagation();
      assignElementToLab(el);
      return;
    }

    // Perbaikan UX Layar Sentuh: Ketukan pertama memilih ke Inspector, ketukan kedua membuka Modal
    if (isCoarsePointer() && store.selectedElement.z !== el.z) {
      updateSpotlight(el);
      syncStateToURL();
      return;
    }

    updateSpotlight(el);
    openElementModal(el);
    syncStateToURL();
  });
}

export function updateVisualState() {
  let solid = 0, liquid = 0, gas = 0, unknown = 0;

  ELEMENTS.forEach(el => {
    const ref = cellRefs.get(el.z);
    if (!ref) return;
    const { cell, phaseDot } = ref;

    const phase = getPhaseAtTemp(el, store.currentTemp);
    const phaseInfo = getPhaseLabel(phase);
    if (phase === "solid") solid++;
    else if (phase === "liquid") liquid++;
    else if (phase === "gas") gas++;
    else unknown++;

    phaseDot.style.backgroundColor = phaseInfo.color;

    let accentCol = CATEGORIES[el.category].color;
    if (store.colorMode === "phase") accentCol = phaseInfo.color;
    else if (store.colorMode === "electronegativity") {
      accentCol = el.en == null ? "#3f3f46" : `hsl(${Math.round((1 - (el.en - 0.7) / 3.28) * 220)}, 80%, 55%)`;
    } else if (store.colorMode === "mass") {
      accentCol = `hsl(${Math.round(190 + (el.mass / 294) * 130)}, 75%, 55%)`;
    } else if (store.colorMode === "melting") {
      accentCol = el.melt == null ? "#3f3f46" : `hsl(${Math.round((1 - Math.min(el.melt / 3800, 1)) * 200)}, 80%, 55%)`;
    }
    cell.style.setProperty('--cat-color', accentCol);

    const matchCat = !store.activeCategory || el.category === store.activeCategory;
    const q = store.searchQuery;
    const matchSearch = !q ||
      el.name.toLowerCase().includes(q) ||
      el.symbol.toLowerCase().includes(q) ||
      String(el.z) === q;

    cell.classList.toggle('dimmed', !(matchCat && matchSearch));
    cell.classList.toggle('kb-selected', el.z === store.selectedElement.z);
  });

  document.getElementById('countSolid').textContent = solid;
  document.getElementById('countLiquid').textContent = liquid;
  document.getElementById('countGas').textContent = gas;
  document.getElementById('countUnknown').textContent = unknown;
}

export function updateSpotlight(el) {
  const prevRef = cellRefs.get(store.selectedElement.z);
  if (prevRef) prevRef.cell.classList.remove('kb-selected');

  store.selectedElement = el;
  const nextRef = cellRefs.get(el.z);
  if (nextRef) nextRef.cell.classList.add('kb-selected');

  const catInfo = CATEGORIES[el.category];
  const phaseInfo = getPhaseLabel(getPhaseAtTemp(el, store.currentTemp));

  document.getElementById('spBox').style.borderTop = `3px solid ${catInfo.color}`;
  document.getElementById('spNum').textContent = el.z;
  document.getElementById('spSym').textContent = el.symbol;
  document.getElementById('spMass').textContent = el.mass;
  document.getElementById('spName').textContent = el.name;

  const badge = document.getElementById('spCat');
  badge.textContent = catInfo.name;
  badge.style.color = catInfo.color;

  document.getElementById('spConfig').textContent = el.config;
  document.getElementById('spEn').textContent = el.en ?? 'N/A';
  document.getElementById('spPhase').textContent = phaseInfo.text;
  document.getElementById('spPhase').style.color = phaseInfo.color;
  document.getElementById('spMelt').textContent = el.melt ? `${el.melt} K` : 'N/A';
  document.getElementById('spBoil').textContent = el.boil ? `${el.boil} K` : 'N/A';
  document.getElementById('spOx').textContent = el.ox.map(v => (v > 0 ? `+${v}` : String(v))).join(', ');

  const peak = drawSpectrumCanvas('inspSpectrumCanvas', el.z);
  document.getElementById('spPeakWl').textContent = peak ? `Peak ~${peak.toFixed(1)} nm` : 'Sintetis';
  document.getElementById('inspOrbitalBoxes').innerHTML = generateAufbauSpinHTML(el.z, 3);
}

export function openElementModal(el) {
  store.selectedElement = el;
  const catInfo = CATEGORIES[el.category];
  const phaseInfo = getPhaseLabel(getPhaseAtTemp(el, store.currentTemp));

  document.getElementById('mAtomicNum').textContent = `Z = ${el.z}`;
  document.getElementById('mCatBadge').textContent = catInfo.name;
  document.getElementById('mCatBadge').style.color = catInfo.color;
  document.getElementById('mTitle').textContent = `${el.name} (${el.symbol})`;
  document.getElementById('mSummary').textContent =
    `Unsur bernomor atom ${el.z} dalam golongan ${el.x} dengan distribusi kulit elektron Bohr [${el.shells.join('-')}].`;

  document.getElementById('mMass').textContent = `${el.mass} g/mol`;
  document.getElementById('mConfig').textContent = el.config;
  document.getElementById('mMeltBoil').textContent = `${el.melt ?? 'N/A'} K / ${el.boil ?? 'N/A'} K`;
  document.getElementById('mEn').textContent = el.en ?? 'N/A';
  document.getElementById('mOxStates').textContent = el.ox.map(v => (v > 0 ? `+${v}` : String(v))).join(', ');
  document.getElementById('mTempLabel').textContent = `${store.currentTemp} K`;
  document.getElementById('mPhaseNow').textContent = phaseInfo.text;
  document.getElementById('mPhaseNow').style.color = phaseInfo.color;

  const shellNames = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
  document.getElementById('modalShellPills').innerHTML = el.shells.map((c, i) =>
    `<span class="shell-tag">${shellNames[i]}:${c}</span>`
  ).join('');

  const peak = drawSpectrumCanvas('modalSpectrumCanvas', el.z);
  document.getElementById('mSpectrumStatus').textContent = peak ? `NIST Verified (Peak ${peak} nm)` : 'Data Empiris N/A';
  document.getElementById('modalOrbitalBoxes').innerHTML = generateAufbauSpinHTML(el.z, 8);
  document.getElementById('mDecayBox').textContent = getNuclearStabilityInfo(el);

  const modal = document.getElementById('atomModal');
  modal.classList.add('open');
  document.getElementById('btnCloseModal').focus();
  startBohrAnimation(el, catInfo.color);
}

export function closeModal() {
  document.getElementById('atomModal').classList.remove('open');
  stopBohrAnimation();
}
