"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/store/cartStore";

/* ===== helpers (local to this component) ===== */

function storageUrl(baseUrl, path) {
  if (!baseUrl || !path) return "";
  return `${baseUrl}/storage/${path}`;
}

function formatBDT(amount) {
  const n = Number(amount || 0);
  return `৳ ${n.toLocaleString("en-US")}`;
}

// Helper to generate lineId matching your context
function makeLineId({ productId, variantId }) {
  return `p:${productId ?? "?"}|v:${variantId ?? "none"}`;
}

/** Small Portal helper (client-only safe) */
function Portal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(children, document.body);
}

export default function AddToCartButton({
  p,
  isVariable = false,
  selectedVariant = null,
  baseUrl = "",
  getProductImage = () => "",
  className = "",
  qty = 1,
  labels = {
    add: "কার্টে যুক্ত করুন",
    view: "কার্ট দেখুন",
    addedToast: "Added to cart",
  },
}) {
  const { items, addItem, removeItem, setQty } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);

  const scrollYRef = useRef(0);

  // ✅ Better scroll lock: freeze body while modal open and restore position
  useEffect(() => {
    if (!showCartPopup) return;

    scrollYRef.current = window.scrollY;

    // Freeze the body at current scroll position
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      // Restore body styles
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      // Restore scroll
      window.scrollTo(0, scrollYRef.current || 0);
    };
  }, [showCartPopup]);

  // ✅ Close on Escape
  useEffect(() => {
    if (!showCartPopup) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowCartPopup(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showCartPopup]);

  // Find current item's lineId
  const currentLineId = useMemo(() => {
    const productId = p?.id;
    const variantId = isVariable ? selectedVariant?.id ?? null : null;
    return makeLineId({ productId, variantId });
  }, [p?.id, isVariable, selectedVariant?.id]);

  // Check if item already exists in cart using lineId
  const existingItem = useMemo(() => {
    return items.find((item) => item.lineId === currentLineId);
  }, [items, currentLineId]);

  const showViewCart = !!existingItem || justAdded;

  const handleAddToCart = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const v = isVariable ? selectedVariant : null;

    const price = isVariable
      ? v?.sale_price ?? v?.regular_price ?? v?.price ?? null
      : p?.sale_price ?? p?.regular_price ?? p?.price ?? null;

    const oldPrice = isVariable
      ? v?.regular_price && v?.sale_price
        ? v.regular_price
        : null
      : p?.regular_price && p?.sale_price
      ? p.regular_price
      : null;

    const variantLabel = isVariable
      ? (() => {
          const attrs = v?.attributes || v?.attribute_values || {};
          const keys = Object.keys(attrs);
          if (!keys.length) return `Variant #${v?.id}`;
          return keys.map((k) => `${k}: ${attrs[k]}`).join(", ");
        })()
      : p?.variant ?? "";

    const image =
      (isVariable && v?.image_path ? storageUrl(baseUrl, v.image_path) : "") ||
      getProductImage(p, baseUrl) ||
      "";

    addItem(
      {
        productId: p.id,
        variantId: v?.id ?? null,
        name: p?.name ?? "",
        category: p?.category?.name || p?.category?.slug || "",
        variantLabel,
        image,
        price,
        oldPrice,
        stock: isVariable ? v?.stock : p?.stock,
        attrs: isVariable ? v?.attributes || v?.attribute_values || null : null,
      },
      qty
    );

    toast.success(labels.addedToast);
    setJustAdded(true);
    setShowCartPopup(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleClosePopup = () => setShowCartPopup(false);

  const handleQuantityChange = (item, newQty) => {
    if (newQty < 1) return;

    if (item.stock && newQty > item.stock) {
      toast.error(`Only ${item.stock} items available`);
      return;
    }

    setQty(item.lineId, newQty);
  };

  const handleRemoveItem = (item) => {
    removeItem(item.lineId);
    toast.success("Item removed from cart");
  };

  // Calculate cart totals
  const cartTotals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.qty || 1);
    }, 0);
    return { subtotal };
  }, [items]);

  // If already in cart -> show View Cart
  if (showViewCart) {
    return (
      <>
        <Link
          href="/cart"
          onClick={(e) => e.stopPropagation()}
          className={[
            "mt-4 w-full rounded-md border-2 border-[#008159] bg-[#008159] text-white font-bold py-2.5 text-sm inline-flex items-center justify-center transition-all duration-300 hover:bg-[#006b48] hover:scale-[1.02] active:scale-[0.98]",
            className,
          ].join(" ")}
        >
          <ShoppingCart className="inline mr-2 w-5 h-5 transition-transform group-hover:scale-110" />
          {labels.view}
        </Link>

        {/* ✅ Cart Popup rendered via Portal */}
        {showCartPopup && (
          <Portal>
            {/* Backdrop */}
            <div
              onClick={handleClosePopup}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 2147483646, // very high
                cursor: "pointer",
              }}
            />

            {/* Popup */}
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2147483647, // above backdrop
                width: "90%",
                maxWidth: "32rem",
                maxHeight: "85vh",
                backgroundColor: "white",
                borderRadius: "1rem",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
              // prevent click bubbling to backdrop if someone clicks inside
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  padding: "1rem 1.5rem",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "white",
                }}
              >
                <h2 style={{ fontWeight: 600, fontSize: "1.125rem" }}>
                  Shopping Cart ({items.length})
                </h2>

                <button
                  onClick={handleClosePopup}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "9999px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f3f4f6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  aria-label="Close cart"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "1.5rem",
                }}
              >
                {items.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem 0" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                      🛒
                    </div>
                    <p style={{ color: "#6b7280" }}>Your cart is empty</p>
                    <button
                      onClick={handleClosePopup}
                      style={{
                        marginTop: "1rem",
                        color: "#008159",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    {items.map((item, index) => {
                      const itemTotal =
                        Number(item.price || 0) * Number(item.qty || 1);

                      return (
                        <div
                          key={item.lineId || index}
                          style={{
                            display: "flex",
                            gap: "1rem",
                            padding: "1rem 0",
                            borderBottom:
                              index !== items.length - 1
                                ? "1px solid #e5e7eb"
                                : "none",
                          }}
                        >
                          {/* Product Image */}
                          <div
                            style={{
                              width: "4rem",
                              height: "4rem",
                              backgroundColor: "#f3f4f6",
                              borderRadius: "0.5rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.5rem",
                              flexShrink: 0,
                            }}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: "0.5rem",
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.innerHTML =
                                      "📦";
                                  }
                                }}
                              />
                            ) : (
                              "📦"
                            )}
                          </div>

                          {/* Product Details */}
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: 500,
                                marginBottom: "0.25rem",
                              }}
                            >
                              {item.name}
                            </div>

                            {item.variantLabel && (
                              <div
                                style={{
                                  fontSize: "0.875rem",
                                  color: "#6b7280",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                {item.variantLabel}
                              </div>
                            )}

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              {/* Quantity */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "0.375rem",
                                  padding: "0.25rem",
                                }}
                              >
                                <button
                                  onClick={() =>
                                    handleQuantityChange(item, item.qty - 1)
                                  }
                                  disabled={item.qty <= 1}
                                  style={{
                                    padding: "0.25rem",
                                    border: "none",
                                    background: "none",
                                    cursor:
                                      item.qty <= 1
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity: item.qty <= 1 ? 0.5 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={14} />
                                </button>

                                <span
                                  style={{
                                    fontSize: "0.875rem",
                                    minWidth: "2rem",
                                    textAlign: "center",
                                  }}
                                >
                                  {item.qty}
                                </span>

                                <button
                                  onClick={() =>
                                    handleQuantityChange(item, item.qty + 1)
                                  }
                                  disabled={
                                    item.stock ? item.qty >= item.stock : false
                                  }
                                  style={{
                                    padding: "0.25rem",
                                    border: "none",
                                    background: "none",
                                    cursor:
                                      item.stock && item.qty >= item.stock
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity:
                                      item.stock && item.qty >= item.stock
                                        ? 0.5
                                        : 1,
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              {/* Total + Remove */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.75rem",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: "#dc2626",
                                  }}
                                >
                                  {formatBDT(itemTotal)}
                                </span>

                                <button
                                  onClick={() => handleRemoveItem(item)}
                                  style={{
                                    padding: "0.25rem",
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    color: "#9ca3af",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = "#dc2626")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = "#9ca3af")
                                  }
                                  aria-label="Remove item"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Summary */}
                    <div
                      style={{
                        marginTop: "1.5rem",
                        paddingTop: "1rem",
                        borderTop: "2px solid #e5e7eb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "1rem",
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>Subtotal</span>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "1.25rem",
                            color: "#dc2626",
                          }}
                        >
                          {formatBDT(cartTotals.subtotal)}
                        </span>
                      </div>

                      <Link
                        href="/checkout"
                        onClick={handleClosePopup}
                        style={{
                          display: "block",
                          width: "100%",
                          backgroundColor: "#dc2626",
                          color: "white",
                          textAlign: "center",
                          padding: "0.75rem",
                          borderRadius: "0.5rem",
                          fontWeight: 600,
                          textDecoration: "none",
                          marginBottom: "0.5rem",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#b91c1c")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#dc2626")
                        }
                      >
                        Proceed to Checkout
                      </Link>

                      <button
                        onClick={handleClosePopup}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          background: "none",
                          border: "none",
                          color: "#6b7280",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#374151")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#6b7280")
                        }
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Portal>
        )}
      </>
    );
  }

  // Default -> Add to cart
  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={[
        "cursor-pointer mt-4 w-full rounded-md border-2 border-[#008159] text-[#008159] font-bold py-2.5 text-sm hover:bg-[#008159] hover:text-white inline-flex items-center justify-center transition-colors",
        className,
      ].join(" ")}
    >
      <ShoppingCart className="inline mr-2 w-5 h-5" />
      {labels.add}
    </button>
  );
}