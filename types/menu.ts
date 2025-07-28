export interface Recipe {
  title?: string;
  ingredients: string;
  instructions: string;
  cookingTime?: string;
  category?: string;
  servings?: number;
}

export interface SavedRecipe {
  id: string;
  title: string;
  ingredients: string;
  instructions: string;
  cookingTime?: string;
  servings?: number;
  category: string;
  type: 'lunch' | 'dinner' | 'both';
  tags?: string[];
  createdAt: string;
  lastUsed?: string;
  prepTime?: string; // For display in suggestions
}

export interface MealData {
  lunch: string;
  dinner: string;
  lunchRecipe?: Recipe;
  dinnerRecipe?: Recipe;
}

export interface DayMenu {
  date: string; // ISO date string (YYYY-MM-DD)
  dayName: string; // e.g., "Monday"
  displayDate: string; // e.g., "7/8"
  meals: MealData;
}

export interface WeeklyMenu {
  weekStart: string; // ISO date string of Monday
  days: DayMenu[];
}

export interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
}

export interface ShoppingListItem {
  ingredient: string;
  category?: string;
  recipes: string[];
}

export interface ShoppingList {
  weekStart: string;
  items: ShoppingListItem[];
  generatedAt: string;
} 