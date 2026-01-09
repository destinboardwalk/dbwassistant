
import React, { useState } from 'react';
import { TripPreferences, TripType, GroupType, Interest, GeminiResponse } from './types.ts';
import PreferenceCard from './components/PreferenceCard.tsx';
import { getTravelRecommendations } from './services/geminiService.ts';

const App: React.FC = () => {
  const [preferences, setPreferences] = useState<TripPreferences>({
    tripType: 'Adventure',
    groupType: 'Friends',
    days: 3,
    interests: [],
    destination: 'Destin Boardwalk'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<GeminiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(true);

  const handleSearch = async () => {
    if (preferences.interests.length === 0) {
      setError("Please select at least one activity category!");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getTravelRecommendations(preferences);
      setResponse(data);
      setShowPreferences(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("Unable to reach Boardwalk Assist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderResponse = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const matches = [...line.matchAll(linkRegex)];

      if (matches.length > 0) {
        const [fullMatch, linkText, url] = matches[0];
        return (
          <div key={i} className="mt-4 mb-10">
            <a 
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-4 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 text-xs uppercase tracking-widest"
            >
              Check Availability
            </a>
            <div className="mt-3 flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              <span>Free cancellation</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>No extra fees</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>Instant confirmation</span>
            </div>
          </div>
        );
      }

      if (trimmed.startsWith('###')) {
        return (
          <h3 key={i} className="text-2xl font-black text-blue-900 mt-10 mb-3 uppercase tracking-tighter italic">
            {trimmed.replace('###', '').trim()}
          </h3>
        );
      }

      if (trimmed.startsWith('_') || trimmed.includes('Chosen because')) {
        return (
          <p key={i} className="text-blue-600/60 text-[11px] font-bold uppercase tracking-widest mb-4 italic">
            {trimmed.replace(/_/g, '').trim()}
          </p>
        );
      }

      if (trimmed.startsWith('- ')) {
        return (
          <div key={i} className="flex items-start gap-2 mb-1.5">
            <span className="text-blue-500 font-bold text-sm">✓</span>
            <span className="text-slate-600 font-medium text-base">
              {trimmed.replace('- ', '').trim()}
            </span>
          </div>
        );
      }

      return (
        <p key={i} className="text-slate-700 leading-snug text-lg mb-4 font-medium">
          {trimmed}
        </p>
      );
    });
  };

  const activityOptions: Interest[] = [
    'Parasailing', 'Charter Fishing', 'Boat Rentals', 
    'Dolphin Tours & Cruises', 'Jet Ski Rentals', 
    'Dinner & Sunset Cruises', 'Snorkeling', 
    'Crab Island Adventures', 'Paddleboard & Kayak Rentals'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Full-Bleed Header Wrapper */}
      <div className="w-full bg-gradient-to-br from-blue-700 via-blue-900 to-blue-950 pt-12 pb-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 blur-3xl -ml-24 -mb-12"></div>
        
        <div className="max-w-2xl mx-auto flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/20">
              <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white leading-none">Boardwalk Assist</h2>
              <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mt-1">Official Concierge</p>
            </div>
          </div>
          
          {!showPreferences && !isLoading && (
            <button 
              onClick={() => setShowPreferences(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white border border-white/10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Edit Trip
            </button>
          )}
        </div>
      </div>

      {/* Content Card (Centered) */}
      <div className="max-w-2xl mx-auto -mt-12 px-4 pb-12 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[500px]">
          <div className="p-8 md:p-12">
            {showPreferences ? (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter italic flex items-center gap-3">
                    <span className="w-2 h-6 bg-blue-700 rounded-full"></span>
                    Your Adventure Picks
                  </h3>
                  <PreferenceCard 
                    label="Boardwalk Categories" 
                    multiple
                    options={activityOptions} 
                    selected={preferences.interests}
                    onChange={(val) => setPreferences({ ...preferences, interests: val })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <PreferenceCard 
                    label="Vacation Vibe" 
                    options={['Adventure', 'Laid Back', 'Family', 'Romantic']} 
                    selected={preferences.tripType}
                    onChange={(val) => setPreferences({ ...preferences, tripType: val })}
                  />
                  <PreferenceCard 
                    label="The Crew" 
                    options={['Family', 'Couples', 'Group', 'Friends']} 
                    selected={preferences.groupType}
                    onChange={(val) => setPreferences({ ...preferences, groupType: val })}
                  />
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Days in Destin</h3>
                  <div className="flex items-center gap-6">
                    <button onClick={() => setPreferences(p => ({...p, days: Math.max(1, p.days-1)}))} className="w-10 h-10 bg-white border border-slate-200 rounded-lg font-bold shadow-sm">-</button>
                    <div className="flex-1 text-center font-black text-3xl text-blue-900 italic">{preferences.days} <span className="text-xs uppercase not-italic">Days</span></div>
                    <button onClick={() => setPreferences(p => ({...p, days: p.days+1}))} className="w-10 h-10 bg-white border border-slate-200 rounded-lg font-bold shadow-sm">+</button>
                  </div>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase">{error}</div>}

                <button 
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full py-6 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 text-white rounded-2xl font-black text-xl uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-4 active:scale-95"
                >
                  {isLoading ? "Consulting Concierge..." : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Build My Destin Plan
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-blue-50/50 rounded-2xl p-6 mb-10 flex items-center gap-6 border border-blue-100">
                   <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center text-white font-bold">✓</div>
                   <div>
                     <p className="font-black text-blue-950 uppercase tracking-tighter italic">Personalized Plan Ready</p>
                     <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Optimized for your {preferences.groupType} trip</p>
                   </div>
                </div>
                <div className="space-y-4">
                  {response && renderResponse(response.text)}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-12 text-center pb-8">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">DestinBoardwalk.com Assistant</p>
        </div>
      </div>
    </div>
  );
};

export default App;