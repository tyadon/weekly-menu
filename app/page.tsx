import WeeklyMenuPlanner from '@/components/WeeklyMenuPlanner';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header with location */}
      <div className="relative">
        <div className="px-4 pt-8 sm:pt-12 pb-4 sm:pb-6 lg:px-8">
          <div className="max-w-md mx-auto">
            {/* Status bar spacer for mobile */}
            <div className="h-4 sm:h-6"></div>

            {/* Location selector */}
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <button className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors group focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg px-2 py-1 touch-manipulation">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium text-shadow text-sm sm:text-base">Your Kitchen</span>
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
          <WeeklyMenuPlanner />
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-8 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-8 w-48 h-48 bg-orange-300/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
    </main>
  );
} 