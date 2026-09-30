import { useEffect, useRef } from "react";
import gsap from "gsap";
import { profile } from "../data.js";
import { state } from "../state.js";

const Chars = ({ text }) =>
  [...text].map((c, i) => (
    <span className="mask" key={i} aria-hidden="true">
      <span className="ch">{c === " " ? " " : c}</span>
    </span>
  ));

export default function Hero({ ready }) {
  const title = useRef();

  useEffect(() => {
    if (!ready) return;
    const tl = gsap.timeline();
    tl.fromTo(".hero .ch", { yPercent: 115, rotate: 7 }, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.035, ease: "expo.out" })
      .fromTo(".hero .fade", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out" }, "-=0.8");
    return () => tl.kill();
  }, [ready]);

  // Tipografía variable: las letras cercanas al cursor engordan.
  useEffect(() => {
    if (state.coarse) return;
    const el = title.current;
    const chars = [...el.querySelectorAll(".ch")];
    const move = (e) => {
      for (const c of chars) {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        const k = Math.max(0, 1 - d / 240);
        c.style.fontVariationSettings = `"wght" ${Math.round(420 + k * 380)}, "wdth" ${Math.round(88 + k * 12)}`;
      }
    };
    const leave = () => chars.forEach((c) => (c.style.fontVariationSettings = ""));
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, []);

  return (
    <section className="hero" data-section id="s0">
      <p className="hero__kicker mono fade">
        <i className="dot" /> Disponible para proyectos — 2026
      </p>
      <h1 className="hero__title" ref={title} aria-label={profile.name}>
        <span className="line"><Chars text="Juan Ignacio" /></span>
        <span className="line serif"><Chars text="Darsaut" /></span>
      </h1>
      <p className="hero__sub fade">
        {profile.role}. Construyo interfaces con movimiento, 3D y una obsesión
        incómoda por el detalle.
      </p>
      <div className="hero__foot mono fade">
        <span>{profile.city}</span>
        <span className="scroll"><i /> Scroll</span>
        <span>React · Three.js · Node</span>
      </div>
    </section>
  );
}
