import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import {
  Search, MapPin, X, Send, Sparkles, Loader2
} from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthModal } from "./components/auth/AuthModal";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import type { AuthModalMode } from "./types/auth";

// Lazy-loaded feature views and intro overlay to optimize initial bundle and login performance
const IntroOverlay = lazy(() => import("@/components/ui/IntroOverlay"));
const TouristDashboard = lazy(() =>
  import("./features/dashboard/TouristDashboard").then((m) => ({ default: m.TouristDashboard }))
);
const LenderDashboard = lazy(() =>
  import("./features/dashboard/LenderDashboard").then((m) => ({ default: m.LenderDashboard }))
);
const AdminDashboard = lazy(() =>
  import("./features/dashboard/AdminDashboard").then((m) => ({ default: m.AdminDashboard }))
);
const ProfileView = lazy(() =>
  import("./features/profile/ProfileView").then((m) => ({ default: m.ProfileView }))
);

// Landing page sections
import { Navbar } from "./components/landing/Navbar";
import { Hero } from "./components/landing/Hero";
import { PartnerLogos } from "./components/landing/PartnerLogos";
import { HowItWorks } from "./components/landing/HowItWorks";
import { CoreFeatures } from "./components/landing/CoreFeatures";
import { ProductShowcase, type Item } from "./components/landing/ProductShowcase";
import { UseCases } from "./components/landing/UseCases";
import { Benefits } from "./components/landing/Benefits";
import { ImpactStats } from "./components/landing/ImpactStats";
import { Testimonials } from "./components/landing/Testimonials";
import { PricingPlans } from "./components/landing/PricingPlans";
import { FaqSection } from "./components/landing/FaqSection";
import { FinalCta } from "./components/landing/FinalCta";
import { Footer } from "./components/landing/Footer";
import { PriceEditModal, type EditablePriceItem } from "./components/pricing/PriceEditModal";
import { RequestModal } from "./features/tourist/RequestModal";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const INITIAL_ITEMS: Item[] = [
  {
    id: "sample-1",
    title: "White cotton dhoti & kurta set",
    category: "Clothing",
    locality: "Vishnupad area, Gaya",
    rate: "₹120",
    unit: "per day",
    rating: "4.9",
    condition: "Very good",
    lender: "Sharma Family Rentals",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&q=85",
    tag: "Pind-daan essential",
  },
  {
    id: "sample-2",
    title: "Puja thali & utensil kit",
    category: "Puja materials",
    locality: "Deoghat, Gaya",
    rate: "₹80",
    unit: "per day",
    rating: "4.8",
    condition: "Clean · Sanitised",
    lender: "Gaya Seva Store",
    image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=900&q=85",
    tag: "Popular near Vishnupad",
  },
  {
    id: "sample-3",
    title: "Travel backpack · 40L",
    category: "Backpacks",
    locality: "Gaya Junction area",
    rate: "₹60",
    unit: "per day",
    rating: "4.7",
    condition: "Good",
    lender: "Asha Local Rentals",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=85",
    tag: "Daily-use item",
  },
  {
    id: "sample-4",
    title: "Stainless-steel utensil set",
    category: "Utensils",
    locality: "Mangla Gauri area, Gaya",
    rate: "₹100",
    unit: "per day",
    rating: "4.9",
    condition: "Very good",
    lender: "Maa Household Rentals",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&q=85",
    tag: "Family kit",
  },
  {
    id: "sample-5",
    title: "Brass Ghanti & Aarti Lamp Pair",
    category: "Puja materials",
    locality: "Falgu River Ghat, Gaya",
    rate: "₹50",
    unit: "per day",
    rating: "4.9",
    condition: "Polished brass",
    lender: "Pandit Ramdas Rentals",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=900&q=85",
    tag: "Ceremony ready",
  },
  {
    id: "sample-6",
    title: "Foldable travel walking stick & umbrella",
    category: "Daily-use",
    locality: "Bodh Gaya Temple Road",
    rate: "₹40",
    unit: "per day",
    rating: "4.8",
    condition: "Like new",
    lender: "Verma Homestay Care",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=85",
    tag: "Elderly comfort",
  },
];

