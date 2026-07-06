import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  mockTransactions,
  mockUsers,
  mockHabits,
  mockGoals,
  mockAssets,
  mockFeedback
} from '../data/mockData';

// Helper to calculate daily habits streak
const calculateStreak = (history) => {
  if (!history || history.length === 0) return 0;
  
  const sorted = [...new Set(history)].sort((a, b) => b.localeCompare(a));
  const todayStr = new Date().toISOString().slice(0, 10);
  
  const tempDate = new Date();
  tempDate.setDate(tempDate.getDate() - 1);
  const yesterdayStr = tempDate.toISOString().slice(0, 10);

  // If today or yesterday is not in the list, streak is broken (0)
  if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentDateToCheck = new Date(sorted[0]);

  for (let i = 0; i < sorted.length; i++) {
    const expectedStr = currentDateToCheck.toISOString().slice(0, 10);
    if (sorted.includes(expectedStr)) {
      streak++;
      currentDateToCheck.setDate(currentDateToCheck.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

export const useStore = create(
  persist(
    (set, get) => ({
      // Core Data
      transactions: mockTransactions,
      isLoading: true,
      setIsLoading: (val) => set({ isLoading: val }),

      // Users & Auth
      users: mockUsers,
      currentUser: null, // Starts as null to trigger login screen
      login: (email, password) => {
        const user = get().users.find((u) => u.email === email && u.password === password);
        if (!user) return { success: false, error: 'Invalid email or password' };
        if (user.status === 'Suspended') return { success: false, error: 'Account suspended. Contact admin.' };
        
        set({ currentUser: user, role: user.role });
        return { success: true };
      },
      register: (name, email, password) => {
        const exists = get().users.some((u) => u.email === email);
        if (exists) return { success: false, error: 'Email already registered' };

        const newUser = {
          id: `usr-${Date.now()}`,
          name,
          email,
          password,
          targetSavingsRate: 20,
          role: 'viewer', // default role
          status: 'Active',
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
          joinedDate: new Date().toISOString().slice(0, 10),
        };

        set((s) => ({
          users: [...s.users, newUser],
          currentUser: newUser,
          role: 'viewer',
        }));
        return { success: true };
      },
      logout: () => {
        set({ currentUser: null, activePage: 'dashboard' });
      },
      updateProfile: (updatedData) => {
        set((s) => {
          if (!s.currentUser) return {};
          const updatedUser = { ...s.currentUser, ...updatedData };
          return {
            currentUser: updatedUser,
            users: s.users.map((u) => (u.id === s.currentUser.id ? updatedUser : u)),
          };
        });
      },
      toggleUserStatus: (userId) => {
        set((s) => ({
          users: s.users.map((u) => {
            if (u.id === userId) {
              const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
              // If we suspend the current user, log them out
              if (userId === s.currentUser?.id && nextStatus === 'Suspended') {
                setTimeout(() => get().logout(), 0);
              }
              return { ...u, status: nextStatus };
            }
            return u;
          }),
        }));
      },
      changeUserRole: (userId, newRole) => {
        set((s) => {
          const updatedUsers = s.users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
          const updatedCurrentUser = s.currentUser?.id === userId ? { ...s.currentUser, role: newRole } : s.currentUser;
          return {
            users: updatedUsers,
            currentUser: updatedCurrentUser,
            role: updatedCurrentUser?.role || s.role,
          };
        });
      },

      // Habits Tracking
      habits: mockHabits,
      addHabit: (name, frequency) => {
        const userId = get().currentUser?.id || 'usr-1';
        const newHabit = {
          id: `hab-${Date.now()}`,
          userId,
          name,
          frequency,
          streak: 0,
          lastCompleted: '',
          completionHistory: [],
        };
        set((s) => ({ habits: [...s.habits, newHabit] }));
      },
      toggleHabitCompletion: (id, dateStr) => {
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id === id) {
              const history = [...h.completionHistory];
              const idx = history.indexOf(dateStr);
              if (idx > -1) {
                history.splice(idx, 1);
              } else {
                history.push(dateStr);
              }
              const newStreak = calculateStreak(history);
              const sortedHistory = [...history].sort();
              const lastCompleted = sortedHistory[sortedHistory.length - 1] || '';

              return {
                ...h,
                completionHistory: sortedHistory,
                streak: newStreak,
                lastCompleted,
              };
            }
            return h;
          }),
        }));
      },
      deleteHabit: (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
      },

      // Savings Goals
      goals: mockGoals,
      addGoal: (name, targetAmount, targetDate, category) => {
        const userId = get().currentUser?.id || 'usr-1';
        const newGoal = {
          id: `goal-${Date.now()}`,
          userId,
          name,
          targetAmount: Number(targetAmount),
          currentAmount: 0,
          targetDate,
          category,
          contributions: [],
        };
        set((s) => ({ goals: [...s.goals, newGoal] }));
      },
      addContribution: (goalId, amount, note) => {
        const parsedAmt = Number(amount);
        if (isNaN(parsedAmt) || parsedAmt <= 0) return;

        set((s) => {
          // Check if we have enough balance to contribute
          const income = s.transactions.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
          const expenses = s.transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
          const currentBalance = income - expenses;

          if (currentBalance < parsedAmt) {
            // Can still contribute but let's log it as an expense to balance check or just allow mock deficit
          }

          // Create an automatic transaction record as an expense category 'Goal Contribution'
          const autoTx = {
            id: `tx-goal-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            amount: parsedAmt,
            category: 'Other',
            type: 'expense',
            note: `Savings Goal Contribution: ${s.goals.find(g => g.id === goalId)?.name || 'Goal'}`,
          };

          return {
            transactions: [autoTx, ...s.transactions],
            goals: s.goals.map((g) => {
              if (g.id === goalId) {
                const contribution = {
                  id: `contrib-${Date.now()}`,
                  amount: parsedAmt,
                  date: new Date().toISOString().slice(0, 10),
                  note: note || 'Goal deposit',
                };
                return {
                  ...g,
                  currentAmount: g.currentAmount + parsedAmt,
                  contributions: [contribution, ...g.contributions],
                };
              }
              return g;
            }),
          };
        });
      },
      deleteGoal: (id) => {
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
      },

      // Wealth Assets & Liabilities
      assets: mockAssets,
      addAsset: (name, category, amount) => {
        const userId = get().currentUser?.id || 'usr-1';
        const newAsset = {
          id: `ast-${Date.now()}`,
          userId,
          name,
          category,
          amount: Number(amount),
          lastUpdated: new Date().toISOString().slice(0, 10),
        };
        set((s) => ({ assets: [...s.assets, newAsset] }));
      },
      updateAsset: (id, amount) => {
        set((s) => ({
          assets: s.assets.map((a) =>
            a.id === id ? { ...a, amount: Number(amount), lastUpdated: new Date().toISOString().slice(0, 10) } : a
          ),
        }));
      },
      deleteAsset: (id) => {
        set((s) => ({ assets: s.assets.filter((a) => a.id !== id) }));
      },

      // User Feedback system
      feedback: mockFeedback,
      submitFeedback: (type, message) => {
        const user = get().currentUser || { name: 'Anonymous', id: 'anon' };
        const newFb = {
          id: `fb-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          type,
          message,
          date: new Date().toISOString().slice(0, 10),
          status: 'pending',
          reply: '',
        };
        set((s) => ({ feedback: [newFb, ...s.feedback] }));
      },
      resolveFeedback: (id, reply) => {
        set((s) => ({
          feedback: s.feedback.map((f) =>
            f.id === id ? { ...f, status: 'resolved', reply } : f
          ),
        }));
      },

      // Client Role Toggling (still supported, handles top bar compatibility)
      role: 'viewer', // 'viewer' | 'admin'
      setRole: (role) => set({ role }),

      // Currency settings
      currency: 'INR',
      setCurrency: (currency) => set({ currency }),

      // Theme & Effects
      darkMode: false,
      toggleDarkMode: () => {
        const next = !get().darkMode;
        set({ darkMode: next });
        document.documentElement.classList.toggle('dark', next);
      },
      rippleEffect: false,
      toggleRippleEffect: () => set((s) => ({ rippleEffect: !s.rippleEffect })),

      // Navigation
      activePage: 'dashboard',
      setActivePage: (page) => set({ activePage: page }),

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

      // Modal
      modal: null, // null | { mode: 'add' | 'edit', tx: object | null }
      openModal: (mode, tx = null) => set({ modal: { mode, tx } }),
      closeModal: () => set({ modal: null }),

      // Transactions CRUD
      addTransaction: (tx) =>
        set((s) => ({ transactions: [tx, ...s.transactions] })),
      updateTransaction: (id, updated) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...updated } : t)),
        })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
    }),
    {
      name: 'finance-store',
      partialize: (s) => ({
        transactions: s.transactions,
        darkMode: s.darkMode,
        role: s.role,
        currency: s.currency,
        rippleEffect: s.rippleEffect,
        users: s.users,
        currentUser: s.currentUser,
        habits: s.habits,
        goals: s.goals,
        assets: s.assets,
        feedback: s.feedback,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);

