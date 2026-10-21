import { store } from '../state/store.js';
import { ELEMENTS } from '../data/elements.js';

export function loadStateFromURL() {
  const params = new URLSearchParams(window.location.search);

  const elParam = params.get('el');
  if (elParam) {
    const found = ELEMENTS.find(
      e => e.symbol.toLowerCase() === elParam.toLowerCase() || String(e.z) === elParam
    );
    if (found) store.selectedElement = found;
  }

  const tempParam = parseInt(params.get('temp'), 10);
  if (!isNaN(tempParam) && tempParam >= 0 && tempParam <= 6000) {
    store.currentTemp = tempParam;
  }

  const labParam = params.get('lab');
  if (labParam === 'chemical' || labParam === 'fusion') {
    store.labMode = labParam;
  }

  const aParam = parseInt(params.get('a'), 10);
  const bParam = parseInt(params.get('b'), 10);
  if (!isNaN(aParam)) {
    const elA = ELEMENTS.find(e => e.z === aParam);
    if (elA) store.slotAElement = elA;
  }
  if (!isNaN(bParam)) {
    const elB = ELEMENTS.find(e => e.z === bParam);
    if (elB) store.slotBElement = elB;
  }

  const compParam = params.get('compare');
  if (compParam && compParam.includes(',')) {
    const [c1, c2] = compParam.split(',').map(n => parseInt(n, 10));
    if (!isNaN(c1) && c1 >= 1 && c1 <= 118) store.compareA = c1;
    if (!isNaN(c2) && c2 >= 1 && c2 <= 118) store.compareB = c2;
  }
}

export function syncStateToURL() {
  const params = new URLSearchParams();
  params.set('el', store.selectedElement.symbol);
  if (store.currentTemp !== 298) params.set('temp', String(store.currentTemp));
  params.set('lab', store.labMode);
  params.set('a', String(store.slotAElement.z));
  params.set('b', String(store.slotBElement.z));
  params.set('compare', `${store.compareA},${store.compareB}`);

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, '', newUrl);
}
