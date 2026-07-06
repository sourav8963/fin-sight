import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = 'http://localhost:5000/api';

const apiCall = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const config = {
    method,
    headers,
  };
  if (body) {
    config.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_URL}${endpoint}`, config);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
};

export const useStore = create(
  persist(
    (set, get) => ({
      // State
      token: null,
      currentUser: null,
      role: 'viewer',
      currency: 'INR',
      darkMode: false,
      rippleEffect: false,
      activePage: 'dashboard',
      isLoading: false,

      // Toasts state
      toasts: [],
      addToast: (message, type = 'info') => {
        const id = Date.now();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 3000);
      },

      // Data Lists
      transactions: [],
      habits: [],
      goals: [],
      assets: [],
      feedback: [],
      netWorthHistory: [],
      budgetLimits: {},
      
      // Admin lists
      adminUsers: [],
      adminFeedback: [],

      // Alerting & Gamification notifications
      budgetAlert: null,
      badgeUnlocked: null,
      xpGained: null,

      // Filters
      filters: {
        search: '',
        type: 'all',
        category: 'all',
        sortBy: 'date',
        sortDir: 'desc',
      },

      setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value } })),
      resetFilters: () =>
        set({ filters: { search: '', type: 'all', category: 'all', sortBy: 'date', sortDir: 'desc' } }),

      // Modal State
      modal: null, // null | { mode: 'add' | 'edit', tx: object | null }
      openModal: (mode, tx = null) => set({ modal: { mode, tx } }),
      closeModal: () => set({ modal: null }),

      // Actions
      setIsLoading: (val) => set({ isLoading: val }),
      setCurrency: (currency) => set({ currency }),
      setActivePage: (activePage) => {
        set({ activePage });
        // Auto refresh data when page switches
        get().loadData();
      },

      toggleDarkMode: () => {
        const next = !get().darkMode;
        set({ darkMode: next });
        document.documentElement.classList.toggle('dark', next);
      },
      toggleRippleEffect: () => set((s) => ({ rippleEffect: !s.rippleEffect })),

      // Clear alerts
      clearAlerts: () => set({ budgetAlert: null, badgeUnlocked: null, xpGained: null }),

      // Authentication
      login: async (email, password) => {
        try {
          set({ isLoading: true });
          const data = await apiCall('/auth/login', 'POST', { email, password });
          set({
            token: data.token,
            currentUser: data.user,
            role: data.user.role,
            isLoading: false,
          });
          await get().loadData();
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.message };
        }
      },

      register: async (name, email, password) => {
        try {
          set({ isLoading: true });
          const data = await apiCall('/auth/register', 'POST', { name, email, password });
          set({
            token: data.token,
            currentUser: data.user,
            role: data.user.role,
            isLoading: false,
          });
          await get().loadData();
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.message };
        }
      },

      logout: () => {
        set({
          token: null,
          currentUser: null,
          role: 'viewer',
          activePage: 'dashboard',
          transactions: [],
          habits: [],
          goals: [],
          assets: [],
          feedback: [],
          netWorthHistory: [],
          budgetLimits: {},
          adminUsers: [],
          adminFeedback: [],
        });
      },

      deleteAccount: async () => {
        try {
          const token = get().token;
          await apiCall('/auth/me', 'DELETE', null, token);
          get().logout();
          return { success: true };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      updateProfile: async (profileData) => {
        try {
          const token = get().token;
          const updatedUser = await apiCall('/auth/profile', 'POST', profileData, token);
          set({ currentUser: updatedUser });
          return { success: true };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        try {
          const token = get().token;
          await apiCall('/auth/change-password', 'POST', { currentPassword, newPassword }, token);
          return { success: true };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      forgotPassword: async (email) => {
        try {
          await apiCall('/auth/forgot-password', 'POST', { email });
          return { success: true };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      resetPassword: async (token, newPassword) => {
        try {
          await apiCall('/auth/reset-password', 'POST', { token, newPassword });
          return { success: true };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      // Fetch all user specific details from backend
      loadData: async () => {
        const token = get().token;
        if (!token) return;

        try {
          set({ isLoading: true });

          // Load core data sets concurrently
          const [txData, habitData, goalData, assetData, nwHistory, fbData, limits] = await Promise.all([
            apiCall('/transactions?limit=100', 'GET', null, token),
            apiCall('/habits', 'GET', null, token),
            apiCall('/goals', 'GET', null, token),
            apiCall('/wealth/assets', 'GET', null, token),
            apiCall('/wealth/history', 'GET', null, token),
            apiCall('/feedback', 'GET', null, token),
            apiCall('/transactions/budget', 'GET', null, token),
          ]);

          set({
            transactions: txData.transactions || [],
            habits: habitData || [],
            goals: goalData || [],
            assets: assetData || [],
            netWorthHistory: nwHistory || [],
            feedback: fbData || [],
            budgetLimits: limits || {},
            isLoading: false,
          });

          // Fetch Admin data sets if admin role
          if (get().role === 'admin') {
            const [adminUsersList, adminFbList] = await Promise.all([
              apiCall('/feedback/admin/users', 'GET', null, token),
              apiCall('/feedback/admin/all', 'GET', null, token),
            ]);
            set({
              adminUsers: adminUsersList || [],
              adminFeedback: adminFbList || [],
            });
          }
        } catch (err) {
          set({ isLoading: false });
          console.error('Failed to load portfolio statistics:', err.message);
        }
      },

      // Transactions CRUD
      addTransaction: async (txData) => {
        try {
          const token = get().token;
          const data = await apiCall('/transactions', 'POST', txData, token);
          set((s) => ({
            transactions: [data.transaction, ...s.transactions],
            budgetAlert: data.alert || null,
          }));
          await get().loadData();
          return { success: true };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      updateTransaction: async (id, updatedData) => {
        try {
          const token = get().token;
          const updated = await apiCall(`/transactions/${id}`, 'PUT', updatedData, token);
          set((s) => ({
            transactions: s.transactions.map((t) => (t._id === id ? updated : t)),
          }));
          await get().loadData();
          return { success: true };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      deleteTransaction: async (id) => {
        try {
          const token = get().token;
          await apiCall(`/transactions/${id}`, 'DELETE', null, token);
          set((s) => ({
            transactions: s.transactions.filter((t) => t._id !== id),
          }));
          await get().loadData();
          return { success: true };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      setBudgetLimit: async (category, limit) => {
        try {
          const token = get().token;
          const data = await apiCall('/transactions/budget', 'POST', { category, limit }, token);
          set({ budgetLimits: data.budgetLimits });
          return { success: true };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      // Habits Actions
      addHabit: async (name, frequency) => {
        try {
          const token = get().token;
          const newHabit = await apiCall('/habits', 'POST', { name, frequency }, token);
          set((s) => ({ habits: [...s.habits, newHabit] }));
          await get().loadData();
        } catch (err) {
          console.error(err.message);
        }
      },

      toggleHabitCompletion: async (id, dateStr) => {
        try {
          const token = get().token;
          const data = await apiCall(`/habits/toggle/${id}`, 'POST', { dateStr }, token);
          
          set((s) => {
            const updatedHabits = s.habits.map((h) => (h._id === id ? data.habit : h));
            const updatedUser = s.currentUser
              ? { ...s.currentUser, xp: data.xp, badges: data.badges }
              : null;
            return {
              habits: updatedHabits,
              currentUser: updatedUser,
              badgeUnlocked: data.badgeUnlocked || null,
              xpGained: data.xpGained || null,
            };
          });
          await get().loadData();
        } catch (err) {
          console.error(err.message);
        }
      },

      deleteHabit: async (id) => {
        try {
          const token = get().token;
          await apiCall(`/habits/${id}`, 'DELETE', null, token);
          set((s) => ({ habits: s.habits.filter((h) => h._id !== id) }));
          await get().loadData();
        } catch (err) {
          console.error(err.message);
        }
      },

      // Goals Actions
      addGoal: async (name, targetAmount, targetDate, category) => {
        try {
          const token = get().token;
          const newGoal = await apiCall('/goals', 'POST', { name, targetAmount, targetDate, category }, token);
          set((s) => ({ goals: [...s.goals, newGoal] }));
          await get().loadData();
        } catch (err) {
          console.error(err.message);
        }
      },

      addContribution: async (goalId, amount, note) => {
        try {
          const token = get().token;
          const data = await apiCall(`/goals/contribute/${goalId}`, 'POST', { amount, note }, token);
          set((s) => ({
            goals: s.goals.map((g) => (g._id === goalId ? data.goal : g)),
            transactions: [data.transaction, ...s.transactions],
          }));
          await get().loadData();
        } catch (err) {
          console.error(err.message);
        }
      },

      deleteGoal: async (id) => {
        try {
          const token = get().token;
          await apiCall(`/goals/${id}`, 'DELETE', null, token);
          set((s) => ({ goals: s.goals.filter((g) => g._id !== id) }));
          await get().loadData();
        } catch (err) {
          console.error(err.message);
        }
      },

      // Wealth Assets Actions
      addAsset: async (name, category, amount) => {
        try {
          const token = get().token;
          const newAsset = await apiCall('/wealth/assets', 'POST', { name, category, amount }, token);
          set((s) => ({ assets: [...s.assets, newAsset] }));
          await get().loadData();
        } catch (err) {
          console.error(err.message);
        }
      },

      updateAsset: async (id, amount) => {
        try {
          const token = get().token;
          const updated = await apiCall(`/wealth/assets/${id}`, 'PUT', { amount }, token);
          set((s) => ({
            assets: s.assets.map((a) => (a._id === id ? updated : a)),
          }));
          await get().loadData();
        } catch (err) {
          console.error(err.message);
        }
      },

      deleteAsset: async (id) => {
        try {
          const token = get().token;
          await apiCall(`/wealth/assets/${id}`, 'DELETE', null, token);
          set((s) => ({ assets: s.assets.filter((a) => a._id !== id) }));
          await get().loadData();
        } catch (err) {
          console.error(err.message);
        }
      },

      // Support Feedback Actions
      submitFeedback: async (type, message) => {
        try {
          const token = get().token;
          const newFb = await apiCall('/feedback', 'POST', { type, message }, token);
          set((s) => ({ feedback: [newFb, ...s.feedback] }));
          await get().loadData();
        } catch (err) {
          console.error(err.message);
        }
      },

      resolveFeedback: async (id, reply) => {
        try {
          const token = get().token;
          const updated = await apiCall(`/feedback/admin/resolve/${id}`, 'POST', { reply }, token);
          set((s) => ({
            adminFeedback: s.adminFeedback.map((f) => (f._id === id ? updated : f)),
          }));
          await get().loadData();
        } catch (err) {
          console.error(err.message);
        }
      },

      toggleUserStatus: async (userId) => {
        try {
          const token = get().token;
          const updated = await apiCall(`/feedback/admin/users/${userId}/status`, 'POST', null, token);
          set((s) => ({
            adminUsers: s.adminUsers.map((u) => (u._id === userId ? { ...u, status: updated.status } : u)),
          }));
          
          // Log out current user if suspended
          if (userId === get().currentUser?.id && updated.status === 'Suspended') {
            get().logout();
          } else {
            await get().loadData();
          }
        } catch (err) {
          console.error(err.message);
        }
      },

      changeUserRole: async (userId, newRole) => {
        try {
          const token = get().token;
          const updated = await apiCall(`/feedback/admin/users/${userId}/role`, 'POST', { role: newRole }, token);
          set((s) => {
            const updatedUsers = s.adminUsers.map((u) => (u._id === userId ? { ...u, role: updated.role } : u));
            const updatedCurrentUser = s.currentUser?.id === userId ? { ...s.currentUser, role: updated.role } : s.currentUser;
            return {
              adminUsers: updatedUsers,
              currentUser: updatedCurrentUser,
              role: updatedCurrentUser?.role || s.role,
            };
          });
          await get().loadData();
        } catch (err) {
          console.error(err.message);
        }
      },
    }),
    {
      name: 'finance-store',
      partialize: (s) => ({
        token: s.token,
        currentUser: s.currentUser,
        role: s.role,
        currency: s.currency,
        darkMode: s.darkMode,
        rippleEffect: s.rippleEffect,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        }
        // Load server data upon local rehydration
        if (state?.token) {
          setTimeout(() => state.loadData(), 100);
        }
      },
    }
  )
);


