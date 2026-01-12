
import React, { useState, useEffect } from 'react';
import { RunHistoryItem } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRefresh: number;
  onLoad: (run: RunHistoryItem) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, triggerRefresh, onLoad }) => {
  const [history, setHistory] = useState<RunHistoryItem[]>([]);
  const [selectedRun, setSelectedRun] = useState<RunHistoryItem | null>(null);

  const loadHistory = () => {
    const raw = localStorage.getItem('triPrompt_history');
    if (raw) {
      try {
        setHistory(JSON.parse(raw).reverse());
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    } else {
        setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [isOpen, triggerRefresh]);

  const clearHistory = () => {
    if (confirm("Permanently delete archive? This cannot be reversed.")) {
        localStorage.removeItem('triPrompt_history');
        setHistory([]);
        setSelectedRun(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-900/60 backdrop-blur-xl md:px-4 md:py-8" onClick={onClose}>
      <div 
        className="bg-white w-full h-full md:max-w-7xl md:h-full md:rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in fade-in md:zoom-in-95 duration-500" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 md:p-10 border-b border-slate-100 flex justify-between items-center bg-[#fafafa]/80 backdrop-blur-md shrink-0">
          <div>
            <h2 className="text-xl md:text-3xl font-black text-brand-900 uppercase tracking-tighter">Strategic Archive</h2>
            <p className="text-[9px] md:text-[11px] font-bold text-accent-600 uppercase tracking-[0.3em] md:tracking-[0.4em] mt-1 md:mt-2">Historical Simulation Logs</p>
          </div>
          <div className="flex items-center space-x-4 md:space-x-10">
             {history.length > 0 && (
                 <button onClick={clearHistory} className="hidden sm:block text-[10px] md:text-[11px] font-black text-danger-500 hover:text-danger-700 uppercase tracking-widest transition-colors">Clear</button>
             )}
             <button onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl md:rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
               <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
             </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-[320px] lg:w-[400px] border-b md:border-b-0 md:border-r border-slate-100 overflow-y-auto bg-brand-50/30 p-4 md:p-8 space-y-4 max-h-[30vh] md:max-h-full">
            {history.length === 0 ? (
              <div className="text-center py-20 md:py-40 text-slate-300 uppercase font-black text-[10px] md:text-[12px] tracking-widest">No Logs Detected</div>
            ) : (
              history.map(run => (
                <div 
                  key={run.id} 
                  onClick={() => setSelectedRun(run)}
                  className={`p-4 md:p-8 rounded-2xl md:rounded-[2rem] cursor-pointer border-2 transition-all duration-300 ${selectedRun?.id === run.id ? 'bg-white border-accent-600 shadow-premium' : 'bg-white/40 border-transparent hover:border-slate-200 hover:bg-white/80'}`}
                >
                  <div className="text-[8px] md:text-[10px] font-black text-slate-400 mb-2 md:mb-3 uppercase tracking-widest">
                    {new Date(run.timestamp).toLocaleDateString()}
                  </div>
                  <div className="text-[12px] md:text-[15px] font-black text-brand-900 line-clamp-2 md:line-clamp-3 leading-tight uppercase tracking-tight">
                    {run.originalGoal || "Mission Untitled"}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Details */}
          <div className="flex-1 overflow-y-auto p-6 md:p-16 bg-white scroll-smooth scrollbar-hide">
            {selectedRun ? (
              <div className="max-w-4xl mx-auto space-y-12 md:space-y-20 animate-in fade-in md:slide-in-from-right-8 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8">
                  <div className="flex-1 w-full">
                    <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest md:tracking-[0.4em] mb-4 md:mb-6">Initial Mission</h3>
                    <div className="p-6 md:p-10 bg-brand-50 rounded-2xl md:rounded-[3rem] text-sm md:text-[16px] font-bold text-brand-800 leading-relaxed border border-brand-100 italic">"{selectedRun.originalGoal}"</div>
                  </div>
                  <button 
                    onClick={() => onLoad(selectedRun)}
                    className="w-full md:w-auto shrink-0 px-8 py-4 md:px-10 md:py-5 bg-accent-600 text-white text-[10px] md:text-[12px] font-black uppercase tracking-widest rounded-xl md:rounded-2xl hover:bg-accent-700 transition-all shadow-xl shadow-accent-100 active:scale-95"
                  >
                    Load Workspace
                  </button>
                </div>
                
                <section>
                  <h3 className="text-[10px] md:text-[11px] font-black text-accent-600 uppercase tracking-widest md:tracking-[0.4em] mb-6 md:mb-8">Executive Synthesis</h3>
                  <div className="bg-white border border-slate-100 p-6 md:p-12 rounded-3xl md:rounded-[3.5rem] text-base md:text-xl lg:text-2xl text-brand-900 whitespace-pre-wrap shadow-premium leading-relaxed antialiased">
                    {selectedRun.result.finalDraft}
                  </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                  <section className="bg-danger-50 p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-danger-100">
                    <h3 className="text-[10px] md:text-[11px] font-black text-danger-600 uppercase tracking-widest md:tracking-[0.4em] mb-6 md:mb-8">Sacrifice Log</h3>
                    <ul className="space-y-4 md:space-y-6">
                      {selectedRun.result.sacrificeLog?.map((s, i) => (
                        <li key={i} className="text-xs md:text-[14px] font-black text-brand-900 uppercase tracking-tight">
                          <span className="text-danger-400 mr-3 md:mr-4">•</span> {s.sacrifice}
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section className="bg-brand-900 p-6 md:p-10 rounded-3xl md:rounded-[3rem] text-white">
                    <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest md:tracking-[0.4em] mb-6 md:mb-8">Constraint Redlines</h3>
                    <ul className="space-y-4 md:space-y-6">
                      {selectedRun.result.redlines?.map((r, i) => (
                        <li key={i} className="text-xs md:text-[14px] font-bold text-slate-100 leading-tight flex items-start">
                          <span className="text-accent-500 mr-3 md:mr-4 font-black">0{i+1}</span> {r}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section className="pb-10">
                  <h3 className="text-[10px] md:text-[11px] font-black text-accent-700 uppercase tracking-widest md:tracking-[0.4em] mb-6 md:mb-8">Finalized Artifact</h3>
                  <div className="bg-brand-50 p-6 md:p-10 rounded-2xl md:rounded-[3rem] text-[11px] md:text-[13px] text-brand-800 font-mono whitespace-pre-wrap border border-slate-100 overflow-x-auto">
                    {selectedRun.result.improvedPrompt}
                  </div>
                </section>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-200">
                <div className="w-24 h-24 md:w-40 md:h-40 rounded-full border border-slate-100 flex items-center justify-center mb-6 md:mb-8 shrink-0">
                   <svg className="w-12 h-12 md:w-20 md:h-20 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="text-[11px] md:text-[14px] font-black uppercase tracking-widest md:tracking-[0.5em]">Select Log Entry</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
