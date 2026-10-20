export default function BrandMark({ size = "md" }) {
  const sizes = {
    sm: "h-11 w-11 text-xl",
    md: "h-14 w-14 text-2xl",
    lg: "h-20 w-20 text-3xl",
  };

  return (
    <img
      src="/image/project.jpg"
      alt="GOSAWA globe logo"
      className={`${sizes[size] || sizes.md} rounded-xl object-cover object-top shadow-lg`}
    />
  );
}
