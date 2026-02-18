export default function FloatingActions() {
  return (
    <div className="fixed right-4 bottom-20 z-50 flex flex-col gap-3">
      <button
        className="floating-btn bg-slate-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center relative"
        aria-label="Compare"
      >
        ⇄
        <span className="absolute -top-2 -right-2 text-[10px] bg-orange-500 text-white rounded-full px-1.5 py-0.5">
          0
        </span>
      </button>

      <button
        className="floating-btn bg-white text-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center relative"
        aria-label="Cart"
      >
        🛒
        <span className="absolute -top-2 -right-2 text-[10px] bg-orange-500 text-white rounded-full px-1.5 py-0.5">
          0
        </span>
      </button>
    </div>
  );
}
