
import React, { useState } from 'react';
// Import AppStatusType to use as a type for the status prop
import { SimulationProfile, AppStatus, AppStatusType } from '../types';
import { extractProfileFromText } from '../services/geminiService';

interface InputPanelProps {
  source: string;
  setSource: (s: string) => void;
  goal: string;
  setGoal: (s: string) => void;
  perspectives: SimulationProfile[];
  setPerspectives: (p: SimulationProfile[]) => void;
  // Use AppStatusType instead of the AppStatus object constant
  status: AppStatusType;
  onGenerate: () => void;
  onError: (msg: string) => void;
  onAutoSuggest: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({
  source, setSource,
  goal, setGoal,
  perspectives, setPerspectives,
  status, onGenerate, onError, onAutoSuggest
}) => {
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({});

  const toggleBio = (id: string) => {
    setExpandedBios(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExtract = async (id: string, text: string) => {
    if (!text || text.trim().length < 10) return;
    setExtractingId(id);
    try {
      const profile = await extractProfileFromText(text);
      const next = perspectives.map(p => 
        p.id === id ? { ...p, ...profile, sourceText: text, isHighFidelity: true, fidelityScore: 1.0 } : p
      );
      setPerspectives(next as SimulationProfile[]);
    } catch (e: any) {
      onError("Cognitive extraction failed.");
    } finally {
      setExtractingId(null);
    }
  };

  const updateProfile = (idx: number, field: keyof SimulationProfile, val: string) => {
    const next = [...perspectives];
    if (!next[idx]) {
      next[idx] = {
        id: `m-${Date.now()}-${idx}`,
        role: '',
        directive: '',
        heuristics: '',
        vibe: '',
        constraints: '',
        seed: '',
        fidelityScore: 0.5,
        isHighFidelity: false
      } as SimulationProfile;
    }
    next[idx] = { ...next[idx], [field]: val } as SimulationProfile;
    setPerspectives(next);
  };

  const displayPerspectives = [...perspectives];
  while (displayPerspectives.length < 3) {
    displayPerspectives.push(null as any);
  }

  const isBusy = status === AppStatus.PROCESSING || status === AppStatus.DEBATING;

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto border-r border-slate-200 shadow-sm relative z-10 scrollbar-hide">
      <header className="p-6 md:p-8 pb-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-brand-900 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-white">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-base md:text-lg font-black tracking-tight text-brand-900 uppercase">Input Studio</h2>
        </div>
        <p className="text-[9px] md:text-[10px] font-bold text-accent-600 uppercase tracking-widest">
          Configure Council Parameters
        </p>
      </header>

      <div className="p-6 md:p-8 pt-4 space-y-8 md:space-y-12 flex-1 pb-32">
        <section className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-[10px] md:text-[11px] font-black text-brand-800 uppercase tracking-widest">Strategic Objective</label>
            <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mandatory</span>
          </div>
          <textarea 
            id="goal-textarea"
            className="w-full h-32 md:h-36 p-4 md:p-5 bg-brand-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-accent-100 focus:border-accent-500 focus:bg-white outline-none transition-all font-sans text-sm leading-relaxed text-brand-900 placeholder:text-slate-400 shadow-inner-light"
            placeholder="Define the prompt or mission for the council to analyze..."
            value={goal}
            onChange={e => setGoal(e.target.value)}
          />
        </section>

        <section className="space-y-3">
          <label className="block text-[10px] md:text-[11px] font-black text-brand-800 uppercase tracking-widest">Contextual Material</label>
          <textarea 
            className="w-full h-20 md:h-24 p-4 md:p-5 bg-brand-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-accent-100 focus:border-accent-500 focus:bg-white outline-none transition-all font-mono text-[10px] md:text-[11px] text-brand-600 placeholder:text-slate-400 shadow-inner-light"
            placeholder="Optional context or raw data..."
            value={source}
            onChange={e => setSource(e.target.value)}
          />
        </section>

        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="max-w-full md:max-w-[60%]">
              <h3 className="text-[10px] md:text-[11px] font-black text-brand-800 uppercase tracking-widest mb-1">THE SIMULATION COUNCIL</h3>
              <p className="text-[9px] md:text-[10px] text-slate-500 font-medium leading-relaxed">
                Start with auto-suggested Council Lenses for adaptive stress-testing. Optional to add your own preferred council or lens grounding.
              </p>
            </div>
            <button 
              onClick={onAutoSuggest}
              disabled={isBusy || !goal}
              className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-brand-900 text-white text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all disabled:opacity-30 shadow-lg active:scale-95 shrink-0"
            >
              {status === AppStatus.PROCESSING ? "Analyzing Task..." : "Auto-suggest Lenses"}
            </button>
          </div>

          <div className="space-y-4">
            {displayPerspectives.map((p, i) => (
              <div key={p?.id || `placeholder-${i}`} className="group p-5 md:p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-accent-200 transition-all">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <span className="text-[8px] md:text-[9px] font-black text-accent-600 uppercase tracking-widest">Council Lens {i+1}</span>
                  {p?.isHighFidelity && (
                    <span className="px-2 py-0.5 bg-accent-50 text-accent-700 text-[8px] font-black uppercase rounded-full tracking-widest border border-accent-100 shrink-0">High-Fidelity</span>
                  )}
                </div>

                <input 
                  type="text" 
                  className="w-full text-sm font-black text-brand-900 placeholder:text-slate-300 outline-none bg-transparent border-b border-slate-100 group-hover:border-accent-100 focus:border-accent-500 pb-2 transition-all mb-4"
                  placeholder="e.g. Lead Auditor"
                  value={p?.role || ''}
                  onChange={e => updateProfile(i, 'role', e.target.value)}
                />

                <div className="space-y-4">
                  <div>
                    <label className="block text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mandate</label>
                    <input 
                      type="text" 
                      className="w-full text-xs text-brand-800 font-medium placeholder:text-slate-300 outline-none border-b border-transparent focus:border-accent-200 pb-1 transition-all"
                      placeholder="What should this perspective enforce?"
                      value={p?.directive || ''}
                      onChange={e => updateProfile(i, 'directive', e.target.value)}
                    />
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (!p) updateProfile(i, 'role', '');
                      toggleBio(p?.id || `placeholder-${i}`);
                    }}
                    className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center transition-colors ${expandedBios[p?.id || `placeholder-${i}`] ? 'text-accent-600' : 'text-slate-400 hover:text-brand-900'}`}
                  >
                    <svg className={`w-3 h-3 mr-2 transition-transform ${expandedBios[p?.id || `placeholder-${i}`] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 5l7 7-7 7" /></svg>
                    {expandedBios[p?.id || `placeholder-${i}`] ? 'Grounding Active' : '+ Add Lens Grounding'}
                  </button>

                  {expandedBios[p?.id || `placeholder-${i}`] && (
                    <div className="mt-3">
                      <textarea 
                        className="w-full text-[10px] text-brand-700 font-mono placeholder:text-slate-300 outline-none bg-slate-50 p-4 rounded-xl h-24 border border-slate-100 focus:bg-white focus:border-accent-200 transition-all shadow-inner"
                        placeholder="Paste expert bio or profile data..."
                        value={p?.sourceText || ''}
                        onChange={e => updateProfile(i, 'sourceText', e.target.value)}
                        onBlur={(e) => p && handleExtract(p.id, e.target.value)}
                      />
                      {extractingId === p?.id && (
                        <div className="mt-2 flex items-center space-x-2">
                           <div className="w-1.5 h-1.5 bg-accent-600 rounded-full animate-ping"></div>
                           <span className="text-[8px] font-black text-accent-600 uppercase tracking-widest">Extracting...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-4 md:p-8 border-t border-slate-100 bg-white/80 backdrop-blur-md sticky bottom-0 z-20 shrink-0">
        <button 
          onClick={onGenerate}
          disabled={isBusy || !goal || perspectives.filter(p => p.role).length === 0}
          className="w-full py-4 md:py-5 bg-accent-600 text-white font-black text-[11px] md:text-[13px] uppercase tracking-[0.2em] md:tracking-[0.3em] rounded-xl md:rounded-2xl hover:bg-accent-700 transition-all disabled:opacity-30 flex items-center justify-center shadow-xl active:scale-95"
        >
          {isBusy ? (
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              <span>Processing Council...</span>
            </div>
          ) : (
            <span>Initialize Council & Execute</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputPanel;
