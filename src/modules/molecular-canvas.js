/**
 * molecular-canvas.js — Molecular Bond Illustration Engine
 * Renders interactive 2D Ball-and-Stick, Ionic Transfer, Metallic Sea,
 * and Nuclear Fusion visualizations on an HTML5 Canvas for the Synthesis Lab.
 *
 * Architecture: Pure Vanilla JS ES Module — zero external dependencies.
 */

import { setupHiDPICanvas } from '../utils/dom.js';

// ── CPK-Inspired Atom Color Map ──────────────────────────────────────────────
const CPK_COLORS = {
  1:  '#E8E8E8', // H  — white-ish
  2:  '#D9FFFF', // He
  3:  '#CC80FF', // Li
  4:  '#C2FF00', // Be
  5:  '#FFB5B5', // B
  6:  '#505050', // C  — dark gray
  7:  '#3050F8', // N  — blue
  8:  '#FF0D0D', // O  — red
  9:  '#90E050', // F  — green
  10: '#B3E3F5', // Ne
  11: '#AB5CF2', // Na — violet
  12: '#8AFF00', // Mg — lime
  13: '#BFA6A6', // Al — gray-rose
  14: '#F0C8A0', // Si — tan
  15: '#FF8000', // P  — orange
  16: '#FFFF30', // S  — yellow
  17: '#1FF01F', // Cl — green
  18: '#80D1E3', // Ar
  20: '#3DFF00', // Ca
  22: '#BFC2C7', // Ti
  26: '#E06633', // Fe — rust
  29: '#C88033', // Cu — copper
  30: '#7D80B0', // Zn — blue-gray
  50: '#668080', // Sn — teal
};

function getCPKColor(z) {
  return CPK_COLORS[z] || '#A0A0A0';
}

function getAtomColor(z, isLight) {
  const c = getCPKColor(z);
  if (z === 1 && isLight) return '#BFBFBF';
  if (z === 6 && !isLight) return '#909090';
  return c;
}

// ── Animation State ──────────────────────────────────────────────────────────
let molAnimId = null;

export function stopMolecularAnimation() {
  if (molAnimId) {
    cancelAnimationFrame(molAnimId);
    molAnimId = null;
  }
}

// ── Public Entry Points ──────────────────────────────────────────────────────

/**
 * Render a molecular bond illustration for a given compound descriptor.
 * @param {string} canvasId — DOM id of the canvas element
 * @param {object} compound — from KNOWN_COMPOUNDS or procedurally generated
 * @param {object} opts — { showAngles, showDipole }
 */
export function renderMolecularBond(canvasId, compound, opts = {}) {
  stopMolecularAnimation();

  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const setup = setupHiDPICanvas(canvas);
  if (!setup) return;

  const { ctx, width, height } = setup;
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';

  const showAngles = opts.showAngles !== false;
  const showDipole = opts.showDipole !== false;

  const cat = compound.bondCategory;

  if (cat === 'covalent') {
    animateCovalent(ctx, width, height, compound, isLight, showAngles, showDipole);
  } else if (cat === 'ionic') {
    animateIonic(ctx, width, height, compound, isLight);
  } else if (cat === 'metallic') {
    animateMetallic(ctx, width, height, compound, isLight);
  } else {
    drawFallbackLabel(ctx, width, height, compound, isLight);
  }
}

/**
 * Render a nuclear fusion visualization.
 */
export function renderFusionBond(canvasId, elA, elB, fusedEl, isLight) {
  stopMolecularAnimation();
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const setup = setupHiDPICanvas(canvas);
  if (!setup) return;
  const { ctx, width, height } = setup;

  animateFusion(ctx, width, height, elA, elB, fusedEl, isLight);
}


// ═══════════════════════════════════════════════════════════════════════════════
// COVALENT BOND RENDERER
// ═══════════════════════════════════════════════════════════════════════════════

