import { useState, useEffect } from "react";
import { User, Mail, Phone, Globe, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function ProfileView() {
  const { profile, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [language, setLanguage] = useState(profile?.preferredLanguage || "en");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync form fields if the profile object changes (e.g. after a demo login switch)
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");
      setLanguage(profile.preferredLanguage || "en");
      setNotice(null);
    }
  }, [profile?.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);

    const res = await updateProfile({
      fullName,
      phone,
      preferredLanguage: language,
    });

    setBusy(false);
    if (res.success) {
      setNotice({ type: "success", text: res.message });
    } else {
      setNotice({ type: "error", text: res.message });
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-2xl font-black text-ink">Account Profile</h2>
            <p className="mt-1 text-xs text-slate-500">Manage your personal details and contact preferences</p>
          </div>
          <span className="rounded-full bg-blue-100 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-brand">
            Role: {profile?.role || "tourist"}
          </span>
        </div>

        {notice && (
          <div
            className={`mt-5 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
              notice.type === "success" ? "bg-teal/10 text-teal" : "bg-red-50 text-red-800"
            }`}
          >
            {notice.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notice.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700">Full Name</label>
            <div className="relative mt-1">
              <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Registered Email (Read-only)</label>
            <div className="relative mt-1">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                disabled
                value={profile?.email || ""}
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-500 outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Email identity is managed via Supabase Auth</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Contact Mobile</label>
            <div className="relative mt-1">
              <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Preferred Language</label>
            <div className="relative mt-1">
              <Globe size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-start gap-2.5">
              <Shield size={18} className="shrink-0 text-slate-400" />
              <p className="text-[11px] leading-5 text-slate-500">
                <span className="font-bold text-ink">Role Security Policy:</span> Your account role is locked to{" "}
                <span className="font-bold text-brand">{profile?.role}</span>. In accordance with platform security rules,
                role escalations to administrator cannot be self-requested and require operator provisioning.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-brand px-6 py-3 text-xs font-bold text-white transition hover:bg-brandDark disabled:opacity-50"
          >
            {busy ? "Saving Changes..." : "Save Profile Details"}
          </button>
        </form>
      </div>
    </div>
  );
}

