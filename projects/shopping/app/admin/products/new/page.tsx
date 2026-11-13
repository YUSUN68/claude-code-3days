import { getCategories, getThemes } from "@/lib/catalog";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const [categories, themes] = await Promise.all([getCategories(), getThemes()]);
  return (
    <div>
      <h2 className="mb-6 text-lg font-medium">상품 등록</h2>
      <ProductForm categories={categories} themes={themes} />
    </div>
  );
}
