
import { GoogleGenAI } from "@google/genai";
import { TripPreferences, GeminiResponse } from "../types.ts";

export async function getTravelRecommendations(
  preferences: TripPreferences,
  coords?: { latitude: number; longitude: number }
): Promise<GeminiResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  const categoriesList = preferences.interests.join(', ');
  
  const prompt = `
    You are "Boardwalk Assist", the official AI concierge for destinboardwalk.com.
    
    The user is visiting for ${preferences.days} days.
    Interests: ${categoriesList}
    Vibe: ${preferences.tripType}, Group: ${preferences.groupType}

    CRITICAL RULES:
    1. TERMINOLOGY: NEVER use the word "Harbor". Always use "Destin Boardwalk" or "The Boardwalk".
    2. SOURCE OF TRUTH (Use these EXACT URLs for the corresponding categories):
       - Crab Island Adventures: https://destinboardwalk.com/crab-island-destin-florida-things-to-do-destin-boardwalk/
       - Boat Rentals: https://destinboardwalk.com/destin-florida-boat-rentals-destin-boardwalk/
       - Charter Fishing: https://destinboardwalk.com/charter-fishing-in-destin-florida/
       - Parasailing: https://destinboardwalk.com/parasailing-adventures-in-destin-destin-boardwalk/
       - Jet Ski Rentals: https://destinboardwalk.com/jet-ski-and-waverunners-rental-destin-boardwalk/
       - Dolphin Tours & Cruises: https://destinboardwalk.com/sailing-charters/
       - Paddleboard & Kayak Rentals: https://destinboardwalk.com/paddleboards-and-kayaks-rentals-destin-boardwalk/
       - Snorkeling: https://destinboardwalk.com/snorkeling-in-destin/
       - Dinner & Sunset Cruises: https://destinboardwalk.com/destin-sunset-and-dinner-cruises/

    3. QUANTITY: For EACH category selected (${categoriesList}), provide specific suggestions that can realistically be done during a ${preferences.days}-day trip.
    
    4. PERSONALIZATION: Ensure descriptions strictly match the "Group" (${preferences.groupType}). If "Family" is selected, do NOT reference "friends". Focus on how it suits their specific crew.
    
    5. STRUCTURE: For each activity, output exactly in this format:
       ### [Activity/Business Name]
       _Chosen because you selected: ${categoriesList}, ${preferences.groupType}, ${preferences.days} days_
       [A short, high-impact description (max 2 sentences) tailored specifically for a ${preferences.groupType} on a ${preferences.tripType} trip.]
       - [Highlight bullet 1: Why it's a must-do]
       - [Highlight bullet 2: A quick tip or insight]
       - [Highlight bullet 3: Practical info]
       
       [Check Availability](EXACT_URL_FROM_LIST_ABOVE)

    6. NO EXTERNAL LINKS: Every single link provided must be from the list above.
    7. NO CITATIONS: Do not include footnotes or sources.
    8. NO FILLER: Just the Markdown results.
  `;

  try {
    const config: any = {
      tools: [{ googleSearch: {} }],
      temperature: 0.2,
    };

    if (coords) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: coords.latitude,
            longitude: coords.longitude
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config,
    });

    const text = response.text || "No active experiences found on the Destin Boardwalk for those selections right now.";
    
    return {
      text,
      sources: []
    };
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    throw error;
  }
}
