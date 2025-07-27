'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { WeeklyMenu, DayMenu, SaveStatus, Recipe } from '@/types/menu';

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

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  onDelete: () => void;
  recipe?: Recipe;
  mealType: 'lunch' | 'dinner';
  dayName: string;
}

function RecipeModal({ isOpen, onClose, onSave, onDelete, recipe, mealType, dayName }: RecipeModalProps) {
  const [title, setTitle] = useState(recipe?.title || '');
  const [ingredients, setIngredients] = useState(recipe?.ingredients || '');
  const [instructions, setInstructions] = useState(recipe?.instructions || '');

  useEffect(() => {
    if (isOpen) {
      setTitle(recipe?.title || '');
      setIngredients(recipe?.ingredients || '');
      setInstructions(recipe?.instructions || '');
    }
  }, [isOpen, recipe]);

  const handleSave = () => {
    if (!ingredients.trim() || !instructions.trim()) {
      return; // Don't save if required fields are empty
    }
    
    onSave({
      title: title.trim() || undefined,
      ingredients: ingredients.trim(),
      instructions: instructions.trim(),
    });
  };

  const handleDelete = () => {
    onDelete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-2xl mx-4 mb-4 rounded-t-3xl shadow-2xl transform transition-all duration-300 ease-out animate-slide-up"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {recipe ? 'Edit Recipe' : 'Add Recipe'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {dayName} • {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recipe Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all duration-200"
                placeholder="Enter a recipe title..."
              />
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ingredients <span className="text-red-500">*</span>
              </label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all duration-200 resize-none"
                rows={5}
                placeholder="List your ingredients here..."
                required
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all duration-200 resize-none"
                rows={6}
                placeholder="Write the cooking instructions..."
                required
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
          <div>
            {recipe && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
              >
                Delete Recipe
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!ingredients.trim() || !instructions.trim()}
              className="px-6 py-2 bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Save Recipe
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
  const [recipeModal, setRecipeModal] = useState<{
    isOpen: boolean;
    dayDate: string;
    mealType: 'lunch' | 'dinner';
    recipe?: Recipe;
  }>({
    isOpen: false,
    dayDate: '',
    mealType: 'lunch'
  });
  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Get today's date string for highlighting
  const today = new Date().toISOString().split('T')[0];

  // Calculate the current week we're viewing
  const thisWeekMonday = getMondayOfWeek(new Date());
  const currentViewMonday = addWeeks(thisWeekMonday, weekOffset);
  const weekRangeText = formatWeekRange(currentViewMonday);
  const isCurrentWeek = weekOffset === 0;

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

  // Recipe handling functions
  const openRecipeModal = useCallback((dayDate: string, mealType: 'lunch' | 'dinner') => {
    if (!menu) return;
    
    const day = menu.days.find(d => d.date === dayDate);
    const recipe = mealType === 'lunch' ? day?.meals.lunchRecipe : day?.meals.dinnerRecipe;
    
    setRecipeModal({
      isOpen: true,
      dayDate,
      mealType,
      recipe
    });
  }, [menu]);

  const closeRecipeModal = useCallback(() => {
    setRecipeModal({
      isOpen: false,
      dayDate: '',
      mealType: 'lunch'
    });
  }, []);

  const saveRecipe = useCallback(async (recipe: Recipe) => {
    if (!menu) return;

    const { dayDate, mealType } = recipeModal;
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
                // If recipe has a title, set it as the meal description
                ...(recipe.title && { [mealType]: recipe.title })
              }
            }
          : day
      )
    };

    setMenu(updatedMenu);
    closeRecipeModal();

    // Save to backend
    await saveMenu(updatedMenu);
  }, [menu, recipeModal, saveMenu, closeRecipeModal]);

  const deleteRecipe = useCallback(async () => {
    if (!menu) return;

    const { dayDate, mealType } = recipeModal;
    const recipeField = mealType === 'lunch' ? 'lunchRecipe' : 'dinnerRecipe';

    const updatedMenu = {
      ...menu,
      days: menu.days.map(day =>
        day.date === dayDate
          ? {
              ...day,
              meals: {
                ...day.meals,
                [recipeField]: undefined
              }
            }
          : day
      )
    };

    setMenu(updatedMenu);
    closeRecipeModal();

    // Save to backend
    await saveMenu(updatedMenu);
  }, [menu, recipeModal, saveMenu, closeRecipeModal]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/30 rounded-full animate-spin border-t-white"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full border-t-orange-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <div className="mt-6 text-white/90 font-medium text-lg text-shadow">Preparing your menu...</div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="flex items-center justify-center py-16 animate-fade-in">
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-3xl p-8 text-center shadow-xl max-w-sm mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-gray-900 font-semibold text-lg mb-2">Unable to load menu</div>
          <p className="text-gray-600 mb-6">Something went wrong while loading your weekly menu.</p>
          <button 
            onClick={loadMenu}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-semibold rounded-2xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Week Navigation */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-xl border border-white/20 max-w-2xl mx-auto animate-slide-up">
        <div className="flex items-center justify-between">
          {/* Previous Week */}
          <button
            onClick={navigateToPreviousWeek}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-sm sm:text-base">Previous</span>
          </button>

          {/* Current Week Display */}
          <div className="text-center px-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {isCurrentWeek ? "This Week" : "Weekly Menu"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">{weekRangeText}</p>
          </div>

          {/* Next Week */}
          <button
            onClick={navigateToNextWeek}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <span className="font-medium text-sm sm:text-base">Next</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekly Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0 animate-slide-up">
        {menu.days.map((day, index) => (
          <DayCard
            key={day.date}
            day={day}
            isToday={day.date === today}
            onMealChange={updateMeal}
            onRecipeClick={openRecipeModal}
            saveStatuses={saveStatuses}
            delay={index * 100}
          />
        ))}
      </div>

      {/* Recipe Modal */}
      <RecipeModal
        isOpen={recipeModal.isOpen}
        onClose={closeRecipeModal}
        onSave={saveRecipe}
        onDelete={deleteRecipe}
        recipe={recipeModal.recipe}
        mealType={recipeModal.mealType}
        dayName={menu.days.find(d => d.date === recipeModal.dayDate)?.dayName || ''}
      />
    </div>
  );
}

