/** FSSAI-style veg / non-veg mark: a square outline with a filled dot. */
export default function VegMark({ isVeg, size = 16 }: { isVeg: boolean; size?: number }) {
  const color = isVeg ? "#138808" : "#7B3F00";
  return (
    <span
      role="img"
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
      className="inline-flex items-center justify-center bg-white shrink-0"
      style={{ width: size, height: size, border: `1.5px solid ${color}`, borderRadius: 2 }}
    >
      <span style={{ width: size * 0.45, height: size * 0.45, borderRadius: 9999, background: color }} />
    </span>
  );
}
