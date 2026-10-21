import { ELEMENTS, CATEGORIES } from '../data/elements.js';
import { KNOWN_COMPOUNDS } from '../data/compounds.js';
import { store } from '../state/store.js';
import { setupHiDPICanvas } from '../utils/dom.js';
import { syncStateToURL } from '../utils/url-state.js';

let reactorAnimId = null;

export function setLabMode(mode) {
  store.labMode = mode;
  const tabChem = document.getElementById('tabChem');
  const tabFusion = document.getElementById('tabFusion');
  tabChem.classList.toggle('active', mode === 'chemical');
  tabChem.setAttribute('aria-selected', String(mode === 'chemical'));
  tabFusion.classList.toggle('active', mode === 'fusion');
  tabFusion.setAttribute('aria-selected', String(mode === 'fusion'));
  runSynthesis(false);
  syncStateToURL();
}

export function selectSlot(slot) {
  store.activeSlot = slot;
  document.getElementById('slotA').classList.toggle('active-slot', slot === 'A');
  document.getElementById('slotB').classList.toggle('active-slot', slot === 'B');
}

export function assignElementToLab(el) {
  document.getElementById('drawerLab').classList.add('open');
  document.getElementById('btnLabToggle').classList.add('active');
  document.getElementById('btnLabToggle').setAttribute('aria-expanded', 'true');

  if (store.activeSlot === 'A') {
    store.slotAElement = el;
    selectSlot('B');
  } else {
    store.slotBElement = el;
    selectSlot('A');
  }
  updateLabSlotsUI();
  runSynthesis(true);
  syncStateToURL();
}

export function loadPreset(z1, z2, mode) {
  const el1 = ELEMENTS.find(e => e.z === z1);
  const el2 = ELEMENTS.find(e => e.z === z2);
  if (el1) store.slotAElement = el1;
  if (el2) store.slotBElement = el2;
  setLabMode(mode);
  updateLabSlotsUI();
  runSynthesis(true);
}

export function updateLabSlotsUI() {
  const elA = store.slotAElement;
  const elB = store.slotBElement;

  document.getElementById('slotASym').textContent = elA.symbol;
  document.getElementById('slotAName').textContent = elA.name;
  document.getElementById('slotASub').textContent = `Z = ${elA.z} · ${elA.mass} g/mol`;

  document.getElementById('slotBSym').textContent = elB.symbol;
  document.getElementById('slotBName').textContent = elB.name;
  document.getElementById('slotBSub').textContent = `Z = ${elB.z} · ${elB.mass} g/mol`;
}

// Perbaikan Ilmiah: Menggunakan Bilangan Oksidasi Nyata dari elements.js
function getPrimaryValence(el, asAnion = false) {
  if (el.category === 'noble') return 0;
  if (!el.ox || el.ox.length === 0) return 2;

  if (asAnion) {
    const neg = el.ox.find(v => v < 0);
    if (neg !== undefined) return Math.abs(neg);
  }
  const pos = el.ox.find(v => v > 0);
  return pos !== undefined ? pos : Math.abs(el.ox[0]) || 1;
}

