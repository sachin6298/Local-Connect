import { useState, useEffect } from "react";
import {
  Handshake, Menu, X, Sparkles, LogIn, LogOut,
  UserCircle, LayoutDashboard, ArrowRight
} from "lucide-react";
import { NotificationsBell } from "../ui/NotificationsBell";

interface NavbarProps {
  currentView: "explore" | "dashboard" | "profile";
  setCurrentView: (view: "explore" | "dashboard" | "profile") => void;
  profile: { fullName: string; role: string } | null;
  onOpenAuth: (mode?: "login" | "register" | "forgot_password", role?: "tourist" | "lender") => void;
  onSignOut: () => void;
  onOpenChat: () => void;
  onOpenIntro: () => void;
}

export function Navbar({
  currentView,
  setCurrentView,
  profile,
  onOpenAuth,
  onSignOut,
  onOpenChat,
  onOpenIntro,
}: NavbarProps) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setCurrentView("explore");
    setMobileMenu(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-white/60 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        {/* Brand Logo */}
        <button
          onClick={() => {
            setCurrentView("explore");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2.5 text-left group"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20 transition-transform group-hover:scale-105">
            <Handshake size={20} />
          </span>
          <div>
            <span className="text-xl font-black tracking-tight text-ink">
              Local<span className="bg-gradient-to-r from-brand-600 to-teal bg-clip-text text-transparent">Connect</span>
            </span>
            <span className="hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:block -mt-0.5">
              Peer-to-Peer Rentals
            </span>
          </div>
        </button>

        {/* Center navigation links */}
        <nav className="hidden items-center gap-1 lg:flex">
          {[
            { label: "Explore", id: "explore-items" },
            { label: "How It Works", id: "how-it-works" },
            { label: "Features", id: "features" },
            { label: "Categories", id: "categories" },
            { label: "Community", id: "testimonials" },
            { label: "FAQ", id: "faq" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-ink"
            >
              {item.label}
            </button>
          ))}

          {profile && (
            <>
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  currentView === "dashboard"
                    ? "bg-brand-50 text-brand-600"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-ink"
                }`}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView("profile")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  currentView === "profile"
                    ? "bg-brand-50 text-brand-600"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-ink"
                }`}
              >
                <UserCircle size={14} />
                Profile
              </button>
            </>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden items-center gap-2.5 lg:flex">
          {/* Classical Diorama Intro pill */}
          <button
            onClick={onOpenIntro}
            title="Open classical diorama experience"
            className="flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50/70 px-3 py-1.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
          >
            <span>🏛️</span>
            <span>Intro</span>
          </button>

          {/* AI Assistant Pill */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 rounded-full border border-brand-200/80 bg-brand-50/60 px-3.5 py-1.5 text-xs font-bold text-brand-600 transition hover:bg-brand-100/80 shadow-sm"
          >
            <Sparkles size={13} className="text-brand-500 animate-pulse" />
            <span>Ask AI</span>
          </button>

          {profile ? (
            <div className="flex items-center gap-3 pl-2">
              <NotificationsBell />
              <div className="text-right">
                <span className="block text-xs font-bold text-ink leading-tight">{profile.fullName}</span>
                <span className="inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-brand-700">
                  {profile.role}
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2">
              <button
                onClick={() => onOpenAuth("login")}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-ink"
              >
                <LogIn size={13} className="inline mr-1 text-slate-500" />
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth("register", "tourist")}
                className="group flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-600 hover:shadow-brand-500/25 hover:shadow-md"
              >
                <span>Get Started</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          {profile && <NotificationsBell />}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600"
          >
            <Sparkles size={12} /> AI
          </button>
          <button
            onClick={() => setMobileMenu((v) => !v)}
            className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenu && (
        <div className="border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl lg:hidden animate-fade-in-down">
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onOpenIntro}
              className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-left text-xs font-bold text-amber-900"
            >
              <span>🏛️</span> LocalConnect Classical Intro
            </button>

            {[
              { label: "Explore Items", id: "explore-items" },
              { label: "How It Works", id: "how-it-works" },
              { label: "Features", id: "features" },
              { label: "Categories", id: "categories" },
              { label: "Community", id: "testimonials" },
              { label: "FAQ", id: "faq" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="rounded-xl px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </button>
            ))}

            {profile ? (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="mb-2 px-4 py-1 text-xs font-semibold text-slate-500">
                  Signed in as <span className="font-bold text-ink">{profile.fullName}</span> ({profile.role})
                </div>
                <button
                  onClick={() => {
                    setCurrentView("dashboard");
                    setMobileMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-xs font-bold text-brand-600 hover:bg-brand-50"
                >
                  <LayoutDashboard size={14} /> My Dashboard
                </button>
                <button
                  onClick={() => {
                    setCurrentView("profile");
                    setMobileMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <UserCircle size={14} /> Account Profile
                </button>
                <button
                  onClick={() => {
                    onSignOut();
                    setMobileMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => {
                    onOpenAuth("login");
                    setMobileMenu(false);
                  }}
                  className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth("register", "tourist");
                    setMobileMenu(false);
                  }}
                  className="w-1/2 rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white shadow-sm"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

