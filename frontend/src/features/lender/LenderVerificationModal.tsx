import { useState } from "react";
import { X, ShieldCheck, UploadCloud, FileText, CheckCircle2, Lock } from "lucide-react";

interface LenderVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: (status: string) => void;
  currentStatus: string;
}

export function LenderVerificationModal({
  isOpen,
  onClose,
  onSubmitted,
  currentStatus
}: LenderVerificationModalProps) {
  const [displayName, setDisplayName] = useState("Sharma Family Local Rentals");
  const [description, setDescription] = useState(
    "Local Gaya Ji residents offering clean cotton ritual clothing, brass thalis and travel rucksacks for pilgrims."
  );
  const [publicArea, setPublicArea] = useState("Vishnupad Falgu Ghat Area");
  const [files, setFiles] = useState<string[]>([
    "Govt_ID_Verification_Document.pdf",
    "Local_Residence_Proof.pdf"
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        onSubmitted("submitted");
        onClose();
      }, 1200);
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal/10 text-teal">
            <ShieldCheck size={22} />
          </span>
          <div>
            <h2 className="text-xl font-black text-ink">Lender Verification & Documents</h2>
            <p className="text-xs text-slate-500">Submit private identification to verify your lender account</p>
          </div>
        </div>

        {success ? (
          <div className="my-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
            <h4 className="mt-3 font-black text-emerald-800">Verification Submitted!</h4>
            <p className="mt-1 text-xs text-emerald-600">Our platform administrators will review your credentials within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Lender Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Profile Bio / Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Public Area Handover Point</label>
              <input
                type="text"
                value={publicArea}
                onChange={(e) => setPublicArea(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
                required
              />
              <p className="mt-1 text-[11px] text-slate-400">Never input private house numbers. Enter a recognised public rendezvous landmark.</p>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
              <UploadCloud size={28} className="mx-auto text-slate-400" />
              <p className="mt-1 text-xs font-bold text-slate-700">Govt ID or Resident Document</p>
              <p className="text-[11px] text-slate-400">PDF, JPG or PNG up to 5MB</p>

              <div className="mt-3 space-y-1.5 text-left">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 border border-slate-200 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <FileText size={13} className="text-brand" /> {f}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">Attached</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[11px] leading-4 text-amber-800">
              <Lock size={14} className="mt-0.5 shrink-0" />
              <span>
                <strong>Privacy Guaranteed:</strong> Verification documents are saved in private Supabase storage. Only you and approved platform admins can access them. Home addresses are never displayed publicly.
              </span>
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
                disabled={isSubmitting}
                className="rounded-xl bg-teal px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal/90 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting…" : "Submit for Approval"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

