import { type ReactNode } from "react";
import { ShieldAlert, LogIn, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../types/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: ReactNode;
  onOpenAuth?: () => void;
  onNavigateHome?: () => void;
}

export function ProtectedRoute({
  allowedRoles,
  children,
  onOpenAuth,
  onNavigateHome,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          <p className="mt-3 text-sm font-semibold text-slate-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user || !profile) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-brand">
          <LogIn size={24} />
        </span>
        <h3 className="mt-4 text-xl font-black text-ink">Sign in required</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          This area requires an active LocalConnect session. Please sign in or register to continue.
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white transition hover:bg-brandDark"
        >
          Sign In / Register <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // Role authorization check
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-red-100 bg-red-50/50 p-8 text-center shadow-card">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-red-600">
          <ShieldAlert size={24} />
        </span>
        <h3 className="mt-4 text-xl font-black text-red-950">Access restricted</h3>
        <p className="mt-2 text-sm leading-6 text-red-800/80">
          Your current account role is <span className="font-bold uppercase tracking-wider">{profile.role}</span>.
          This view is restricted to: <span className="font-bold">{allowedRoles.join(", ")}</span>.
        </p>
        <button
          onClick={onNavigateHome}
          className="mt-6 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-900 transition hover:bg-red-50"
        >
          Return to Explore
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

