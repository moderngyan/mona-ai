import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CloudUpload, Zap, Activity, Shield, Trash2, CheckCircle2, AlertCircle, Clock, ChevronRight, Binary } from 'lucide-react';
import GlowButton from './ui/GlowButton';
import GlassCard from './ui/GlassCard';

const InvoiceManager = () => {
    const [invoices, setInvoices] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await axios.get('/api/invoices');
            setInvoices(res.data);
        } catch (err) {
            console.error("Neural uplink for invoices failed.");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await axios.post('/api/invoices/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSelectedFile(null);
            fetchInvoices();
        } catch (err) {
            console.error("Uplink failed: Hardware/Encryption constraint.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-16 py-10 px-6 overflow-hidden">
            {/* Header: Linear Style */}
            <header className="flex flex-col md:flex-row justify-between items-end gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-nebula-cyan/20 to-nebula-purple/20 border border-nebula-cyan/30 text-nebula-cyan shadow-[0_0_30px_rgba(0,245,255,0.2)]">
                            <FileText size={28} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">Invoicing Matrix</h2>
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Extraction Hub v2.4 • Nebula-L9 Established</p>
                        </div>
                    </div>
                    <p className="max-w-xl text-[14px] font-medium leading-relaxed text-slate-400 tracking-tight">
                        Nebula's autonomous vision system recognizes and extracts structured intelligence from your artifacts with zero human intervention. Scale your financial throughput across the interlinked network.
                    </p>
                </div>

                <div className="flex items-center gap-10 border border-white/5 bg-white/[0.02] p-6 rounded-3xl backdrop-blur-3xl shadow-2xl">
                    <StatusStat label="Total Volume" value={invoices.length} icon={<Database size={14} />} color="cyan" />
                    <div className="w-px h-10 bg-white/5" />
                    <StatusStat label="Health Status" value="Nominal" icon={<Activity size={14} />} color="gold" />
                    <div className="w-px h-10 bg-white/5" />
                    <StatusStat label="Extraction Logic" value="L8-PARSER" icon={<Binary size={14} />} color="purple" />
                </div>
            </header>

            {/* Upload Area: Ultra Modern Raycast/Linear Dropzone */}
            <section className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-nebula-cyan/20 to-nebula-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl pointer-events-none" />
                <GlassCard className="p-10 flex flex-col md:flex-row items-center justify-between gap-10 group-hover:border-nebula-cyan/20 transition-all duration-700">
                    <div className="flex-1 space-y-3">
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Establish Uplink</h3>
                        <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Prepare artifact for deep extraction. <br/>Supports PDFs, Neural Clusters, and Image Artifacts.</p>
                    </div>

                    <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-5 w-full md:w-auto">
                        <input type="file" id="file-upload" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0])} />
                        <label 
                            htmlFor="file-upload"
                            className={`flex flex-col justify-center px-10 py-5 rounded-3xl border border-dashed text-center min-w-[240px] cursor-pointer transition-all duration-500 group ${selectedFile ? 'border-nebula-cyan bg-nebula-cyan/10' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'}`}
                        >
                            <CloudUpload size={24} className={`mx-auto mb-3 transition-colors ${selectedFile ? 'text-nebula-cyan' : 'text-slate-500 group-hover:text-white'}`} />
                            <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${selectedFile ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                {selectedFile ? selectedFile.name : 'Choose Artifact'}
                            </span>
                        </label>
                        
                        <div className="flex flex-col gap-3 justify-center">
                            <GlowButton 
                                type="submit"
                                disabled={!selectedFile || uploading}
                                variant={selectedFile ? 'primary' : 'secondary'}
                                glowColor="cyan"
                                className="h-full px-12"
                                icon={<Zap size={16} fill="black" />}
                            >
                                {uploading ? 'Extracting...' : 'Initiate Parse'}
                            </GlowButton>
                            
                            <p className="text-[10px] text-center font-bold tracking-widest text-slate-800 uppercase italic">
                                Nexus-Ready v2.4
                            </p>
                        </div>
                    </form>
                </GlassCard>
            </section>

            {/* Extraction Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <AnimatePresence>
                    {invoices.map((inv, idx) => (
                        <motion.div 
                            key={inv.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <GlassCard className="p-8 group hover:-translate-y-3 transition-all duration-700 hover:shadow-[0_40px_80px_rgba(0,0,0,0.9)]">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-nebula-cyan/30 group-hover:bg-nebula-cyan/5 transition-all duration-700 rotate-3 group-hover:rotate-0">
                                        <FileText size={24} className="text-slate-600 group-hover:text-nebula-cyan" />
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                                        inv.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]' :
                                        inv.status === 'processing' ? 'bg-nebula-gold/10 border-nebula-gold/20 text-nebula-gold animate-pulse' :
                                        'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}>
                                        {inv.status === 'completed' ? <CheckCircle2 size={10} /> : inv.status === 'processing' ? <Zap size={10} /> : <AlertCircle size={10} />}
                                        {inv.status}
                                    </div>
                                </div>

                                <div className="space-y-1 mb-8">
                                    <h4 className="text-lg font-black text-white italic tracking-tight uppercase group-hover:text-nebula-cyan transition-colors truncate">ARTIFACT: REQ_{inv.id}</h4>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Clock size={12} />
                                        <span className="text-[10px] font-bold tracking-[0.1em] uppercase">{new Date(inv.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {inv.parsed_data ? (
                                    <div className="space-y-4 pt-6 border-t border-white/10 group-hover:border-nebula-cyan/20 transition-all">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black tracking-widest text-slate-700 uppercase">Vendor Node</span>
                                            <span className="text-[13px] font-black text-slate-300 uppercase tracking-tight">{inv.parsed_data.vendor || 'UNKNOWN'}</span>
                                        </div>
                                        <div className="flex justify-between items-center group-hover:scale-110 transition-transform origin-right">
                                            <span className="text-[9px] font-black tracking-widest text-slate-700 uppercase">Total Credits</span>
                                            <span className="text-[16px] font-black text-nebula-cyan shadow-sm italic leading-none">{inv.parsed_data.total || '0.00'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-14 flex items-center justify-center border-t border-white/5 pt-6">
                                        <p className="text-[10px] font-black tracking-[0.3em] text-slate-800 uppercase italic animate-pulse">Scanning Neural Paths...</p>
                                    </div>
                                )}
                                
                                <div className="mt-8 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-700 flex justify-between items-center">
                                   <span className="text-[9px] font-bold text-slate-700 uppercase italic">Encrypted Connection Stable</span>
                                   <div className="p-2 border border-white/5 rounded-xl text-slate-600 hover:text-red-400 transition-all cursor-pointer">
                                      <Trash2 size={12} />
                                   </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

const StatusStat = ({ label, value, icon, color }) => {
  const colors = {
    cyan: 'text-nebula-cyan',
    gold: 'text-nebula-gold',
    purple: 'text-nebula-purple'
  };
  return (
    <div className="flex items-center gap-5">
      <div className={`p-2.5 rounded-xl bg-white/[0.03] border border-white/5 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-[14px] font-black text-white italic tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default InvoiceManager;
