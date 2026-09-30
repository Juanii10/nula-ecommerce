import { useEffect, useRef } from "react";
import gsap from "gsap";
import { manifesto, facts } from "../data.js";
import { reveal } from "../lib.js";

// "*palabra*" => énfasis en serif itálica
const words = manifesto.split(" ").map((w) => ({
  text: w.replace(/\*/g, ""),
  em: w.includes("*"),
}));

export default function About() {
  const root = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".word", { opacity: 0.12 }, {
        opacity: 1, stagger: 0.12, ease: "none",
        scrollTrigger: { trigger: ".manifesto", start: "top 75%", end: "bottom 45%", scrub: true },
      });
    }, root);
    const undo = reveal(root.current.querySelector(".facts"), root.current.querySelectorAll(".fact"),
      { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.9, ease: "power3.out" });
    return () => { ctx.revert(); undo(); };
  }, []);

  return (
    <section className="about" data-section id="s1" ref={root}>
      <div className="about__inner">
        <span className="label mono">(01) Sobre mí</span>
        <p className="manifesto">
          {words.map((w, i) => (
            <span key={i} className={`word ${w.em ? "em" : ""}`}>{w.text} </span>
          ))}
        </p>
        <dl className="facts">
          {facts.map(([k, v]) => (
            <div className="fact" key={k}>
              <dt className="mono">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
