import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { projects, stack } from "../data.js";
import { state } from "../state.js";
import { reveal } from "../lib.js";

function Visual({ p, i }) {
  if (p.image) return <img src={p.image} alt="" loading="lazy" />;
  return (
    <div className="gen" style={{ "--h": p.hue }}>
      <b>{String(i + 1).padStart(2, "0")}</b>
      <span className="mono">{p.title}</span>
    </div>
  );
}

export default function Work() {
  const root = useRef();
  const prev = useRef();
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const undo = reveal(root.current.querySelector(".rows"), root.current.querySelectorAll(".row"),
      { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.9, ease: "power3.out" });

    // La vista previa persigue al cursor con inercia y se inclina según la velocidad.
    let qx, qy, qr;
    if (!state.coarse) {
      qx = gsap.quickTo(prev.current, "x", { duration: 0.6, ease: "power3" });
      qy = gsap.quickTo(prev.current, "y", { duration: 0.6, ease: "power3" });
      qr = gsap.quickTo(prev.current, "rotation", { duration: 0.8, ease: "power3" });
    }
    let lastX = 0;
    const move = (e) => {
      qx?.(e.clientX); qy?.(e.clientY);
      qr?.(Math.max(-8, Math.min(8, (e.clientX - lastX) * 0.4)));
      lastX = e.clientX;
    };
    window.addEventListener("pointermove", move);
    return () => { undo(); window.removeEventListener("pointermove", move); };
  }, []);

  useEffect(() => {
    gsap.to(prev.current, { scale: active >= 0 ? 1 : 0.6, autoAlpha: active >= 0 ? 1 : 0, duration: 0.45, ease: "power3.out" });
  }, [active]);

  return (
    <section className="work" data-section id="s2" ref={root}>
      <div className="work__head">
        <span className="label mono">(02) Trabajo seleccionado</span>
        <h2>Cosas que construí<br /><em>con cuidado</em></h2>
      </div>

      <ul className={`rows ${active >= 0 ? "has-active" : ""}`} onMouseLeave={() => setActive(-1)}>
        {projects.map((p, i) => (
          <li key={p.title} className={`row ${active === i ? "is-active" : ""}`} onMouseEnter={() => setActive(i)}>
            <a href={p.href} target="_blank" rel="noreferrer" data-cursor="Ver">
              <span className="row__n mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="row__t">{p.title}</span>
              <span className="row__d">{p.desc}<small className="mono">{p.tags}</small></span>
              <span className="row__y mono">{p.year}</span>
              <span className="row__arrow" aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="preview" ref={prev} aria-hidden="true">
        {projects.map((p, i) => (
          <div key={p.title} className={`preview__item ${active === i ? "is-on" : ""}`}><Visual p={p} i={i} /></div>
        ))}
      </div>

      <div className="marquee" role="img" aria-label={`Stack: ${stack.join(", ")}`}>
        {[0, 1].map((r) => (
          <div className={`marquee__row ${r ? "rev" : ""}`} key={r} aria-hidden="true">
            {[0, 1].map((k) => (
              <div className="marquee__track" key={k}>
                {stack.map((s) => <span key={s} className={r ? "out" : ""}>{s}<i>✦</i></span>)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

