import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { state, getProgress } from "../state.js";
import { scramble } from "../lib.js";
import { profile } from "../data.js";

const SECTIONS = ["Inicio", "Sobre mí", "Trabajo", "Contacto"];
const NAV = [
  ["Sobre mí", 1],
  ["Trabajo", 2],
  ["Contacto", 3],
];

const fmt = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
});

function NavLink({ label, index }) {
  const el = useRef();
  return (
    <a
      href={`#s${index}`}
      data-cursor="Ir"
      onMouseEnter={() => scramble(el.current, label, 0.45)}
      onClick={(e) => {
        e.preventDefault();
        state.lenis?.scrollTo(state.tops[index], { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
      }}
    >
      <span ref={el}>{label}</span>
    </a>
  );
}

export default function Hud({ visible }) {
  const [time, setTime] = useState(fmt.format(new Date()));
  const [sec, setSec] = useState(0);
  const pct = useRef();
  const bar = useRef();
  const root = useRef();

  useEffect(() => {
    const id = setInterval(() => setTime(fmt.format(new Date())), 1000);
    let last = -1;
    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const k = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.current.style.transform = `scaleY(${k})`;
      pct.current.textContent = String(Math.round(k * 100)).padStart(3, "0");
      const { section } = getProgress();
      if (section !== last) { last = section; setSec(section); }
    };
    gsap.ticker.add(tick);
    return () => { clearInterval(id); gsap.ticker.remove(tick); };
  }, []);

  useEffect(() => {
    if (visible) {
      gsap.fromTo(root.current.querySelectorAll(".hud__in"), { autoAlpha: 0, y: 10 }, {
        autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.8, ease: "power3.out", delay: 0.4,
      });
    }
  }, [visible]);

  return (
    <div className="hud mono" ref={root}>
      <a className="hud__logo hud__in" href="#top" data-cursor="Inicio" aria-label={profile.name}
        onClick={(e) => { e.preventDefault(); state.lenis?.scrollTo(0, { duration: 1.6 }); }}>
        JD<sup>®</sup>
      </a>
      <nav className="hud__nav hud__in">
        {NAV.map(([l, i]) => <NavLink key={l} label={l} index={i} />)}
      </nav>
      <div className="hud__time hud__in">BUE {time} <span>GMT−3</span></div>
      <div className="hud__sec hud__in">
        <b>{String(sec + 1).padStart(2, "0")}</b> / 04 — {SECTIONS[sec]}
      </div>
      <div className="hud__rail hud__in"><i ref={bar} /></div>
      <div className="hud__pct hud__in"><span ref={pct}>000</span>%</div>
      <i className="cross tl" /><i className="cross tr" /><i className="cross bl" /><i className="cross br" />
    </div>
  );
}
