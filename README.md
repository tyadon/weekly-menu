# Weekly Menu Planner

A full-stack weekly menu planner app built with Next.js, TailwindCSS, and Vercel KV for persistent shared storage.

## Features

- 📅 **7-day weekly view** starting from Monday
- ✏️ **Editable meal planning** for lunch and dinner
- 🔄 **Auto-save functionality** with debounced API calls
- ✅ **Save status indicators** (Saving... / Saved ✓)
- 🎯 **Today highlighting** with visual emphasis
- 📱 **Mobile responsive** design
- 🔗 **Shareable** - no login required, anyone with the link can edit

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Vercel KV (Redis)
- **Deployment**: Vercel

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Vercel KV Database

1. Create a new project on [Vercel](https://vercel.com)
2. Go to your project dashboard
3. Navigate to the "Storage" tab
4. Create a new KV database
5. Copy the environment variables to your local `.env.local` file

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
KV_REST_API_URL=your_kv_rest_api_url_here
KV_REST_API_TOKEN=your_kv_rest_api_token_here
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token_here
KV_URL=your_kv_url_here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add a KV database to your Vercel project
4. Deploy! The environment variables will be automatically configured.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## How It Works

### Backend API

- **GET `/api/menu`**: Retrieves the current week's menu or creates a new empty menu
- **POST `/api/menu`**: Updates the stored menu with new meal data

### Frontend Features

- **Week Calculation**: Automatically calculates the current week starting from Monday
- **Auto-save**: Debounced saving (1 second delay) to prevent excessive API calls
- **Real-time Status**: Shows "Saving..." and "Saved ✓" indicators for each input field
- **Responsive Grid**: Adapts to different screen sizes (1-4 columns)
- **Today Highlighting**: Current day gets a blue accent and background

### Data Structure

```typescript
interface WeeklyMenu {
  weekStart: string; // ISO date string of Monday
  days: DayMenu[];
}

interface DayMenu {
  date: string; // ISO date string (YYYY-MM-DD)
  dayName: string; // e.g., "Monday"
  displayDate: string; // e.g., "7/8"
  meals: {
    lunch: string;
    dinner: string;
  };
}
```

## Customization

### Styling
- Modify `app/globals.css` for global styles
- Update TailwindCSS classes in components for visual changes

### Functionality
- Extend the `MealData` interface to add more meal types (breakfast, snacks)
- Modify the API routes to add additional features like meal categories or nutrition info

## License

MIT License - feel free to use this project for personal or commercial purposes. 