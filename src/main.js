import { ELEMENTS } from './data/elements.js';
import { store } from './state/store.js';
import { loadStateFromURL, syncStateToURL } from './utils/url-state.js';
import { renderCategoryLegend, renderPeriodicGrid, updateVisualState, updateSpotlight, openElementModal, closeModal } from './modules/periodic-grid.js';
import { setLabMode, selectSlot, assignElementToLab, loadPreset, updateLabSlotsUI, runSynthesis, loadLocalLabHistory } from './modules/synthesis-lab.js';
import { initComparatorDropdowns, updateComparison } from './modules/comparator.js';

let tempRafPending = false;

window.addEventListener('DOMContentLoaded', () => {
  loadStateFromURL();

  renderCategoryLegend();
  renderPeriodicGrid();
  initComparatorDropdowns();

  // Sinkronisasi UI Slider Suhu awal dari URL State
  const tempSlider = document.getElementById('tempSlider');
  tempSlider.value = String(store.currentTemp);
  const cInit = Math.round(store.currentTemp - 273.15);
  document.getElementById('tempDisplay').textContent = `${store.currentTemp} K (${cInit} °C)`;

  updateSpotlight(store.selectedElement);
  updateVisualState();
  updateLabSlotsUI();
  setLabMode(store.labMode);
  loadLocalLabHistory();

  bindUIEvents();
  initTheme();

  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

function initTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  updateThemeButtonUI(currentTheme);

  const btn = document.getElementById('btnThemeToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const nextTheme = isLight ? 'dark' : 'light';
    setTheme(nextTheme);
  });
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('pt_theme', theme);
  } catch (_) {}

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'light' ? '#f1f4f9' : '#09090b');
  }

  updateThemeButtonUI(theme);
  updateSpotlight(store.selectedElement);
  if (document.getElementById('drawerCompare') && document.getElementById('drawerCompare').classList.contains('open')) {
    updateComparison();
  }
}

function updateThemeButtonUI(theme) {
  const btn = document.getElementById('btnThemeToggle');
  if (btn) {
    const isLight = theme === 'light';
    btn.setAttribute('aria-checked', isLight ? 'true' : 'false');
    btn.setAttribute('title', isLight ? 'Beralih ke Mode Gelap' : 'Beralih ke Mode Terang');
  }
}

function toggleDrawer(which) {
  const map = {
    lab: { drawer: 'drawerLab', btn: 'btnLabToggle' },
    compare: { drawer: 'drawerCompare', btn: 'btnCompareToggle' },
    support: { drawer: 'drawerSupport', btn: 'btnSupportToggle' }
  };
  const target = map[which];
  if (!target) return;

  const drawerEl = document.getElementById(target.drawer);
  const btnEl = document.getElementById(target.btn);
  const isOpen = drawerEl.classList.toggle('open');
  btnEl.classList.toggle('active', isOpen);
  btnEl.setAttribute('aria-expanded', String(isOpen));

  if (which === 'compare' && isOpen) {
    updateComparison();
  }
}

