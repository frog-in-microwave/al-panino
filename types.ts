/**
 * TypeScript Types for Al Panino Snack Menu
 */

export type Language = "en" | "ar";

export interface LocalizedText {
  en?: string;
  ar?: string;
}

export interface Category {
  id: string;
  order: number;
  name: LocalizedText;
  icon?: string;
}

export interface Product {
  id: string;
  categoryId: string;
  order: number;
  name: LocalizedText;
  price: string;
  description?: LocalizedText;
  image: string;
  isAvailable: boolean;
}

export interface BranchInfo {
  id: string;
  name: LocalizedText;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  address: LocalizedText;
  mapEmbedUrl: string;
}
