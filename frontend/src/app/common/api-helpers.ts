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

function parseJwt(token: string): any {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

export function parseUsernameFromJwt(token: string): string {
  const payload = parseJwt(token);
  return payload.username;
}

export function isTokenExpired(token: string | null): boolean {
  if (token) {
  const authorisationJson = parseJwt(token);
  if(authorisationJson && authorisationJson.exp){
    const expiry = authorisationJson.exp;
    // Convert to Unix timestamp (seconds)
    const now = Math.floor(new Date().getTime() / 1000);
    return now >= expiry;
  }}

  return true;
}

export function formDataToJson(formData: FormData): { [key: string]: any } {
  return Object.fromEntries(formData.entries());
}
