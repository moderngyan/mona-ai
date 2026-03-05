import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Sidebar from './ui/Sidebar';
import AIMessageBubble from './ui/AIMessageBubble';
import FloatingInputBar from './ui/FloatingInputBar';
import ModelSelector from './ui/ModelSelector';
import SettingsModal from './SettingsModal';
import VoiceMode from './ui/VoiceMode';

const NebulaChat = () => {
    const [messages, setMessages] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('tinyllama');
    const [history, setHistory] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);
    const [user, setUser] = useState(null);
    const scrollRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Character queue for true one-by-one typewriter effect
    const charQueueRef = useRef([]);
    const isAnimatingRef = useRef(false);
    const animFrameRef = useRef(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch(e) {}
        }
        
        const storedChatId = localStorage.getItem('activeChatId');
        fetchInitialData(storedChatId);
    }, []);

    useEffect(() => {
        if (activeChatId) {
            localStorage.setItem('activeChatId', activeChatId);
        } else {
            localStorage.removeItem('activeChatId');
        }
    }, [activeChatId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Drain character queue one character at a time using rAF
    const drainQueue = useCallback(() => {
        if (charQueueRef.current.length === 0) {
            isAnimatingRef.current = false;
            return;
        }
        const char = charQueueRef.current.shift();
        setMessages(prev => {
            const newMsgs = [...prev];
            const last = newMsgs[newMsgs.length - 1];
            if (last && last.role === 'assistant') {
                newMsgs[newMsgs.length - 1] = { ...last, content: last.content + char };
            }
            return newMsgs;
        });
        // Schedule next character — ~8ms per char ≈ 125 chars/sec (smooth typewriter)
        animFrameRef.current = setTimeout(drainQueue, 8);
    }, []);

    const startDraining = useCallback(() => {
        if (!isAnimatingRef.current) {
            isAnimatingRef.current = true;
            drainQueue();
        }
    }, [drainQueue]);

    const fetchInitialData = async (storedChatId = null) => {
        try {
            const modelsRes = await axios.get('/api/ollama/models').catch(() => ({ data: [] }));
            const historyRes = await axios.get('/api/history').catch(() => ({ data: [] }));

            const fetchedModels = Array.isArray(modelsRes.data) ? modelsRes.data : [];
            const finalModels = fetchedModels.length > 0 ? fetchedModels : [{ name: 'tinyllama' }];
            setModels(finalModels);

            const bestModel = finalModels.find(m => m.name.includes('llama3.2')) || finalModels[0];
            setSelectedModel(bestModel.name);
            
            const historyData = Array.isArray(historyRes.data) ? historyRes.data : [];
            setHistory(historyData);

            if (storedChatId) {
                const activeChat = historyData.find(c => String(c.id) === String(storedChatId));
                if (activeChat) {
                    loadChat(activeChat);
                }
            }
        } catch (err) {
            setModels([{ name: 'tinyllama' }]);
        }
    };

    const handleSendMessage = async (content, attachedFiles = []) => {
        if (isGenerating) return;

        // Clear any pending queue from previous stream
        charQueueRef.current = [];
        isAnimatingRef.current = false;
        if (animFrameRef.current) clearTimeout(animFrameRef.current);

        // Store file metadata (including object URLs for images) in the message
        const attachments = attachedFiles.map(f => ({
            name: f.name,
            type: f.type,
            size: f.size,
            url: f.url || null,  // object URL for images
        }));

        const userMsg = { role: 'user', content, attachments };
        setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }]);
        setIsGenerating(true);

        try {
            const token = localStorage.getItem('nebula_token');

            // Create abort controller for this stream
            abortControllerRef.current = new AbortController();

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/event-stream'
                },
                signal: abortControllerRef.current.signal,
                body: JSON.stringify({
                    chat_id: activeChatId,
                    message: content,
                    model: selectedModel,
                    provider: 'ollama'
                })
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const reader = res.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // incomplete line stays buffered

                for (let line of lines) {
                    line = line.trim();
                    if (!line.startsWith('data: ')) continue;
                    const dataStr = line.substring(6).trim();
                    if (!dataStr) continue;

                    try {
                        const data = JSON.parse(dataStr);

                        if (data.searching) {
                            setMessages(prev => {
                                const newMsgs = [...prev];
                                const last = newMsgs[newMsgs.length - 1];
                                if (last && last.role === 'assistant') {
                                    newMsgs[newMsgs.length - 1] = { ...last, isSearching: true };
                                }
                                return newMsgs;
                            });
                        }

                        if (data.sources) {
                            setMessages(prev => {
                                const newMsgs = [...prev];
                                const last = newMsgs[newMsgs.length - 1];
                                if (last && last.role === 'assistant') {
                                    newMsgs[newMsgs.length - 1] = { ...last, sources: data.sources };
                                }
                                return newMsgs;
                            });
                        }

                        if (typeof data.chunk === 'string') {
                            // When content starts, stop "searching" indicator
                            setMessages(prev => {
                                const newMsgs = [...prev];
                                const last = newMsgs[newMsgs.length - 1];
                                if (last && last.role === 'assistant' && last.isSearching) {
                                    newMsgs[newMsgs.length - 1] = { ...last, isSearching: false };
                                }
                                return newMsgs;
                            });

                            // Push every character of the chunk into the queue
                            for (const ch of data.chunk) {
                                charQueueRef.current.push(ch);
                            }
                            // Start draining if not already
                            startDraining();
                        }

                        if (data.done) setActiveChatId(data.chat_id);

                        if (data.error) {
                            charQueueRef.current.push(...'\n[Error: ' + data.error + ']');
                            startDraining();
                        }
                    } catch (e) {
                        console.warn('SSE parse warn:', e.message);
                    }
                }
            }

            // Flush remaining queue instantly after stream ends
            await new Promise(resolve => {
                const flushCheck = setInterval(() => {
                    if (charQueueRef.current.length === 0) {
                        clearInterval(flushCheck);
                        resolve();
                    }
                }, 50);
                // Max wait 10s
                setTimeout(() => { clearInterval(flushCheck); resolve(); }, 10000);
            });

            axios.get('/api/history').then(r => {
                if (Array.isArray(r.data)) setHistory(r.data);
            }).catch(() => {});

        } catch (err) {
            console.error('Stream error:', err);
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = {
                    ...newMsgs[newMsgs.length - 1],
                    content: 'Error: Could not connect to AI. Make sure Ollama is running.'
                };
                return newMsgs;
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        // Flush remaining queue instantly
        charQueueRef.current = [];
        isAnimatingRef.current = false;
        if (animFrameRef.current) clearTimeout(animFrameRef.current);
        setIsGenerating(false);
    };

    const startNewChat = () => {
        charQueueRef.current = [];
        isAnimatingRef.current = false;
        setMessages([]);
        setActiveChatId(null);
    };

    const loadChat = (chat) => {
        const msgs = (chat.messages || []).map(m => ({ role: m.role, content: m.content }));
        setMessages(msgs);
        setActiveChatId(chat.id);
    };

    const handleDeleteChat = async (id) => {
        try {
            await axios.delete(`/api/history/${id}`);
            setHistory(prev => prev.filter(c => c.id !== id));
            if (activeChatId === id) {
                startNewChat();
            }
        } catch (err) {
            console.error("Failed to delete chat.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('nebula_token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        window.location.reload();
    };

    return (
        <div className="flex h-screen w-full bg-chatgpt-main text-chatgpt-text font-sans selection:bg-white/20">
            <Sidebar
                onNewChat={startNewChat}
                history={history}
                onLoadChat={loadChat}
                activeChatId={activeChatId}
                onDeleteChat={handleDeleteChat}
                onLogout={handleLogout}
                user={user}
                onOpenSettings={() => setIsSettingsOpen(true)}
            />

            <main className="flex-1 flex flex-col relative h-full overflow-hidden">

                {/* Header */}
                <header className="h-14 flex items-center px-4 shrink-0 border-b border-white/5">
                    <ModelSelector
                        models={models}
                        selected={selectedModel}
                        onSelect={setSelectedModel}
                    />
                </header>

                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto scroll-smooth pt-4 pb-36"
                >
                    <div className="max-w-3xl mx-auto px-4">
                        {messages.length === 0 ? (
                            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6">
                                <div className="w-20 h-20 rounded-full overflow-hidden shadow-2xl">
                                    <img src="/assets/images/icon.png" alt="Mona AI" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-white mb-2">How can I help you today?</h2>
                                    <p className="text-chatgpt-subtext text-sm">Powered by {selectedModel}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center mt-2">
                                    {[
                                        'Explain quantum computing simply',
                                        'Write a Python REST API',
                                        'Debug my code',
                                        'Brainstorm startup ideas'
                                    ].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => handleSendMessage(s)}
                                            className="px-4 py-2 rounded-xl border border-white/10 bg-chatgpt-message text-chatgpt-subtext text-sm hover:bg-white/10 hover:text-white transition-all"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1 py-4">
                                {messages.map((msg, idx) => (
                                    <AIMessageBubble
                                        key={idx}
                                        role={msg.role}
                                        content={msg.content}
                                        attachments={msg.attachments}
                                        isSearching={msg.isSearching}
                                        sources={msg.sources}
                                        isLast={idx === messages.length - 1}
                                        isGenerating={isGenerating}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Input */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-chatgpt-main via-chatgpt-main/95 to-transparent pt-10 pb-6">
                <FloatingInputBar 
                    onSend={handleSendMessage} 
                    isGenerating={isGenerating} 
                    onStop={handleStop} 
                    onOpenVoice={() => setIsVoiceModeOpen(true)}
                />
                </div>
            </main>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                user={user}
            />

            <VoiceMode 
                isOpen={isVoiceModeOpen}
                onClose={() => setIsVoiceModeOpen(false)}
                onTranscript={(text) => handleSendMessage(text)}
            />
        </div>
    );
};

export default NebulaChat;
