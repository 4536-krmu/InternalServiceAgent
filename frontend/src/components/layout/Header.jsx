import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  RotateCcw, 
  UserCheck, 
  ShieldAlert, 
  Sun, 
  Moon, 
  UserPlus,
  Lock
} from 'lucide-react';

export default function Header({ 
  activePage, 
  currentProfile, 
  personas, 
  onSwitchPersona, 
  onResetSeed, 
  isResetting,
  isDark,
  onToggleTheme,
  onOpenAddAccount
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageTitles = {
    dashboard: 'IT Service Overview & AI Assistant',
    submit: 'Submit IT Support Request',
    tickets: 'Active Ticket Queue',
    policies: 'Company IT Policies (KB-01 to KB-10)',
    audit: 'Agentic AI Reasoning Trail',
    profile: 'User Profile & Accounts'
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 shadow-sm transition-colors duration-200">
      {/* Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="hover:text-slate-800 dark:hover:text-slate-200">Veridian Corp</span>
          <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-900 dark:text-white font-semibold">{pageTitles[activePage] || 'Portal'}</span>
        </div>
      </div>

      {/* Action Controls & Persona Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark / Light Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Reset / Seed Portal State */}
        <button
          onClick={onResetSeed}
          disabled={isResetting}
          title="Reset portal to default enterprise demo data"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Demo</span>
        </button>

        {/* Persona Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              currentProfile?.account_locked ? 'bg-rose-500' : currentProfile?.role === 'Contractor' ? 'bg-amber-600' : 'bg-blue-600'
            }`}>
              {currentProfile?.avatar_initials || 'EM'}
            </div>
            
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {currentProfile?.name || 'Employee'}
                </span>
                {currentProfile?.account_locked && (
                  <span className="bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[10px] px-1.5 py-0.2 rounded font-bold">
                    LOCKED
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {currentProfile?.role}
              </p>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Persona Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Active Accounts</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Switch persona or add account</p>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenAddAccount();
                  }}
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>+ Add Account</span>
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto p-1 space-y-1">
                {personas.map((persona) => {
                  const isSelected = persona.id === currentProfile?.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => {
                        onSwitchPersona(persona.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-2 rounded-lg text-left text-xs transition-colors ${
                        isSelected 
                          ? 'bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5 ${
                        persona.account_locked ? 'bg-rose-500' : persona.role === 'Contractor' ? 'bg-amber-600' : 'bg-blue-600'
                      }`}>
                        {persona.avatar_initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white truncate">{persona.name}</span>
                          {isSelected && <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Active</span>}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">
                          {persona.role} • {persona.tenure_years}y tenure
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {persona.work_mode} {persona.account_locked && '• 🔒 Locked Out'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {personas.length} total accounts available
                </span>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenAddAccount();
                  }}
                  className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Create Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
