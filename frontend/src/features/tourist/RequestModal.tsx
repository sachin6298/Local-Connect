/**
 * RequestModal — Tourist rental request form.
 * Validates dates, checks live availability, calculates cost, submits to API.
 */
import { useState, useMemo, useEffect } from "react";
import { X, CalendarDays, Package, MapPin, Truck, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { requestsApi, type AvailabilityInfo } from "../../api/requests";
import { useAuth } from "../../context/AuthContext";

export interface RequestModalItem {
  id: string;
  title: string;
  category: string;
  locality: string;
  rate: string;        // e.g. "₹120"
  unit: string;        // e.g. "per day"
  lender: string;
  image: string;
}

interface Props {
  item: RequestModalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e.getTime() - s.getTime()) / 86400000);
  return Math.max(diff, 1);
}

function extractNumericRate(rate: string): number {
  const m = rate.replace(/[₹,\s]/g, "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

export function RequestModal({ item, isOpen, onClose, onSuccess }: Props) {
  const { profile } = useAuth();

  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(tomorrowStr());
  const [quantity, setQuantity] = useState(1);
  const [handover, setHandover] = useState<"pickup" | "delivery">("pickup");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityInfo | null>(null);
  const [checkingAvail, setCheckingAvail] = useState(false);

  const pricePerDay = item ? extractNumericRate(item.rate) : 0;
  const days = useMemo(() => daysBetween(startDate, endDate), [startDate, endDate]);
  const subtotal = useMemo(() => pricePerDay * days * quantity, [pricePerDay, days, quantity]);
  const platformFee = useMemo(() => Math.round(subtotal * 0.10 * 100) / 100, [subtotal]);
  const totalAmount = useMemo(() => subtotal + platformFee, [subtotal, platformFee]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setStartDate(todayStr());
      setEndDate(tomorrowStr());
      setQuantity(1);
      setHandover("pickup");
      setNote("");
      setFormError(null);
      setAvailability(null);
    }
  }, [isOpen, item?.id]);

  // Check availability when dates change
  useEffect(() => {
    if (!item || !isOpen || !startDate || !endDate) return;
    if (endDate <= startDate) return;

    let cancelled = false;
    setCheckingAvail(true);
    requestsApi.checkAvailability(item.id, startDate, endDate)
      .then((info) => { if (!cancelled) setAvailability(info); })
      .catch(() => { if (!cancelled) setAvailability(null); })
      .finally(() => { if (!cancelled) setCheckingAvail(false); });

    return () => { cancelled = true; };
  }, [item?.id, startDate, endDate, isOpen]);

  if (!isOpen || !item) return null;

  function validate(): string | null {
    const today = todayStr();
    if (startDate < today) return "Rental start date must be today or in the future.";
    if (endDate <= startDate) return "Return date must be after start date.";
    if (quantity < 1) return "Quantity must be at least 1.";
    if (availability && quantity > availability.available_quantity)
      return `Only ${availability.available_quantity} unit(s) available for the selected dates.`;
    return null;
  }

  async function handleSubmit() {
    if (!item) return;
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormError(null);
    setSubmitting(true);
    try {
      await requestsApi.create({
        item_id: item.id,
        rental_start: startDate,
        rental_end: endDate,
        quantity,
        handover_method: handover,
        tourist_note: note || undefined,
      });
      onClose();
      onSuccess(`Request for "${item.title}" submitted! Awaiting lender confirmation.`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  const availBadgeColor =
    availability?.status === "available" ? "bg-emerald-100 text-emerald-800" :
    availability?.status === "partially_available" ? "bg-amber-100 text-amber-800" :
    "bg-red-100 text-red-800";

  const availLabel =
    availability?.status === "available" ? "Available" :
    availability?.status === "partially_available" ? "Partially Available" :
    availability?.status === "unavailable" ? "Unavailable" : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Rental request form"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-6 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal">Request to Rent</span>
            <h3 className="mt-1 text-lg font-black text-ink">Confirm Rental Details</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Item Summary */}
          <div className="flex gap-4">
            <img
              src={item.image}
              alt={item.title}
              className="h-20 w-24 flex-shrink-0 rounded-2xl object-cover border border-slate-200"
            />
            <div>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-brand">
                {item.category}
              </span>
              <p className="mt-1 font-extrabold text-sm text-ink">{item.title}</p>
              <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1">
                <MapPin size={11} /> {item.locality}
              </p>
              <p className="mt-1 text-sm font-black text-brand">
                {item.rate} <span className="text-xs font-medium text-slate-400">/{item.unit}</span>
              </p>
            </div>
          </div>

          {/* Availability Badge */}
          {checkingAvail && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 size={13} className="animate-spin" /> Checking availability…
            </div>
          )}
          {!checkingAvail && availability && (
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${availBadgeColor}`}>
              <CheckCircle2 size={12} />
              {availLabel} — {availability.available_quantity}/{availability.total_quantity} units free
            </div>
          )}

          {/* Date Pickers */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5 mb-1.5"><CalendarDays size={13} /> Start Date</span>
              <input
                type="date"
                value={startDate}
                min={todayStr()}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-brand"
              />
            </label>
            <label className="text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5 mb-1.5"><CalendarDays size={13} /> Return Date</span>
              <input
                type="date"
                value={endDate}
                min={startDate || todayStr()}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-brand"
              />
            </label>
          </div>

          {/* Quantity */}
          <label className="block text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 mb-1.5"><Package size={13} /> Quantity</span>
            <input
              type="number"
              min={1}
              max={availability?.available_quantity ?? 100}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="block w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-brand"
            />
          </label>

          {/* Handover Method */}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Truck size={13} /> Handover Method
            </p>
            <div className="flex gap-2">
              {(["pickup", "delivery"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setHandover(m)}
                  className={`flex-1 rounded-xl border py-2.5 text-xs font-bold capitalize transition ${
                    handover === m
                      ? "border-brand bg-brand text-white"
                      : "border-slate-200 text-slate-600 hover:border-brand/50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <label className="block text-xs font-bold text-slate-700">
            Message to Lender (optional)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="e.g. arrival time, special requirements…"
              className="mt-1.5 block w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-brand resize-none"
            />
          </label>

          {/* Cost Breakdown */}
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{pricePerDay > 0 ? `₹${pricePerDay}` : item.rate} × {days} day{days !== 1 ? "s" : ""} × {quantity} unit{quantity !== 1 ? "s" : ""}</span>
              <span className="font-bold text-ink">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Platform fee (10%)</span>
              <span className="font-bold text-ink">₹{platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-ink">
              <span>Total Estimate</span>
              <span className="text-brand">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Requesting As */}
          <p className="rounded-xl bg-blue-50 border border-blue-100 px-3.5 py-2.5 text-xs text-blue-900">
            Requesting as <span className="font-bold">{profile?.fullName}</span>. The lender will confirm before payment.
          </p>

          {/* Error */}
          {formError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 text-xs text-red-800">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-600" />
              {formError}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || (availability?.status === "unavailable")}
            className="w-full rounded-xl bg-brand py-3.5 text-xs font-black text-white shadow-lg shadow-brand/20 transition hover:bg-brandDark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 size={15} className="animate-spin" /> Submitting…</>
            ) : (
              "Confirm Rental Request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

