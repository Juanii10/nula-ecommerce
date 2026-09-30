// Estado compartido fuera de React: se lee en cada frame sin provocar renders.
export const state = {
  mouse: { x: 9, y: 9 },
  velocity: 0,
  lenis: null,
  tops: [0],
  reduce: typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches,
  coarse: typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches,
};

export function measure() {
  state.tops = [...document.querySelectorAll("[data-section]")].map((el) => el.offsetTop);
}

// Progreso 0..(n-1): qué forma toma la nube. Cada forma se sostiene el primer
// 55% de su sección y muta hacia la siguiente en el resto.
export function getProgress() {
  const { tops } = state;
  const c = window.scrollY + window.innerHeight * 0.5;
  let i = 0;
  while (i < tops.length - 1 && c >= tops[i + 1]) i++;
  if (i >= tops.length - 1) return { p: tops.length - 1, section: i };
  const t = (c - tops[i]) / (tops[i + 1] - tops[i]);
  const k = Math.min(Math.max((t - 0.55) / 0.45, 0), 1);
  return { p: i + k, section: i };
}
