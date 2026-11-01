import { useMemo, useState } from "react";
import {
  Search, MapPin, Backpack, Shirt, CookingPot, Flower2, House, Package,
  ShieldCheck, Star, ArrowRight, Sparkles, Menu, X, Send,
  Heart, Handshake, ClipboardCheck, LogIn, LogOut, UserCircle, LayoutDashboard
} from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthModal } from "./components/auth/AuthModal";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { TouristDashboard } from "./features/dashboard/TouristDashboard";
import { LenderDashboard } from "./features/dashboard/LenderDashboard";
import { AdminDashboard } from "./features/dashboard/AdminDashboard";
import { ProfileView } from "./features/profile/ProfileView";
import type { AuthModalMode } from "./types/auth";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

type Item = {
  id: string; title: string; category: string; locality: string; rate: string;
  unit: string; rating: string; condition: string; lender: string;
  image: string; tag: string;
};

const sampleItems: Item[] = [
  {
    id:"sample-1", title:"White cotton dhoti & kurta set", category:"Clothing",
    locality:"Vishnupad area, Gaya", rate:"₹120", unit:"per day", rating:"4.9",
    condition:"Very good", lender:"Sharma Family Rentals",
    image:"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&q=85",
    tag:"Pind-daan essential"
  },
  {
    id:"sample-2", title:"Puja thali & utensil kit", category:"Puja materials",
    locality:"Deoghat, Gaya", rate:"₹80", unit:"per day", rating:"4.8",
    condition:"Clean · Sanitised", lender:"Gaya Seva Store",
    image:"https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=900&q=85",
    tag:"Popular near Vishnupad"
  },
  {
    id:"sample-3", title:"Travel backpack · 40L", category:"Backpacks",
    locality:"Gaya Junction area", rate:"₹60", unit:"per day", rating:"4.7",
    condition:"Good", lender:"Asha Local Rentals",
    image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=85",
    tag:"Daily-use item"
  },
  {
    id:"sample-4", title:"Stainless-steel utensil set", category:"Utensils",
    locality:"Mangla Gauri area, Gaya", rate:"₹100", unit:"per day", rating:"4.9",
    condition:"Very good", lender:"Maa Household Rentals",
    image:"https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&q=85",
    tag:"Family kit"
  }
];

const categories = [
  {name:"Clothing", desc:"Traditional and daily-wear clothing", icon:Shirt},
  {name:"Backpacks", desc:"Bags and travel essentials", icon:Backpack},
  {name:"Utensils", desc:"Kitchen and dining items", icon:CookingPot},
  {name:"Puja materials", desc:"Ritual and Pind-daan essentials", icon:Flower2},
  {name:"Household", desc:"Temporary-use household goods", icon:House},
  {name:"Daily-use", desc:"Other useful travel items", icon:Package}
];

