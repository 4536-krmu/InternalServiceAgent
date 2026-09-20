import React from 'react';
import { 
  LayoutDashboard, 
  Send, 
  TicketCheck, 
  BookOpen, 
  Activity, 
  User, 
  ShieldCheck, 
  Cpu, 
  Radio
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, ticketCounts }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'submit', label: 'Submit Request', icon: Send, badge: 'New' },
    { id: 'tickets', label: 'Active Ticket Queue', icon: TicketCheck, badge: ticketCounts?.active || null },
    { id: 'policies', label: 'Knowledge Base', icon: BookOpen, badge: '10 KBs' },
    { id: 'audit', label: 'Agentic Audit Trail', icon: Activity, badge: 'Live' },
    { id: 'profile', label: 'User Profile', icon: User, badge: null }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            VERIDIAN <span className="text-blue-400 font-normal">IT</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Internal Service Agent</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Service Portal
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : item.badge === 'Live'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Infrastructure Telemetry & Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-beacon" />
            <span className="text-[11px] font-medium text-slate-300">Agentic Engine Online</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">100%</span>
        </div>
        <div className="bg-slate-800/60 rounded p-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span>IT Policy Core</span>
          <span className="text-slate-300 font-mono text-[10px]">KB-01 - KB-10</span>
        </div>
      </div>
    </aside>
  );
}
