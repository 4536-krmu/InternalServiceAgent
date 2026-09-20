import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  Sparkles, 
  ArrowRight, 
  Server, 
  Send, 
  Zap,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  HelpCircle
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import { api } from '../api';

export default function Dashboard({ 
  tickets, 
  currentProfile, 
  onSelectTicket, 
  onNavigateToSubmit,
  onOpenAddAccount,
  addToast
}) {
  const [healthServices, setHealthServices] = useState([]);
  const [quickQueryText, setQuickQueryText] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    try {
      const data = await api.getSystemHealth();
      setHealthServices(data);
    } catch (err) {
      console.error("Failed to load system health:", err);
    }
  };

  const handleQuickSubmit = async (textToSubmit = null) => {
    const text = textToSubmit || quickQueryText;
    if (!text.trim()) return;

    setQueryLoading(true);
    setQueryResult(null);
    try {
      const res = await api.quickQuery(text, currentProfile?.id);
      setQueryResult(res.agent_response);
      addToast({
        type: 'success',
        title: 'Agent Evaluation Completed',
        message: `Applied policy ${res.agent_response?.policy_applied}: ${res.agent_response?.policy_title}`
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Evaluation Failed',
        message: err.message
      });
    } finally {
      setQueryLoading(false);
    }
  };

  const presetScenarios = [
    {
      icon: "🔒",
      label: "Account Locked Out (KB-01)",
      text: "I entered my password wrong 5 times and my account is locked out.",
      desc: "Tests automated Active Directory unlock"
    },
    {
      icon: "💻",
      label: "3-Year Laptop Refresh (KB-03)",
      text: "Request standard laptop replacement, my laptop is 3.5 years old.",
      desc: "Tests 3-year tenure rule auto-approval"
    },
    {
      icon: "🌐",
      label: "Contractor VPN Tunnel (KB-02)",
      text: "Need corporate VPN access to connect to internal services.",
      desc: "Auto-approved for FTE, manager sign-off for contractor"
    },
    {
      icon: "💳",
      label: "Expense Software / Concur (KB-08)",
      text: "Need access to Concur to file travel expense receipts.",
      desc: "Tests auto-redirect to Finance department"
    },
    {
      icon: "🚨",
      label: "Phishing Threat Alert (KB-09)",
      text: "Received suspicious urgent wire transfer email with zip attachment.",
      desc: "Tests critical SecOps quarantine"
    },
    {
      icon: "🏠",
      label: "$750 WFH Allowance (KB-10)",
      text: "Requesting home office ergonomic equipment allowance.",
      desc: "Checks >3 days remote requirement"
    }
  ];

  // Metrics
  const totalTickets = tickets.length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const pendingReview = tickets.filter(t => t.status === 'Pending Review').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 transition-colors duration-200">
      {/* Friendly Quick-Start Guide: Makes Portal Super Easy to Understand */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold backdrop-blur-sm mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>How This Portal Works</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-bold">
                Welcome, {currentProfile?.name || 'Employee'}!
              </h2>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 font-medium">
                Active: <strong>{currentProfile?.role}</strong> ({currentProfile?.tenure_years}y tenure)
              </span>
            </div>
          </div>

          {/* 3 Simple Explanation Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15">
              <div className="w-6 h-6 rounded-full bg-blue-400/30 text-blue-100 flex items-center justify-center font-bold text-xs mb-1.5">
                1
              </div>
              <h4 className="text-xs font-bold text-white">Choose Persona</h4>
              <p className="text-[11px] text-blue-100 mt-0.5 leading-relaxed">
                Use the top-right menu to switch between <strong>Full-Time</strong>, <strong>Contractor</strong>, or <strong>Locked Out</strong> accounts.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15">
              <div className="w-6 h-6 rounded-full bg-indigo-400/30 text-indigo-100 flex items-center justify-center font-bold text-xs mb-1.5">
                2
              </div>
              <h4 className="text-xs font-bold text-white">Click a Demo Prompt</h4>
              <p className="text-[11px] text-indigo-100 mt-0.5 leading-relaxed">
                Click any prompt chip below (e.g. <em>"Account Locked"</em> or <em>"3-Year Laptop"</em>) to see the AI evaluate it instantly.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15">
              <div className="w-6 h-6 rounded-full bg-emerald-400/30 text-emerald-100 flex items-center justify-center font-bold text-xs mb-1.5">
                3
              </div>
              <h4 className="text-xs font-bold text-white">Watch AI Auto-Resolve</h4>
              <p className="text-[11px] text-emerald-100 mt-0.5 leading-relaxed">
                The AI applies corporate policies (KB-01 to KB-10), performs tool actions, and explains its decision!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Requests</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{totalTickets}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Service desk volume</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <span>Auto-Resolved by AI</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{resolved}</p>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">Zero-touch remediation</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-medium">
            <span>Pending Manager Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">{pendingReview}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Awaiting sign-off</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 text-xs font-medium">
            <span>In Progress / Fulfillment</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1.5">{inProgress}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Scheduled fulfillment</p>
        </div>
      </div>

      {/* Main Action Center: AI Quick Evaluation */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Autonomous IT Support Agent — One-Click Scenarios
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any scenario button below to test policy compliance instantly:
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToSubmit}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Custom Form</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 One-Click Pre-Set Scenario Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {presetScenarios.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuickQueryText(sc.text);
                handleQuickSubmit(sc.text);
              }}
              className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all text-left group"
            >
              <span className="text-xl select-none">{sc.icon}</span>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 block truncate">
                  {sc.label}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 line-clamp-1">
                  {sc.desc}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Free-text Query Box */}
        <div className="pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuickSubmit();
            }}
            className="relative"
          >
            <input
              type="text"
              value={quickQueryText}
              onChange={(e) => setQuickQueryText(e.target.value)}
              placeholder="Or type any question (e.g. 'Can I install Docker?', 'Printer spooler error')..."
              className="w-full pl-4 pr-24 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 shadow-inner"
            />
            <button
              type="submit"
              disabled={queryLoading || !quickQueryText.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              {queryLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Evaluate</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Query Live Result Box */}
        {queryResult && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Result: [{queryResult.policy_applied}] {queryResult.policy_title}
                </span>
                <StatusBadge status={queryResult.status} />
              </div>
              {queryResult.ticket && (
                <button
                  onClick={() => onSelectTicket(queryResult.ticket)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Ticket #{queryResult.ticket.id}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              {queryResult.message}
            </p>

            {queryResult.automated_actions_taken?.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Automated Tool Actions:
                </span>
                <ul className="text-xs space-y-1">
                  {queryResult.automated_actions_taken.map((act, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {queryResult.next_steps && (
              <div className="text-[11px] bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-lg border border-blue-100 dark:border-blue-800 text-blue-900 dark:text-blue-200">
                <strong>Next Steps: </strong> {queryResult.next_steps}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2 Columns: Infrastructure Telemetry & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health Telemetry (1 col) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">IT Service Health</h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-beacon" />
          </div>

          <div className="space-y-2">
            {healthServices.map((srv) => (
              <div key={srv.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate">{srv.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{srv.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    srv.status === 'Operational' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  }`}>
                    {srv.status}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{srv.latency_ms}ms</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tickets Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Service Requests</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">Click any row to inspect</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Request</th>
                    <th className="py-3 px-4">Requester</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {tickets.slice(0, 5).map((t) => (
                    <tr 
                      key={t.id} 
                      onClick={() => onSelectTicket(t)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{t.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">{t.title}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{t.requester_name}</td>
                      <td className="py-3 px-4"><StatusBadge status={t.status} /></td>
                      <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400 font-semibold">
                        Inspect &rarr;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
