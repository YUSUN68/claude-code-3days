import { discountRate, won } from "@/lib/format";

export default function Price({
  price,
  salePrice,
  size = "sm",
}: {
  price: number;
  salePrice: number | null;
  size?: "sm" | "lg";
}) {
  const rate = discountRate(price, salePrice);
  const big = size === "lg";
  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 ${big ? "text-2xl" : "text-sm"}`}>
      {rate > 0 && <span className="font-semibold text-terracotta">{rate}%</span>}
      <span className="font-semibold">{won(salePrice ?? price)}</span>
      {rate > 0 && (
        <span className={`text-muted line-through ${big ? "text-base" : "text-xs"}`}>{won(price)}</span>
      )}
    </div>
  );
}
