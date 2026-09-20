import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, AlertOctagon, Archive } from 'lucide-react';

export default function StatusBadge({ status }) {
  const norm = (status || '').toLowerCase().trim();

  if (norm === 'resolved') {
    return (
      <span className="status-badge status-resolved gap-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Resolved
      </span>
    );
  }

  if (norm === 'pending review' || norm === 'pending') {
    return (
      <span className="status-badge status-pending gap-1">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        Pending Review
      </span>
    );
  }

  if (norm === 'escalated') {
    return (
      <span className="status-badge status-escalated gap-1">
        <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
        Escalated
      </span>
    );
  }

  if (norm === 'closed') {
    return (
      <span className="status-badge status-closed gap-1">
        <Archive className="w-3.5 h-3.5 text-slate-500" />
        Closed
      </span>
    );
  }

  // Default: In Progress
  return (
    <span className="status-badge status-in-progress gap-1">
      <Clock className="w-3.5 h-3.5 text-blue-600" />
      In Progress
    </span>
  );
}
