import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Tag, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { api } from '../api';

export default function KnowledgeBase({ onTestPolicy }) {
  const [policies, setPolicies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedId, setExpandedId] = useState('KB-01');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPolicies();
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load policies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    'All',
    'Identity & Access Management',
    'Network & Connectivity',
    'Hardware & Equipment',
    'Applications & Productivity',
    'Office Infrastructure & Printing',
    'Messaging & Collaboration',
    'Corporate Financial Systems',
    'Information Security & SecOps',
    'Workplace & Remote Enablement'
  ];

  const policyList = Array.isArray(policies) ? policies : [];
  const filteredPolicies = policyList.filter((p) => {
    if (!p) return false;
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const match = (
        (p.id || '').toLowerCase().includes(s) ||
        (p.title || '').toLowerCase().includes(s) ||
        (p.description || '').toLowerCase().includes(s) ||
        (p.eligibility || '').toLowerCase().includes(s) ||
        (p.tags || []).some(t => t.toLowerCase().includes(s))
      );
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 transition-colors duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          IT Policies & Company Rules
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Browse the 10 IT policies (KB-01 to KB-10) and see how the AI agent makes approval decisions.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search policies by keyword, software name, or code (e.g. KB-03, laptop, vpn)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {cat === 'All' ? 'All Policies (10)' : cat.split('&')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Policy Accordion Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading IT policies...</div>
        ) : filteredPolicies.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            No policies found matching your search.
          </div>
        ) : (
          filteredPolicies.map((p) => {
            const isExpanded = expandedId === p.id;
            return (
              <div
                key={p.id}
                className={`bg-white dark:bg-slate-800 rounded-xl border transition-all duration-200 shadow-sm overflow-hidden ${
                  isExpanded ? 'border-blue-500 dark:border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  className="p-4 sm:p-5 flex items-start justify-between cursor-pointer select-none bg-white dark:bg-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs shadow-sm flex-shrink-0">
                      {p.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{p.title}</h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {p.sla_hours}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">SLA:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{p.sla_hours}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Approval Type:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{p.approval_type}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Who is Eligible:</span>
                        <span className="text-slate-700 dark:text-slate-300 mt-0.5 block truncate" title={p.eligibility}>
                          {p.eligibility}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Standard Steps:
                      </h4>
                      <ol className="space-y-1 list-decimal list-inside text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        {p.procedure.map((step, idx) => (
                          <li key={idx} className="leading-relaxed pl-1">{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap gap-1 items-center">
                        <Tag className="w-3 h-3 text-slate-400 mr-1" />
                        {p.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => onTestPolicy(p.id)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <span>Test This Policy with Agent</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
