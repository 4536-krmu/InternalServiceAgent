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

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [currentProfile, setCurrentProfile] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [prefillPolicy, setPrefillPolicy] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isResetting, setIsResetting] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  // Dark Mode Theme State with local storage persistence
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('veridian-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
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
        api.getProfile(),
        api.getPersonas(),
        api.getTickets()
      ]);
      setCurrentProfile(profileData);
      setPersonas(personasData);
      setTickets(ticketsData);
    } catch (err) {
      console.error("Initialization error:", err);
      addToast({ type: 'error', title: 'Connection Error', message: 'Could not connect to IT Service API backend.' });
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
