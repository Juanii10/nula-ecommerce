import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { state, getProgress } from "../state.js";

const isMobile = typeof window !== "undefined" && window.innerWidth < 800;
const COUNT = isMobile ? 5000 : 9000;

// --- Formas -----------------------------------------------------------------
const rand = (a = 1) => (Math.random() - 0.5) * a;

function tilt(arr, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  for (let i = 0; i < arr.length; i += 3) {
    const y = arr[i + 1], z = arr[i + 2];
    arr[i + 1] = y * c - z * s;
    arr[i + 2] = y * s + z * c;
  }
  return arr;
}

function sphere(n) {
  const a = new Float32Array(n * 3);
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = g * i;
    const R = 1.7 + rand(0.05);
    a.set([Math.cos(t) * r * R, y * R, Math.sin(t) * r * R], i * 3);
  }
  return a;
}

function knot(n) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = Math.random() * Math.PI * 2;
    const r = Math.cos(3 * t) + 2;
    const s = 0.62;
    a.set(
      [r * Math.cos(2 * t) * s + rand(0.22), r * Math.sin(2 * t) * s + rand(0.22), -Math.sin(3 * t) * s * 1.3 + rand(0.22)],
      i * 3
    );
  }
  return a;
}

function waves(n) {
  const a = new Float32Array(n * 3);
  const side = Math.ceil(Math.sqrt(n));
  for (let i = 0; i < n; i++) {
    const x = ((i % side) / side - 0.5) * 7;
    const z = (Math.floor(i / side) / side - 0.5) * 7;
    const d = Math.hypot(x, z);
    a.set([x, Math.sin(d * 2.2) * 0.45 + Math.sin(x * 1.4) * 0.2, z], i * 3);
  }
  return tilt(a, -0.75);
}

function galaxy(n) {
  const a = new Float32Array(n * 3);
  const arms = 3;
  for (let i = 0; i < n; i++) {
    const r = Math.pow(Math.random(), 0.65) * 3.4;
    const ang = r * 1.5 + ((i % arms) / arms) * Math.PI * 2 + rand(0.5 / (0.3 + r * 0.4));
    a.set([Math.cos(ang) * r, rand(0.25) * (1 - r / 4), Math.sin(ang) * r], i * 3);
  }
  return tilt(a, -0.5);
}

// --- Shaders ----------------------------------------------------------------
const vert = /* glsl */ `
  uniform float uTime, uProgress, uSize, uPixel;
  uniform vec2 uMouse;
  attribute vec3 aP1, aP2, aP3;
  attribute float aRand;
  varying float vMix;
  varying float vTone;

  void main() {
    float p = clamp(uProgress, 0.0, 2.9999);
    float i = floor(p);
    float f = p - i;
    vec3 a = i < 0.5 ? position : (i < 1.5 ? aP1 : aP2);
    vec3 b = i < 0.5 ? aP1 : (i < 1.5 ? aP2 : aP3);

    // Cada partícula viaja con un pequeño desfase: la mutación "fluye".
    float ff = smoothstep(aRand * 0.45, 0.55 + aRand * 0.45, f);
    vec3 pos = mix(a, b, ff);

    float turb = sin(ff * 3.14159);
    pos += vec3(sin(aRand * 40.0 + uTime), cos(aRand * 23.0 + uTime * 1.1), sin(aRand * 31.0 - uTime)) * turb * 0.9;
    pos += normalize(pos + 0.001) * sin(uTime * 0.7 + aRand * 6.2831) * 0.035;

    vec4 wp = modelMatrix * vec4(pos, 1.0);
    vec2 d = wp.xy - uMouse;
    float dist = length(d);
    wp.xy += normalize(d + 0.0001) * smoothstep(1.3, 0.0, dist) * 0.55;
    wp.z += smoothstep(1.3, 0.0, dist) * 0.6;

    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixel * (0.55 + aRand * 0.9) / -mv.z;
    vMix = p / 3.0 + aRand * 0.35;
    vTone = aRand;
  }
`;

const frag = /* glsl */ `
  uniform vec3 uC1, uC2, uC3;
  uniform float uAlpha;
  varying float vMix;
  varying float vTone;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = pow(smoothstep(0.5, 0.0, d), 1.7);
    vec3 col = vMix < 0.5 ? mix(uC1, uC2, vMix * 2.0) : mix(uC2, uC3, (vMix - 0.5) * 2.0);
    col = mix(col, vec3(1.0), step(0.93, vTone) * 0.6);
    gl_FragColor = vec4(col, a * uAlpha * 0.85);
  }
`;

// --- Nube -------------------------------------------------------------------
const X = isMobile ? [0, 0, 0, 0] : [1.75, -1.85, 1.5, 0];
const Y = isMobile ? [0.9, 0.9, 1.1, 0.6] : [0, 0, 0, 0.3];
const S = isMobile ? [0.7, 0.7, 0.7, 0.8] : [1, 1, 0.92, 1.1];
const at = (arr, p) => {
  const i = Math.min(Math.floor(p), arr.length - 2);
  return arr[i] + (arr[i + 1] - arr[i]) * (p - i);
};

function Cloud() {
  const group = useRef();
  const mat = useRef();
  const sm = useRef({ p: 0, mx: 0, my: 0, rot: 0 });

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const shapes = [sphere(COUNT), knot(COUNT), waves(COUNT), galaxy(COUNT)];
    g.setAttribute("position", new THREE.BufferAttribute(shapes[0], 3));
    shapes.slice(1).forEach((s, i) => g.setAttribute(`aP${i + 1}`, new THREE.BufferAttribute(s, 3)));
    g.setAttribute("aRand", new THREE.BufferAttribute(Float32Array.from({ length: COUNT }, Math.random), 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uSize: { value: isMobile ? 34 : 30 },
      uPixel: { value: Math.min(window.devicePixelRatio, 2) },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uAlpha: { value: 1 },
      uC1: { value: new THREE.Color("#c6ff3d") },
      uC2: { value: new THREE.Color("#ff6a3d") },
      uC3: { value: new THREE.Color("#7aa8ff") },
    }),
    []
  );

  useFrame(({ clock, camera }, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = sm.current;
    const { p: target } = getProgress();
    s.p += (target - s.p) * (1 - Math.exp(-dt * 5));
    s.mx += (state.mouse.x - s.mx) * (1 - Math.exp(-dt * 6));
    s.my += (state.mouse.y - s.my) * (1 - Math.exp(-dt * 6));
    if (!state.reduce) s.rot += dt * 0.12;

    const u = uniforms;
    u.uTime.value = state.reduce ? 0 : clock.elapsedTime;
    u.uProgress.value = s.p;
    // La lista de proyectos necesita contraste: la nube se atenúa ahí.
    u.uAlpha.value = 1 - 0.55 * Math.max(0, 1 - Math.abs(s.p - 2) * 1.3);

    const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    u.uMouse.value.set(s.mx * halfH * camera.aspect, s.my * halfH);

    const g = group.current;
    g.position.x = at(X, s.p);
    g.position.y = at(Y, s.p);
    g.scale.setScalar(at(S, s.p));
    g.rotation.y = s.rot + s.p * 0.9 + s.mx * 0.25;
    g.rotation.x = -s.my * 0.15 + Math.sin(s.p * Math.PI) * 0.2;
  });

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={mat}
          vertexShader={vert}
          fragmentShader={frag}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function Scene() {
  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <Cloud />
      </Canvas>
    </div>
  );
}
