import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Info, 
  Laptop,
  Key,
  Wifi,
  Printer,
  Mail,
  Receipt,
  Download,
  Home
} from 'lucide-react';
import { api } from '../api';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';

const CATEGORIES = [
  { id: 'KB-01', name: 'Password Reset & Account Lockout', icon: Key, policy: 'KB-01', group: 'common', hint: 'Auto-unlocks Active Directory if locked' },
  { id: 'KB-02', name: 'Corporate VPN Access', icon: Wifi, policy: 'KB-02', group: 'common', hint: 'Auto-approved for FTE, manager form for Contractors' },
  { id: 'KB-03', name: 'Laptop Replacement & Refresh', icon: Laptop, policy: 'KB-03', group: 'common', hint: 'Requires >= 3 years tenure or verified defect' },
  { id: 'KB-04', name: 'Software Installation', icon: Download, policy: 'KB-04', group: 'common', hint: 'Standard apps self-install; custom apps reviewed' },
  { id: 'KB-05', name: 'Printer Troubleshooting', icon: Printer, policy: 'KB-05', group: 'infra', hint: 'Automated print spooler restart & queue flush' },
  { id: 'KB-06', name: 'Exchange Mailbox Quota', icon: Mail, policy: 'KB-06', group: 'infra', hint: 'Increases up to 50GB require manager approval' },
  { id: 'KB-07', name: 'Guest Wi-Fi Access', icon: Wifi, policy: 'KB-07', group: 'infra', hint: 'Instant 24-hour visitor voucher code' },
  { id: 'KB-08', name: 'Expense Software (Concur)', icon: Receipt, policy: 'KB-08', group: 'special', hint: 'Managed by Finance department, not IT Central' },
  { id: 'KB-09', name: 'Security Incident & Phishing', icon: ShieldAlert, policy: 'KB-09', group: 'special', hint: 'Critical priority quarantine; do NOT forward' },
  { id: 'KB-10', name: 'Work-From-Home Equipment', icon: Home, policy: 'KB-10', group: 'special', hint: 'Remote > 3 days/wk eligible for $750 allowance' }
];

