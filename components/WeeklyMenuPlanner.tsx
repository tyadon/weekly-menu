'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { WeeklyMenu, DayMenu, SaveStatus, Recipe, ShoppingList, ShoppingListItem, SavedRecipe } from '@/types/menu';
import RecipeManager from './RecipeManager';

// Helper function to get Monday of a week, given any date in that week
function getMondayOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

// Helper function to add weeks to a date
function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + (weeks * 7));
  return result;
}

// Helper function to format week range display
function formatWeekRange(mondayDate: Date): string {
  const sunday = addWeeks(mondayDate, 0);
  sunday.setDate(mondayDate.getDate() + 6);
  
  const startMonth = mondayDate.toLocaleDateString('en-US', { month: 'short' });
  const startDate = mondayDate.getDate();
  const endMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
  const endDate = sunday.getDate();
  const year = mondayDate.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDate}-${endDate}, ${year}`;
  } else {
    return `${startMonth} ${startDate} - ${endMonth} ${endDate}, ${year}`;
  }
}

// Generate shopping list from recipes
function generateShoppingList(menu: WeeklyMenu): ShoppingList {
  const ingredientMap = new Map<string, ShoppingListItem>();
  
  menu.days.forEach(day => {
    [day.meals.lunchRecipe, day.meals.dinnerRecipe].forEach(recipe => {
      if (recipe && recipe.ingredients) {
        const recipeName = recipe.title || `${day.dayName} meal`;
        
        // Parse ingredients (simple parsing - can be enhanced)
        const ingredientLines = recipe.ingredients.split('\n').filter(line => line.trim());
        
        ingredientLines.forEach(line => {
          const cleanLine = line.trim().replace(/^[•\-\*]/, '').trim();
          if (cleanLine) {
            const key = cleanLine.toLowerCase();
            
            if (ingredientMap.has(key)) {
              const item = ingredientMap.get(key)!;
              if (!item.recipes.includes(recipeName)) {
                item.recipes.push(recipeName);
              }
            } else {
              // Categorize ingredients (basic categorization)
              let category = 'Other';
              if (cleanLine.toLowerCase().includes('milk') || cleanLine.toLowerCase().includes('cheese') || cleanLine.toLowerCase().includes('yogurt')) {
                category = 'Dairy';
              } else if (cleanLine.toLowerCase().includes('chicken') || cleanLine.toLowerCase().includes('beef') || cleanLine.toLowerCase().includes('fish') || cleanLine.toLowerCase().includes('meat')) {
                category = 'Meat & Seafood';
              } else if (cleanLine.toLowerCase().includes('apple') || cleanLine.toLowerCase().includes('banana') || cleanLine.toLowerCase().includes('berry') || cleanLine.toLowerCase().includes('fruit')) {
                category = 'Fruits';
              } else if (cleanLine.toLowerCase().includes('lettuce') || cleanLine.toLowerCase().includes('tomato') || cleanLine.toLowerCase().includes('onion') || cleanLine.toLowerCase().includes('carrot') || cleanLine.toLowerCase().includes('vegetable')) {
                category = 'Vegetables';
              } else if (cleanLine.toLowerCase().includes('bread') || cleanLine.toLowerCase().includes('flour') || cleanLine.toLowerCase().includes('pasta') || cleanLine.toLowerCase().includes('rice')) {
                category = 'Grains & Bread';
              }
              
              ingredientMap.set(key, {
                ingredient: cleanLine,
                category,
                recipes: [recipeName]
              });
            }
          }
        });
      }
    });
  });
  
  return {
    weekStart: menu.weekStart,
    items: Array.from(ingredientMap.values()).sort((a, b) => 
      (a.category || 'Other').localeCompare(b.category || 'Other') || a.ingredient.localeCompare(b.ingredient)
    ),
    generatedAt: new Date().toISOString()
  };
}

// Load saved recipes from localStorage
function getSavedRecipes(): { lunch: SavedRecipe[], dinner: SavedRecipe[] } {
  if (typeof window === 'undefined') {
    return { lunch: [], dinner: [] };
  }

  const stored = localStorage.getItem('savedRecipes');
  if (stored) {
    const recipes: SavedRecipe[] = JSON.parse(stored);
    return {
      lunch: recipes.filter(r => r.type === 'lunch' || r.type === 'both'),
      dinner: recipes.filter(r => r.type === 'dinner' || r.type === 'both')
    };
  }
  
  return { lunch: [], dinner: [] };
}

interface QuickSuggestionsProps {
  mealType: 'lunch' | 'dinner';
  onSelect: (recipeTitle: string, fullRecipe?: Recipe) => void;
  onClose: () => void;
  onOpenRecipeManager: () => void;
  isVisible: boolean;
}

function QuickSuggestions({ mealType, onSelect, onClose, onOpenRecipeManager, isVisible }: QuickSuggestionsProps) {
  if (!isVisible) return null;

  const savedRecipes = getSavedRecipes();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-h-96 overflow-hidden w-full max-w-md mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Saved Recipes</h4>
                <p className="text-sm text-gray-500">{savedRecipes[mealType].length} {mealType} recipes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
                </div>
        
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-2">
            {savedRecipes[mealType].length > 0 ? (
              savedRecipes[mealType].map((recipe: SavedRecipe, index: number) => (
                <button
                  key={index}
                  onClick={() => {
                    const fullRecipe: Recipe = {
                      title: recipe.title,
                      ingredients: recipe.ingredients,
                      instructions: recipe.instructions,
                      cookingTime: recipe.cookingTime,
                      servings: recipe.servings,
                      category: recipe.category
                    };
                    onSelect(recipe.title, fullRecipe);
                    onClose();
                  }}
                  className="w-full text-left p-4 hover:bg-gray-50 rounded-2xl transition-all duration-200 group border border-transparent hover:border-gray-200 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold ${
                        recipe.category === 'salad' ? 'bg-green-100 text-green-700' :
                        recipe.category === 'wrap' ? 'bg-yellow-100 text-yellow-700' :
                        recipe.category === 'bowl' ? 'bg-purple-100 text-purple-700' :
                        recipe.category === 'pasta' ? 'bg-red-100 text-red-700' :
                        recipe.category === 'asian' ? 'bg-orange-100 text-orange-700' :
                        recipe.category === 'mexican' ? 'bg-pink-100 text-pink-700' :
                        recipe.category === 'seafood' ? 'bg-blue-100 text-blue-700' :
                        recipe.category === 'grill' ? 'bg-amber-100 text-amber-700' :
                        recipe.category === 'vegetarian' ? 'bg-lime-100 text-lime-700' :
                        recipe.category === 'soup' ? 'bg-cyan-100 text-cyan-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {recipe.title.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{recipe.title}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {recipe.cookingTime} • {recipe.servings} servings
                        </div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm mb-4">No saved {mealType} recipes yet</p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenRecipeManager();
                  }}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  Create your first recipe →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  shoppingList: ShoppingList;
}

function ShoppingListModal({ isOpen, onClose, shoppingList }: ShoppingListModalProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (ingredient: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(ingredient)) {
      newChecked.delete(ingredient);
    } else {
      newChecked.add(ingredient);
    }
    setCheckedItems(newChecked);
  };

  const exportList = () => {
    const text = shoppingList.items
      .map(item => `${item.ingredient} (${item.recipes.join(', ')})`)
      .join('\n');
    
    if (navigator.share) {
      navigator.share({
        title: 'Shopping List',
        text: text,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Shopping list copied to clipboard!');
    }
  };

  if (!isOpen) return null;

  const categories = Array.from(new Set(shoppingList.items.map(item => item.category || 'Other'))).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl mx-4 sm:mb-4 rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-all duration-300 ease-out animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Shopping List</h2>
              <p className="text-sm text-gray-600 mt-1">
                {shoppingList.items.length} items • Week of {formatWeekRange(new Date(shoppingList.weekStart))}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportList}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share or copy list"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {categories.map(category => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  category === 'Dairy' ? 'bg-yellow-400' :
                  category === 'Meat & Seafood' ? 'bg-red-400' :
                  category === 'Fruits' ? 'bg-orange-400' :
                  category === 'Vegetables' ? 'bg-green-400' :
                  category === 'Grains & Bread' ? 'bg-amber-400' :
                  'bg-gray-400'
                }`} />
                {category}
              </h3>
              <div className="space-y-2">
                {shoppingList.items
                  .filter(item => item.category === category)
                  .map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                        checkedItems.has(item.ingredient)
                          ? 'bg-green-50 border-green-200 opacity-75'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleItem(item.ingredient)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          checkedItems.has(item.ingredient)
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300'
                        }`}>
                          {checkedItems.has(item.ingredient) && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className={`font-medium ${checkedItems.has(item.ingredient) ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item.ingredient}
                          </div>
                          <div className="text-xs text-gray-500">
                            For: {item.recipes.join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {checkedItems.size} of {shoppingList.items.length} items checked
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



export default function WeeklyMenuPlanner() {
  const [menu, setMenu] = useState<WeeklyMenu | null>(null);
  const [saveStatuses, setSaveStatuses] = useState<Record<string, SaveStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, -1 = last week, +1 = next week

  const [shoppingListModal, setShoppingListModal] = useState<{
    isOpen: boolean;
    shoppingList?: ShoppingList;
  }>({ isOpen: false });
  const [recipeManagerOpen, setRecipeManagerOpen] = useState(false);
  
  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Get today's date string for highlighting
  const today = new Date().toISOString().split('T')[0];

  // Calculate the current week we're viewing
  const thisWeekMonday = getMondayOfWeek(new Date());
  const currentViewMonday = addWeeks(thisWeekMonday, weekOffset);
  const weekRangeText = formatWeekRange(currentViewMonday);
  const isCurrentWeek = weekOffset === 0;

  // Calculate completion stats
  const completionStats = menu ? {
    totalMeals: menu.days.length * 2, // lunch + dinner for each day
    plannedMeals: menu.days.reduce((acc, day) => {
      return acc + (day.meals.lunch.trim() ? 1 : 0) + (day.meals.dinner.trim() ? 1 : 0);
    }, 0),
    recipesAdded: menu.days.reduce((acc, day) => {
      return acc + (day.meals.lunchRecipe ? 1 : 0) + (day.meals.dinnerRecipe ? 1 : 0);
    }, 0)
  } : { totalMeals: 0, plannedMeals: 0, recipesAdded: 0 };

  // Load menu data when week changes
  useEffect(() => {
    loadMenu();
  }, [weekOffset]);

  const loadMenu = async () => {
    setIsLoading(true);
    try {
      const weekStartStr = currentViewMonday.toISOString().split('T')[0];
      const response = await fetch(`/api/menu?week=${weekStartStr}`);
      if (response.ok) {
        const menuData = await response.json();
        setMenu(menuData);
      } else {
        console.error('Failed to load menu');
      }
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMenu = useCallback(async (updatedMenu: WeeklyMenu) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMenu),
      });

      if (response.ok) {
        return true;
      } else {
        console.error('Failed to save menu');
        return false;
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      return false;
    }
  }, []);

  // Navigation handlers
  const navigateToPreviousWeek = useCallback(() => {
    setWeekOffset(prev => prev - 1);
  }, []);

  const navigateToNextWeek = useCallback(() => {
    setWeekOffset(prev => prev + 1);
  }, []);

  const navigateToCurrentWeek = useCallback(() => {
    setWeekOffset(0);
  }, []);

  // Shopping list handler
  const openShoppingList = useCallback(() => {
    if (menu) {
      const shoppingList = generateShoppingList(menu);
      setShoppingListModal({ isOpen: true, shoppingList });
    }
  }, [menu]);

  const closeShoppingList = useCallback(() => {
    setShoppingListModal({ isOpen: false });
  }, []);

  const updateMealWithRecipe = useCallback((dayDate: string, mealType: 'lunch' | 'dinner', recipe: Recipe) => {
    if (!menu) return;

    const recipeField = mealType === 'lunch' ? 'lunchRecipe' : 'dinnerRecipe';

    const updatedMenu = {
      ...menu,
      days: menu.days.map(day =>
        day.date === dayDate
          ? {
              ...day,
              meals: {
                ...day.meals,
                [recipeField]: recipe,
                // Set the meal text to the recipe title
                [mealType]: recipe.title || ''
              }
            }
          : day
      )
    };

    setMenu(updatedMenu);
    saveMenu(updatedMenu);
  }, [menu, saveMenu]);

  const updateMeal = useCallback((dayDate: string, mealType: 'lunch' | 'dinner', value: string) => {
    if (!menu) return;

    const updatedMenu = {
      ...menu,
      days: menu.days.map(day =>
        day.date === dayDate
          ? {
              ...day,
              meals: {
                ...day.meals,
                [mealType]: value
              }
            }
          : day
      )
    };

    setMenu(updatedMenu);

    // Set saving status
    const statusKey = `${dayDate}-${mealType}`;
    setSaveStatuses(prev => ({
      ...prev,
      [statusKey]: { status: 'saving' }
    }));

    // Clear any existing timeout for this field
    if (saveTimeoutRef.current[statusKey]) {
      clearTimeout(saveTimeoutRef.current[statusKey]);
    }

    // Debounce save operation
    saveTimeoutRef.current[statusKey] = setTimeout(async () => {
      const success = await saveMenu(updatedMenu);
      setSaveStatuses(prev => ({
        ...prev,
        [statusKey]: {
          status: success ? 'saved' : 'error',
          message: success ? 'Saved ✓' : 'Error saving'
        }
      }));

      // Clear status after 2 seconds
      setTimeout(() => {
        setSaveStatuses(prev => {
          const updated = { ...prev };
          delete updated[statusKey];
          return updated;
        });
      }, 2000);
    }, 1000); // 1 second debounce
  }, [menu, saveMenu]);



  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="relative mb-8">
          <div className="w-12 h-12 border-3 border-gray-200 rounded-full animate-spin border-t-emerald-500"></div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading your menu</h3>
          <p className="text-gray-500">Preparing your weekly meal plan...</p>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="flex items-center justify-center py-24 animate-fade-in">
        <div className="card max-w-md mx-auto p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Unable to load menu</h3>
          <p className="text-gray-600 mb-6">Something went wrong while loading your weekly menu.</p>
          <button 
            onClick={loadMenu}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Modern Week Navigation */}
      <div className="card p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Week Navigation */}
          <div className="flex items-center justify-between lg:justify-start lg:flex-1">
            <button
              onClick={navigateToPreviousWeek}
              className="btn-outline flex items-center space-x-2 text-sm py-2 px-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>

            <div className="text-center px-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {isCurrentWeek ? "This Week" : "Week Overview"}
              </h2>
              <p className="text-sm text-gray-600 font-medium">{weekRangeText}</p>
              {!isCurrentWeek && (
                <button
                  onClick={navigateToCurrentWeek}
                  className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Return to current week →
                </button>
              )}
            </div>

            <button
              onClick={navigateToNextWeek}
              className="btn-outline flex items-center space-x-2 text-sm py-2 px-4"
            >
              <span>Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Stats and Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{completionStats.plannedMeals}</div>
                <div className="text-xs text-gray-500">Meals Planned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{completionStats.recipesAdded}</div>
                <div className="text-xs text-gray-500">Recipes Added</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((completionStats.plannedMeals / completionStats.totalMeals) * 100)}%
                </div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setRecipeManagerOpen(true)}
                className="btn-secondary flex items-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Recipes</span>
              </button>
              <button
                onClick={openShoppingList}
                disabled={completionStats.recipesAdded === 0}
                className="btn-primary flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                </svg>
                <span>Shopping List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {menu.days.map((day, index) => (
          <DayCard
            key={day.date}
            day={day}
            isToday={day.date === today}
            onMealChange={updateMeal}
            onRecipeSelect={(dayDate, mealType, recipe) => updateMealWithRecipe(dayDate, mealType, recipe)}
            onOpenRecipeManager={() => setRecipeManagerOpen(true)}
            saveStatuses={saveStatuses}
            delay={index * 100}
          />
        ))}
      </div>

      {/* Shopping List Modal */}
      {shoppingListModal.shoppingList && (
        <ShoppingListModal
          isOpen={shoppingListModal.isOpen}
          onClose={closeShoppingList}
          shoppingList={shoppingListModal.shoppingList}
        />
      )}

      {/* Recipe Manager */}
      <RecipeManager
        isOpen={recipeManagerOpen}
        onClose={() => setRecipeManagerOpen(false)}
      />
    </div>
  );
}

