import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../data/mockData';

export default function SavingsGoals() {
  const goals = useStore((s) => s.goals);
  const addGoal = useStore((s) => s.addGoal);
  const addContribution = useStore((s) => s.addContribution);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const currency = useStore((s) => s.currency);
  const currentUser = useStore((s) => s.currentUser);
  
  // Transactions needed to compute available balance
  const transactions = useStore((s) => s.transactions);

  // New goal form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Emergency');
  const [showForm, setShowForm] = useState(false);

  // Contribution state
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [contribAmt, setContribAmt] = useState('');
  const [contribNote, setContribNote] = useState('');
  const [contribError, setContribError] = useState('');

  // Filter goals for current user
  const userGoals = useMemo(() => {
    return goals.filter((g) => g.userId === (currentUser?.id || 'usr-1'));
  }, [goals, currentUser]);

  // Compute available balance
  const availableBalance = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    return income - expenses;
  }, [transactions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount || !targetDate) return;
    
    addGoal(name.trim(), Number(targetAmount), targetDate, category);
    setName('');
    setTargetAmount('');
    setTargetDate('');
    setShowForm(false);
  };

  const handleContribute = (goalId) => {
    setContribError('');
    const parsedAmt = Number(contribAmt);

    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setContribError('Enter a valid positive amount');
      return;
    }

    if (parsedAmt > availableBalance) {
      setContribError('Insufficient balance to contribute this amount');
      return;
    }

    addContribution(goalId, parsedAmt, contribNote.trim() || 'Goal contribution');
    setContribAmt('');
    setContribNote('');
    setActiveGoalId(null);
  };

  // Calculations
  const stats = useMemo(() => {
    if (userGoals.length === 0) return { totalTarget: 0, totalCurrent: 0, overallPct: 0 };
    const totalTarget = userGoals.reduce((acc, g) => acc + g.targetAmount, 0);
    const totalCurrent = userGoals.reduce((acc, g) => acc + g.currentAmount, 0);
    const overallPct = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    return { totalTarget, totalCurrent, overallPct };
  }, [userGoals]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 fade-in select-none">
      {/* Header and top summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted">Plan for big purchases, emergencies, and investments with tracking targets</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1"
          style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
        >
          {showForm ? 'Cancel' : '➕ Create Goal'}
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="bg-surface border border-theme rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Overall Savings Progress</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-theme mono">{formatCurrency(stats.totalCurrent, currency)}</span>
            <span className="text-xs text-muted">saved of {formatCurrency(stats.totalTarget, currency)} target</span>
          </div>
          <p className="text-xs text-muted">
            Available to Save: <span className="font-bold text-income mono">{formatCurrency(availableBalance, currency)}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-md">
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-muted">Total Completion</span>
            <span className="text-theme font-bold mono">{stats.overallPct.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-surface-2 border border-theme rounded-full">
            <div
              className="h-full bg-income rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, stats.overallPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goal Creator Form */}
      {showForm && (
        <div className="bg-surface border border-theme rounded-xl p-5 slide-up">
          <h2 className="text-sm font-semibold text-theme mb-3">Setup a New Savings Goal</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Goal Name</label>
              <input
                type="text"
                placeholder="e.g. Vacation Fund"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme placeholder:text-muted outline-none focus:border-theme"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Target Amount</label>
              <input
                type="number"
                placeholder="1000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme placeholder:text-muted outline-none focus:border-theme"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme outline-none focus:border-theme"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme outline-none cursor-pointer"
              >
                {['Emergency', 'Travel', 'Education', 'Retirement', 'Home', 'Vehicle', 'Other'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-4 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
              >
                Create Target Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      {userGoals.length === 0 ? (
        <div className="bg-surface border border-theme rounded-xl py-16 text-center">
          <p className="text-3xl mb-2">🎯</p>
          <p className="text-sm font-semibold text-theme">No active goals found</p>
          <p className="text-xs text-muted mt-1">Start tracking your saving goals by clicking "Create Goal" above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userGoals.map((goal) => {
            const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const isContributing = activeGoalId === goal.id;
            const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={goal.id} className="bg-surface border border-theme rounded-xl p-5 flex flex-col justify-between space-y-4">
                {/* Header row */}
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-bold text-theme">{goal.name}</h3>
                      <span className="text-[9px] uppercase font-bold text-muted bg-surface-2 border border-theme px-1.5 py-0.5 rounded mt-1 inline-block">
                        {goal.category}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-muted hover:text-expense text-xs p-1"
                      title="Delete Goal"
                    >
                      🗑
                    </button>
                  </div>

                  {/* Progress detail */}
                  <div className="mt-4 flex justify-between items-baseline text-xs">
                    <span className="text-muted">Progress</span>
                    <span className="font-semibold text-theme mono">
                      {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full bg-surface-2 border border-theme rounded-full overflow-hidden">
                    <div
                      className="h-full bg-income rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-[10px] text-muted">
                    <span>Target: <strong className="text-theme mono">{goal.targetDate}</strong></span>
                    <span>
                      {daysLeft > 0 ? (
                        <strong className="text-theme">{daysLeft} Days left</strong>
                      ) : (
                        <strong className="text-expense">Goal Target Passed</strong>
                      )}
                    </span>
                  </div>
                </div>

                {/* Contribution Action form */}
                <div className="border-t border-theme pt-3.5">
                  {!isContributing ? (
                    <button
                      onClick={() => { setActiveGoalId(goal.id); setContribError(''); }}
                      className="w-full py-1.5 rounded-lg border border-theme text-xs font-semibold text-muted hover:text-theme bg-surface-2 hover:bg-surface-2 transition-all"
                    >
                      💰 Contribute Funds
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {contribError && <p className="text-[10px] text-expense font-semibold">{contribError}</p>}
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={contribAmt}
                          onChange={(e) => setContribAmt(e.target.value)}
                          className="w-24 px-2 py-1.5 rounded-lg border border-theme text-xs bg-surface-2 text-theme placeholder:text-muted outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Description (Optional)"
                          value={contribNote}
                          onChange={(e) => setContribNote(e.target.value)}
                          className="flex-1 px-2 py-1.5 rounded-lg border border-theme text-xs bg-surface-2 text-theme placeholder:text-muted outline-none"
                        />
                        <button
                          onClick={() => handleContribute(goal.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-income hover:opacity-90 transition-all shrink-0"
                        >
                          Send
                        </button>
                        <button
                          onClick={() => setActiveGoalId(null)}
                          className="px-2.5 py-1.5 rounded-lg border border-theme text-xs text-muted hover:text-theme bg-surface-2 transition-all shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contribution History list */}
                {goal.contributions.length > 0 && (
                  <div className="pt-3 border-t border-theme">
                    <p className="text-[9px] font-semibold tracking-wider text-muted uppercase mb-1.5">Contribution History</p>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto">
                      {goal.contributions.map((contrib) => (
                        <div key={contrib.id} className="flex justify-between items-center text-[10px] bg-surface-2 p-1.5 border border-theme rounded-md">
                          <div className="min-w-0">
                            <p className="text-theme font-medium truncate">{contrib.note}</p>
                            <p className="text-[8px] text-muted mono mt-0.5">{contrib.date}</p>
                          </div>
                          <span className="font-bold text-income mono shrink-0">+{formatCurrency(contrib.amount, currency)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