export default function SubmitRequest({ 
  currentProfile, 
  onTicketCreated, 
  addToast,
  prefillPolicy = null
}) {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].name);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic context fields
  const [isLocked, setIsLocked] = useState(currentProfile?.account_locked || false);
  const [softwareName, setSoftwareName] = useState('VS Code');
  const [tenureYears, setTenureYears] = useState(currentProfile?.tenure_years || 3.5);
  const [hardwareFailure, setHardwareFailure] = useState(false);
  const [printerTag, setPrinterTag] = useState('PRN-BLD2-FL3-CLR');
  const [requestedQuota, setRequestedQuota] = useState(40.0);
  const [remoteDays, setRemoteDays] = useState(currentProfile?.remote_days_per_week || 4);
  const [guestName, setGuestName] = useState('Dr. Robert Vance');

  // Modal response
  const [agentResponse, setAgentResponse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (prefillPolicy) {
      const match = CATEGORIES.find(c => c.policy === prefillPolicy || c.name.toLowerCase().includes(prefillPolicy.toLowerCase()));
      if (match) setSelectedCategory(match.name);
    }
  }, [prefillPolicy]);

  useEffect(() => {
    setIsLocked(currentProfile?.account_locked || false);
    setTenureYears(currentProfile?.tenure_years || 3.5);
    setRemoteDays(currentProfile?.remote_days_per_week || 4);
  }, [currentProfile]);

  const activeCategoryObj = CATEGORIES.find(c => c.name === selectedCategory) || CATEGORIES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      addToast({ type: 'warning', title: 'Missing Details', message: 'Please provide both a title and description.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const contextData = {
        is_locked: isLocked,
        software_name: softwareName,
        tenure_years: parseFloat(tenureYears),
        hardware_failure: hardwareFailure,
        printer_asset_tag: printerTag,
        requested_quota_gb: parseFloat(requestedQuota),
        remote_days_per_week: parseInt(remoteDays, 10),
        guest_name: guestName
      };

      const payload = {
        category: selectedCategory,
        title,
        description,
        priority,
        context_data: contextData,
        requester_id: currentProfile?.id
      };

      const res = await api.submitRequest(payload);
      setAgentResponse(res);
      setModalOpen(true);
      if (onTicketCreated) onTicketCreated(res.ticket);
      addToast({
        type: 'success',
        title: 'Request Evaluated',
        message: `Policy ${res.policy_applied} applied with decision: ${res.decision}`
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 transition-colors duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Submit IT Request</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Select what you need assistance with. The IT agent evaluates company rules and provides instant fixes.
        </p>
      </div>

      {/* Category Pills: Easy Visual Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Select Category:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = cat.name === selectedCategory;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 ring-2 ring-blue-600/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
                    {cat.policy}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-xs font-bold line-clamp-1">{cat.name.split('&')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Column (2 cols) */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dynamic Context Helper based on selected policy */}
            {activeCategoryObj.policy === 'KB-01' && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-1">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300">Identity & Lockout State</span>
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isLocked}
                    onChange={(e) => setIsLocked(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Account is locked out after 5 failed attempts (Auto-unlocks Active Directory)</span>
                </label>
              </div>
            )}

            {activeCategoryObj.policy === 'KB-02' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1">
                <span className="font-bold text-slate-800 dark:text-white">Active Employee Status:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  You are submitting as: <strong className="text-blue-600 dark:text-blue-400">{currentProfile?.role}</strong> ({currentProfile?.name}).
                  {currentProfile?.role === 'Contractor' ? (
                    <span className="text-amber-700 dark:text-amber-400 block mt-1">
                      ⚠️ Contractors require manager electronic signature per policy KB-02.
                    </span>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 block mt-1">
                      ✓ Full-time employees receive automatic tunnel credential generation.
                    </span>
                  )}
                </p>
              </div>
            )}

            {activeCategoryObj.policy === 'KB-03' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                      Device Age: {tenureYears} Years
                    </label>
                    <input
                      type="range"
                      step="0.1"
                      min="0.5"
                      max="5.0"
                      value={tenureYears}
                      onChange={(e) => setTenureYears(e.target.value)}
                      className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0.5y</span>
                      <span className="font-bold text-emerald-600">&ge;3.0y (Eligible)</span>
                      <span>5.0y</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                      Hardware Failure?
                    </label>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hardwareFailure}
                        onChange={(e) => setHardwareFailure(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">Verified Defect</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeCategoryObj.policy === 'KB-04' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-2">
                <label className="block font-semibold text-slate-800 dark:text-white">Requested Software Name</label>
                <input
                  type="text"
                  value={softwareName}
                  onChange={(e) => setSoftwareName(e.target.value)}
                  placeholder="e.g. VS Code, Docker, Slack, Wireshark..."
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                />
                <div className="flex flex-wrap gap-1">
                  {['VS Code', 'Slack', 'Docker Desktop', 'Figma', 'Third-Party Binary'].map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setSoftwareName(app)}
                      className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-[10px] font-medium transition-colors"
                    >
                      + {app}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeCategoryObj.policy === 'KB-05' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1">
                <label className="block font-semibold text-slate-800 dark:text-white">Printer Asset Tag / Floor</label>
                <input
                  type="text"
                  value={printerTag}
                  onChange={(e) => setPrinterTag(e.target.value)}
                  placeholder="e.g. PRN-BLD2-FL3-CLR"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                />
                <p className="text-[10px] text-slate-500">The agent will restart the remote spooler service first.</p>
              </div>
            )}

            {activeCategoryObj.policy === 'KB-06' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1">
                <label className="block font-semibold text-slate-800 dark:text-white">Requested Quota Size: {requestedQuota} GB</label>
                <input
                  type="range"
                  min="25"
                  max="80"
                  step="5"
                  value={requestedQuota}
                  onChange={(e) => setRequestedQuota(e.target.value)}
                  className="w-full accent-blue-600"
                />
                <p className="text-[10px] text-slate-500">
                  Default ceiling: 25GB. Increases up to 50GB require manager sign-off; &gt;50GB requires Director approval.
                </p>
              </div>
            )}

            {activeCategoryObj.policy === 'KB-07' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1">
                <label className="block font-semibold text-slate-800 dark:text-white">Visitor Full Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white"
                />
              </div>
            )}

            {activeCategoryObj.policy === 'KB-08' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Managed by Corporate Finance (KB-08):</span>
                  <p className="mt-0.5 text-[11px]">
                    Expense systems (Concur/Expensify) are handled by Finance, not IT. The agent will redirect your inquiry automatically.
                  </p>
                </div>
              </div>
            )}

            {activeCategoryObj.policy === 'KB-09' && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-900 dark:text-rose-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>CRITICAL SECURITY REPORT (KB-09)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  DO NOT forward suspicious emails or attachments to colleagues. The agent flags this Critical and alerts SecOps.
                </p>
              </div>
            )}

            {activeCategoryObj.policy === 'KB-10' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-2">
                <label className="block font-semibold text-slate-800 dark:text-white">Remote Days Per Week: {remoteDays}</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={remoteDays}
                  onChange={(e) => setRemoteDays(e.target.value)}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>In-Office (0d)</span>
                  <span>Hybrid (1-3d)</span>
                  <span className="text-emerald-600 font-bold">&gt;3d ($750 Allowance Eligible)</span>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Need GlobalProtect VPN profile configured"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description / Details *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what is needed..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      priority === p 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Evaluating Policy Rules & Executing Tools...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit & Run Autonomous Agent</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Policy Summary Guide (1 col) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs border-b border-slate-100 dark:border-slate-700 pb-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Policy: [{activeCategoryObj.policy}]</span>
            </div>

            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{activeCategoryObj.name}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {activeCategoryObj.hint}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">SLA:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                  {activeCategoryObj.policy === 'KB-09' ? '< 15 mins' : activeCategoryObj.policy === 'KB-01' ? '< 5 mins' : '24-48 Hours'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Requester:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                  {currentProfile?.name} ({currentProfile?.role})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {agentResponse && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Request Processed: ${agentResponse.ticket?.id || 'Ticket Created'}`}
          subtitle={`Policy Applied: [${agentResponse.policy_applied}] ${agentResponse.policy_title}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ticket Status:</span>
                <StatusBadge status={agentResponse.status} />
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Trace: {agentResponse.audit_trace_id}</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">Agent Verdict:</p>
              {agentResponse.message}
            </div>

            {agentResponse.automated_actions_taken?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Automated Actions Taken:
                </span>
                <div className="space-y-1">
                  {agentResponse.automated_actions_taken.map((act, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
