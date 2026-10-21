export function getPhaseAtTemp(el, tempK) {
  if (el.melt == null) return "unknown";
  if (tempK < el.melt) return "solid";
  if (el.boil == null || tempK < el.boil) return "liquid";
  return "gas";
}

export function getPhaseLabel(phase) {
  if (phase === "solid") return { text: "Padat", color: "#38bdf8" };
  if (phase === "liquid") return { text: "Cair", color: "#10b981" };
  if (phase === "gas") return { text: "Gas", color: "#f43f5e" };
  return { text: "N/A", color: "#71717a" };
}
