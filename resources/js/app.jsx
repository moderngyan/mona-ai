import './bootstrap';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import NebulaChat from './components/NebulaChat';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, Lock, Zap, Activity, Cpu } from 'lucide-react';
import GlowButton from './components/ui/GlowButton';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('admin@nebula.ai');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('nebula_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('/api/login', { email, password });
            const token = res.data.token;
            localStorage.setItem('nebula_token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsAuthenticated(true);
        } catch (err) {
            setError('ACCESS DENIED: Neural Hash Mismatch.');
        }
    };

    if (loading) return null;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-nebula-deep flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Visuals */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-nebula-cyan/5 blur-[140px] rounded-full animate-pulse pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-nebula-purple/5 blur-[140px] rounded-full animate-pulse pointer-events-none transition-all duration-1000" />
                <div className="nebula-grain" />

                <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-lg relative z-10"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-nebula-cyan/20 to-nebula-purple/20 rounded-[40px] blur-2xl opacity-50 pointer-events-none" />
                    
                    <div className="relative backdrop-blur-3xl bg-white/[0.03] border border-white/10 rounded-[40px] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden">
                        
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent rotate-12 pointer-events-none" />

                        <div className="flex flex-col items-center mb-12">
                            <motion.div 
                                whileHover={{ rotate: 15, scale: 1.1 }}
                                className="w-20 h-20 rounded-[28px] bg-gradient-to-tr from-nebula-cyan to-nebula-purple flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,245,255,0.3)] relative group"
                            >
                                <span className="text-4xl font-black italic tracking-tighter text-white drop-shadow-2xl">N</span>
                                <div className="absolute inset-[-10%] border border-white/20 rounded-[32px] animate-nebula-float opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                            
                            <h1 className="text-3xl font-black tracking-[-0.04em] text-white uppercase italic leading-none mb-2">Nebula Station</h1>
                            <p className="text-[11px] font-black text-nebula-cyan/60 font-mono tracking-[0.4em] uppercase">Security Protocol L9 Alpha</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-8">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">
                                    <Shield size={12} /> Identity Matrix
                                </label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-nebula-cyan/50 focus:bg-white/[0.05] transition-all placeholder-slate-800 font-bold"
                                    placeholder="commander@nebula.ai"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">
                                    <Lock size={12} /> Neural Access Key
                                </label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-nebula-cyan/50 focus:bg-white/[0.05] transition-all placeholder-slate-800 font-bold"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
                                    >
                                        [LINK FAILURE]: {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <GlowButton 
                                type="submit" 
                                glowColor="cyan"
                                className="w-full py-5 text-[12px] font-black uppercase tracking-[0.3em] italic"
                                icon={<Zap size={18} fill="black" />}
                            >
                                Initiate Uplink
                            </GlowButton>
                        </form>

                        <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-between">
                            <div className="flex flex-col items-start">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">System Health</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sub-Core Nominal</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                                <Cpu size={18} className="text-white" />
                                <Activity size={18} className="text-white" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return <NebulaChat />;
};

if (document.getElementById('nebula-app')) {
    const root = createRoot(document.getElementById('nebula-app'));
    root.render(<App />);
}