interface DayCardProps {
  day: DayMenu;
  isToday: boolean;
  onMealChange: (dayDate: string, mealType: 'lunch' | 'dinner', value: string) => void;
  onRecipeClick: (dayDate: string, mealType: 'lunch' | 'dinner') => void;
  saveStatuses: Record<string, SaveStatus>;
  delay: number;
}

function DayCard({ day, isToday, onMealChange, onRecipeClick, saveStatuses, delay }: DayCardProps) {
  const getSaveStatus = (mealType: 'lunch' | 'dinner') => {
    return saveStatuses[`${day.date}-${mealType}`];
  };

  return (
    <div 
      className={`
        bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02]
        ${isToday 
          ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50 ring-2 ring-orange-200' 
          : 'border-white/20 hover:border-orange-200'
        }
        animate-fade-in
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-bold text-lg sm:text-xl ${isToday ? 'text-orange-800' : 'text-gray-900'}`}>
            {day.dayName}
          </h3>
          {isToday && (
            <div className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
              Today
            </div>
          )}
        </div>
        <p className={`text-xs sm:text-sm font-medium ${isToday ? 'text-orange-600' : 'text-gray-500'}`}>
          {day.displayDate}
        </p>
      </div>

      {/* Meals */}
      <div className="space-y-4 sm:space-y-5">
        <MealInput
          label="Lunch"
          value={day.meals.lunch}
          onChange={(value) => onMealChange(day.date, 'lunch', value)}
          onRecipeClick={() => onRecipeClick(day.date, 'lunch')}
          saveStatus={getSaveStatus('lunch')}
          hasRecipe={!!day.meals.lunchRecipe}
          isToday={isToday}
        />
        
        <MealInput
          label="Dinner"
          value={day.meals.dinner}
          onChange={(value) => onMealChange(day.date, 'dinner', value)}
          onRecipeClick={() => onRecipeClick(day.date, 'dinner')}
          saveStatus={getSaveStatus('dinner')}
          hasRecipe={!!day.meals.dinnerRecipe}
          isToday={isToday}
        />
      </div>
    </div>
  );
}

interface MealInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onRecipeClick: () => void;
  saveStatus?: SaveStatus;
  hasRecipe?: boolean;
  isToday?: boolean;
}

function MealInput({ label, value, onChange, onRecipeClick, saveStatus, hasRecipe, isToday }: MealInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center space-x-2">
          <label className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
          <button
            onClick={onRecipeClick}
            className={`p-1 rounded-lg transition-all duration-200 hover:scale-110 ${
              hasRecipe 
                ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
            title={hasRecipe ? 'Edit recipe' : 'Add recipe'}
          >
            {hasRecipe ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
          </button>
        </div>
        {saveStatus && (
          <div className={`flex items-center space-x-1 text-xs font-medium ${
            saveStatus.status === 'saving' ? 'text-orange-500' :
            saveStatus.status === 'saved' ? 'text-green-600' :
            saveStatus.status === 'error' ? 'text-red-500' :
            'text-gray-500'
          }`}>
            {saveStatus.status === 'saving' && (
              <div className="animate-spin rounded-full h-3 w-3 border border-orange-500 border-t-transparent"></div>
            )}
            <span>
              {saveStatus.status === 'saving' ? 'Saving...' : saveStatus.message}
            </span>
          </div>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-3 sm:p-4 border rounded-xl sm:rounded-2xl resize-none transition-all duration-200 text-sm font-medium touch-manipulation
          ${isToday 
            ? 'border-orange-200 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-orange-50/50' 
            : 'border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-300 bg-white/80'
          }
          placeholder-gray-400 focus:outline-none hover:border-orange-200
        `}
        rows={3}
        placeholder={`What's for ${label.toLowerCase()}?`}
      />
    </div>
  );
} 