function bindUIEvents() {
  // Pencarian Instan
  document.getElementById('searchInput').addEventListener('input', (e) => {
    store.searchQuery = e.target.value.trim().toLowerCase();
    updateVisualState();
  });

  // Slider Suhu dengan requestAnimationFrame Throttling (Bebas Lag 60fps)
  document.getElementById('tempSlider').addEventListener('input', (e) => {
    store.currentTemp = parseInt(e.target.value, 10);
    if (!tempRafPending) {
      tempRafPending = true;
      requestAnimationFrame(() => {
        const c = Math.round(store.currentTemp - 273.15);
        document.getElementById('tempDisplay').textContent = `${store.currentTemp} K (${c} °C)`;
        updateVisualState();
        updateSpotlight(store.selectedElement);
        syncStateToURL();
        tempRafPending = false;
      });
    }
  });

  document.getElementById('btnResetTemp').addEventListener('click', () => {
    store.currentTemp = 298;
    document.getElementById('tempSlider').value = '298';
    document.getElementById('tempDisplay').textContent = '298 K (25 °C)';
    updateVisualState();
    updateSpotlight(store.selectedElement);
    syncStateToURL();
  });

  // Mode Heatmap
  document.getElementById('colorMode').addEventListener('change', (e) => {
    store.colorMode = e.target.value;
    updateVisualState();
  });

  // Navigasi Drawer (Lab, Komparator, Dukungan Saweria)
  document.getElementById('btnLabToggle').addEventListener('click', () => toggleDrawer('lab'));
  document.getElementById('btnCompareToggle').addEventListener('click', () => toggleDrawer('compare'));
  document.getElementById('btnSupportToggle').addEventListener('click', () => toggleDrawer('support'));

  // Tombol Bagikan Tautan Eksperimen di Drawer Dukungan
  document.getElementById('btnCopyShareUrl').addEventListener('click', (e) => {
    syncStateToURL();
    navigator.clipboard.writeText(window.location.href).then(() => {
      const btn = e.currentTarget;
      const orig = btn.textContent;
      btn.textContent = '✓ Tautan Eksperimen Tersalin!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  });

  // Kontrol Lab Sintesis
  document.getElementById('tabChem').addEventListener('click', () => setLabMode('chemical'));
  document.getElementById('tabFusion').addEventListener('click', () => setLabMode('fusion'));
  document.getElementById('slotA').addEventListener('click', () => selectSlot('A'));
  document.getElementById('slotB').addEventListener('click', () => selectSlot('B'));
  document.getElementById('btnRunSynth').addEventListener('click', () => runSynthesis(true));

  // Event Delegation untuk Preset Lab
  document.getElementById('presetContainer').addEventListener('click', (e) => {
    const btn = e.target.closest('.preset-btn');
    if (!btn) return;
    loadPreset(parseInt(btn.dataset.z1, 10), parseInt(btn.dataset.z2, 10), btn.dataset.mode);
  });

  // Tombol Aksi Cepat di Inspector (untuk pengguna Mobile/Touch)
  document.getElementById('btnInspOpenModal').addEventListener('click', () => openElementModal(store.selectedElement));
  document.getElementById('btnInspSendLab').addEventListener('click', () => assignElementToLab(store.selectedElement));

  // Kontrol Modal Detail
  document.getElementById('btnCloseModal').addEventListener('click', closeModal);
  document.getElementById('atomModal').addEventListener('click', (e) => {
    if (e.target.id === 'atomModal') closeModal();
  });
  document.getElementById('btnModalSendLab').addEventListener('click', () => {
    assignElementToLab(store.selectedElement);
    closeModal();
  });

  // Command Palette (Ctrl + K)
  document.getElementById('cmdOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'cmdOverlay') closeCommandPalette();
  });
  document.getElementById('cmdInput').addEventListener('input', (e) => {
    renderCommandPaletteList(e.target.value.trim().toLowerCase());
  });
  document.getElementById('cmdList').addEventListener('click', (e) => {
    const item = e.target.closest('.cmd-item');
    if (!item) return;
    const z = parseInt(item.dataset.z, 10);
    const el = ELEMENTS.find(x => x.z === z);
    closeCommandPalette();
    if (el) {
      updateSpotlight(el);
      openElementModal(el);
      syncStateToURL();
    }
  });

  window.addEventListener('keydown', handleGlobalKeydown);

  // Responsif Canvas saat ukuran jendela browser berubah
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateSpotlight(store.selectedElement);
    }, 120);
  });
}

function handleGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openCommandPalette();
    return;
  }
  if (e.key === 'Escape') {
    closeCommandPalette();
    closeModal();
    return;
  }
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.key === 'ArrowRight') {
    e.preventDefault();
    const next = ELEMENTS.find(el => el.z === Math.min(118, store.selectedElement.z + 1));
    if (next) {
      updateSpotlight(next);
      syncStateToURL();
    }
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    const prev = ELEMENTS.find(el => el.z === Math.max(1, store.selectedElement.z - 1));
    if (prev) {
      updateSpotlight(prev);
      syncStateToURL();
    }
  } else if (e.key === 'Enter') {
    openElementModal(store.selectedElement);
  }
}

function openCommandPalette() {
  document.getElementById('cmdOverlay').classList.add('open');
  const inp = document.getElementById('cmdInput');
  inp.value = '';
  renderCommandPaletteList('');
  setTimeout(() => inp.focus(), 40);
}

function closeCommandPalette() {
  document.getElementById('cmdOverlay').classList.remove('open');
}

function renderCommandPaletteList(q) {
  const list = document.getElementById('cmdList');
  const matches = ELEMENTS.filter(el =>
    !q || el.name.toLowerCase().includes(q) || el.symbol.toLowerCase().includes(q) || String(el.z) === q
  ).slice(0, 12);

  list.innerHTML = matches.map(el => `
    <div class="cmd-item" role="option" data-z="${el.z}">
      <div class="cmd-item-left">
        <span class="cmd-sym-badge">${el.symbol}</span>
        <span>${el.name} <small style="color:var(--text-muted); font-family:var(--font-mono);">(Z=${el.z})</small></span>
      </div>
      <span style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted);">${el.config}</span>
    </div>
  `).join('');
}
