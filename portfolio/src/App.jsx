import { useEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene from "./components/Scene.jsx";
import Preloader from "./components/Preloader.jsx";
import Cursor from "./components/Cursor.jsx";
import Hud from "./components/Hud.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Work from "./components/Work.jsx";
import Contact from "./components/Contact.jsx";
import { state, measure } from "./state.js";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const lenis = new Lenis({ lerp: state.reduce ? 1 : 0.09 });
    lenis.stop();
    state.lenis = lenis;

    lenis.on("scroll", (e) => {
      ScrollTrigger.update();
      // La velocidad de scroll deforma el marquee (skew): detalle sutil.
      document.documentElement.style.setProperty("--skew", `${Math.max(-8, Math.min(8, e.velocity * -0.35))}deg`);
    });
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const remeasure = () => { measure(); ScrollTrigger.refresh(); };
    measure();
    window.addEventListener("resize", remeasure);
    window.addEventListener("load", remeasure);
    document.fonts?.ready.then(remeasure);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("load", remeasure);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    measure();
    ScrollTrigger.refresh();
    state.lenis.start();
  }, [ready]);

  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <Scene />
      <Cursor />
      <Hud visible={ready} />
      <div className="grain" aria-hidden="true" />
      <main id="top">
        <Hero ready={ready} />
        <About />
        <Work />
        <Contact />
      </main>
    </>
  );
}
