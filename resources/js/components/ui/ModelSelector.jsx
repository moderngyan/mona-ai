import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Cpu, Zap, Activity } from 'lucide-react';

const ModelSelector = ({ models, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative z-50" ref={ref}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02, y: -0.5 }}
        className="flex items-center gap-2.5 px-4 py-2 rounded-2xl backdrop-blur-3xl bg-white/[0.04] border border-white/10 hover:border-nebula-cyan/30 hover:bg-white/[0.06] transition-all duration-300 shadow-2xl"
      >
        <div className="w-5 h-5 rounded-lg bg-nebula-cyan/10 border border-nebula-cyan/20 flex items-center justify-center shrink-0">
          <Cpu size={12} className="text-nebula-cyan" />
        </div>

        <div className="text-left">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-none mb-0.5">Neural Model</div>
          <div className="text-[11px] font-black text-white uppercase tracking-[0.1em] max-w-[120px] truncate">{selected || 'Select Model'}</div>
        </div>

        <ChevronDown size={14} className={`ml-2 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 w-64 mt-2 p-2 rounded-2xl backdrop-blur-3xl bg-nebula-deep/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="px-3 py-2 mb-1">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Available Compute Nodes</p>
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-hide">
              {models && models.length > 0 ? (
                models.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => { onSelect(m.name); setIsOpen(false); }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                      selected === m.name
                        ? 'bg-nebula-cyan/10 border border-nebula-cyan/20'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg border transition-all ${
                        selected === m.name
                          ? 'border-nebula-cyan/40 bg-nebula-cyan/10'
                          : 'border-white/5 bg-white/5 group-hover:border-white/20'
                      }`}>
                        <Zap size={14} className={selected === m.name ? 'text-nebula-cyan' : 'text-slate-500 group-hover:text-white'} />
                      </div>
                      <div className="text-[11.5px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wider truncate max-w-[130px]">
                        {m.name}
                      </div>
                    </div>

                    {selected === m.name && (
                      <div className="w-1.5 h-1.5 rounded-full bg-nebula-cyan shadow-[0_0_10px_rgba(0,245,255,0.8)] shrink-0" />
                    )}
                  </button>
                ))
              ) : (
                <div className="py-6 text-center">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No Models Detected</p>
                  <p className="text-[9px] text-slate-700 mt-1 uppercase tracking-widest">Check Ollama connection</p>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-white/5 px-3 py-2 flex items-center justify-between">
              <span className="text-[9px] font-mono tracking-widest uppercase text-slate-700">Local Compute · Ollama</span>
              <Activity size={10} className="text-green-500 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelSelector;
