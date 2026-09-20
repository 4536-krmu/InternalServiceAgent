/**
 * API client for Veridian Corp IT Service Portal.
 * Interacts with FastAPI backend at /api/v1/*.
 */

const API_BASE = '/api/v1';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  // Requests & Agent Loop
  submitRequest: async (data) => {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  quickQuery: async (query, requesterId = null) => {
    const res = await fetch(`${API_BASE}/requests/quick-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, requester_id: requesterId })
    });
    return handleResponse(res);
  },

  // Tickets
  getTickets: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
    if (params.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/tickets${qs}`);
    return handleResponse(res);
  },

  getTicket: async (ticketId) => {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}`);
    return handleResponse(res);
  },

  performTicketAction: async (ticketId, actionData) => {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionData)
    });
    return handleResponse(res);
  },

  // Policies
  getPolicies: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/policies${qs}`);
    return handleResponse(res);
  },

  getPolicy: async (policyId) => {
    const res = await fetch(`${API_BASE}/policies/${policyId}`);
    return handleResponse(res);
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.eventType && params.eventType !== 'ALL') query.append('event_type', params.eventType);
    if (params.ticketId) query.append('ticket_id', params.ticketId);
    if (params.traceId) query.append('trace_id', params.traceId);
    if (params.limit) query.append('limit', params.limit);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/audit-logs${qs}`);
    return handleResponse(res);
  },

  clearAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/audit-logs/clear`, { method: 'POST' });
    return handleResponse(res);
  },

  // Profile & Personas
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/profile`);
    return handleResponse(res);
  },

  updateProfile: async (profileData) => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  getPersonas: async () => {
    const res = await fetch(`${API_BASE}/profile/personas`);
    return handleResponse(res);
  },

  switchPersona: async (personaId) => {
    const res = await fetch(`${API_BASE}/profile/switch/${personaId}`, { method: 'POST' });
    return handleResponse(res);
  },

  createAccount: async (accountData) => {
    const res = await fetch(`${API_BASE}/profile/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accountData)
    });
    return handleResponse(res);
  },

  // System & Health
  getSystemHealth: async () => {
    const res = await fetch(`${API_BASE}/system/health`);
    return handleResponse(res);
  },

  resetSeedData: async () => {
    const res = await fetch(`${API_BASE}/system/seed`, { method: 'POST' });
    return handleResponse(res);
  }
};
