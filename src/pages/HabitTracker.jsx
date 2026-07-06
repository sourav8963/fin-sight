import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PRESETS = [
  { name: 'Save Daily ($10)', frequency: 'daily' },
  { name: 'Log Daily Expenses', frequency: 'daily' },
  { name: 'Invest Monthly', frequency: 'monthly' },
  { name: 'No Dining Out Today', frequency: 'daily' },
  { name: 'No Impulse Buying', frequency: 'daily' },
  { name: 'Read Financial News', frequency: 'weekly' },
];

export default function HabitTracker() {
  const habits = useStore((s) => s.habits);
  const addHabit = useStore((s) => s.addHabit);
  const toggleHabitCompletion = useStore((s) => s.toggleHabitCompletion);
  const deleteHabit = useStore((s) => s.deleteHabit);
  const currentUser = useStore((s) => s.currentUser);
  const darkMode = useStore((s) => s.darkMode);

  // New habit form state
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState('daily');
  const [showForm, setShowForm] = useState(false);

  // Generate date strings for the past 7 days (oldest to newest)
  const past7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: d.toISOString().slice(0, 10),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.toLocaleDateString('en-US', { day: '2-digit' }),
      };
    });
  }, []);

  // Filter habits for the current user
  const userHabits = useMemo(() => {
    return habits.filter((h) => h.userId === (currentUser?.id || 'usr-1'));
  }, [habits, currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(newHabitName.trim(), newHabitFreq);
    setNewHabitName('');
    setShowForm(false);
  };

  const handleToggle = (habitId, dateStr) => {
    toggleHabitCompletion(habitId, dateStr);
  };

  // Calculations
  const stats = useMemo(() => {
    if (userHabits.length === 0) return { activeStreaks: 0, avgCompletionRate: 0, completedToday: 0 };
    
    const todayStr = new Date().toISOString().slice(0, 10);
    const completedTodayCount = userHabits.filter((h) => h.completionHistory.includes(todayStr)).length;
    
    const totalStreaks = userHabits.reduce((acc, h) => acc + h.streak, 0);
    
    // Average completion rate of last 7 days
    let totalPossibleCompletions = userHabits.length * 7;
    let actualCompletions = 0;
    
    userHabits.forEach((h) => {
      past7Days.forEach((d) => {
        if (h.completionHistory.includes(d.dateStr)) {
          actualCompletions++;
        }
      });
    });

    const completionRate = totalPossibleCompletions > 0 ? (actualCompletions / totalPossibleCompletions) * 100 : 0;

    return {
      activeStreaks: totalStreaks,
      avgCompletionRate: completionRate,
      completedToday: completedTodayCount,
    };
  }, [userHabits, past7Days]);

  // Chart data: completion counts by date over past 7 days
  const chartData = useMemo(() => {
    return past7Days.map((d) => {
      const count = userHabits.filter((h) => h.completionHistory.includes(d.dateStr)).length;
      return {
        name: d.dayName,
        completed: count,
      };
    });
  }, [userHabits, past7Days]);

  const gridColor = darkMode ? '#2e2e2a' : '#e8e6de';
  const textColor = darkMode ? '#8a8880' : '#7a7870';

  return (
    <div className="max-w-5xl mx-auto space-y-6 fade-in select-none">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted">Develop disciplined financial behaviours through consistent checking</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1"
          style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
        >
          {showForm ? 'Cancel' : '➕ Custom Habit'}
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-theme rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Completed Today</p>
            <p className="text-xl font-bold text-theme mt-1 mono">
              {stats.completedToday} <span className="text-xs font-normal text-muted">/ {userHabits.length} habits</span>
            </p>
          </div>
          <span className="text-2xl">🎯</span>
        </div>
        <div className="bg-surface border border-theme rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Total Streaks</p>
            <p className="text-xl font-bold text-income mt-1 mono">🔥 {stats.activeStreaks} Days</p>
          </div>
          <span className="text-2xl">⚡</span>
        </div>
        <div className="bg-surface border border-theme rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Week Completion Rate</p>
            <p className="text-xl font-bold text-theme mt-1 mono">{stats.avgCompletionRate.toFixed(0)}%</p>
          </div>
          <span className="text-2xl">📈</span>
        </div>
      </div>

      {/* Habit Creator Form */}
      {showForm && (
        <div className="bg-surface border border-theme rounded-xl p-5 slide-up">
          <h2 className="text-sm font-semibold text-theme mb-3">Create a Custom Habit</h2>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-64">
              <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Habit Name</label>
              <input
                type="text"
                placeholder="e.g. Save $5 daily, Limit coffee spending"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme placeholder:text-muted outline-none focus:border-theme"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Frequency</label>
              <select
                value={newHabitFreq}
                onChange={(e) => setNewHabitFreq(e.target.value)}
                className="px-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme outline-none cursor-pointer"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
              style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
            >
              Add Habit
            </button>
          </form>
        </div>
      )}

      {/* Main Habit Checklist & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habit List */}
        <div className="lg:col-span-2 bg-surface border border-theme rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-sm font-semibold text-theme">Habit Checklist</h2>
            <span className="text-[10px] text-muted font-medium uppercase tracking-wide">Last 7 Days</span>
          </div>

          {userHabits.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-2xl mb-2">💡</p>
              <p className="text-xs font-medium text-theme">No habits set up yet</p>
              <p className="text-[11px] text-muted mt-1">Select a preset on the right or build a custom habit above!</p>
            </div>
          ) : (
            <div className="divide-y divide-theme">
              {userHabits.map((habit) => (
                <div key={habit.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-theme truncate">{habit.name}</h3>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-surface-2 border border-theme text-muted">
                        {habit.frequency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted">Streak:</span>
                      <span className="text-[10px] font-bold text-income mono">🔥 {habit.streak} Days</span>
                      {habit.lastCompleted && (
                        <span className="text-[9px] text-muted">· Done: {habit.lastCompleted}</span>
                      )}
                    </div>
                  </div>

                  {/* Calendar Row */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    {past7Days.map((d) => {
                      const completed = habit.completionHistory.includes(d.dateStr);
                      const isToday = d.dateStr === new Date().toISOString().slice(0, 10);
                      return (
                        <button
                          key={d.dateStr}
                          onClick={() => handleToggle(habit.id, d.dateStr)}
                          className={`w-9 h-11 flex flex-col items-center justify-center rounded-lg border transition-all hover:scale-105 shrink-0
                            ${completed 
                              ? 'bg-income/10 border-income text-income font-bold' 
                              : isToday 
                              ? 'bg-surface-2 border-theme text-theme font-medium shadow-inner' 
                              : 'bg-transparent border-theme text-muted'}`}
                          title={`Toggle ${habit.name} on ${d.dateStr}`}
                        >
                          <span className="text-[8px] uppercase tracking-wider scale-90">{d.dayName}</span>
                          <span className="text-xs mt-0.5 font-bold mono">{d.dayNum}</span>
                        </button>
                      );
                    })}
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="w-7 h-11 flex items-center justify-center rounded-lg border border-theme bg-surface-2 hover:border-expense hover:text-expense transition-all shrink-0"
                      title="Delete Habit"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Quick Presets */}
          <div className="bg-surface border border-theme rounded-xl p-5">
            <h2 className="text-sm font-semibold text-theme mb-1">Habit Presets</h2>
            <p className="text-xs text-muted mb-4">Click to instantly add financial habits</p>
            <div className="space-y-2">
              {PRESETS.map((preset) => {
                const alreadyExists = userHabits.some((h) => h.name.toLowerCase() === preset.name.toLowerCase());
                return (
                  <button
                    key={preset.name}
                    disabled={alreadyExists}
                    onClick={() => addHabit(preset.name, preset.frequency)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border border-theme bg-surface-2 hover:border-theme transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left text-xs"
                  >
                    <div>
                      <p className="font-semibold text-theme">{preset.name}</p>
                      <p className="text-[9px] text-muted capitalize mt-0.5">{preset.frequency}</p>
                    </div>
                    <span className="text-muted">{alreadyExists ? 'Added' : '➕'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekly Habit performance chart */}
          {userHabits.length > 0 && (
            <div className="bg-surface border border-theme rounded-xl p-5">
              <h2 className="text-sm font-semibold text-theme mb-1">Check-in Trends</h2>
              <p className="text-xs text-muted mb-4">Completed habits over the last 7 days</p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: textColor }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: textColor }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} contentStyle={{ fontSize: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px' }} />
                  <Bar dataKey="completed" fill="var(--income)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
