import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Settings, Info, CreditCard, ChevronDown, Check, Key, Trash2, Copy, Plus } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, user, onSave }) => {
    const [activeTab, setActiveTab] = useState('General');
    const [personalization, setPersonalization] = useState({
        user_name: '',
        user_nickname: '',
        nickname: '',
        agent_name: '',
        agent_nickname: '',
        occupation: '',
        about_you: '',
        custom_instructions: '',
        social_handle: '',
        location: '',
        base_tone: 'Neutral',
        base_style: 'Default',
        warmth: 'Default',
        enthusiasm: 'Default',
        headers_lists: 'Default',
        emoji_usage: 'Default',
        memory_enabled: true
    });
    const [tokens, setTokens] = useState([]);
    const [newToken, setNewToken] = useState(null);
    const [tokenName, setTokenName] = useState('');
    const [isCreatingToken, setIsCreatingToken] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchPersonalization();
            fetchTokens();
        }
    }, [isOpen]);

    const fetchPersonalization = async () => {
        try {
            const res = await axios.get('/api/user/personalization');
            if (res.data) setPersonalization(prev => ({...prev, ...res.data}));
        } catch (err) {
            console.error("Failed to load settings.");
        }
    };

    const fetchTokens = async () => {
        try {
            const res = await axios.get('/api/user/tokens');
            setTokens(res.data);
        } catch (err) {
            console.error("Failed to load tokens.");
        }
    };

    const handleCreateToken = async () => {
        if (!tokenName.trim()) return;
        try {
            const res = await axios.post('/api/user/tokens', { name: tokenName });
            setNewToken(res.data.plainTextToken);
            setTokenName('');
            setIsCreatingToken(false);
            fetchTokens();
        } catch (err) {
            console.error("Failed to create token.");
        }
    };

    const handleDeleteToken = async (id) => {
        try {
            await axios.delete(`/api/user/tokens/${id}`);
            fetchTokens();
        } catch (err) {
            console.error("Failed to delete token.");
        }
    };

    const handleSave = async () => {
        try {
            await axios.post('/api/user/personalization', personalization);
            if (onSave) onSave(personalization);
            onClose();
        } catch (err) {
            console.error("Failed to save settings.");
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { name: 'General', icon: <Settings size={20} /> },
        { name: 'Personalization', icon: <User size={20} /> },
        { name: 'Security', icon: <Info size={20} /> },
        { name: 'API Keys', icon: <Key size={20} /> },
    ];

    const stylePresets = [
        { name: 'Default', desc: 'Preset style and tone' },
        { name: 'Professional', desc: 'Polished and precise' },
        { name: 'Friendly', desc: 'Warm and chatty' },
        { name: 'Candid', desc: 'Direct and encouraging' },
        { name: 'Quirky', desc: 'Playful and imaginative' },
        { name: 'Efficient', desc: 'Concise and plain' },
        { name: 'Nerdy', desc: 'Exploratory and enthusiastic' },
        { name: 'Cynical', desc: 'Critical and sarcastic' },
    ];

    const charOptions = [
        { name: 'More', desc: 'Friendlier and more personable' },
        { name: 'Default', desc: '' },
        { name: 'Less', desc: 'More professional and factual' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px] bg-black/50 overflow-hidden">
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-3xl h-[700px] bg-[#171717] rounded-xl flex overflow-hidden border border-white/10 shadow-2xl"
            >
                {/* Sidebar */}
                <aside className="w-64 bg-[#0d0d0d] p-4 flex flex-col border-r border-white/5">
                    <nav className="flex-1 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.name ? 'bg-[#212121] text-white' : 'text-white/60 hover:bg-[#212121] hover:text-white'}`}
                            >
                                <span className="opacity-70">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                    <div className="pt-4 mt-auto border-t border-white/5">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Mona Intelligence</p>
                        <p className="text-[10px] text-white/20 mt-1">Version 1.2.4-stable</p>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col bg-[#171717]">
                    <header className="px-8 py-4 flex items-center justify-between border-b border-white/5">
                        <h3 className="text-xl font-semibold text-white">{activeTab}</h3>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                        <AnimatePresence mode="wait">
                            {activeTab === 'General' && (
                                <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-white">Theme</p>
                                            <p className="text-xs text-white/50">Switch between light and dark modes</p>
                                        </div>
                                        <select className="bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#10a37f]/50">
                                            <option>System</option>
                                            <option>Dark</option>
                                            <option>Light</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-white">Language</p>
                                            <p className="text-xs text-white/50">Preferred language for the interface</p>
                                        </div>
                                        <select className="bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#10a37f]/50">
                                            <option>English</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                        </select>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                        <p className="text-sm font-medium text-white">Clear all chats</p>
                                        <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-all">Clear</button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'Personalization' && (
                                <motion.div key="pers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-6">
                                    {/* Identity Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest border-b border-white/5 pb-2">Identity</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Your Name</label>
                                                <input 
                                                    type="text"
                                                    value={personalization.user_name || ''}
                                                    onChange={(e) => setPersonalization({...personalization, user_name: e.target.value})}
                                                    className="w-full bg-[#212121] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#10a37f]/50 outline-none transition-all placeholder-white/20"
                                                    placeholder="e.g. John Doe"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Your Nickname</label>
                                                <input 
                                                    type="text"
                                                    value={personalization.user_nickname || ''}
                                                    onChange={(e) => setPersonalization({...personalization, user_nickname: e.target.value})}
                                                    className="w-full bg-[#212121] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#10a37f]/50 outline-none transition-all placeholder-white/20"
                                                    placeholder="e.g. Johnny"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Agent Name</label>
                                                <input 
                                                    type="text"
                                                    value={personalization.agent_name || ''}
                                                    onChange={(e) => setPersonalization({...personalization, agent_name: e.target.value})}
                                                    className="w-full bg-[#212121] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#10a37f]/50 outline-none transition-all placeholder-white/20"
                                                    placeholder="e.g. Mona-1"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Agent Nickname</label>
                                                <input 
                                                    type="text"
                                                    value={personalization.agent_nickname || ''}
                                                    onChange={(e) => setPersonalization({...personalization, agent_nickname: e.target.value})}
                                                    className="w-full bg-[#212121] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#10a37f]/50 outline-none transition-all placeholder-white/20"
                                                    placeholder="e.g. Mona"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Style & Tone Section */}
                                    <div className="space-y-4 pt-4">
                                        <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest border-b border-white/5 pb-2">Custom Instructions</h4>
                                        
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-white">Base style and tone</p>
                                                <p className="text-xs text-white/50">Set the style and tone of how {personalization.agent_nickname || 'AI'} responds</p>
                                            </div>
                                            <div className="relative group">
                                                <select 
                                                    value={personalization.base_style}
                                                    onChange={(e) => setPersonalization({...personalization, base_style: e.target.value})}
                                                    className="appearance-none bg-[#212121] border border-white/10 rounded-lg px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:border-[#10a37f]/50 cursor-pointer min-w-[140px]"
                                                >
                                                    {stylePresets.map(p => (
                                                        <option key={p.name} value={p.name} className="bg-[#171717] text-white">
                                                            {p.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Characteristics</p>
                                            
                                            {[
                                                { label: 'Warm', key: 'warmth' },
                                                { label: 'Enthusiastic', key: 'enthusiasm' },
                                                { label: 'Headers & Lists', key: 'headers_lists' },
                                                { label: 'Emoji', key: 'emoji_usage' }
                                            ].map(item => (
                                                <div key={item.key} className="flex items-center justify-between">
                                                    <p className="text-sm text-white/80">{item.label}</p>
                                                    <div className="relative">
                                                        <select 
                                                            value={personalization[item.key]}
                                                            onChange={(e) => setPersonalization({...personalization, [item.key]: e.target.value})}
                                                            className="appearance-none bg-[#212121] hover:bg-[#2a2a2a] border border-white/5 rounded-lg px-3 py-1 pr-7 text-sm text-white focus:outline-none text-right cursor-pointer transition-colors"
                                                        >
                                                            {charOptions.map(opt => (
                                                                <option key={opt.name} value={opt.name} className="bg-[#171717] text-white">
                                                                    {opt.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <label className="text-sm font-medium text-white">Custom instructions</label>
                                        <textarea 
                                            value={personalization.custom_instructions || ''}
                                            onChange={(e) => setPersonalization({...personalization, custom_instructions: e.target.value})}
                                            className="w-full h-32 bg-[#212121] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#10a37f]/50 transition-all resize-none outline-none placeholder-white/10"
                                            placeholder="e.g. Respond strictly in Hinglish..."
                                        />
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest border-b border-white/5 pb-2">Context</h4>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white">What would you like the AI to know about you?</label>
                                            <textarea 
                                                value={personalization.about_you || ''}
                                                onChange={(e) => setPersonalization({...personalization, about_you: e.target.value})}
                                                className="w-full h-24 bg-[#212121] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#10a37f]/50 transition-all resize-none outline-none placeholder-white/10"
                                                placeholder="Your role, interests, expertise..."
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 mt-4">
                                        <div>
                                            <p className="text-sm font-medium text-white">Memory Evolution</p>
                                            <p className="text-xs text-white/50">Allow persistent neural learning across threads</p>
                                        </div>
                                        <button 
                                            onClick={() => setPersonalization({...personalization, memory_enabled: !personalization.memory_enabled})}
                                            className={`w-11 h-6 rounded-full transition-all relative ${personalization.memory_enabled ? 'bg-[#10a37f]' : 'bg-[#40414f]'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white transition-all shadow-md mt-[4px] ml-[4px] ${personalization.memory_enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                            
                            {activeTab === 'Security' && (
                                <motion.div key="sec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all">
                                        <p className="text-sm text-white">Multifactor authentication</p>
                                        <button className="px-4 py-1.5 bg-[#212121] border border-white/10 rounded-lg text-xs font-semibold hover:bg-[#2a2a2a] transition-all">Enable</button>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all">
                                        <p className="text-sm text-white">Log out of all devices</p>
                                        <button className="px-4 py-1.5 bg-[#212121] border border-white/10 rounded-lg text-xs font-semibold hover:bg-[#2a2a2a] transition-all">Log out</button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'API Keys' && (
                                <motion.div key="keys" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-white">Developer Access</p>
                                            <p className="text-xs text-white/50">Manage your secret keys for API access</p>
                                        </div>
                                        <button 
                                            onClick={() => setIsCreatingToken(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#10a37f] hover:bg-[#1a7f64] text-white rounded-lg text-sm font-medium transition-all"
                                        >
                                            <Plus size={16} /> Create key
                                        </button>
                                    </div>

                                    {/* New Token Alert */}
                                    {newToken && (
                                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-3">
                                            <p className="text-xs font-bold text-green-400 uppercase tracking-widest">Secret Key Generated</p>
                                            <p className="text-xs text-green-400/70">Please copy this key now. You won't be able to see it again!</p>
                                            <div className="flex gap-2">
                                                <div className="flex-1 bg-black/40 border border-white/5 rounded-lg px-3 py-2 font-mono text-sm text-white break-all">
                                                    {newToken}
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(newToken);
                                                        setNewToken(null);
                                                    }}
                                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase transition-all"
                                                >
                                                    Copy & Close
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Create Form */}
                                    {isCreatingToken && (
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Key Name</label>
                                                <input 
                                                    type="text"
                                                    value={tokenName}
                                                    onChange={(e) => setTokenName(e.target.value)}
                                                    className="w-full bg-[#212121] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#10a37f]/50 outline-none"
                                                    placeholder="e.g. My App Key"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setIsCreatingToken(false)} className="px-3 py-1.5 text-xs text-white/60 hover:text-white transition-all">Cancel</button>
                                                <button onClick={handleCreateToken} className="px-4 py-1.5 bg-white text-black rounded-lg text-xs font-bold uppercase hover:bg-white/90 transition-all">Generate</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Your Keys</p>
                                        <div className="space-y-2">
                                            {tokens.length === 0 ? (
                                                <div className="text-center py-8 text-white/20">No active keys</div>
                                            ) : (
                                                tokens.map(token => (
                                                    <div key={token.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group hover:border-white/20 transition-all">
                                                        <div>
                                                            <p className="text-sm font-medium text-white">{token.name}</p>
                                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-white/30">
                                                                <span>Created: {new Date(token.created_at).toLocaleDateString()}</span>
                                                                <span>•</span>
                                                                <span>Last used: {token.last_used_at ? new Date(token.last_used_at).toLocaleDateString() : 'Never'}</span>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleDeleteToken(token.id)}
                                                            className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <footer className="p-6 border-t border-white/5 bg-[#171717] flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white transition-all">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-[#10a37f] hover:bg-[#1a7f64] text-white text-sm font-medium transition-all shadow-sm">Save changes</button>
                    </footer>
                </main>
            </motion.div>
        </div>
    );
};

export default SettingsModal;
