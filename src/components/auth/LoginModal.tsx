import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';

export const LoginModal: React.FC = () => {
  const { loginModalOpen, setLoginModalOpen, login, completeFirstTimePasswordChange } = useAgency();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // First-time password change state
  const [mustResetStep, setMustResetStep] = useState(false);
  const [pendingFreelancerId, setPendingFreelancerId] = useState<string | null>(null);
  const [pendingFreelancerName, setPendingFreelancerName] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!loginModalOpen) return null;

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = await login({ emailOrUsername: identifier, password });

    if (res.mustChangePassword && res.freelancerId) {
      // Transition to forced password recreation flow
      setPendingFreelancerId(res.freelancerId);
      setPendingFreelancerName(res.freelancerName || 'Freelancer');
      setMustResetStep(true);
      return;
    }

    if (!res.success) {
      setErrorMsg(res.error || 'Invalid credentials. Please verify email/username and password.');
    } else {
      // Successfully logged in
      handleClose();
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (!pendingFreelancerId) return;

    const ok = await completeFirstTimePasswordChange(pendingFreelancerId, newPassword);
    if (ok) {
      setResetSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1200);
    } else {
      setErrorMsg('Failed to update password. Please try again.');
    }
  };

  const handleClose = () => {
    setIdentifier('');
    setPassword('');
    setErrorMsg('');
    setMustResetStep(false);
    setPendingFreelancerId(null);
    setPendingFreelancerName('');
    setNewPassword('');
    setConfirmPassword('');
    setResetSuccess(false);
    setLoginModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border border-parchment-300 rounded-2xl p-6 shadow-xl relative animate-in zoom-in-95">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-1.5 text-ink-400 hover:text-ink-900 rounded-lg hover:bg-parchment-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {!mustResetStep ? (
          /* Standard Professional Authentication Form */
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-clay-600 flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink-950">
                  Agency Sign In
                </h3>
                <p className="text-[11px] text-ink-500">
                  Enter your credentials to access the workspace
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-3 mb-2 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleInitialLogin} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Email or Assigned Username
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-xs p-2.5 border border-parchment-300 rounded-lg focus:border-clay-600 focus:outline-none bg-parchment-50/50"
                  placeholder="e.g. username or name@agency.com"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs p-2.5 border border-parchment-300 rounded-lg focus:border-clay-600 focus:outline-none bg-parchment-50/50"
                  placeholder="Enter your password or temporary code"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-clay-600 hover:bg-clay-700 text-white text-xs font-medium py-2.5 rounded-lg transition shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In to Agency Ops</span>
              </button>
            </form>

            <div className="mt-5 pt-3 border-t border-parchment-200 text-center">
              <span className="text-[11px] text-ink-400">
                Authorized Personnel Only • Role-Based Access Enforced
              </span>
            </div>
          </div>
        ) : (
          /* Mandatory First-Time Password Creation Step */
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink-950">
                  Set Permanent Password
                </h3>
                <p className="text-[11px] text-ink-500">
                  First login for <strong className="text-ink-800">{pendingFreelancerName}</strong>
                </p>
              </div>
            </div>

            <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              <p className="font-medium mb-1">Permanent Password Required</p>
              <p className="text-[11px] text-amber-800">
                You logged in with a temporary password. For security, please establish your private permanent password to access your workspace.
              </p>
            </div>

            {errorMsg && (
              <div className="mt-3 mb-2 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {resetSuccess ? (
              <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-xs font-semibold text-emerald-900">
                  Password Updated Successfully
                </div>
                <p className="text-[11px] text-emerald-700">
                  Redirecting to your workspace...
                </p>
              </div>
            ) : (
              <form onSubmit={handlePasswordResetSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">
                    New Permanent Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs p-2.5 border border-parchment-300 rounded-lg focus:border-clay-600 focus:outline-none bg-parchment-50/50"
                    placeholder="Minimum 6 characters"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs p-2.5 border border-parchment-300 rounded-lg focus:border-clay-600 focus:outline-none bg-parchment-50/50"
                    placeholder="Re-type your new password"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMustResetStep(false);
                      setPassword('');
                      setErrorMsg('');
                    }}
                    className="px-3 py-2 text-xs font-medium text-ink-600 hover:text-ink-950 border border-parchment-300 rounded-lg hover:bg-parchment-100 transition"
                  >
                    Back to Login
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-clay-600 hover:bg-clay-700 text-white text-xs font-medium py-2.5 rounded-lg transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Password & Open Workspace</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
