/**
 * Configuration API RawFinance Pro
 * En dev local (npm run dev) : utilise localhost:3001
 * En production : VITE_API_URL ou Render
 */
export const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3001'
  : (import.meta.env.VITE_API_URL || 'https://rawbank.onrender.com');

export const api = {
  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    me: `${API_BASE_URL}/api/auth/me`,
  },
  users: {
    profile: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    score: (id: string) => `${API_BASE_URL}/api/users/${id}/score`,
    creditSimulate: (id: string, amount: number, duration: number) =>
      `${API_BASE_URL}/api/users/${id}/credit-simulate?amount=${amount}&duration=${duration}`,
    credits: (id: string) => `${API_BASE_URL}/api/users/${id}/credits`,
    creditRequest: (id: string) => `${API_BASE_URL}/api/users/${id}/credits/request`,
    updateProfile: `${API_BASE_URL}/api/users/profile`,
    updateProfileById: (id: string) => `${API_BASE_URL}/api/users/${id}`,
  },
  mobileMoney: {
    all: (id: string) => `${API_BASE_URL}/api/users/${id}/mobile-money`,
    transactions: (id: string) => `${API_BASE_URL}/api/users/${id}/transactions`,
    recharges: (id: string) => `${API_BASE_URL}/api/users/${id}/recharges`,
    solde: (id: string) => `${API_BASE_URL}/api/users/${id}/solde`,
    comptes: (id: string) => `${API_BASE_URL}/api/users/${id}/comptes-mobile`,
    stats: (id: string) => `${API_BASE_URL}/api/users/${id}/stats`,
  },
  operateurs: {
    donneesByUser: (id: string) => `${API_BASE_URL}/api/operateurs/donnees/${id}`,
  },
};
