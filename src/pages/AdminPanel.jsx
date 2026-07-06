import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../data/mockData';

export default function AdminPanel() {
  const users = useStore((s) => s.users);
  const feedback = useStore((s) => s.feedback);
  const toggleUserStatus = useStore((s) => s.toggleUserStatus);
  const changeUserRole = useStore((s) => s.changeUserRole);
  const resolveFeedback = useStore((s) => s.resolveFeedback);
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.currency);
  const darkMode = useStore((s) => s.darkMode);

  const [activeTab, setActiveTab] = useState('users');
  
  // Feedback replies state
  const [replies, setReplies] = useState({});

  // Calculations for KPIs
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 'Active').length;
    const pendingFeedback = feedback.filter((f) => f.status === 'pending').length;
    
    // Average savings rate set by users
    const avgSavingsRate = totalUsers > 0 
      ? users.reduce((acc, u) => acc + u.targetSavingsRate, 0) / totalUsers
      : 0;

    // Combined balances
    const income = transactions.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

    return {
      totalUsers,
      activeUsers,
      pendingFeedback,
      avgSavingsRate,
      netVolume: income - expenses,
    };
  }, [users, feedback, transactions]);

  // Chart data: Monthly transactions count or volume
  const activityData = useMemo(() => {
    // Group transactions by date for activity
    const days = {};
    transactions.slice(0, 15).forEach((t) => {
      days[t.date] = (days[t.date] || 0) + 1;
    });

    return Object.entries(days)
      .map(([date, count]) => ({ date: date.slice(5), count }))
      .reverse();
  }, [transactions]);

  const handleResolveFeedback = (id) => {
    const replyText = replies[id];
    if (!replyText || !replyText.trim()) return;

    resolveFeedback(id, replyText.trim());
    setReplies((prev) => ({ ...prev, [id]: '' }));
  };

  const gridColor = darkMode ? '#2e2e2a' : '#e8e6de';
  const textColor = darkMode ? '#8a8880' : '#7a7870';

  return (
    <div className="max-w-5xl mx-auto space-y-6 fade-in select-none">
      {/* KPI Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-theme rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Registered Users</p>
          <p className="text-xl font-bold text-theme mt-1 mono">
            {stats.totalUsers} <span className="text-[10px] text-muted font-normal">({stats.activeUsers} active)</span>
          </p>
        </div>
        <div className="bg-surface border border-theme rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Avg Target Savings</p>
          <p className="text-xl font-bold text-income mt-1 mono">{stats.avgSavingsRate.toFixed(1)}%</p>
        </div>
        <div className="bg-surface border border-theme rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Feedback Tickets</p>
          <p className="text-xl font-bold text-theme mt-1 mono">
            {feedback.length} <span className="text-[10px] text-muted font-normal">({stats.pendingFeedback} pending)</span>
          </p>
        </div>
        <div className="bg-surface border border-theme rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Net Ledger Volume</p>
          <p className="text-xl font-bold text-theme mt-1 mono">{formatCurrency(stats.netVolume, currency)}</p>
        </div>
      </div>

      {/* Tabs selector */}
      <div className="flex border-b border-theme gap-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2
            ${activeTab === 'users' ? 'border-accent text-theme font-bold' : 'border-transparent text-muted hover:text-theme'}`}
        >
          👤 User Accounts & Usage
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2
            ${activeTab === 'feedback' ? 'border-accent text-theme font-bold' : 'border-transparent text-muted hover:text-theme'}`}
        >
          📨 Helpdesk Inbox ({stats.pendingFeedback})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List Table */}
          <div className="lg:col-span-2 bg-surface border border-theme rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-theme uppercase tracking-wider mb-2">Registered Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-theme text-muted text-[10px] font-semibold uppercase tracking-wider">
                    <th className="py-2 pb-3">User</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Savings Rate</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-2/45 transition-colors">
                      <td className="py-3 flex items-center gap-2 min-w-0">
                        <img src={u.avatar} alt="" className="w-6 h-6 rounded-full border border-theme bg-surface-2 shrink-0 object-cover" />
                        <div className="min-w-0">
                          <p className="font-semibold text-theme truncate">{u.name}</p>
                          <p className="text-[10px] text-muted truncate">{u.email}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                          ${u.status === 'Active' ? 'bg-income text-income' : 'bg-expense text-expense'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => changeUserRole(u.id, e.target.value)}
                          className="bg-transparent text-[11px] outline-none cursor-pointer text-theme py-0.5 border border-theme rounded px-1 font-medium capitalize"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="mono font-semibold text-theme">{u.targetSavingsRate}%</td>
                      <td className="text-right">
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`px-2 py-1 text-[10px] font-semibold rounded border transition-all
                            ${u.status === 'Active'
                              ? 'border-expense text-expense hover:bg-expense/10'
                              : 'border-income text-income hover:bg-income/10'}`}
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Statistics bar */}
          <div className="bg-surface border border-theme rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-theme uppercase tracking-wider mb-0.5">Platform Activity</h3>
              <p className="text-[11px] text-muted">Daily transaction counts registered</p>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={activityData} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: textColor }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: textColor }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} contentStyle={{ fontSize: '10px' }} />
                <Bar dataKey="count" fill="var(--theme)" radius={[3, 3, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Feedback inbox Tab */
        <div className="bg-surface border border-theme rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-theme uppercase tracking-wider mb-2">Support Tickets</h3>

          {feedback.length === 0 ? (
            <p className="text-xs text-muted text-center py-6">No support tickets found.</p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {feedback.map((ticket) => (
                <div key={ticket.id} className="p-4 border border-theme rounded-xl bg-surface-2 text-xs flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-theme">
                        {ticket.userName} <span className="text-[10px] text-muted font-normal">({ticket.date})</span>
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mt-1.5 inline-block
                        ${ticket.type === 'bug' ? 'bg-expense text-expense' : ticket.type === 'complaint' ? 'bg-expense text-expense' : 'bg-income text-income'}`}>
                        {ticket.type}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                      ${ticket.status === 'resolved' ? 'bg-income text-income' : 'bg-highlight/15 text-highlight'}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <p className="text-theme mt-1 leading-relaxed bg-surface border border-theme p-2.5 rounded-lg font-medium">{ticket.message}</p>

                  {/* Resolution Input / Reply text */}
                  <div className="mt-2 pt-2 border-t border-theme">
                    {ticket.status === 'pending' ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Write reply and resolve ticket..."
                          value={replies[ticket.id] || ''}
                          onChange={(e) => setReplies((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-theme text-xs bg-surface text-theme placeholder:text-muted outline-none"
                        />
                        <button
                          onClick={() => handleResolveFeedback(ticket.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-income hover:opacity-85 transition-opacity"
                        >
                          Resolve & Reply
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-theme">
                        <span className="font-bold text-[10px] text-muted uppercase tracking-wider block">Admin Reply:</span>
                        <p className="italic text-muted mt-0.5 pl-2 border-l-2 border-theme">{ticket.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