function animateCovalent(ctx, w, h, compound, isLight, showAngles, showDipole) {
  const struct = compound.structure;
  if (!struct || !struct.atoms) {
    drawFallbackLabel(ctx, w, h, compound, isLight);
    return;
  }

  const cx = w / 2;
  const cy = h / 2;
  const atoms = struct.atoms;
  const bonds = struct.bonds || [];
  const angles = struct.angles || [];
  const dipole = struct.dipole;

  let t = 0;
  const PHASE_APPROACH = 35;
  const PHASE_SETTLE = 20;
  const TOTAL = PHASE_APPROACH + PHASE_SETTLE + 45;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const progress = Math.min(t / PHASE_APPROACH, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

    // Animated positions from scattered to settled
    const positions = {};
    atoms.forEach(a => {
      const scatterX = a.x * 2.5;
      const scatterY = a.y * 2.5;
      positions[a.id] = {
        x: cx + scatterX + (a.x - scatterX) * eased,
        y: cy + scatterY + (a.y - scatterY) * eased,
        atom: a
      };
    });

    const bondOpacity = t < PHASE_APPROACH ? 0 : Math.min((t - PHASE_APPROACH) / PHASE_SETTLE, 1);

    // 1. Draw bond lines
    if (bondOpacity > 0) {
      bonds.forEach(bond => {
        const p1 = positions[bond.from];
        const p2 = positions[bond.to];
        if (!p1 || !p2) return;
        drawBondLine(ctx, p1.x, p1.y, p2.x, p2.y, bond.order, bondOpacity, isLight);
      });
    }

    // 2. Draw atoms
    Object.values(positions).forEach(pos => {
      drawAtomBall(ctx, pos.x, pos.y, pos.atom, isLight);
    });

    // 3. Draw lone pairs
    if (bondOpacity > 0.4) {
      atoms.forEach(a => {
        if (a.lonePairs && a.lonePairs > 0) {
          const pos = positions[a.id];
          drawLonePairs(ctx, pos.x, pos.y, a, bonds, positions, bondOpacity, isLight);
        }
      });
    }

    // 4. Draw angle arcs
    if (showAngles && bondOpacity > 0.7 && angles.length > 0) {
      angles.forEach(ang => {
        const pa = positions[ang.a];
        const pv = positions[ang.vertex];
        const pb = positions[ang.b];
        if (pa && pv && pb) {
          drawAngleArc(ctx, pa, pv, pb, ang.label, bondOpacity, isLight);
        }
      });
    }

    // 5. Draw dipole indicators
    if (showDipole && dipole && bondOpacity > 0.5) {
      drawDipoleIndicators(ctx, positions, atoms, compound, bondOpacity, isLight);
    }

    t++;
    if (t <= TOTAL) {
      molAnimId = requestAnimationFrame(draw);
    } else {
      molAnimId = null;
    }
  }

  draw();
}

