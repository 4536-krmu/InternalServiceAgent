/**
 * API client for Veridian Corp IT Service Portal.
 * Interacts with FastAPI backend at /api/v1/* with seamless offline/resilient fallback.
 */

import {
  FALLBACK_PROFILE,
  FALLBACK_PERSONAS,
  FALLBACK_POLICIES,
  FALLBACK_TICKETS,
  FALLBACK_HEALTH,
  FALLBACK_AUDIT_LOGS,
  evaluateAgentLocally
} from './data/fallbackData';

const API_BASE = '/api/v1';

// Local storage keys for client resilience
const STORAGE_KEYS = {
  PERSONAS: 'veridian_personas',
  ACTIVE_PROFILE: 'veridian_active_profile',
  TICKETS: 'veridian_tickets',
  AUDIT_LOGS: 'veridian_audit_logs'
};

function getStored(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP Error ${response.status}: ${response.statusText}`);
  }
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON API response but received ${contentType || 'HTML'}`);
  }
  return response.json();
}

export const api = {
  // Requests & Agent Loop
  submitRequest: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await handleResponse(res);
    } catch (err) {
      console.debug("Backend API unavailable for submitRequest, executing client-side ReAct agent:", err.message);
      const requester = (getStored(STORAGE_KEYS.PERSONAS, FALLBACK_PERSONAS) || []).find(p => p.id === data.requester_id) || FALLBACK_PROFILE;
      const evaluation = evaluateAgentLocally(data.title + ' ' + (data.description || ''), requester);
      
      const newTicket = {
        id: 'TKT-' + Math.floor(1000 + Math.random() * 9000),
        title: data.title,
        description: data.description || '',
        category: data.category || 'General IT',
        priority: data.priority || 'Medium',
        status: evaluation.ticket_status || 'In Progress',
        requester_id: requester.id,
        requester_name: requester.name,
        policy_id: evaluation.policy_applied,
        policy_title: evaluation.policy_title,
        created_at: new Date().toISOString(),
        resolution_notes: evaluation.explanation,
        tool_action: evaluation.action,
        agent_confidence: evaluation.confidence
      };

      const existingTickets = getStored(STORAGE_KEYS.TICKETS, FALLBACK_TICKETS);
      setStored(STORAGE_KEYS.TICKETS, [newTicket, ...existingTickets]);

      return {
        ticket: newTicket,
        agent_response: evaluation
      };
    }
  },

  quickQuery: async (query, requesterId = null) => {
    try {
      const res = await fetch(`${API_BASE}/requests/quick-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, requester_id: requesterId })
      });
      return await handleResponse(res);
    } catch (err) {
      console.debug("Backend API unavailable for quickQuery, executing client-side ReAct agent:", err.message);
      const requester = (getStored(STORAGE_KEYS.PERSONAS, FALLBACK_PERSONAS) || []).find(p => p.id === requesterId) || FALLBACK_PROFILE;
      const agentResponse = evaluateAgentLocally(query, requester);
      return {
        query,
        requester_id: requester.id,
        agent_response: agentResponse
      };
    }
  },

  // Tickets
  getTickets: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== 'All') query.append('status', params.status);
      if (params.category && params.category !== 'All') query.append('category', params.category);
      if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
      if (params.search) query.append('search', params.search);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${API_BASE}/tickets${qs}`);
      const data = await handleResponse(res);
      if (Array.isArray(data) && data.length > 0) {
        setStored(STORAGE_KEYS.TICKETS, data);
        return data;
      }
      return getStored(STORAGE_KEYS.TICKETS, FALLBACK_TICKETS);
    } catch (err) {
      console.debug("Using cached/fallback tickets:", err.message);
      return getStored(STORAGE_KEYS.TICKETS, FALLBACK_TICKETS);
    }
  },

  getTicket: async (ticketId) => {
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}`);
      return await handleResponse(res);
    } catch (err) {
      const all = getStored(STORAGE_KEYS.TICKETS, FALLBACK_TICKETS);
      const found = all.find(t => t.id === ticketId);
      if (found) return found;
      throw new Error(`Ticket ${ticketId} not found`);
    }
  },

  performTicketAction: async (ticketId, actionData) => {
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });
      return await handleResponse(res);
    } catch (err) {
      console.debug("Executing ticket action locally:", err.message);
      const tickets = getStored(STORAGE_KEYS.TICKETS, FALLBACK_TICKETS);
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        if (actionData.new_status) ticket.status = actionData.new_status;
        if (actionData.action === 'resolve') ticket.status = 'Resolved';
        if (actionData.action === 'escalate') ticket.status = 'Pending Review';
        if (actionData.note) ticket.resolution_notes = actionData.note;
        setStored(STORAGE_KEYS.TICKETS, tickets);
        return ticket;
      }
      throw new Error(`Ticket ${ticketId} not found`);
    }
  },

  // Policies
  getPolicies: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.category && params.category !== 'All') query.append('category', params.category);
      if (params.search) query.append('search', params.search);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${API_BASE}/policies${qs}`);
      const data = await handleResponse(res);
      if (Array.isArray(data) && data.length > 0) return data;
      return FALLBACK_POLICIES;
    } catch (err) {
      console.debug("Using fallback IT policies (KB-01 to KB-10):", err.message);
      return FALLBACK_POLICIES;
    }
  },

  getPolicy: async (policyId) => {
    try {
      const res = await fetch(`${API_BASE}/policies/${policyId}`);
      return await handleResponse(res);
    } catch (err) {
      const found = FALLBACK_POLICIES.find(p => p.id === policyId);
      if (found) return found;
      throw new Error(`Policy ${policyId} not found`);
    }
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.eventType && params.eventType !== 'ALL') query.append('event_type', params.eventType);
      if (params.ticketId) query.append('ticket_id', params.ticketId);
      if (params.limit) query.append('limit', params.limit);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${API_BASE}/audit-logs${qs}`);
      const data = await handleResponse(res);
      if (Array.isArray(data) && data.length > 0) return data;
      return getStored(STORAGE_KEYS.AUDIT_LOGS, FALLBACK_AUDIT_LOGS);
    } catch (err) {
      console.debug("Using fallback audit traces:", err.message);
      return getStored(STORAGE_KEYS.AUDIT_LOGS, FALLBACK_AUDIT_LOGS);
    }
  },

  clearAuditLogs: async () => {
    try {
      const res = await fetch(`${API_BASE}/audit-logs/clear`, { method: 'POST' });
      await handleResponse(res);
    } catch (err) {
      setStored(STORAGE_KEYS.AUDIT_LOGS, []);
    }
    return { status: "cleared" };
  },

  // Profile & Personas
  getProfile: async () => {
    try {
      const res = await fetch(`${API_BASE}/profile`);
      const data = await handleResponse(res);
      if (data && data.id) {
        setStored(STORAGE_KEYS.ACTIVE_PROFILE, data);
        return data;
      }
      return getStored(STORAGE_KEYS.ACTIVE_PROFILE, FALLBACK_PROFILE);
    } catch (err) {
      return getStored(STORAGE_KEYS.ACTIVE_PROFILE, FALLBACK_PROFILE);
    }
  },

  updateProfile: async (profileData) => {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await handleResponse(res);
      setStored(STORAGE_KEYS.ACTIVE_PROFILE, data);
      return data;
    } catch (err) {
      const current = getStored(STORAGE_KEYS.ACTIVE_PROFILE, FALLBACK_PROFILE);
      const updated = { ...current, ...profileData };
      setStored(STORAGE_KEYS.ACTIVE_PROFILE, updated);
      return updated;
    }
  },

  getPersonas: async () => {
    try {
      const res = await fetch(`${API_BASE}/profile/personas`);
      const data = await handleResponse(res);
      if (Array.isArray(data) && data.length > 0) {
        setStored(STORAGE_KEYS.PERSONAS, data);
        return data;
      }
      return getStored(STORAGE_KEYS.PERSONAS, FALLBACK_PERSONAS);
    } catch (err) {
      return getStored(STORAGE_KEYS.PERSONAS, FALLBACK_PERSONAS);
    }
  },

  switchPersona: async (personaId) => {
    try {
      const res = await fetch(`${API_BASE}/profile/switch/${personaId}`, { method: 'POST' });
      const data = await handleResponse(res);
      setStored(STORAGE_KEYS.ACTIVE_PROFILE, data);
      return data;
    } catch (err) {
      const list = getStored(STORAGE_KEYS.PERSONAS, FALLBACK_PERSONAS);
      const found = list.find(p => p.id === personaId) || list[0];
      setStored(STORAGE_KEYS.ACTIVE_PROFILE, found);
      return found;
    }
  },

  createAccount: async (accountData) => {
    try {
      const res = await fetch(`${API_BASE}/profile/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      });
      const data = await handleResponse(res);
      const currentList = getStored(STORAGE_KEYS.PERSONAS, FALLBACK_PERSONAS);
      setStored(STORAGE_KEYS.PERSONAS, [...currentList, data]);
      setStored(STORAGE_KEYS.ACTIVE_PROFILE, data);
      return data;
    } catch (err) {
      console.warn("Creating account in local storage:", err.message);
      const prefix = accountData.role === 'Contractor' ? 'CON' : 'EMP';
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const initials = accountData.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'US';

      const newAccount = {
        id: `${prefix}-${randomNum}`,
        name: accountData.name,
        email: accountData.email || `${accountData.name.toLowerCase().replace(/\s+/g, '.')}${accountData.role === 'Contractor' ? '.ctr' : ''}@veridian-corp.example`,
        department: accountData.department || 'General IT',
        role: accountData.role || 'Full-Time Employee',
        hire_date: new Date().toISOString().split('T')[0],
        tenure_years: accountData.tenure_years || 1.0,
        work_mode: accountData.work_mode || 'Hybrid',
        remote_days_per_week: accountData.remote_days_per_week ?? 2,
        failed_login_attempts: accountData.account_locked ? 5 : 0,
        account_locked: accountData.account_locked || false,
        assigned_device: {
          model: accountData.device_model || 'ThinkPad T14 Gen 4',
          serial: `VC-${prefix}-${Math.floor(10000 + Math.random() * 90000)}`,
          deployed_date: new Date().toISOString().split('T')[0],
          os: 'Windows 11 Enterprise',
          status: accountData.account_locked ? 'Locked Out' : 'Active'
        },
        mailbox_used_gb: 4.5,
        mailbox_limit_gb: 25.0,
        avatar_initials: initials
      };

      const currentList = getStored(STORAGE_KEYS.PERSONAS, FALLBACK_PERSONAS);
      setStored(STORAGE_KEYS.PERSONAS, [...currentList, newAccount]);
      setStored(STORAGE_KEYS.ACTIVE_PROFILE, newAccount);
      return newAccount;
    }
  },

  // System & Health
  getSystemHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/system/health`);
      const data = await handleResponse(res);
      if (Array.isArray(data) && data.length > 0) return data;
      return FALLBACK_HEALTH;
    } catch (err) {
      return FALLBACK_HEALTH;
    }
  },

  resetSeedData: async () => {
    try {
      const res = await fetch(`${API_BASE}/system/seed`, { method: 'POST' });
      await handleResponse(res);
    } catch (err) {}
    localStorage.removeItem(STORAGE_KEYS.PERSONAS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    return { status: "reset_completed" };
  }
};
