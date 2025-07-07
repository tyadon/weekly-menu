'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { WeeklyMenu, DayMenu, SaveStatus } from '@/types/menu';

export default function WeeklyMenuPlanner() {
  const [menu, setMenu] = useState<WeeklyMenu | null>(null);
  const [saveStatuses, setSaveStatuses] = useState<Record<string, SaveStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Get today's date string for highlighting
  const today = new Date().toISOString().split('T')[0];

  // Load menu data on initial render
  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await fetch('/api/menu');
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <div className="ml-3 text-gray-600 font-medium">Loading your menu...</div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 font-medium text-lg">Failed to load menu</div>
          <button 
            onClick={loadMenu}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate completion percentage
  const totalMeals = menu.days.length * 2; // lunch + dinner for each day
  const completedMeals = menu.days.reduce((count, day) => {
    return count + (day.meals.lunch ? 1 : 0) + (day.meals.dinner ? 1 : 0);
  }, 0);
  const completionPercentage = Math.round((completedMeals / totalMeals) * 100);

  return (
    <div className="space-y-6">
      {/* Week Summary Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">This Week's Menu</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {completedMeals}/{totalMeals} meals planned
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {completionPercentage}% Complete
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menu.days.map((day) => (
          <DayCard
            key={day.date}
            day={day}
            isToday={day.date === today}
            onMealChange={updateMeal}
            saveStatuses={saveStatuses}
          />
        ))}
      </div>
    </div>
  );
}

interface DayCardProps {
  day: DayMenu;
  isToday: boolean;
  onMealChange: (dayDate: string, mealType: 'lunch' | 'dinner', value: string) => void;
  saveStatuses: Record<string, SaveStatus>;
}

function DayCard({ day, isToday, onMealChange, saveStatuses }: DayCardProps) {
  const getSaveStatus = (mealType: 'lunch' | 'dinner') => {
    return saveStatuses[`${day.date}-${mealType}`];
  };

  const mealsCompleted = (day.meals.lunch ? 1 : 0) + (day.meals.dinner ? 1 : 0);
  const progressPercentage = (mealsCompleted / 2) * 100;

  return (
    <div className={`
      bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-md
      ${isToday 
        ? 'border-green-300 bg-green-50 ring-2 ring-green-200' 
        : 'border-gray-200 hover:border-gray-300'
      }
    `}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-bold text-xl ${isToday ? 'text-green-800' : 'text-gray-900'}`}>
            {day.dayName}
          </h3>
          {isToday && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Today
            </div>
          )}
        </div>
        <p className={`text-sm font-medium ${isToday ? 'text-green-600' : 'text-gray-500'}`}>
          {day.displayDate}
        </p>
        
        {/* Day Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">{mealsCompleted}/2 meals</span>
            <span className="text-xs text-gray-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isToday ? 'bg-green-500' : 'bg-amber-400'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-5">
        <MealInput
          label="Lunch"
          value={day.meals.lunch}
          onChange={(value) => onMealChange(day.date, 'lunch', value)}
          saveStatus={getSaveStatus('lunch')}
          isToday={isToday}
        />
        
        <MealInput
          label="Dinner"
          value={day.meals.dinner}
          onChange={(value) => onMealChange(day.date, 'dinner', value)}
          saveStatus={getSaveStatus('dinner')}
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
  saveStatus?: SaveStatus;
  isToday?: boolean;
}

function MealInput({ label, value, onChange, saveStatus, isToday }: MealInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
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
        className={`w-full p-3 border rounded-xl resize-none transition-all duration-200 text-sm
          ${isToday 
            ? 'border-green-200 focus:ring-2 focus:ring-green-300 focus:border-green-400 bg-green-50/50' 
            : 'border-gray-200 focus:ring-2 focus:ring-amber-200 focus:border-amber-300'
          }
          placeholder-gray-400 focus:outline-none
        `}
        rows={3}
        placeholder={`What's for ${label.toLowerCase()}?`}
      />
    </div>
  );
} 