import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const ACTIVITIES = [
  { id: 'parasail', label: 'Parasailing', icon: '🪂' },
  { id: 'fish', label: 'Charter Fishing', icon: '🎣' },
  { id: 'boats', label: 'Boat Rentals', icon: '🚤' },
  { id: 'dolphin', label: 'Dolphin Tours', icon: '🐬' },
  { id: 'jetski', label: 'Jet Ski Rentals', icon: '🌊' },
  { id: 'dinner', label: 'Dinner Cruises', icon: '🍽️' },
  { id: 'snorkel', label: 'Snorkeling', icon: '🤿' },
  { id: 'crab', label: 'Crab Island', icon: '🏝️' },
  { id: 'paddle', label: 'Kayaks & Paddleboards', icon: '🛶' }
];

const App = () => {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState({
    tripType: 'Adventure',
    groupType: 'Family',
    days: 3,
    interests: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (label: string) => {
    setPrefs(p => ({
      ...p,
      interests: p.interests.includes(label) 
        ? p.interests.filter(i => i !== label) 
        : [...p.interests, label]
    }));
  };

  const handleGenerate = async () => {
    if (prefs.interests.length === 0) {
      setError("Please select at least one activity to help our concierge.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Re-initializing right before the call ensures we get the most up-to-date API_KEY from the environment
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        You are "The Boardwalk Concierge", a high-end AI assistant for destinboardwalk.com.
        
        USER PROFILE:
        - Trip Type: ${prefs.tripType}
        - Group: ${prefs.groupType}
        - Duration: ${prefs.days} days
        - Selected Interests: ${prefs.interests.join(', ')}

        YOUR TASK:
        Create a personalized "Golden Path" itinerary for the Destin Boardwalk.
        
        STRICT RULES:
        1. TERMINOLOGY: Never say "Harbor". Use "Destin Boardwalk" or "The Boardwalk".
        2. SOURCE LINKS: You must link these exact URLs when mentioning the topic:
           - Crab Island: https://destinboardwalk.com/crab-island-destin-florida-things-to-do-destin-boardwalk/
           - Boat Rentals: https://destinboardwalk.com/destin-florida-boat-rentals-destin-boardwalk/
           - Charter Fishing: https://destinboardwalk.com/charter-fishing-in-destin-florida/
           - Parasailing: https://destinboardwalk.com/parasailing-adventures-in-destin-destin-boardwalk/
           - Jet Ski Rentals: https://destinboardwalk.com/jet-ski-and-waverunners-rental-destin-boardwalk/
           - Dolphin Tours: https://destinboardwalk.com/sailing-charters/
           - Paddleboards & Kayaks: https://destinboardwalk.com/paddleboards-and-kayaks-rentals-destin-boardwalk/
           - Snorkeling: https://destinboardwalk.com/snorkeling-in-destin/
           - Dinner Cruises: https://destinboardwalk.com/destin-sunset-and-dinner-cruises/

        OUTPUT FORMAT:
        Use professional, elegant Markdown. Start with a sophisticated welcome.
        Organize by "Recommended Experiences" and "Concierge Tips for ${prefs.groupType}".
        For each experience, include a [Book Experience](URL) button link using the exact links above.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          temperature: 0.7,
        }
      });

      setResult(response.text);
      setStep(3);
    } catch (err: any) {
      console.error(err);
      setError("The Concierge is currently attending to other guests. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i} />;
      
      if (trimmed.startsWith('#')) {
        return <h2 key={i} className="serif text-3xl font-black text-[#002147] mt-8 mb-4 italic">{trimmed.replace(/#/g, '')}</h2>;
      }
      
      if (trimmed.startsWith('- ')) {
        return <li key={i} className="ml-4 text-slate-700 mb-2 leading-relaxed">{trimmed.replace('- ', '')}</li>;
      }

      const linkMatch = trimmed.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <div key={i} className="my-6">
            <a href={linkMatch[2]} target="_blank" rel="noopener" className="inline-block bg-[#002147] text-[#c5a059] px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest border border-[#c5a059] hover:bg-[#c5a059] hover:text-white transition-all luxury-shadow">
              {linkMatch[1]}
            </a>
          </div>
        );
      }

      return <p key={i} className="text-slate-600 mb-4 leading-relaxed">{trimmed}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Premium Header */}
      <header className="bg-gradient-coastal text-white pt-20 pb-28 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="serif text-6xl md:text-7xl font-black italic mb-4 tracking-tighter">Boardwalk Assist</h1>
          <p className="text-[#c5a059] font-bold uppercase tracking-[0.4em] text-xs opacity-90">Destin's Premier AI Concierge</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto -mt-16 px-4 pb-20">
        <div className="glass luxury-shadow rounded-[3rem] p-8 md:p-14 min-h-[500px]">
          {step === 1 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h2 className="serif text-4xl text-slate-900 mb-2 italic">Tailor Your Visit</h2>
                <p className="text-slate-500 text-sm font-medium italic">Select the experiences that call to you</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ACTIVITIES.map(act => (
                  <button
                    key={act.id}
                    onClick={() => toggleInterest(act.label)}
                    className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 ${
                      prefs.interests.includes(act.label)
                      ? 'border-[#c5a059] bg-[#fffcf5] scale-105 shadow-lg'
                      : 'border-slate-100 bg-white hover:border-slate-200 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    <span className="text-3xl mb-3">{act.icon}</span>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">{act.label}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-6 bg-[#002147] text-white rounded-full font-black uppercase tracking-[0.2em] text-sm hover:bg-[#003166] transition-all"
              >
                Next Step
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center mb-10">
                <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900">← Back</button>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                  <div className="w-6 h-2 rounded-full bg-[#c5a059]"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <section>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-6">Trip Philosophy</label>
                  <div className="space-y-3">
                    {['Adventure', 'Relaxation', 'Culinary', 'Luxury'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setPrefs({...prefs, tripType: t})}
                        className={`w-full text-left p-5 rounded-2xl border-2 font-bold text-sm transition-all ${prefs.tripType === t ? 'border-[#002147] bg-[#f0f7ff] text-[#002147]' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-6">Group Composition</label>
                  <div className="space-y-3">
                    {['Family', 'Couples', 'Solo', 'Corporate'].map(g => (
                      <button 
                        key={g}
                        onClick={() => setPrefs({...prefs, groupType: g})}
                        className={`w-full text-left p-5 rounded-2xl border-2 font-bold text-sm transition-all ${prefs.groupType === g ? 'border-[#002147] bg-[#f0f7ff] text-[#002147]' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <section className="bg-white border border-slate-100 p-10 rounded-[2.5rem] flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="serif text-2xl text-[#002147] italic">Days at the Boardwalk</h4>
                </div>
                <div className="flex items-center gap-6">
                  <button onClick={() => setPrefs({...prefs, days: Math.max(1, prefs.days - 1)})} className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-xl font-bold">-</button>
                  <span className="serif text-4xl font-black text-[#002147] italic w-8 text-center">{prefs.days}</span>
                  <button onClick={() => setPrefs({...prefs, days: prefs.days + 1})} className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-xl font-bold">+</button>
                </div>
              </section>

              {error && <p className="text-red-500 text-xs font-bold text-center uppercase tracking-widest">{error}</p>}

              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-8 bg-[#c5a059] text-white rounded-full font-black uppercase tracking-[0.2em] text-lg hover:bg-[#b4924a] transition-all luxury-shadow active:scale-95 disabled:bg-slate-300"
              >
                {loading ? "Consulting with Experts..." : "Generate Your Itinerary"}
              </button>
            </div>
          )}

          {step === 3 && result && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex justify-between items-center border-b border-slate-100 pb-8 mb-10">
                 <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#002147]">Start New Itinerary</button>
                 <div className="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.2em]">Generated for your ${prefs.tripType} Escape</div>
              </div>
              
              <div className="prose prose-slate max-w-none">
                {renderMarkdown(result)}
              </div>

              <div className="mt-20 pt-10 border-t border-slate-100 text-center">
                 <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">Destin Boardwalk Assist • Concierge Version 2.1</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);