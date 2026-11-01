import { useState } from "react";
import { Check, ArrowRight, Edit2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface PricingPlansProps {
  onOpenAuth: (mode?: "login" | "register", role?: "tourist" | "lender") => void;
}

export function PricingPlans({ onOpenAuth }: PricingPlansProps) {
  const { profile } = useAuth();
  const [seasonalPrice, setSeasonalPrice] = useState(199);
  const [editingSeasonPrice, setEditingSeasonPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState("199");
  const [priceError, setPriceError] = useState("");
  const [priceSuccess, setPriceSuccess] = useState("");

  const handleSaveSeasonPrice = () => {
    setPriceError("");
    setPriceSuccess("");
    const val = parseFloat(tempPrice);
    if (isNaN(val) || tempPrice.trim() === "") {
      setPriceError("Please enter a valid numeric fee.");
      return;
    }
    if (val < 0) {
      setPriceError("Fee cannot be negative.");
      return;
    }
    if (val > 10000) {
      setPriceError("Fee cannot exceed ₹10,000.");
      return;
    }
    setSeasonalPrice(val);
    setEditingSeasonPrice(false);
    setPriceSuccess(`Plan fee updated to ₹${val}`);
    setTimeout(() => setPriceSuccess(""), 3000);
  };

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-slate-50/70 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">TRANSPARENT & FAIR</span>
          <h2 className="section-title mt-2">
            Simple Pricing. Zero Surprise Fees.
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-500">
            No subscription barriers. Tourists pay only when they rent; local families keep up to 95% of their item earnings.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-14 grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
          
          {/* Card 1: For Tourists */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition hover:shadow-card-hover">
            <div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                For Travelers
              </span>
              <h3 className="mt-4 text-xl font-black text-ink">Pay As You Rent</h3>
              <p className="mt-2 text-xs text-slate-500">
                Browse and book verified commodities directly with zero sign-up cost.
              </p>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-black text-ink">₹0</span>
                <span className="ml-1 text-xs text-slate-400 font-semibold">membership fee</span>
              </div>

              <ul className="mt-6 space-y-3.5 border-t border-slate-100 pt-6">
                {[
                  "Pay only daily item rental (from ₹40/day)",
                  "Transparent 10% platform fee on booking",
                  "100% refundable escrow security hold",
                  "Free AI ritual & gear recommendation",
                  "Free cancellation up to 4 hrs before handover",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-600">
                    <Check size={14} className="text-teal shrink-0 stroke-[3]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onOpenAuth("register", "tourist")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
            >
              <span>Start Renting</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2: Local Lender (Most Popular) */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-brand-500 bg-gradient-to-b from-brand-50/40 via-white to-white p-8 shadow-xl">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-md">
              Most Popular
            </div>

            <div>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-700">
                Local Host Family
              </span>
              <h3 className="mt-4 text-xl font-black text-ink">Community Lender</h3>
              <p className="mt-2 text-xs text-slate-500">
                Turn unused ritual items, utensils & backpacks into continuous extra earnings.
              </p>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-black text-ink">Free</span>
                <span className="ml-1 text-xs text-slate-400 font-semibold">to list items</span>
              </div>

              <ul className="mt-6 space-y-3.5 border-t border-slate-100 pt-6">
                {[
                  "List up to 8 items in local inventory",
                  "You set your own daily rates & units",
                  "Direct UPI settlement on return",
                  "Platform Damage & Dispute Shield",
                  "Public rendezvous point privacy protection",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-ink font-medium">
                    <Check size={14} className="text-brand-600 shrink-0 stroke-[3]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onOpenAuth("register", "lender")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/25 transition hover:brightness-110"
            >
              <span>Register as Local Lender</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 3: Superhost Lender */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition hover:shadow-card-hover">
            <div>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-purple-700">
                High Volume
              </span>
              <h3 className="mt-4 text-xl font-black text-ink">Lender Pro</h3>
              <p className="mt-2 text-xs text-slate-500">
                For local rental shops and multi-item family collectives during peak seasons.
              </p>

              <div className="mt-6 flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-ink">₹{seasonalPrice}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ pilgrimage season</span>
                  {/* Edit button beside relevant price info */}
                  {profile?.role === "admin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempPrice(String(seasonalPrice));
                        setEditingSeasonPrice(!editingSeasonPrice);
                        setPriceError("");
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-brand hover:border-brand hover:bg-brand-50"
                      title="Admin: Edit seasonal membership fee"
                    >
                      <Edit2 size={10} /> Edit Price
                    </button>
                  )}
                </div>

                {editingSeasonPrice && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm animate-fade-in text-xs space-y-2">
                    <p className="text-[11px] font-bold text-slate-600">Modify Season Plan Rate</p>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold outline-none focus:border-brand-500"
                      />
                      <button
                        type="button"
                        onClick={handleSaveSeasonPrice}
                        className="rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSeasonPrice(false)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                    {priceError && <p className="text-[10px] text-red-600 font-semibold">{priceError}</p>}
                  </div>
                )}

                {priceSuccess && <p className="text-[10px] text-emerald-600 font-bold">{priceSuccess}</p>}
              </div>

              <ul className="mt-6 space-y-3.5 border-t border-slate-100 pt-6">
                {[
                  "Unlimited item catalogue listings",
                  "Priority ranking in nearby search results",
                  "Reduced 5% platform facilitation fee",
                  "Dedicated operator verification check",
                  "Priority dispute adjudication support",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-600">
                    <Check size={14} className="text-purple-600 shrink-0 stroke-[3]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onOpenAuth("register", "lender")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-200 bg-white py-3 text-xs font-bold text-slate-700 transition hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700"
            >
              <span>Get Lender Pro</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