interface DayCardProps {
  day: DayMenu;
  isToday: boolean;
  onMealChange: (dayDate: string, mealType: 'lunch' | 'dinner', value: string) => void;
  onRecipeSelect: (dayDate: string, mealType: 'lunch' | 'dinner', recipe: Recipe) => void;
  onOpenRecipeManager: () => void;
  saveStatuses: Record<string, SaveStatus>;
  delay: number;
}

function DayCard({ day, isToday, onMealChange, onRecipeSelect, onOpenRecipeManager, saveStatuses, delay }: DayCardProps) {
  const getSaveStatus = (mealType: 'lunch' | 'dinner') => {
    return saveStatuses[`${day.date}-${mealType}`];
  };

  const hasAnyMeals = day.meals.lunch.trim() || day.meals.dinner.trim();

  return (
    <div 
      className={`
        card card-hover p-6 relative overflow-hidden transition-all duration-300
        ${isToday 
          ? 'ring-2 ring-emerald-200 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50' 
          : hasAnyMeals 
            ? 'border-blue-100'
            : ''
        }
        animate-fade-in
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Status indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isToday 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
          : hasAnyMeals 
            ? 'bg-gradient-to-r from-blue-400 to-purple-400'
            : 'bg-gray-200'
      }`} />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-bold text-lg ${isToday ? 'text-emerald-800' : 'text-gray-900'}`}>
            {day.dayName}
          </h3>
          <div className="flex items-center space-x-2">
            {isToday && (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Today
              </div>
            )}
            {hasAnyMeals && !isToday && (
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                Planned
              </div>
            )}
          </div>
        </div>
        <p className={`text-sm font-medium ${isToday ? 'text-emerald-600' : 'text-gray-500'}`}>
          {day.displayDate}
        </p>
      </div>

      {/* Meals */}
      <div className="space-y-5">
        <MealInput
          label="Lunch"
          value={day.meals.lunch}
          onChange={(value) => onMealChange(day.date, 'lunch', value)}
          onRecipeSelect={(recipe) => onRecipeSelect(day.date, 'lunch', recipe)}
          onOpenRecipeManager={onOpenRecipeManager}
          saveStatus={getSaveStatus('lunch')}
          hasRecipe={!!day.meals.lunchRecipe}
          isToday={isToday}
          mealType="lunch"
        />
        
        <MealInput
          label="Dinner"
          value={day.meals.dinner}
          onChange={(value) => onMealChange(day.date, 'dinner', value)}
          onRecipeSelect={(recipe) => onRecipeSelect(day.date, 'dinner', recipe)}
          onOpenRecipeManager={onOpenRecipeManager}
          saveStatus={getSaveStatus('dinner')}
          hasRecipe={!!day.meals.dinnerRecipe}
          isToday={isToday}
          mealType="dinner"
        />
      </div>
    </div>
  );
}

interface MealInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onRecipeSelect?: (recipe: Recipe) => void;
  onOpenRecipeManager: () => void;
  saveStatus?: SaveStatus;
  hasRecipe?: boolean;
  isToday?: boolean;
  mealType: 'lunch' | 'dinner';
}

function MealInput({ label, value, onChange, onRecipeSelect, onOpenRecipeManager, saveStatus, hasRecipe, isToday, mealType }: MealInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSuggestionSelect = (recipeTitle: string, fullRecipe?: Recipe) => {
    onChange(recipeTitle);
    if (fullRecipe && onRecipeSelect) {
      onRecipeSelect(fullRecipe);
    }
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const closeSuggestions = () => {
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <label className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
          {!value.trim() && (
            <button
              onClick={() => setShowSuggestions(true)}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors px-2 py-1 rounded-lg hover:bg-emerald-50"
            >
              📚 Recipes
            </button>
          )}
        </div>
        {saveStatus && (
          <div className={`flex items-center space-x-1 text-xs font-medium ${
            saveStatus.status === 'saving' ? 'text-blue-500' :
            saveStatus.status === 'saved' ? 'text-emerald-600' :
            saveStatus.status === 'error' ? 'text-red-500' :
            'text-gray-500'
          }`}>
            {saveStatus.status === 'saving' && (
              <div className="animate-spin rounded-full h-3 w-3 border border-blue-500 border-t-transparent"></div>
            )}
            <span>
              {saveStatus.status === 'saving' ? 'Saving...' : saveStatus.message}
            </span>
          </div>
        )}
      </div>
      
      <div className="relative">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`input-field resize-none text-sm font-medium touch-manipulation transition-all duration-200
            ${isToday 
              ? 'border-emerald-200 focus:ring-emerald-500/20 focus:border-emerald-400 bg-emerald-50/30' 
              : 'hover:border-gray-300'
            }
            ${isFocused ? 'shadow-soft' : ''}
          `}
          rows={3}
          placeholder={`What's for ${label.toLowerCase()}?`}
        />
        
        {value.trim() && (
          <div className="absolute top-3 right-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" title="Planned" />
          </div>
        )}

        <QuickSuggestions
          mealType={mealType}
          onSelect={handleSuggestionSelect}
          onClose={closeSuggestions}
          onOpenRecipeManager={onOpenRecipeManager}
          isVisible={showSuggestions}
        />
      </div>
    </div>
  );
} 