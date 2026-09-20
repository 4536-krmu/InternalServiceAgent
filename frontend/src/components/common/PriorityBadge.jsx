import React from 'react';

export default function PriorityBadge({ priority }) {
  const norm = (priority || '').toLowerCase().trim();

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
  let dotColor = "bg-slate-400";

  if (norm === 'critical') {
    colorClasses = "bg-rose-100 text-rose-800 border-rose-300 font-semibold";
    dotColor = "bg-rose-600 animate-pulse";
  } else if (norm === 'high') {
    colorClasses = "bg-orange-100 text-orange-800 border-orange-200 font-medium";
    dotColor = "bg-orange-500";
  } else if (norm === 'medium') {
    colorClasses = "bg-blue-50 text-blue-700 border-blue-200";
    dotColor = "bg-blue-500";
  } else if (norm === 'low') {
    colorClasses = "bg-slate-100 text-slate-600 border-slate-200";
    dotColor = "bg-slate-400";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs border ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {priority || 'Medium'}
    </span>
  );
}
