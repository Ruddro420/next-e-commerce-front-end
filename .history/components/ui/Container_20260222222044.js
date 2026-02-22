export default function Container({ children, className = "" }) {
  return (
    <div className={`max-w-full mx-auto px-4 ${className}`}>{children}</div>
  );
}
