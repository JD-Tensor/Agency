import React, { useState } from 'react';
import { 
  Lock, 
  KeyRound, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Building2, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';

export const LoginPage: React.FC = () => {
  const { login, completeFirstTimePasswordChange } = useAgency();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forced first-time password change state
  const [mustResetStep, setMustResetStep] = useState(false);
  const [pendingFreelancerId, setPendingFreelancerId] = useState<string | null>(null);
  const [pendingFreelancerName, setPendingFreelancerName] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = login({ 
        emailOrUsername: identifier.trim(), 
        password: password.trim() 
      });

      if (res.mustChangePassword && res.freelancerId) {
        setPendingFreelancerId(res.freelancerId);
        setPendingFreelancerName(res.freelancerName || 'Staff Member');
        setMustResetStep(true);
        setIsLoading(false);
        return;
      }

      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials. Please verify your username/email and password.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error encountered.');
      setIsLoading(false);
    }
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
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

    const ok = completeFirstTimePasswordChange(pendingFreelancerId, newPassword);
    if (ok) {
      // Re-attempt login with new password
      login({ emailOrUsername: identifier.trim(), password: newPassword });
    } else {
      setErrorMsg('Failed to update password. Please try again.');
    }
  };


  return (
    <div className="min-h-screen w-full bg-[#fbf9f5] flex flex-col justify-between selection:bg-clay-100 selection:text-clay-900 font-sans">
      {/* Top Header */}
      <header className="px-6 py-5 border-b border-parchment-200/80 bg-white/70 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-ink-950 flex items-center justify-center text-parchment-100 font-serif font-bold text-lg shadow-sm">
            J&D
          </div>
          <div>
            <div className="font-serif text-sm font-bold text-ink-950 tracking-tight">
              Jana & Das Engineering Partners
            </div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-ink-500">
              Partnership Firm • Enterprise Systems & Product Engineering
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-ink-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-clay-600" />
          <span>Restricted Access Portal</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white border border-parchment-200/90 rounded-2xl shadow-xl p-8 transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-clay-600 via-amber-600 to-clay-700" />

            {!mustResetStep ? (
              <div>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-parchment-100 border border-parchment-200 flex items-center justify-center text-clay-700 mx-auto mb-3 shadow-xs">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-ink-950 tracking-tight">
                    Partner & Team Sign In
                  </h2>
                  <p className="text-xs text-ink-500 mt-1">
                    Enter authorized credentials to access firm ledgers and workspace
                  </p>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{errorMsg}</span>
                  </div>
                )}

                {/* Sign In Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1.5 uppercase tracking-wide">
                      Email or Username
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. subhadip866 or subhadipjana866@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-parchment-50/60 border border-parchment-300 rounded-xl text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-clay-600 focus:bg-white focus:ring-2 focus:ring-clay-600/10 transition"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wide">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-ink-500 hover:text-ink-900 flex items-center gap-1 transition"
                      >
                        {showPassword ? (
                          <>
                            <EyeOff className="w-3 h-3" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" /> Show
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your security password"
                        className="w-full px-3.5 py-2.5 bg-parchment-50/60 border border-parchment-300 rounded-xl text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-clay-600 focus:bg-white focus:ring-2 focus:ring-clay-600/10 transition pr-10"
                        required
                      />
                      <KeyRound className="w-4 h-4 text-ink-400 absolute right-3.5 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-clay-600 hover:bg-clay-700 active:scale-[0.99] text-white text-xs font-semibold py-3 rounded-xl transition shadow-sm hover:shadow flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Authenticating...
                      </span>
                    ) : (
                      <>
                        <span>Authenticate & Access Firm</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

              </div>
            ) : (
              /* Mandatory Reset Flow */
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 mx-auto mb-3 shadow-xs">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-ink-950 tracking-tight">
                    Set Permanent Password
                  </h2>
                  <p className="text-xs text-ink-500 mt-1">
                    First login setup for <strong className="text-ink-900">{pendingFreelancerName}</strong>
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1.5 uppercase tracking-wide">
                      New Permanent Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2.5 bg-parchment-50/60 border border-parchment-300 rounded-xl text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-clay-600 focus:bg-white"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1.5 uppercase tracking-wide">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full px-3.5 py-2.5 bg-parchment-50/60 border border-parchment-300 rounded-xl text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-clay-600 focus:bg-white"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMustResetStep(false);
                        setPassword('');
                        setErrorMsg('');
                      }}
                      className="px-4 py-2.5 text-xs font-medium text-ink-600 hover:text-ink-950 border border-parchment-300 rounded-xl hover:bg-parchment-100 transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-clay-600 hover:bg-clay-700 text-white text-xs font-semibold py-2.5 rounded-xl transition shadow-xs"
                    >
                      Save Password & Sign In
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-ink-400 font-mono">
              <Building2 className="w-3.5 h-3.5" />
              <span>Jana & Das Engineering Partners • Level-Based RBAC</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="px-6 py-4 border-t border-parchment-200/80 bg-white/50 text-center text-xs text-ink-400">
        Strict Confidentiality & Authorization Enforced • Partnership Governance System
      </footer>
    </div>
  );
};
