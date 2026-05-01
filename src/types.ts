export type VenueCategory = 'Restaurant' | 'Cafe' | 'Resort' | 'Hotel';

export interface Venue {
  id: string;
  name: string;
  category: VenueCategory;
  city: string;
  country: string;
  rating: number;      // e.g., 4.90
  popularity: number;  // e.g., 9500 (score)
  change: number;      // e.g., +15 or -3 (for the live ticker)
  emoji: string;       // e.g., ð¥
}
