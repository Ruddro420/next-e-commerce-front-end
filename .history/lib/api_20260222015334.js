export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.0.106:8000";

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(" ") : "Request failed");
    throw new Error(message);
  }

  return data;
}

export async function authFetch(path, options = {}) {
  const { getToken } = await import("./auth");
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(" ") : "Request failed");
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}