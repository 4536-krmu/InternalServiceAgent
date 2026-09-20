import React, { useState } from 'react';
import { 
  User, 
  Laptop, 
  HardDrive, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Unlock, 
  Briefcase, 
  Building, 
  Calendar, 
  Clock, 
  UserPlus,
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '../api';

export default function UserProfile({ 
  currentProfile, 
  personas, 
  onSwitchPersona, 
  onUpdateProfile,
  onOpenAddAccount,
  addToast 
}) {
  const [remoteDays, setRemoteDays] = useState(currentProfile?.remote_days_per_week || 4);

  const mailboxPercent = Math.min(100, Math.round(((currentProfile?.mailbox_used_gb || 0) / (currentProfile?.mailbox_limit_gb || 25)) * 100));

  const handleSaveProfile = async () => {
    try {
      const updated = await api.updateProfile({
        remote_days_per_week: parseInt(remoteDays, 10),
        work_mode: remoteDays > 3 ? 'Remote' : remoteDays > 0 ? 'Hybrid' : 'In-Office'
      });
      if (onUpdateProfile) onUpdateProfile(updated);
      addToast({
        type: 'success',
        title: 'Profile Saved',
        message: 'Your work preferences have been updated.'
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            User Profile & Corporate Accounts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your employee profile, corporate workstation details, and switch between test accounts.
          </p>
        </div>

        <button
          onClick={onOpenAddAccount}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Custom Account</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card (1 col) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-5">
          <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
              currentProfile?.account_locked 
                ? 'bg-gradient-to-tr from-rose-600 to-red-500 shadow-rose-500/30' 
                : currentProfile?.role === 'Contractor'
                ? 'bg-gradient-to-tr from-amber-600 to-yellow-500 shadow-amber-500/30'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-blue-500/30'
            }`}>
              {currentProfile?.avatar_initials}
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">{currentProfile?.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{currentProfile?.email}</p>

            <div className="flex flex-wrap gap-1.5 justify-center mt-3">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                {currentProfile?.role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[11px] font-semibold">
                {currentProfile?.department}
              </span>
              {currentProfile?.account_locked && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-[11px] font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Locked Out
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Employee ID</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{currentProfile?.id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Tenure</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{currentProfile?.tenure_years} Years</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Work Mode</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{currentProfile?.work_mode} ({currentProfile?.remote_days_per_week}d remote)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Hire Date</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{currentProfile?.hire_date}</span>
            </div>
          </div>
        </div>

        {/* Device & Storage Hardware Details (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Active Workstation Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assigned Corporate Device</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                MDM Managed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Hardware Model</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {currentProfile?.assigned_device?.model || 'Corporate Laptop'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Asset Serial Tag</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {currentProfile?.assigned_device?.serial || 'VC-TAG-0000'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Operating System</span>
                <span className="text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {currentProfile?.assigned_device?.os || 'Windows 11 Enterprise'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Deployment Date</span>
                <span className="text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {currentProfile?.assigned_device?.deployed_date || '2023-03-01'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Refresh Eligibility (KB-03)</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-0.5 ${
                  currentProfile?.tenure_years >= 3.0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {currentProfile?.tenure_years >= 3.0 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Eligible for 3-Year Hardware Refresh ({currentProfile?.tenure_years} yrs in service)</span>
                    </>
                  ) : (
                    <span>Standard Lifecycle (Must reach 3.0 yrs tenure, unless hardware failure is verified)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Mailbox Storage Quota Card (KB-06) */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Exchange Mailbox Storage (KB-06)</h3>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                {currentProfile?.mailbox_used_gb} GB / {currentProfile?.mailbox_limit_gb} GB ({mailboxPercent}%)
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    mailboxPercent > 80 ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${mailboxPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Default quota ceiling: 25GB</span>
                <span>Increases up to 50GB require direct manager approval</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Switcher Grid with Add Account CTA */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Test Personas & Accounts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any account below to simulate requests as that employee:
            </p>
          </div>
          <button
            onClick={onOpenAddAccount}
            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add New Account</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {personas.map((persona) => {
            const isSelected = persona.id === currentProfile?.id;
            return (
              <div
                key={persona.id}
                onClick={() => onSwitchPersona(persona.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-600/10'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white ${
                      persona.account_locked ? 'bg-rose-500' : persona.role === 'Contractor' ? 'bg-amber-600' : 'bg-blue-600'
                    }`}>
                      {persona.avatar_initials}
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{persona.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{persona.department}</p>
                  
                  <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <p><strong>Role:</strong> {persona.role}</p>
                    <p><strong>Tenure:</strong> {persona.tenure_years} yrs</p>
                    <p><strong>Remote:</strong> {persona.remote_days_per_week} days/wk</p>
                    {persona.account_locked && (
                      <p className="text-rose-600 dark:text-rose-400 font-bold">🔒 Locked Out (5 attempts)</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400">
                  {persona.id === 'EMP-8041' && 'Tests: KB-02 FTE VPN, KB-03 Laptop refresh, KB-10 WFH allowance'}
                  {persona.id === 'CON-4912' && 'Tests: KB-02 Contractor VPN approval, KB-03 <3yr laptop, KB-10 hybrid'}
                  {persona.id === 'EMP-3108' && 'Tests: KB-05 Printer spooler, KB-09 Critical Phishing'}
                  {persona.id === 'EMP-9923' && 'Tests: KB-01 Active Directory auto-unlock'}
                  {!['EMP-8041', 'CON-4912', 'EMP-3108', 'EMP-9923'].includes(persona.id) && 'Custom Account: Ready for testing!'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
