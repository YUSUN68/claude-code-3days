export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

export type Product = {
  id: number;
  category_id: number;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  price: number;
  sale_price: number | null;
  final_price: number;
  stock: number;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  // 상세페이지 정보
  detail_images: string[];
  highlights: string[];
  size_info: string | null;
  material: string | null;
  components: string | null;
  care_info: string | null;
};

export type GiftTheme = {
  id: number;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  emoji: string | null;
  sort_order: number;
};

export type Profile = {
  id: string;
  name: string | null;
  phone: string | null;
  zipcode: string | null;
  address1: string | null;
  address2: string | null;
  role: "customer" | "admin";
  created_at: string;
};

export type OrderStatus = "pending" | "paid" | "shipping" | "delivered" | "cancelled";

export type Order = {
  id: string;
  order_no: string;
  user_id: string;
  status: OrderStatus;
  order_name: string;
  items_amount: number;
  shipping_fee: number;
  total_amount: number;
  recipient: string;
  phone: string;
  zipcode: string;
  address1: string;
  address2: string | null;
  memo: string | null;
  payment_key: string | null;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: string;
  product_id: number | null;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
};
