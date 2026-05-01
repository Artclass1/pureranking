import { GoogleGenAI, Type } from '@google/genai';
import { Venue } from '../types';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export async function generateInitialVenues(): Promise<Venue[]> {
  const prompt = `Use your Google Search integration (Grounding) to query REAL LIVE DATA from Google Maps tracking.
Find 30 of the most popular, genuine "pure veg" (100% vegetarian / vegan) restaurants, cafes, luxury resorts, and hotels currently operating anywhere in the world.
CRITICAL: Do NOT invent or simulate data. For each venue, you MUST extract the actual, current Google Maps rating (e.g., 4.7) and the actual, current total number of reviews (use this as the \`popularity\` field).
Include a mix of categories (Restaurant, Cafe, Resort, Hotel).
Make sure you parse the review counts correctly to populate the popularity field (e.g., if it has 12,500 reviews, popularity is 12500).
Return exactly 30 items in JSON matching the provided schema.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      tools: [{ googleSearch: {} }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: 'Unique UUID-like string' },
              name: { type: Type.STRING, description: 'Real name of the venue' },
              category: { 
                type: Type.STRING, 
                enum: ['Restaurant', 'Cafe', 'Resort', 'Hotel'] 
              },
              city: { type: Type.STRING },
              country: { type: Type.STRING },
              rating: { type: Type.NUMBER, description: 'Real-world rating (e.g., 4.8)' },
              popularity: { type: Type.NUMBER, description: 'Total review count from Google Maps or similar' },
              change: { type: Type.NUMBER, description: 'Initial change, set to 0 to start' },
              emoji: { type: Type.STRING, description: 'Single emoji representing the venue' }
            },
            required: ['id', 'name', 'category', 'city', 'country', 'rating', 'popularity', 'change', 'emoji']
          }
        }
      }
    });

    let text = response.text;
    if (!text) {
      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = response.candidates[0].content.parts[0].text;
      } else {
        throw new Error("No response from AI");
      }
    }
    
    const venues = JSON.parse(text) as Venue[];
    
    // Sort initially by popularity (review count)
    return venues.sort((a, b) => b.popularity - a.popularity);
  } catch (error) {
    console.error("Error generating venues:", error);
    return FALLBACK_VENUES; // Return fallback gracefully
  }
}

// Fallback data in case the AI fails or rate limits
export const FALLBACK_VENUES: Venue[] = [
  { id: '1', name: 'Le Botaniste', category: 'Restaurant', city: 'New York', country: 'USA', rating: 4.85, popularity: 9850, change: 0, emoji: '🌱' },
  { id: '2', name: 'Nishiyama Onsen', category: 'Resort', city: 'Yamanashi', country: 'Japan', rating: 4.95, popularity: 9920, change: 0, emoji: '♨️' },
  { id: '3', name: 'Mildreds', category: 'Restaurant', city: 'London', country: 'UK', rating: 4.75, popularity: 8740, change: 0, emoji: '🥙' },
  { id: '4', name: 'The Farm at San Benito', category: 'Resort', city: 'Batangas', country: 'Philippines', rating: 4.90, popularity: 9400, change: 0, emoji: '🌴' },
  { id: '5', name: 'Alkaline Cafe', category: 'Cafe', city: 'Sydney', country: 'Australia', rating: 4.60, popularity: 6100, change: 0, emoji: '☕' },
  { id: '6', name: 'Yellow', category: 'Restaurant', city: 'Sydney', country: 'Australia', rating: 4.88, popularity: 9150, change: 0, emoji: '🍷' },
  { id: '7', name: 'Haus Hirt', category: 'Hotel', city: 'Bad Gastein', country: 'Austria', rating: 4.82, popularity: 8200, change: 0, emoji: '🏔️' },
  { id: '8', name: 'Green Earth Vegan', category: 'Cafe', city: 'Toronto', country: 'Canada', rating: 4.65, popularity: 7300, change: 0, emoji: '🌿' },
  { id: '9', name: 'Joia', category: 'Restaurant', city: 'Milan', country: 'Italy', rating: 4.92, popularity: 9600, change: 0, emoji: '🍝' },
  { id: '10', name: 'Fivelements Retreat', category: 'Resort', city: 'Bali', country: 'Indonesia', rating: 4.98, popularity: 9980, change: 0, emoji: '🧘' },
];
