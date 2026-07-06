import { useState } from 'react';
import { useStore } from '../store/useStore';

export default function Profile() {
  const currentUser = useStore((s) => s.currentUser);
  const updateProfile = useStore((s) => s.updateProfile);
  const submitFeedback = useStore((s) => s.submitFeedback);
  const feedback = useStore((s) => s.feedback);

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [targetRate, setTargetRate] = useState(currentUser?.targetSavingsRate || 20);
  const [pass, setPass] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Feedback form state
  const [fbType, setFbType] = useState('suggestion');
  const [fbMessage, setFbMessage] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setProfileSuccess('');

    const updates = { name, email, targetSavingsRate: Number(targetRate) };
    if (pass.trim()) {
      updates.password = pass;
    }

    updateProfile(updates);
    setProfileSuccess('Profile updated successfully!');
    setPass('');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handleFeedback = (e) => {
    e.preventDefault();
    setFeedbackSuccess('');

    if (!fbMessage.trim()) return;

    submitFeedback(fbType, fbMessage);
    setFbMessage('');
    setFeedbackSuccess('Feedback submitted successfully! Admin will review it.');
    setTimeout(() => setFeedbackSuccess(''), 3000);
  };

  // Filter feedback logged by this specific user
  const userFeedback = feedback.filter((f) => f.userId === currentUser?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="md:col-span-1 bg-surface border border-theme rounded-2xl p-6 flex flex-col items-center text-center">
          <img
            src={currentUser?.avatar}
            alt=""
            className="w-20 h-20 rounded-full border-2 border-theme bg-surface-2 object-cover mb-4"
          />
          <h3 className="text-base font-bold text-theme">{currentUser?.name}</h3>
          <p className="text-xs text-muted mt-0.5">{currentUser?.email}</p>
          <span className="mt-3 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-theme bg-surface-2 text-muted">
            Role: {currentUser?.role}
          </span>
          <div className="w-full mt-6 pt-5 border-t border-theme text-left space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Account Status:</span>
              <span className="font-semibold text-income">{currentUser?.status || 'Active'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">Joined Date:</span>
              <span className="font-semibold text-theme mono">{currentUser?.joinedDate}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">Target Savings Rate:</span>
              <span className="font-semibold text-theme mono">{currentUser?.targetSavingsRate}%</span>
            </div>
          </div>
        </div>

        {/* Profile Edit details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-theme mb-1">Account settings</h2>
            <p className="text-xs text-muted mb-4">Adjust your personal credentials and target thresholds</p>

            {profileSuccess && (
              <div className="mb-4 p-3 bg-income/10 border border-income/30 text-income text-xs rounded-lg font-medium">
                ✓ {profileSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme outline-none focus:border-theme"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme outline-none focus:border-theme"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">New Password (Optional)</label>
                  <input
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme outline-none focus:border-theme"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Target Savings Rate (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="5"
                      max="75"
                      step="5"
                      value={targetRate}
                      onChange={(e) => setTargetRate(Number(e.target.value))}
                      className="flex-1 accent-current"
                      style={{ color: 'var(--text)' }}
                    />
                    <span className="text-xs font-bold mono bg-surface-2 border border-theme px-2 py-1 rounded w-10 text-center">{targetRate}%</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
              >
                Save Changes
              </button>
            </form>
          </div>

          {/* Feedback Form */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-theme mb-1">Feedback & Support Desk</h2>
            <p className="text-xs text-muted mb-4">Submit a feature request, bug report, or complaint to the administrator</p>

            {feedbackSuccess && (
              <div className="mb-4 p-3 bg-income/10 border border-income/30 text-income text-xs rounded-lg font-medium">
                ✓ {feedbackSuccess}
              </div>
            )}

            <form onSubmit={handleFeedback} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1.5">Feedback Type</label>
                <div className="flex gap-2">
                  {['suggestion', 'bug', 'complaint'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFbType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all
                        ${fbType === type ? 'text-theme bg-surface-2 border-theme font-bold' : 'text-muted border-theme bg-transparent'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Message Description</label>
                <textarea
                  rows="3"
                  value={fbMessage}
                  onChange={(e) => setFbMessage(e.target.value)}
                  placeholder="Tell us what went wrong, or describe a features suggestion..."
                  className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme placeholder:text-muted outline-none focus:border-theme resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
              >
                Submit Message
              </button>
            </form>
          </div>

          {/* Support Ticket History */}
          {userFeedback.length > 0 && (
            <div className="bg-surface border border-theme rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-theme mb-1">Your Support History</h2>
              <p className="text-xs text-muted mb-4">Track progress of your submitted queries</p>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {userFeedback.map((ticket) => (
                  <div key={ticket.id} className="p-3 border border-theme rounded-xl bg-surface-2 text-xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-semibold text-theme capitalize">
                        {ticket.type === 'bug' ? '🐛' : ticket.type === 'complaint' ? '⚠️' : '💡'} {ticket.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                        ${ticket.status === 'resolved' ? 'bg-income text-income' : 'bg-highlight/15 text-highlight'}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-theme font-medium">{ticket.message}</p>
                    <p className="text-[9px] text-muted mt-1 mono">{ticket.date}</p>
                    {ticket.reply && (
                      <div className="mt-2.5 pt-2.5 border-t border-theme text-theme font-normal text-xs pl-2 border-l-2 border-accent">
                        <span className="font-semibold block text-[10px] text-muted uppercase tracking-wide">Admin Reply:</span>
                        <p className="mt-0.5 italic">{ticket.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
