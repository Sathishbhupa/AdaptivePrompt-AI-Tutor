'use client';
import { apiFetch } from '../../lib/api';
import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, Loader2, MessageCircle, Plus, Send, Sparkles, Trash2 } from 'lucide-react';
import { supabaseBrowser } from '../../lib/supabase';
type Msg={id?:string;role:'user'|'assistant';content:string};type Session={id:string;title:string;updated_at:string};const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000';
export default function Chat(){
 const[sessions,setSessions]=useState<Session[]>([]),[sessionId,setSessionId]=useState(''),[messages,setMessages]=useState<Msg[]>([]),[text,setText]=useState(''),[loading,setLoading]=useState(false),[loadingSession,setLoadingSession]=useState(false),[error,setError]=useState(''),[sessionsLoading,setSessionsLoading]=useState(true),[provider,setProvider]=useState<'auto'|'gemini'|'groq'>('auto'),[providerOpen,setProviderOpen]=useState(false);

 useEffect(()=>{const saved=localStorage.getItem('apt-ai-provider');if(saved==='gemini'||saved==='groq'||saved==='auto')setProvider(saved)},[]);useEffect(()=>{localStorage.setItem('apt-ai-provider',provider)},[provider]);
 async function loadSessions(){
   setSessionsLoading(true); setError('');
   try{
     const r=await apiFetch('/api/chat/sessions'); const b=await r.json();
     if(!r.ok) throw new Error(b.detail||'Could not load chats');
     setSessions(b.sessions||[]);
   }catch(e){setError(e instanceof Error?e.message:'Could not load chats')}finally{setSessionsLoading(false)}
 }
 async function loadSession(id:string){
   if(id===sessionId)return;
   setLoadingSession(true);setError('');
   try{
     const r=await apiFetch(`/api/chat/sessions/${id}`);const b=await r.json();
     if(!r.ok) throw new Error(b.detail||'Could not load chat');
     setSessionId(id);setMessages((b.messages||[]).filter((m:any)=>m.role!=='system'));
   }catch(e){setError(e instanceof Error?e.message:'Could not load chat')}finally{setLoadingSession(false)}
 }
 function selectProvider(value:'auto'|'gemini'|'groq'){setProvider(value);setProviderOpen(false)}
 useEffect(()=>{loadSessions()},[]);
 function newChat(){setSessionId('');setMessages([]);setText('');setError('')}
 async function deleteSession(id:string){
   if(!window.confirm('Delete this conversation? This cannot be undone.'))return;
   try{
     const r=await apiFetch(`/api/chat/sessions/${id}`,{method:'DELETE'});const b=await r.json();
     if(!r.ok)throw new Error(b.detail||'Could not delete chat');
     setSessions(prev=>prev.filter(s=>s.id!==id));
     if(sessionId===id)newChat();
   }catch(e){setError(e instanceof Error?e.message:'Could not delete chat')}
 }
 async function send(e:FormEvent){
   e.preventDefault();if(!text.trim()||loading)return;setLoading(true);setError('');
   const outgoing=text.trim();setText('');setMessages(m=>[...m,{role:'user',content:outgoing}]);
   try{
     const r=await apiFetch('/api/chat/message',{method:'POST',body:JSON.stringify({session_id:sessionId||null,message:outgoing,provider})});
     const b=await r.json();if(!r.ok)throw new Error(b.detail||'Chat failed');
     setSessionId(b.session_id);setMessages(m=>[...m,{role:'assistant',content:b.reply}]);await loadSessions();
   }catch(e){setError(e instanceof Error?e.message:'Chat failed');setMessages(m=>m.slice(0,-1))}
   finally{setLoading(false)}
 }
 const active=sessions.find(s=>s.id===sessionId);
 return <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-7">
  <div className="grid min-h-[calc(100vh-120px)] gap-4 lg:grid-cols-[300px_1fr]">
   <aside className="hidden rounded-3xl border border-violet-100 bg-white p-3 shadow-sm lg:flex lg:flex-col">
    <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-4 text-white">
      <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-violet-200">Chat mode</p><h1 className="mt-1 text-lg font-black">Conversations</h1></div><MessageCircle size={23}/></div>
      <button onClick={newChat} className="button-pop mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 text-sm font-bold backdrop-blur hover:bg-white/25"><Plus size={16}/> New chat</button>
    </div>
    <div className="mt-3 flex-1 space-y-1 overflow-y-auto pr-1">
      {sessionsLoading?<p className="p-3 text-xs text-slate-400">Loading conversations…</p>:sessions.map(s=><div key={s.id} className={`group flex items-center gap-1 rounded-2xl transition ${s.id===sessionId?'bg-violet-50 shadow-sm':'hover:bg-slate-50'}`}>
        <button onClick={()=>loadSession(s.id)} className={`focus-ring min-w-0 flex-1 rounded-2xl px-3 py-3 text-left text-sm ${s.id===sessionId?'text-violet-800':'text-slate-600'}`}><span className="block truncate font-bold">{s.title||'New chat'}</span><span className="mt-1 block text-xs text-slate-400">{new Date(s.updated_at).toLocaleDateString()}</span></button>
        <button onClick={()=>deleteSession(s.id)} aria-label={`Delete ${s.title||'chat'}`} className="mr-2 rounded-lg p-2 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus:opacity-100"><Trash2 size={15}/></button>
      </div>)}
      {!sessionsLoading&&!sessions.length&&<div className="p-4 text-center"><p className="text-sm font-bold text-slate-500">No saved chats</p><p className="mt-1 text-xs leading-5 text-slate-400">Start a new conversation below.</p></div>}
    </div>
   </aside>
   <section className="flex min-h-[78vh] flex-col overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-xl shadow-violet-950/5">
    <header className="relative z-30 overflow-visible border-b border-violet-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 px-5 py-4 sm:px-7">
      <div className="absolute -right-10 -top-16 h-36 w-36 rounded-full bg-violet-300/30 blur-3xl"/>
      <div className="relative flex flex-wrap items-center justify-between gap-3">
       <div className="flex min-w-0 items-center gap-3"><img src="/logo-2.png" alt="" className="h-12 w-12 float-delay"/><div className="min-w-0"><div className="flex items-center gap-2"><p className="font-black text-violet-800">AdaptivePrompt Chat</p><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">CASUAL</span></div><p className="mt-1 truncate text-xs text-slate-500">{active?.title||'New conversation'}{loadingSession?' · Loading…':''}</p></div></div>
       <div className="flex items-center gap-2">
        <div className="relative">
         <button type="button" aria-haspopup="listbox" aria-expanded={providerOpen} onClick={()=>setProviderOpen(v=>!v)} className="chat-provider-trigger focus-ring inline-flex min-w-[154px] items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-white px-3.5 py-2.5 text-left shadow-sm">
          <span className="flex items-center gap-2.5"><ProviderIcon provider={provider}/><span><span className="block text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">AI provider</span><span className="block text-xs font-black text-violet-800">{providerLabel(provider)}</span></span></span>
          <ChevronDown size={15} className={`text-violet-400 transition-transform ${providerOpen?'rotate-180':''}`}/>
         </button>
         {providerOpen&&<div role="listbox" aria-label="Choose AI provider" className="chat-provider-menu absolute right-0 top-[calc(100%+8px)] z-[100] w-56 overflow-hidden rounded-2xl border border-violet-100 bg-white p-1.5 shadow-2xl shadow-violet-950/15">
          <ProviderOption active={provider==='auto'} value="auto" title="Auto" subtitle="Best available provider" onClick={()=>selectProvider('auto')}/>
          <ProviderOption active={provider==='gemini'} value="gemini" title="Gemini" subtitle="Google AI" onClick={()=>selectProvider('gemini')}/>
          <ProviderOption active={provider==='groq'} value="groq" title="Groq" subtitle="Fast inference" onClick={()=>selectProvider('groq')}/>
         </div>}
        </div>
        <select aria-label="Switch conversation" value={sessionId} onChange={e=>e.target.value?loadSession(e.target.value):newChat()} className="max-w-[170px] rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs font-bold text-violet-700 outline-none lg:hidden"><option value="">＋ New chat</option>{sessions.map(s=><option key={s.id} value={s.id}>{s.title||'New chat'}</option>)}</select>
       </div>
      </div>
    </header>
    <div className="relative z-0 flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top_right,#f5f3ff,transparent_35%),#fff] p-5 sm:p-7">
      {!messages.length&&<div className="mx-auto mt-14 max-w-lg text-center fade-up"><div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-700 shadow-sm"><MessageCircle size={28}/></div><h2 className="mt-5 text-2xl font-black">{sessionId?'This chat is empty':'What’s on your mind?'}</h2><p className="mt-2 leading-7 text-slate-500">{sessionId?'Send a message to continue this conversation.':'Start a fresh conversation, or select an older chat from the list.'}</p><div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-violet-700"><button onClick={()=>setText('Brainstorm an idea for my project')} className="rounded-full bg-violet-50 px-3 py-2 hover:bg-violet-100">Brainstorm an idea</button><button onClick={()=>setText('Help me plan my study day')} className="rounded-full bg-fuchsia-50 px-3 py-2 hover:bg-fuchsia-100">Plan my study day</button></div></div>}
      {messages.map((m,i)=><div key={m.id||i} className={`fade-up flex ${m.role==='user'?'justify-end':'justify-start'}`}><div className={`max-w-[88%] whitespace-pre-wrap rounded-3xl px-4 py-3.5 leading-7 shadow-sm ${m.role==='user'?'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white':'border border-slate-200 bg-white text-slate-800'}`}>{m.content}</div></div>)}
      {loading&&<div className="flex items-center gap-2 text-sm font-medium text-slate-400"><Loader2 size={16} className="animate-spin"/> Thinking…</div>}
    </div>
    {error&&<p className="mx-5 mb-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={send} className="border-t border-slate-100 bg-white p-4 sm:p-5"><div className="flex gap-2 rounded-2xl border border-violet-100 bg-violet-50/40 p-2 focus-within:border-violet-300 focus-within:bg-white"><textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(e as any)}}} className="focus-ring min-h-12 flex-1 resize-none border-0 bg-transparent p-2 outline-none" placeholder="Message AdaptivePrompt Chat…"/><button disabled={loading||!text.trim()} aria-label="Send message" className="button-pop self-end rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-3 font-bold text-white disabled:opacity-40"><Send size={18}/></button></div><p className="mt-2 text-[11px] text-slate-400">Enter to send · Shift+Enter for a new line</p></form>
   </section>
  </div>
 </main>
}
function providerLabel(provider:'auto'|'gemini'|'groq'){return provider==='gemini'?'Gemini':provider==='groq'?'Groq':'Auto'}
function ProviderIcon({provider}:{provider:'auto'|'gemini'|'groq'}){return <span className={`provider-icon provider-${provider}`}>{provider==='gemini'?'G':provider==='groq'?'⚡':'✦'}</span>}
function ProviderOption({active,value,title,subtitle,onClick}:{active:boolean;value:'auto'|'gemini'|'groq';title:string;subtitle:string;onClick:()=>void}){return <button type="button" role="option" aria-selected={active} onClick={onClick} className={`provider-option flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${active?'active':''}`}><ProviderIcon provider={value}/><span className="min-w-0 flex-1"><span className="block text-sm font-black text-slate-900">{title}</span><span className="block text-[11px] text-slate-500">{subtitle}</span></span>{active&&<CheckCircle2 size={16} className="text-violet-600"/>}</button>}
