import { useEffect, useRef } from "react";
import gsap from "gsap";
import { state } from "../state.js";

export default function Preloader({ onDone }) {
  const root = useRef();
  const num = useRef();
  const bar = useRef();

  useEffect(() => {
    const o = { v: 0 };
    const tl = gsap.timeline();
    tl.to(o, {
      v: 100,
      duration: state.reduce ? 0.2 : 1.9,
      ease: "power2.inOut",
      onUpdate() {
        num.current.textContent = String(Math.round(o.v)).padStart(3, "0");
        bar.current.style.transform = `scaleX(${o.v / 100})`;
      },
    })
      .to(".pre__word span", { yPercent: -110, duration: 0.6, ease: "power3.in" }, "+=0.15")
      .add(() => onDone())
      .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, "<0.1")
      .set(root.current, { display: "none" });
    return () => tl.kill();
  }, []);

  return (
    <div className="pre" ref={root}>
      <div className="pre__top mono">
        <span>JD® Portfolio</span>
        <span>Cargando la nube de partículas</span>
      </div>
      <div className="pre__word">
        <span>Darsaut</span>
      </div>
      <div className="pre__bottom mono">
        <span ref={num}>000</span>
        <div className="pre__bar"><i ref={bar} /></div>
        <span>{new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
