import { motion } from "motion/react";
import { type Venue } from "../types";
import { TrendingUp, TrendingDown, Minus, MapPin, Star } from "lucide-react";
import { cn } from "../lib/utils";

interface LeaderboardItemProps {
  venue: Venue;
  rank: number;
}

export function LeaderboardItem({ venue, rank }: LeaderboardItemProps) {
  const isUp = venue.change > 0;
  const isDown = venue.change < 0;
  
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        layout: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }}
      className="relative flex items-center p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-zinc-800/50 transition-colors group overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-brand-900 opacity-50 group-hover:opacity-100 transition-opacity" />
      
      {/* Rank */}
      <div className="w-12 text-center font-mono text-xl font-bold text-zinc-500 mr-4">
        #{rank}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl shadow-inner border border-zinc-700">
          {venue.emoji}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-100 truncate">
              {venue.name}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
              {venue.category}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {venue.city}, {venue.country}
            </span>
            <span className="flex items-center gap-1 text-yellow-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              {venue.rating.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end gap-1 ml-4 shadow-sm bg-zinc-950/40 p-2 px-4 rounded-xl border border-zinc-800/80">
        <div className="text-2xl font-mono font-bold text-brand-400 tracking-tight">
          {venue.popularity.toLocaleString()}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium font-mono",
          isUp ? "text-brand-500" : isDown ? "text-red-500" : "text-zinc-500"
        )}>
          {isUp && <TrendingUp className="w-3.5 h-3.5" />}
          {isDown && <TrendingDown className="w-3.5 h-3.5" />}
          {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
          
          <motion.span
            key={venue.change}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isUp ? '+' : ''}{venue.change || 0}
          </motion.span>
        </div>
      </div>
    </motion.li>
  );
}
