export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  source_url?: string;
  source_name?: string;
  isFavourite?: boolean;
  detectedAllergens?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShoppingListItem {
  id: string;
  ingredient: string;
  quantity: string;
  recipe_ids: string[];
  checked: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
  created_at: string;
  updated_at: string;
}

export interface ScrapedRecipe {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  source_url?: string;
  source_name?: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  allergens: string[];
  intolerances: string[];
  dietaryPreferences: string[];
  theme: 'light' | 'dark';
}

export interface AllergenMatch {
  allergen: string;
  matchedIngredients: string[];
}