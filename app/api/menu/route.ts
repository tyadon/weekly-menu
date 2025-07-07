import { NextRequest, NextResponse } from 'next/server';
import type { WeeklyMenu } from '@/types/menu';

// Fallback in-memory storage for local development
let memoryStore: WeeklyMenu | null = null;

const MENU_KEY = 'menu:current';

// Check if we're in development and KV variables are missing
const isDevelopment = process.env.NODE_ENV === 'development';
const hasKvVars = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

// Helper function to get the start of the current week (Monday)
function getCurrentWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Helper function to create an empty weekly menu
function createEmptyWeeklyMenu(): WeeklyMenu {
  const weekStart = getCurrentWeekStart();
  const days = [];
  
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    
    days.push({
      date: date.toISOString().split('T')[0],
      dayName: dayNames[i],
      displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
      meals: {
        lunch: '',
        dinner: ''
      }
    });
  }
  
  return {
    weekStart: weekStart.toISOString().split('T')[0],
    days
  };
}

// KV operations with fallback
async function getFromStorage(): Promise<WeeklyMenu | null> {
  if (isDevelopment && !hasKvVars) {
    // Use memory storage for local development
    return memoryStore;
  }
  
  try {
    const { kv } = await import('@vercel/kv');
    return await kv.get<WeeklyMenu>(MENU_KEY);
  } catch (error) {
    console.error('KV Error:', error);
    return null;
  }
}

async function setToStorage(menu: WeeklyMenu): Promise<boolean> {
  if (isDevelopment && !hasKvVars) {
    // Use memory storage for local development
    memoryStore = menu;
    return true;
  }
  
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set(MENU_KEY, menu);
    return true;
  } catch (error) {
    console.error('KV Error:', error);
    return false;
  }
}

export async function GET() {
  try {
    let menu = await getFromStorage();
    
    // If no menu exists or it's from a different week, create a new one
    if (!menu || menu.weekStart !== getCurrentWeekStart().toISOString().split('T')[0]) {
      menu = createEmptyWeeklyMenu();
      await setToStorage(menu);
    }
    
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const menu: WeeklyMenu = await request.json();
    
    // Validate the menu structure
    if (!menu.weekStart || !Array.isArray(menu.days) || menu.days.length !== 7) {
      return NextResponse.json(
        { error: 'Invalid menu structure' },
        { status: 400 }
      );
    }
    
    const success = await setToStorage(menu);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to save menu' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error saving menu:', error);
    return NextResponse.json(
      { error: 'Failed to save menu' },
      { status: 500 }
    );
  }
} 