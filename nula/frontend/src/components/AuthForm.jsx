import { useState } from "react";
import { useStore } from "@nanostores/react";
import { authStore, setAuth } from "../store/auth";
import { api } from "../lib/api.js";

export default function AuthForm({ mode }) {
  const auth = useStore(authStore);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (auth?.token) {
    return (
      <div>
        <p className="text-ink-soft">
          Ya iniciaste sesión como <strong className="text-ink">{auth.user.name}</strong>.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex border border-ink px-6 py-3 font-mono text-sm hover:bg-ink hover:text-paper transition-colors"
        >
          IR AL INICIO
        </a>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data =
        mode === "register"
          ? await api.register({ name, email, password })
          : await api.login({ email, password });
      setAuth(data);
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-5">
      {mode === "register" && (
        <div>
          <label className="tag-label block mb-1.5">NOMBRE</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-concrete/50 bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none"
          />
        </div>
      )}
      <div>
        <label className="tag-label block mb-1.5">EMAIL</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-concrete/50 bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none"
        />
      </div>
      <div>
        <label className="tag-label block mb-1.5">CONTRASEÑA</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-concrete/50 bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none"
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full border border-ink py-3 font-mono text-sm hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
      >
        {loading ? "..." : mode === "register" ? "CREAR CUENTA" : "INGRESAR"}
      </button>

      <p className="text-sm text-ink-soft">
        {mode === "register" ? (
          <>¿Ya tenés cuenta? <a href="/login" className="underline hover:text-olive">Ingresá</a></>
        ) : (
          <>¿No tenés cuenta? <a href="/registro" className="underline hover:text-olive">Registrate</a></>
        )}
      </p>
    </form>
  );
}
