"use client";

import { useState } from "react";

function formatBDT(amount) {
  const n = Number(amount || 0);
  return `৳ ${n.toLocaleString("en-US")}`;
}

export default function ProductPage() {
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Example product
  const product = {
    id: 1,
    name: "Product Name",
    price: 1000,
    image: "📦"
  };

  const addToCart = () => {
    // Add to cart logic
    setCartItems([...cartItems, { ...product, qty: 1 }]);
    // Show popup
    setShowCartPopup(true);
  };

  return (
    <div className="p-8">
      {/* Add to Cart Button */}
      <button
        onClick={addToCart}
        className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700"
      >
        Add to Cart
      </button>

      {/* Cart Popup */}
      {showCartPopup && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowCartPopup(false)}
          />
          
          {/* Popup */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md">
            {/* Header */}
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="font-extrabold text-lg">Cart ({cartItems.length})</h2>
              <button
                onClick={() => setShowCartPopup(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Cart Items */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {cartItems.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Cart is empty</p>
              ) : (
                cartItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className="flex justify-between mt-2">
                        <span className="text-sm">Qty: {item.qty}</span>
                        <span className="font-bold">{formatBDT(item.price)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer with Checkout Button */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-xl text-red-800">
                    {formatBDT(cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0))}
                  </span>
                </div>
                <a
                  href="/checkout"
                  className="block w-full bg-red-800 text-white text-center px-4 py-3 rounded-xl font-bold hover:bg-red-900"
                >
                  Proceed to Checkout
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}