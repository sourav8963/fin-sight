import { useState } from 'react';
import { useStore } from '../store/useStore';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, generateId } from '../data/mockData';

const TODAY = new Date().toISOString().slice(0, 10);

const DEFAULTS = {
  date: TODAY,
  amount: '',
  category: '',
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
  const [form, setForm] = useState(() => (modal?.tx ? { ...modal.tx } : DEFAULTS));
  const [errors, setErrors] = useState({});

  const isEdit = modal.mode === 'edit';
  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // If type changes and category is no longer valid, reset it
  const setType = (type) => {
    const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setForm((f) => ({
      ...f,
      type,
      category: cats.includes(f.category) ? f.category : '',
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.date) e.date = 'Required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.category) e.category = 'Select a category';
    if (!form.note.trim()) e.note = 'Enter a description';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const tx = {
      ...form,
      amount: Number(form.amount),
      id: isEdit ? form.id : generateId(),
    };
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
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
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
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                className={inputClass(errors.amount)}
                style={{ paddingLeft: '1.5rem' }}
              />
            </div>
          </Field>

          {/* Category */}
          <Field label="Category" error={errors.category}>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className={inputClass(errors.category)}
            >
              <option value="">Select category…</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
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