function MainContent() {
  const { profile, signOut } = useAuth();

  const [currentView, setCurrentView] = useState<"explore" | "dashboard" | "profile">("explore");
  const [search, setSearch] = useState("");
  const [place, setPlace] = useState("Gaya, Bihar");
  const [category, setCategory] = useState("All items");
  const [itemsList, setItemsList] = useState<Item[]>(INITIAL_ITEMS);

  // Chat Assistant State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "Namaste! Tell me what you need to rent in Gaya Ji and for which dates. I can search our local item catalogue and match available packages.",
    },
  ]);

  // Modals & Dialogs State
  const [selected, setSelected] = useState<Item | null>(null);
  const [notice, setNotice] = useState("");

  // Price Edit State
  const [priceEditTarget, setPriceEditTarget] = useState<EditablePriceItem | null>(null);
  const [priceEditModalOpen, setPriceEditModalOpen] = useState(false);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("login");
  const [authRole, setAuthRole] = useState<"tourist" | "lender">("tourist");

  // Intro Experience Overlay State
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("localconnect_intro_seen") !== "true";
    } catch {
      return false;
    }
  });

  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("localconnect_intro_seen") === "true";
    } catch {
      return true;
    }
  });

  const closeIntro = () => {
    setShowIntro(false);
    try {
      sessionStorage.setItem("localconnect_intro_seen", "true");
    } catch {}
    setHasSeenIntro(true);
    setCurrentView("explore");
  };

  const openIntro = () => {
    setShowIntro(true);
  };

  // Attempt live items fetch on mount if backend is reachable
  useEffect(() => {
    let active = true;
    async function fetchLiveItems() {
      try {
        const res = await fetch(`${API}/api/v1/items?page_size=10`);
        if (res.ok) {
          const data = await res.json();
          if (active && data.items && data.items.length > 0) {
            const mapped: Item[] = data.items.map((it: any) => ({
              id: it.id,
              title: it.title,
              category: it.category_name || "Daily-use",
              locality: it.locality_name || "Gaya Ji",
              rate: `₹${it.price_amount}`,
              unit: it.price_unit === "day" ? "per day" : `per ${it.price_unit}`,
              rating: "4.9",
              condition: it.condition_label || "Good",
              lender: it.lender_name || "Local Lender",
              image: it.primary_image || "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&q=85",
              tag: "Verified Listing",
            }));
            setItemsList(mapped);
          }
        }
      } catch {
        // Backend offline or unreachable: INITIAL_ITEMS provides reliable fallback
      }
    }
    fetchLiveItems();
    return () => {
      active = false;
    };
  }, []);

  const visibleItems = useMemo(() => {
    return itemsList.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesText =
        !q || `${item.title} ${item.category} ${item.locality}`.toLowerCase().includes(q);
      const matchesCategory = category === "All items" || item.category === category;
      return matchesText && matchesCategory;
    });
  }, [itemsList, search, category]);

  async function askAssistant(text = chatText) {
    const clean = text.trim();
    if (!clean) return;
    setMessages((prev) => [...prev, { role: "user", text: clean }]);
    setChatText("");
    setChatBusy(true);
    try {
      const response = await fetch(`${API}/api/v1/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, locality: place }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Assistant is not configured.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || "I could not find a response. Try category search.",
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI assistant unavailable.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `I could not reach the AI service (${message}). You can still browse the item categories and sample catalogue.`,
        },
      ]);
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

  const handleOpenPriceEdit = (item: Item) => {
    setPriceEditTarget({
      id: item.id,
      title: item.title,
      rate: item.rate,
      unit: item.unit,
      lender: item.lender,
      image: item.image,
      category: item.category,
    });
    setPriceEditModalOpen(true);
  };

  const handlePriceUpdated = (itemId: string, newRate: string, newUnit: string) => {
    setItemsList((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, rate: newRate, unit: newUnit } : it))
    );
    setNotice(`Item rate updated to ${newRate} /${newUnit}`);
  };

  const scrollToExplore = () => {
    setCurrentView("explore");
    setTimeout(() => {
      document.getElementById("explore-items")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white text-ink selection:bg-brand-500 selection:text-white">
      {/* Premium Sticky Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        profile={profile}
        onOpenAuth={handleOpenAuth}
        onSignOut={signOut}
        onOpenChat={() => setChatOpen(true)}
        onOpenIntro={openIntro}
      />

      {/* Main Content Area */}
      <main>
        {currentView === "dashboard" && (
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
            <ProtectedRoute
              onOpenAuth={() => handleOpenAuth("login")}
              onNavigateHome={() => setCurrentView("explore")}
            >
              <Suspense
                fallback={
                  <div className="flex min-h-[360px] items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-brand-600" />
                  </div>
                }
              >
                {profile?.role === "tourist" && (
                  <TouristDashboard
                    onSearchCategory={(cat) => {
                      setCategory(cat);
                      setCurrentView("explore");
                      scrollToExplore();
                    }}
                    onOpenChat={() => setChatOpen(true)}
                  />
                )}
                {profile?.role === "lender" && <LenderDashboard />}
                {profile?.role === "admin" && <AdminDashboard />}
              </Suspense>
            </ProtectedRoute>
          </div>
        )}

        {currentView === "profile" && (
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
            <ProtectedRoute
              onOpenAuth={() => handleOpenAuth("login")}
              onNavigateHome={() => setCurrentView("explore")}
            >
              <Suspense
                fallback={
                  <div className="flex min-h-[360px] items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-brand-600" />
                  </div>
                }
              >
                <ProfileView />
              </Suspense>
            </ProtectedRoute>
          </div>
        )}

        {currentView === "explore" && (
          <>
            {/* 1. Hero Section */}
            <Hero
              search={search}
              setSearch={setSearch}
              place={place}
              setPlace={setPlace}
              onExplore={scrollToExplore}
              onOpenChat={() => setChatOpen(true)}
              onOpenRegisterLender={() => handleOpenAuth("register", "lender")}
            />

            {/* 2. Trusted-By / Partner Logos */}
            <PartnerLogos />

            {/* 3. How It Works (Interactive Role Switcher) */}
            <HowItWorks />

            {/* 4. Core Features (Linear-style Bento Grid) */}
            <CoreFeatures />

            {/* 5. Interactive Product Showcase with Price Section & Edit Button */}
            <ProductShowcase
              items={visibleItems}
              category={category}
              setCategory={setCategory}
              search={search}
              setSearch={setSearch}
              onRequestRental={requestRental}
              onOpenChat={() => setChatOpen(true)}
              onEditPrice={handleOpenPriceEdit}
            />

            {/* 6. Use Cases */}
            <UseCases />

            {/* 7. Benefits & Value Comparison */}
            <Benefits />

            {/* 8. Impact & Statistics Section with Count-Up */}
            <ImpactStats />

            {/* 9. Verified Testimonials */}
            <Testimonials />

            {/* 10. Transparent Pricing Plans */}
            <PricingPlans onOpenAuth={handleOpenAuth} />

            {/* 11. FAQ with Working Accordions */}
            <FaqSection onOpenChat={() => setChatOpen(true)} />

            {/* 12. Immersive Final CTA */}
            <FinalCta
              onExplore={scrollToExplore}
              onOpenRegisterLender={() => handleOpenAuth("register", "lender")}
            />
          </>
        )}
      </main>

      {/* 13. Professional SaaS Footer */}
      <Footer
        onOpenAuth={handleOpenAuth}
        onOpenIntro={openIntro}
        onOpenChat={() => setChatOpen(true)}
        onSelectCategory={(cat) => {
          setCategory(cat);
          scrollToExplore();
        }}
      />

      {/* Auth Modal (Optimized & Memoized) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        initialRole={authRole}
      />

      {/* Price Edit Modal (Validation, Auth & DB Persistence) */}
      <PriceEditModal
        isOpen={priceEditModalOpen}
        onClose={() => setPriceEditModalOpen(false)}
        item={priceEditTarget}
        onPriceUpdated={handlePriceUpdated}
        onOpenAuthRequired={() => handleOpenAuth("login", "lender")}
      />

      {/* Notice Toast */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,500px)] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold text-ink shadow-2xl animate-fade-in-up"
        >
          <div className="flex items-center justify-between gap-3">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Close notice">
              <X size={16} className="text-slate-400 hover:text-ink" />
            </button>
          </div>
        </div>
      )}

      {/* Real Rental Request Modal */}
      <RequestModal
        item={selected}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        onSuccess={(msg) => setNotice(msg)}
      />

      {/* AI Chatbot Drawer */}
      {chatOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setChatOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in-right"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between bg-slate-900 p-5 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-brand-400">
                  <Sparkles size={20} />
                </span>
                <div>
                  <h3 className="text-sm font-black">LocalConnect Concierge</h3>
                  <p className="text-[11px] text-slate-400">Gemini-powered travel & ritual guide</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                aria-label="Close assistant"
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[88%] whitespace-pre-wrap rounded-2xl p-3.5 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-brand-600 text-white shadow-sm"
                      : "border border-slate-200/80 bg-white text-slate-700 shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {chatBusy && (
                <div className="flex items-center gap-2 text-xs text-slate-400 animate-pulse">
                  <Sparkles size={13} />
                  <span>Checking local inventory and rituals…</span>
                </div>
              )}
            </div>

            {/* Quick Prompts & Input */}
            <div className="border-t border-slate-200 p-4 bg-white">
              <div className="mb-3 flex flex-wrap gap-1.5">
                {[
                  "Need puja items in Gaya",
                  "Rent utensils for 2 days",
                  "Find a 40L backpack",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => askAssistant(s)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askAssistant()}
                  placeholder="Describe what you need for your trip..."
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium outline-none focus:border-brand-500"
                />
                <button
                  disabled={chatBusy}
                  onClick={() => askAssistant()}
                  className="rounded-xl bg-brand-600 px-3.5 text-white transition hover:bg-brand-700 disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Lazy-Loaded Classical Diorama Intro Overlay */}
      {showIntro && (
        <Suspense fallback={null}>
          <IntroOverlay
            isOpen={showIntro}
            onClose={closeIntro}
            hasSeenIntro={hasSeenIntro}
          />
        </Suspense>
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
