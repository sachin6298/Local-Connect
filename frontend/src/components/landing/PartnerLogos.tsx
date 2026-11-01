import { Shield, Award, Users, Compass, Landmark, Sparkles } from "lucide-react";

export function PartnerLogos() {
  const partners = [
    { name: "Pilgrimage Heritage Trust", icon: Landmark, tag: "Accredited" },
    { name: "Gaya Tourism Federation", icon: Compass, tag: "Partner Network" },
    { name: "Zero-Waste Travel Forum", icon: Award, tag: "Eco Certified" },
    { name: "Local Homestay Collective", icon: Users, tag: "300+ Hosts" },
    { name: "Verified Safe Handover", icon: Shield, tag: "100% Insured" },
  ];

  return (
    <section className="border-y border-slate-100 bg-slate-50/50 py-10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
          Recognized & Supported By Regional Tourism & Community Collectives
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 md:gap-12 opacity-80">
          {partners.map((partner) => {
            const Icon = partner.icon;
            return (
              <div
                key={partner.name}
                className="flex items-center gap-2.5 rounded-2xl border border-slate-200/60 bg-white/70 px-4 py-2.5 shadow-sm transition hover:border-slate-300 hover:shadow-md hover:opacity-100"
              >
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon size={15} />
                </span>
                <div className="text-left">
                  <span className="block text-xs font-bold text-ink">
                    {partner.name}
                  </span>
                  <span className="block text-[9px] font-semibold text-brand-600">
                    {partner.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

