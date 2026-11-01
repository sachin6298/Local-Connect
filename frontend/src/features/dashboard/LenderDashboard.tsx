import { useState } from "react";
import { Handshake, ShieldCheck, Plus, PackageCheck, AlertCircle, Clock3, PauseCircle, PlayCircle, Edit3, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ItemModal, ItemFormData } from "../lender/ItemModal";
import { LenderVerificationModal } from "../lender/LenderVerificationModal";
import { PriceEditModal, EditablePriceItem } from "../../components/pricing/PriceEditModal";

const INITIAL_LENDER_ITEMS: ItemFormData[] = [
  {
    id: "lender-item-1",
    title: "White cotton dhoti & kurta set",
    category: "Clothing",
    description: "Pure cotton consecrated traditional dhoti and kurta set for Gaya Ji Pind-daan rituals.",
    condition: "Sanitised · Freshly washed",
    sizeOrVariant: "Standard free size",
    quantity: 8,
    rate: 120,
    unit: "day",
    pickupAvailable: true,
    deliveryAvailable: false,
    publicLocation: "Vishnupad Main Ghat, Gaya",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800",
    status: "active"
  },
  {
    id: "lender-item-2",
    title: "Travel backpack · 40L durable rucksack",
    category: "Backpacks",
    description: "Waterproof rucksack with padded straps, ideal for carrying essentials while visiting ghats.",
    condition: "Good condition",
    sizeOrVariant: "40 Litres",
    quantity: 4,
    rate: 60,
    unit: "day",
    pickupAvailable: true,
    deliveryAvailable: true,
    publicLocation: "Gaya Junction Railway Area",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
    status: "active"
  },
  {
    id: "lender-item-3",
    title: "Brass puja thali & aarti bell kit",
    category: "Puja materials",
    description: "Complete brass ceremonial kit including thali, ghanti, diya, and panchapatra.",
    condition: "Polished brass · Clean",
    sizeOrVariant: "Standard ritual size",
    quantity: 6,
    rate: 80,
    unit: "day",
    pickupAvailable: true,
    deliveryAvailable: false,
    publicLocation: "Deoghat, Gaya",
    image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800",
    status: "active"
  }
];

