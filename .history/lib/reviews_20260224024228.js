import { apiRequest } from "./api"; // <-- adjust path if your apiRequest file is elsewhere

// GET: approved reviews for a product
export function apiProductReviews(productId, { page = 1 } = {}) {
  return apiRequest(`/api/products/${productId}/reviews?page=${page}`);
}

// POST: submit review (public)
export function apiSubmitProductReview(productId, payload) {
  return apiRequest(`/api/products/${productId}/reviews`, {
    method: "POST",
    body: payload,
  });
}

// OPTIONAL: global reviews list (search/filter)
export function apiReviews({ q = "", product_id = "", page = 1 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (product_id) params.set("product_id", product_id);
  params.set("page", String(page));
  return apiRequest(`/api/reviews?${params.toString()}`);
}