import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceMode = ({ isOpen, onClose, onTranscript }) => {
    const [status, setStatus] = useState('Listening...'); // Listening, Thinking, Speaking
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const [visualizerData, setVisualizerData] = useState(new Array(30).fill(10));

    useEffect(() => {
        if (isOpen) {
            startRecognition();
        } else {
            stopRecognition();
        }
    }, [isOpen]);

    // Animate the voice visualizer when listening
    useEffect(() => {
        let interval;
        if (isOpen && status === 'Listening...') {
            interval = setInterval(() => {
                setVisualizerData(prev => prev.map(() => 5 + Math.random() * 40));
            }, 100);
        } else {
            setVisualizerData(new Array(30).fill(10));
        }
        return () => clearInterval(interval);
    }, [isOpen, status]);

    const startRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition not supported');
            onClose();
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setStatus('Listening...');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            if (transcript.trim()) {
                setStatus('Thinking...');
                // Give it a tiny delay to feel more natural before closing and sending
                setTimeout(() => {
                    onTranscript(transcript);
                    onClose();
                }, 800);
            }
        };

        recognition.onerror = () => {
            setIsListening(false);
            onClose();
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6"
                >
                    {/* Background Glow */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#10a37f]/10 blur-[120px] rounded-full animate-pulse" />
                    </div>

                    <div className="relative flex flex-col items-center gap-12 max-w-lg w-full">
                        {/* Title */}
                        <div className="text-center">
                            <h2 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Mona AI Voice Mode</h2>
                            <p className="text-white text-3xl font-medium">{status}</p>
                        </div>

                        {/* Visualizer Sphere */}
                        <div className="relative w-64 h-64 flex items-center justify-center">
                            <motion.div 
                                animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="absolute inset-0 bg-gradient-to-tr from-[#10a37f]/20 via-[#10a37f]/40 to-white/10 rounded-full blur-2xl"
                            />
                            <div className="flex items-center justify-center gap-1.5 h-20">
                                {visualizerData.map((val, i) => (
                                    <motion.div 
                                        key={i}
                                        className="w-1.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                        animate={{ height: val }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-8">
                            <p className="text-white/50 text-center text-sm px-8">
                                I'm listening to your voice. Simply speak and I'll respond as soon as you finish.
                            </p>

                            {/* Controls */}
                            <button
                                onClick={onClose}
                                className="w-16 h-16 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all group"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-hover:scale-110 transition-transform">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VoiceMode;