function drawAtomBall(ctx, x, y, atom, isLight) {
  const r = atom.radius || 13;
  const baseColor = getAtomColor(atom.z, isLight);

  const glow = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r);
  glow.addColorStop(0, lightenColor(baseColor, 0.35));
  glow.addColorStop(0.7, baseColor);
  glow.addColorStop(1, darkenColor(baseColor, 0.25));

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.22)' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = getSymbolTextColor(atom.z, isLight);
  ctx.font = `700 ${Math.max(9, r - 2)}px 'JetBrains Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(atom.symbol, x, y + 0.5);
}

function getSymbolTextColor(z, isLight) {
  if (z === 1) return isLight ? '#334155' : '#1e293b';
  if (z === 6) return '#fafafa';
  if (z === 7) return '#ffffff';
  if (z === 8) return '#ffffff';
  if (z === 9) return '#1e293b';
  if (z === 17) return '#1e293b';
  if (z === 11) return '#ffffff';
  if (z === 12) return '#1e293b';
  if (z === 26) return '#ffffff';
  if (z === 29) return '#1e293b';
  return isLight ? '#0f172a' : '#fafafa';
}

function drawBondLine(ctx, x1, y1, x2, y2, order, opacity, isLight) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  if (order === 1) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  } else if (order === 2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len * 3;
    const ny = dx / len * 3;
    ctx.beginPath();
    ctx.moveTo(x1 + nx, y1 + ny);
    ctx.lineTo(x2 + nx, y2 + ny);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x1 - nx, y1 - ny);
    ctx.lineTo(x2 - nx, y2 - ny);
    ctx.stroke();
  } else if (order === 3) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len * 4;
    const ny = dx / len * 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x1 + nx, y1 + ny);
    ctx.lineTo(x2 + nx, y2 + ny);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x1 - nx, y1 - ny);
    ctx.lineTo(x2 - nx, y2 - ny);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLonePairs(ctx, atomX, atomY, atom, bonds, positions, opacity, isLight) {
  const count = atom.lonePairs;
  if (!count) return;

  const bondDirs = [];
  bonds.forEach(b => {
    let otherId = null;
    if (b.from === atom.id) otherId = b.to;
    else if (b.to === atom.id) otherId = b.from;
    if (otherId && positions[otherId]) {
      const ox = positions[otherId].x - atomX;
      const oy = positions[otherId].y - atomY;
      bondDirs.push(Math.atan2(oy, ox));
    }
  });

  let avgAngle = 0;
  if (bondDirs.length > 0) {
    let sx = 0, sy = 0;
    bondDirs.forEach(a => { sx += Math.cos(a); sy += Math.sin(a); });
    avgAngle = Math.atan2(sy, sx);
  }

  const oppAngle = avgAngle + Math.PI;
  const r = (atom.radius || 13) + 7;
  const spread = Math.PI * 0.35;

  ctx.save();
  ctx.globalAlpha = opacity * 0.85;
  ctx.fillStyle = isLight ? '#2563eb' : '#60a5fa';

  for (let i = 0; i < count; i++) {
    const angle = count === 1
      ? oppAngle
      : oppAngle + (i - (count - 1) / 2) * spread;

    const lpx = atomX + r * Math.cos(angle);
    const lpy = atomY + r * Math.sin(angle);

    const perpX = -Math.sin(angle) * 3;
    const perpY = Math.cos(angle) * 3;
    ctx.beginPath();
    ctx.arc(lpx + perpX, lpy + perpY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lpx - perpX, lpy - perpY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawAngleArc(ctx, pa, pv, pb, label, opacity, isLight) {
  const angle1 = Math.atan2(pa.y - pv.y, pa.x - pv.x);
  const angle2 = Math.atan2(pb.y - pv.y, pb.x - pv.x);

  let start = Math.min(angle1, angle2);
  let end = Math.max(angle1, angle2);
  if (end - start > Math.PI) {
    const tmp = start;
    start = end;
    end = tmp + Math.PI * 2;
  }

  const arcR = 24;

  ctx.save();
  ctx.globalAlpha = opacity * 0.75;
  ctx.strokeStyle = isLight ? '#d97706' : '#fbbf24';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(pv.x, pv.y, arcR, start, end);
  ctx.stroke();
  ctx.setLineDash([]);

  const midAngle = (start + end) / 2;
  const labelR = arcR + 11;
  const lx = pv.x + labelR * Math.cos(midAngle);
  const ly = pv.y + labelR * Math.sin(midAngle);

  ctx.fillStyle = isLight ? '#92400e' : '#fde68a';
  ctx.font = '600 9px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, lx, ly);
  ctx.restore();
}

function drawDipoleIndicators(ctx, positions, atoms, compound, opacity, isLight) {
  const struct = compound.structure;
  if (!struct || !struct.dipole) return;

  const deltaEN = struct.dipole.deltaEN || 0;
  if (deltaEN < 0.4) return;

  ctx.save();
  ctx.globalAlpha = opacity * 0.8;

  atoms.forEach(a => {
    const pos = positions[a.id];
    if (!pos) return;
    const r = (a.radius || 13) + 9;

    let label = null;
    const allZ = atoms.map(at => at.z);
    const maxZ = Math.max(...allZ.filter(z => z !== 1));

    if (atoms.length <= 4 && a.z === 1) {
      label = 'δ⁺';
    } else if (a.z === maxZ && atoms.filter(at => at.z === maxZ).length <= 1) {
      label = 'δ⁻';
    }

    if (label) {
      ctx.fillStyle = label === 'δ⁺' ? (isLight ? '#dc2626' : '#f87171')
                                       : (isLight ? '#2563eb' : '#60a5fa');
      ctx.font = '700 9.5px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const ly = pos.y < 0 ? pos.y - r : pos.y + r;
      ctx.fillText(label, pos.x, ly);
    }
  });

  ctx.restore();
}


// ═══════════════════════════════════════════════════════════════════════════════
// IONIC BOND RENDERER
// ═══════════════════════════════════════════════════════════════════════════════

function animateIonic(ctx, w, h, compound, isLight) {
  const struct = compound.structure;
  if (!struct || !struct.cation) {
    drawFallbackLabel(ctx, w, h, compound, isLight);
    return;
  }

  const cx = w / 2;
  const cy = h / 2;
  const cation = struct.cation;
  const anion = struct.anion;

  let t = 0;
  const PHASE_NEUTRAL = 20;
  const PHASE_TRANSFER = 35;
  const PHASE_ION = 20;
  const PHASE_ATTRACT = 20;
  const TOTAL = PHASE_NEUTRAL + PHASE_TRANSFER + PHASE_ION + PHASE_ATTRACT + 35;

  function draw() {
    ctx.clearRect(0, 0, w, h);

    const neutralCatX = cx + cation.x * 1.5;
    const neutralAnX = cx + anion.x * 1.5;
    const catY = cy + cation.y;
    const anY = cy + anion.y;

    const finalCatX = cx + cation.x;
    const finalAnX = cx + anion.x;

    let catX, anX, catR, anR, showCharge, electronProgress;

    if (t < PHASE_NEUTRAL) {
      catX = neutralCatX;
      anX = neutralAnX;
      catR = cation.radius;
      anR = anion.radius;
      showCharge = false;
      electronProgress = -1;
    } else if (t < PHASE_NEUTRAL + PHASE_TRANSFER) {
      const p = (t - PHASE_NEUTRAL) / PHASE_TRANSFER;
      catX = neutralCatX;
      anX = neutralAnX;
      catR = cation.radius;
      anR = anion.radius;
      showCharge = false;
      electronProgress = p;
    } else if (t < PHASE_NEUTRAL + PHASE_TRANSFER + PHASE_ION) {
      const p = (t - PHASE_NEUTRAL - PHASE_TRANSFER) / PHASE_ION;
      const eased = 1 - Math.pow(1 - p, 2);
      catX = neutralCatX;
      anX = neutralAnX;
      catR = cation.radius - 2.5 * eased;
      anR = anion.radius + 2.5 * eased;
      showCharge = true;
      electronProgress = -1;
    } else {
      const attractStart = PHASE_NEUTRAL + PHASE_TRANSFER + PHASE_ION;
      const p = Math.min((t - attractStart) / PHASE_ATTRACT, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      catX = neutralCatX + (finalCatX - neutralCatX) * eased;
      anX = neutralAnX + (finalAnX - neutralAnX) * eased;
      catR = cation.radius - 2.5;
      anR = anion.radius + 2.5;
      showCharge = true;
      electronProgress = -1;

      if (p > 0.25) {
        drawElectrostaticField(ctx, catX, catY, anX, anY, isLight, p);
      }
    }

    // Draw electron in flight
    if (electronProgress >= 0 && electronProgress <= 1) {
      const ex = catX + (anX - catX) * electronProgress;
      const ey = catY + (anY - catY) * electronProgress - Math.sin(electronProgress * Math.PI) * 22;
      ctx.beginPath();
      ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#2563eb' : '#60a5fa';
      ctx.fill();
      ctx.strokeStyle = isLight ? '#1d4ed8' : '#93c5fd';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = isLight ? '#1d4ed8' : '#93c5fd';
      ctx.font = '700 8px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('e⁻', ex, ey - 7);
    }

    drawIonSphere(ctx, catX, catY, catR, cation, showCharge, isLight);
    drawIonSphere(ctx, anX, anY, anR, anion, showCharge, isLight);

    if (t > PHASE_NEUTRAL + PHASE_TRANSFER + PHASE_ION + PHASE_ATTRACT) {
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = isLight ? '#475569' : '#a1a1aa';
      ctx.font = '500 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Transfer Elektron → Tarik-Menarik Elektrostatik`, cx, h - 8);
      ctx.restore();
    }

    t++;
    if (t <= TOTAL) {
      molAnimId = requestAnimationFrame(draw);
    } else {
      molAnimId = null;
    }
  }

  draw();
}

