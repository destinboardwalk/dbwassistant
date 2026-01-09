import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- TRIP TYPES ---
type TripType = 'Adventure' | 'Laid Back' | 'Family' | 'Romantic';
type GroupType = 'Family' | 'Couples' | 'Group' | 'Friends';
type Interest = 
  | 'Parasailing' 
  | 'Charter Fishing' 
  | 'Boat Rentals' 
  | 'Dolphin Tours & Cruises' 
  | 'Jet Ski Rentals' 
  | 'Dinner & Sunset Cruises' 
  | 'Snorkeling' 
  | 'Crab Island Adventures' 
  | 'Paddleboard & Kayak Rentals';

interface TripPreferences {
  tripType: TripType;
  groupType: GroupType;
  days: number;
  interests: Interest[];
}

// --- CONCIERGE SERVICE ---
async function getTravelRecommendations(preferences: TripPreferences) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  const categoriesList = preferences.interests.join(', ');
  
  const prompt = `
    You are "Boardwalk Assist", the luxury AI concierge for destinboardwalk.com.
    
    User details:
    - Group: ${preferences.groupType}
    - Duration: ${preferences.days} days
    - Vibe: ${preferences.tripType}
    - Interests: ${categoriesList}

    CONCIERGE RULES:
    1. TERMINOLOGY: NEVER say "Harbor". Only use "Destin Boardwalk" or "The Boardwalk".
    2. SOURCE LINKS (Use these EXACT URLs):
       - Crab Island: https://destinboardwalk.com/crab-island-destin-florida-things-to-do-destin-boardwalk/
       - Boat Rentals: https://destinboardwalk.com/destin-florida-boat-rentals-destin-boardwalk/
       - Charter Fishing: https://destinboardwalk.com/charter-fishing-in-destin-florida/
       - Parasailing: https://destinboardwalk.com/parasailing-adventures-in-destin-destin-boardwalk/
       - Jet Ski Rentals: https://destinboardwalk.com/jet-ski-and-waverunners-rental-destin-boardwalk/
       - Dolphin Tours: https://destinboardwalk.com/sailing-charters/
       - Paddleboards: https://destinboardwalk.com/paddleboards-and-kayaks-rentals-destin-boardwalk/
       - Snorkeling: https://destinboardwalk.com/snorkeling-in-destin/
       - Dinner Cruises: https://destinboardwalk.com/destin-sunset-and-dinner-cruises/

    3. PERSONALIZATION: Tailor descriptions to a ${preferences.groupType} trip. Focus on safe, exciting fun for their specific crew.

    OUTPUT FORMAT (Markdown):
    ### [Activity Name]
    _Handpicked for your ${preferences.tripType} trip_
    [A 2-sentence expert concierge description.]
    - [Key Highlight]
    - [Inside Tip]
    [Check Availability](EXACT_URL_FROM_LIST)
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { temperature: 0.1 }
  });

  return response.text;
}

// --- UI COMPONENTS ---
const PreferenceCard = ({ label, options, selected, onChange, multiple = false }) => {
  const isSelected = (opt: string) => multiple ? (selected as string[]).includes(opt) : selected === opt;
  const handleClick = (opt: string) => {
    if (multiple) {
      onChange(isSelected(opt) ? selected.filter(i => i !== opt) : [...selected, opt]);
    } else {
      onChange(opt);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => handleClick(opt)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 ${
              isSelected(opt) 
              ? 'bg-blue-700 border-blue-700 text-white shadow-lg shadow-blue-100' 
              : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-700 shadow-sm'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [prefs, setPrefs] = useState<TripPreferences>({ tripType: 'Adventure', groupType: 'Friends', days: 3, interests: [] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (prefs.interests.length === 0) return setError("Please pick at least one activity!");
    setLoading(true); setError(null);
    try {
      const text = await getTravelRecommendations(prefs);
      setResult(text);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError("Connectivity issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      const t = line.trim();
      if (!t) return null;
      if (t.startsWith('###')) return <h3 key={i} className="text-2xl font-black text-blue-900 mt-10 mb-2 italic uppercase tracking-tighter leading-tight">{t.replace('###', '')}</h3>;
      if (t.startsWith('_')) return <p key={i} className="text-blue-600/70 text-[10px] font-bold uppercase italic mb-4 tracking-widest">{t.replace(/_/g, '')}</p>;
      if (t.startsWith('- ')) return <div key={i} className="flex gap-3 text-slate-600 font-medium mb-2 text-base"><span className="text-blue-500 font-bold">✓</span>{t.replace('- ', '')}</div>;
      
      const linkMatch = t.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) return (
        <div key={i} className="mt-6 mb-12">
          <a href={linkMatch[2]} target="_blank" rel="noopener" className="inline-block px-10 py-4 bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl active:scale-95">Check Availability</a>
          <div className="mt-3 flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            <span>Free Cancellation</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Instant Confirmation</span>
          </div>
        </div>
      );
      
      return <p key={i} className="text-slate-700 mb-4 text-lg leading-relaxed font-medium">{t}</p>;
    });
  };

  return (
    <div className="min-h-screen">
      {/* HEADER: Full-bleed color */}
      <div className="w-full bg-gradient-to-br from-blue-700 via-blue-900 to-blue-950 px-6 py-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-24 -mb-12 blur-3xl"></div>
        
        <div className="max-w-xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-9 h-9 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Boardwalk Assist</h1>
              <p className="text-blue-300 text-[11px] font-bold uppercase tracking-[0.3em] mt-2 opacity-80">Official Trip Planner</p>
            </div>
          </div>
          {result && <button onClick={() => setResult(null)} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">Edit Trip</button>}
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-xl mx-auto -mt-10 px-4 pb-24 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-14 min-h-[500px]">
          {!result ? (
            <div className="space-y-10 animate-in fade-in duration-500">
              <PreferenceCard label="Choose Activities" multiple options={['Parasailing', 'Charter Fishing', 'Boat Rentals', 'Dolphin Tours & Cruises', 'Jet Ski Rentals', 'Dinner & Sunset Cruises', 'Snorkeling', 'Crab Island Adventures', 'Paddleboard & Kayak Rentals']} selected={prefs.interests} onChange={(v: any) => setPrefs({...prefs, interests: v})} />
              <div className="grid grid-cols-2 gap-8">
                <PreferenceCard label="Vibe" options={['Adventure', 'Laid Back', 'Family', 'Romantic']} selected={prefs.tripType} onChange={(v: any) => setPrefs({...prefs, tripType: v})} />
                <PreferenceCard label="Crew" options={['Family', 'Couples', 'Group', 'Friends']} selected={prefs.groupType} onChange={(v: any) => setPrefs({...prefs, groupType: v})} />
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Duration</h3>
                  <p className="text-xs text-slate-500 font-medium italic">Days in Destin</p>
                </div>
                <div className="flex items-center gap-6">
                  <button onClick={() => setPrefs({...prefs, days: Math.max(1, prefs.days-1)})} className="w-10 h-10 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 shadow-sm hover:border-blue-500 transition-all">-</button>
                  <div className="text-center font-black text-3xl text-blue-900 italic min-w-[3rem]">{prefs.days}</div>
                  <button onClick={() => setPrefs({...prefs, days: prefs.days+1})} className="w-10 h-10 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 shadow-sm hover:border-blue-500 transition-all">+</button>
                </div>
              </div>
              {error && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold uppercase rounded-xl border border-red-100 text-center">{error}</div>}
              <button onClick={handleSearch} disabled={loading} className="w-full py-7 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 text-white rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98]">
                {loading ? "Planning..." : "Build My Destin Plan"}
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-blue-50/50 p-6 rounded-3xl mb-12 flex items-center gap-6 border border-blue-100">
                <div className="w-14 h-14 bg-blue-700 text-white rounded-2xl flex items-center justify-center font-bold text-2xl italic shadow-lg shadow-blue-200">✓</div>
                <div>
                  <p className="font-black text-blue-950 uppercase tracking-tighter italic text-xl leading-none">Your Plan Is Ready</p>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Optimized for you</p>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {renderContent(result)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);