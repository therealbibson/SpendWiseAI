const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const api = {
  // Budgets
  getBudgets: async () => {
    const res = await fetch(`${BASE_URL}/budgets`, { headers: getHeaders() });
    return handleResponse(res);
  },
  createBudget: async (budgetData) => {
    const res = await fetch(`${BASE_URL}/budgets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(budgetData)
    });
    return handleResponse(res);
  },
  deleteBudget: async (id) => {
    const res = await fetch(`${BASE_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  getRecommendations: async () => {
    const res = await fetch(`${BASE_URL}/budgets/recommendations`, { headers: getHeaders() });
    return handleResponse(res);
  },
  applyRecommendation: async (id) => {
    const res = await fetch(`${BASE_URL}/budgets/recommendations/${id}/apply`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  dismissRecommendation: async (id) => {
    const res = await fetch(`${BASE_URL}/budgets/recommendations/${id}/dismiss`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Transactions
  getTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/transactions?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  createTransaction: async (txData) => {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(txData)
    });
    return handleResponse(res);
  },
  importTransactions: async (items) => {
    const res = await fetch(`${BASE_URL}/transactions/import`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ items })
    });
    return handleResponse(res);
  },
  getStats: async () => {
    const res = await fetch(`${BASE_URL}/transactions/stats`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Subscriptions
  getSubscriptions: async () => {
    const res = await fetch(`${BASE_URL}/subscriptions`, { headers: getHeaders() });
    return handleResponse(res);
  },
  createSubscription: async (subData) => {
    const res = await fetch(`${BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(subData)
    });
    return handleResponse(res);
  },
  updateSubscription: async (id, subData) => {
    const res = await fetch(`${BASE_URL}/subscriptions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(subData)
    });
    return handleResponse(res);
  },
  deleteSubscription: async (id) => {
    const res = await fetch(`${BASE_URL}/subscriptions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Savings Goals
  getSavingsGoals: async () => {
    const res = await fetch(`${BASE_URL}/savings`, { headers: getHeaders() });
    return handleResponse(res);
  },
  createSavingsGoal: async (goalData) => {
    const res = await fetch(`${BASE_URL}/savings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(goalData)
    });
    return handleResponse(res);
  },
  updateSavingsGoal: async (id, goalData) => {
    const res = await fetch(`${BASE_URL}/savings/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(goalData)
    });
    return handleResponse(res);
  },
  depositSavings: async (id, amount) => {
    const res = await fetch(`${BASE_URL}/savings/${id}/deposit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount })
    });
    return handleResponse(res);
  },

  // Agent Rules
  getRules: async () => {
    const res = await fetch(`${BASE_URL}/rules`, { headers: getHeaders() });
    return handleResponse(res);
  },
  createRule: async (ruleData) => {
    const res = await fetch(`${BASE_URL}/rules`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(ruleData)
    });
    return handleResponse(res);
  },
  updateRule: async (id, ruleData) => {
    const res = await fetch(`${BASE_URL}/rules/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(ruleData)
    });
    return handleResponse(res);
  },
  deleteRule: async (id) => {
    const res = await fetch(`${BASE_URL}/rules/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  evaluateRules: async () => {
    const res = await fetch(`${BASE_URL}/rules/evaluate`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // AI Chat
  getChatHistory: async () => {
    const res = await fetch(`${BASE_URL}/chat/history`, { headers: getHeaders() });
    return handleResponse(res);
  },
  postChatMessage: async (message) => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    });
    return handleResponse(res);
  },

  // Insights
  getInsights: async () => {
    const res = await fetch(`${BASE_URL}/insights`, { headers: getHeaders() });
    return handleResponse(res);
  },
  generateInsights: async () => {
    const res = await fetch(`${BASE_URL}/insights/generate`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${BASE_URL}/notifications`, { headers: getHeaders() });
    return handleResponse(res);
  },
  markNotificationsRead: async () => {
    const res = await fetch(`${BASE_URL}/notifications/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  markNotificationReadSingle: async (id) => {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  deleteNotification: async (id) => {
    const res = await fetch(`${BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Auth Extra
  exportKey: async (password) => {
    const res = await fetch(`${BASE_URL}/auth/export-key`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ password })
    });
    return handleResponse(res);
  }
};
