import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { state } from "../state.js";

export default function Cursor() {
  const ring = useRef();
  const dot = useRef();
  const [label, setLabel] = useState("");
  const [on, setOn] = useState(false);

  useEffect(() => {
    // El mouse alimenta la nube también en pantallas con puntero fino.
    const track = (e) => {
      state.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      state.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", track);
    if (state.coarse) return () => window.removeEventListener("pointermove", track);

    const rx = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3" });
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.12 });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.12 });

    const move = (e) => { rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); };
    const over = (e) => {
      const t = e.target.closest?.("[data-cursor]");
      setOn(!!t);
      setLabel(t ? t.dataset.cursor : "");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    document.documentElement.classList.add("has-cursor");
    return () => {
      window.removeEventListener("pointermove", track);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  if (state.coarse) return null;
  return (
    <>
      <div ref={ring} className={`cursor ${on ? "is-on" : ""}`}>
        <span className="mono">{label}</span>
      </div>
      <div ref={dot} className="cursor-dot" />
    </>
  );
}
