export default function BrandMark({ size = "md" }) {
  const sizes = {
    sm: "h-11 w-11 text-xl",
    md: "h-14 w-14 text-2xl",
    lg: "h-20 w-20 text-3xl",
  };

  return (
    <div
      className={`${sizes[size] || sizes.md} flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 font-black text-white shadow-lg`}
      aria-hidden="true"
    >
      G
    </div>
  );
}
