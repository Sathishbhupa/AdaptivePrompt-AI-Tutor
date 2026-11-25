'use client';
import './globals.css';
import Link from 'next/link';
import { BookOpen, LayoutDashboard, MessageCircle, Sparkles, UserCircle, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { supabaseBrowser } from '../lib/supabase';

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><head><link rel="icon" href="/favicon.ico?v=2"/><link rel="shortcut icon" href="/favicon.ico?v=2"/><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2"/></head><body className="app-shell">
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="AdaptivePrompt Tutor home" className="group shrink-0"><img src="/logo.png" alt="AdaptivePrompt Tutor" className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"/></Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 rounded-2xl border border-slate-200/70 bg-white/70 p-1 shadow-sm sm:flex">
          <NavLink href="/tutor" icon={<BookOpen size={16}/>} label="Tutor" tone="blue" />
          <NavLink href="/chat" icon={<MessageCircle size={16}/>} label="Chat" tone="violet" />
          <NavLink href="/dashboard" icon={<LayoutDashboard size={16}/>} label="Dashboard" tone="slate" />
        </nav>
        <HeaderAccount/>
        <div className="flex items-center gap-2 sm:hidden"><Link href="/tutor" aria-label="Tutor" className="rounded-xl p-2 text-blue-700 hover:bg-blue-50"><BookOpen size={20}/></Link><Link href="/chat" aria-label="Chat" className="rounded-xl p-2 text-violet-700 hover:bg-violet-50"><MessageCircle size={20}/></Link><HeaderAccount mobile/></div>
      </div>
    </header>
    <main id="main">{children}</main>
  </body></html>
}
function HeaderAccount({mobile=false}:{mobile?:boolean}){
 const[user,setUser]=useState<any>(null),[open,setOpen]=useState(false),ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const s=supabaseBrowser();s.auth.getUser().then(({data})=>setUser(data.user));const {data:sub}=s.auth.onAuthStateChange((_e,session)=>setUser(session?.user??null));return()=>sub.subscription.unsubscribe()},[]);
 useEffect(()=>{const close=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};document.addEventListener('mousedown',close);return()=>document.removeEventListener('mousedown',close)},[]);
 if(!user)return <Link href="/auth" className={`${mobile?'':'hidden sm:flex'} button-pop items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15`}><Sparkles size={16}/> Get started</Link>;
 const name=user.user_metadata?.display_name||user.user_metadata?.full_name||user.email?.split('@')[0]||'Learner';
 const initials=name.split(/\s+/).map((x:string)=>x[0]).join('').slice(0,2).toUpperCase();
 return <div ref={ref} className="relative">
   <button onClick={()=>setOpen(!open)} aria-expanded={open} className={`${mobile?'p-1':'px-2.5 py-1.5'} button-pop flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 text-left`}>
    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-black text-white">{initials}</span>
    {!mobile&&<span className="hidden max-w-28 truncate text-sm font-bold text-slate-700 sm:block">{name}</span>}
    <ChevronDown size={15} className="text-slate-400"/>
   </button>
   {open&&<div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">
    <div className="border-b border-slate-100 px-3 py-2"><p className="truncate text-sm font-black text-slate-900">{name}</p><p className="truncate text-xs text-slate-400">{user.email}</p></div>
    <Link onClick={()=>setOpen(false)} href="/dashboard" className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"><UserCircle size={17}/> Profile & progress</Link>
    <Link onClick={()=>setOpen(false)} href="/settings" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700"><Settings size={17}/> Settings</Link>
    <button onClick={async()=>{await supabaseBrowser().auth.signOut();location.href='/auth'}} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut size={17}/> Sign out</button>
   </div>}
 </div>
}
function NavLink({href,icon,label,tone}:{href:string;icon:React.ReactNode;label:string;tone:'blue'|'violet'|'slate'}){const cls={blue:'text-blue-700 hover:bg-blue-50',violet:'text-violet-700 hover:bg-violet-50',slate:'text-slate-700 hover:bg-slate-100'}[tone];return <Link href={href} className={`focus-ring flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${cls}`}>{icon}{label}</Link>}
