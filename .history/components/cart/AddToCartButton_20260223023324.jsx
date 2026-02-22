"use client";

import { useMemo, useState } from "react";
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

  // Find if item already exists in cart
  const inCart = useMemo(() => {
    if (!p?.id) return false;

    const vId = isVariable ? selectedVariant?.id ?? null : null;

    return (items || []).some((it) => {
      // adjust these keys if your store differs
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
    setShowCartPopup(true); // Show popup when item is added
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

        {/* Cart Popup */}
        {showCartPopup && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCartPopup(false)}
            />
            
            {/* Popup */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="font-extrabold text-lg">Your Cart ({items.length})</h2>
                <button
                  onClick={() => setShowCartPopup(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="p-4">
                {items.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                      {items.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 border-b border-gray-100 pb-4">
                          {/* Product Image */}
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '📦';
                                }}
                              />
                            ) : (
                              '📦'
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{item.name}</div>
                            {item.variantLabel && (
                              <div className="text-xs text-slate-500 mt-1">
                                {item.variantLabel}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-slate-500">Qty: {item.qty}</span>
                              <span className="font-bold text-sm">
                                {formatBDT(Number(item.price || 0) * Number(item.qty || 1))}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <div className="flex justify-between mb-4">
                        <span className="font-semibold">Subtotal:</span>
                        <span className="font-bold text-xl text-red-800">
                          {formatBDT(cartTotals.subtotal)}
                        </span>
                      </div>

                      {/* Checkout Button */}
                      <Link
                        href="/checkout"
                        onClick={() => setShowCartPopup(false)}
                        className="block w-full bg-red-800 text-white text-center px-4 py-3 rounded-xl font-bold hover:bg-red-900 transition-colors"
                      >
                        Proceed to Checkout
                      </Link>

                      {/* Continue Shopping */}
                      <button
                        onClick={() => setShowCartPopup(false)}
                        className="w-full mt-2 text-sm text-slate-600 hover:text-slate-900 py-2"
                      >
                        Continue Shopping
                      </button>
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

  // Default -> Add to cart
  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={[
        "cursor-pointer mt-4 w-full rounded-md border-2 border-[#008159] text-[#008159] font-bold py-2.5 text-sm hover:bg-[#008159] hover:text-white inline-flex items-center justify-center",
        className,
      ].join(" ")}
    >
      <ShoppingCart className="inline mr-2 w-5 h-5" />
      {labels.add}
    </button>
  );
}