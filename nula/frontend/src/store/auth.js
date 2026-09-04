import { persistentAtom } from "@nanostores/persistent";

// { token, user: { id, name, email, role } } | null
export const authStore = persistentAtom("nula-auth", null, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function setAuth(data) {
  authStore.set(data);
}

export function logout() {
  authStore.set(null);
}
