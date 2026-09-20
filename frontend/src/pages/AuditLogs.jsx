import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  RefreshCw, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  BrainCircuit,
  Wrench,
  Eye,
  Code
} from 'lucide-react';
import { api } from '../api';

export default function AuditLogs({ onSelectTicketId, addToast }) {
  const [logs, setLogs] = useState([]);
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [ticketSearch, setTicketSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [viewMode, setViewMode] = useState('simple'); // 'simple' or 'technical'

  useEffect(() => {
    loadLogs();
  }, [eventTypeFilter]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs({
        eventType: eventTypeFilter,
        ticketId: ticketSearch || undefined
      });
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      await api.clearAuditLogs();
      setLogs([]);
      addToast({
        type: 'info',
        title: 'Trace Logs Cleared',
        message: 'All in-memory agent execution traces have been reset.'
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Clear Failed', message: err.message });
    }
  };

  const eventBadge = (type) => {
    switch (type) {
      case 'THOUGHT':
        return { label: 'Reasoning', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800', icon: BrainCircuit };
      case 'POLICY_CHECK':
        return { label: 'Policy Check', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800', icon: Cpu };
      case 'PROFILE_CHECK':
        return { label: 'Profile Verify', color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', icon: Activity };
      case 'TOOL_EXEC':
        return { label: 'Tool Executed', color: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800', icon: Wrench };
      case 'DECISION':
        return { label: 'Final Decision', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 };
      case 'ESCALATION':
        return { label: 'Escalation Alert', color: 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800', icon: ShieldAlert };
      default:
        return { label: type, color: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200', icon: Activity };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Agent Reasoning Audit Trail</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full transparency into how the AI thinks, evaluates corporate rules, and triggers automated remediation tools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Simple vs Technical Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              onClick={() => setViewMode('simple')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'simple'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Simple View
            </button>
            <button
              onClick={() => setViewMode('technical')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'technical'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Technical / JSON
            </button>
          </div>

          <button
            onClick={loadLogs}
            disabled={isLoading}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium shadow-sm transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={handleClearLogs}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-600 dark:text-slate-400 hover:text-rose-600 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={ticketSearch}
            onChange={(e) => setTicketSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadLogs()}
            placeholder="Filter by Ticket ID (e.g. VER-1082) or Trace ID..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Stage:</span>
          {['ALL', 'THOUGHT', 'POLICY_CHECK', 'TOOL_EXEC', 'DECISION', 'ESCALATION'].map((evt) => (
            <button
              key={evt}
              onClick={() => setEventTypeFilter(evt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                eventTypeFilter === evt
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {evt === 'POLICY_CHECK' ? 'Policy' : evt === 'TOOL_EXEC' ? 'Tools' : evt}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Feed */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading reasoning logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            No audit logs found. Try submitting a request or clicking a demo prompt on the Dashboard.
          </div>
        ) : (
          logs.map((log) => {
            const badge = eventBadge(log.event_type);
            const Icon = badge.icon;
            const isExpanded = expandedLogId === log.id;
            const hasToolData = log.tool_name || log.tool_input || log.tool_output;

            return (
              <div
                key={log.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                      <Icon className="w-3 h-3" />
                      {badge.label}
                    </span>

                    <span className="font-mono text-[11px] text-slate-400">{log.trace_id}</span>

                    {log.ticket_id && (
                      <button
                        onClick={() => onSelectTicketId && onSelectTicketId(log.ticket_id)}
                        className="font-mono font-bold text-[11px] text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded"
                      >
                        {log.ticket_id}
                      </button>
                    )}

                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      User: {log.requester_name}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
                </div>

                <div className="pt-2 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {log.message}
                </div>

                {/* Tool Data View: Simple or Technical */}
                {hasToolData && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                    {viewMode === 'simple' ? (
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                        <span className="font-bold text-blue-600 dark:text-blue-400">Executed Tool:</span>
                        <code>{log.tool_name || 'automation_tool'}()</code>
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline ml-auto"
                        >
                          {isExpanded ? 'Hide Raw JSON' : 'Show Raw JSON'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        <span>{isExpanded ? 'Collapse Payload' : `Inspect Tool Payload: ${log.tool_name || 'Data'}`}</span>
                      </button>
                    )}

                    {isExpanded && (
                      <div className="mt-2 bg-slate-900 text-slate-200 rounded-lg p-3 font-mono text-[11px] space-y-2 overflow-x-auto">
                        {log.tool_name && (
                          <p className="text-blue-400 font-bold">Tool: {log.tool_name}()</p>
                        )}
                        {log.tool_input && (
                          <div>
                            <span className="text-slate-500 uppercase text-[9px] block">Input Parameters:</span>
                            <pre className="text-emerald-400">{JSON.stringify(log.tool_input, null, 2)}</pre>
                          </div>
                        )}
                        {log.tool_output && (
                          <div>
                            <span className="text-slate-500 uppercase text-[9px] block">Output Response:</span>
                            <pre className="text-amber-300">{JSON.stringify(log.tool_output, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
