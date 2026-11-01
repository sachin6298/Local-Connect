import { useState } from "react";
import { X, Package, Tag, Layers, IndianRupee, MapPin, CheckCircle2 } from "lucide-react";

export interface ItemFormData {
  id?: string;
  title: string;
  category: string;
  description: string;
  condition: string;
  sizeOrVariant: string;
  quantity: number;
  rate: number;
  unit: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  publicLocation: string;
  image: string;
  status: "active" | "draft" | "paused";
}

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ItemFormData) => void;
  initialData?: ItemFormData | null;
}

const CATEGORIES = [
  "Clothing",
  "Backpacks",
  "Utensils",
  "Puja materials",
  "Household essentials",
  "Daily-use items"
];

const PRICING_UNITS = [
  { value: "day", label: "Per Day" },
  { value: "hour", label: "Per Hour" },
  { value: "event_period", label: "Per Pilgrimage / Ritual (3-day)" },
  { value: "fixed_period", label: "Fixed Duration" }
];

export function ItemModal({ isOpen, onClose, onSave, initialData }: ItemModalProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
  const [description, setDescription] = useState(initialData?.description || "");
  const [condition, setCondition] = useState(initialData?.condition || "Clean & Sanitised");
  const [sizeOrVariant, setSizeOrVariant] = useState(initialData?.sizeOrVariant || "Standard");
  const [quantity, setQuantity] = useState(initialData?.quantity || 1);
  const [rate, setRate] = useState(initialData?.rate || 100);
  const [unit, setUnit] = useState(initialData?.unit || "day");
  const [pickupAvailable, setPickupAvailable] = useState(initialData ? initialData.pickupAvailable : true);
  const [deliveryAvailable, setDeliveryAvailable] = useState(initialData ? initialData.deliveryAvailable : false);
  const [publicLocation, setPublicLocation] = useState(initialData?.publicLocation || "Vishnupad Temple Area, Gaya");
  const [image, setImage] = useState(initialData?.image || "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || title.length < 3) {
      setError("Item title must be at least 3 characters.");
      return;
    }
    if (!description.trim() || description.length < 10) {
      setError("Item description must be at least 10 characters.");
      return;
    }
    if (rate <= 0) {
      setError("Rental rate must be greater than zero.");
      return;
    }
    if (quantity < 1) {
      setError("Available quantity must be at least 1 unit.");
      return;
    }
    if (!publicLocation.trim()) {
      setError("Public pickup/area label is required.");
      return;
    }

    onSave({
      id: initialData?.id,
      title: title.trim(),
      category,
      description: description.trim(),
      condition: condition.trim(),
      sizeOrVariant: sizeOrVariant.trim(),
      quantity,
      rate,
      unit,
      pickupAvailable,
      deliveryAvailable,
      publicLocation: publicLocation.trim(),
      image: image.trim(),
      status: initialData?.status || "active"
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
            <Package size={22} />
          </span>
          <div>
            <h2 className="text-xl font-black text-ink">{initialData ? "Edit Rental Listing" : "Create Rentable Item Listing"}</h2>
            <p className="text-xs text-slate-500">List commodities you own for tourists and pilgrims in Gaya Ji</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Item Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cotton Dhoti & Kurta Set, Brass Puja Thali"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Condition</label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="e.g. Clean · Sanitised · Like New"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide clean, accurate details on cleanliness, material, usage instructions..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Rate (₹)</label>
              <input
                type="number"
                min={1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-ink outline-none focus:border-brand"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Pricing Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-2 py-2.5 text-xs text-ink outline-none focus:border-brand"
              >
                {PRICING_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-ink outline-none focus:border-brand"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Public Handover Location (No home addresses)
            </label>
            <input
              type="text"
              value={publicLocation}
              onChange={(e) => setPublicLocation(e.target.value)}
              placeholder="e.g. Vishnupad Temple Gate 2, Gaya"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
              required
            />
            <p className="mt-1 text-[11px] text-slate-400">Strictly specify a public landmark. Never enter your private house number or flat details.</p>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={pickupAvailable}
                onChange={(e) => setPickupAvailable(e.target.checked)}
                className="h-4 w-4 rounded text-brand focus:ring-brand"
              />
              Pickup Handover Available
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={deliveryAvailable}
                onChange={(e) => setDeliveryAvailable(e.target.checked)}
                className="h-4 w-4 rounded text-brand focus:ring-brand"
              />
              Local Delivery Offered (Extra Charge)
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brandDark"
            >
              {initialData ? "Save Changes" : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

