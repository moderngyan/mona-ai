import React, { useState, useRef, useEffect, useCallback } from 'react';

const FloatingInputBar = ({ onSend, isGenerating, onStop, onOpenVoice }) => {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    // Focus textarea when not generating
    useEffect(() => {
        if (!isGenerating && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isGenerating]);

    // Stop recognition on unmount
    useEffect(() => {
        return () => { if (recognitionRef.current) recognitionRef.current.abort(); };
    }, []);

    const handleSend = () => {
        if ((!input.trim() && attachedFiles.length === 0) || isGenerating) return;

        // Build message text, mention attached files
        let messageText = input.trim();
        if (attachedFiles.length > 0) {
            const fileNames = attachedFiles.map(f => f.name).join(', ');
            messageText = messageText
                ? `${messageText}\n\n[Attached files: ${fileNames}]`
                : `[Attached files: ${fileNames}]`;
        }
        onSend(messageText, attachedFiles);
        setInput('');
        setAttachedFiles([]);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const newFiles = files.map(file => {
            const isImage = file.type.startsWith('image/');
            return {
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                url: isImage ? URL.createObjectURL(file) : null
            };
        });

        setAttachedFiles(prev => [...prev, ...newFiles]);
        e.target.value = ''; // Reset so same file can be re-selected
        setTimeout(() => textareaRef.current?.focus(), 50);
    };

    const removeFile = (idx) => {
        setAttachedFiles(prev => {
            const updated = [...prev];
            const file = updated[idx];
            if (file.url) URL.revokeObjectURL(file.url);
            updated.splice(idx, 1);
            return updated;
        });
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4 lg:px-6">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json,.md"
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="relative bg-chatgpt-message rounded-[26px] border border-white/10 shadow-lg flex flex-col min-h-[52px]">

                {/* Attached files preview */}
                {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1">
                        {attachedFiles.map((f, i) => (
                            <div key={i} className="relative group flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-2 py-1.5 max-w-[160px]">
                                {f.url ? (
                                    <img src={f.url} alt={f.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                ) : (
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-xs">📄</div>
                                )}
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs text-white truncate max-w-[90px]">{f.name}</span>
                                    <span className="text-[10px] text-white/40">{formatSize(f.size)}</span>
                                </div>
                                <button
                                    onClick={() => removeFile(i)}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#3a3a3a] border border-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white"
                                >
                                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input row */}
                <div className="flex items-end px-2">
                    {/* Direct Attachment button */}
                    <div className="mb-2 ml-1 shrink-0">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Add attachments"
                            className="w-10 h-10 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center shrink-0"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                            </svg>
                        </button>
                    </div>

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        disabled={isGenerating}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                        }}
                        placeholder={isListening ? '🎙️ Listening...' : isGenerating ? 'Mona is thinking...' : 'Ask anything'}
                        className="flex-1 bg-transparent border-none outline-none focus:ring-0 focus:outline-none text-[15px] pt-4 pb-4 pl-3 pr-3 text-white placeholder-chatgpt-subtext/70 resize-none scrollbar-hide font-sans disabled:opacity-60"
                    />

                    {/* Voice button */}
                    {!isGenerating && (
                        <button
                            onClick={onOpenVoice}
                            title="Voice mode"
                            className="mb-2 mr-1 w-9 h-9 rounded-full transition-all flex items-center justify-center shrink-0 bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor"/>
                                <path d="M5 12a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                    )}

                    {/* Send / Stop button */}
                    {isGenerating ? (
                        <button
                            onClick={onStop}
                            title="Stop generating"
                            className="mb-2 mr-1 w-9 h-9 rounded-full bg-white text-black hover:bg-gray-200 transition-all flex items-center justify-center shrink-0 shadow-md"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="4" y="4" width="16" height="16" rx="2" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() && attachedFiles.length === 0}
                            title="Send message (Enter)"
                            className={`mb-2 mr-1 w-9 h-9 rounded-full transition-all flex items-center justify-center shrink-0
                                ${(input.trim() || attachedFiles.length > 0)
                                    ? 'bg-white text-black hover:bg-gray-200 shadow-md'
                                    : 'bg-white/10 text-white/20 cursor-not-allowed'}`}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path fillRule="evenodd" clipRule="evenodd"
                                    d="M11 19.5V6.70711L6.35355 11.3536L4.93934 9.93934L12 2.87868L19.0607 9.93934L17.6464 11.3536L13 6.70711V19.5H11Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="text-center mt-2.5 text-xs text-chatgpt-subtext/50">
                Mona AI can make mistakes. Consider verifying important information.
            </div>
        </div>
    );
};

export default FloatingInputBar;
