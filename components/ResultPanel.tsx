
import React, { useState } from 'react';
import { PromptUpgradeResult, AppStatus, AppStatusType } from '../types';
import { EXAMPLE_SCENARIOS, ExampleScenario } from '../constants/examples';
import { InterimInsight } from '../App';

interface ResultPanelProps {
  result: PromptUpgradeResult | null;
  status: AppStatusType;
  interimInsights?: InterimInsight[];
  onSave: (s: string) => void;
  onFollowUp: (q: string) => void;
  onTryExample?: (ex: ExampleScenario) => void;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ result, status, interimInsights = [], onSave, onFollowUp, onTryExample }) => {
  const [activeTranscript, setActiveTranscript] = useState<number>(0);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (status === AppStatus.PROCESSING || status === AppStatus.DEBATING) {
    return (
      <div className="h-full flex flex-col bg-[#fafafa] overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
          <div className="relative mb-8 md:mb-12">
            <div className="w-24 h-24 md:w-32 md:h-32 border-[8px] md:border-[12px] border-slate-100 border-t-accent-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-900 rounded-lg md:rounded-xl shadow-2xl rotate-45 animate-pulse"></div>
            </div>
          </div>
          <div className="text-center space-y-4 max-w-sm w-full">
            <h4 className="text-[10px] md:text-[12px] font-black text-brand-900 uppercase tracking-[0.3em] animate-pulse">
              {status === AppStatus.PROCESSING ? 'Parallel Reasoning Cycles' : 'Truth-Testing & Debate'}
            </h4>
            
            <div className="space-y-3 px-4 text-left border-l border-slate-200 mb-8">
              <div className={`flex items-center space-x-3 ${status === AppStatus.PROCESSING ? 'opacity-100' : 'opacity-40'}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status === AppStatus.PROCESSING ? 'bg-accent-600 animate-pulse' : 'bg-slate-400'}`}></span>
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-brand-800">Stage 1: Multi-Lens Analysis</p>
              </div>
              <div className={`flex items-center space-x-3 ${status === AppStatus.DEBATING ? 'opacity-100' : 'opacity-40'}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status === AppStatus.DEBATING ? 'bg-accent-600 animate-pulse' : 'bg-slate-400'}`}></span>
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-brand-800">Stage 2: Adversarial Audit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progressive Disclosure: Live Insight Feed */}
        <div className="h-[40%] bg-white border-t border-slate-200 overflow-hidden flex flex-col shadow-inner-light">
           <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
              <span className="text-[9px] font-black text-brand-400 uppercase tracking-widest">Live Strategic Feed</span>
              <div className="flex space-x-1">
                 <div className="w-1 h-1 bg-accent-500 rounded-full animate-bounce"></div>
                 <div className="w-1 h-1 bg-accent-500 rounded-full animate-bounce delay-75"></div>
                 <div className="w-1 h-1 bg-accent-500 rounded-full animate-bounce delay-150"></div>
              </div>
           </div>
           <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
              {interimInsights.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-300 italic text-[10px] uppercase tracking-widest font-bold">
                  Assembling reasoning packets...
                </div>
              ) : (
                [...interimInsights].reverse().map((insight, i) => (
                  <div key={i} className="animate-in slide-in-from-bottom-4 duration-500 flex gap-4 p-4 bg-brand-50/50 border border-slate-100 rounded-2xl">
                    <div className="shrink-0 pt-1">
                       <div className={`w-2 h-2 rounded-full ${insight.type === 'IDENTIFIED' ? 'bg-accent-500' : 'bg-danger-500'}`}></div>
                    </div>
                    <div className="space-y-1">
                       <div className="flex items-center space-x-2">
                          <span className="text-[8px] font-black text-brand-900 uppercase tracking-widest bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">{insight.role}</span>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${insight.type === 'IDENTIFIED' ? 'text-accent-600' : 'text-danger-600'}`}>
                            {insight.type === 'IDENTIFIED' ? 'Audit Insight' : 'Constraint Conflict'}
                          </span>
                       </div>
                       <p className="text-[11px] font-bold text-brand-700 leading-relaxed uppercase tracking-tight">"{insight.text}"</p>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-start p-6 md:p-12 lg:p-20 text-center animate-in fade-in duration-1000 overflow-y-auto scrollbar-hide">
        <div className="mb-8 md:mb-12 w-20 h-20 md:w-32 md:h-32 bg-white rounded-3xl md:rounded-[2.5rem] shadow-premium flex items-center justify-center border border-slate-100 group hover:scale-105 transition-transform shrink-0 mt-8">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 md:w-12 md:h-12 text-slate-200 group-hover:text-accent-500 transition-colors">
            <path d="M12 4L4 18h16L12 4z" />
          </svg>
        </div>
        <h1 className="text-xl md:text-3xl lg:text-5xl font-black text-brand-900 uppercase tracking-tighter mb-4 md:mb-6 max-w-2xl leading-[1.1]">
          Multi-perspective reasoning before execution
        </h1>
        <p className="text-sm md:text-lg text-brand-600 max-w-lg leading-relaxed font-medium mb-8 md:mb-12 opacity-70">
          Transform objectives into battle-tested intelligence by simulating diverse reasoning lenses.
        </p>
        <div className="flex items-center space-x-3 px-6 md:px-8 py-3 md:py-4 bg-brand-900 rounded-full shadow-2xl mb-16">
           <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-accent-500 rounded-full animate-pulse shadow-lg shadow-accent-500/50"></span>
           <span className="text-[9px] md:text-[11px] font-black text-white uppercase tracking-widest md:tracking-[0.3em]">Council waiting for objective input</span>
        </div>

        {/* Quick Start Library */}
        <div className="w-full max-w-6xl mt-8">
           <div className="flex flex-col items-center mb-10">
              <span className="text-[10px] font-black text-accent-600 uppercase tracking-[0.4em] mb-2">Try One of Below</span>
              <h4 className="text-xl font-black text-brand-900 uppercase tracking-tight">Quick Start Library</h4>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left">
              {EXAMPLE_SCENARIOS.map((example) => (
                <div key={example.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all group flex flex-col">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center group-hover:bg-accent-50 transition-colors">
                         {example.id === 'tech-stack' && (
                           <svg className="w-5 h-5 text-brand-400 group-hover:text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                         )}
                         {example.id === 'feature-prioritization' && (
                           <svg className="w-5 h-5 text-brand-400 group-hover:text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                         )}
                         {example.id === 'hiring-strategy' && (
                           <svg className="w-5 h-5 text-brand-400 group-hover:text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                         )}
                      </div>
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">4 Council Lenses</span>
                   </div>
                   <h5 className="text-[14px] font-black text-brand-900 uppercase tracking-tight mb-2 leading-tight">{example.title}</h5>
                   <p className="text-[11px] text-slate-500 font-medium leading-relaxed flex-1 mb-8">{example.description}</p>
                   <button 
                    onClick={() => onTryExample?.(example)}
                    className="w-full py-3 bg-brand-50 text-brand-900 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-accent-600 hover:text-white transition-all shadow-sm flex items-center justify-center group/btn"
                   >
                     Fill Scenario
                     <svg className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                   </button>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#fafafa] p-6 md:p-12 lg:p-20 space-y-16 md:space-y-32 pb-40 md:pb-64 scroll-smooth scrollbar-hide">
      {/* 1. Master Plan */}
      <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
          <div className="w-full">
            <span className="text-[9px] md:text-[11px] font-black text-accent-600 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-3 md:mb-4 block">Executive Synthesis</span>
            <h3 className="text-3xl md:text-5xl lg:text-7xl font-black text-brand-900 uppercase tracking-tighter leading-none break-words">Master Plan</h3>
          </div>
          <div className="flex items-center space-x-3 md:space-x-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             <button 
              onClick={() => copyText(result.finalDraft)}
              className="whitespace-nowrap px-5 py-2.5 md:px-6 md:py-3 bg-white border border-slate-200 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-800 rounded-lg md:rounded-xl hover:border-brand-900 hover:shadow-lg transition-all shrink-0"
             >
               Copy Plan
             </button>
             <div className="text-right border-l border-slate-200 pl-4 md:pl-6 shrink-0">
                <span className="text-[8px] md:text-[10px] font-black text-accent-700 uppercase tracking-widest mb-0.5 md:mb-1 block">Logic v{result.metadata.promptVersion}</span>
                <span className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Model: {result.metadata.model}</span>
             </div>
          </div>
        </div>
        
        <div className="bg-white p-6 md:p-12 lg:p-20 rounded-3xl md:rounded-[3.5rem] shadow-premium border border-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-accent-50/40 -mr-32 -mt-32 rounded-full blur-[60px] group-hover:bg-accent-100/30 transition-colors duration-1000"></div>
          <pre className="whitespace-pre-wrap font-sans text-base md:text-xl lg:text-2xl leading-relaxed text-brand-900 font-medium relative z-10 antialiased selection:bg-accent-100">
            {result.finalDraft}
          </pre>

          {/* Master Plan Sources */}
          {result.sources && result.sources.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-100 relative z-10">
              <h5 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Verification Shelf (Master Plan)</h5>
              <div className="flex flex-wrap gap-3">
                {result.sources.map((s, idx) => (
                  <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] md:text-[10px] font-bold text-brand-600 hover:border-accent-600 hover:text-accent-700 transition-all flex items-center space-x-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    <span className="truncate max-w-[150px]">{s.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 1.5 Concrete Demonstration (Execution Lab) - Type A Only */}
      {result.taskType === 'A' && result.concreteDemonstration && (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mb-8 md:mb-12">
            <span className="text-[9px] md:text-[11px] font-black text-accent-600 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-3 md:mb-4 block">Execution Lab</span>
            <h3 className="text-3xl md:text-5xl lg:text-7xl font-black text-brand-900 uppercase tracking-tighter leading-none break-words">Concrete Demonstration</h3>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12">
            {/* Working Example */}
            <div className="xl:col-span-8 bg-white p-8 md:p-12 lg:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-premium border border-slate-100 relative group overflow-hidden">
               <div className="absolute top-0 right-0 px-6 py-2 bg-accent-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-3xl">Live Preview</div>
               <h4 className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest mb-8">Working Example</h4>
               <div className="font-serif text-lg md:text-xl lg:text-2xl leading-relaxed text-brand-900/90 whitespace-pre-wrap selection:bg-accent-100">
                 {result.concreteDemonstration.workingExample}
               </div>
            </div>

            {/* Steps and Specs */}
            <div className="xl:col-span-4 space-y-8">
               <div className="bg-brand-900 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] text-white shadow-2xl">
                 <h4 className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest mb-8">Actionable Structure</h4>
                 <div className="space-y-6">
                   {result.concreteDemonstration.actionableStructure.map((step, i) => (
                     <div key={i} className="flex items-start gap-4 group/step">
                       <span className="w-8 h-8 rounded-full bg-accent-600 flex items-center justify-center text-[11px] font-black shrink-0 group-hover/step:scale-110 transition-transform">
                         {i + 1}
                       </span>
                       <p className="text-sm md:text-base font-bold text-slate-200 leading-tight pt-1">{step}</p>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="bg-accent-50 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-accent-100">
                 <h4 className="text-[10px] md:text-[12px] font-black text-accent-700 uppercase tracking-widest mb-8">Specifications</h4>
                 <div className="space-y-8">
                   <div>
                     <span className="block text-[9px] font-black text-accent-400 uppercase tracking-widest mb-3">Tone / Mood</span>
                     <p className="text-sm md:text-base font-black text-brand-900 uppercase leading-snug">{result.concreteDemonstration.specs.toneMood}</p>
                   </div>
                   <div>
                     <span className="block text-[9px] font-black text-accent-400 uppercase tracking-widest mb-3">Variables Defined</span>
                     <ul className="space-y-2">
                       {result.concreteDemonstration.specs.variables.map((v, i) => (
                         <li key={i} className="text-xs font-bold text-brand-700 flex items-center">
                           <span className="w-1 h-1 bg-accent-400 rounded-full mr-3 shrink-0"></span> {v}
                         </li>
                       ))}
                     </ul>
                   </div>
                   <div>
                     <span className="block text-[9px] font-black text-accent-400 uppercase tracking-widest mb-3">References</span>
                     <p className="text-xs font-bold text-brand-600 italic">"{result.concreteDemonstration.specs.references}"</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Expert Transcripts with Grounding Sources */}
      <section className="animate-in fade-in duration-700">
        <div className="mb-8 md:mb-12">
          <h4 className="text-[10px] md:text-[12px] font-black text-brand-900 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-3">Council Transcripts</h4>
          <p className="text-[11px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">Grounded Reasoning Logs</p>
        </div>

        <div className="bg-brand-800 p-1.5 md:p-2 rounded-2xl md:rounded-[2.5rem] flex flex-wrap gap-1 mb-8 md:mb-10 shadow-inner">
          {result.drafts.map((draft, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTranscript(idx)}
              className={`flex-1 min-w-[120px] px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-[2rem] text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTranscript === idx 
                ? 'bg-white text-brand-900 shadow-xl' 
                : 'text-slate-400 hover:text-white'
              }`}
            >
              {draft.perspectiveRole}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <div className="lg:col-span-8 bg-white p-6 md:p-12 rounded-3xl md:rounded-[3rem] border border-slate-100 shadow-sm relative group overflow-hidden">
             <div className="flex items-center justify-between mb-6 md:mb-8">
                <span className="text-[8px] md:text-[10px] font-black text-accent-600 uppercase tracking-widest px-3 py-1.5 md:px-4 md:py-2 bg-accent-50 rounded-full">Refined White Paper</span>
                {result.drafts[activeTranscript].sources && (
                   <span className="text-[8px] md:text-[10px] font-black text-accent-700 uppercase tracking-widest flex items-center">
                     <span className="w-1.5 h-1.5 bg-accent-500 rounded-full mr-2"></span> Grounded Reasoning
                   </span>
                )}
             </div>
             <pre className="whitespace-pre-wrap font-sans text-xs md:text-sm lg:text-base leading-relaxed text-brand-800 italic opacity-90 overflow-x-hidden mb-8">
               {result.drafts[activeTranscript].whitePaper}
             </pre>

             {/* Expert Specific Sources */}
             {result.drafts[activeTranscript].sources && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h5 className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Evidence Lineage</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.drafts[activeTranscript].sources?.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="p-3 bg-brand-50 rounded-xl border border-transparent hover:border-accent-200 hover:bg-white transition-all group/link">
                        <p className="text-[9px] md:text-[10px] font-black text-brand-900 truncate mb-1 group-hover/link:text-accent-600">{s.title}</p>
                        <p className="text-[8px] text-slate-400 truncate font-mono">{s.uri}</p>
                      </a>
                    ))}
                  </div>
                </div>
             )}
          </div>
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <div className="bg-accent-600 p-6 md:p-10 rounded-3xl md:rounded-[3rem] text-white shadow-xl shadow-accent-100">
               <h5 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mb-4 md:mb-6 opacity-60">Debate Logic</h5>
               <p className="text-sm md:text-base font-bold leading-tight italic">
                 {result.drafts[activeTranscript].debateCritique || "No internal conflict detected during simulation."}
               </p>
               <div className="w-10 md:w-12 h-1 bg-white/20 mt-4"></div>
            </div>
            <div className="bg-brand-50 p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-slate-200">
               <h5 className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-3 md:mb-4">Consolidated Friction</h5>
               <p className="text-xs md:text-sm font-black text-brand-900 leading-relaxed uppercase">
                 "{result.drafts[activeTranscript].frictionPoint}"
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Brutal Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <section className="bg-danger-50 p-8 md:p-12 lg:p-16 rounded-3xl md:rounded-[4rem] border border-danger-100 relative group overflow-hidden">
          <h4 className="text-[11px] md:text-[13px] font-black text-danger-600 uppercase tracking-[0.3em] md:tracking-[0.5em] mb-8 md:mb-16 flex items-center">
            <span className="w-2.5 h-2.5 bg-danger-500 rounded-full mr-3 md:mr-4 shadow-lg"></span>
            The Sacrifice Log
          </h4>
          <div className="space-y-8 md:space-y-12 relative z-10">
            {result.sacrificeLog.map((s, i) => (
              <div key={i} className="group/item">
                <p className="text-base md:text-lg font-black text-brand-900 uppercase tracking-tight mb-2">{s.sacrifice}</p>
                <p className="text-[10px] md:text-[12px] text-brand-600 font-bold uppercase tracking-widest leading-relaxed mb-3 md:mb-4 opacity-70 italic">{s.reason}</p>
                <div className="inline-flex items-center bg-white border border-danger-100 px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[8px] md:text-[10px] font-black text-danger-600 uppercase tracking-widest shadow-sm">
                  Intensity: {s.risk}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-brand-900 p-8 md:p-12 lg:p-16 rounded-3xl md:rounded-[4rem] text-white shadow-2xl relative overflow-hidden flex flex-col">
          <h4 className="text-[11px] md:text-[13px] font-black text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.5em] mb-8 md:mb-16 flex items-center">
            <span className="w-2.5 h-2.5 bg-white rounded-full mr-3 md:mr-4 shadow-lg shadow-white/20"></span>
            Adversarial Redlines
          </h4>
          <ul className="space-y-8 md:space-y-10 flex-1">
            {result.redlines.map((r, i) => (
              <li key={i} className="flex items-start group/li">
                <span className="text-accent-500 mr-5 md:mr-8 font-black text-2xl md:text-3xl leading-none opacity-40">0{i+1}</span>
                <span className="text-sm md:text-lg font-bold leading-tight text-slate-100 tracking-tight">{r}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 4. Artifact */}
      <section className="bg-white p-8 md:p-12 lg:p-20 rounded-3xl md:rounded-[4rem] shadow-premium border border-slate-100 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 md:mb-12 gap-6">
          <div className="w-full">
            <h4 className="text-[11px] md:text-[13px] font-black text-brand-900 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2">Prompt Artifact V3</h4>
            <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Grounded Strategic Architecture</p>
          </div>
          <button 
            onClick={() => onSave(result.improvedPrompt)} 
            className="w-full sm:w-auto px-6 py-4 md:px-8 bg-brand-900 text-white rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl hover:scale-[1.02] active:scale-95"
          >
            Archive to Library
          </button>
        </div>
        <div className="bg-brand-50 p-6 md:p-12 rounded-2xl md:rounded-[3rem] border border-slate-100 relative group">
          <pre className="text-xs md:text-sm lg:text-base font-mono text-brand-800 whitespace-pre-wrap leading-relaxed selection:bg-brand-900 selection:text-white">
            {result.improvedPrompt}
          </pre>
          <button 
            onClick={() => copyText(result.improvedPrompt)}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-[8px] md:text-[9px] font-black text-accent-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Copy Artifact
          </button>
        </div>
      </section>

      {/* 5. Insight */}
      <section className="pt-16 md:pt-32 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-20">
        <div className="lg:col-span-2">
           <h4 className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.5em] mb-6 md:mb-10">Meta-Strategic Heuristic</h4>
           <div className="p-8 md:p-12 bg-accent-50 rounded-3xl md:rounded-[4rem] border border-accent-100 text-brand-900 font-black text-xl md:text-3xl lg:text-4xl tracking-tighter leading-tight italic">
             "{result.generalizableInsight}"
           </div>
        </div>
        <div>
           <h4 className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.5em] mb-6 md:mb-10">Efficiency Delta</h4>
           <ul className="space-y-4 md:space-y-6">
             {result.whyItIsBetter.map((w, i) => (
               <li key={i} className="text-[11px] md:text-[13px] font-black text-brand-700 flex items-start uppercase tracking-widest leading-relaxed">
                 <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-accent-500 rounded-full mr-4 md:mr-5 mt-1.5 shrink-0"></span>
                 {w}
               </li>
             ))}
           </ul>
        </div>
      </section>

      {/* 6. Recursion */}
      <section className="pt-16 md:pt-32 pb-20 md:pb-40">
        <div className="flex flex-col items-center text-center mb-10 md:mb-16">
          <div className="w-12 h-1 md:w-16 md:h-1.5 bg-accent-600 mb-6 md:mb-8 rounded-full"></div>
          <h4 className="text-sm md:text-[16px] font-black text-brand-900 uppercase tracking-[0.4em] md:tracking-[0.6em] mb-3 md:mb-4">Recursive Simulation</h4>
          <p className="text-[9px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest">Re-run simulation with refined parameters</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-5xl mx-auto">
          {result.followUpQuestions.map((q, i) => (
            <button 
              key={i} 
              onClick={() => onFollowUp(q)}
              className="w-full sm:w-auto px-6 py-6 md:px-10 md:py-8 bg-white border border-slate-200 rounded-2xl md:rounded-[3rem] text-xs md:text-[14px] font-black text-brand-700 hover:border-accent-500 hover:text-accent-600 hover:shadow-premium hover:-translate-y-1 transition-all text-left max-w-sm group shadow-sm"
            >
              <span className="opacity-30 group-hover:opacity-100 transition-opacity mr-3">//</span>
              {q}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ResultPanel;
