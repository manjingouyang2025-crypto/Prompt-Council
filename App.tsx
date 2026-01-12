
import React, { useState } from 'react';
import InputPanel from './components/InputPanel';
import ResultPanel from './components/ResultPanel';
import Toolbox from './components/Toolbox';
import HistoryModal from './components/HistoryModal';
import MethodologyModal from './components/MethodologyModal';
import { AppStatus, AppStatusType, SimulationProfile, PromptUpgradeResult, RunHistoryItem, TaskType, Draft } from './types';
import { simulatePerspective, synthesizeSimulation, conductDebate, suggestCouncil } from './services/geminiService';
import { ExampleScenario } from './constants/examples';

export interface InterimInsight {
  role: string;
  type: 'IDENTIFIED' | 'CONFLICT' | 'GROUNDED';
  text: string;
}

const App: React.FC = () => {
  const [source, setSource] = useState('');
  const [goal, setGoal] = useState('');
  const [perspectives, setPerspectives] = useState<SimulationProfile[]>([]);
  const [taskType, setTaskType] = useState<TaskType | null>(null);
  const [status, setStatus] = useState<AppStatusType>(AppStatus.IDLE);
  const [result, setResult] = useState<PromptUpgradeResult | null>(null);
  const [interimInsights, setInterimInsights] = useState<InterimInsight[]>([]);
  
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear this workspace? All current simulation progress will be lost.")) {
      setSource('');
      setGoal('');
      setPerspectives([]);
      setTaskType(null);
      setResult(null);
      setInterimInsights([]);
      setStatus(AppStatus.IDLE);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAutoSuggest = async () => {
    if (!goal) return;
    setStatus(AppStatus.PROCESSING);
    try {
      const { profiles, taskType: inferredType } = await suggestCouncil(goal);
      setPerspectives(profiles);
      setTaskType(inferredType);
      setStatus(AppStatus.IDLE);
    } catch (e: any) {
      console.error("AutoSuggest Failure:", e);
      alert("Failed to suggest council: " + e.message);
      setStatus(AppStatus.ERROR);
    }
  };

  const executeFullSimulation = async (
    currentGoal: string, 
    currentSource: string, 
    activePerspectives: SimulationProfile[], 
    effectiveType: TaskType
  ) => {
    setStatus(AppStatus.PROCESSING);
    setResult(null);
    setInterimInsights([]);

    try {
      if (activePerspectives.length === 0) throw new Error("No council lenses defined.");

      // Stage 1: Sequential Simulation with Progressive Disclosure
      // We process these one by one to avoid hitting RPM limits even on Flash
      const initialDrafts: Draft[] = [];
      for (const p of activePerspectives) {
        const draft = await simulatePerspective(p, currentGoal, currentSource, effectiveType);
        initialDrafts.push(draft);
        setInterimInsights(prev => [
          ...prev, 
          { role: p.role, type: 'IDENTIFIED', text: draft.frictionPoint }
        ]);
        // Small staggered delay
        await new Promise(r => setTimeout(r, 400));
      }

      // Stage 2: Debate Layer (Collision)
      setStatus(AppStatus.DEBATING);
      const debatedDrafts: Draft[] = [];
      for (const draft of initialDrafts) {
        const others = initialDrafts.filter(d => d.perspectiveId !== draft.perspectiveId);
        const updated = await conductDebate(draft, others, effectiveType);
        debatedDrafts.push(updated);
        
        if (others.length > 0) {
          setInterimInsights(prev => [
            ...prev,
            { role: draft.perspectiveRole, type: 'CONFLICT', text: `Challenged premises from ${others[0].perspectiveRole}` }
          ]);
        }
        // Small staggered delay
        await new Promise(r => setTimeout(r, 400));
      }

      // Stage 3: Synthesis (Uses Pro Model)
      const upgrade = await synthesizeSimulation(currentGoal, debatedDrafts, activePerspectives, effectiveType);
      const finalResult: PromptUpgradeResult = { ...upgrade as any, drafts: debatedDrafts };

      setResult(finalResult);
      setStatus(AppStatus.COMPLETE);
      
      const historyItem: RunHistoryItem = {
        id: `run-${Date.now()}`,
        timestamp: Date.now(),
        originalGoal: currentGoal,
        perspectives: activePerspectives,
        result: finalResult
      };
      
      const rawHistory = localStorage.getItem('triPrompt_history');
      const history = rawHistory ? JSON.parse(rawHistory) : [];
      history.push(historyItem);
      localStorage.setItem('triPrompt_history', JSON.stringify(history));
      setRefreshTrigger(prev => prev + 1);

      if (window.innerWidth < 768) {
        document.getElementById('result-container')?.scrollIntoView({ behavior: 'smooth' });
      }

    } catch (e: any) {
      console.error("Simulation Critical Failure:", e);
      alert(`Simulation Error: ${e.message}`);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleRun = () => {
    const activePerspectives = perspectives.filter(p => p.role.trim() !== '');
    executeFullSimulation(goal, source, activePerspectives, taskType || 'B');
  };

  const handleTryExample = (example: ExampleScenario) => {
    setGoal(example.goal);
    setSource(example.source);
    setPerspectives(example.perspectives);
    setTaskType(example.taskType);
    setResult(null);
    setStatus(AppStatus.IDLE);
    
    // Smooth scroll back to input if on mobile
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLoadHistory = (run: RunHistoryItem) => {
    setGoal(run.originalGoal);
    setPerspectives(run.perspectives);
    setResult(run.result);
    setTaskType(run.result.taskType || null);
    setStatus(AppStatus.COMPLETE);
    setIsHistoryOpen(false);
  };

  const handleFollowUp = (question: string) => {
    setGoal(prev => `[Recursive Run]\n\nRefined Vector: ${question}\n\nContextual Loop: ${prev}`);
    setStatus(AppStatus.IDLE);
    setResult(null);
    setInterimInsights([]);
    document.getElementById('goal-textarea')?.focus();
  };

  return (
    <div className="flex flex-col h-screen bg-[#fafafa] overflow-hidden selection:bg-accent-100">
      <header className="h-16 md:h-20 px-4 md:px-10 flex items-center justify-between border-b border-slate-200 z-50 bg-white/80 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-3 md:space-x-4 group cursor-default">
          <div className="bg-brand-900 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 md:w-5 md:h-5 text-white">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-base font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-brand-900 leading-none">Prompt Council</h1>
            <span className="text-[7px] md:text-[9px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-accent-600 mt-0.5 md:mt-1">Multi-Perspective Prompt Council</span>
          </div>
        </div>

        <nav className="flex items-center space-x-3 md:space-x-12">
          <button onClick={() => setIsMethodologyOpen(true)} className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-900 transition-colors">Methodology</button>
          <button onClick={() => setIsHistoryOpen(true)} className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-900 transition-colors">History</button>
          <button onClick={() => setIsToolboxOpen(true)} className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-900 transition-colors">Library</button>
          <div className="hidden md:block h-4 w-px bg-slate-200"></div>
          <button onClick={handleReset} className="hidden md:block px-8 py-3 bg-brand-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-900 hover:bg-brand-100 hover:border-slate-900 transition-all active:scale-95">Reset</button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <aside className="w-full md:w-[400px] lg:w-[480px] shrink-0 h-1/2 md:h-full overflow-hidden border-b md:border-b-0 md:border-r border-slate-200">
          <InputPanel 
            source={source} setSource={setSource}
            goal={goal} setGoal={setGoal}
            perspectives={perspectives} setPerspectives={setPerspectives}
            status={status} onGenerate={handleRun} onError={alert}
            onAutoSuggest={handleAutoSuggest}
          />
        </aside>
        
        <section id="result-container" className="flex-1 h-1/2 md:h-full overflow-hidden bg-[#fafafa]">
          <ResultPanel 
            result={result} 
            status={status} 
            interimInsights={interimInsights}
            onSave={(c) => {
              const rawSaved = localStorage.getItem('triPrompt_toolbox');
              const saved = rawSaved ? JSON.parse(rawSaved) : [];
              saved.push({ id: `p-${Date.now()}`, label: "Council Artifact", content: c, timestamp: Date.now() });
              localStorage.setItem('triPrompt_toolbox', JSON.stringify(saved));
              setRefreshTrigger(prev => prev + 1);
            }} 
            onFollowUp={handleFollowUp} 
            onTryExample={handleTryExample} 
          />
        </section>
      </main>

      <Toolbox isOpen={isToolboxOpen} onClose={() => setIsToolboxOpen(false)} onApply={setGoal} triggerRefresh={refreshTrigger} />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} triggerRefresh={refreshTrigger} onLoad={handleLoadHistory} />
      <MethodologyModal isOpen={isMethodologyOpen} onClose={() => setIsMethodologyOpen(false)} />
    </div>
  );
};

export default App;
