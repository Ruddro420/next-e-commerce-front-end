"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ShoppingCart, X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/store/cartStore";

/* ===== helpers ===== */
function formatBDT(amount) {
  const n = Number(amount || 0);
  return `৳ ${n.toLocaleString("en-US")}`;
}

function makeLineId({ productId, variantId }) {
  return `p:${productId ?? "?"}|v:${variantId ?? "none"}`;
}

/* ===== Cart Popup Portal ===== */
function CartPopup({ items, cartTotal, onClose, handleQuantityChange, removeItem }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Save original overflow
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647, // max z-index
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          width: "90%",
          maxWidth: "420px",
          maxHeight: "80vh",
          backgroundColor: "#fff",
          borderRadius: "14px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
            <ShoppingBag className="w-4 h-4 mr-2 inline-block" /> Cart ({items.length})
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e7eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f3f4f6")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Items */}
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "44px", marginBottom: "10px" }}>🛒</div>
              <p style={{ color: "#6b7280", margin: 0 }}>Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.lineId}
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "16px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                {/* Image */}
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    background: "#f3f4f6",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement.textContent = "📦";
                      }}
                    />
                  ) : (
                    "📦"
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </div>
                  {item.variantLabel && (
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
                      {item.variantLabel}
                    </div>
                  )}

                  {/* Qty + price + delete */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    {/* Quantity */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        padding: "2px 4px",
                      }}
                    >
                      <button
                        onClick={() => handleQuantityChange(item, item.qty - 1)}
                        disabled={item.qty <= 1}
                        style={{
                          padding: "4px",
                          border: "none",
                          background: "none",
                          cursor: item.qty <= 1 ? "not-allowed" : "pointer",
                          opacity: item.qty <= 1 ? 0.4 : 1,
                          display: "flex",
                        }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontSize: "14px", minWidth: "20px", textAlign: "center" }}>
                        {item.qty}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item, item.qty + 1)}
                        disabled={item.stock ? item.qty >= item.stock : false}
                        style={{
                          padding: "4px",
                          border: "none",
                          background: "none",
                          cursor: item.stock && item.qty >= item.stock ? "not-allowed" : "pointer",
                          opacity: item.stock && item.qty >= item.stock ? 0.4 : 1,
                          display: "flex",
                        }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: "700", color: "#dc2626", fontSize: "14px" }}>
                        {formatBDT(Number(item.price) * item.qty)}
                      </span>
                      <button
                        onClick={() => removeItem(item.lineId)}
                        style={{
                          padding: "4px",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "#d1d5db",
                          display: "flex",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            style={{
              padding: "16px 20px",
              borderTop: "2px solid #e5e7eb",
              flexShrink: 0,
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <span style={{ fontWeight: "600", fontSize: "15px" }}>Total</span>
              <span style={{ fontSize: "20px", fontWeight: "800", color: "#dc2626" }}>
                {formatBDT(cartTotal)}
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                href="/cart"
                onClick={onClose}
                style={{
                  flex: 1,
                  background: "#f3f4f6",
                  color: "#111",
                  textAlign: "center",
                  padding: "11px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                style={{
                  flex: 1,
                  background: "#dc2626",
                  color: "#fff",
                  textAlign: "center",
                  padding: "11px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#b91c1c")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#dc2626")}
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ===== Main Component ===== */
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
  const [showPopup, setShowPopup] = useState(false);

  const currentLineId = useMemo(() => {
    const productId = p?.id;
    const variantId = isVariable ? selectedVariant?.id ?? null : null;
    return makeLineId({ productId, variantId });
  }, [p?.id, isVariable, selectedVariant?.id]);

  const existingItem = items.find((item) => item.lineId === currentLineId);
  const showViewCart = !!existingItem;

  const handleAddToCart = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const v = isVariable ? selectedVariant : null;

    const price = isVariable
      ? v?.sale_price ?? v?.regular_price ?? v?.price ?? 0
      : p?.sale_price ?? p?.regular_price ?? p?.price ?? 0;

    const image =
      (isVariable && v?.image_path ? `${baseUrl}/storage/${v.image_path}` : "") ||
      getProductImage(p, baseUrl) ||
      "";

    // DEBUG: Log what's available
    console.log("====== ADD TO CART DEBUG ======");
    console.log("Product (p):", p);
    console.log("Selected Variant (v):", v);
    console.log("Product SKU:", p?.sku);
    console.log("Variant SKU:", v?.sku);
    console.log("Is Variable:", isVariable);

    const sku = isVariable
      ? v?.sku ?? null
      : p?.sku ?? null;

    console.log("Final SKU being sent:", sku);

    const itemToAdd = {
      productId: p.id,
      variantId: v?.id ?? null,
      name: p?.name ?? "",
      variantLabel: isVariable
        ? Object.entries(v?.attributes || {})
          .map(([k, val]) => `${k}: ${val}`)
          .join(", ")
        : "",
      image,
      price,
      stock: isVariable ? v?.stock : p?.stock,
      sku: sku,
    };

    console.log("Full item being added:", itemToAdd);
    console.log("=================================");

    addItem(itemToAdd, qty);

    toast.success(labels.addedToast);
    setShowPopup(true);
  };

  const handleQuantityChange = (item, newQty) => {
    if (newQty < 1) return;
    if (item.stock && newQty > item.stock) {
      toast.error(`Only ${item.stock} available`);
      return;
    }
    setQty(item.lineId, newQty);
  };

  const cartTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  }, [items]);

  const handleClose = () => setShowPopup(false);

  return (
    <>
      {showViewCart ? (
        <button
          onClick={() => setShowPopup(true)}
          className={`mt-4 w-full rounded-md border-2 border-[#008159] bg-[#008159] text-white font-bold py-2.5 text-sm inline-flex items-center justify-center ${className}`}
        >
          <ShoppingCart className="inline mr-2 w-5 h-5" />
          {labels.view}
        </button>
      ) : (
        <button
          onClick={handleAddToCart}
          className={`cursor-pointer mt-4 w-full rounded-md border-2 border-[#008159] text-[#008159] font-bold py-2.5 text-sm hover:bg-[#008159] hover:text-white inline-flex items-center justify-center ${className}`}
        >
          <ShoppingCart className="inline mr-2 w-5 h-5" />
          {labels.add}
        </button>
      )}

      {showPopup && (
        <CartPopup
          items={items}
          cartTotal={cartTotal}
          onClose={handleClose}
          handleQuantityChange={handleQuantityChange}
          removeItem={removeItem}
        />
      )}
    </>
  );
}