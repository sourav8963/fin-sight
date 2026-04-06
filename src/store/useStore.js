import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockTransactions } from '../data/mockData';

export const useStore = create(
  persist(
    (set, get) => ({
      // Data
      transactions: mockTransactions,
      isLoading: true,
      setIsLoading: (val) => set({ isLoading: val }),

      // Role
      role: 'viewer', // 'viewer' | 'admin'
      setRole: (role) => set({ role }),

      // Currency
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

      // CRUD
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
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
