"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
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

  // Lock body scroll when popup is open
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'relative';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
    };
  }, [showPopup]);

  // Find current item
  const currentLineId = useMemo(() => {
    const productId = p?.id;
    const variantId = isVariable ? selectedVariant?.id ?? null : null;
    return makeLineId({ productId, variantId });
  }, [p?.id, isVariable, selectedVariant?.id]);

  const existingItem = items.find(item => item.lineId === currentLineId);
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

    addItem(
      {
        productId: p.id,
        variantId: v?.id ?? null,
        name: p?.name ?? "",
        variantLabel: isVariable
          ? Object.entries(v?.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(", ")
          : "",
        image,
        price,
        stock: isVariable ? v?.stock : p?.stock,
      },
      qty
    );

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
    return items.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);
  }, [items]);

  // View Cart button
  if (showViewCart) {
    return (
      <>
        <Link
          href="/cart"
          className={`mt-4 w-full rounded-md border-2 border-[#008159] bg-[#008159] text-white font-bold py-2.5 text-sm inline-flex items-center justify-center ${className}`}
        >
          <ShoppingCart className="inline mr-2 w-5 h-5" />
          {labels.view}
        </Link>

        {/* Popup */}
        {showPopup && (
          <>
            {/* Backdrop with extremely high z-index */}
            <div
              onClick={() => setShowPopup(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 9999999,
                pointerEvents: 'auto',
              }}
            />

            {/* Popup Content with even higher z-index */}
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10000000,
                width: '90%',
                maxWidth: '400px',
                maxHeight: '80vh',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                pointerEvents: 'auto',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'white',
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  Cart ({items.length})
                </h3>
                <button
                  onClick={() => setShowPopup(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '9999px',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Items */}
              <div style={{
                padding: '20px',
                overflowY: 'auto',
                maxHeight: 'calc(80vh - 130px)',
                backgroundColor: 'white',
              }}>
                {items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
                    <p style={{ color: '#6b7280', margin: 0 }}>Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    {items.map((item) => (
                      <div
                        key={item.lineId}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          marginBottom: '16px',
                          paddingBottom: '16px',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        {/* Image */}
                        <div style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          flexShrink: 0,
                        }}>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '8px',
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement.innerHTML = '📦';
                              }}
                            />
                          ) : '📦'}
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                            {item.name}
                          </div>
                          {item.variantLabel && (
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                              {item.variantLabel}
                            </div>
                          )}

                          {/* Price and quantity */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              padding: '2px',
                            }}>
                              <button
                                onClick={() => handleQuantityChange(item, item.qty - 1)}
                                disabled={item.qty <= 1}
                                style={{
                                  padding: '6px',
                                  border: 'none',
                                  background: 'none',
                                  cursor: item.qty <= 1 ? 'not-allowed' : 'pointer',
                                  opacity: item.qty <= 1 ? 0.5 : 1,
                                  display: 'flex',
                                }}
                              >
                                <Minus size={14} />
                              </button>
                              <span style={{ fontSize: '14px', minWidth: '24px', textAlign: 'center' }}>
                                {item.qty}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item, item.qty + 1)}
                                disabled={item.stock ? item.qty >= item.stock : false}
                                style={{
                                  padding: '6px',
                                  border: 'none',
                                  background: 'none',
                                  cursor: item.stock && item.qty >= item.stock ? 'not-allowed' : 'pointer',
                                  opacity: item.stock && item.qty >= item.stock ? 0.5 : 1,
                                  display: 'flex',
                                }}
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: '600', color: '#dc2626' }}>
                                {formatBDT(Number(item.price) * item.qty)}
                              </span>
                              <button
                                onClick={() => removeItem(item.lineId)}
                                style={{
                                  padding: '6px',
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: '#9ca3af',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Total and Checkout */}
                    <div style={{
                      marginTop: '20px',
                      paddingTop: '16px',
                      borderTop: '2px solid #e5e7eb',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                      }}>
                        <span style={{ fontWeight: '500' }}>Total</span>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>
                          {formatBDT(cartTotal)}
                        </span>
                      </div>

                      <Link
                        href="/checkout"
                        onClick={() => setShowPopup(false)}
                        style={{
                          display: 'block',
                          width: '100%',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          textAlign: 'center',
                          padding: '12px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          textDecoration: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                      >
                        Proceed to Checkout
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // Add to cart button
  return (
    <button
      onClick={handleAddToCart}
      className={`cursor-pointer mt-4 w-full rounded-md border-2 border-[#008159] text-[#008159] font-bold py-2.5 text-sm hover:bg-[#008159] hover:text-white inline-flex items-center justify-center ${className}`}
    >
      <ShoppingCart className="inline mr-2 w-5 h-5" />
      {labels.add}
    </button>
  );
}