function drawIonSphere(ctx, x, y, r, ionData, showCharge, isLight) {
  const baseColor = getAtomColor(ionData.z, isLight);

  const glow = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.1, x, y, r);
  glow.addColorStop(0, lightenColor(baseColor, 0.3));
  glow.addColorStop(0.75, baseColor);
  glow.addColorStop(1, darkenColor(baseColor, 0.3));

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();
  ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.25)' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = getSymbolTextColor(ionData.z, isLight);
  ctx.font = `700 ${Math.max(10, r - 1)}px 'JetBrains Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ionData.symbol, x, y + 0.5);

  if (showCharge && ionData.charge) {
    const chargeColor = ionData.charge.includes('+')
      ? (isLight ? '#dc2626' : '#f87171')
      : (isLight ? '#2563eb' : '#60a5fa');
    ctx.fillStyle = chargeColor;
    ctx.font = '700 10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(ionData.charge, x + r * 0.5, y - r * 0.6);
  }
}

function drawElectrostaticField(ctx, x1, y1, x2, y2, isLight, intensity) {
  ctx.save();
  ctx.globalAlpha = intensity * 0.2;
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = isLight ? '#6366f1' : '#818cf8';
  ctx.lineWidth = 1;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  for (let i = -2; i <= 2; i++) {
    const offset = i * 7;
    ctx.beginPath();
    ctx.moveTo(x1, y1 + offset);
    ctx.quadraticCurveTo(midX, midY + offset + i * 2, x2, y2 + offset);
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.restore();
}


// ═══════════════════════════════════════════════════════════════════════════════
// METALLIC BOND RENDERER
// ═══════════════════════════════════════════════════════════════════════════════

function animateMetallic(ctx, w, h, compound, isLight) {
  const struct = compound.structure;
  if (!struct || !struct.ions) {
    drawFallbackLabel(ctx, w, h, compound, isLight);
    return;
  }

  const cx = w / 2;
  const cy = h / 2;
  const ions = struct.ions;
  const electronCount = struct.electronCount || 6;

  const electrons = [];
  for (let i = 0; i < electronCount; i++) {
    electrons.push({
      x: (Math.random() - 0.5) * 110,
      y: (Math.random() - 0.5) * 70,
      vx: (Math.random() - 0.5) * 1.6,
      vy: (Math.random() - 0.5) * 1.6
    });
  }

  let t = 0;
  const TOTAL = 150;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const fadeIn = Math.min(t / 25, 1);

    // Lattice bonds (subtle)
    if (fadeIn > 0.4) {
      ctx.save();
      ctx.globalAlpha = (fadeIn - 0.4) * 0.2;
      ctx.strokeStyle = isLight ? '#94a3b8' : '#52525b';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 4]);

      ions.forEach((ion, i) => {
        ions.forEach((other, j) => {
          if (j <= i) return;
          const dx = Math.abs(ion.x - other.x);
          const dy = Math.abs(ion.y - other.y);
          if (dx <= 60 && dy <= 60) {
            ctx.beginPath();
            ctx.moveTo(cx + ion.x, cy + ion.y);
            ctx.lineTo(cx + other.x, cy + other.y);
            ctx.stroke();
          }
        });
      });

      ctx.setLineDash([]);
      ctx.restore();
    }

    // Wandering electrons (sea of electrons)
    ctx.save();
    ctx.globalAlpha = fadeIn * 0.8;
    electrons.forEach(e => {
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < -70 || e.x > 70) e.vx *= -1;
      if (e.y < -45 || e.y > 45) e.vy *= -1;
      e.vx += (Math.random() - 0.5) * 0.15;
      e.vy += (Math.random() - 0.5) * 0.15;
      e.vx *= 0.98;
      e.vy *= 0.98;

      const ex = cx + e.x;
      const ey = cy + e.y;

      ctx.beginPath();
      ctx.arc(ex, ey, 5, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? 'rgba(37, 99, 235, 0.14)' : 'rgba(96, 165, 250, 0.14)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#2563eb' : '#60a5fa';
      ctx.fill();
    });
    ctx.restore();

    // Metal ion spheres
    ions.forEach(ion => {
      const ix = cx + ion.x;
      const iy = cy + ion.y;
      const ir = ion.radius || 13;

      const baseColor = getAtomColor(ion.z, isLight);
      const glow = ctx.createRadialGradient(ix - ir * 0.2, iy - ir * 0.2, ir * 0.1, ix, iy, ir);
      glow.addColorStop(0, lightenColor(baseColor, 0.25));
      glow.addColorStop(0.8, baseColor);
      glow.addColorStop(1, darkenColor(baseColor, 0.2));

      ctx.save();
      ctx.globalAlpha = fadeIn;
      ctx.beginPath();
      ctx.arc(ix, iy, ir, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.2)' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = getSymbolTextColor(ion.z, isLight);
      ctx.font = `700 ${Math.max(9, ir - 2)}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ion.symbol, ix, iy);

      if (ion.charge) {
        ctx.fillStyle = isLight ? '#dc2626' : '#f87171';
        ctx.font = '600 7px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(ion.charge, ix + ir * 0.5, iy - ir * 0.6);
      }
      ctx.restore();
    });

    if (t > 40) {
      ctx.save();
      ctx.globalAlpha = Math.min((t - 40) / 25, 0.6);
      ctx.fillStyle = isLight ? '#475569' : '#a1a1aa';
      ctx.font = '500 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Lautan Elektron Terdelokalisasi (Electron Sea)', cx, h - 8);
      ctx.restore();
    }

    t++;
    if (t <= TOTAL) {
      molAnimId = requestAnimationFrame(draw);
    } else {
      molAnimId = null;
    }
  }

  draw();
}


