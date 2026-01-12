
import React from 'react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const principles = [
    {
      title: "The Sycophancy Loop",
      desc: "Standard LLMs are trained to be helpful, often agreeing with flawed user premises. We break this by mandating adversarial audits before construction."
    },
    {
      title: "Structural Logic Gaps",
      desc: "Prompts fail not because of 'bad words', but because of missing constraints. We use non-overlapping lenses to expose these gaps."
    },
    {
      title: "Sacrifice Documentation",
      desc: "Every strategic choice incurs debt. Our Sacrifice Log forces you to acknowledge what is being traded away (e.g., speed for security)."
    }
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-900/80 backdrop-blur-md p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="p-8 md:p-12 border-b border-slate-100 flex justify-between items-center bg-[#fafafa]">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-brand-900 uppercase tracking-tighter">Council Methodology</h2>
            <p className="text-[10px] font-bold text-accent-600 uppercase tracking-[0.3em] mt-1">The Science of Multi-perspective Simulation</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 scrollbar-hide">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {principles.map((p, i) => (
              <div key={i} className="space-y-4">
                <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center text-accent-600 font-black text-lg">{i+1}</div>
                <h3 className="font-black text-brand-900 uppercase tracking-tight text-sm">{p.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.desc}</p>
              </div>
            ))}
          </section>

          <section className="bg-brand-900 rounded-3xl p-8 md:p-10 text-white">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-slate-400">Limitations & Constraints</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs md:text-sm">
              <div className="space-y-2 opacity-80">
                <p className="font-black text-accent-500 uppercase tracking-widest text-[10px]">01 // Complexity Noise</p>
                <p>Not for low-stakes tasks. Adding an 'Auditor' to a simple greeting creates unnecessary friction and hallucinated risks.</p>
              </div>
              <div className="space-y-2 opacity-80">
                <p className="font-black text-accent-500 uppercase tracking-widest text-[10px]">02 // Latency Debt</p>
                <p>The council requires parallel reasoning cycles. It is designed for strategic planning, not real-time chat.</p>
              </div>
              <div className="space-y-2 opacity-80">
                <p className="font-black text-accent-500 uppercase tracking-widest text-[10px]">03 // Expert Mimicry</p>
                <p>Models simulate reasoning styles, but cannot invent domain knowledge outside their training corpus.</p>
              </div>
              <div className="space-y-2 opacity-80">
                <p className="font-black text-accent-500 uppercase tracking-widest text-[10px]">04 // Creative Stifling</p>
                <p>Heavy adversarial redlines can sometimes block 'divergent' creative ideas that don't need strict logical auditing.</p>
              </div>
            </div>
          </section>

          <div className="text-center pb-8">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Council Simulation Framework v6.2.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodologyModal;
