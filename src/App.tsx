import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateInitialVenues, FALLBACK_VENUES } from './services/ai';
import { Venue, VenueCategory } from './types';
import { LeaderboardItem } from './components/LeaderboardItem';
import { Activity, Leaf, RefreshCw, Cpu } from 'lucide-react';
import { cn } from './lib/utils';

const CATEGORIES: ('All' | VenueCategory)[] = ['All', 'Restaurant', 'Cafe', 'Resort', 'Hotel'];

export default function App() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'All' | VenueCategory>('All');
  const [isLive, setIsLive] = useState(true);
  const latestVenues = useRef(venues);
  
  useEffect(() => {
    latestVenues.current = venues;
  }, [venues]);

  const loadVenues = async () => {
    setIsLoading(true);
    try {
      const generated = await generateInitialVenues();
      if (generated && generated.length > 0) {
        setVenues(generated);
      } else {
        setVenues(FALLBACK_VENUES);
      }
    } catch (e) {
      console.error(e);
      setVenues(FALLBACK_VENUES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  // Live simulation effect
  useEffect(() => {
    if (!isLive || isLoading || venues.length === 0) return;

    const interval = setInterval(() => {
      // Pick 2-4 random venues to update their scores
      const numToUpdate = Math.floor(Math.random() * 3) + 2;
      const updatedVenues = [...latestVenues.current];
      
      for (let i = 0; i < numToUpdate; i++) {
        const randomIndex = Math.floor(Math.random() * updatedVenues.length);
        const venue = updatedVenues[randomIndex];
        
        // Randomly add 1 to 15 new reviews (popularity strictly increases)
        const change = Math.floor(Math.random() * 15) + 1;
        
        // Sometimes slightly tweak the rating
        let newRating = venue.rating;
        if (Math.random() > 0.7) {
            newRating += (Math.random() * 0.04) - 0.02; // fluctuate by up to +/- 0.02
            newRating = Math.max(1, Math.min(5, newRating)); // clamp between 1.0 and 5.0
        }
        
        updatedVenues[randomIndex] = {
          ...venue,
          rating: newRating,
          popularity: venue.popularity + change,
          change: change
        };
      }
      
      // Re-sort array
      updatedVenues.sort((a, b) => b.popularity - a.popularity);
      setVenues(updatedVenues);
      
    }, 2500); // Pulse every 2.5s

    return () => clearInterval(interval);
  }, [isLive, isLoading, venues.length]);

  const filteredVenues = venues.filter(v => 
    activeCategory === 'All' ? true : v.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-brand-500/30">
      
      {/* Background ambient light */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="relative max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-zinc-800/50 pb-8">
          <div>
            <div className="flex items-center gap-3 text-brand-400 mb-2 font-mono text-sm uppercase tracking-widest font-semibold">
              <Leaf className="w-4 h-4" />
              Vegana Live Network
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">Pure Veg</span> Ranking
            </h1>
            <p className="mt-2 text-zinc-400 text-lg">
              Real-time monitoring of popularity & ratings worldwide.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-full p-1.5 backdrop-blur-md">
            <button
              onClick={() => loadVenues()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 text-zinc-300 transition-colors disabled:opacity-50"
            >
              <Cpu className={cn("w-4 h-4", isLoading && "animate-spin text-brand-400")} />
              {isLoading ? "Generating..." : "AI Sync"}
            </button>
            <div className="w-px h-6 bg-zinc-800" />
            <button
              onClick={() => setIsLive(!isLive)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                isLive 
                  ? "bg-brand-500/10 text-brand-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]" 
                  : "hover:bg-zinc-800 text-zinc-400"
              )}
            >
              <Activity className={cn("w-4 h-4", isLive && "animate-pulse")} />
              Live Simulation {isLive ? "On" : "Off"}
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                activeCategory === category
                  ? "bg-zinc-100 text-zinc-900 shadow-md"
                  : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800/50"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Leaderboard List */}
        <div className="relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-zinc-500 gap-4">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
              <p className="animate-pulse">Scouring the globe for the best vegan spots...</p>
            </div>
          ) : (
            <div className="space-y-4 relative">
              {/* Header Row */}
              <div className="flex items-center px-4 py-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                <div className="w-12 mr-4 text-center">Rank</div>
                <div className="flex-1">Venue</div>
                <div className="w-24 text-right">Popularity</div>
              </div>

              <motion.ul layout className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredVenues.map((venue, index) => (
                    <LeaderboardItem 
                      key={venue.id} 
                      venue={venue} 
                      rank={index + 1} 
                    />
                  ))}
                  {filteredVenues.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 text-center text-zinc-500"
                    >
                      No venues found for this category.
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.ul>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
