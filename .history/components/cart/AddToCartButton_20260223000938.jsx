"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/store/cartStore";

// ✅ change this to your actual cart hook/store


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

    // ✅ detect if this product(+variant) already exists in cart
    const inCart = useMemo(() => {
        if (!p?.id) return false;

        const variantId = isVariable ? selectedVariant?.id ?? null : null;

        return (items || []).some((it) => {
            return (
                it.productId === p.id &&
                (variantId === null ? (it.variantId ?? null) === null : it.variantId === variantId)
            );
        });
    }, [items, p?.id, isVariable, selectedVariant?.id]);

    const showViewCart = inCart || justAdded;

    const handleAddToCart = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();

        const v = isVariable ? selectedVariant : null;

        const price = isVariable
            ? (v?.sale_price ?? v?.regular_price)
            : (p?.sale_price ?? p?.regular_price);

        const oldPrice = isVariable
            ? (v?.regular_price && v?.sale_price ? v.regular_price : null)
            : (p?.regular_price && p?.sale_price ? p.regular_price : null);

        const variantLabel = isVariable
            ? (() => {
                const attrs = v?.attributes || {};
                const keys = Object.keys(attrs);
                if (!keys.length) return `Variant #${v?.id}`;
                return keys.map((k) => `${k}: ${attrs[k]}`).join(", ");
            })()
            : (p?.variant ?? "");

        const image =
            (isVariable && v?.image_path ? `${baseUrl}/storage/${v.image_path}` : "") ||
            getProductImage(p, baseUrl) ||
            "";

        addItem(
            {
                productId: p.id,
                variantId: v?.id ?? null,
                name: p.name,
                category: p?.category?.name || p?.category?.slug || "",
                variantLabel,
                image,
                price,
                oldPrice,
                stock: isVariable ? v?.stock : p?.stock,
                attrs: isVariable ? (v?.attributes || null) : null,
            },
            qty
        );

        toast.success(labels.addedToast);
        setJustAdded(true);

        // optional: after a while, rely only on `inCart`
        setTimeout(() => setJustAdded(false), 1200);
    };

    // ✅ If already in cart: show "View Cart"
    if (showViewCart) {
        return (
            <Link
                href="/cart"
                className={[
                    "mt-4 w-full rounded-md border-2 border-[#008159] bg-[#008159] text-white font-bold py-2.5 text-sm inline-flex items-center justify-center",
                    className,
                ].join(" ")}
                onClick={(e) => e.stopPropagation()}
            >
                <ShoppingCart className="inline mr-2 w-5 h-5" />
                {labels.view}
            </Link>
        );
    }

    // ✅ default: show "Add to cart"
    return (
        <button
            onClick={handleAddToCart}
            className={[
                "cursor-pointer mt-4 w-full rounded-md border-2 border-[#008159] text-[#008159] font-bold py-2.5 text-sm hover:bg-[#008159] hover:text-white inline-flex items-center justify-center",
                className,
            ].join(" ")}
            type="button"
        >
            <ShoppingCart className="inline mr-2 w-5 h-5" />
            {labels.add}
        </button>
    );
}