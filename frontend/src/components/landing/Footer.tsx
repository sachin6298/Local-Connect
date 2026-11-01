import { Handshake, Heart, Shield, ArrowUp } from "lucide-react";

interface FooterProps {
  onOpenAuth: (mode?: "login" | "register", role?: "tourist" | "lender") => void;
  onOpenIntro: () => void;
  onOpenChat: () => void;
  onSelectCategory: (cat: string) => void;
}

export function Footer({
  onOpenAuth,
  onOpenIntro,
  onOpenChat,
  onSelectCategory,
}: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-12 text-slate-600">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        
        {/* Main 4-column footer */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-sm">
                <Handshake size={18} />
              </span>
              <span className="text-xl font-black tracking-tight text-ink">
                Local<span className="bg-gradient-to-r from-brand-600 to-teal bg-clip-text text-transparent">Connect</span>
              </span>
            </div>

            <p className="max-w-sm text-xs leading-relaxed text-slate-500">
              Tourism made easy. A trusted hyperlocal rental marketplace connecting pilgrims and travelers with neighborhood host families to borrow travel essentials sustainably.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </span>
              <button
                onClick={onOpenIntro}
                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
              >
                🏛️ Classical Diorama Intro
              </button>
            </div>
          </div>

          {/* Column 1: Explore Items */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-ink mb-3.5">
              Explore Rentals
            </h4>
            <ul className="space-y-2.5 text-xs">
              {[
                "Clothing",
                "Puja materials",
                "Backpacks",
                "Utensils",
                "Household",
                "Daily-use",
              ].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      scrollToId("explore-items");
                    }}
                    className="transition hover:text-brand-600 hover:underline"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: For Local Lenders */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-ink mb-3.5">
              For Local Hosts
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onOpenAuth("register", "lender")}
                  className="font-bold text-teal transition hover:underline"
                >
                  Become a Local Lender
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToId("how-it-works")}
                  className="transition hover:text-brand-600"
                >
                  How Lending Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToId("pricing")}
                  className="transition hover:text-brand-600"
                >
                  Lender Fee Policies
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToId("faq")}
                  className="transition hover:text-brand-600"
                >
                  Handover Safety Rules
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuth("login")}
                  className="transition hover:text-brand-600"
                >
                  Host Portal Sign In
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Platform */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-ink mb-3.5">
              Trust & Security
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="text-slate-500">Razorpay Verified Escrow</span>
              </li>
              <li>
                <span className="text-slate-500">Government ID Vetting</span>
              </li>
              <li>
                <span className="text-slate-500">Photo-Stamped Logs</span>
              </li>
              <li>
                <button
                  onClick={onOpenChat}
                  className="text-brand-600 font-bold transition hover:underline"
                >
                  Ask AI Travel Concierge
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 text-xs sm:flex-row text-slate-400">
          <p>© 2026 LocalConnect. All rights reserved. Peer-to-peer tourism platform.</p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[11px]">
              Built with <Heart size={12} className="fill-red-400 text-red-400 inline" /> for thoughtful travelers
            </span>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-ink"
              aria-label="Scroll back to top"
            >
              <span>Top</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}

