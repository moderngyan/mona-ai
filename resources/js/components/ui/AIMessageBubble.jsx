import React, { useMemo, useState } from 'react';

/* ─── Minimal markdown renderer ─── */
function renderMarkdown(text) {
  if (!text) return [];

  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  let keyIdx = 0;

  while (i < lines.length) {
    const line = lines[i];

    /* ── Fenced code block ── */
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || 'code';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <CodeBlock key={keyIdx++} lang={lang} code={codeLines.join('\n')} />
      );
      i++; // skip closing ```
      continue;
    }

    /* ── Horizontal rule ── */
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={keyIdx++} className="border-white/10 my-4" />);
      i++; continue;
    }

    /* ── Headings ── */
    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);
    if (h1) { elements.push(<h1 key={keyIdx++} className="text-2xl font-bold text-white mt-6 mb-2">{inlineRender(h1[1])}</h1>); i++; continue; }
    if (h2) { elements.push(<h2 key={keyIdx++} className="text-xl font-bold text-white mt-5 mb-2">{inlineRender(h2[1])}</h2>); i++; continue; }
    if (h3) { elements.push(<h3 key={keyIdx++} className="text-base font-bold text-white mt-4 mb-1">{inlineRender(h3[1])}</h3>); i++; continue; }

    /* ── Unordered list ── */
    if (/^[-*+]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push(<li key={i} className="mb-0.5">{inlineRender(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(
        <ul key={keyIdx++} className="list-none pl-0 my-2 space-y-0.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2.5 items-start">
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
              <span className="text-[15px] leading-7">{item.props.children}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    /* ── Ordered list ── */
    const olMatch = line.match(/^(\d+)\.\s(.*)/);
    if (olMatch) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        const m = lines[i].match(/^(\d+)\.\s(.*)/);
        items.push({ num: m[1], text: m[2] });
        i++;
      }
      elements.push(
        <ol key={keyIdx++} className="pl-0 my-2 space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-3 items-start">
              <span className="text-[13px] font-mono text-white/40 mt-1 shrink-0 w-5 text-right font-bold">{item.num}.</span>
              <span className="text-[15px] leading-7">{inlineRender(item.text)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    /* ── Blank line ── */
    if (line.trim() === '') {
      elements.push(<div key={keyIdx++} className="h-3" />);
      i++; continue;
    }

    /* ── Normal paragraph ── */
    elements.push(
      <p key={keyIdx++} className="text-[15.5px] leading-7 text-chatgpt-text mb-3">
        {inlineRender(line)}
      </p>
    );
    i++;
  }

  return elements;
}

/* ─── Inline markdown: bold, italic, code, links ─── */
function inlineRender(text) {
  if (!text) return null;
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)/s);
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
    const italicMatch = remaining.match(/^(.*?)\*(.+?)\*(.*)/s);

    const codeIdx  = codeMatch  ? codeMatch[1].length  : Infinity;
    const boldIdx  = boldMatch  ? boldMatch[1].length  : Infinity;
    const italicIdx = italicMatch ? italicMatch[1].length : Infinity;
    const minIdx = Math.min(codeIdx, boldIdx, italicIdx);

    if (minIdx === Infinity) {
      parts.push(remaining);
      break;
    }

    if (minIdx === codeIdx && codeMatch) {
      if (codeMatch[1]) parts.push(codeMatch[1]);
      parts.push(<code key={key++} className="px-1.5 py-0.5 rounded-md bg-white/10 font-mono text-[13.5px] text-[#e6c07b] font-medium">{codeMatch[2]}</code>);
      remaining = codeMatch[3];
    } else if (minIdx === boldIdx && boldMatch) {
      if (boldMatch[1]) parts.push(boldMatch[1]);
      parts.push(<strong key={key++} className="font-bold text-white">{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
    } else if (minIdx === italicIdx && italicMatch) {
      if (italicMatch[1]) parts.push(italicMatch[1]);
      parts.push(<em key={key++} className="italic text-white/80">{italicMatch[2]}</em>);
      remaining = italicMatch[3];
    }
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}

const CodeBlock = ({ lang, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5">
        <span className="text-[11px] font-mono text-white/30 uppercase tracking-[0.2em] font-bold">{lang}</span>
        <button
          onClick={handleCopy}
          className="text-[11px] text-white/30 hover:text-white/80 transition-all flex items-center gap-1.5 font-bold uppercase tracking-wider"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13.5px] leading-6 font-mono text-[#dcdcdc] bg-transparent">
        <code>{code}</code>
      </pre>
    </div>
  );
};

/* ─── Main Component ─── */
const AIMessageBubble = ({ role, content, attachments, isLast, isGenerating, isSearching, sources }) => {
  const [copiedMain, setCopiedMain] = useState(false);
  const [expandedImg, setExpandedImg] = useState(null);
  const isAi = role === 'assistant';
  const showCursor = isAi && isLast && isGenerating;
  const showDots = isAi && isLast && isGenerating && !content && !isSearching;

  const handleCopyMain = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopiedMain(true);
    setTimeout(() => setCopiedMain(false), 2000);
  };

  const rendered = useMemo(() => {
    if (!isAi || !content) return null;
    return renderMarkdown(content);
  }, [isAi, content]);

  // Strip the [Attached files: ...] tag from user display text
  const displayContent = !isAi && content
    ? content.replace(/\n?\[Attached files:[^\]]*\]/g, '').trim()
    : content;

  const imageAttachments = attachments?.filter(a => a.url) || [];
  const fileAttachments = attachments?.filter(a => !a.url) || [];

  if (!isAi) {
    return (
      <>
        {/* Image lightbox */}
        {expandedImg && (
          <div
            className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setExpandedImg(null)}
          >
            <img src={expandedImg} alt="Attachment" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" />
          </div>
        )}
        <div className="flex flex-col items-end mb-6 px-2 gap-2">
          {/* Image grid */}
          {imageAttachments.length > 0 && (
            <div className={`flex flex-wrap gap-2 justify-end max-w-[80%]`}>
              {imageAttachments.map((f, i) => (
                <img
                  key={i}
                  src={f.url}
                  alt={f.name}
                  onClick={() => setExpandedImg(f.url)}
                  className="w-40 h-40 object-cover rounded-2xl border border-white/10 cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                />
              ))}
            </div>
          )}
          {/* File chips */}
          {fileAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end max-w-[80%]">
              {fileAttachments.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#2f2f2f] border border-white/10 rounded-xl px-3 py-2">
                  <span className="text-base">📄</span>
                  <span className="text-xs text-white/80 max-w-[120px] truncate">{f.name}</span>
                </div>
              ))}
            </div>
          )}
          {/* Text bubble */}
          {displayContent && (
            <div className="max-w-[80%] bg-[#2f2f2f] rounded-[24px] px-5 py-3 text-[15.5px] leading-7 text-white shadow-sm whitespace-pre-wrap break-words border border-white/5">
              {displayContent}
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="flex gap-4 mb-8 px-2 group">
      <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden shadow-md mt-1">
        <img src="/assets/images/icon.png" alt="Mona AI" className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0 pt-0.5 space-y-3">
        {/* Search Reasoning UI */}
        {(isSearching || (sources && sources.length > 0)) && (
          <div className="flex flex-col gap-3 py-2 animate-in fade-in slide-in-from-top-2 duration-500">
            {isSearching && (
              <div className="flex items-center gap-3 text-sm text-white/50 bg-white/5 border border-white/5 rounded-2xl px-4 py-2.5 w-fit">
                 <div className="relative">
                    <div className="absolute inset-0 bg-[#10a37f]/20 rounded-full animate-ping scale-150 opacity-50" />
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#10a37f] relative z-10 animate-spin-slow">
                        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20"/>
                    </svg>
                 </div>
                 <span className="font-medium tracking-wide">Searching the web...</span>
              </div>
            )}
            
            {sources && sources.length > 0 && (
               <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
                  {sources.map((s, i) => (
                    <a 
                      key={i} 
                      href={s.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-[12px] font-medium text-white/60 hover:text-white transition-all whitespace-nowrap group/source"
                    >
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${new URL(s.url).hostname}&sz=32`} 
                        alt="" 
                        className="w-4 h-4 rounded-sm opacity-60 group-hover/source:opacity-100 transition-opacity" 
                        onError={(e) => e.target.style.display = 'none'}
                      />
                      <span className="truncate max-w-[120px]">{s.title}</span>
                    </a>
                  ))}
               </div>
            )}
          </div>
        )}

        {showDots ? (
          <div className="flex gap-1.5 py-4 pl-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                style={{ animationDelay: `${i * 120}ms`, animationDuration: '0.9s' }}
              />
            ))}
          </div>
        ) : (
          <div className="max-w-none text-chatgpt-text">
            {rendered}

            {showCursor && content && (
              <span className="inline-flex gap-[3.5px] items-center ml-2 align-middle mb-0.5 opacity-60">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-[5px] h-[5px] rounded-full bg-white animate-bounce"
                    style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.8s' }}
                  />
                ))}
              </span>
            )}
          </div>
        )}

        {isAi && content && !isGenerating && (
          <div className="flex gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pl-1">
            <button
              onClick={handleCopyMain}
              className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest transition-all px-2.5 py-1.5 rounded-lg border ${copiedMain ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 text-chatgpt-subtext hover:text-white hover:bg-white/10'}`}
            >
              {copiedMain ? (
                <>
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                   Copied
                </>
              ) : (
                <>
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                   Copy
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMessageBubble;