// ═══════════════════════════════════════════════════════════════════════════════
// NUCLEAR FUSION RENDERER
// ═══════════════════════════════════════════════════════════════════════════════

function animateFusion(ctx, w, h, elA, elB, fusedEl, isLight) {
  const cx = w / 2;
  const cy = h / 2;
  let t = 0;
  const TOTAL = 120;

  const nucleonsA = [];
  const nucleonsB = [];
  const countA = Math.min(elA.z, 10);
  const countB = Math.min(elB.z, 10);
  for (let i = 0; i < countA; i++) {
    nucleonsA.push({ angle: (i / countA) * Math.PI * 2, r: 4 + Math.random() * 7, isProton: i % 2 === 0 });
  }
  for (let i = 0; i < countB; i++) {
    nucleonsB.push({ angle: (i / countB) * Math.PI * 2, r: 4 + Math.random() * 7, isProton: i % 2 === 0 });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    if (t < 45) {
      const p = t / 45;
      const dist = (1 - p) * 65;

      drawNucleus(ctx, cx - dist, cy, nucleonsA, elA, t, isLight);
      drawNucleus(ctx, cx + dist, cy, nucleonsB, elB, t, isLight);

      if (p > 0.4) {
        const barrierAlpha = (p - 0.4) * 1.6;
        ctx.save();
        ctx.globalAlpha = barrierAlpha * 0.35;
        ctx.strokeStyle = isLight ? '#dc2626' : '#f87171';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(cx, cy, 18 - (p - 0.4) * 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    } else if (t < 65) {
      const p = (t - 45) / 20;
      const flashR = 12 + p * 38;

      ctx.save();
      ctx.globalAlpha = (1 - p) * 0.45;
      const flashGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
      flashGrad.addColorStop(0, '#fde68a');
      flashGrad.addColorStop(0.5, '#f59e0b');
      flashGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, flashR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = (1 - p) * 0.65;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + t * 0.05;
        const len = 18 + p * 45;
        ctx.beginPath();
        ctx.moveTo(cx + 8 * Math.cos(a), cy + 8 * Math.sin(a));
        ctx.lineTo(cx + len * Math.cos(a), cy + len * Math.sin(a));
        ctx.stroke();
      }
      ctx.restore();
    } else {
      const fadeIn = Math.min((t - 65) / 20, 1);
      const pulse = Math.sin((t - 65) * 0.08) * 2;

      ctx.save();
      ctx.globalAlpha = fadeIn * 0.16;
      ctx.beginPath();
      ctx.arc(cx, cy, 32 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? '#d97706' : '#fbbf24';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      const nR = 20;
      const grad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, nR);
      grad.addColorStop(0, isLight ? '#fbbf24' : '#fde68a');
      grad.addColorStop(0.6, isLight ? '#d97706' : '#f59e0b');
      grad.addColorStop(1, isLight ? '#92400e' : '#b45309');

      ctx.save();
      ctx.globalAlpha = fadeIn;
      ctx.beginPath();
      ctx.arc(cx, cy, nR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = isLight ? 'rgba(146, 64, 14, 0.4)' : 'rgba(251, 191, 36, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (fusedEl) {
        ctx.fillStyle = '#1e293b';
        ctx.font = '700 13px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fusedEl.symbol, cx, cy);
      }
      ctx.restore();

      if (fadeIn >= 1) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = isLight ? '#475569' : '#a1a1aa';
        ctx.font = '500 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        const eq = fusedEl
          ? `${elA.symbol} + ${elB.symbol} → ${fusedEl.symbol} (Z=${fusedEl.z}) + γ`
          : `Z = ${elA.z} + ${elB.z} → ${elA.z + elB.z}`;
        ctx.fillText(eq, cx, h - 8);
        ctx.restore();
      }
    }

    t++;
    if (t <= TOTAL) {
      molAnimId = requestAnimationFrame(draw);
    } else {
      molAnimId = null;
    }
  }

  draw();
}