function toSubscript(num) {
  if (num <= 1) return "";
  const subs = ['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉'];
  return String(num).split('').map(d => subs[parseInt(d, 10)]).join('');
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function updateStoichiometryUI(el1, count1, el2, count2, geom, deltaEn) {
  const m1 = el1.mass * count1;
  const m2 = el2 ? el2.mass * count2 : 0;
  const total = m1 + m2;
  const pct1 = total > 0 ? ((m1 / total) * 100).toFixed(1) : 100;
  const pct2 = total > 0 ? (100 - parseFloat(pct1)).toFixed(1) : 0;

  document.getElementById('resMolarMass').textContent = `${total.toFixed(3)} g/mol`;
  document.getElementById('resGeometry').textContent = geom;
  document.getElementById('resDeltaEn').textContent = deltaEn;

  document.getElementById('barMassA').style.width = `${pct1}%`;
  document.getElementById('barMassB').style.width = `${pct2}%`;
  document.getElementById('lblMassA').textContent = `${el1.symbol}: ${pct1}%`;
  document.getElementById('lblMassB').textContent = el2 && count2 > 0 ? `${el2.symbol}: ${pct2}%` : '';
}

export function loadLocalLabHistory() {
  try {
    const last = localStorage.getItem('pt_lab_history');
    if (last) {
      document.getElementById('labHistoryText').textContent = `Terakhir: ${last}`;
    }
  } catch (_) {}
}

export function runSynthesis(saveToLocal) {
  const elA = store.slotAElement;
  const elB = store.slotBElement;
  const badgeEl = document.getElementById('resBadge');
  const formulaEl = document.getElementById('resFormula');
  const titleEl = document.getElementById('resTitle');
  const descEl = document.getElementById('resDesc');

  let resultSummary = "";

  if (store.labMode === 'fusion') {
    const newZ = elA.z + elB.z;
    if (newZ <= 118) {
      const fusedEl = ELEMENTS.find(e => e.z === newZ);
      const note = newZ <= 26 ? "Eksotermik (Fusi Inti Bintang)" : "Endotermik (Akselerator Ion Berat)";
      badgeEl.textContent = `Fusi Nuklir · Z = ${elA.z} + ${elB.z} → ${newZ}`;
      formulaEl.textContent = `${fusedEl.symbol} (Z=${fusedEl.z})`;
      titleEl.textContent = `Unsur Hasil Fusi: ${fusedEl.name}`;
      descEl.textContent = `Penggabungan inti ${elA.name} dan ${elB.name} menghasilkan inti ${fusedEl.name} (${fusedEl.symbol}). ${note}.`;
      updateStoichiometryUI(elA, 1, elB, 1, "Nukleosintesis Inti", "N/A (Reaksi Inti)");
      resultSummary = `${elA.symbol} + ${elB.symbol} → ${fusedEl.symbol}`;
      startReactorAnimation(CATEGORIES[elA.category].color, CATEGORIES[elB.category].color, CATEGORIES[fusedEl.category].color, fusedEl.symbol);
    } else {
      badgeEl.textContent = `Trans-Oganesson · Z = ${newZ}`;
      formulaEl.textContent = `U${newZ}`;
      titleEl.textContent = `Inti Superberat Hipotetis (Z=${newZ})`;
      descEl.textContent = `Jumlah proton (${newZ}) melampaui batas tabel periodik saat ini (Z=118). Berada pada zona riset pulau stabilitas trans-aktinida.`;
      updateStoichiometryUI(elA, 1, elB, 1, "Inti Superberat", "N/A");
      resultSummary = `${elA.symbol} + ${elB.symbol} → Z=${newZ}`;
      startReactorAnimation(CATEGORIES[elA.category].color, CATEGORIES[elB.category].color, "#a1a1aa", `Z=${newZ}`);
    }
  } else {
    const minZ = Math.min(elA.z, elB.z);
    const maxZ = Math.max(elA.z, elB.z);
    const key = `${minZ}-${maxZ}`;

    if (KNOWN_COMPOUNDS[key]) {
      const comp = KNOWN_COMPOUNDS[key];
      const firstEl = ELEMENTS.find(e => e.z === comp.zA);
      const secondEl = ELEMENTS.find(e => e.z === comp.zB);
      const dEn = (firstEl.en != null && secondEl.en != null) ? Math.abs(firstEl.en - secondEl.en).toFixed(2) : "N/A";

      badgeEl.textContent = comp.type;
      formulaEl.textContent = comp.formula;
      titleEl.textContent = comp.name;
      descEl.textContent = comp.desc;
      updateStoichiometryUI(firstEl, comp.cA, secondEl, comp.cB, comp.geom, dEn);
      resultSummary = `${elA.symbol} + ${elB.symbol} → ${comp.formula}`;
      startReactorAnimation(CATEGORIES[elA.category].color, CATEGORIES[elB.category].color, "#fafafa", comp.formula);
    } else if (elA.category === 'noble' || elB.category === 'noble') {
      badgeEl.textContent = "Gas Mulia Inert";
      formulaEl.textContent = `${elA.symbol} + ${elB.symbol}`;
      titleEl.textContent = "Tidak Terbentuk Ikatan Standar";
      descEl.textContent = "Konfigurasi kulit valensi oktet penuh membuat gas mulia bersifat monoatomik inert pada kondisi standar.";
      updateStoichiometryUI(elA, 1, elB, 1, "Monoatomik Bebas", "0.00");
      resultSummary = `${elA.symbol} + ${elB.symbol} (Inert)`;
      startReactorAnimation(CATEGORIES[elA.category].color, CATEGORIES[elB.category].color, "#71717a", "Inert");
    } else {
      const isMetal = (cat) => ['alkali','alkaline','transition','post-transition','lanthanide','actinide'].includes(cat);
      if (isMetal(elA.category) && isMetal(elB.category)) {
        const symFormula = elA.z === elB.z ? elA.symbol : `${elA.symbol}${elB.symbol}`;
        badgeEl.textContent = "Ikatan Logam (Paduan / Alloy)";
        formulaEl.textContent = symFormula;
        titleEl.textContent = elA.z === elB.z ? `Logam Murni ${elA.name}` : `Paduan Intermetalik ${elA.name}-${elB.name}`;
        descEl.textContent = "Delokalisasi lautan elektron konduksi membentuk struktur kisi kristal logam campuran.";
        updateStoichiometryUI(elA, 1, elA.z === elB.z ? null : elB, elA.z === elB.z ? 0 : 1, "Kisi Kristal Logam", "Alloy");
        resultSummary = `Alloy ${symFormula}`;
        startReactorAnimation(CATEGORIES[elA.category].color, CATEGORIES[elB.category].color, "#10b981", symFormula);
      } else {
        const first = (elA.en || 1.5) <= (elB.en || 1.5) ? elA : elB;
        const second = first === elA ? elB : elA;
        const v1 = getPrimaryValence(first, false);
        const v2 = getPrimaryValence(second, true);
        const div = gcd(v1, v2);
        const s1 = v2 / div;
        const s2 = v1 / div;

        const formula = first.z === second.z
          ? `${first.symbol}₂`
          : `${first.symbol}${toSubscript(s1)}${second.symbol}${toSubscript(s2)}`;

        const dEn = Math.abs((first.en || 1.8) - (second.en || 1.8)).toFixed(2);
        const bondType = dEn > 1.7 ? "Ikatan Ionik" : "Ikatan Kovalen";
        const geom = first.z === second.z ? "Diatomik Linear" : (s1 + s2 === 2 ? "Linear / Kisi Kubik" : (s1 + s2 === 3 ? "Planar / Bent" : "Poliatomik 3D"));

        const anionNames = {
          "O": "Oksida", "S": "Sulfida", "N": "Nitrida", "P": "Fosfida",
          "F": "Fluorida", "Cl": "Klorida", "Br": "Bromida", "I": "Iodida",
          "C": "Karbida", "H": "Hidrida", "Si": "Silisida", "Se": "Selenida"
        };
        const suffix = anionNames[second.symbol] || (second.name + "ida");
        const roman = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII" };
        const oxTag = ['transition', 'post-transition', 'actinide'].includes(first.category) ? `(${roman[v1] || v1})` : '';
        const compName = first.z === second.z ? `Diatomik ${first.name}` : `${first.name}${oxTag} ${suffix}`;

        badgeEl.textContent = bondType;
        formulaEl.textContent = formula;
        titleEl.textContent = compName;
        descEl.textContent = `Sintesis stoikiometri berdasarkan bilangan oksidasi stabil (+${v1} : -${v2}) antara ${first.name} dan ${second.name}.`;
        updateStoichiometryUI(first, first.z === second.z ? 2 : s1, first.z === second.z ? null : second, first.z === second.z ? 0 : s2, geom, dEn);
        resultSummary = `${elA.symbol} + ${elB.symbol} → ${formula}`;
        startReactorAnimation(CATEGORIES[elA.category].color, CATEGORIES[elB.category].color, "#3b82f6", formula);
      }
    }
  }

  if (saveToLocal) {
    document.getElementById('labHistoryText').textContent = `Log: ${resultSummary}`;
    try {
      localStorage.setItem('pt_lab_history', resultSummary);
    } catch (_) {}
  }
}

// Perbaikan Performa: Finite Animation (Berhenti otomatis setelah t === 60 agar tidak membocorkan CPU/GPU)
function startReactorAnimation(colorA, colorB, colorProd, labelText) {
  if (reactorAnimId) cancelAnimationFrame(reactorAnimId);
  const canvas = document.getElementById('reactionCanvas');
  const setup = setupHiDPICanvas(canvas);
  if (!setup) return;
  const { ctx, width, height } = setup;
  let t = 0;

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2, cy = height / 2;

    if (t < 28) {
      const p = t / 28;
      const dist = (1 - p) * 30;
      ctx.fillStyle = colorA;
      ctx.beginPath(); ctx.arc(cx - dist, cy, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = colorB;
      ctx.beginPath(); ctx.arc(cx + dist, cy, 9, 0, Math.PI * 2); ctx.fill();
    } else {
      const pulse = Math.sin((t - 28) * 0.15) * 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, 32 + pulse, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = '#18181c';
      ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = colorProd;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fafafa';
      ctx.font = '600 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText.slice(0, 6), cx, cy);
    }

    t++;
    if (t <= 60) {
      reactorAnimId = requestAnimationFrame(animate);
    } else {
      reactorAnimId = null;
    }
  }
  animate();
}
