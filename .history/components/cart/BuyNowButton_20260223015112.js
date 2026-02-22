import { useRouter } from "next/navigation";
import { useCart } from "@/store/cartStore";

function BuyNowButton({ p, selectedVariant, isVariable, baseUrl }) {
  const router = useRouter();
  const { addItem } = useCart();

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const v = isVariable ? selectedVariant : null;

    const price = isVariable
      ? (v?.sale_price ?? v?.regular_price)
      : (p?.sale_price ?? p?.regular_price);

    const oldPrice = isVariable
      ? (v?.regular_price && v?.sale_price ? v.regular_price : null)
      : (p?.regular_price && p?.sale_price ? p.regular_price : null);

    const image =
      (isVariable && v?.image_path
        ? `${baseUrl}/storage/${v.image_path}`
        : "") ||
      p?.featured_image_url ||
      "";

    addItem(
      {
        productId: p.id,
        variantId: v?.id ?? null,
        name: p.name,
        image,
        price,
        oldPrice,
        stock: isVariable ? v?.stock : p?.stock,
        attrs: isVariable ? v?.attributes || null : null,
      },
      1
    );

    // ✅ Redirect to checkout
    router.push("/checkout");
  };

  return (
    <button
      onClick={handleBuyNow}
      className="cursor-pointer mt-4 w-full rounded-md border-2 border-[#008159] text-[#008159] font-bold py-2.5 text-sm hover:bg-[#008159] hover:text-white inline-flex items-center justify-center"
    >
      অর্ডার করুন
    </button>
  );
}