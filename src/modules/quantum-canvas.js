import { NIST_SPECTRA } from '../data/spectra.js';
import { ELEMENTS } from '../data/elements.js';
import { setupHiDPICanvas } from '../utils/dom.js';

let bohrAnimId = null;
let currentBohrEl = null;
let currentBohrColor = '#3b82f6';

export function wavelengthToRGB(wavelength) {
  let r = 0, g = 0, b = 0;
  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380); b = 1.0;
  } else if (wavelength >= 440 && wavelength < 490) {
    g = (wavelength - 440) / (490 - 440); b = 1.0;
  } else if (wavelength >= 490 && wavelength < 510) {
    g = 1.0; b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510); g = 1.0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1.0; g = -(wavelength - 645) / (645 - 580);
  } else if (wavelength >= 645 && wavelength <= 750) {
    r = 1.0;
  }
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

export function drawSpectrumCanvas(canvasId, z) {
  const canvas = document.getElementById(canvasId);
  const setup = setupHiDPICanvas(canvas);
  if (!setup) return null;
  const { ctx, width: w, height: h } = setup;

  ctx.fillStyle = '#050507';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let x = 0; x < w; x += w / 6) {
    ctx.fillRect(x, 0, 1, h);
  }

  const lines = NIST_SPECTRA[z];
  if (!lines || lines.length === 0) {
    ctx.fillStyle = '#71717a';
    ctx.font = '500 9.5px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Data Spektrum Empiris Tidak Tersedia (Unsur Sintetis t½ Pendek)', w / 2, h / 2);
    return null;
  }

  lines.forEach(wl => {
    const x = ((wl - 380) / (750 - 380)) * w;
    const color = wavelengthToRGB(wl);

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.28;
    ctx.fillRect(x - 2.5, 0, 5, h);

    ctx.globalAlpha = 0.95;
    ctx.fillRect(x - 0.75, 0, 1.5, h);
  });
  ctx.globalAlpha = 1.0;
  return lines[lines.length - 1];
}

export function generateAufbauSpinHTML(z, maxShow) {
  const subshells = [
    ["1s", 1], ["2s", 1], ["2p", 3], ["3s", 1], ["3p", 3],
    ["4s", 1], ["3d", 5], ["4p", 3], ["5s", 1], ["4d", 5],
    ["5p", 3], ["6s", 1], ["4f", 7], ["5d", 5], ["6p", 3],
    ["7s", 1], ["5f", 7], ["6d", 5], ["7p", 3]
  ];
  let rem = z;
  const filled = [];

  for (const [name, boxes] of subshells) {
    if (rem <= 0) break;
    const cap = boxes * 2;
    const elec = Math.min(rem, cap);
    rem -= elec;

    const arrows = [];
    for (let b = 0; b < boxes; b++) {
      const hasUp = elec > b;
      const hasDown = elec > (b + boxes);
      if (hasUp && hasDown) arrows.push("↑↓");
      else if (hasUp) arrows.push("↑");
      else arrows.push("·");
    }
    filled.push({ name, elec, arrows: arrows.join(" ") });
  }

  const slice = maxShow ? filled.slice(-maxShow) : filled;
  return slice.map(item => `
    <div class="orb-group">
      <span class="orb-lbl">${item.name}<sup>${item.elec}</sup></span>
      <span class="orb-arrows">${item.arrows}</span>
    </div>
  `).join('');
}

export function getNuclearStabilityInfo(el) {
  if (el.z === 43) {
    return "Radioaktif Transisi: Teknesium-99m meluruh melalui Transisi Isomerik / Beta⁻ (t½ = 6.01 jam) → Rutenium-99 (Stabil).";
  }
  if (el.z === 61) {
    return "Lantanida Radioaktif: Prometium-145 meluruh melalui Tangkap Elektron (t½ = 17.7 tahun) → Neodimium-145 (Stabil).";
  }
  if (el.z === 92) {
    return "Deret Uranium (4n+2): ²³⁸U (α, 4.47 miliar thn) → ²³⁴Th (β⁻) → ²³⁴Pa (β⁻) → ²³⁴U (α) → ²³⁰Th → ²²⁶Ra → ²²²Rn → ²⁰⁶Pb (Stabil).";
  }
  if (el.z === 90) {
    return "Deret Torium (4n): ²³²Th (α, 14.05 miliar thn) → ²²⁸Ra (β⁻) → ²²⁸Ac (β⁻) → ²²⁸Th (α) → ²²⁴Ra → ²⁰⁸Pb (Stabil).";
  }
  if (el.z === 94) {
    return "Aktinida Fisil: ²³⁹Pu (α, 24.110 tahun) → ²³⁵U (α) → ²³¹Th (β⁻) → ²³¹Pa → ²⁰⁷Pb (Stabil).";
  }
  if (el.z >= 84) {
    const daughterZ = el.z - 2;
    const daughter = ELEMENTS.find(e => e.z === daughterZ);
    return `Inti Tidak Stabil (Z > 83): Meluruh dominan melalui pancaran partikel Alfa (α: ⁴He²⁺) menuju ${daughter ? daughter.name + ' (Z=' + daughterZ + ')' : 'inti lebih ringan'} atau Fisi Spontan.`;
  }
  return `Inti Stabil: Memiliki sekurangnya satu isotop primordial stabil dengan rasio neutron-proton optimal pada pita kestabilan nuklir (Massa rata-rata: ${el.mass} u).`;
}

export function startBohrAnimation(el, accentColor) {
  stopBohrAnimation();
  currentBohrEl = el;
  currentBohrColor = accentColor;

  const canvas = document.getElementById('bohrCanvas');
  const setup = setupHiDPICanvas(canvas);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const cx = width / 2, cy = height / 2;
  const shells = el.shells;
  let t = 0;

  function draw() {
    if (document.hidden) {
      bohrAnimId = requestAnimationFrame(draw);
      return;
    }
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = currentBohrColor;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentBohrEl.symbol, cx, cy);

    const maxR = 112, minR = 26;
    const step = shells.length > 1 ? (maxR - minR) / (shells.length - 1) : 0;

    shells.forEach((count, sIdx) => {
      const r = shells.length === 1 ? 52 : minR + sIdx * step;
      ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.16)' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      const speed = (0.015 / (sIdx + 1)) * (sIdx % 2 === 0 ? 1 : -1);
      const baseAng = t * speed * 40;

      for (let i = 0; i < count; i++) {
        const theta = baseAng + (i * 2 * Math.PI) / count;
        ctx.beginPath();
        ctx.arc(cx + r * Math.cos(theta), cy + r * Math.sin(theta), 3, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? '#0f172a' : '#fafafa';
        ctx.fill();
      }
    });

    t += 0.5;
    bohrAnimId = requestAnimationFrame(draw);
  }
  draw();
}

export function stopBohrAnimation() {
  if (bohrAnimId) {
    cancelAnimationFrame(bohrAnimId);
    bohrAnimId = null;
  }
}
