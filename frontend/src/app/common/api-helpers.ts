import { ProductModel } from "@app/models/product-model";

export function capitalizeFirst(s: string): string {
  if (!s) return '';
  const lower = s.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function normalizeProduct(p: ProductModel): ProductModel {
  return {
    ...p,
    name: p.name ? capitalizeFirst(p.name) : p.name,
    description: p.description ? capitalizeFirst(p.description) : p.description,
  };
}