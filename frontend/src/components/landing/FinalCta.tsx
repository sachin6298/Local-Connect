import { ArrowRight, Sparkles, Handshake, ShieldCheck } from "lucide-react";

interface FinalCtaProps {
  onExplore: () => void;
  onOpenRegisterLender: () => void;
}

export function FinalCta({ onExplore, onOpenRegisterLender }: FinalCtaProps) {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28 bg-slate-900 text-white">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-600/30 via-indigo-600/30 to-teal/20 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 -z-10 h-[300px] w-[300px] rounded-full bg-brand-500/20 blur-3xl" />

      <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
        
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-300 backdrop-blur-md">
          <Sparkles size={13} />
          <span>Join The Local Sharing Movement</span>
        </div>

        <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl sm:leading-tight">
          Ready to Experience Lightweight,{" "}
          <span className="bg-gradient-to-r from-teal-300 via-indigo-300 to-white bg-clip-text text-transparent">
            Stress-Free Travel?
          </span>
        </h2>

        <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-slate-300">
          Leave the bulky suitcases behind. Rent clean clothing, sanctified utensils, and travel gear directly from welcoming local families in your destination.
        </p>

        {/* Dual CTA buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
          <button
            onClick={onExplore}
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-xs font-black text-slate-900 shadow-xl transition hover:bg-slate-100 hover:shadow-2xl"
          >
            <span>Explore Rentals Now</span>
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1 text-brand-600" />
          </button>

          <button
            onClick={onOpenRegisterLender}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-7 py-4 text-xs font-black text-white backdrop-blur-md transition hover:bg-white/20 hover:border-white/50"
          >
            <Handshake size={16} />
            <span>Become a Local Lender</span>
          </button>
        </div>

        {/* Security badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-teal-400" />
            <span>No upfront listing fees</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-teal-400" />
            <span>Escrow deposit protection</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-teal-400" />
            <span>100% verified public rendezvous</span>
          </span>
        </div>

      </div>
    </section>
  );
}

