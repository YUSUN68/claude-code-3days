import { ORDER_STATUS_LABEL } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";

const STYLE: Record<OrderStatus, string> = {
  pending: "bg-line text-muted",
  paid: "bg-brown/10 text-brown",
  shipping: "bg-[#e6eee4] text-[#4f6b48]",
  delivered: "bg-ink/5 text-ink",
  cancelled: "bg-terracotta/10 text-terracotta",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLE[status]}`}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
