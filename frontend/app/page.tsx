import Link from "next/link";
import { ArrowRight, BookOpen, BrainCircuit, Flame, MessageCircle, Sparkles, Trophy, Zap } from "lucide-react";

export default function Home(){return <div className="overflow-hidden">
  <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:pb-24">
    <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"/><div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl"/>
    <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
      <div className="relative z-10 fade-up">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm"><Sparkles size={14}/> Adaptive learning, built around you</div>
        <h1 className="max-w-3xl text-5xl font-black leading-[1.03] tracking-[-.04em] text-slate-950 sm:text-6xl lg:text-7xl">Learn smarter.<br/><span className="gradient-text">At your level.</span></h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">An AI tutor that changes how it teaches based on your question, your progress, and what you need next.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/auth" className="button-pop inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3.5 font-bold text-white shadow-xl shadow-blue-600/20">Start learning <ArrowRight size={18}/></Link><Link href="/tutor" className="button-pop inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-800 shadow-sm"><BookOpen size={18}/> Explore Tutor</Link></div>
        <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-500"><span className="flex items-center gap-2"><Zap size={16} className="text-amber-500"/> XP & streaks</span><span className="flex items-center gap-2"><BrainCircuit size={16} className="text-blue-500"/> Adaptive prompts</span><span className="flex items-center gap-2"><MessageCircle size={16} className="text-violet-500"/> Separate Chat</span></div>
      </div>
      <div className="relative z-10 fade-up-delay">
        <div className="absolute -right-4 -top-8 h-24 w-24 rounded-full bg-amber-300/50 blur-2xl"/>
        <div className="gradient-border hero-glow rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-1.5">
          <div className="mesh-bg overflow-hidden rounded-[1.75rem] bg-[#081b3d] p-5 sm:p-7">
            <div className="flex items-center justify-between text-white"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">AdaptivePrompt</p><p className="mt-1 font-semibold">Your learning loop</p></div><img src="/logo-2.png" alt="" className="h-14 w-14 float-slow"/></div>
            <div className="mt-7 space-y-3">
              {[['01','Ask a question','Start anywhere — Python, ML, databases, exams.'],['02','Get an adaptive explanation','The tutor adjusts depth and prompting strategy.'],['03','Practice & improve','Try questions, earn XP, and build momentum.']].map(([n,t,d],i)=><div key={n} className={`home-loop-card card-hover rounded-2xl p-4 ${i===1?'featured':''}`}><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-300 text-xs font-black text-[#071a3a] shadow-lg shadow-cyan-400/20">{n}</span><div><p className="font-extrabold text-white">{t}</p><p className="mt-1 text-sm leading-6 text-white/80">{d}</p></div></div></div>)}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3"><MiniStat icon={<Zap size={15}/>} value="+120" label="XP"/><MiniStat icon={<Flame size={15}/>} value="7" label="day streak"/><MiniStat icon={<Trophy size={15}/>} value="4" label="badges"/></div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section className="border-y border-slate-200/70 bg-white/65"><div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6"><Feature icon={<BrainCircuit/>} title="Adaptive Tutor" text="Teaching depth changes with learner level, difficulty, and recent performance."/><Feature icon={<MessageCircle/>} title="Casual Chat" text="A separate conversational space with its own sessions and history."/><Feature icon={<Trophy/>} title="Progress that matters" text="Practice, XP, streaks, badges, and learning activity come from real interactions."/></div></section>
</div>}
function MiniStat({icon,value,label}:{icon:React.ReactNode;value:string;label:string}){return <div className="rounded-2xl bg-white/10 p-3 text-white"><div className="flex items-center gap-1 text-amber-300">{icon}<span className="text-sm font-black">{value}</span></div><p className="mt-1 text-[11px] text-blue-100/70">{label}</p></div>}
function Feature({icon,title,text}:{icon:React.ReactNode;title:string;text:string}){return <div className="card-hover rounded-2xl p-4"><div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-100 text-blue-700">{icon}</div><h2 className="font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{text}</p></div>}
