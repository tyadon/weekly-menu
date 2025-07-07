export interface MealData {
  lunch: string;
  dinner: string;
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