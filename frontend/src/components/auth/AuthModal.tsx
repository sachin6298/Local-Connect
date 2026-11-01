import { useState, useEffect, useRef, memo } from "react";
import {
  X, Mail, Lock, User, Phone, Handshake, Backpack,
  ShieldAlert, Sparkles, CheckCircle2, Loader2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import type { AuthModalMode, UserRole } from "../../types/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthModalMode;
  initialRole?: "tourist" | "lender";
}

export const AuthModal = memo(function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  initialRole = "tourist",
}: AuthModalProps) {
  const { signIn, signUp, resetPassword, loginAsDemoUser, error, clearError } = useAuth();

  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [role, setRole] = useState<"tourist" | "lender">(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const emailInputRef = useRef<HTMLInputElement>(null);

  // Sync mode & role whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialRole);
      clearError();
      setSuccessMessage("");
      // Immediate autofocus on email for seamless UX
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialMode, initialRole, clearError]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    clearError();
    setSuccessMessage("");
    setBusy(true);

    try {
      if (mode === "login") {
        const res = await signIn(email, password);
        if (res.success) {
          onClose();
        }
      } else if (mode === "register") {
        const res = await signUp(email, password, role, fullName, phone);
        if (res.success) {
          setSuccessMessage(res.message);
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else if (mode === "forgot_password") {
        const res = await resetPassword(email);
        if (res.success) {
          setSuccessMessage(res.message);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  function handleDemoSelect(targetRole: UserRole) {
    if (busy) return;
    loginAsDemoUser(targetRole);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Authentication modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white shadow-sm">
              <Handshake size={18} />
            </span>
            <span className="font-extrabold tracking-tight text-ink">
              Local<span className="text-brand-600">Connect</span>
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200/60 hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              clearError();
              setSuccessMessage("");
            }}
            className={`border-b-2 py-3 px-3 transition ${
              mode === "login"
                ? "border-brand-600 text-brand-600 font-black"
                : "border-transparent text-slate-500 hover:text-ink"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              clearError();
              setSuccessMessage("");
            }}
            className={`border-b-2 py-3 px-3 transition ${
              mode === "register"
                ? "border-brand-600 text-brand-600 font-black"
                : "border-transparent text-slate-500 hover:text-ink"
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("forgot_password");
              clearError();
              setSuccessMessage("");
            }}
            className={`border-b-2 py-3 px-3 transition ${
              mode === "forgot_password"
                ? "border-brand-600 text-brand-600 font-black"
                : "border-transparent text-slate-500 hover:text-ink"
            }`}
          >
            Recovery
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-800 border border-red-100 animate-shake">
              <ShieldAlert size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-teal-50 p-3 text-xs font-semibold text-teal-800 border border-teal-100">
              <CheckCircle2 size={16} className="shrink-0 text-teal-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode: Register -> Choose Role */}
            {mode === "register" && (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select your role on LocalConnect
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("tourist")}
                    className={`rounded-2xl border p-3.5 text-left transition ${
                      role === "tourist"
                        ? "border-brand-500 bg-brand-50/60 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="mb-2 inline-flex rounded-lg bg-brand-100 p-2 text-brand-600">
                      <Backpack size={18} />
                    </span>
                    <span className="block font-black text-ink text-xs">Tourist / Renter</span>
                    <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">
                      I want to rent commodities for my journey.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("lender")}
                    className={`rounded-2xl border p-3.5 text-left transition ${
                      role === "lender"
                        ? "border-teal-500 bg-teal-50/60 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="mb-2 inline-flex rounded-lg bg-teal-100 p-2 text-teal-700">
                      <Handshake size={18} />
                    </span>
                    <span className="block font-black text-ink text-xs">Local Lender</span>
                    <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">
                      I have useful items to lend & earn locally.
                    </span>
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-slate-400">
                  Platform Admin accounts cannot be self-registered and require operator provisioning.
                </p>
              </div>
            )}

            {/* Registration specific fields */}
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Full Name</label>
                  <div className="relative mt-1">
                    <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      disabled={busy}
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-xs font-medium outline-none transition focus:border-brand-500 disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Mobile Phone (optional)
                  </label>
                  <div className="relative mt-1">
                    <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="tel"
                      disabled={busy}
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-xs font-medium outline-none transition focus:border-brand-500 disabled:bg-slate-50"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Common fields: Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  ref={emailInputRef}
                  type="email"
                  required
                  disabled={busy}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-xs font-medium outline-none transition focus:border-brand-500 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Password (for login and register) */}
            {mode !== "forgot_password" && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot_password")}
                      className="text-xs font-semibold text-brand-600 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative mt-1">
                  <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    disabled={busy}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-xs font-medium outline-none transition focus:border-brand-500 disabled:bg-slate-50"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/25 transition hover:bg-brand-700 disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === "login" ? (
                "Sign In"
              ) : mode === "register" ? (
                "Create Account"
              ) : (
                "Send Reset Email"
              )}
            </button>
          </form>

          {/* Quick Demo Login (for developer inspection & testing) */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              One-Click Test Logins (Development Mode)
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => handleDemoSelect("tourist")}
                className="rounded-xl border border-brand-200 bg-brand-50/50 p-2 text-center text-xs font-bold text-brand-700 hover:bg-brand-100 transition"
              >
                <Sparkles size={13} className="mx-auto mb-1 text-brand-600" />
                Tourist
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleDemoSelect("lender")}
                className="rounded-xl border border-teal-200 bg-teal-50/50 p-2 text-center text-xs font-bold text-teal-700 hover:bg-teal-100 transition"
              >
                <Handshake size={13} className="mx-auto mb-1 text-teal-600" />
                Lender
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleDemoSelect("admin")}
                className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-center text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
              >
                <ShieldAlert size={13} className="mx-auto mb-1 text-amber-700" />
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
