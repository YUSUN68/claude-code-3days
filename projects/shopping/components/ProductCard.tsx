import Link from "next/link";
import type { Product } from "@/lib/types";
import Price from "./Price";

export default function ProductCard({ product }: { product: Product }) {
  const [first, second] = product.images;
  const soldOut = product.stock <= 0;
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-md bg-beige">
        {first && (
          <img
            src={first}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        )}
        {second && (
          <img
            src={second}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
          />
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-ivory/60">
            <span className="text-sm font-semibold tracking-[0.2em] text-ink/70">SOLD OUT</span>
          </div>
        )}
        {product.is_featured && !soldOut && (
          <span className="absolute left-2 top-2 rounded-sm bg-ivory/90 px-2 py-0.5 text-[11px] text-brown">BEST</span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="line-clamp-1 text-sm text-ink/90">{product.name}</p>
        <Price price={product.price} salePrice={product.sale_price} />
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
