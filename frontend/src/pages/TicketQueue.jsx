import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import Modal from '../components/common/Modal';
import { api } from '../api';

export default function TicketQueue({ 
  tickets, 
  isLoading, 
  onRefresh, 
  selectedTicket, 
  setSelectedTicket,
  addToast
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [actionNote, setActionNote] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const matches = (
        t.id.toLowerCase().includes(s) ||
        t.title.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        t.requester_name.toLowerCase().includes(s) ||
        (t.policy_id && t.policy_id.toLowerCase().includes(s))
      );
      if (!matches) return false;
    }
    return true;
  });

  const handleTicketAction = async (actionType, newStatus = null) => {
    if (!selectedTicket) return;
    setIsProcessingAction(true);
    try {
      const payload = {
        action: actionType,
        actor: 'IT Support Operator',
        note: actionNote.trim() || undefined,
        new_status: newStatus
      };
      const updated = await api.performTicketAction(selectedTicket.id, payload);
      setSelectedTicket(updated);
      setActionNote('');
      onRefresh();
      addToast({
        type: 'success',
        title: 'Action Executed',
        message: `Ticket ${updated.id} status updated to ${updated.status}.`
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12 transition-colors duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Active Ticket Queue</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor all incoming requests, auto-resolved actions, and items pending manager approval.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : 'text-slate-500 dark:text-slate-400'}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets by ID, name, keyword, or policy..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['All', 'In Progress', 'Pending Review', 'Resolved', 'Escalated'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Policy</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No tickets found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {t.id}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {t.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900 dark:text-white">{t.requester_name}</div>
                      <div className="text-[10px] text-slate-400">{t.department}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-semibold">
                        {t.policy_id || 'KB-04'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center justify-end gap-1">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.id}: ${selectedTicket.title}`}
          subtitle={`Requester: ${selectedTicket.requester_name} (${selectedTicket.department}) • Submitted: ${selectedTicket.created_at}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {/* Status Header Strip */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedTicket.status} />
                <PriorityBadge priority={selectedTicket.priority} />
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs font-semibold">
                  Policy: {selectedTicket.policy_id || 'General'}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                SLA: {selectedTicket.sla_deadline}
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Issue Details</h4>
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                {selectedTicket.description}
              </div>
            </div>

            {/* Resolution Summary */}
            {selectedTicket.resolution_summary && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">AI Resolution Verdict</h4>
                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  {selectedTicket.resolution_summary}
                </div>
              </div>
            )}

            {/* Ticket Action Controls */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Add note or update reason..."
                  className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  disabled={isProcessingAction || !actionNote.trim()}
                  onClick={() => handleTicketAction('add_note')}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                >
                  Post Note
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedTicket.status !== 'Resolved' && (
                  <button
                    type="button"
                    disabled={isProcessingAction}
                    onClick={() => handleTicketAction('approve')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Resolved</span>
                  </button>
                )}

                {selectedTicket.status !== 'Escalated' && (
                  <button
                    type="button"
                    disabled={isProcessingAction}
                    onClick={() => handleTicketAction('escalate')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Escalate Ticket</span>
                  </button>
                )}

                {selectedTicket.status === 'Resolved' && (
                  <button
                    type="button"
                    disabled={isProcessingAction}
                    onClick={() => handleTicketAction('reopen')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Reopen Ticket</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
