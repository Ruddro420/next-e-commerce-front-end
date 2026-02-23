import { apiRequest } from "@/lib/api";

// ✅ Get approved reviews + stats + pagination
export function apiProductReviews(productId, page = 1) {
  return apiRequest(`/api/products/${productId}/reviews?page=${page}`);
}

// ✅ Add review (public)
export function apiAddProductReview(productId, body) {
  return apiRequest(`/api/products/${productId}/reviews`, {
    method: "POST",
    body,
  });
}