function drawNucleus(ctx, x, y, nucleons, el, t, isLight) {
  ctx.save();
  nucleons.forEach(n => {
    const nx = x + n.r * Math.cos(n.angle + t * 0.02);
    const ny = y + n.r * Math.sin(n.angle + t * 0.02);
    ctx.beginPath();
    ctx.arc(nx, ny, 3, 0, Math.PI * 2);
    ctx.fillStyle = n.isProton
      ? (isLight ? '#dc2626' : '#f87171')
      : (isLight ? '#475569' : '#94a3b8');
    ctx.fill();
  });

  ctx.fillStyle = isLight ? '#0f172a' : '#fafafa';
  ctx.font = '700 11px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(el.symbol, x, y);
  ctx.restore();
}

// ── Fallback ─────────────────────────────────────────────────────────────────

function drawFallbackLabel(ctx, w, h, compound, isLight) {
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;

  ctx.fillStyle = isLight ? '#64748b' : '#71717a';
  ctx.font = '600 12px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(compound.formula || '—', cx, cy - 8);
  ctx.font = '500 9.5px JetBrains Mono, monospace';
  ctx.fillText(compound.type || '', cx, cy + 8);
}

// ── Procedural Structure Generator ───────────────────────────────────────────

/**
 * Generate a structure descriptor for compounds not in KNOWN_COMPOUNDS.
 */
