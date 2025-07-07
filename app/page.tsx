import WeeklyMenuPlanner from '@/components/WeeklyMenuPlanner';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Weekly Menu Planner
          </h1>
          <p className="text-gray-600">
            Plan your weekly meals and sync them across devices
          </p>
        </header>
        <WeeklyMenuPlanner />
      </div>
    </main>
  );
} 