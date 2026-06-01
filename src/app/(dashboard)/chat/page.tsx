'use client';
import { useState, useMemo } from 'react';
import { Search, Send, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetChatMessagesQuery, useCreateChatMessageMutation } from '@/store/api';

export default function ChatPage() {
  const { data: response, isLoading, error } = useGetChatMessagesQuery({});
  const [createMessage, { isLoading: isSending }] = useCreateChatMessageMutation();
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const messages = response?.data || [];

  // Group messages by a dynamic thread/user concept since Strapi might be flat
  const conversations = useMemo(() => {
    const map = new Map<string, any>();
    
    // Process messages into threads based on sender or threadId
    messages.forEach((msg: any) => {
      const threadId = msg.threadId || msg.user?.documentId || msg.senderName || 'General Support';
      
      if (!map.has(threadId)) {
        map.set(threadId, {
          id: threadId,
          user: msg.user?.username || msg.senderName || 'User',
          role: msg.user?.role?.name || 'Customer',
          lastMessage: msg.content || msg.message || 'No content',
          time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: !msg.isRead,
          status: msg.status || 'active',
          messages: []
        });
      }
      
      const conv = map.get(threadId);
      conv.messages.push(msg);
      conv.lastMessage = msg.content || msg.message || conv.lastMessage;
      conv.time = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
    
    return Array.from(map.values()).sort((a, b) => b.unread ? 1 : -1);
  }, [messages]);

  // Set initial active chat
  if (!activeChatId && conversations.length > 0) {
    setActiveChatId(conversations[0].id);
  }

  const activeConversation = conversations.find(c => c.id === activeChatId) || conversations[0];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversation) return;

    try {
      await createMessage({
        content: replyText,
        message: replyText,
        threadId: activeConversation.id,
        senderName: 'Admin',
        isAdminReply: true,
      }).unwrap();
      setReplyText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center bg-card rounded-xl shadow-sm border border-border">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Loading chat threads from Strapi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center bg-card rounded-xl shadow-sm border border-border">
        <div className="flex flex-col items-center text-red-500">
          <AlertCircle className="w-8 h-8 mb-4" />
          <p className="font-medium">Failed to load chat. Check Strapi connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      
      <div className="w-1/3 border-r border-border flex flex-col bg-muted/20">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg text-foreground mb-4">Messages & Support</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No messages found.
            </div>
          ) : (
            conversations.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={cn(
                  "p-4 border-b border-border/50 cursor-pointer transition-colors",
                  activeChatId === chat.id ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-muted/50 border-l-4 border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium", chat.unread ? "text-foreground" : "text-muted-foreground")}>
                      {chat.user}
                    </span>
                    {chat.status === 'urgent' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                    {chat.status === 'resolved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    {chat.status === 'active' && <Clock className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={cn("text-sm truncate pr-4", chat.unread ? "text-foreground font-medium" : "text-muted-foreground")}>
                    {chat.lastMessage}
                  </p>
                  {chat.unread && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                  )}
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-2 inline-block">
                  {chat.role}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-background">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-border flex justify-between items-center bg-card">
              <div>
                <h3 className="font-semibold text-foreground">{activeConversation.user}</h3>
                <p className="text-xs text-muted-foreground">Support Ticket / Thread #{activeConversation.id.toString().substring(0,6)}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-md hover:bg-emerald-500/20 transition-colors">
                  Mark Resolved
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {activeConversation.messages.map((msg: any, idx: number) => {
                const isAdmin = msg.isAdminReply || msg.senderName === 'Admin';
                return (
                  <div key={idx} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[70%] p-3 rounded-2xl text-sm border",
                      isAdmin 
                        ? "bg-primary text-primary-foreground rounded-tr-sm border-transparent" 
                        : "bg-muted/50 text-foreground border-border rounded-tl-sm"
                    )}>
                      {msg.content || msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-border bg-card">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply to the user..." 
                  className="w-full pl-4 pr-12 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
                <button 
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Send className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
