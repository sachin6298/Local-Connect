import { useState, useEffect, memo } from "react";
import {
  X, Check, AlertCircle, Loader2, ShieldAlert,
  IndianRupee, Tag, CheckCircle2, Lock
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

export interface EditablePriceItem {
  id: string;
  title: string;
  rate: string; // e.g. "₹120"
  unit: string; // e.g. "per day" or "day"
  lender?: string;
  lender_id?: string;
  image?: string;
  category?: string;
}

interface PriceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: EditablePriceItem | null;
  onPriceUpdated: (itemId: string, newRate: string, newUnit: string) => void;
  onOpenAuthRequired?: () => void;
}

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const ALLOWED_UNITS = [
  { value: "day", label: "per day" },
  { value: "hour", label: "per hour" },
  { value: "event_period", label: "per event period" },
  { value: "fixed_period", label: "per fixed period" },
];

export const PriceEditModal = memo(function PriceEditModal({
  isOpen,
  onClose,
  item,
  onPriceUpdated,
  onOpenAuthRequired,
}: PriceEditModalProps) {
  const { user, profile } = useAuth();

  const [priceInput, setPriceInput] = useState("");
  const [unitInput, setUnitInput] = useState("day");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Extract raw numeric price from formatted rate string e.g. "₹120" -> "120"
  useEffect(() => {
    if (item && isOpen) {
      const numeric = item.rate.replace(/[^0-9.]/g, "");
      setPriceInput(numeric || "0");

      // Match unit
      const cleanUnit = item.unit.replace("per ", "").trim();
      const matchedUnit = ALLOWED_UNITS.find(
        (u) => u.value === cleanUnit || u.label === item.unit
      );
      setUnitInput(matchedUnit ? matchedUnit.value : "day");

      setError(null);
      setSuccess(null);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  // Authorization check
  const isAuthenticated = Boolean(user || profile);
  const isAdmin = profile?.role === "admin";
  const isLender = profile?.role === "lender";
  // An authorized user is an admin OR a lender
  const isAuthorized = isAdmin || isLender;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;

    setError(null);
    setSuccess(null);

    // 1. Validation: numeric check
    const numericValue = parseFloat(priceInput);

    if (isNaN(numericValue) || priceInput.trim() === "") {
      setError("Please enter a valid numeric rental rate.");
      return;
    }

    // 2. Reject negative prices
    if (numericValue < 0) {
      setError("Price cannot be negative. Rental rates must be 0 or higher.");
      return;
    }

    // 3. Reasonable maximum validation
    if (numericValue > 100000) {
      setError("Rental rate cannot exceed ₹1,00,000 per period.");
      return;
    }

    // 4. Authorization check
    if (!isAuthorized) {
      setError("Unauthorized: Only verified lenders or platform administrators can modify item prices.");
      return;
    }

    setBusy(true);

    try {
      let apiSuccess = false;

      // Attempt backend API update: PATCH /api/v1/items/{item_id}
      try {
        const token = user ? (await supabase.auth.getSession()).data.session?.access_token : null;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API}/api/v1/items/${item.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            price_amount: numericValue,
            price_unit: unitInput,
          }),
        });

        if (res.ok) {
          apiSuccess = true;
        } else if (res.status === 403) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Forbidden: You are not authorized to edit this item's price.");
        }
      } catch (backendErr) {
        // If backend returns a strict error (like 403), rethrow to notify user
        if (backendErr instanceof Error && backendErr.message.includes("Forbidden")) {
          throw backendErr;
        }
      }

      // If Supabase is configured with direct connection, persist to rental_items table
      if (isSupabaseConfigured && user) {
        const { error: dbError } = await supabase
          .from("rental_items")
          .update({
            price_amount: numericValue,
            price_unit: unitInput,
          })
          .eq("id", item.id);

        if (dbError) {
          // If RLS blocked the update, report permission error
          if (dbError.code === "42501" || dbError.message.includes("permission")) {
            throw new Error("Database permissions blocked update: Only the item's lender or admin can modify prices.");
          }
        } else {
          apiSuccess = true;
        }
      }

      // Format updated rate string for display (preserving UI currency format)
      const newFormattedRate = `₹${numericValue}`;
      const matchingUnitObj = ALLOWED_UNITS.find((u) => u.value === unitInput);
      const newFormattedUnit = matchingUnitObj ? matchingUnitObj.label : `per ${unitInput}`;

      // Refresh the displayed price in parent state
      onPriceUpdated(item.id, newFormattedRate, newFormattedUnit);

      setSuccess(`Price updated successfully to ${newFormattedRate} /${newFormattedUnit}!`);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item price. Please check your permissions.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit Item Price"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <Tag size={16} />
            </span>
            <div>
              <h3 className="text-sm font-black text-ink">Edit Rental Price</h3>
              <p className="text-[10px] text-slate-400">Update live marketplace rate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200/60 hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {/* Item Preview Strip */}
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="h-12 w-12 rounded-xl object-cover border border-slate-200"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-ink truncate">{item.title}</p>
              <p className="text-[11px] text-slate-500">
                Current rate: <span className="font-bold text-brand-600">{item.rate}</span>{" "}
                <span className="text-[10px] text-slate-400">/{item.unit}</span>
              </p>
            </div>
          </div>

          {/* Authorization Warning (if not signed in or not lender/admin) */}
          {!isAuthenticated ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
              <Lock size={24} className="mx-auto text-amber-600 mb-2" />
              <h4 className="text-xs font-bold text-amber-900">Sign In Required</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
                You must be logged in as a verified local lender or administrator to modify item prices.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuthRequired?.();
                }}
                className="mt-3 inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition"
              >
                Sign In As Lender
              </button>
            </div>
          ) : !isAuthorized ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
              <ShieldAlert size={24} className="mx-auto text-red-600 mb-2" />
              <h4 className="text-xs font-bold text-red-950">Access Restricted</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-red-800">
                Your current account role is <span className="font-bold uppercase">{profile?.role}</span>.
                Only authorized lenders or platform administrators can adjust pricing.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-800 border border-red-100">
                  <AlertCircle size={16} className="shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-100">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              {/* Price Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rental Rate Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100000"
                    required
                    disabled={busy}
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="e.g. 120"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-8 pr-3 text-xs font-bold text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Must be non-negative. Fair local pricing is recommended.
                </p>
              </div>

              {/* Price Unit Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pricing Duration Unit
                </label>
                <select
                  disabled={busy}
                  value={unitInput}
                  onChange={(e) => setUnitInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs font-medium text-ink outline-none transition focus:border-brand-500 disabled:bg-slate-50"
                >
                  {ALLOWED_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label} ({u.value})
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Preview Box */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Live Rate Preview
                </span>
                <span className="text-xl font-black text-ink">
                  ₹{priceInput || "0"}{" "}
                  <span className="text-xs font-medium text-slate-400">
                    /{ALLOWED_UNITS.find((u) => u.value === unitInput)?.label || unitInput}
                  </span>
                </span>
              </div>

              {/* Action Buttons: Save & Cancel */}
              <div className="mt-5 flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 transition disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Save Price</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
});

