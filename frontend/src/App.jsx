import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import SubmitRequest from './pages/SubmitRequest';
import TicketQueue from './pages/TicketQueue';
import KnowledgeBase from './pages/KnowledgeBase';
import AuditLogs from './pages/AuditLogs';
import UserProfile from './pages/UserProfile';
import Toast from './components/common/Toast';
import CreateAccountModal from './components/common/CreateAccountModal';
import { api } from './api';

const FALLBACK_PROFILE = {
  id: "EMP-8041",
  name: "Sarah Chen",
  email: "sarah.chen@veridian-corp.example",
  department: "Cloud Infrastructure",
  role: "Full-Time Employee",
  hire_date: "2023-02-15",
  tenure_years: 3.6,
  work_mode: "Remote",
  remote_days_per_week: 4,
  failed_login_attempts: 0,
  account_locked: false,
  assigned_device: {
    model: "ThinkPad X1 Carbon Gen 10",
    serial: "VC-TP-88492",
    deployed_date: "2023-03-01",
    os: "Windows 11 Enterprise 23H2",
    status: "Active (3.6 yrs old - Refresh Eligible)"
  },
  mailbox_used_gb: 21.4,
  mailbox_limit_gb: 25.0,
  avatar_initials: "SC"
};

const FALLBACK_PERSONAS = [
  FALLBACK_PROFILE,
  {
    id: "CON-4912",
    name: "Alex Rivera",
    email: "alex.rivera.ctr@veridian-corp.example",
    department: "Quality Engineering",
    role: "Contractor",
    hire_date: "2025-11-01",
    tenure_years: 0.8,
    work_mode: "Hybrid",
    remote_days_per_week: 2,
    failed_login_attempts: 0,
    account_locked: false,
    assigned_device: {
      model: "Dell Latitude 5430",
      serial: "VC-DL-19402",
      deployed_date: "2025-11-05",
      os: "Windows 11 Pro",
      status: "Active"
    },
    mailbox_used_gb: 8.2,
    mailbox_limit_gb: 25.0,
    avatar_initials: "AR"
  },
  {
    id: "EMP-3108",
    name: "David Kim",
    email: "david.kim@veridian-corp.example",
    department: "Brand Marketing",
    role: "Full-Time Employee",
    hire_date: "2025-06-10",
    tenure_years: 1.2,
    work_mode: "In-Office",
    remote_days_per_week: 0,
    failed_login_attempts: 0,
    account_locked: false,
    assigned_device: {
      model: "MacBook Pro 14 M3",
      serial: "VC-MB-77120",
      deployed_date: "2025-06-15",
      os: "macOS Sonoma 14.5",
      status: "Active (1.2 yrs old)"
    },
    mailbox_used_gb: 14.5,
    mailbox_limit_gb: 25.0,
    avatar_initials: "DK"
  },
  {
    id: "EMP-9923",
    name: "Elena Rostova",
    email: "elena.rostova@veridian-corp.example",
    department: "Financial Planning & Analysis",
    role: "Full-Time Employee",
    hire_date: "2024-08-01",
    tenure_years: 2.1,
    work_mode: "Hybrid",
    remote_days_per_week: 3,
    failed_login_attempts: 5,
    account_locked: true,
    assigned_device: {
      model: "HP EliteBook 840 G9",
      serial: "VC-HP-30491",
      deployed_date: "2024-08-10",
      os: "Windows 11 Enterprise",
      status: "Locked Out"
    },
    mailbox_used_gb: 18.9,
    mailbox_limit_gb: 25.0,
    avatar_initials: "ER"
  }
];

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [currentProfile, setCurrentProfile] = useState(FALLBACK_PROFILE);
  const [personas, setPersonas] = useState(FALLBACK_PERSONAS);
  const [tickets, setTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [prefillPolicy, setPrefillPolicy] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isResetting, setIsResetting] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  // Default to light mode unless user toggles or saved
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('veridian-theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('veridian-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('veridian-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Load initial enterprise data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [profileData, personasData, ticketsData] = await Promise.all([
        api.getProfile().catch(() => FALLBACK_PROFILE),
        api.getPersonas().catch(() => FALLBACK_PERSONAS),
        api.getTickets().catch(() => [])
      ]);
      if (profileData) setCurrentProfile(profileData);
      if (personasData?.length) setPersonas(personasData);
      if (ticketsData?.length) setTickets(ticketsData);
    } catch (err) {
      console.warn("Using fallback initial data:", err);
    }
  };

  const loadTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const data = await api.getTickets();
      setTickets(data);
    } catch (err) {
      console.error("Failed to reload tickets:", err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleSwitchPersona = async (personaId) => {
    try {
      const updated = await api.switchPersona(personaId);
      setCurrentProfile(updated);
      addToast({
        type: 'success',
        title: 'Persona Switched',
        message: `Now acting as ${updated.name} (${updated.role} • ${updated.department}).`
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Switch Failed', message: err.message });
    }
  };

  const handleAccountCreated = (newAccount) => {
    setPersonas((prev) => [...prev, newAccount]);
    setCurrentProfile(newAccount);
  };

  const handleResetSeed = async () => {
    setIsResetting(true);
    try {
      await api.resetSeedData();
      await loadInitialData();
      addToast({
        type: 'success',
        title: 'Portal Reset Completed',
        message: 'Default IT enterprise dataset, tickets, and audit traces restored.'
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Reset Failed', message: err.message });
    } finally {
      setIsResetting(false);
    }
  };

  const addToast = ({ type = 'info', title, message, duration = 4500 }) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTestPolicyFromKB = (policyId) => {
    setPrefillPolicy(policyId);
    setActivePage('submit');
  };

  const handleTicketCreated = (newTicket) => {
    if (newTicket) {
      setTickets((prev) => [newTicket, ...prev]);
    }
  };

  const activeTicketCounts = {
    active: tickets.filter(t => t.status === 'In Progress' || t.status === 'Pending Review').length
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 antialiased overflow-hidden transition-colors duration-200">
      {/* Fixed Sticky Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        ticketCounts={activeTicketCounts} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header 
          activePage={activePage}
          currentProfile={currentProfile}
          personas={personas}
          onSwitchPersona={handleSwitchPersona}
          onResetSeed={handleResetSeed}
          isResetting={isResetting}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenAddAccount={() => setIsAddAccountOpen(true)}
        />

        {/* Page Content Scroll View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70 dark:bg-slate-900/60">
          {activePage === 'dashboard' && (
            <Dashboard 
              tickets={tickets}
              currentProfile={currentProfile}
              onSelectTicket={(t) => {
                setSelectedTicket(t);
                setActivePage('tickets');
              }}
              onNavigateToSubmit={() => setActivePage('submit')}
              onOpenAddAccount={() => setIsAddAccountOpen(true)}
              addToast={addToast}
            />
          )}

          {activePage === 'submit' && (
            <SubmitRequest 
              currentProfile={currentProfile}
              onTicketCreated={handleTicketCreated}
              addToast={addToast}
              prefillPolicy={prefillPolicy}
            />
          )}

          {activePage === 'tickets' && (
            <TicketQueue 
              tickets={tickets}
              isLoading={isLoadingTickets}
              onRefresh={loadTickets}
              selectedTicket={selectedTicket}
              setSelectedTicket={setSelectedTicket}
              addToast={addToast}
            />
          )}

          {activePage === 'policies' && (
            <KnowledgeBase 
              onTestPolicy={handleTestPolicyFromKB}
            />
          )}

          {activePage === 'audit' && (
            <AuditLogs 
              onSelectTicketId={async (ticketId) => {
                try {
                  const t = await api.getTicket(ticketId);
                  setSelectedTicket(t);
                  setActivePage('tickets');
                } catch (e) {
                  addToast({ type: 'warning', title: 'Ticket Not Found', message: `Ticket ${ticketId} could not be loaded.` });
                }
              }}
              addToast={addToast}
            />
          )}

          {activePage === 'profile' && (
            <UserProfile 
              currentProfile={currentProfile}
              personas={personas}
              onSwitchPersona={handleSwitchPersona}
              onUpdateProfile={(up) => setCurrentProfile(up)}
              onOpenAddAccount={() => setIsAddAccountOpen(true)}
              addToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Add New Custom Account Modal */}
      <CreateAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onAccountCreated={handleAccountCreated}
        addToast={addToast}
      />

      {/* Global Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
