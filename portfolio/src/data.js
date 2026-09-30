// Editá este archivo: todo el contenido del sitio sale de acá.
export const profile = {
  name: "Juan Ignacio Darsaut",
  role: "Desarrollador web creativo",
  city: "Buenos Aires, AR",
  email: "hola@tudominio.com", // TODO: tu mail real
  links: [
    { label: "GitHub", href: "https://github.com/Juanii10" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/" }, // TODO
  ],
};

// `image` es opcional (archivo dentro de /public); sin imagen se genera una tarjeta con gradiente.
export const projects = [
  {
    title: "NULA",
    desc: "E-commerce de indumentaria full-stack",
    tags: "Astro · React · Prisma · Postgres",
    year: "2026",
    image: "/nula.jpg",
    href: "https://nula-one.vercel.app/",
  },
  {
    title: "FORJA",
    desc: "Sitio para gimnasio: clases, planes y app",
    tags: "Astro · Tailwind",
    year: "2026",
    image: "/forja.png",
    href: "https://forja-gym-eta.vercel.app/",
  },
];

export const stack = [
  "React", "Three.js", "GSAP", "Astro", "Node.js", "Prisma", "PostgreSQL", "TypeScript", "GLSL", "Tailwind",
];

export const manifesto =
  "Diseño y programo sitios que se sienten *vivos*. Me obsesiona el espacio entre lo que funciona y lo que *emociona*: el detalle de una transición, la física de un scroll, el peso exacto de una tipografía. Del backend a WebGL, construyo la experiencia completa.";

export const facts = [
  ["Base", "Buenos Aires, Argentina"],
  ["Hago", "Front-end creativo, full-stack y WebGL"],
  ["Busco", "Proyectos donde el detalle importa"],
];