export function LenderDashboard() {
  const { profile } = useAuth();
  const [items, setItems] = useState<ItemFormData[]>(INITIAL_LENDER_ITEMS);
  const [verificationStatus, setVerificationStatus] = useState<"approved" | "submitted" | "draft">("approved");
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemFormData | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [priceEditItem, setPriceEditItem] = useState<EditablePriceItem | null>(null);
  const [priceEditModalOpen, setPriceEditModalOpen] = useState(false);

  function handlePriceUpdated(itemId: string, newRate: string, newUnit: string) {
    const numeric = parseFloat(newRate.replace(/[^0-9.]/g, ""));
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, rate: numeric, unit: newUnit.replace("per ", "").trim() } : it))
    );
    showFeedback(`Price updated to ${newRate} /${newUnit}`);
  }

  function handleCreateOrUpdateItem(formData: ItemFormData) {
    if (formData.id) {
      // Update existing item
      setItems((prev) => prev.map((item) => (item.id === formData.id ? formData : item)));
      showFeedback(`"${formData.title}" updated successfully.`);
    } else {
      // Create new item
      const newItem: ItemFormData = {
        ...formData,
        id: `item-${Date.now()}`,
        status: verificationStatus === "approved" ? "active" : "draft"
      };
      setItems((prev) => [newItem, ...prev]);
      showFeedback(`"${formData.title}" created as ${newItem.status}.`);
    }
  }

  function handleToggleStatus(itemId: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const newStatus = it.status === "active" ? "paused" : "active";
          showFeedback(`Listing status changed to ${newStatus}.`);
          return { ...it, status: newStatus };
        }
        return it;
      })
    );
  }

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 4000);
  }

  const activeCount = items.filter((it) => it.status === "active").length;
  const pausedCount = items.filter((it) => it.status === "paused").length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-[#17212F] p-8 text-white shadow-xl md:flex-row md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#A8DCD5]">
              <Handshake size={13} /> Local Lender Portal
            </span>

            {verificationStatus === "approved" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300">
                <ShieldCheck size={13} /> Verified Lender
              </span>
            )}
            {verificationStatus === "submitted" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-300">
                <Clock3 size={13} /> Verification Pending Admin Review
              </span>
            )}
            {verificationStatus === "draft" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/20 px-3 py-0.5 text-xs font-bold text-slate-300">
                Verification Required
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-black">{profile?.fullName || "Sharma Family Rentals"}</h1>
          <p className="mt-1 text-sm text-slate-400">Locality: Gaya Ji, Bihar · Earn from commodities you already own</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setVerificationModalOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-bold text-slate-200 transition hover:bg-slate-700"
          >
            <ShieldCheck size={16} /> Verification Status
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setItemModalOpen(true);
            }}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-brandDark"
          >
            <Plus size={16} /> Add Item Listing
          </button>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {feedback}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Listings</span>
          <p className="mt-3 text-3xl font-black text-ink">{activeCount}</p>
          <p className="mt-1 text-xs text-slate-500">Live in Gaya Ji catalogue</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Paused Listings</span>
          <p className="mt-3 text-3xl font-black text-amber-600">{pausedCount}</p>
          <p className="mt-1 text-xs text-slate-500">Temporarily unavailable</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Incoming Requests</span>
          <p className="mt-3 text-3xl font-black text-slate-700">0</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting your approval</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Lender Earnings</span>
          <p className="mt-3 text-3xl font-black text-teal">₹0.00</p>
          <p className="mt-1 text-xs text-slate-500">Direct settlement without delay</p>
        </div>
      </div>

      {/* Current Listings Snapshot */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-ink">Your Listed Inventory in Gaya Ji</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Only items from approved lenders appear in public pilgrim searches.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">{items.length} Total Items</span>
        </div>

        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div
              key={item.id || item.title}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-16 w-16 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-brand">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">· {item.condition}</span>
                  </div>
                  <p className="mt-1 font-extrabold text-ink">{item.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      Rate: <span className="font-bold text-ink">₹{item.rate}/{item.unit}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPriceEditItem({
                            id: item.id || `item-${item.title}`,
                            title: item.title,
                            rate: `₹${item.rate}`,
                            unit: item.unit,
                            image: item.image,
                            lender: profile?.fullName || "Sharma Family Rentals",
                          });
                          setPriceEditModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-brand hover:border-brand"
                        title="Edit price"
                      >
                        <Edit3 size={10} /> Edit Price
                      </button>
                    </span>
                    <span>· Quantity: <span className="font-bold text-ink">{item.quantity} units</span></span>
                    <span>· Location: <span className="text-slate-600">{item.publicLocation}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    item.status === "active"
                      ? "bg-emerald-100 text-emerald-800"
                      : item.status === "paused"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>

                <button
                  onClick={() => handleToggleStatus(item.id!)}
                  title={item.status === "active" ? "Pause listing" : "Activate listing"}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-brand"
                >
                  {item.status === "active" ? (
                    <>
                      <PauseCircle size={14} className="text-amber-600" /> Pause
                    </>
                  ) : (
                    <>
                      <PlayCircle size={14} className="text-emerald-600" /> Activate
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setEditingItem(item);
                    setItemModalOpen(true);
                  }}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-brand"
                >
                  <Edit3 size={14} /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Policy Reminder */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 text-brand" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand">Handover & Privacy Protections</h4>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Never expose home addresses to renters. Rendezvous at verified public locations such as Gaya Junction or Vishnupad Ghat gates. Always record handover photos in the platform prior to item release to guarantee dispute protection and damage claim eligibility.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ItemModal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSave={handleCreateOrUpdateItem}
        initialData={editingItem}
      />

      <LenderVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        onSubmitted={(status) => {
          setVerificationStatus(status as any);
          showFeedback("Verification documents submitted. Admin will review within 24 hours.");
        }}
        currentStatus={verificationStatus}
      />

      <PriceEditModal
        isOpen={priceEditModalOpen}
        onClose={() => setPriceEditModalOpen(false)}
        item={priceEditItem}
        onPriceUpdated={handlePriceUpdated}
      />
    </div>
  );
}
