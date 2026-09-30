import gsap from "gsap";

const GLYPHS = "!<>-_\/[]{}—=+*^?#01";

// Efecto "scramble": el texto se descifra letra por letra.
export function scramble(el, final, duration = 0.6) {
  const len = final.length;
  const o = { t: 0 };
  gsap.killTweensOf(o);
  gsap.to(o, {
    t: 1,
    duration,
    ease: "none",
    onUpdate() {
      const n = Math.floor(o.t * len);
      let s = final.slice(0, n);
      for (let i = n; i < len; i++) s += final[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = s;
    },
    onComplete() {
      el.textContent = final;
    },
  });
}

// Revela `targets` cuando `trigger` entra en pantalla (IntersectionObserver:
// más robusto que ScrollTrigger si el layout cambia después de medir).
export function reveal(trigger, targets, from, to) {
  const els = gsap.utils.toArray(targets);
  gsap.set(els, from);
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      gsap.to(els, { ...to, overwrite: true });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  io.observe(trigger);
  return () => { io.disconnect(); gsap.killTweensOf(els); gsap.set(els, { clearProps: "all" }); };
}
