import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Brain, Cpu, Zap, Activity, Shield, TrendingUp, Key, Binary, History, Layers } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import GlowButton from './ui/GlowButton';

const NeuralDashboard = () => {
    const [data, setData] = useState({
        metrics: { total_memories: 0, vector_count: 0, knowledge_keys: 0 },
        top_knowledge: [],
        usage_summary: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/dashboard');
            setData(res.data);
        } catch (err) {
            console.error("Failed to connect to Neural Dashboard Hub.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 rounded-3xl border border-nebula-cyan/30 flex items-center justify-center animate-spin">
                    <Activity size={32} className="text-nebula-cyan" />
                </div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Syncing Neural Nodes...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-8 space-y-12">
            
            {/* Header: Executive Overview */}
            <header className="flex flex-col md:flex-row justify-between items-end gap-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-nebula-cyan/20 to-nebula-purple/20 border border-nebula-cyan/30 text-nebula-cyan shadow-[0_0_30px_rgba(0,245,255,0.2)]">
                            <Layers size={28} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">Neural Topology</h2>
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Sector Overview • Nexus-L9 Metrics</p>
                        </div>
                    </div>
                    <p className="max-w-xl text-[14px] font-semibold text-slate-400 tracking-tight leading-relaxed">
                        Real-time visualization of your tenant's cognitive growth. Track semantic persistence, structured intelligence nodes, and neural computation usage.
                    </p>
                </div>

                <GlowButton variant="secondary" glowColor="purple" onClick={fetchDashboardData} icon={<History size={16} />}>
                    Resync Data
                </GlowButton>
            </header>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricCard 
                    label="Semantic Memories" 
                    value={data.metrics.total_memories} 
                    icon={<Database size={24} />} 
                    color="cyan" 
                    description="Raw conversation fragments stored for retrieval."
                />
                <MetricCard 
                    label="Vector Embeddings" 
                    value={data.metrics.vector_count} 
                    icon={<Binary size={24} />} 
                    color="purple" 
                    description="Mathematically indexed consciousness nodes."
                />
                <MetricCard 
                    label="Knowledge Keys" 
                    value={data.metrics.knowledge_keys} 
                    icon={<Brain size={24} />} 
                    color="gold" 
                    description="Direct facts extracted from user interactions."
                />
                <MetricCard 
                    label="System Stability" 
                    value="99.9%" 
                    icon={<Shield size={24} />} 
                    color="cyan" 
                    description="Neural link uptime across distributed network."
                />
            </div>

            {/* Detailed Graphs / Analysis Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Knowledge Graph Card */}
                <GlassCard className="lg:col-span-2 p-10 space-y-8">
                    <div className="flex justify-between items-center px-2">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Structured Intelligence Keys</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Autonomous L8 Knowledge Extraction Results</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-nebula-cyan">
                            <Key size={20} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {data.top_knowledge.length > 0 ? (
                            data.top_knowledge.map((k, idx) => (
                                <div key={idx} className="group relative flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-nebula-cyan/30 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden">
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-nebula-deep flex items-center justify-center border border-white/5 group-hover:border-nebula-cyan/50 text-slate-600 transition-all">
                                            <span className="text-[13px] font-black">{idx + 1}</span>
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-black text-white uppercase tracking-wider">{k.key}</p>
                                            <p className="text-[11px] font-bold text-slate-500 mt-1 truncate max-w-sm">{k.value}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-1.5 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-nebula-cyan shadow-[0_0_10px_rgba(0,245,255,0.8)]" />
                                            <span className="text-[11px] font-black text-nebula-cyan italic uppercase">{Math.round(k.confidence_score * 100)}% Confidence</span>
                                        </div>
                                        <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-nebula-cyan" 
                                                initial={{ width: 0 }} 
                                                animate={{ width: `${k.confidence_score * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Decoration Grid Background */}
                                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                                </div>
                            ))
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center opacity-30 italic">
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">No Intelligence Nodes Extracted Yet</p>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Model Usage Heatmap / Distribution */}
                <GlassCard className="p-10 flex flex-col justify-between space-y-10">
                    <div className="space-y-8">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Computation Flow</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Neural Model Frequency Analysis</p>
                        </div>

                        <div className="space-y-6">
                            {data.usage_summary.map((u, idx) => (
                                <div key={idx} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[11px] font-black text-white uppercase tracking-widest">{u.model}</span>
                                        <span className="text-[10px] font-black text-nebula-cyan italic uppercase tracking-widest">{u.count} Ops</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative group">
                                        <motion.div 
                                            initial={{ width: 0 }} 
                                            animate={{ width: `${Math.min(100, (u.count / 1000) * 100)}%` }}
                                            className="h-full bg-gradient-to-r from-nebula-cyan to-nebula-purple shadow-[0_0_15px_rgba(0,245,255,0.4)]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-nebula-cyan/5 border border-nebula-cyan/10 space-y-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp size={16} className="text-nebula-cyan" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Optimization Required</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                            Nexus-Core suggests switching to a local LoRA fine-tune for the 'llama3.2' node to increase extraction accuracy. 
                        </p>
                    </div>
                </GlassCard>
            </div>
            
            {/* Visual Footer/Grid */}
            <div className="pt-10 flex items-center justify-center gap-20 opacity-20 filter grayscale">
                <div className="flex items-center gap-3">
                  <Cpu size={14} className="text-white" />
                  <span className="text-[10px] font-black tracking-widest uppercase">Kernel Node-9 Stable</span>
                </div>
                <div className="flex items-center gap-3">
                  <Activity size={14} className="text-white" />
                  <span className="text-[10px] font-black tracking-widest uppercase">Uplink 1.2 GB/S</span>
                </div>
                <div className="flex items-center gap-3">
                  <Binary size={14} className="text-white" />
                  <span className="text-[10px] font-black tracking-widest uppercase">Quantum Hash Active</span>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon, color, description }) => {
    const colors = {
        cyan: 'text-nebula-cyan border-nebula-cyan/30 bg-nebula-cyan/10 group-hover:bg-nebula-cyan/20 group-hover:border-nebula-cyan/50',
        purple: 'text-nebula-purple border-nebula-purple/30 bg-nebula-purple/10 group-hover:bg-nebula-purple/20 group-hover:border-nebula-purple/50',
        gold: 'text-nebula-gold border-nebula-gold/30 bg-nebula-gold/10 group-hover:bg-nebula-gold/20 group-hover:border-nebula-gold/50'
    };
    
    return (
        <motion.div 
            whileHover={{ y: -8 }}
            className="group relative"
        >
            <div className="absolute -inset-1 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all blur-xl rounded-3xl" />
            
            <GlassCard className="p-8 h-full flex flex-col justify-between transition-all duration-700 hover:border-white/20">
                <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-700 ${colors[color]}`}>
                        {icon}
                    </div>
                    {/* Tiny animated pulse dot */}
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em]">{label}</p>
                        <h4 className="text-4xl font-black text-white italic tracking-tighter leading-none">{value}</h4>
                    </div>
                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-wider">
                        {description}
                    </p>
                </div>

                <div className="absolute -right-2 -bottom-2 opacity-[0.03] scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                    {icon}
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default NeuralDashboard;
