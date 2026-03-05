import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal';

const Sidebar = ({ onNewChat, history, onLoadChat, activeChatId, onDeleteChat, onLogout, user, onOpenSettings }) => {
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDeleteChat(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <aside className="w-[260px] flex-shrink-0 bg-chatgpt-sidebar h-screen flex flex-col hidden md:flex text-chatgpt-text font-sans border-r border-white/5">
        
        {/* Top action area */}
        <div className="p-3">
          <button 
            onClick={onNewChat}
            className="w-full flex items-center justify-between gap-3 px-3 h-10 rounded-lg hover:bg-chatgpt-hover transition-colors group"
          >
            <div className="flex items-center gap-2 truncate">
               <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 shadow-sm">
                 <img src="/assets/images/icon.png" alt="Mona AI" className="w-full h-full object-cover" />
               </div>
               <span className="text-sm font-semibold truncate">New chat</span>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-chatgpt-text opacity-70 group-hover:opacity-100 transition-opacity"><path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto pt-2 px-3 pb-4 scrollbar-hide">
          <div className="flex flex-col gap-1">
            <div className="px-3 pb-2 text-[11px] font-bold text-chatgpt-subtext uppercase tracking-widest opacity-50">Recent Conversations</div>
            
            {history.length === 0 && (
              <div className="px-3 py-4 text-xs text-chatgpt-subtext italic">No history yet</div>
            )}

            {history.map(chat => (
              <div 
                key={chat.id}
                className={`group relative flex items-center rounded-xl transition-all ${activeChatId === chat.id ? 'bg-[#212121]' : 'hover:bg-[#2a2a2a]'}`}
              >
                <button
                  onClick={() => onLoadChat(chat)}
                  className="flex-1 text-left flex items-center gap-3 px-3 py-2.5 text-sm truncate"
                >
                  <div className="truncate relative w-full pr-6 text-chatgpt-text font-medium">
                     {chat.messages && chat.messages[0] ? chat.messages[0].content : 'New Chat'}
                     {/* Fade gradient for text overflow */}
                     <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l ${activeChatId === chat.id ? 'from-[#212121]' : 'from-transparent group-hover:from-[#2a2a2a]'}`} />
                  </div>
                </button>

                {/* Action Icons (Delete) - Visible on hover or active */}
                <div className={`absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${activeChatId === chat.id ? 'opacity-100' : ''}`}>
                   <button 
                     onClick={(e) => handleDeleteClick(e, chat.id)}
                     className="p-1.5 rounded-md hover:bg-white/10 text-chatgpt-subtext hover:text-red-400 transition-all"
                     title="Delete conversation"
                   >
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2-2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Profile Area */}
        <div className="p-3 border-t border-white/5 bg-chatgpt-sidebar">
           <div className="flex flex-col gap-1">
              <button 
                onClick={onOpenSettings}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-[#2a2a2a] transition-colors text-sm font-medium"
              >
                 <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                 Settings
              </button>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium group"
              >
                 <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:text-red-400 transition-colors" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                 Log out
              </button>
           </div>
        </div>
      </aside>

      <ConfirmModal 
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default Sidebar;
