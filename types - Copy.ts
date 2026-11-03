/**
 * TYPESCRIPT TYPES
 * These act as a blueprint for your data. They tell the editor exactly what 
 * properties an object should have, allowing for intelligent autocomplete 
 * and preventing typos across your app.
 * 
 * KEYWORDS TO SEARCH: "TypeScript Basics", "TypeScript Type Aliases"
 */

// A Type Alias restricting the Language variable to ONLY be "en" or "ar"
export type Language = "en" | "ar";

// An interface defining an object that holds translations
export interface LocalizedText {
  en?: string;
  ar?: string;
}

export interface Category {
  id: string;
  order: number;
  name: LocalizedText;
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