function MainContent() {
  const { profile, signOut } = useAuth();

  const [currentView, setCurrentView] = useState<"explore" | "dashboard" | "profile">("explore");
  const [search, setSearch] = useState("");
  const [place, setPlace] = useState("Gaya, Bihar");
  const [category, setCategory] = useState("All items");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [messages, setMessages] = useState<{role:"user"|"assistant";text:string}[]>([
    {role:"assistant",text:"Namaste! Tell me what you need to rent in Gaya Ji and for which dates. I can search our local item catalogue."}
  ]);
  const [selected, setSelected] = useState<Item|null>(null);
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("login");
  const [authRole, setAuthRole] = useState<"tourist" | "lender">("tourist");

  const visibleItems = useMemo(() => sampleItems.filter(item => {
    const q = search.toLowerCase().trim();
    const matchesText = !q || `${item.title} ${item.category} ${item.locality}`.toLowerCase().includes(q);
    const matchesCategory = category === "All items" || item.category === category;
    return matchesText && matchesCategory;
  }),[search,category]);

  async function askAssistant(text = chatText) {
    const clean = text.trim();
    if (!clean) return;
    setMessages(prev => [...prev,{role:"user",text:clean}]);
    setChatText("");
    setChatBusy(true);
    try {
      const response = await fetch(`${API}/api/v1/ai/chat`,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({message:clean,locality:place})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Assistant is not configured.");
      setMessages(prev => [...prev,{role:"assistant",text:data.reply || "I could not find a response. Try category search."}]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI assistant unavailable.";
      setMessages(prev => [...prev,{role:"assistant",text:`I could not reach the AI service (${message}). You can still browse the item categories and sample catalogue.`}]);
    } finally {
      setChatBusy(false);
    }
  }

  function handleOpenAuth(mode: AuthModalMode = "login", role: "tourist" | "lender" = "tourist") {
    setAuthModalMode(mode);
    setAuthRole(role);
    setAuthModalOpen(true);
  }

  function requestRental(item: Item) {
    if (!profile) {
      handleOpenAuth("login");
      return;
    }
    setSelected(item);
    setNotice("");
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button onClick={() => setCurrentView("explore")} className="flex items-center gap-2.5 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white"><Handshake size={22}/></span>
            <span className="text-xl font-black tracking-tight">Local<span className="text-brand">Connect</span></span>
          </button>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <button
              onClick={() => setCurrentView("explore")}
              className={`hover:text-brand ${currentView === "explore" ? "font-bold text-brand" : ""}`}
            >
              Explore rentals
            </button>
            {profile && (
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`flex items-center gap-1.5 hover:text-brand ${currentView === "dashboard" ? "font-bold text-brand" : ""}`}
              >
                <LayoutDashboard size={15} /> Dashboard
              </button>
            )}
            {profile && (
              <button
                onClick={() => setCurrentView("profile")}
                className={`flex items-center gap-1.5 hover:text-brand ${currentView === "profile" ? "font-bold text-brand" : ""}`}
              >
                <UserCircle size={15} /> Profile
              </button>
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button onClick={()=>setChatOpen(true)} className="rounded-full px-4 py-2 text-sm font-bold text-brand hover:bg-blue-50">
              <Sparkles size={15} className="mr-1.5 inline" /> Ask AI
            </button>

            {profile ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-xs font-black text-ink">{profile.fullName}</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.2 text-[10px] font-extrabold uppercase text-brand">
                    {profile.role}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="rounded-full border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  title="Sign out"
                >
                  <LogOut size={14} className="inline mr-1" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAuth("login")}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <LogIn size={14} className="inline mr-1" /> Log in
                </button>
                <button
                  onClick={() => handleOpenAuth("register", "tourist")}
                  className="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brandDark"
                >
                  Get started
                </button>
              </div>
            )}
          </div>

          <button className="md:hidden" onClick={()=>setMobileMenu(v=>!v)} aria-label="Toggle menu">
            {mobileMenu ? <X/> : <Menu/>}
          </button>
        </div>

        {mobileMenu && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
            <button onClick={() => { setCurrentView("explore"); setMobileMenu(false); }} className="block w-full py-2 text-left font-semibold">
              Explore rentals
            </button>
            {profile && (
              <>
                <button onClick={() => { setCurrentView("dashboard"); setMobileMenu(false); }} className="block w-full py-2 text-left font-semibold text-brand">
                  My Dashboard ({profile.role})
                </button>
                <button onClick={() => { setCurrentView("profile"); setMobileMenu(false); }} className="block w-full py-2 text-left font-semibold">
                  Profile Details
                </button>
                <button onClick={() => { signOut(); setMobileMenu(false); }} className="block w-full py-2 text-left font-semibold text-red-600">
                  Logout
                </button>
              </>
            )}
            {!profile && (
              <div className="mt-2 flex gap-2">
                <button onClick={() => { handleOpenAuth("login"); setMobileMenu(false); }} className="w-1/2 rounded-xl border border-slate-200 py-2 text-xs font-bold">
                  Log in
                </button>
                <button onClick={() => { handleOpenAuth("register"); setMobileMenu(false); }} className="w-1/2 rounded-xl bg-brand py-2 text-xs font-bold text-white">
                  Get started
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Views Container */}
      <main>
        {currentView === "dashboard" && (
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
            <ProtectedRoute onOpenAuth={() => handleOpenAuth("login")} onNavigateHome={() => setCurrentView("explore")}>
              {profile?.role === "tourist" && (
                <TouristDashboard
                  onSearchCategory={(cat) => { setCategory(cat); setCurrentView("explore"); }}
                  onOpenChat={() => setChatOpen(true)}
                />
              )}
              {profile?.role === "lender" && <LenderDashboard />}
              {profile?.role === "admin" && <AdminDashboard />}
            </ProtectedRoute>
          </div>
        )}

        {currentView === "profile" && (
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
            <ProtectedRoute onOpenAuth={() => handleOpenAuth("login")} onNavigateHome={() => setCurrentView("explore")}>
              <ProfileView />
            </ProtectedRoute>
          </div>
        )}

        {currentView === "explore" && (
          <>
            {/* Hero Section */}
            <section className="relative isolate overflow-hidden bg-[#173F70]">
              <div className="absolute inset-0 -z-10">
                <img src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=2000&q=90" alt="" className="h-full w-full object-cover opacity-35"/>
                <div className="absolute inset-0 bg-gradient-to-r from-[#102f55]/95 via-[#173f70]/85 to-[#173f70]/35"/>
              </div>
              <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-28">
                <div className="max-w-2xl text-white">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em]">
                    <Sparkles size={14}/> Tourism made easy
                  </span>
                  <h1 className="mt-7 text-5xl font-black leading-[1.06] tracking-tight sm:text-6xl">
                    Need something for your trip? <span className="text-[#B9E3DC]">Rent it locally.</span>
                  </h1>
                  <p className="mt-6 max-w-xl text-lg leading-8 text-white/85">
                    Find useful commodities from local families in Gaya Ji instead of purchasing things you only need for a short stay.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-white/85">
                    <span className="flex items-center gap-2"><ShieldCheck size={17}/> Supervised local listings</span>
                    <span className="flex items-center gap-2"><MapPin size={17}/> Destination-based search</span>
                  </div>
                </div>
                <div className="self-center rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
                  <p className="text-xs font-extrabold uppercase tracking-[.16em] text-teal">Find what you need</p>
                  <h2 className="mt-2 text-2xl font-black">Search local rentals</h2>
                  <p className="mt-2 text-sm text-slate-500">Rent clothing, utensils, puja items or backpacks.</p>
                  <form onSubmit={e=>{e.preventDefault();document.getElementById("explore")?.scrollIntoView({behavior:"smooth"});}} className="mt-5 space-y-3">
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                      <Search size={18} className="text-slate-400"/>
                      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="What do you need to rent?" className="w-full bg-transparent text-sm outline-none"/>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                      <MapPin size={18} className="text-slate-400"/>
                      <input value={place} onChange={e=>setPlace(e.target.value)} placeholder="Destination or locality" className="w-full bg-transparent text-sm outline-none"/>
                    </label>
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-sm font-bold text-white hover:bg-brandDark">
                      <Search size={17}/> Explore available items
                    </button>
                  </form>
                  <button onClick={()=>setChatOpen(true)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-brand">
                    <Sparkles size={16}/> Describe your need to AI
                  </button>
                </div>
              </div>
            </section>

            {/* Catalogue Categories */}
            <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
              <div className="mb-7">
                <p className="eyebrow">BROWSE COMMODITIES</p>
                <h2 className="section-title">Rent essentials, not extra baggage.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Focus on commodities tourists temporarily need during travel and pilgrimage.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {categories.map(({name,desc,icon:Icon})=>(
                  <button key={name} onClick={()=>{setCategory(name);document.getElementById("explore")?.scrollIntoView({behavior:"smooth"});}} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-card">
                    <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-brand group-hover:bg-brand group-hover:text-white">
                      <Icon size={21}/>
                    </span>
                    <span className="block font-extrabold">{name}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{desc}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Inventory Grid */}
            <section id="explore" className="bg-white py-16">
              <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow">LOCAL INVENTORY</p>
                    <h2 className="section-title">Items around {place || "your destination"}</h2>
                    <p className="mt-2 text-sm text-slate-500">Verified inventory from approved local lenders in Gaya Ji.</p>
                  </div>
                  <button onClick={()=>{setCategory("All items");setSearch("");}} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold">
                    Clear filters
                  </button>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  {["All items",...categories.map(c=>c.name)].map(x=>(
                    <button key={x} onClick={()=>setCategory(x)} className={`rounded-full px-4 py-2 text-xs font-bold ${category===x?"bg-brand text-white":"border border-slate-200 bg-white text-slate-600 hover:border-brand"}`}>
                      {x}
                    </button>
                  ))}
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {visibleItems.map(item=>(
                    <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-card">
                      <div className="relative h-48 bg-slate-100">
                        <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover"/>
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-extrabold text-brand">
                          {item.tag}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold uppercase tracking-wide text-teal">{item.category}</span>
                          <span className="flex items-center gap-1 font-bold">
                            <Star size={13} className="fill-amber-400 text-amber-400"/>{item.rating}
                          </span>
                        </div>
                        <h3 className="mt-2 min-h-12 text-base font-extrabold leading-6">{item.title}</h3>
                        <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={13}/>{item.locality}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">Condition: {item.condition}</p>
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <div className="flex items-end justify-between">
                            <div>
                              <span className="text-xl font-black">{item.rate}</span>
                              <span className="ml-1 text-xs text-slate-400">{item.unit}</span>
                            </div>
                            <button onClick={()=>requestRental(item)} className="rounded-full bg-brand px-4 py-2.5 text-xs font-extrabold text-white hover:bg-brandDark">
                              Rent item
                            </button>
                          </div>
                          <p className="mt-3 text-[11px] text-slate-400">Listed by {item.lender}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* Lender Callout */}
            <section className="bg-brandDark py-16 text-white">
              <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 md:flex-row md:items-center lg:px-8">
                <div className="max-w-2xl">
                  <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#A8DCD5]">FOR LOCAL LENDERS</p>
                  <h2 className="mt-3 text-3xl font-black sm:text-4xl">Your useful belongings can help someone’s journey.</h2>
                  <p className="mt-4 leading-7 text-white/75">
                    List eligible items, manage rental requests and create an additional earning opportunity from goods you already own.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAuth("register", "lender")}
                  className="shrink-0 rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-brand hover:bg-blue-50"
                >
                  Become a local lender <ArrowRight size={16} className="ml-2 inline"/>
                </button>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#102A4A] py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 text-sm sm:flex-row lg:px-8">
          <span className="font-black">LocalConnect</span>
          <span className="text-white/60">Tourism made easy — rent what you need, locally.</span>
          <span className="text-white/50">© 2026 LocalConnect</span>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        initialRole={authRole}
      />

      {/* Notice Toast */}
      {notice && (
        <div role="status" className="fixed bottom-5 left-1/2 z-40 w-[min(92vw,560px)] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <span>{notice}</span>
            <button onClick={()=>setNotice("")} aria-label="Close"><X size={17}/></button>
          </div>
        </div>
      )}

      {/* Sample Rental Request Dialog */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4" onClick={()=>setSelected(null)}>
          <div role="dialog" aria-modal="true" aria-label="Rental request" onClick={e=>e.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">RENTAL REQUEST</p>
                <h3 className="mt-1 text-xl font-black">Request this rental</h3>
              </div>
              <button onClick={()=>setSelected(null)} aria-label="Close dialog"><X/></button>
            </div>
            <div className="mt-4 flex gap-4">
              <img src={selected.image} alt="" className="h-24 w-28 rounded-xl object-cover"/>
              <div>
                <p className="font-extrabold">{selected.title}</p>
                <p className="mt-1 text-sm text-slate-500">{selected.locality}</p>
                <p className="mt-2 font-black">{selected.rate} <span className="text-xs font-medium text-slate-400">{selected.unit}</span></p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-slate-600">Rental start<input type="date" className="mt-1 block w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
              <label className="text-xs font-bold text-slate-600">Rental end<input type="date" className="mt-1 block w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
            </div>
            <label className="mt-3 block text-xs font-bold text-slate-600">Quantity<input type="number" min="1" defaultValue="1" className="mt-1 block w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
            <p className="mt-4 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-brandDark">
              Requesting as <span className="font-bold">{profile?.fullName}</span>. After the lender accepts, you can complete payment.
            </p>
            <button
              onClick={()=>{setSelected(null);setNotice("Rental request submitted! Awaiting lender approval.");}}
              className="mt-5 w-full rounded-xl bg-brand px-5 py-3 font-bold text-white hover:bg-brandDark"
            >
              Confirm Rental Request
            </button>
          </div>
        </div>
      )}

      {/* AI Chatbot Drawer */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40" onClick={()=>setChatOpen(false)}>
          <aside onClick={e=>e.stopPropagation()} className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-brandDark p-5 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15"><Sparkles/></span>
                <div>
                  <h3 className="font-extrabold">LocalConnect Assistant</h3>
                  <p className="text-xs text-white/70">Find items to rent locally</p>
                </div>
              </div>
              <button onClick={()=>setChatOpen(false)} aria-label="Close assistant"><X/></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
              {messages.map((m,i)=>(
                <div key={i} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl p-3 text-sm leading-6 ${m.role==="user"?"ml-auto bg-brand text-white":"border border-slate-100 bg-white text-slate-700 shadow-sm"}`}>
                  {m.text}
                </div>
              ))}
              {chatBusy && <div className="text-sm text-slate-400">Checking your request…</div>}
            </div>
            <div className="border-t p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {["Need puja items in Gaya","Rent utensils for 2 days","Find a backpack"].map(s=>(
                  <button key={s} onClick={()=>askAssistant(s)} className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={chatText}
                  onChange={e=>setChatText(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&askAssistant()}
                  placeholder="Describe the items you need…"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand"
                />
                <button disabled={chatBusy} onClick={()=>askAssistant()} className="rounded-xl bg-brand px-4 text-white disabled:opacity-50" aria-label="Send message">
                  <Send size={18}/>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
