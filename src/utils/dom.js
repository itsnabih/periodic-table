export function setupHiDPICanvas(canvas) {
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const cssWidth = Math.round(rect.width) || parseInt(canvas.getAttribute('width'), 10) || 280;
  const cssHeight = Math.round(rect.height) || parseInt(canvas.getAttribute('height'), 10) || 22;

  const targetW = Math.round(cssWidth * dpr);
  const targetH = Math.round(cssHeight * dpr);

  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: cssWidth, height: cssHeight };
}

export function isCoarsePointer() {
  return window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}