export function generateProceduralStructure(elA, elB, formula, bondType, stoichA, stoichB) {
  const isMetal = (cat) => ['alkali', 'alkaline', 'transition', 'post-transition', 'lanthanide', 'actinide'].includes(cat);
  const deltaEN = Math.abs((elA.en || 1.8) - (elB.en || 1.8));

  // Metallic
  if (isMetal(elA.category) && isMetal(elB.category)) {
    return {
      formula,
      type: bondType,
      bondCategory: 'metallic',
      structure: generateMetallicLayout(elA, elB)
    };
  }

  // Ionic
  if (deltaEN > 1.7) {
    const cationEl = (elA.en || 1.8) <= (elB.en || 1.8) ? elA : elB;
    const anionEl = cationEl === elA ? elB : elA;
    const cationCharge = cationEl.ox && cationEl.ox[0] > 0 ? cationEl.ox[0] : 1;
    const anionCharge = anionEl.ox ? Math.abs(anionEl.ox.find(v => v < 0) || -1) : 1;

    return {
      formula,
      type: bondType,
      bondCategory: 'ionic',
      structure: {
        cation: { z: cationEl.z, symbol: cationEl.symbol, charge: `${cationCharge}+`, x: -42, y: 0, radius: 13 },
        anion: { z: anionEl.z, symbol: anionEl.symbol, charge: `${anionCharge}−`, x: 42, y: 0, radius: 16 },
        electronTransfer: { from: 'cation', to: 'anion', count: cationCharge }
      }
    };
  }

  // Covalent (default)
  return {
    formula,
    type: bondType,
    bondCategory: 'covalent',
    structure: generateCovalentLayout(elA, elB, stoichA, stoichB)
  };
}

