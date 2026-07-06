import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  mockTransactions,
  mockUsers,
  mockHabits,
  mockGoals,
  mockAssets,
  mockFeedback,
  mockNetWorthHistory
} from '../data/mockData';

export const useStore = create(
  persist(
    (set, get) => ({
      // State
      token: 'mock-jwt-token',
      currentUser: mockUsers[0], // Defaults to Alex Rivera (Viewer)
      role: mockUsers[0].role,
      currency: 'INR',
      darkMode: false,
      rippleEffect: false,
      activePage: 'dashboard',
      isLoading: false,

      // Data Lists
      transactions: mockTransactions,
      habits: mockHabits,
      goals: mockGoals,
      assets: mockAssets,
      feedback: mockFeedback,
      bills: [
        { id: 'bill-1', name: 'Water & Electricity Utility', amount: 120, dueDate: '2026-07-15', category: 'Utilities', status: 'unpaid' },
        { id: 'bill-2', name: 'High-speed Fiber Internet', amount: 65, dueDate: '2026-07-22', category: 'Utilities', status: 'unpaid' }
      ],
      netWorthHistory: mockNetWorthHistory,
      budgetLimits: { Food: 500, Shopping: 800, Utilities: 300 },
      
      // Admin lists
      adminUsers: mockUsers,
      adminFeedback: mockFeedback,

      // Alerting & Gamification notifications
      budgetAlert: null,
      badgeUnlocked: null,
      xpGained: null,

      // Toasts state
      toasts: [],
      addToast: (message, type = 'info') => {
        const id = Date.now();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 3000);
      },

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

      // Authentication (Offline Mock validation)
      login: async (email, password) => {
        try {
          set({ isLoading: true });
          const user = mockUsers.find(u => u.email === email);
          if (!user) {
            throw new Error('Invalid email or password.');
          }
          set({
            token: 'mock-jwt-token',
            currentUser: user,
            role: user.role,
            isLoading: false,
            transactions: mockTransactions,
            habits: mockHabits,
            goals: mockGoals,
            assets: mockAssets,
            feedback: mockFeedback,
            bills: [
              { id: 'bill-1', name: 'Water & Electricity Utility', amount: 120, dueDate: '2026-07-15', category: 'Utilities', status: 'unpaid' },
              { id: 'bill-2', name: 'High-speed Fiber Internet', amount: 65, dueDate: '2026-07-22', category: 'Utilities', status: 'unpaid' }
            ],
            netWorthHistory: mockNetWorthHistory,
            budgetLimits: { Food: 500, Shopping: 800, Utilities: 300 }
          });
          get().addToast(`Welcome back, ${user.name}!`, 'success');
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.message };
        }
      },

      register: async (name, email, password) => {
        try {
          set({ isLoading: true });
          const newUser = {
            id: `usr-${Date.now()}`,
            name,
            email,
            password,
            targetSavingsRate: 20,
            role: 'viewer',
            status: 'Active',
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
            joinedDate: new Date().toISOString().slice(0, 10),
            xp: 150,
            badges: ['Streak Starter']
          };
          
          set((s) => ({
            currentUser: newUser,
            role: 'viewer',
            token: 'mock-jwt-token',
            adminUsers: [...s.adminUsers, newUser],
            transactions: mockTransactions,
            habits: mockHabits,
            goals: mockGoals,
            assets: mockAssets,
            feedback: mockFeedback,
            bills: [
              { id: 'bill-1', name: 'Water & Electricity Utility', amount: 120, dueDate: '2026-07-15', category: 'Utilities', status: 'unpaid' },
              { id: 'bill-2', name: 'High-speed Fiber Internet', amount: 65, dueDate: '2026-07-22', category: 'Utilities', status: 'unpaid' }
            ],
            netWorthHistory: mockNetWorthHistory,
            budgetLimits: { Food: 500, Shopping: 800, Utilities: 300 }
          }));

          get().addToast(`Account created successfully!`, 'success');
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
        });
        get().addToast('Logged out successfully.', 'info');
      },

      deleteAccount: async () => {
        get().logout();
        get().addToast('Account deleted successfully.', 'success');
        return { success: true };
      },

      updateProfile: async (profileData) => {
        set((s) => ({
          currentUser: { ...s.currentUser, ...profileData }
        }));
        get().addToast('Profile updated successfully!', 'success');
        return { success: true };
      },

      changePassword: async (currentPassword, newPassword) => {
        get().addToast('Password updated successfully!', 'success');
        return { success: true };
      },

      forgotPassword: async (email) => {
        get().addToast('Password reset link sent (Mock)!', 'success');
        return { success: true };
      },

      resetPassword: async (token, newPassword) => {
        get().addToast('Password has been reset successfully!', 'success');
        return { success: true };
      },

      loadData: async () => {
        const s = get();
        if (!s.transactions || s.transactions.length === 0) {
          set({
            transactions: mockTransactions,
            habits: mockHabits,
            goals: mockGoals,
            assets: mockAssets,
            feedback: mockFeedback,
            bills: [
              { id: 'bill-1', name: 'Water & Electricity Utility', amount: 120, dueDate: '2026-07-15', category: 'Utilities', status: 'unpaid' },
              { id: 'bill-2', name: 'High-speed Fiber Internet', amount: 65, dueDate: '2026-07-22', category: 'Utilities', status: 'unpaid' }
            ],
            netWorthHistory: mockNetWorthHistory,
            budgetLimits: { Food: 500, Shopping: 800, Utilities: 300 }
          });
        }
      },

      // Transactions CRUD
      addTransaction: async (txData) => {
        const newTx = {
          ...txData,
          id: `tx-${Date.now()}`,
          userId: get().currentUser?.id || 'usr-1',
        };

        set((s) => {
          const list = [newTx, ...s.transactions];
          
          // Verify category budget warning
          const month = newTx.date.slice(0, 7);
          const limit = s.budgetLimits[newTx.category] || 0;
          if (newTx.type === 'expense' && limit > 0) {
            const spent = list
              .filter((t) => t.userId === newTx.userId && t.type === 'expense' && t.date.startsWith(month) && t.category === newTx.category)
              .reduce((sum, t) => sum + t.amount, 0);
            if (spent > limit) {
              s.addToast(`Warning: Spent ${spent} in ${newTx.category}. Monthly limit of ${limit} exceeded!`, 'error');
            }
          }

          return { transactions: list };
        });

        get().addToast('Transaction recorded.', 'success');
        return { success: true };
      },

      updateTransaction: async (id, updatedData) => {
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id || t._id === id ? { ...t, ...updatedData } : t)),
        }));
        get().addToast('Transaction updated.', 'success');
      },

      deleteTransaction: async (id) => {
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id && t._id !== id),
        }));
        get().addToast('Transaction deleted.', 'success');
      },

      setBudgetLimit: async (category, limit) => {
        set((s) => ({
          budgetLimits: { ...s.budgetLimits, [category]: Number(limit) },
        }));
        get().addToast(`Budget limit set for ${category}.`, 'success');
      },

      // Habits CRUD
      addHabit: async (name, frequency) => {
        const newHabit = {
          id: `hab-${Date.now()}`,
          userId: get().currentUser?.id || 'usr-1',
          name,
          frequency,
          streak: 0,
          completionHistory: [],
        };
        set((s) => ({ habits: [...s.habits, newHabit] }));
        get().addToast('Habit added to your tracker!', 'success');
      },

      toggleHabitCompletion: async (id, dateStr) => {
        set((s) => {
          let earnedXp = 0;
          let badgeUnlockedMessage = '';

          const habits = s.habits.map((h) => {
            if (h.id !== id && h._id !== id) return h;

            const history = h.completionHistory.includes(dateStr)
              ? h.completionHistory.filter((d) => d !== dateStr)
              : [...h.completionHistory, dateStr];

            // Streak logic
            const sorted = [...history].sort((a, b) => new Date(b) - new Date(a));
            let streak = 0;
            if (sorted.length > 0) {
              const today = new Date().toISOString().slice(0, 10);
              const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
              const latest = sorted[0];
              if (latest === today || latest === yesterday) {
                streak = 1;
                for (let i = 0; i < sorted.length - 1; i++) {
                  const curr = new Date(sorted[i]);
                  const next = new Date(sorted[i + 1]);
                  const diff = (curr - next) / (1000 * 60 * 60 * 24);
                  if (diff === 1) streak++;
                  else if (diff > 1) break;
                }
              }
            }

            // XP and Badge alerts triggers on completion additions
            if (history.includes(dateStr) && !h.completionHistory.includes(dateStr)) {
              earnedXp += 10;
              if (streak === 3 && !s.currentUser?.badges?.includes('Streak Starter')) {
                badgeUnlockedMessage = 'Streak Starter 🚀';
              } else if (streak === 7 && !s.currentUser?.badges?.includes('Consistency Champion')) {
                badgeUnlockedMessage = 'Consistency Champion 🏆';
              }
            }

            return { ...h, completionHistory: history, streak };
          });

          // Award XP and badges locally
          let updatedUser = s.currentUser;
          if (earnedXp > 0 && updatedUser) {
            const nextBadges = [...(updatedUser.badges || [])];
            let badgeXp = 0;
            if (badgeUnlockedMessage) {
              nextBadges.push(badgeUnlockedMessage.split(' ')[0] + ' ' + badgeUnlockedMessage.split(' ')[1]);
              badgeXp = 50;
              s.addToast(`Badge Unlocked: ${badgeUnlockedMessage}!`, 'success');
            }
            updatedUser = {
              ...updatedUser,
              xp: (updatedUser.xp || 0) + earnedXp + badgeXp,
              badges: nextBadges
            };
            s.addToast(`+${earnedXp} XP check-in reward!`, 'success');
          }

          return { habits, currentUser: updatedUser };
        });
      },

      deleteHabit: async (id) => {
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id && h._id !== id) }));
        get().addToast('Habit deleted.', 'success');
      },

      // Savings Goals
      addGoal: async (goalData) => {
        const newGoal = {
          ...goalData,
          id: `goal-${Date.now()}`,
          userId: get().currentUser?.id || 'usr-1',
          currentAmount: 0,
          contributions: [],
        };
        set((s) => ({ goals: [...s.goals, newGoal] }));
        get().addToast('Goal tracker initialized!', 'success');
      },

      addGoalContribution: async (id, amount, note) => {
        const amountNum = Number(amount);
        set((s) => {
          const list = s.goals.map((g) => {
            if (g.id !== id && g._id !== id) return g;
            const newContribution = {
              id: `c-${Date.now()}`,
              amount: amountNum,
              date: new Date().toISOString().slice(0, 10),
              note,
            };
            return {
              ...g,
              currentAmount: g.currentAmount + amountNum,
              contributions: [...g.contributions, newContribution],
            };
          });

          // Write transactions ledger matching record
          const autoTx = {
            id: `tx-${Date.now()}`,
            userId: get().currentUser?.id || 'usr-1',
            date: new Date().toISOString().slice(0, 10),
            amount: amountNum,
            category: 'Investment',
            type: 'expense',
            note: `Contribution: ${note}`,
          };

          return { goals: list, transactions: [autoTx, ...s.transactions] };
        });

        get().addToast('Savings contribution credited.', 'success');
      },

      deleteGoal: async (id) => {
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id && g._id !== id) }));
        get().addToast('Savings goal deleted.', 'success');
      },

      // Wealth Assets & Liabilities CRUD
      addAsset: async (assetData) => {
        const newAsset = {
          ...assetData,
          id: `ast-${Date.now()}`,
          userId: get().currentUser?.id || 'usr-1',
          lastUpdated: new Date().toISOString().slice(0, 10),
        };
        set((s) => ({ assets: [...s.assets, newAsset] }));
        get().addToast('Asset recorded in portfolio registry.', 'success');
      },

      updateAssetBalance: async (id, amount) => {
        set((s) => ({
          assets: s.assets.map((a) => (a.id === id || a._id === id ? { ...a, amount: Number(amount), lastUpdated: new Date().toISOString().slice(0, 10) } : a)),
        }));
        get().addToast('Holding balance updated.', 'success');
      },

      deleteAsset: async (id) => {
        set((s) => ({ assets: s.assets.filter((a) => a.id !== id && a._id !== id) }));
        get().addToast('Holding registry removed.', 'success');
      },

      // Bills CRUD
      addBill: async (billData) => {
        const newBill = {
          ...billData,
          id: `bill-${Date.now()}`,
          userId: get().currentUser?.id || 'usr-1',
          status: 'unpaid',
        };
        set((s) => ({ bills: [...s.bills, newBill] }));
        get().addToast('Bill reminder created successfully!', 'success');
        return { success: true };
      },

      payBill: async (id) => {
        set((s) => {
          let paidBill = null;
          const list = s.bills.map((b) => {
            if (b.id !== id && b._id !== id) return b;
            paidBill = { ...b, status: 'paid' };
            return paidBill;
          });

          // Auto expense ledger transaction
          const autoTx = {
            id: `tx-${Date.now()}`,
            userId: get().currentUser?.id || 'usr-1',
            date: new Date().toISOString().slice(0, 10),
            amount: paidBill.amount,
            category: paidBill.category || 'Utilities',
            type: 'expense',
            note: `Bill Paid: ${paidBill.name}`,
          };

          return { bills: list, transactions: [autoTx, ...s.transactions] };
        });
        get().addToast('Bill marked as paid! Expense added to ledger.', 'success');
        return { success: true };
      },

      deleteBill: async (id) => {
        set((s) => ({ bills: s.bills.filter((b) => b.id !== id && b._id !== id) }));
        get().addToast('Bill reminder deleted.', 'success');
        return { success: true };
      },

      // Support Feedback submitting
      submitFeedback: async (type, message) => {
        const newTicket = {
          id: `fb-${Date.now()}`,
          userId: get().currentUser?.id || 'usr-1',
          userName: get().currentUser?.name || 'Alex Rivera',
          type,
          message,
          date: new Date().toISOString().slice(0, 10),
          status: 'pending',
          reply: '',
        };
        set((s) => ({
          feedback: [newTicket, ...s.feedback],
          adminFeedback: [newTicket, ...s.adminFeedback],
        }));
        get().addToast('Feedback ticket submitted!', 'success');
      },

      // Admin Actions
      resolveFeedbackTicket: async (ticketId, reply) => {
        set((s) => ({
          feedback: s.feedback.map((f) => (f.id === ticketId || f._id === ticketId ? { ...f, status: 'resolved', reply } : f)),
          adminFeedback: s.adminFeedback.map((f) => (f.id === ticketId || f._id === ticketId ? { ...f, status: 'resolved', reply } : f)),
        }));
        get().addToast('Reply sent. Ticket status updated to resolved.', 'success');
      },

      toggleUserSuspension: async (userId) => {
        set((s) => {
          const list = s.adminUsers.map((u) => {
            if (u.id !== userId && u._id !== userId) return u;
            const nextStatus = u.status === 'Suspended' ? 'Active' : 'Suspended';
            return { ...u, status: nextStatus };
          });
          return { adminUsers: list };
        });
        get().addToast('User status modified.', 'success');
      },

      changeUserRole: async (userId, newRole) => {
        set((s) => {
          const list = s.adminUsers.map((u) => {
            if (u.id !== userId && u._id !== userId) return u;
            return { ...u, role: newRole };
          });
          const updatedCurrentUser = s.currentUser?.id === userId || s.currentUser?._id === userId 
            ? { ...s.currentUser, role: newRole } 
            : s.currentUser;

          return {
            adminUsers: list,
            currentUser: updatedCurrentUser,
            role: updatedCurrentUser?.role || s.role,
          };
        });
        get().addToast('User role updated.', 'success');
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
        // Force-refresh mock data if rehydrated with empty values in mock-mode
        if (state && (!state.transactions || state.transactions.length === 0)) {
          state.transactions = mockTransactions;
          state.habits = mockHabits;
          state.goals = mockGoals;
          state.assets = mockAssets;
          state.feedback = mockFeedback;
          state.netWorthHistory = mockNetWorthHistory;
          state.bills = [
            { id: 'bill-1', name: 'Water & Electricity Utility', amount: 120, dueDate: '2026-07-15', category: 'Utilities', status: 'unpaid' },
            { id: 'bill-2', name: 'High-speed Fiber Internet', amount: 65, dueDate: '2026-07-22', category: 'Utilities', status: 'unpaid' }
          ];
        }
      },
    }
  )
);
