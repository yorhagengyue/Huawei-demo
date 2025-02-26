import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-primary py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            SingaReport
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Report urban issues, track progress, and improve your community
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/report/new" 
              className="bg-white text-primary hover:bg-white/90 font-semibold px-6 py-3 rounded-lg text-lg transition-all"
            >
              Report an Issue
            </Link>
            <Link 
              href="/map" 
              className="bg-primary-foreground/10 text-white border border-white/30 hover:bg-primary-foreground/20 font-semibold px-6 py-3 rounded-lg text-lg transition-all"
            >
              View Active Reports
            </Link>
          </div>
        </div>
      </section>

      {/* Real-time Hotspot Map Preview */}
      <section className="w-full py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Real-time Issue Hotspots
          </h2>
          <div className="bg-white shadow-lg rounded-xl overflow-hidden h-[400px] relative">
            {/* Placeholder for map - would be replaced with actual map component */}
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500 text-lg">Interactive Map Loading...</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link 
              href="/map" 
              className="text-primary hover:text-primary/80 font-medium"
            >
              Explore the full map →
            </Link>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="w-full py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Report by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/report/new?category=${category.id}`}
                className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 text-center transition-all group"
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="w-full py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Success Stories
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {successStories.map((story) => (
              <div key={story.id} className="bg-white rounded-xl overflow-hidden shadow-md">
                <div className="h-48 relative">
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">Image Placeholder</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{story.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{story.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{story.location}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Resolved in {story.resolvedDays} days
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login/Register CTA */}
      <section className="w-full py-12 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Join SingaReport Community
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Create an account to track your reports, receive updates, and contribute to making Singapore better.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/login" 
              className="bg-white text-primary border border-primary hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="bg-primary text-white hover:bg-primary/90 font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// Sample data for the page
const categories = [
  { id: 'roads', name: 'Road Issues', icon: '🛣️', description: 'Potholes, roadblocks, traffic lights' },
  { id: 'cleanliness', name: 'Cleanliness', icon: '🧹', description: 'Littering, public cleaning' },
  { id: 'facilities', name: 'Public Facilities', icon: '🏛️', description: 'Damaged facilities, maintenance' },
  { id: 'safety', name: 'Safety Concerns', icon: '⚠️', description: 'Hazards, dangerous conditions' },
  { id: 'environment', name: 'Environment', icon: '🌳', description: 'Parks, green spaces, trees' },
  { id: 'noise', name: 'Noise Issues', icon: '🔊', description: 'Noise pollution, disturbances' },
  { id: 'construction', name: 'Construction', icon: '🏗️', description: 'Construction sites, violations' },
  { id: 'others', name: 'Others', icon: '📋', description: 'Other urban issues' },
];

const successStories = [
  {
    id: 1,
    title: 'Pothole Repair on Orchard Road',
    description: 'A dangerous pothole was reported and repaired within days, preventing potential accidents.',
    location: 'Orchard Road',
    resolvedDays: 3
  },
  {
    id: 2,
    title: 'Streetlight Restoration at Tampines',
    description: 'Dark pathway was illuminated after community reporting, improving neighborhood safety.',
    location: 'Tampines Ave 5',
    resolvedDays: 2
  },
  {
    id: 3,
    title: 'Playground Maintenance',
    description: 'Damaged playground equipment was fixed after being reported by concerned parents.',
    location: 'Bishan Park',
    resolvedDays: 5
  }
]; 