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

export function parseUsernameFromJwt(token: string): string {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload).username;
}