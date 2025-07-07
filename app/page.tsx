import WeeklyMenuPlanner from '@/components/WeeklyMenuPlanner';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Polk Ave Weekly Meal Planner
          </h1>
        </header>
        <WeeklyMenuPlanner />
      </div>
    </main>
  );
} 