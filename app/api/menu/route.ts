import { NextRequest, NextResponse } from 'next/server';
import type { WeeklyMenu } from '@/types/menu';

// Fallback in-memory storage for local development
let memoryStore: Record<string, WeeklyMenu> = {};

// Check if we're in development and KV variables are missing
const isDevelopment = process.env.NODE_ENV === 'development';
const hasKvVars = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

// Helper function to get Monday of a week, given any date in that week
function getMondayOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

// Helper function to create an empty weekly menu for a specific Monday
function createEmptyWeeklyMenu(mondayDate: Date): WeeklyMenu {
  const days = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  for (let i = 0; i < 7; i++) {
    // Create date by adding days to the Monday date more explicitly
    const date = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + i);
    
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
    weekStart: mondayDate.toISOString().split('T')[0],
    days
  };
}

// KV operations with fallback
async function getFromStorage(weekKey: string): Promise<WeeklyMenu | null> {
  if (isDevelopment && !hasKvVars) {
    return memoryStore[weekKey] || null;
  }
  
  try {
    const { kv } = await import('@vercel/kv');
    return await kv.get<WeeklyMenu>(weekKey);
  } catch (error) {
    console.error('KV Error:', error);
    return null;
  }
}

async function setToStorage(weekKey: string, menu: WeeklyMenu): Promise<boolean> {
  if (isDevelopment && !hasKvVars) {
    memoryStore[weekKey] = menu;
    return true;
  }
  
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set(weekKey, menu);
    return true;
  } catch (error) {
    console.error('KV Error:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get('week');
    
    let mondayDate: Date;
    
    if (weekParam) {
      // Frontend is sending us the Monday date directly, parse it carefully
      const [year, month, day] = weekParam.split('-').map(Number);
      mondayDate = new Date(year, month - 1, day); // month is 0-indexed
      mondayDate.setHours(0, 0, 0, 0);
    } else {
      // No week specified, calculate current week's Monday
      mondayDate = getMondayOfWeek(new Date());
    }
    
    const weekKey = `menu:${mondayDate.toISOString().split('T')[0]}`;
    
    let menu = await getFromStorage(weekKey);
    
    // If no menu exists for this week, create a new one
    if (!menu) {
      menu = createEmptyWeeklyMenu(mondayDate);
      await setToStorage(weekKey, menu);
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
    
    const weekKey = `menu:${menu.weekStart}`;
    const success = await setToStorage(weekKey, menu);
    
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