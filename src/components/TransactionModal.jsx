import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, generateId, CURRENCIES } from '../data/mockData';

const TODAY = new Date().toISOString().slice(0, 10);

const DEFAULTS = {
  date: TODAY,
  amount: '',
  category: '',
  customCategory: '',
  type: 'expense',
  note: '',
};

export default function TransactionModal() {
  const modal = useStore((s) => s.modal);
  const closeModal = useStore((s) => s.closeModal);
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);

  if (!modal) return null;

  const formKey = `${modal.mode}-${modal.tx?.id ?? 'new'}`;

  return (
    <TransactionModalContent
      key={formKey}
      modal={modal}
      closeModal={closeModal}
      addTransaction={addTransaction}
      updateTransaction={updateTransaction}
    />
  );
}

function TransactionModalContent({ modal, closeModal, addTransaction, updateTransaction }) {
  const currency = useStore((s) => s.currency);
  const setCurrency = useStore((s) => s.setCurrency);
  const transactions = useStore((s) => s.transactions);

  const customCats = useMemo(() => {
    const inc = [], exp = [];
    transactions.forEach(t => {
      if (t.type === 'income' && !INCOME_CATEGORIES.includes(t.category) && t.category !== 'Other') {
        if (!inc.includes(t.category)) inc.push(t.category);
      }
      if (t.type === 'expense' && !EXPENSE_CATEGORIES.includes(t.category) && t.category !== 'Other') {
        if (!exp.includes(t.category)) exp.push(t.category);
      }
    });
    return { income: inc, expense: exp };
  }, [transactions]);

  const [form, setForm] = useState(() => {
    if (modal?.tx) {
      const typeCats = modal.tx.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      const dynamicCats = modal.tx.type === 'income' ? customCats.income : customCats.expense;
      const allCats = [...typeCats, ...dynamicCats];
      const isStandard = allCats.includes(modal.tx.category) || modal.tx.category === 'Other';
      const rate = CURRENCIES[useStore.getState().currency]?.rate || 1;
      return {
        ...modal.tx,
        amount: modal.tx.amount ? (modal.tx.amount * rate).toFixed(2) : '',
        category: isStandard ? modal.tx.category : 'Other',
        customCategory: isStandard ? '' : modal.tx.category,
      };
    }
    return DEFAULTS;
  });
  const [errors, setErrors] = useState({});

  const isEdit = modal.mode === 'edit';
  const baseCategories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const currentCustomCats = form.type === 'income' ? customCats.income : customCats.expense;
  const categories = [
    ...baseCategories.filter(c => c !== 'Other'),
    ...currentCustomCats,
    'Other'
  ];

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // If type changes and category is no longer valid, reset it
  const setType = (type) => {
    const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const dynamics = type === 'income' ? customCats.income : customCats.expense;
    const all = [...cats, ...dynamics, 'Other'];
    setForm((f) => ({
      ...f,
      type,
      category: all.includes(f.category) ? f.category : '',
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.date) e.date = 'Required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.category) e.category = 'Select a category';
    if (form.category === 'Other' && (!form.customCategory || !form.customCategory.trim())) {
      e.customCategory = 'Enter a new category name';
    }
    if (!form.note.trim()) e.note = 'Enter a description';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const finalCategory = form.category === 'Other' && form.customCategory 
      ? form.customCategory.trim() 
      : form.category;

    const rate = CURRENCIES[currency]?.rate || 1;
    const tx = {
      ...form,
      category: finalCategory,
      amount: Number(form.amount) / rate,
      id: isEdit ? form.id : generateId(),
    };
    delete tx.customCategory;
    if (isEdit) {
      updateTransaction(tx.id, tx);
    } else {
      addTransaction(tx);
    }
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-surface border border-theme rounded-2xl shadow-2xl slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-theme">
          <div>
            <h2 className="text-sm font-semibold text-theme tracking-tight">
              {isEdit ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {isEdit ? 'Update the transaction details' : 'Add a new income or expense'}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-theme transition-colors border border-theme"
          >
            <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type toggle */}
          <div>
            <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1.5">Type</label>
            <div className="flex rounded-lg border border-theme overflow-hidden">
              {['income', 'expense'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-all
                    ${form.type === t
                      ? t === 'income' ? 'bg-income text-income border-0' : 'bg-expense text-expense'
                      : 'text-muted hover:text-theme'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <Field label="Amount" error={errors.amount}>
            <div className="relative flex items-center">
              <div className="absolute left-1 top-1 bottom-1 flex items-center border-r border-theme bg-surface-2 rounded-l-md px-2 z-10" style={{ width: '4.5rem' }}>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-transparent text-[11px] font-bold outline-none cursor-pointer appearance-none w-full text-theme"
                  aria-label="Currency"
                >
                  {Object.keys(CURRENCIES).map(c => (
                    <option key={c} value={c} className="bg-surface">{CURRENCIES[c].char} {c}</option>
                  ))}
                </select>
                <svg aria-hidden="true" width="8" height="8" viewBox="0 0 10 10" fill="none" className="absolute right-2 pointer-events-none text-muted">
                  <path d="M2.5 3.5L5 6L7.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                className={inputClass(errors.amount)}
                style={{ paddingLeft: '5.25rem' }}
              />
            </div>
          </Field>

          {/* Category */}
          <Field label="Category" error={errors.category || errors.customCategory}>
            <div className="space-y-2">
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className={inputClass(errors.category)}
              >
                <option value="">Select category…</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {form.category === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter custom category name..."
                  value={form.customCategory || ''}
                  onChange={(e) => set('customCategory', e.target.value)}
                  className={inputClass(errors.customCategory)}
                  autoFocus
                />
              )}
            </div>
          </Field>

          {/* Date */}
          <Field label="Date" error={errors.date}>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className={inputClass(errors.date)}
            />
          </Field>

          {/* Note */}
          <Field label="Description" error={errors.note}>
            <input
              type="text"
              placeholder="e.g. Monthly salary"
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              className={inputClass(errors.note)}
            />
          </Field>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-2.5 rounded-xl border border-theme text-xs font-semibold text-muted hover:text-theme transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
            >
              {isEdit ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1.5">{label}</label>
      {children}
      {error && <p className="text-[11px] text-expense mt-1">{error}</p>}
    </div>
  );
}

function inputClass(hasError) {
  return `w-full px-3 py-2.5 rounded-lg border text-xs outline-none transition-colors bg-surface-2 text-theme placeholder:text-muted
    ${hasError ? 'border-expense' : 'border-theme focus:border-theme'}`;
}
