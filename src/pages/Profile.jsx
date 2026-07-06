import { useState } from 'react';
import { useStore } from '../store/useStore';

export default function Profile() {
  const currentUser = useStore((s) => s.currentUser);
  const updateProfile = useStore((s) => s.updateProfile);
  const changePassword = useStore((s) => s.changePassword);
  const deleteAccount = useStore((s) => s.deleteAccount);
  const submitFeedback = useStore((s) => s.submitFeedback);
  const feedback = useStore((s) => s.feedback);

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [targetRate, setTargetRate] = useState(currentUser?.targetSavingsRate || 20);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password reset state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  // Danger zone deletion state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Notification Preferences mockup state
  const [emailBudget, setEmailBudget] = useState(true);
  const [pushHabit, setPushHabit] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Feedback form state
  const [fbType, setFbType] = useState('suggestion');
  const [fbMessage, setFbMessage] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    const res = await updateProfile({ name, email, targetSavingsRate: Number(targetRate) });
    if (res.success) {
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } else {
      setProfileError(res.error || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    if (!currentPassword || !newPassword) {
      setPassError('Please fill in both fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }

    const res = await changePassword(currentPassword, newPassword);
    if (res.success) {
      setPassSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPassSuccess(''), 3000);
    } else {
      setPassError(res.error || 'Password update failed.');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    const res = await deleteAccount();
    if (!res.success) {
      setDeleteError(res.error || 'Failed to delete account.');
    }
  };

  const handleFeedback = (e) => {
    e.preventDefault();
    setFeedbackSuccess('');

    if (!fbMessage.trim()) return;

    submitFeedback(fbType, fbMessage);
    setFbMessage('');
    setFeedbackSuccess('Feedback ticket submitted! The administrator will review it.');
    setTimeout(() => setFeedbackSuccess(''), 3000);
  };

  // Filter feedback logged by this specific user
  const userFeedback = feedback.filter(
    (f) => f.userId === currentUser?.id || f.userId === currentUser?._id
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="md:col-span-1 bg-surface border border-theme rounded-2xl p-6 flex flex-col items-center text-center">
          <img
            src={currentUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser?.name || '')}`}
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
              <span className="text-muted">Total Balance XP:</span>
              <span className="font-semibold text-income mono">{currentUser?.xp || 0} XP</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">Target Savings Rate:</span>
              <span className="font-semibold text-theme mono">{currentUser?.targetSavingsRate}%</span>
            </div>
          </div>
        </div>

        {/* Profile Edit details */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Settings */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-theme mb-1">Account Settings</h2>
            <p className="text-xs text-muted mb-4">Adjust your personal details and target savings threshold</p>

            {profileSuccess && (
              <div className="mb-4 p-3 bg-income/10 border border-income/30 text-income text-xs rounded-lg font-medium">
                ✓ {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="mb-4 p-3 bg-expense/10 border border-expense/30 text-expense text-xs rounded-lg font-medium">
                ⚠️ {profileError}
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

              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
              >
                Save Details
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-theme mb-1">Security & Password</h2>
            <p className="text-xs text-muted mb-4">Modify your password to keep your dashboard secure</p>

            {passSuccess && (
              <div className="mb-4 p-3 bg-income/10 border border-income/30 text-income text-xs rounded-lg font-medium">
                ✓ {passSuccess}
              </div>
            )}
            {passError && (
              <div className="mb-4 p-3 bg-expense/10 border border-expense/30 text-expense text-xs rounded-lg font-medium">
                ⚠️ {passError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme outline-none focus:border-theme"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme outline-none focus:border-theme"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
              >
                Change Password
              </button>
            </form>
          </div>

          {/* Preferences */}
          <div className="bg-surface border border-theme rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-theme mb-1">Preferences & Notifications</h2>
            <p className="text-xs text-muted mb-4">Choose how you wish to receive notifications and system reminders</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-xs text-theme cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={emailBudget}
                  onChange={(e) => setEmailBudget(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border border-theme text-theme accent-current"
                  style={{ color: 'var(--text)' }}
                />
                <span>Email alerts when expense transactions exceed monthly category budgets</span>
              </label>
              <label className="flex items-center gap-3 text-xs text-theme cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pushHabit}
                  onChange={(e) => setPushHabit(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border border-theme text-theme accent-current"
                  style={{ color: 'var(--text)' }}
                />
                <span>Habit check-in calendar streaks daily reminders</span>
              </label>
              <label className="flex items-center gap-3 text-xs text-theme cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border border-theme text-theme accent-current"
                  style={{ color: 'var(--text)' }}
                />
                <span>Send weekly performance reports and wealth summary logs</span>
              </label>
            </div>
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
                  <div key={ticket._id || ticket.id} className="p-3 border border-theme rounded-xl bg-surface-2 text-xs">
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

          {/* Account Deletion (Danger Zone) */}
          <div className="bg-surface border border-expense/30 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-expense mb-1">Danger Zone</h2>
            <p className="text-xs text-muted mb-4">Deleting your account is permanent. All your transactions, habits, savings goals, and investment registries will be deleted forever.</p>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-expense/10 border border-expense/30 text-expense text-xs rounded-lg font-medium">
                ⚠️ {deleteError}
              </div>
            )}
            
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 bg-expense text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all"
              >
                Delete Account
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-expense font-bold w-full mb-1">Are you absolutely sure? This cannot be undone.</span>
                <button
                  onClick={handleDeleteAccount}
                  className="px-3 py-1.5 bg-expense text-white text-xs font-semibold rounded-lg hover:opacity-90"
                >
                  Yes, Delete Forever
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 border border-theme text-xs font-semibold rounded-lg text-theme hover:bg-surface-2"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
