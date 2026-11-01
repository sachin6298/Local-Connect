import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

export function FaqSection({ onOpenChat }: { onOpenChat: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does item handover work? Do I need to visit someone's private home?",
      a: "No, never! In strict accordance with LocalConnect safety policies, private home addresses are never disclosed. All handovers and returns take place at designated public rendezvous spots—such as the Gaya Junction Railway Station entry, Vishnupad Temple North Gate, or verified hotel lobbies.",
    },
    {
      q: "What happens if an item is damaged or lost during my trip?",
      a: "Every handover includes an instant 10-second photo inspection log in the app. If accidental damage occurs, our platform operator team reviews the before-and-after photos. Fair replacement costs are deducted from the pre-authorized security deposit. Lenders cannot demand arbitrary cash penalties.",
    },
    {
      q: "Are traditional clothes and ritual utensils properly sanitized?",
      a: "Yes! All verified lenders commit to strict hygiene standards. Traditional cotton dhotis and kurtas must be freshly laundered, and brass or stainless steel utensils are sanitized and polished before every handover.",
    },
    {
      q: "How and when do local lenders receive their earnings?",
      a: "Payments are processed securely via Razorpay. Once the renter returns the item in verified condition and both parties confirm the drop-off, the lender's earnings are disbursed directly to their registered UPI or bank account within 24 hours.",
    },
    {
      q: "Can I cancel my rental request if my travel plans change?",
      a: "Yes. You can cancel your rental free of charge up to 4 hours before the scheduled handover time for a full 100% refund. If the lender cancels unexpectedly, you receive an immediate refund plus alternative item recommendations.",
    },
    {
      q: "How does the AI Assistant know what items I need?",
      a: "Our AI Assistant is trained on regional rituals and travel logistics (such as Gaya Ji Pind-daan, local weather conditions, and duration needs). When you tell it your itinerary, it cross-checks real-time active inventory from approved local lenders to suggest the right kit.",
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-28 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">FREQUENTLY ASKED QUESTIONS</span>
          <h2 className="section-title mt-2">
            Everything You Need To Know
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-500">
            Have questions about safety, handovers, payments, or item quality? Find immediate answers below.
          </p>
        </div>

        {/* Accordions */}
        <div className="mt-14 space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? "border-brand-300 bg-brand-50/20 shadow-sm"
                    : "border-slate-200/80 bg-white hover:border-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left text-xs sm:text-sm font-extrabold text-ink gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs ${isOpen ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      ?
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-brand-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs leading-relaxed text-slate-600 border-t border-slate-100/60 animate-fade-in">
                    <div className="pl-9">
                      {faq.a}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* AI Callout prompt at bottom of FAQ */}
        <div className="mt-10 rounded-2xl border border-brand-100 bg-brand-50/60 p-5 text-center">
          <p className="text-xs font-semibold text-slate-700">
            Have a unique question or need specific items for an upcoming ritual?
          </p>
          <button
            onClick={onOpenChat}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            <Sparkles size={14} />
            <span>Chat With LocalConnect AI Concierge</span>
          </button>
        </div>

      </div>
    </section>
  );
}

