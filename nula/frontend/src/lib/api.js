const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:4000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.error || "Ocurrió un error inesperado");
  }
  return data;
}

export const api = {
  // Productos
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  getFeatured: () => request("/products/featured"),
  getProduct: (slug) => request(`/products/${slug}`),
  getCategories: () => request("/categories"),

  // Auth
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/auth/me", { token }),

  // Pedidos
  checkout: (payload, token) =>
    request("/orders/checkout", { method: "POST", body: payload, token }),
  myOrders: (token) => request("/orders/mine", { token }),

  // Admin
  createProduct: (payload, token) =>
    request("/products", { method: "POST", body: payload, token }),
  updateProduct: (id, payload, token) =>
    request(`/products/${id}`, { method: "PUT", body: payload, token }),
  deleteProduct: (id, token) =>
    request(`/products/${id}`, { method: "DELETE", token }),
  allOrders: (token) => request("/orders/all", { token }),
  updateOrderStatus: (id, status, token) =>
    request(`/orders/${id}/status`, { method: "PATCH", body: { status }, token }),
};
