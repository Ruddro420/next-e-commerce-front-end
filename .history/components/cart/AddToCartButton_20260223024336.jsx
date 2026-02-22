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
  const [isAnimating, setIsAnimating] = useState(false);

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

  const handleClosePopup = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowCartPopup(false);
      setIsAnimating(false);
    }, 200);
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
            "mt-4 w-full rounded-md border-2 border-[#008159] bg-[#008159] text-white font-bold py-2.5 text-sm inline-flex items-center justify-center transition-all duration-300 hover:bg-[#006b48] hover:scale-[1.02] active:scale-[0.98]",
            className,
          ].join(" ")}
        >
          <ShoppingCart className="inline mr-2 w-5 h-5 transition-transform group-hover:scale-110" />
          {labels.view}
        </Link>

        {/* Cart Popup - Smooth animations */}
        {(showCartPopup || isAnimating) && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999999, pointerEvents: 'none' }}>
            {/* Backdrop with fade animation */}
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999999,
                pointerEvents: 'auto',
                transition: 'opacity 200ms ease-in-out',
                opacity: showCartPopup ? 1 : 0,
                backdropFilter: 'blur(4px)'
              }}
              onClick={handleClosePopup}
            />
            
            {/* Popup with scale and fade animation */}
            <div 
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${showCartPopup ? 1 : 0.95})`,
                zIndex: 1000000,
                pointerEvents: 'auto',
                width: '100%',
                maxWidth: '28rem',
                maxHeight: '80vh',
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflowY: 'auto',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: showCartPopup ? 1 : 0
              }}
            >
              {/* Header with subtle gradient */}
              <div style={{
                position: 'sticky',
                top: 0,
                background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
                borderBottom: '1px solid #f0f0f0',
                padding: '1.25rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h2 style={{ 
                  fontWeight: '700', 
                  fontSize: '1.25rem',
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Shopping Cart ({items.length})
                </h2>
                <button
                  onClick={handleClosePopup}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'rgba(0,0,0,0.05)',
                    transition: 'all 150ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <X style={{ width: '1.25rem', height: '1.25rem', color: '#475569' }} />
                </button>
              </div>

              {/* Cart Items */}
              <div style={{ padding: '1.25rem' }}>
                {items.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem 1rem',
                    animation: 'fadeIn 0.3s ease'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>
                      Your cart is empty
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ 
                      maxHeight: '15rem', 
                      overflowY: 'auto', 
                      paddingRight: '0.5rem',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e1 #f1f5f9'
                    }}>
                      {items.map((item, index) => (
                        <div 
                          key={index} 
                          style={{
                            display: 'flex',
                            gap: '1rem',
                            borderBottom: '1px solid #f1f5f9',
                            paddingBottom: '1rem',
                            marginBottom: '1rem',
                            animation: `slideIn 0.3s ease ${index * 0.05}s both`
                          }}
                        >
                          {/* Product Image with hover effect */}
                          <div style={{
                            width: '4.5rem',
                            height: '4.5rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            flexShrink: 0,
                            transition: 'transform 150ms ease',
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '0.75rem'
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
                              fontSize: '0.9375rem',
                              color: '#0f172a',
                              wordBreak: 'break-word',
                              marginBottom: '0.25rem'
                            }}>
                              {item.name || 'Product'}
                            </div>
                            
                            {item.variantLabel && (
                              <div style={{ 
                                fontSize: '0.75rem', 
                                color: '#64748b',
                                marginBottom: '0.5rem',
                                wordBreak: 'break-word',
                                backgroundColor: '#f8fafc',
                                display: 'inline-block',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '9999px'
                              }}>
                                {item.variantLabel}
                              </div>
                            )}
                            
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between'
                            }}>
                              <span style={{ 
                                fontSize: '0.8125rem', 
                                color: '#475569',
                                backgroundColor: '#f1f5f9',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.375rem'
                              }}>
                                Qty: {item.qty || 1}
                              </span>
                              <span style={{ 
                                fontWeight: '700', 
                                fontSize: '1rem',
                                color: '#0f172a',
                                background: 'linear-gradient(135deg, #334155, #0f172a)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                              }}>
                                {formatBDT(Number(item.price || 0) * Number(item.qty || 1))}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart Summary with animation */}
                    <div style={{ 
                      marginTop: '1.5rem', 
                      borderTop: '2px solid #f1f5f9', 
                      paddingTop: '1.25rem',
                      animation: 'fadeIn 0.4s ease'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1.25rem'
                      }}>
                        <span style={{ 
                          fontWeight: '600', 
                          color: '#334155',
                          fontSize: '1rem'
                        }}>
                          Subtotal
                        </span>
                        <span style={{ 
                          fontWeight: '800', 
                          fontSize: '1.5rem',
                          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          {formatBDT(cartTotals.subtotal)}
                        </span>
                      </div>

                      {/* Checkout Button with hover animation */}
                      <Link
                        href="/checkout"
                        onClick={handleClosePopup}
                        style={{
                          display: 'block',
                          width: '100%',
                          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                          color: 'white',
                          textAlign: 'center',
                          padding: '0.875rem 1rem',
                          borderRadius: '0.75rem',
                          fontWeight: '700',
                          fontSize: '1rem',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          border: 'none',
                          transition: 'all 200ms ease',
                          transform: 'scale(1)',
                          boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(220, 38, 38, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(220, 38, 38, 0.2)';
                        }}
                      >
                        Proceed to Checkout →
                      </Link>

                      {/* Continue Shopping with hover effect */}
                      <button
                        onClick={handleClosePopup}
                        style={{
                          width: '100%',
                          marginTop: '0.75rem',
                          fontSize: '0.9375rem',
                          color: '#64748b',
                          padding: '0.625rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 150ms ease',
                          borderRadius: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#334155';
                          e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#64748b';
                          e.currentTarget.style.background = 'none';
                        }}
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

        {/* Add keyframe animations */}
        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </>
    );
  }

  // Default -> Add to cart with hover animation
  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={[
        "cursor-pointer mt-4 w-full rounded-md border-2 border-[#008159] text-[#008159] font-bold py-2.5 text-sm hover:bg-[#008159] hover:text-white inline-flex items-center justify-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        className,
      ].join(" ")}
    >
      <ShoppingCart className="inline mr-2 w-5 h-5 transition-transform group-hover:rotate-12" />
      {labels.add}
    </button>
  );
}