function generateCovalentLayout(elA, elB, countA, countB) {
  const centerEl = (elA.en || 1.8) <= (elB.en || 1.8) ? elA : elB;
  const ligandEl = centerEl === elA ? elB : elA;
  const ligandCount = centerEl === elA ? countB : countA;
  const centerCount = centerEl === elA ? countA : countB;

  if (centerEl.z === ligandEl.z || (centerCount === 1 && ligandCount === 1)) {
    return {
      atoms: [
        { id: 'a0', z: elA.z, symbol: elA.symbol, x: -35, y: 0, radius: getDefaultRadius(elA.z), lonePairs: 0 },
        { id: 'a1', z: elB.z, symbol: elB.symbol, x: 35, y: 0, radius: getDefaultRadius(elB.z), lonePairs: 0 }
      ],
      bonds: [{ from: 'a0', to: 'a1', order: 1 }],
      angles: []
    };
  }

  const atoms = [
    { id: 'center', z: centerEl.z, symbol: centerEl.symbol, x: 0, y: 0, radius: getDefaultRadius(centerEl.z), lonePairs: 0 }
  ];
  const bonds = [];
  const angles = [];

  const totalLigands = Math.min(ligandCount, 6);
  const angleStep = (Math.PI * 2) / Math.max(totalLigands, 1);
  const dist = 48;
  const startAngle = -Math.PI / 2;

  for (let i = 0; i < totalLigands; i++) {
    const angle = startAngle + i * angleStep;
    const id = `lig${i}`;
    atoms.push({
      id,
      z: ligandEl.z,
      symbol: ligandEl.symbol,
      x: Math.round(dist * Math.cos(angle)),
      y: Math.round(dist * Math.sin(angle)),
      radius: getDefaultRadius(ligandEl.z),
      lonePairs: 0
    });
    bonds.push({ from: id, to: 'center', order: 1 });
  }

  return { atoms, bonds, angles };
}

function generateMetallicLayout(elA, elB) {
  const ions = [];
  const positions = [
    [-35, -22], [35, -22],
    [-35, 22], [35, 22]
  ];

  positions.forEach((pos, i) => {
    const el = i % 2 === 0 ? elA : elB;
    const charge = el.ox && el.ox[0] > 0 ? `${el.ox[0]}+` : '2+';
    ions.push({
      z: el.z, symbol: el.symbol, charge,
      x: pos[0], y: pos[1], radius: 13
    });
  });

  return { ions, electronCount: 5 };
}

function getDefaultRadius(z) {
  const map = { 1: 9, 5: 12, 6: 13, 7: 13, 8: 14, 9: 12, 14: 15, 15: 14, 16: 14, 17: 15 };
  return map[z] || 13;
}

// ── Color Utilities ──────────────────────────────────────────────────────────

function lightenColor(hex, amount) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgb(${Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount))}, ${Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount))}, ${Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount))})`;
}

function darkenColor(hex, amount) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgb(${Math.round(rgb.r * (1 - amount))}, ${Math.round(rgb.g * (1 - amount))}, ${Math.round(rgb.b * (1 - amount))})`;
}

function hexToRgb(hex) {
  if (!hex || hex.startsWith('rgb')) return null;
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

