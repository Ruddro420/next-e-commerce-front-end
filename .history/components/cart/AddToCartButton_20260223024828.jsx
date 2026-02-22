"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, X } from "lucide-react";
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
  const { addItem, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (showCartPopup) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [showCartPopup]);

  // Find if item already exists in cart
  const inCart = useMemo(() => {
    if (!p?.id) return false;

    const vId = isVariable ? selectedVariant?.id ?? null : null;

    return (items || []).some((it) => {
      const sameProduct = (it.productId ?? it.product_id) === p.id;
      const itVar = it.variantId ?? it.variant_id ?? null;
      const sameVariant = (itVar ?? null) === (vId ?? null);
      return sameProduct && sameVariant;
    });
  }, [items, p?.id, isVariable, selectedVariant?.id]);

  const showViewCart = inCart || justAdded;

  const handleAddToCart = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const v = isVariable ? selectedVariant : null;

    const price = isVariable
      ? v?.sale_price ?? v?.regular_price ?? v?.price ?? null
      : p?.sale_price ?? p?.regular_price ?? p?.price ?? null;

    const oldPrice = isVariable
      ? (v?.regular_price && v?.sale_price ? v.regular_price : null)
      : (p?.regular_price && p?.sale_price ? p.regular_price : null);

    const variantLabel = isVariable
      ? (() => {
          const attrs = v?.attributes || v?.attribute_values || {};
          const keys = Object.keys(attrs);
          if (!keys.length) return `Variant #${v?.id}`;
          return keys.map((k) => `${k}: ${attrs[k]}`).join(", ");
        })()
      : (p?.variant ?? "");

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
        attrs: isVariable ? (v?.attributes || v?.attribute_values || null) : null,
      },
      qty
    );

    toast.success(labels.addedToast);
    setJustAdded(true);
    setShowCartPopup(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  // Calculate cart totals
  const cartTotals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (Number(item.price || 0) * Number(item.qty || 1));
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
            "mt-4 w-full rounded-md border-2 border-[#008159] bg-[#008159] text-white font-bold py-2.5 text-sm inline-flex items-center justify-center",
            className,
          ].join(" ")}
        >
          <ShoppingCart className="inline mr-2 w-5 h-5" />
          {labels.view}
        </Link>

        {/* Cart Popup - Fixed with highest z-index */}
        {showCartPopup && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999999, pointerEvents: 'none' }}>
            {/* Backdrop - covers everything */}
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999999,
                pointerEvents: 'auto'
              }}
              onClick={() => setShowCartPopup(false)}
            />
            
            {/* Popup - centered */}
            <div 
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000000,
                pointerEvents: 'auto',
                width: '100%',
                maxWidth: '28rem',
                maxHeight: '80vh',
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflowY: 'auto'
              }}
            >
              {/* Header */}
              <div style={{
                position: 'sticky',
                top: 0,
                backgroundColor: 'white',
                borderBottom: '1px solid #e5e7eb',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h2 style={{ fontWeight: '800', fontSize: '1.125rem' }}>
                  Your Cart ({items.length})
                </h2>
                <button
                  onClick={() => setShowCartPopup(false)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              {/* Cart Items */}
              <div style={{ padding: '1rem' }}>
                {items.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
                    Your cart is empty
                  </p>
                ) : (
                  <>
                    <div style={{ 
                      maxHeight: '15rem', 
                      overflowY: 'auto', 
                      paddingRight: '0.5rem' 
                    }}>
                      {items.map((item, index) => (
                        <div 
                          key={index} 
                          style={{
                            display: 'flex',
                            gap: '0.75rem',
                            borderBottom: '1px solid #f1f5f9',
                            paddingBottom: '1rem',
                            marginBottom: '1rem'
                          }}
                        >
                          {/* Product Image */}
                          <div style={{
                            width: '4rem',
                            height: '4rem',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            flexShrink: 0
                          }}>
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '0.5rem'
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.innerHTML = '📦';
                                  }
                                }}
                              />
                            ) : (
                              '📦'
                            )}
                          </div>

                          {/* Product Details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              fontWeight: '600', 
                              fontSize: '0.875rem',
                              color: '#111827',
                              wordBreak: 'break-word'
                            }}>
                              {item.name || 'Product'}
                            </div>
                            
                            {item.variantLabel && (
                              <div style={{ 
                                fontSize: '0.75rem', 
                                color: '#64748b',
                                marginTop: '0.125rem',
                                wordBreak: 'break-word'
                              }}>
                                {item.variantLabel}
                              </div>
                            )}
                            
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              marginTop: '0.375rem'
                            }}>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Qty: {item.qty || 1}
                              </span>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ 
                                  fontWeight: '700', 
                                  fontSize: '0.875rem',
                                  color: '#111827'
                                }}>
                                  {formatBDT(Number(item.price || 0) * Number(item.qty || 1))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart Summary */}
                    <div style={{ 
                      marginTop: '1.5rem', 
                      borderTop: '1px solid #e5e7eb', 
                      paddingTop: '1rem' 
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}>
                        <span style={{ fontWeight: '600', color: '#374151' }}>Subtotal:</span>
                        <span style={{ 
                          fontWeight: '700', 
                          fontSize: '1.25rem',
                          color: '#dc2626'
                        }}>
                          {formatBDT(cartTotals.subtotal)}
                        </span>
                      </div>

                      {/* Checkout Button */}
                      <Link
                        href="/checkout"
                        onClick={() => setShowCartPopup(false)}
                        style={{
                          display: 'block',
                          width: '100%',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          textAlign: 'center',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.75rem',
                          fontWeight: '700',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          border: 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                      >
                        Proceed to Checkout
                      </Link>

                      {/* Continue Shopping */}
                      <button
                        onClick={() => setShowCartPopup(false)}
                        style={{
                          width: '100%',
                          marginTop: '0.75rem',
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          padding: '0.5rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
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