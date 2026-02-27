"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function storageUrl(baseUrl, path) {
    if (!baseUrl || !path) return "";
    return `${baseUrl.replace(/\/$/, "")}/storage/${path.replace(/^\//, "")}`;
}

function normalizeApiUrlToBase(baseUrl, maybeUrl) {
    if (!maybeUrl) return "";
    const base = (baseUrl || "").replace(/\/$/, "");

    // If backend sends "http://localhost/storage/..." replace origin with baseUrl
    try {
        const u = new URL(maybeUrl);
        const b = new URL(base);
        // keep pathname/query, replace origin
        return `${b.origin}${u.pathname}${u.search}`;
    } catch {
        // relative url or invalid -> return as-is
        return maybeUrl;
    }
}

function getProductImage(p, baseUrl) {
    if (p?.featured_image) return storageUrl(baseUrl, p.featured_image);
    if (p?.featured_image_url) return normalizeApiUrlToBase(baseUrl, p.featured_image_url);
    return "";
}

function pickProducts(data) {
    // handle: { success: true, products: [...] }
    if (Array.isArray(data?.products)) return data.products;

    // keep your old fallbacks too:
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;

    return [];
}

export default function ProductSearchBar({display}) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://10.211.112.19:8000";

    const [q, setQ] = useState("");
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // fallback cache (if API doesn't support ?search=)
    const [allProducts, setAllProducts] = useState(null);

    const boxRef = useRef(null);
    const abortRef = useRef(null);
    const debounceRef = useRef(null);

    // close dropdown when clicking outside
    useEffect(() => {
        function onDocClick(e) {
            if (!boxRef.current) return;
            if (!boxRef.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    async function fetchAllProductsOnce(signal) {
        if (allProducts) return allProducts;
        const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/products`, {
            cache: "no-store",
            signal,
        });
        if (!res.ok) throw new Error(`Products error: ${res.status}`);
        const data = await res.json();
        const list = pickProducts(data);
        setAllProducts(list);
        return list;
    }

    async function fetchResults(query) {
        if (!baseUrl) return;

        // cancel previous
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setLoading(true);

            const endpointBase = `${baseUrl.replace(/\/$/, "")}/api/products`;

            // 1) Try server-side search
            let res = await fetch(`${endpointBase}?search=${encodeURIComponent(query)}`, {
                cache: "no-store",
                signal: controller.signal,
            });

            // If backend returns 404/422/etc for unknown query param, fallback:
            if (!res.ok) {
                // 2) Fallback: fetch all, then filter locally
                const list = await fetchAllProductsOnce(controller.signal);
                const filtered = list.filter((p) =>
                    (p?.name || "").toLowerCase().includes(query.toLowerCase())
                );
                setItems(filtered.slice(0, 8));
                return;
            }

            const data = await res.json();
            const list = pickProducts(data);

            // If backend ignores search and returns everything, still filter:
            const filtered = list.filter((p) =>
                (p?.name || "").toLowerCase().includes(query.toLowerCase())
            );

            setItems(filtered.slice(0, 8));
        } catch (e) {
            if (e.name !== "AbortError") {
                console.error(e);
                setItems([]);
            }
        } finally {
            setLoading(false);
        }
    }

    // debounce typing
    useEffect(() => {
        const query = q.trim();
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.length < 2) {
            setItems([]);
            setOpen(false);
            return;
        }

        debounceRef.current = setTimeout(() => {
            fetchResults(query);
            setOpen(true);
        }, 350);

        return () => clearTimeout(debounceRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, baseUrl]);

    const onSubmit = (e) => {
        e.preventDefault();
        const query = q.trim();
        if (!query) return;
        // optional: route to search page
        // router.push(`/shop?search=${encodeURIComponent(query)}`);
        setOpen(true);
    };

    return (
        <div className={`flex-1 items-center ${display === "desktop" ? "md:flex hidden" : "flex"} gap-2`} ref={boxRef}>
            <form className="flex-1 relative" onSubmit={onSubmit}>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onFocus={() => {
                        if (items.length) setOpen(true);
                    }}
                    className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                    placeholder="পণ্য সার্চ করুন (যেমন: গাড়ি, ইলিশ, মুড়ি)"
                />

                <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                    খুঁজুন
                </button>

                {/* Dropdown */}
                {open ? (
                    <div className="absolute z-50 left-0 right-0 mt-2 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                        <div className="max-h-96 overflow-auto">
                            {loading ? (
                                <div className="p-4 text-sm text-slate-500">Searching...</div>
                            ) : items.length ? (
                                items.map((p) => {
                                    const img = getProductImage(p, baseUrl);
                                    return (
                                        <Link
                                            key={p.id}
                                            href={`/product/${p.id}`}
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition"
                                        >
                                            <div className="h-10 w-10 rounded-lg border border-gray-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                                                {img ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={img}
                                                        alt={p.name || "Product image"}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-[10px] text-slate-400">No image</span>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-semibold text-slate-900 truncate">
                                                    {p.name}
                                                </div>
                                                {/* <div className="text-xs text-slate-500 truncate">
                          {p.product_type === "variable" ? "Variable product" : "Simple product"}
                        </div> */}
                                                <div className="text-xs text-slate-500 truncate">
                                                    {p.sale_price ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-emerald-600 font-semibold">
                                                                ৳{Number(p.sale_price).toFixed(2)}
                                                            </span>
                                                            <span className="line-through text-slate-400">
                                                                ৳{Number(p.regular_price).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ) : p.regular_price ? (
                                                        <span className="text-emerald-600 font-semibold">
                                                            ৳{Number(p.regular_price).toFixed(2)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            {p.product_type === "variable" ? "See options" : "No price"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-sm text-slate-500">No products found.</div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 px-4 py-2 text-xs text-slate-500">
                            Type at least 2 characters
                        </div>
                    </div>
                ) : null}
            </form>
        </div>
    );
}